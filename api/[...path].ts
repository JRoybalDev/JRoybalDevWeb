import app from "../src/backend/app.ts";
import { createVercelHandler } from "../src/backend/vercelHandler.ts";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getCatchAllPath(url: URL) {
  const catchAllPath = url.searchParams.get("...path") ?? url.searchParams.get("path");

  if (catchAllPath) {
    const path = catchAllPath.replace(/^\/?api\/?/, "");
    return `/api/${path}`;
  }
  return undefined;
}

export default createVercelHandler(app, undefined, getCatchAllPath);
