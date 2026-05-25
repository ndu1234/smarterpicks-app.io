import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';

const GITHUB_BASE = 'https://raw.githubusercontent.com/Toyota2Lambo/SMARTERPICKS/main';

function normalizeSport(league: string): string {
  return league.split('·')[0].trim().toUpperCase();
}

function parseBetType(pick: string): 'spread' | 'moneyline' | 'total' | 'prop' {
  const lower = pick.toLowerCase();
  if (lower.includes('over') || lower.includes('under')) return 'total';
  if (lower.endsWith(' ml') || lower.endsWith('ml')) return 'moneyline';
  const spreadMatch = pick.match(/[+-]?\d+\.?\d*$/);
  if (spreadMatch && Math.abs(parseFloat(spreadMatch[0])) < 30) return 'spread';
  return 'moneyline';
}

function formatOdds(odds: string | number): string {
  const s = String(odds);
  if (s.startsWith('+') || s.startsWith('-')) return s;
  return `+${s}`;
}

function parseUnits(stake: string): number {
  return parseFloat(String(stake).replace('u', '') || '1');
}

function parseConfidence(tags: string[]): number {
  const confTag = (tags || []).find((t) => t.startsWith('Confidence'));
  if (!confTag) return 70;
  if (confTag.includes('A')) return 90;
  if (confTag.includes('B+')) return 80;
  if (confTag.includes('B')) return 70;
  return 60;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const githubRes = await fetch(`${GITHUB_BASE}/picks.json`);
  if (!githubRes.ok) return res.status(502).json({ error: 'Failed to fetch picks' });

  const data = await githubRes.json() as Record<string, any>;

  const picks = (data.picks || []).map((p: any, i: number) => ({
    id: `pick-${i}`,
    date: new Date().toISOString().split('T')[0],
    sport: normalizeSport(p.league),
    homeTeam: p.home_team,
    awayTeam: p.away_team,
    betType: parseBetType(p.pick),
    betDescription: p.pick,
    odds: formatOdds(p.odds),
    units: parseUnits(p.stake),
    confidence: parseConfidence(p.tags),
    reasoning: p.reasoning,
    result: 'pending',
    resultDescription: null,
    postedAt: data.generated_at || new Date().toISOString(),
  }));

  return res.status(200).json({ picks, publishedAt: data.generated_at });
}
