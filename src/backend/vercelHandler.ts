type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (statusCode: number) => VercelResponse;
  setHeader: (name: string, value: string | string[]) => void;
  send: (body: Buffer) => void;
};

function headersFromNode(headers: VercelRequest["headers"]) {
  const webHeaders = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) webHeaders.append(name, item);
    } else if (value !== undefined) {
      webHeaders.set(name, value);
    }
  }
  return webHeaders;
}

function getOrigin(request: VercelRequest) {
  const host = request.headers.host;
  const protocol = request.headers["x-forwarded-proto"] ?? "https";
  return `${Array.isArray(protocol) ? protocol[0] : protocol}://${Array.isArray(host) ? host[0] : host ?? "www.jroybal.dev"}`;
}

async function sendWebResponse(webResponse: Response, response: VercelResponse) {
  webResponse.headers.forEach((value, name) => {
    response.setHeader(name, value);
  });

  response.status(webResponse.status).send(Buffer.from(await webResponse.arrayBuffer()));
}

export function createVercelHandler(
  app: { fetch: (request: Request) => Response | Promise<Response> },
  pathname?: string,
  resolvePathname?: (url: URL) => string | undefined
) {
  return async function handler(request: VercelRequest, response: VercelResponse) {
    const method = request.method ?? "GET";
    const url = new URL(request.url ?? pathname ?? "/api", getOrigin(request));
    const resolvedPathname = resolvePathname?.(url);

    if (resolvedPathname) {
      url.pathname = resolvedPathname;
    } else if (pathname) {
      url.pathname = pathname;
    } else if (!url.pathname.startsWith("/api/")) {
      url.pathname = `/api${url.pathname}`;
    }

    url.searchParams.delete("...path");
    url.searchParams.delete("path");

    const body = method === "GET" || method === "HEAD" ? undefined : (request as unknown as BodyInit);
    const honoRequest = new Request(url, {
      method,
      headers: headersFromNode(request.headers),
      body,
      duplex: body ? "half" : undefined,
    } as RequestInit & { duplex?: "half" });

    const webResponse = await app.fetch(honoRequest);
    await sendWebResponse(webResponse, response);
  };
}
