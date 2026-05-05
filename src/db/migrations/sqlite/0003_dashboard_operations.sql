CREATE TABLE IF NOT EXISTS projects (
  id integer PRIMARY KEY AUTOINCREMENT,
  project_id text,
  name text NOT NULL,
  client_name text,
  client_email text,
  client_contact text,
  contract_type text DEFAULT 'Fixed-price',
  project_type text DEFAULT 'Full-stack',
  status text DEFAULT 'Active',
  contract_value text,
  amount_invoiced text,
  amount_outstanding text,
  payment_terms text,
  deposit_paid text,
  start_date text,
  deadline text,
  est_hours text,
  logged_hours text,
  effective_rate text,
  revision_rounds text,
  scope_changes text,
  stack text,
  hosting text,
  repo text,
  staging_url text,
  nda_signed text,
  contract_signed text,
  last_milestone text,
  next_milestone text,
  priority text DEFAULT 'Medium',
  internal_notes text,
  description text NOT NULL,
  is_public integer DEFAULT 1 NOT NULL,
  thumbnail text,
  tags text,
  category text,
  github_url text,
  live_url text,
  created_at text DEFAULT current_timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS experience (
  id integer PRIMARY KEY AUTOINCREMENT,
  year text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  bullets text NOT NULL,
  type text NOT NULL,
  start_date text,
  created_at text DEFAULT current_timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id integer PRIMARY KEY AUTOINCREMENT,
  name text NOT NULL,
  email text NOT NULL,
  project_type text NOT NULL,
  message text NOT NULL,
  is_read integer DEFAULT 0 NOT NULL,
  created_at text DEFAULT current_timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id integer PRIMARY KEY AUTOINCREMENT,
  project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount text NOT NULL,
  status text DEFAULT 'Pending' NOT NULL,
  due_date text NOT NULL,
  notes text,
  paid_at text,
  created_at text DEFAULT current_timestamp NOT NULL,
  updated_at text DEFAULT current_timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entries (
  id integer PRIMARY KEY AUTOINCREMENT,
  project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date text NOT NULL,
  hours text NOT NULL,
  notes text,
  created_at text DEFAULT current_timestamp NOT NULL,
  updated_at text DEFAULT current_timestamp NOT NULL
);
