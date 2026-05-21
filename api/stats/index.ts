import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';
import { db } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const [overall, bySport] = await Promise.all([
    db`
      SELECT
        COUNT(*) FILTER (WHERE result = 'win')::int  AS wins,
        COUNT(*) FILTER (WHERE result = 'loss')::int AS losses,
        COUNT(*) FILTER (WHERE result = 'push')::int AS pushes,
        COUNT(*) FILTER (WHERE result != 'pending')::int AS total_picks,
        COALESCE(SUM(CASE WHEN result = 'win' THEN units WHEN result = 'loss' THEN -units ELSE 0 END), 0)::float AS units_profit
      FROM picks
      WHERE result != 'pending'
    `,
    db`
      SELECT
        sport,
        COUNT(*) FILTER (WHERE result = 'win')::int  AS wins,
        COUNT(*) FILTER (WHERE result = 'loss')::int AS losses,
        COUNT(*) FILTER (WHERE result = 'push')::int AS pushes,
        COALESCE(SUM(CASE WHEN result = 'win' THEN units WHEN result = 'loss' THEN -units ELSE 0 END), 0)::float AS units_profit
      FROM picks
      WHERE result != 'pending'
      GROUP BY sport
      ORDER BY sport
    `,
  ]);

  const o = overall.rows[0];
  const totalBets = o.wins + o.losses;
  const roi = totalBets > 0 ? (o.units_profit / totalBets) * 100 : 0;

  const sportBreakdown = bySport.rows.map((s: any) => {
    const tb = s.wins + s.losses;
    return {
      sport: s.sport,
      wins: s.wins,
      losses: s.losses,
      pushes: s.pushes,
      unitsProfit: s.units_profit,
      roi: tb > 0 ? (s.units_profit / tb) * 100 : 0,
    };
  });

  return res.status(200).json({
    wins: o.wins,
    losses: o.losses,
    pushes: o.pushes,
    totalPicks: o.total_picks,
    roi: parseFloat(roi.toFixed(2)),
    unitsProfit: o.units_profit,
    dollarProfit: o.units_profit * 100,
    sportBreakdown,
    monthlyData: [],
  });
}
