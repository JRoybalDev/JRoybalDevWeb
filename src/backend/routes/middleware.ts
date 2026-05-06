import type { Context } from 'hono';
import { eq } from 'drizzle-orm';
import { getCookie } from 'hono/cookie';
import { jwtVerify } from 'jose';
import { db } from '../../db/client.ts';
import { users } from '../../db/schema.ts';
import { getEnv } from '../env.ts';

const jwtKey = new TextEncoder().encode(getEnv('JWT_SECRET') ?? 'dev-secret');

export async function parseSessionToken(c: Context) {
  const token = getCookie(c, 'session');
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtKey);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const adminOnly = async (c: Context, next: () => Promise<void>) => {
  const payload = await parseSessionToken(c);
  if (!payload?.sub) return c.json({ error: 'Unauthorized' }, 401);

  const [user] = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  if (!user || user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403);

  await next();
};
