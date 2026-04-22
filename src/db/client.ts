import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { Pool } from "pg";
import { Database } from "bun:sqlite";
import * as schema from "./schema";

const databaseUrl = Bun.env.DATABASE_URL;

function createDatabase() {
  if (databaseUrl) {
    const pool = new Pool({ 
      connectionString: databaseUrl,
      // Many cloud providers require SSL. This config explicitly handles it
      // while avoiding the warning for local vs production environments.
      ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") 
        ? false 
        : { rejectUnauthorized: false }
    });
    // Attach the pool to $client so it matches the migration script's expectations
    return Object.assign(drizzlePg(pool, { schema }), { $client: pool });
  }

  // Fallback to SQLite for local development if no Postgres URL is provided
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
export const db = createDatabase() as unknown as NodePgDatabase<typeof schema> & { $client: Pool | Database };
