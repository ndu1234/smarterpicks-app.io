import type { VercelRequest, VercelResponse } from '@vercel/node';

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL || `https://${process.env.VERCEL_URL}`}/api/auth/callback`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, code_verifier } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });
  if (code_verifier) params.set('code_verifier', code_verifier);

  const tokenRes = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return res.status(400).json({ error: 'Token exchange failed', detail: err });
  }

  const data = await tokenRes.json() as Record<string, unknown>;
  return res.status(200).json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  });
}
