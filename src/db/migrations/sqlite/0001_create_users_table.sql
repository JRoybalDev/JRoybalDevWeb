CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY AUTOINCREMENT,
  email text NOT NULL UNIQUE,
  hashed_password text NOT NULL,
  created_at text NOT NULL DEFAULT current_timestamp
);
