import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';
import { db } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const today = new Date().toISOString().split('T')[0];

  const { rows } = await db`
    SELECT
      id,
      date,
      sport,
      home_team   AS "homeTeam",
      away_team   AS "awayTeam",
      bet_type    AS "betType",
      bet_description AS "betDescription",
      odds,
      units::float,
      confidence,
      reasoning,
      result,
      result_description AS "resultDescription",
      posted_at   AS "postedAt"
    FROM picks
    WHERE date = ${today}
    ORDER BY posted_at ASC
  `;

  const publishedAt = rows[0]?.postedAt ?? null;
  return res.status(200).json({ picks: rows, publishedAt });
}
