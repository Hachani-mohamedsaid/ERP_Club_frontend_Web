/**
 * Serveur Express standalone pour /analyste/*
 * Déployable sur Render, Railway, etc.
 *
 * cd server && npm install && npm start
 */
import express from "express";
import cors from "cors";
import { handleAnalysteRoute } from "../src/lib/api/analyste/handlers.js";

const app = express();
const PORT = Number(process.env.ANALYSTE_PORT ?? process.env.PORT ?? 3001);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", module: "analyste", routes: 21 });
});

function mount(method: string, path: string) {
  const handler = (req: express.Request, res: express.Response) => {
    const result = handleAnalysteRoute(method, path, req.body);
    res.status(result.status).json(result.body);
  };
  if (method === "GET") app.get(path, handler);
  else app.post(path, handler);
}

[
  "/analyste/dashboard",
  "/analyste/executive",
  "/analyste/live-match",
  "/analyste/prediction/teams",
  "/analyste/ppi",
  "/analyste/chemistry",
  "/analyste/patterns",
  "/analyste/tactical",
  "/analyste/video-analysis",
  "/analyste/video-coach",
  "/analyste/replay",
  "/analyste/opponent",
  "/analyste/fatigue",
  "/analyste/whoop",
  "/analyste/injuries",
  "/analyste/injury-forecast",
  "/analyste/transfer",
  "/analyste/market-value",
  "/analyste/scouting",
  "/analyste/evolution",
  "/analyste/training",
].forEach((path) => mount("GET", path));

mount("POST", "/analyste/prediction");

app.listen(PORT, () => {
  console.log(`Analyste API → http://localhost:${PORT}/analyste/dashboard`);
});
