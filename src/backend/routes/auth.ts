import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { compareSync, hashSync } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie } from "hono/cookie";
import { db } from "../../db/client";
import { profiles, users } from "../../db/schema";

const app = new Hono();
const COOKIE_NAME = "session";
const jwtKey = new TextEncoder().encode(Bun.env.JWT_SECRET ?? "dev-secret");
const isProduction = Bun.env.NODE_ENV === "production";

function buildCookieOptions() {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7,
  } as const;
}

async function createToken(payload: Record<string, string>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(jwtKey);
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, jwtKey);
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function createHash(password: string) {
  return hashSync(password, 10);
}

function verifyPassword(password: string, hash: string) {
  return compareSync(password, hash);
}

app.post("/register", async (c) => {
  const body = await c.req.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return c.json({ error: "Email and password are required." }, 400);
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ error: "A user with that email already exists." }, 409);
  }

  const hashedPassword = createHash(password);
  await db.insert(users).values({ email, hashedPassword });
  const [saved] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (saved) {
    await db.insert(profiles).values({
      userId: Number(saved.id),
      displayName: email.split("@")[0],
      bio: "",
    });
  }

  if (!saved) {
    return c.json({ error: "Unable to create account." }, 500);
  }

  const token = await createToken({ sub: String(saved.id), email });
  setCookie(c, COOKIE_NAME, token, buildCookieOptions());

  return c.json({ user: { id: saved.id, email: saved.email, createdAt: saved.createdAt } });
});

app.post("/login", async (c) => {
  const body = await c.req.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return c.json({ error: "Email and password are required." }, 400);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.hashedPassword)) {
    return c.json({ error: "Invalid email or password." }, 401);
  }

  const token = await createToken({ sub: String(user.id), email });
  setCookie(c, COOKIE_NAME, token, buildCookieOptions());

  return c.json({ user: { id: user.id, email: user.email, createdAt: user.createdAt } });
});

app.get("/me", async (c) => {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ user: null });
  }

  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return c.json({ user: null });
  }

  const [user] = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  return c.json({ user: user ? { id: user.id, email: user.email, createdAt: user.createdAt } : null });
});

app.post("/logout", (c) => {
  setCookie(c, COOKIE_NAME, "", { ...buildCookieOptions(), maxAge: 0 });
  return c.json({ success: true });
});

app.get("/oauth/github", (c) => {
  const clientId = Bun.env.GITHUB_CLIENT_ID;
  const redirectUri = Bun.env.OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/auth/oauth/github/callback";
  if (!clientId) {
    return c.json({ error: "GitHub OAuth is not configured." }, 500);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    allow_signup: "true",
  });

  return c.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get("/oauth/github/callback", async (c) => {
  const code = c.req.query("code");
  const clientId = Bun.env.GITHUB_CLIENT_ID;
  const clientSecret = Bun.env.GITHUB_CLIENT_SECRET;
  const redirectUri = Bun.env.OAUTH_REDIRECT_URI ?? "http://localhost:3000/api/auth/oauth/github/callback";

  if (!clientId || !clientSecret || !code) {
    return c.json({ error: "OAuth callback is missing required values." }, 400);
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return c.json({ error: "Unable to obtain GitHub access token." }, 500);
  }

  const profileRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const profile = await profileRes.json();

  const emailRes = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const emails = await emailRes.json();
  const primaryEmail = Array.isArray(emails) ? emails.find((item: any) => item.primary)?.email || emails[0]?.email : null;
  const email = primaryEmail || `${profile.login}@github.local`;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  let user = existing;

  if (!user) {
    const hashedPassword = createHash(Math.random().toString(36) + Date.now());
    await db.insert(users).values({ email, hashedPassword });
    [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  }

  if (user) {
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, Number(user.id))).limit(1);
    if (!existingProfile) {
      await db.insert(profiles).values({
        userId: Number(user.id),
        displayName: email.split("@")[0],
        bio: "",
      });
    }
  }

  if (!user) {
    return c.json({ error: "Unable to create or lookup OAuth user." }, 500);
  }

  const token = await createToken({ sub: String(user.id), email });
  setCookie(c, COOKIE_NAME, token, buildCookieOptions());

  return c.redirect("http://localhost:5173");
});

export default app;
