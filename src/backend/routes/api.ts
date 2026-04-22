import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { db } from "../../db/client";
import { profiles, users, projects, experience, contactInquiries } from "../../db/schema";
import { jwtVerify } from "jose";
import { Resend } from "resend";

const app = new Hono();

app.use("*", cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://jroybal.dev"],
  credentials: true,
}));

const jwtKey = new TextEncoder().encode(Bun.env.JWT_SECRET ?? "dev-secret");
const resend = new Resend(Bun.env.RESEND_API_KEY);

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const contactRateLimit = new Map<string, number>();

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

// Public Data Fetching
app.get("/projects", async (c) => {
  const data = await db.select().from(projects);
  return c.json(data.map((p) => ({ ...p, tags: p.tags.split(',') })));
});

app.get("/experience", async (c) => {
  const data = await db.select().from(experience);
  return c.json(data.map((e) => ({ ...e, bullets: JSON.parse(e.bullets) })));
});

app.get("/profile", async (c) => {
  const payload = await parseSessionToken(c);
  if (!payload?.sub) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [user] = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, Number(payload.sub))).limit(1);

  return c.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt, role: user.role },
    profile: profile
      ? { displayName: profile.displayName, bio: profile.bio }
      : null,
  });
});

app.post("/contact", async (c) => {
  // Anti-spam: simple rate limiting by IP (1 submission per minute)
  const ip = c.req.header("x-forwarded-for") || "local";
  const lastAttempt = contactRateLimit.get(ip);
  const now = Date.now();

  if (lastAttempt && now - lastAttempt < 60000) {
    return c.json({ error: "Slow down! The machine needs a minute to reset. Please try again later." }, 429);
  }

  try {
    const body = await c.req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const projectType = String(body?.projectType ?? "").trim();
    const message = String(body?.message ?? "").trim();

    // Server-side validation
    if (name.length < 2 || name.length > 75) return c.json({ error: "Name must be between 2 and 75 characters." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Invalid email format." }, 400);
    
    const charCount = message.replace(/\s/g, '').length; // Do not count spaces
    if (charCount < 50 || charCount > 2000) {
      return c.json({ error: "Message must be between 50 and 2000 characters (excluding spaces)." }, 400);
    }

    if (!Bun.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY in environment variables.");
      return c.json({ error: "Email service not configured." }, 500);
    }

    // Save to Database
    await db.insert(contactInquiries).values({
      name: name.trim(),
      email: email.trim(),
      projectType,
      message: message.trim(),
    });

    const { error } = await resend.emails.send({
      from: "JRoybalDev <contact@jroybal.dev>",// Update this to your verified domain in production
      to: ["contact@jroybal.dev"], // The recipient
      subject: `☕ New Inquiry: ${projectType} from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nProject: ${projectType}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; color: #27211b; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e7d4bb; padding: 20px; border-radius: 12px;">
          <h2 style="color: #8c6844; margin-top: 0;">☕ New Project Inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Project Type:</strong> ${escapeHtml(projectType)}</p>
          <hr style="border: 0; border-top: 1px solid #e7d4bb; margin: 20px 0;" />
          <p style="font-weight: bold; color: #8c6844;">Message Content:</p>
          <p style="white-space: pre-wrap; background: #f7ede2; padding: 15px; border-radius: 8px;">${escapeHtml(message)}</p>
        </div>
      `,
    });

    if (error) throw error;

    contactRateLimit.set(ip, now);
    return c.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return c.json({ error: "The machine is clogged. Please try again later or email me directly." }, 500);
  }
});

// Admin Middleware
const adminOnly = async (c: Context, next: () => Promise<void>) => {
  const payload = await parseSessionToken(c);
  if (!payload?.sub) return c.json({ error: "Unauthorized" }, 401);

  const [user] = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
  if (!user || user.role !== 'admin') return c.json({ error: "Forbidden" }, 403);
  
  await next();
};

// Admin Routes
app.get("/admin/inquiries", adminOnly, async (c) => {
  const inquiries = await db.select().from(contactInquiries);
  return c.json(inquiries);
});

app.post("/admin/projects", adminOnly, async (c) => {
  const body = await c.req.json();
  await db.insert(projects).values(body);
  return c.json({ success: true });
});

export default app;
