import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes, apiRoutes } from "./routes";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));
app.route("/api/auth", authRoutes);
app.route("/api", apiRoutes);

app.get("/assets/*", (c) => {
  return c.body(Bun.file(`./dist${c.req.path}`) as any);
});

app.get("/*", (c) => {
  const file = Bun.file("./dist/index.html");
  return c.body(file as any);
});

serve({
  port: 3000,
  fetch: app.fetch.bind(app),
});
