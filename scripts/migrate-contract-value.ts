import { db } from "../src/db/client";
import { sql } from "drizzle-orm";

async function main() {
  const casts = [
    // Integers
    `ALTER TABLE projects ALTER COLUMN estimated_hours TYPE INTEGER USING NULLIF(TRIM(estimated_hours::TEXT), '')::INTEGER`,
    `ALTER TABLE projects ALTER COLUMN scope_changes TYPE INTEGER USING NULLIF(TRIM(scope_changes::TEXT), '')::INTEGER`,
    
    // Timestamps (invoices + time_entries)
    `ALTER TABLE invoices ALTER COLUMN due_date TYPE TIMESTAMP USING NULLIF(TRIM(due_date::TEXT), '')::TIMESTAMP`,
    `ALTER TABLE time_entries ALTER COLUMN date TYPE TIMESTAMP USING NULLIF(TRIM(date::TEXT), '')::TIMESTAMP`,
    
    // Decimals
    `ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(10,2) USING NULLIF(TRIM(amount::TEXT), '')::NUMERIC(10,2)`,
    `ALTER TABLE time_entries ALTER COLUMN hours TYPE NUMERIC(5,2) USING NULLIF(TRIM(hours::TEXT), '')::NUMERIC(5,2)`,
  ];

  for (const cast of casts) {
    try {
      await db.execute(sql.raw(cast));
      console.log(`✓ ${cast.slice(0, 60)}...`);
    } catch (e: any) {
      // Skip if already the correct type
      if (e.message?.includes("cannot be cast") || e.message?.includes("does not exist")) {
        console.log(`⚠ Skipped (already correct type): ${cast.slice(0, 60)}...`);
      } else {
        throw e;
      }
    }
  }

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });