import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 8080);
const apiTarget = (
  process.env.API_PROXY_TARGET ??
  process.env.VITE_API_URL ??
  "https://erp-club-backend-production.up.railway.app"
).replace(/\/$/, "");

if (!Number.isFinite(port) || port <= 0) {
  console.error(`Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

console.log(`Starting static server (PORT=${port}, apiTarget=${apiTarget})`);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
};

function shouldProxy(pathname) {
  return pathname.startsWith("/api") || pathname.startsWith("/uploads") || pathname.startsWith("/socket.io");
}

function backendPath(pathname, search) {
  if (pathname.startsWith("/api")) {
    const stripped = pathname.replace(/^\/api/, "") || "/";
    return `${stripped}${search}`;
  }
  return `${pathname}${search}`;
}

function proxyToBackend(req, res) {
  const url = new URL(req.url ?? "/", "http://local");
  const target = new URL(backendPath(url.pathname, url.search), `${apiTarget}/`);
  const isHttps = target.protocol === "https:";
  const transport = isHttps ? httpsRequest : httpRequest;

  const headers = { ...req.headers, host: target.host };
  delete headers.connection;

  const upstream = transport(
    {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: req.method,
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );

  upstream.on("error", (err) => {
    console.error("Proxy error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ message: "Backend indisponible" }));
    } else {
      res.end();
    }
  });

  req.pipe(upstream);
}

async function serveStatic(pathname, res) {
  let filePath = join(root, pathname === "/" ? "index.html" : pathname);

  try {
    let body = await readFile(filePath);
    let type = MIME[extname(filePath)] ?? "application/octet-stream";

    if (pathname !== "/" && !MIME[extname(filePath)]) {
      body = await readFile(join(root, "index.html"));
      type = MIME[".html"];
    }

    res.writeHead(200, { "Content-Type": type });
    res.end(body);
  } catch {
    try {
      const body = await readFile(join(root, "index.html"));
      res.writeHead(200, { "Content-Type": MIME[".html"] });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  }
}

createServer(async (req, res) => {
  const pathname = (req.url ?? "/").split("?")[0] || "/";

  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

  if (shouldProxy(pathname)) {
    proxyToBackend(req, res);
    return;
  }

  await serveStatic(pathname, res);
})
  .listen(port, "0.0.0.0", () => {
    console.log(`Serving dist on http://0.0.0.0:${port}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
