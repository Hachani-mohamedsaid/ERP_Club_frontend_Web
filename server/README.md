# Analyste API — déploiement backend

Serveur Express standalone exposant **21 endpoints** `/analyste/*` pour le module Analyste ODIN ERP.

## Dev local (intégré Vite)

En `npm run dev`, le plugin `vite-plugin-analyste-api.ts` intercepte `/api/analyste/*` avant le proxy Render.

Test :
```bash
curl http://localhost:5173/api/analyste/dashboard
curl -X POST http://localhost:5173/api/analyste/prediction \
  -H "Content-Type: application/json" \
  -d '{"home":"FC Carthage","away":"EST"}'
```

## Déploiement standalone (Render / Railway)

```bash
cd server
npm install
npm start
# → http://localhost:3001/analyste/dashboard
```

### Render

1. **New Web Service** → repo `erp-club-frontend-Web`
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Health Check Path:** `/health`

Puis dans le frontend (`.env.production`) :
```
VITE_API_URL=https://votre-analyste-api.onrender.com
```

Ou monter les routes sur le backend principal Render (`erp-club-backend`) en important `handleAnalysteRoute` depuis ce repo.

## Endpoints

| Route | Méthode | Description |
|-------|---------|-------------|
| `/analyste/dashboard` | GET | Intelligence Center |
| `/analyste/executive` | GET | KPIs direction |
| `/analyste/live-match` | GET | Live Match |
| `/analyste/prediction/teams` | GET | Liste équipes |
| `/analyste/prediction` | POST | Prédiction ML |
| `/analyste/ppi` | GET | Player PPI |
| `/analyste/chemistry` | GET | Team Chemistry |
| `/analyste/patterns` | GET | Deep Learning |
| `/analyste/tactical` | GET | Tactical Simulator |
| `/analyste/video-analysis` | GET | Video Center |
| `/analyste/opponent` | GET | Opponent Intel |
| `/analyste/fatigue` | GET | Fatigue Heatmap |
| `/analyste/whoop` | GET | WHOOP Wearables |
| `/analyste/injuries` | GET | Injury Lab |
| `/analyste/injury-forecast` | GET | Injury Forecast |
| `/analyste/transfer` | GET | Transfer Engine |
| `/analyste/market-value` | GET | Market Value |
| `/analyste/scouting` | GET | Scouting AI |
| `/analyste/evolution` | GET | Evolution Lab |
| `/analyste/training` | GET | Training Optimizer |
