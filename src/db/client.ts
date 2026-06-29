import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";
import { getEnv } from "../backend/env.ts";

const databaseUrl = getEnv("DATABASE_URL") ?? getEnv("POSTGRES_URL") ?? getEnv("POSTGRES_PRISMA_URL");
const runtimeImport = new Function("specifier", "return import(specifier)") as <T>(specifier: string) => Promise<T>;
let pool: Pool | null = null;

export function createPostgresPool() {
  if (!databaseUrl) return null;

  const parsedUrl = new URL(databaseUrl);
  if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
    throw new Error(`Unsupported database URL protocol "${parsedUrl.protocol}". Drizzle with pg requires a direct postgres:// or postgresql:// Prisma Postgres URL.`);
  }

  return new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 1000,
    max: 1,
    ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: true },
  });
}

async function createDatabase() {
  if (databaseUrl) {
    pool ??= createPostgresPool();
    if (!pool) throw new Error("Unable to create Postgres pool.");
    // Attach the pool to $client so it matches the migration script's expectations
    return Object.assign(drizzlePg(pool, { schema }), { $client: pool });
  }

  if (typeof (globalThis as { Bun?: unknown }).Bun === "undefined") {
    const message = "A Postgres connection string is required when running outside Bun. Set DATABASE_URL, POSTGRES_URL, or POSTGRES_PRISMA_URL in Vercel.";
    return Object.assign(
      new Proxy(
        {},
        {
          get() {
            throw new Error(message);
          },
        }
      ),
      { $client: null }
    );
  }

  // Fallback to SQLite for local development if no Postgres URL is provided
  const [{ drizzle: drizzleSqlite }, { Database }] = await Promise.all([
    runtimeImport<typeof import("drizzle-orm/bun-sqlite")>("drizzle-orm/bun-sqlite"),
    runtimeImport<typeof import("bun:sqlite")>("bun:sqlite"),
  ]);
  const sqlite = new Database("sqlite.db");
  return Object.assign(drizzleSqlite(sqlite, { schema }), { $client: sqlite });
}

/**
 * Database instance with an attached $client property.
 * 
 * We explicitly cast this to the Postgres database type to match the dialect used 
 * in schema.ts. This resolves TypeScript errors caused by the union of different 
 * Drizzle drivers when calling methods like .select() or .insert().
 */
export const db = await createDatabase() as unknown as NodePgDatabase<typeof schema> & { $client: Pool | unknown };
