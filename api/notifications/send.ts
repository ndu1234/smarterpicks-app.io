import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireCron } from '../_middleware';
import { db } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireCron(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { title, body, data } = req.body;

  const { rows } = await db`SELECT push_token FROM push_tokens`;
  const tokens = rows.map((r: any) => r.push_token);

  if (tokens.length === 0) return res.status(200).json({ sent: 0 });

  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  let sent = 0;
  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data ?? {},
      channelId: 'picks',
    }));

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (expoRes.ok) sent += chunk.length;
  }

  return res.status(200).json({ sent });
}
