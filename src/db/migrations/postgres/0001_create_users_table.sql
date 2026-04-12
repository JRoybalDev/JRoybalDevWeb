CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  hashed_password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
