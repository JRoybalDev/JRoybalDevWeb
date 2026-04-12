CREATE TABLE IF NOT EXISTS profiles (
  id integer PRIMARY KEY AUTOINCREMENT,
  user_id integer NOT NULL UNIQUE,
  display_name text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  created_at text NOT NULL DEFAULT current_timestamp
);
