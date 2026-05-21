import type { VercelRequest, VercelResponse } from '@vercel/node';

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const WHOP_CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token,
    client_id: WHOP_CLIENT_ID,
    client_secret: WHOP_CLIENT_SECRET,
  });

  const tokenRes = await fetch('https://api.whop.com/v5/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!tokenRes.ok) return res.status(401).json({ error: 'Refresh failed' });

  const data = await tokenRes.json();
  return res.status(200).json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}
