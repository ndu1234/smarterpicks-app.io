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

  // Try v5 memberships with company API key
  const membershipRes = await fetch(
    `https://api.whop.com/v5/memberships?user_id=${userId}&page_size=10`,
    { headers: { Authorization: `Bearer ${WHOP_API_KEY}`, 'Content-Type': 'application/json' } }
  );

  const membershipBody = await membershipRes.text();
  console.log('userId:', userId);
  console.log('Membership API status:', membershipRes.status);
  console.log('Membership API response:', membershipBody.substring(0, 500));

  if (!membershipRes.ok) {
    // Fallback: try v2 API
    const v2Res = await fetch('https://api.whop.com/api/v2/memberships', {
      headers: { Authorization: `Bearer ${WHOP_API_KEY}`, 'Content-Type': 'application/json' },
    });
    const v2Body = await v2Res.text();
    console.log('v2 fallback status:', v2Res.status, 'body:', v2Body.substring(0, 500));
    return res.status(403).json({ error: 'Membership check failed', v5: membershipRes.status, v2: v2Res.status });
  }

  const membershipData = JSON.parse(membershipBody) as Record<string, any>;
  const activeMembership = membershipData.data?.find(
    (m: any) => m.status === 'active' || m.status === 'trialing'
  );

  console.log('Total memberships found:', membershipData.data?.length ?? 0);
  console.log('Active membership:', activeMembership?.id ?? 'none');

  if (!activeMembership) {
    return res.status(403).json({ error: 'No active membership', total: membershipData.data?.length ?? 0 });
  }

  return res.status(200).json({
    id: userId,
    email: claims.email ?? '',
    username: claims.preferred_username ?? userId,
    planType: activeMembership.status === 'trialing' ? 'trial' :
              activeMembership.plan?.billing_period === 'yearly' ? 'annual' : 'monthly',
    trialEndsAt: activeMembership.trial_ends_at ?? null,
    memberSince: activeMembership.created_at,
  });
}
