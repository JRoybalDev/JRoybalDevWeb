-- db/migrations/postgres/001_initial.sql
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  github_id text,
  created_at timestamptz DEFAULT now(),
  role text DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id integer REFERENCES users(id) ON DELETE CASCADE,
  display_name text,
  bio text
);

CREATE TABLE IF NOT EXISTS projects (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  thumbnail text,
  tags text NOT NULL,
  category text NOT NULL,
  github_url text,
  live_url text
);

CREATE TABLE IF NOT EXISTS experience (
  id serial PRIMARY KEY,
  year text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  bullets text NOT NULL,
  type text NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  project_type text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);