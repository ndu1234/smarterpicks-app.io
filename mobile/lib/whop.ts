export const WHOP_CLIENT_ID = process.env.EXPO_PUBLIC_WHOP_CLIENT_ID!;
export const API_BASE = process.env.EXPO_PUBLIC_API_URL!;
export const REDIRECT_URI = `${API_BASE}/api/auth/callback`;
export const APP_SCHEME = 'smarterpicks://oauth';

export function buildWhopAuthUrl(): { url: string } {
  const state = Math.random().toString(36).substring(2, 18);

  const params = new URLSearchParams({
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid',
    state,
  });

  const finalUrl = `https://whop.com/oauth/authorize?${params.toString()}`;
  console.log('Auth URL:', finalUrl);

  return { url: finalUrl };
}

export async function refreshWhopToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/whop/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token;
  } catch {
    return null;
  }
}
