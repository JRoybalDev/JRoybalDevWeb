import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.ts";
import apiRoutes from "./routes/api.ts";
import { invoicesRoutes } from "./routes/invoices.ts";
import { timeEntriesRoutes } from "./routes/timeEntries.ts";

const app = new Hono();

app.onError((error, c) => {
  console.error(`[${c.req.method}] ${c.req.path}`, error);
  return c.json({ error: "Internal server error" }, 500);
});

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173", "https://jroybal.dev", "https://www.jroybal.dev"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

const api = new Hono();
api.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));
api.route("/auth", authRoutes);
api.route("/admin/invoices", invoicesRoutes);
api.route("/admin/time-entries", timeEntriesRoutes);
api.route("/", apiRoutes);

app.route("/api", api);

function bunFile(path: string) {
  return (globalThis as { Bun?: { file: (path: string) => unknown } }).Bun?.file(path);
}

app.get("/assets/*", (c) => {
  const file = bunFile(`./dist${c.req.path}`);
  if (!file) return c.notFound();
  return c.body(file as any);
});

app.get("/*", (c) => {
  const file = bunFile("./dist/index.html");
  if (!file) return c.notFound();
  return c.body(file as any);
});

export default app;
