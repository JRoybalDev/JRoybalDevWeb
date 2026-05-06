import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL;

export default async function handler() {
  if (!databaseUrl) {
    return Response.json({ ok: false, error: "Missing database URL" }, { status: 500 });
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 1,
    ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });

  try {
    const result = await Promise.race([
      pool.query("select 1 as ok"),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DB ping timed out after 5000ms")), 5000)),
    ]);

    return Response.json({ ok: true, result: result.rows[0] });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown database error" },
      { status: 500 }
    );
  } finally {
    await pool.end().catch(() => undefined);
  }
}
