import * as Crypto from 'expo-crypto';

export const WHOP_CLIENT_ID = process.env.EXPO_PUBLIC_WHOP_CLIENT_ID!;
export const API_BASE = process.env.EXPO_PUBLIC_API_URL!;
export const REDIRECT_URI = `${API_BASE}/api/auth/callback`;
export const APP_SCHEME = 'smarterpicks://oauth';

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function buildWhopAuthUrl(): Promise<{ url: string; codeVerifier: string }> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = Math.random().toString(36).substring(2, 18);
  const nonce = Math.random().toString(36).substring(2, 18);

  const params = new URLSearchParams({
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const finalUrl = `https://api.whop.com/oauth/authorize?${params.toString()}`;
  console.log('Auth URL:', finalUrl);

  return { url: finalUrl, codeVerifier };
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<{ access_token: string; refresh_token: string }> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  console.log('Sending to Whop token endpoint:', {
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code: code.substring(0, 10) + '...',
    code_verifier: codeVerifier.substring(0, 10) + '...',
  });

  const res = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const status = res.status;
    const err = await res.text();
    console.log(`Whop token error ${status}:`, err);
    throw new Error(`${status}: ${err}`);
  }

  return res.json();
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
