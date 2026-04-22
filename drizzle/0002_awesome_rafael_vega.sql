ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "profiles" CASCADE;--> statement-breakpoint
ALTER TABLE "contact_inquiries" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "tags" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "experience" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_name" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_email" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "client_contact" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "contract_type" text DEFAULT 'Fixed-price';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_type" text DEFAULT 'Full-stack';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "contract_value" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "amount_invoiced" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "amount_outstanding" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "payment_terms" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deposit_paid" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "deadline" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "est_hours" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "logged_hours" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "effective_rate" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "revision_rounds" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "scope_changes" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "stack" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "hosting" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repo" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "staging_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "nda_signed" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "contract_signed" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_milestone" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "next_milestone" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "priority" text DEFAULT 'Medium';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "internal_notes" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github_id";