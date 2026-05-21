import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';
import { db } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = requireAuth(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { push_token } = req.body;
  if (!push_token) return res.status(400).json({ error: 'Missing push_token' });

  const userRes = await fetch('https://api.whop.com/v5/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return res.status(401).json({ error: 'Invalid token' });
  const user = await userRes.json();

  await db`
    INSERT INTO push_tokens (whop_user_id, push_token)
    VALUES (${user.id}, ${push_token})
    ON CONFLICT (push_token) DO UPDATE SET whop_user_id = EXCLUDED.whop_user_id
  `;

  return res.status(200).json({ ok: true });
}
