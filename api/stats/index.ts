import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';

const GITHUB_BASE = 'https://raw.githubusercontent.com/Toyota2Lambo/SMARTERPICKS/main';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const githubRes = await fetch(`${GITHUB_BASE}/history.json`);
  if (!githubRes.ok) return res.status(502).json({ error: 'Failed to fetch stats' });

  const data = await githubRes.json() as Record<string, any>;
  const s = data.stats || {};
  const daily: any[] = data.daily || [];

  // Build monthly data by grouping daily entries
  const monthlyMap: Record<string, number> = {};
  for (const d of daily) {
    const month = d.date.substring(0, 7); // "2026-04"
    monthlyMap[month] = (monthlyMap[month] || 0) + d.units;
  }
  const monthlyData = Object.entries(monthlyMap).map(([month, unitsProfit]) => ({
    month,
    unitsProfit: parseFloat(unitsProfit.toFixed(2)),
  }));

  return res.status(200).json({
    wins: s.wins || 0,
    losses: s.losses || 0,
    pushes: s.pushes || 0,
    totalPicks: s.total_picks || 0,
    roi: s.roi_pct || 0,
    unitsProfit: s.net_units || 0,
    dollarProfit: (s.net_units || 0) * 100,
    sportBreakdown: [],
    monthlyData,
    daily,
  });
}
