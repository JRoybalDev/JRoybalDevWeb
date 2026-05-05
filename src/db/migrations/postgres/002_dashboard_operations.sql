ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_id text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_contact text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_type text DEFAULT 'Fixed-price';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'Full-stack';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_value text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amount_invoiced text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS amount_outstanding text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_terms text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deposit_paid text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS est_hours text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logged_hours text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS effective_rate text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS revision_rounds text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scope_changes text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stack text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hosting text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repo text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS staging_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS nda_signed text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_signed text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_milestone text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS next_milestone text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS internal_notes text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true NOT NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now() NOT NULL;

ALTER TABLE experience ADD COLUMN IF NOT EXISTS start_date text;
ALTER TABLE experience ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now() NOT NULL;

ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false NOT NULL;

CREATE TABLE IF NOT EXISTS invoices (
  id serial PRIMARY KEY,
  project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  amount text NOT NULL,
  status text DEFAULT 'Pending' NOT NULL,
  due_date timestamp NOT NULL,
  notes text,
  paid_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entries (
  id serial PRIMARY KEY,
  project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date timestamp NOT NULL,
  hours text NOT NULL,
  notes text,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);
