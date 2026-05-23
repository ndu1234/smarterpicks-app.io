import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_middleware';
import { db } from '../_db';

const WHOP_API_KEY = process.env.WHOP_API_KEY!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const whopToken = requireAuth(req);
  if (!whopToken) return res.status(401).json({ error: 'Unauthorized' });

  const userRes = await fetch('https://api.whop.com/v5/me', {
    headers: { Authorization: `Bearer ${whopToken}` },
  });
  if (!userRes.ok) return res.status(401).json({ error: 'Invalid token' });
  const whopUser = await userRes.json() as Record<string, any>;

  const membershipRes = await fetch('https://api.whop.com/v5/me/memberships', {
    headers: { Authorization: `Bearer ${whopToken}` },
  });
  const membershipData = await membershipRes.json() as Record<string, any>;
  const activeMembership = membershipData.data?.find(
    (m: any) => m.status === 'active' || m.status === 'trialing'
  );

  if (!activeMembership) {
    return res.status(403).json({ error: 'No active membership' });
  }

  return res.status(200).json({
    id: whopUser.id,
    email: whopUser.email,
    username: whopUser.username,
    planType: activeMembership.status === 'trialing' ? 'trial' : activeMembership.plan?.billing_period === 'yearly' ? 'annual' : 'monthly',
    trialEndsAt: activeMembership.trial_ends_at ?? null,
    memberSince: activeMembership.created_at,
  });
}
