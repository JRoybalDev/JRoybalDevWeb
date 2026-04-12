import { Context, Hono } from "hono";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { db } from "../../db/client";
import { profiles, users } from "../../db/schema";
import { jwtVerify } from "jose";

const app = new Hono();
const jwtKey = new TextEncoder().encode(Bun.env.JWT_SECRET ?? "dev-secret");

async function parseSessionToken(c: Context) {
  const token = getCookie(c, "session");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtKey);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

app.get("/profile", async (c) => {
  const payload = await parseSessionToken(c);
  if (!payload?.sub) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [user] = await (db as any).select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [profile] = await (db as any).select().from(profiles).where(eq(profiles.userId, Number(payload.sub))).limit(1);

  return c.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    profile: profile
      ? { displayName: profile.displayName, bio: profile.bio }
      : null,
  });
});

export default app;
