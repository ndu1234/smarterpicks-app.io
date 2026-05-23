import type { VercelRequest, VercelResponse } from '@vercel/node';

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const WHOP_CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_API_URL}/api/auth/callback`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error, state } = req.query;

  if (error || !code) {
    return res.send(buildPage('error', String(error || 'No code received')));
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      client_id: WHOP_CLIENT_ID,
      client_secret: WHOP_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    const tokenRes = await fetch('https://api.whop.com/v5/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.send(buildPage('error', err));
    }

    const data = await tokenRes.json() as Record<string, unknown>;
    const deepLink = `smarterpicks://oauth?access_token=${data.access_token}&refresh_token=${data.refresh_token || ''}`;
    return res.send(buildPage('success', deepLink));
  } catch (err) {
    return res.send(buildPage('error', String(err)));
  }
}

function buildPage(status: 'success' | 'error', payload: string) {
  if (status === 'error') {
    return `<!DOCTYPE html>
<html><body style="background:#0a0a0a;color:#f4efe4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
<div><p style="color:#d96565;">Login failed. Please close this and try again.</p><small style="color:#5a5550;">${payload}</small></div>
</body></html>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#f4efe4;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
<div>
  <p style="font-size:32px;">◆</p>
  <p>Signing you in...</p>
  <script>window.location.href = "${payload}";</script>
</div>
</body></html>`;
}
