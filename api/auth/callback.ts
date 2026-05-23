import type { VercelRequest, VercelResponse } from '@vercel/node';

const WHOP_CLIENT_ID = process.env.WHOP_CLIENT_ID!;
const WHOP_CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_API_URL}/api/auth/callback`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error, state } = req.query;

  if (error || !code) {
    return res.send(buildPage('error', String(error || 'No code received')));
  }

  // Pass the code back to the app — the mobile client holds the code_verifier
  // and will do the token exchange itself via /api/auth/whop/token
  const deepLink = `smarterpicks://oauth?code=${encodeURIComponent(String(code))}`;
  return res.send(buildPage('success', deepLink));
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
