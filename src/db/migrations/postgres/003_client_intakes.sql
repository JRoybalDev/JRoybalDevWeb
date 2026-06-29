CREATE TABLE IF NOT EXISTS client_intakes (
  id serial PRIMARY KEY,
  project_id integer REFERENCES projects(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  company text,
  payload jsonb NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
