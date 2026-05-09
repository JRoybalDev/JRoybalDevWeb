import app from "../../src/backend/app.ts";
import { createVercelHandler } from "../../src/backend/vercelHandler.ts";

export default createVercelHandler(app, "/api/auth/me");
