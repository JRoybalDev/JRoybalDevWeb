import { pgTable, serial, integer as pgInteger, text as pgText, timestamp as pgTimestamp } from "drizzle-orm/pg-core";
import { sqliteTable, integer, text as sqliteText } from "drizzle-orm/sqlite-core";
import type { InferModel } from "drizzle-orm";

export const pgUsers = pgTable("users", {
  id: serial("id").primaryKey(),
  email: pgText("email").notNull().unique(),
  hashedPassword: pgText("hashed_password").notNull(),
  createdAt: pgTimestamp("created_at").notNull().defaultNow(),
});

export const sqliteUsers = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: sqliteText("email").notNull().unique(),
  hashedPassword: sqliteText("hashed_password").notNull(),
  createdAt: sqliteText("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const users = (Bun.env.DATABASE_URL ? pgUsers : sqliteUsers) as typeof pgUsers;

export const pgProfiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: pgInteger("user_id").notNull().unique(),
  displayName: pgText("display_name").notNull().default(""),
  bio: pgText("bio").default(""),
  createdAt: pgTimestamp("created_at").notNull().defaultNow(),
});

export const sqliteProfiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().unique(),
  displayName: sqliteText("display_name").notNull().default(""),
  bio: sqliteText("bio").default(""),
  createdAt: sqliteText("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export const profiles = (Bun.env.DATABASE_URL ? pgProfiles : sqliteProfiles) as typeof pgProfiles;

export type SqliteUser = InferModel<typeof sqliteUsers>;
export type PgUser = InferModel<typeof pgUsers>;
export type User = SqliteUser | PgUser;
export type NewUser = Omit<User, "id" | "createdAt">;

export type SqliteProfile = InferModel<typeof sqliteProfiles>;
export type PgProfile = InferModel<typeof pgProfiles>;
export type Profile = SqliteProfile | PgProfile;
export type NewProfile = Omit<Profile, "id" | "createdAt">;
