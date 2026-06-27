import type { Plugin, Connect } from "vite";
import { handleAnalysteRoute } from "./src/lib/api/analyste/handlers";

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function analysteApiPlugin(): Plugin {
  return {
    name: "analyste-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/analyste")) return next();

        try {
          const method = req.method ?? "GET";
          let body: { home?: string; away?: string } | undefined;
          if (method === "POST") {
            const raw = await readBody(req);
            if (raw) body = JSON.parse(raw);
          }
          const result = handleAnalysteRoute(method, url, body);
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Erreur serveur analyste" }));
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/api/analyste")) return next();

        try {
          const method = req.method ?? "GET";
          let body: { home?: string; away?: string } | undefined;
          if (method === "POST") {
            const raw = await readBody(req);
            if (raw) body = JSON.parse(raw);
          }
          const result = handleAnalysteRoute(method, url, body);
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ message: "Erreur serveur analyste" }));
        }
      });
    },
  };
}
