import app from "../src/backend/app.ts";

export default function handler(request: Request) {
  const url = new URL(request.url, "https://www.jroybal.dev");
  const catchAllPath = url.searchParams.get("...path") ?? url.searchParams.get("path");

  if (catchAllPath) {
    const path = catchAllPath.replace(/^\/?api\/?/, "");
    url.pathname = `/api/${path}`;
    url.searchParams.delete("...path");
    url.searchParams.delete("path");
    return app.fetch(new Request(url.toString(), request));
  }

  if (!url.pathname.startsWith("/api/")) {
    url.pathname = `/api${url.pathname}`;
    return app.fetch(new Request(url.toString(), request));
  }

  return app.fetch(new Request(url.toString(), request));
}
