import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { db } from "../../db/client"; // Assuming client.ts is in src/db
import { users, projects, experience, contactInquiries } from "../../db/schema";
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
  return c.json(data.map((p) => ({ ...p, tags: p.tags?.split(',') || [] })));
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

  // const [profile] = await db.select().from(profiles).where(eq(profiles.userId, Number(payload.sub))).limit(1); // profiles table removed

  return c.json({
    user: { id: user.id, email: user.email, createdAt: user.createdAt, role: user.role },
    profile: null,
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

// Admin Experience Routes
app.get("/admin/experience", adminOnly, async (c) => {
  const data = await db.select().from(experience);
  return c.json(data.map((e) => ({ ...e, bullets: JSON.parse(e.bullets) })));
});

app.post("/admin/experience", adminOnly, async (c) => {
  const entry = await c.req.json();
  const [saved] = await db.insert(experience).values(entry).returning();
  return c.json({ ...saved, bullets: JSON.parse(saved.bullets) });
});

app.put("/admin/experience/:id", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  const entry = await c.req.json();
  const [updated] = await db.update(experience).set(entry).where(eq(experience.id, id)).returning();
  return c.json(updated);
});

app.delete("/admin/experience/:id", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(experience).where(eq(experience.id, id));
  return c.json({ success: true });
});

// Admin Routes
app.get("/admin/inquiries", adminOnly, async (c) => {
  const data = await db.select().from(contactInquiries);
  return c.json(data);
});

app.get("/admin/projects", adminOnly, async (c) => {
  const data = await db.select().from(projects);
  return c.json(data);
});

// Create Project
app.post("/admin/projects", adminOnly, async (c) => {
  const project = await c.req.json();
  if (!project.name || String(project.name).trim().length < 2) {
    return c.json({ error: "Project name must be at least 2 characters." }, 400);
  }
  if (!project.description || String(project.description).trim().length < 10) {
    return c.json({ error: "Project description must be at least 10 characters." }, 400);
  }
  
  // Financial Auto-calc
  const val = parseFloat(project.contractValue) || 0;
  const inv = parseFloat(project.amountInvoiced) || 0;
  project.amountOutstanding = Math.max(0, val - inv).toFixed(2);

  // Auto-generate Project ID if missing
  if (!project.projectId) {
    project.projectId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const [saved] = await db.insert(projects).values(project).returning();
  return c.json(saved);
});

// Update Project
app.put("/admin/projects/:id", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "Invalid project ID" }, 400);
  const project = await c.req.json();
  if (!project.name || String(project.name).trim().length < 2) {
    return c.json({ error: "Project name must be at least 2 characters." }, 400);
  }
  if (!project.description || String(project.description).trim().length < 10) {
    return c.json({ error: "Project description must be at least 10 characters." }, 400);
  }
  
  const val = parseFloat(project.contractValue) || 0;
  const inv = parseFloat(project.amountInvoiced) || 0;
  project.amountOutstanding = Math.max(0, val - inv).toFixed(2);

  const [updated] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
  if (!updated) return c.json({ error: "Project not found" }, 404);
  return c.json(updated);
});

// Delete Project
app.delete("/admin/projects/:id", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "Invalid project ID" }, 400);
  await db.delete(projects).where(eq(projects.id, id));
  return c.json({ success: true });
});

// Delete Inquiry
app.delete("/admin/inquiries/:id", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(contactInquiries).where(eq(contactInquiries.id, id));
  return c.json({ success: true });
});

// Mark Inquiry as Read
app.patch("/admin/inquiries/:id/read", adminOnly, async (c) => {
  const id = Number(c.req.param("id"));
  await db.update(contactInquiries).set({ isRead: true }).where(eq(contactInquiries.id, id));
  return c.json({ success: true });
});

export default app;
