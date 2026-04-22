import { pgTable, text, integer, serial, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("password").notNull(),
  githubId: text("github_id"),
  createdAt: timestamp("created_at").defaultNow(),
  role: text("role").default("user"), // 'admin' or 'user'
});

export const profiles = pgTable("profiles", {
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  bio: text("bio"),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  thumbnail: text("thumbnail"),
  tags: text("tags").notNull(), // Store as comma-separated or JSON string
  category: text("category").notNull(),
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
});

export const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  bullets: text("bullets").notNull(), // Store as JSON string
  type: text("type").notNull(), // 'work' or 'education'
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
