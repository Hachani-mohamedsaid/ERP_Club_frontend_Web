import type { Plugin, Connect } from "vite";
import { handleScoutMapRoute } from "./src/lib/api/scout/mapHandlers";
import { handleScoutSearchRoute } from "./src/lib/api/scout/searchHandlers";
import { handleProspectLiveRoute } from "./src/lib/api/scout/prospectLiveHandlers";
import { buildFlashscoreSearchResponse, type ScoutSearchFilters } from "./src/lib/api/scout/searchFallback";
import { resolveYoutubeVideo } from "./src/lib/api/scout/youtubeResolve";

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(
  res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void },
  status: number,
  body: unknown,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function scoutMapApiPlugin(): Plugin {
  const middleware = async (
    req: Connect.IncomingMessage,
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void },
    next: () => void,
  ) => {
    const url = req.url ?? "";
    const path = url.split("?")[0] ?? "";

    if (path === "/api/scout/youtube/resolve" && req.method === "GET") {
      try {
        const q = new URL(url, "http://local").searchParams.get("q")?.trim() ?? "";
        const result = await resolveYoutubeVideo(q);
        sendJson(res, 200, result);
      } catch {
        const q = new URL(url, "http://local").searchParams.get("q") ?? "";
        sendJson(res, 200, {
          videoId: null,
          searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
        });
      }
      return;
    }

    if (path === "/api/scout/prospects/live" && req.method === "GET") {
      try {
        const params = new URL(url, "http://local").searchParams;
        const result = await handleProspectLiveRoute("GET", params);
        if (result) {
          sendJson(res, result.status, result.body);
          return;
        }
      } catch {
        /* quota / erreur → backend ou données locales */
      }
      return next();
    }

    // Toujours répondre ici après lecture du body — next() après readBody casse le proxy (502 ECONNRESET).
    if (path === "/api/scout/search" && req.method === "POST") {
      let filters: ScoutSearchFilters = {};
      try {
        const raw = await readBody(req);
        filters = raw ? (JSON.parse(raw) as ScoutSearchFilters) : {};
        const result = await handleScoutSearchRoute("POST", filters);
        if (result) {
          sendJson(res, result.status, result.body);
          return;
        }
      } catch {
        /* fallback ci-dessous */
      }
      sendJson(res, 200, buildFlashscoreSearchResponse(filters));
      return;
    }

    if (!path.startsWith("/api/scout/map")) return next();

    const result = await handleScoutMapRoute(req.method ?? "GET", url);
    if (!result) return next();

    sendJson(res, result.status, result.body);
  };

  return {
    name: "scout-map-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
