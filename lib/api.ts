import { storage } from './storage';
import { refreshWhopToken } from './whop';
import type { Pick, Stats, Member } from '@/constants/types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let token = await storage.getAccessToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    const refreshToken = await storage.getRefreshToken();
    if (refreshToken) {
      token = await refreshWhopToken(refreshToken);
      if (token) {
        const retried = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options?.headers,
          },
        });
        if (retried.ok) return retried.json();
      }
    }
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  picks: {
    today: () => request<{ picks: Pick[]; publishedAt: string | null }>('/api/picks/today'),
    archive: (params?: { sport?: string; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.sport) query.set('sport', params.sport);
      if (params?.page) query.set('page', String(params.page));
      return request<{ picks: Pick[]; total: number; page: number }>(`/api/picks/archive?${query}`);
    },
  },
  stats: {
    get: () => request<Stats>('/api/stats'),
  },
  auth: {
    me: () => request<Member>('/api/auth/me'),
    registerPushToken: (token: string) =>
      request('/api/notifications/register', {
        method: 'POST',
        body: JSON.stringify({ push_token: token }),
      }),
  },
};
