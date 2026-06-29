import { db } from "../src/db/client.ts";

await (db.$client as any).query(`
  CREATE TABLE IF NOT EXISTS client_intakes (
    id serial PRIMARY KEY,
    project_id integer REFERENCES projects(id) ON DELETE SET NULL,
    name text NOT NULL,
    email text NOT NULL,
    company text,
    payload jsonb NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL
  )
`);

console.log("Done — client_intakes table created.");
process.exit(0);
