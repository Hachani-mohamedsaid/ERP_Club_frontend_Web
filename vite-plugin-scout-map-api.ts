import type { Plugin } from "vite";
import { handleScoutMapRoute } from "./src/lib/api/scout/mapHandlers";

export function scoutMapApiPlugin(): Plugin {
  const middleware = async (
    req: { method?: string; url?: string },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b: string) => void },
    next: () => void,
  ) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api/scout/map")) return next();

    const result = await handleScoutMapRoute(req.method ?? "GET", url);
    if (!result) return next();

    res.statusCode = result.status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result.body));
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
