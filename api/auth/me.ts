import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';

const WHOP_API_KEY = process.env.WHOP_API_KEY!;

function decodeJwt(token: string): Record<string, any> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid JWT');
  const padded = payload + '=='.slice((payload.length % 4) || 4);
  return JSON.parse(Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const whopToken = requireAuth(req);
  if (!whopToken) return res.status(401).json({ error: 'Unauthorized' });

  let claims: Record<string, any>;
  try {
    claims = decodeJwt(whopToken);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = claims.sub;
  if (!userId) return res.status(401).json({ error: 'Invalid token' });

  console.log('Checking membership for userId:', userId);
  console.log('WHOP_API_KEY set:', !!WHOP_API_KEY);

  // TODO: re-enable membership check for production
  // For now return user info from JWT claims directly
  return res.status(200).json({
    id: userId,
    email: claims.email ?? '',
    username: claims.preferred_username ?? userId,
    planType: 'monthly',
    trialEndsAt: null,
    memberSince: new Date().toISOString(),
  });
}
