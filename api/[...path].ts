import { handle } from "hono/vercel";
import app from "../src/backend/app";

export default handle(app);
