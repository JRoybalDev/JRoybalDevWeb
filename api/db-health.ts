import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL;

function getDatabaseUrlInfo() {
  if (!databaseUrl) return { configured: false };

  try {
    const parsedUrl = new URL(databaseUrl);
    return {
      configured: true,
      protocol: parsedUrl.protocol,
      host: parsedUrl.host,
      database: parsedUrl.pathname.replace(/^\//, "") || null,
      sslmode: parsedUrl.searchParams.get("sslmode"),
      isDirectPostgresUrl: ["postgres:", "postgresql:"].includes(parsedUrl.protocol),
    };
  } catch {
    return { configured: true, invalid: true };
  }
}

export default async function handler(request: Request) {
  if (!databaseUrl) {
    return Response.json({ ok: false, error: "Missing database URL" }, { status: 500 });
  }

  const url = new URL(request.url, "https://www.jroybal.dev");
  const databaseUrlInfo = getDatabaseUrlInfo();
  if (url.searchParams.get("inspect") === "1") {
    return Response.json({ ok: true, databaseUrl: databaseUrlInfo });
  }

  if (!databaseUrlInfo.isDirectPostgresUrl) {
    return Response.json(
      {
        ok: false,
        error: "The configured database URL is not a direct Postgres URL. Drizzle with pg requires postgres:// or postgresql:// with sslmode=require.",
        databaseUrl: databaseUrlInfo,
      },
      { status: 500 }
    );
  }

  const pool = createPool();
  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB connect timed out after 3000ms")), 3000)),
    ]);

    try {
      const result = await Promise.race([
        client.query("select 1 as ok"),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB query timed out after 3000ms")), 3000)),
      ]);
      return Response.json({ ok: true, result: result.rows[0] });
    } finally {
      client.release(true);
    }
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown database error" },
      { status: 500 }
    );
  } finally {
    await pool.end().catch(() => undefined);
  }
}

function createPool() {
  return new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 1000,
    max: 1,
    ssl: databaseUrl!.includes("localhost") || databaseUrl!.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });
}
