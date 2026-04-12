import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/bun-sqlite";
import { Pool } from "pg";
import { Database } from "bun:sqlite";

const databaseUrl = Bun.env.DATABASE_URL;

export const db = (databaseUrl
  ? drizzlePg(new Pool({ connectionString: databaseUrl }))
  : drizzleSqlite(new Database(Bun.env.SQLITE_FILE ?? "./dev.db"))) as any;
