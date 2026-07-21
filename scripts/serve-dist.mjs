import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 8080);

if (!Number.isFinite(port) || port <= 0) {
  console.error(`Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

console.log(`Starting static server (PORT=${port}, dist=${root})`);

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

createServer(async (req, res) => {
  const pathname = (req.url ?? "/").split("?")[0] || "/";

  if (pathname === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
    return;
  }

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
}).listen(port, "0.0.0.0", () => {
  console.log(`Serving dist on http://0.0.0.0:${port}`);
}).on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
