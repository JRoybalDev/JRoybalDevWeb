CREATE TABLE IF NOT EXISTS profiles (
  id serial PRIMARY KEY,
  user_id integer NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
