import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { storage } from './storage';

WebBrowser.maybeCompleteAuthSession();

const WHOP_CLIENT_ID = process.env.EXPO_PUBLIC_WHOP_CLIENT_ID!;
const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

const discovery = {
  authorizationEndpoint: 'https://whop.com/oauth',
  tokenEndpoint: `${API_BASE}/api/auth/whop/token`,
};

export function useWhopAuth() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'smarterpicks' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WHOP_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'email', 'profile', 'memberships:read'],
      usePKCE: true,
    },
    discovery
  );

  return { request, response, promptAsync };
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
    await storage.setAccessToken(data.access_token);
    if (data.refresh_token) await storage.setRefreshToken(data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}
