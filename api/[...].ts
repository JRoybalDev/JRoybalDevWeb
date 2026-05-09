import app from "../src/backend/app.ts";
import { createVercelHandler } from "../src/backend/vercelHandler.ts";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createVercelHandler(app);
