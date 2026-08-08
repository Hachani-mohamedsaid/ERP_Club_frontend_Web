#!/usr/bin/env bash
# Copie le module API-Sports scout vers erp-club-backend (repo sibling)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="${BACKEND_ROOT:-$ROOT/../erp-club-backend}"
SRC="$ROOT/integrations/erp-club-backend/src/scout/api-football"

if [[ ! -d "$BACKEND/src" ]]; then
  echo "❌ Backend introuvable: $BACKEND"
  exit 1
fi

echo "→ Copie api-football scout vers $BACKEND/src/scout/api-football"
rm -rf "$BACKEND/src/scout/api-football"
mkdir -p "$BACKEND/src/scout/api-football"
cp -R "$SRC/"* "$BACKEND/src/scout/api-football/"

echo "→ Build backend..."
(cd "$BACKEND" && npm run build 2>&1 | tail -5)

echo ""
echo "✅ Module API-Sports scout intégré dans erp-club-backend."
echo "   Ajoutez API_FOOTBALL_KEY dans .env puis déployez sur Render."
