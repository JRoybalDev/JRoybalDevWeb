/* eslint-disable no-console */
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { users } from "./schema";

const email = Bun.env.SEED_EMAIL ?? "hello@example.com";
const password = Bun.env.SEED_PASSWORD ?? "password123";

async function seedUser() {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    console.log(`Seed user already exists: ${email}`);
    return;
  }

  await db.insert(users).values({
    email,
    hashedPassword: hashSync(password, 10),
  });

  console.log(`Seed user created: ${email}`);
  console.log(`Password: ${password}`);
}

await seedUser();
