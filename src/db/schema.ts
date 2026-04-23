import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "user">().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id"), // Format: PRJ-####
  name: text("name").notNull(),
  clientName: text("client_name"),
  clientEmail: text("client_email"),
  clientContact: text("client_contact"),
  contractType: text("contract_type").$type<"Fixed-price" | "Hourly" | "Retainer">().default("Fixed-price"),
  projectType: text("project_type").default("Full-stack"),
  status: text("status").$type<"Active" | "Review" | "Completed" | "Archived">().default("Active"),
  contractValue: text("contract_value"),
  amountInvoiced: text("amount_invoiced"),
  amountOutstanding: text("amount_outstanding"),
  paymentTerms: text("payment_terms"),
  depositPaid: text("deposit_paid"),
  startDate: text("start_date"),
  deadline: text("deadline"),
  estHours: text("est_hours"),
  loggedHours: text("logged_hours"),
  effectiveRate: text("effective_rate"),
  revisionRounds: text("revision_rounds"),
  scopeChanges: text("scope_changes"),
  stack: text("stack"),
  hosting: text("hosting"),
  repo: text("repo"),
  stagingUrl: text("staging_url"),
  ndaSigned: text("nda_signed"),
  contractSigned: text("contract_signed"),
  lastMilestone: text("last_milestone"),
  nextMilestone: text("next_milestone"),
  priority: text("priority").$type<"Low" | "Medium" | "High">().default("Medium"),
  internalNotes: text("internal_notes"),
  description: text("description").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  thumbnail: text("thumbnail"),
  tags: text("tags"), // Comma-separated list for the portfolio
  category: text("category"),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  bullets: text("bullets").notNull(), // Stored as stringified JSON array
  type: text("type").$type<"work" | "education" | "certificate">().notNull(),
  startDate: text("start_date"), // ISO string for sorting (e.g. 2023-01)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
