CREATE TABLE IF NOT EXISTS client_intakes (
  id integer PRIMARY KEY AUTOINCREMENT,
  project_id integer REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  payload text NOT NULL,
  is_read integer DEFAULT 0 NOT NULL,
  created_at text DEFAULT (datetime('now')) NOT NULL
);
