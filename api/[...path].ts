import app from "../src/backend/app";

export default function handler(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/[...path]") {
    const path = url.searchParams.get("path") ?? "";
    url.pathname = `/api/${path}`;
    url.searchParams.delete("path");
    return app.fetch(new Request(url.toString(), request));
  }

  return app.fetch(request);
}
