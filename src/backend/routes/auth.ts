import { Hono } from "hono";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";
import { compareSync, hashSync } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie } from "hono/cookie"; // Assuming client.ts is in src/db
import { db } from "../../db/client"; 
import { users } from "../../db/schema"; // profiles table removed

const app = new Hono();

app.use("*", cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
}));

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
  const [saved] = await db.insert(users).values({ email, password: hashedPassword }).returning();

  if (saved) {
    // profiles table removed
    // await db.insert(profiles).values({
    //   userId: Number(saved.id),
    //   displayName: email.split("@")[0],
    //   bio: "",
    // });
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
  if (!user || !verifyPassword(password, user.password)) {
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

export default app;
