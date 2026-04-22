CREATE TABLE "contact_inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"project_type" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "experience" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"bullets" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" integer,
	"display_name" text,
	"bio" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"thumbnail" text,
	"tags" text NOT NULL,
	"category" text NOT NULL,
	"github_url" text,
	"live_url" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"password" text NOT NULL,
	"github_id" text,
	"created_at" timestamp DEFAULT now(),
	"role" text DEFAULT 'user'
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;