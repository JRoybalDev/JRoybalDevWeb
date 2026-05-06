import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { getEnv } from "../backend/env";

const databaseUrl = getEnv("DATABASE_URL") ?? getEnv("POSTGRES_URL") ?? getEnv("POSTGRES_PRISMA_URL");
const runtimeImport = new Function("specifier", "return import(specifier)") as <T>(specifier: string) => Promise<T>;

async function createDatabase() {
  if (databaseUrl) {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 1,
      // Many cloud providers require SSL. This config explicitly handles it
      // while avoiding the warning for local vs production environments.
      ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") 
        ? false 
        : { rejectUnauthorized: false }
    });
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
