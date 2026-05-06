import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL;

type VercelRequest = {
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
};

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

function json(response: VercelResponse, body: unknown, status = 200) {
  response.status(status).json(body);
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!databaseUrl) {
    return json(response, { ok: false, error: "Missing database URL" }, 500);
  }

  const host = request.headers.host;
  const protocol = request.headers["x-forwarded-proto"] ?? "https";
  const origin = `${Array.isArray(protocol) ? protocol[0] : protocol}://${Array.isArray(host) ? host[0] : host ?? "www.jroybal.dev"}`;
  const url = new URL(request.url ?? "/api/db-health", origin);
  const databaseUrlInfo = getDatabaseUrlInfo();
  if (url.searchParams.get("inspect") === "1") {
    return json(response, { ok: true, databaseUrl: databaseUrlInfo });
  }

  if (!databaseUrlInfo.isDirectPostgresUrl) {
    return json(
      response,
      {
        ok: false,
        error: "The configured database URL is not a direct Postgres URL. Drizzle with pg requires postgres:// or postgresql:// with sslmode=require.",
        databaseUrl: databaseUrlInfo,
      },
      500
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
      return json(response, { ok: true, result: result.rows[0] });
    } finally {
      client.release(true);
    }
  } catch (error) {
    return json(
      response,
      { ok: false, error: error instanceof Error ? error.message : "Unknown database error" },
      500
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
