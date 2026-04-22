/// <reference types="bun" />
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Path to your schema file
  schema: './src/db/schema.ts',
  // Where migrations will be generated
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});