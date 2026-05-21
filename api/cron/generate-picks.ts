import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { requireCron } from '../_middleware';
import { db } from '../_db';

const MODEL_ID = 'claude-sonnet-4-6';
const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const API_BASE = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_API_URL!;
const CRON_SECRET = process.env.CRON_SECRET!;

const SPORTS = ['basketball_nba', 'americanfootball_nfl', 'baseball_mlb', 'icehockey_nhl'];

interface OddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number; point?: number }>;
    }>;
  }>;
}

async function fetchOdds(): Promise<OddsGame[]> {
  const results: OddsGame[] = [];

  for (const sport of SPORTS) {
    try {
      const url = new URL(`https://api.the-odds-api.com/v4/sports/${sport}/odds`);
      url.searchParams.set('apiKey', ODDS_API_KEY);
      url.searchParams.set('regions', 'us');
      url.searchParams.set('markets', 'spreads,totals,h2h');
      url.searchParams.set('oddsFormat', 'american');
      url.searchParams.set('dateFormat', 'iso');

      const res = await fetch(url.toString());
      if (res.ok) {
        const games: OddsGame[] = await res.json();
        results.push(...games.slice(0, 6));
      }
    } catch (e) {
      console.error(`Failed to fetch odds for ${sport}:`, e);
    }
  }

  return results;
}

function formatOddsForPrompt(games: OddsGame[]): string {
  if (games.length === 0) return 'No games found today.';

  return games.map((game) => {
    const sport = game.sport_title;
    const time = new Date(game.commence_time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short',
    });

    const lines = game.bookmakers.slice(0, 3).flatMap((book) =>
      book.markets.map((market) => {
        const outcomes = market.outcomes
          .map((o) => `${o.name}: ${o.price > 0 ? '+' : ''}${o.price}${o.point !== undefined ? ` (${o.point})` : ''}`)
          .join(' | ');
        return `  [${book.title}] ${market.key}: ${outcomes}`;
      })
    );

    return `${sport}: ${game.away_team} @ ${game.home_team} — ${time}\n${lines.join('\n')}`;
  }).join('\n\n');
}

interface GeneratedPick {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  betType: string;
  betDescription: string;
  odds: string;
  units: number;
  confidence: number;
  reasoning: string;
}

async function generatePicksWithClaude(oddsData: string): Promise<GeneratedPick[]> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const systemPrompt = `You are SmarterPicks, an elite AI sports betting analyst. Your job is to identify the highest-edge plays of the day by analyzing mispriced lines across major sportsbooks.

Your methodology:
1. Identify line discrepancies across books (sharp vs. public money divergence)
2. Look for totals and spreads with clear market inefficiencies
3. Factor in rest, travel, injuries, and recent form
4. Only recommend plays where the edge is clear and quantifiable

Output format: Return ONLY a valid JSON array of picks. No markdown, no explanation outside the JSON.

Each pick object must have exactly these fields:
{
  "sport": "NBA" | "NFL" | "MLB" | "NHL",
  "homeTeam": string,
  "awayTeam": string,
  "betType": "spread" | "moneyline" | "total" | "prop",
  "betDescription": string,  // e.g. "Lakers -4.5", "Over 218.5", "Chiefs ML"
  "odds": string,            // American odds e.g. "-110", "+145"
  "units": number,           // 0.5, 1, 1.5, or 2
  "confidence": number,      // 50-95
  "reasoning": string        // 2-3 sentences max explaining the edge
}

Rules:
- Only recommend 5-8 plays total
- Minimum confidence threshold: 55%
- Never recommend a play you cannot justify with the data
- Prioritize plays with consensus across multiple books`;

  const message = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Today's odds data:\n\n${oddsData}\n\nAnalyze these lines and return your best 5-8 picks as a JSON array.`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('No JSON array found in Claude response');

  return JSON.parse(jsonMatch[0]) as GeneratedPick[];
}

async function savePicks(picks: GeneratedPick[], date: string) {
  for (const pick of picks) {
    await db`
      INSERT INTO picks (date, sport, home_team, away_team, bet_type, bet_description, odds, units, confidence, reasoning)
      VALUES (
        ${date},
        ${pick.sport.toUpperCase()},
        ${pick.homeTeam},
        ${pick.awayTeam},
        ${pick.betType},
        ${pick.betDescription},
        ${pick.odds},
        ${pick.units},
        ${pick.confidence},
        ${pick.reasoning}
      )
    `;
  }
}

async function sendPicksNotification(count: number) {
  await fetch(`${API_BASE}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cron-secret': CRON_SECRET,
    },
    body: JSON.stringify({
      title: "◆ Today's Picks Are Live",
      body: `${count} plays just dropped. Tap to see the card.`,
      data: { screen: 'picks' },
    }),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();
  if (!requireCron(req)) return res.status(401).json({ error: 'Unauthorized' });

  const today = new Date().toISOString().split('T')[0];

  const { rows: existing } = await db`SELECT id FROM picks WHERE date = ${today} LIMIT 1`;
  if (existing.length > 0) {
    return res.status(200).json({ message: 'Picks already generated for today', date: today });
  }

  try {
    const games = await fetchOdds();
    if (games.length === 0) {
      return res.status(200).json({ message: 'No games today', picks: 0 });
    }

    const oddsFormatted = formatOddsForPrompt(games);
    const picks = await generatePicksWithClaude(oddsFormatted);

    await savePicks(picks, today);
    await sendPicksNotification(picks.length);

    return res.status(200).json({ message: 'Picks generated', date: today, count: picks.length });
  } catch (err) {
    console.error('Pick generation failed:', err);
    return res.status(500).json({ error: 'Pick generation failed', detail: String(err) });
  }
}
