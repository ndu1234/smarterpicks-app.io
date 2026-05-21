import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';
import { db } from '../_db';

const PAGE_SIZE = 30;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const sport = req.query.sport as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows } = sport
    ? await db`
        SELECT
          id, date, sport,
          home_team AS "homeTeam", away_team AS "awayTeam",
          bet_type AS "betType", bet_description AS "betDescription",
          odds, units::float, confidence, reasoning,
          result, result_description AS "resultDescription",
          posted_at AS "postedAt"
        FROM picks
        WHERE result != 'pending' AND sport = ${sport.toUpperCase()}
        ORDER BY date DESC, posted_at ASC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `
    : await db`
        SELECT
          id, date, sport,
          home_team AS "homeTeam", away_team AS "awayTeam",
          bet_type AS "betType", bet_description AS "betDescription",
          odds, units::float, confidence, reasoning,
          result, result_description AS "resultDescription",
          posted_at AS "postedAt"
        FROM picks
        WHERE result != 'pending'
        ORDER BY date DESC, posted_at ASC
        LIMIT ${PAGE_SIZE} OFFSET ${offset}
      `;

  const { rows: countRows } = sport
    ? await db`SELECT COUNT(*)::int AS total FROM picks WHERE result != 'pending' AND sport = ${sport.toUpperCase()}`
    : await db`SELECT COUNT(*)::int AS total FROM picks WHERE result != 'pending'`;

  return res.status(200).json({ picks: rows, total: countRows[0].total, page });
}
