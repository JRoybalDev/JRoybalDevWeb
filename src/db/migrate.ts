/* eslint-disable no-console */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { db } from "./client.ts";

const dialect = process.env.DATABASE_URL ? "postgres" : "sqlite";
const migrationsDir = join(new URL("./migrations", import.meta.url).pathname, dialect);

async function ensureMigrationsTable() {
  const sql = process.env.DATABASE_URL
    ? `
      CREATE TABLE IF NOT EXISTS migrations (
        id text PRIMARY KEY,
        run_at timestamptz NOT NULL DEFAULT now()
      );
    `
    : `
      CREATE TABLE IF NOT EXISTS migrations (
        id text PRIMARY KEY,
        run_at text NOT NULL
      );
    `;

  if (process.env.DATABASE_URL) {
    await (db.$client as import("pg").Pool).query(sql);
  } else {
    (db.$client as unknown as import("bun:sqlite").Database).exec(sql);
  }
}

async function hasMigration(id: string) {
  if (process.env.DATABASE_URL) {
    const result = await (db.$client as import("pg").Pool).query(
      `SELECT id FROM migrations WHERE id = $1 LIMIT 1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  const rows = (db.$client as unknown as import("bun:sqlite").Database)
    .prepare(`SELECT id FROM migrations WHERE id = ? LIMIT 1`)
    .all(id);

  return rows.length > 0;
}

async function markMigration(id: string) {
  if (process.env.DATABASE_URL) {
    await (db.$client as import("pg").Pool).query(
      `INSERT INTO migrations (id) VALUES ($1)`,
      [id]
    );
  } else {
    (db.$client as unknown as import("bun:sqlite").Database)
      .prepare(`INSERT INTO migrations (id, run_at) VALUES (?, datetime('now'))`)
      .run(id);
  }
}

async function runMigrations() {
  await ensureMigrationsTable();

  if (!existsSync(migrationsDir)) {
    console.warn(`Migrations directory not found: ${migrationsDir}`);
    return;
  }

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found in:", migrationsDir);
    return;
  }

  for (const file of files) {
    const id = `${dialect}/${file}`;
    if (await hasMigration(id)) {
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), "utf8");

    if (process.env.DATABASE_URL) {
      await (db.$client as import("pg").Pool).query(sql);
    } else {
      (db.$client as unknown as import("bun:sqlite").Database).exec(sql);
    }

    await markMigration(id);
    console.log(`Applied migration ${id}`);
  }
}

if (import.meta.main) {
  await runMigrations();
  console.log("Migrations complete.");
}

export { runMigrations };
