import * as Crypto from 'expo-crypto';

export const WHOP_CLIENT_ID = process.env.EXPO_PUBLIC_WHOP_CLIENT_ID!;
export const API_BASE = process.env.EXPO_PUBLIC_API_URL!;
export const REDIRECT_URI = `${API_BASE}/api/auth/callback`;
export const APP_SCHEME = 'smarterpicks://oauth';

function generateSecureBase64url(byteLength: number): string {
  const array = new Uint8Array(byteLength);
  Crypto.getRandomValues(array);
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

export async function buildWhopAuthUrl(): Promise<{ url: string; codeVerifier: string; state: string }> {
  const codeVerifier = generateSecureBase64url(32);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateSecureBase64url(16);
  const nonce = generateSecureBase64url(16);

  const params = new URLSearchParams({
    client_id: WHOP_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'login',
  });

  const finalUrl = `https://api.whop.com/oauth/authorize?${params.toString()}`;
  return { url: finalUrl, codeVerifier, state };
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


  const res = await fetch('https://api.whop.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status}`);
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
