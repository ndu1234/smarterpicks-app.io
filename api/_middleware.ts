import type { VercelRequest } from '@vercel/node';

export function requireAuth(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export function requireCron(req: VercelRequest): boolean {
  const secret = req.headers['x-cron-secret'];
  return secret === process.env.CRON_SECRET;
}
