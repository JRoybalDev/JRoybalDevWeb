/* eslint-disable no-console */
import { runMigrations } from "./migrate";

await runMigrations();
console.log("Database setup complete.");
