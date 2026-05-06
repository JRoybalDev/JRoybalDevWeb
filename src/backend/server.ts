import { serve } from "bun";
import app from "./app.ts";

serve({
  port: 3000,
  fetch: app.fetch.bind(app),
});
