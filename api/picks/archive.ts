import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';

const GITHUB_BASE = 'https://raw.githubusercontent.com/Toyota2Lambo/SMARTERPICKS/main';

function normalizeResult(result: string): 'win' | 'loss' | 'push' | 'pending' {
  const lower = (result || '').toLowerCase();
  if (lower === 'win' || lower === 'w' || lower === 'won') return 'win';
  if (lower === 'loss' || lower === 'l' || lower === 'lost') return 'loss';
  if (lower === 'push' || lower === 'p') return 'push';
  return 'pending';
}

function normalizeSport(league: string): string {
  return (league || '').split('·')[0].trim().toUpperCase();
}

function parseBetType(pick: string): 'spread' | 'moneyline' | 'total' | 'prop' {
  const lower = (pick || '').toLowerCase();
  if (lower.includes('over') || lower.includes('under')) return 'total';
  if (lower.endsWith(' ml') || lower.endsWith('ml')) return 'moneyline';
  const spreadMatch = (pick || '').match(/[+-]?\d+\.?\d*$/);
  if (spreadMatch && Math.abs(parseFloat(spreadMatch[0])) < 30) return 'spread';
  return 'moneyline';
}

function formatOdds(odds: string | number): string {
  const s = String(odds || '');
  if (s.startsWith('+') || s.startsWith('-')) return s;
  return `+${s}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const sport = (req.query.sport as string | undefined)?.toUpperCase();
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const PAGE_SIZE = 30;

  const githubRes = await fetch(`${GITHUB_BASE}/archive.json`);
  if (!githubRes.ok) return res.status(502).json({ error: 'Failed to fetch archive' });

  const data = await githubRes.json() as Record<string, any>;
  const days: any[] = data.days || [];

  // Flatten all picks from all days
  const allPicks: any[] = [];
  for (const day of days) {
    for (const p of (day.picks || [])) {
      const sportNorm = normalizeSport(p.league);
      if (sport && sportNorm !== sport) continue;
      allPicks.push({
        id: `archive-${day.iso_date}-${allPicks.length}`,
        date: day.iso_date,
        sport: sportNorm,
        homeTeam: '',
        awayTeam: '',
        betType: parseBetType(p.pick),
        betDescription: p.pick,
        odds: formatOdds(p.odds),
        units: parseFloat(String(p.stake || '1').replace('u', '')),
        confidence: 75,
        reasoning: p.reasoning || '',
        result: normalizeResult(p.result),
        resultDescription: null,
        postedAt: day.iso_date,
      });
    }
  }

  // Sort newest first, paginate
  allPicks.reverse();
  const total = allPicks.length;
  const paged = allPicks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return res.status(200).json({ picks: paged, total, page });
}
