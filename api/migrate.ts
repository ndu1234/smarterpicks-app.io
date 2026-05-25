import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireCron } from './_middleware';
import { runMigrations } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireCron(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await runMigrations();
    return res.status(200).json({ ok: true, message: 'Migrations ran successfully' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
