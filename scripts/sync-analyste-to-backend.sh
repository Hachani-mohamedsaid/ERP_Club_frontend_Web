#!/usr/bin/env bash
# Copie le module Analyste NestJS vers erp-club-backend (repo sibling)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="${BACKEND_ROOT:-$ROOT/../erp-club-backend}"
SRC="$ROOT/integrations/erp-club-backend/src/analyste"

if [[ ! -d "$BACKEND/src" ]]; then
  echo "❌ Backend introuvable: $BACKEND"
  echo "   Définir BACKEND_ROOT=/chemin/vers/erp-club-backend si besoin."
  exit 1
fi

echo "→ Copie analyste module vers $BACKEND/src/analyste"
rm -rf "$BACKEND/src/analyste"
mkdir -p "$BACKEND/src/analyste"
cp -R "$SRC/"* "$BACKEND/src/analyste/"

APP_MODULE="$BACKEND/src/app.module.ts"
if ! grep -q "AnalysteModule" "$APP_MODULE"; then
  python3 <<PY
from pathlib import Path
p = Path("$APP_MODULE")
text = p.read_text()
if "AnalysteModule" not in text:
    text = text.replace(
        "import { PlatformModule } from './platform/platform.module';",
        "import { PlatformModule } from './platform/platform.module';\nimport { AnalysteModule } from './analyste/analyste.module';",
    )
    text = text.replace(
        "    PlatformModule,\n  ],",
        "    PlatformModule,\n    AnalysteModule,\n  ],",
    )
    p.write_text(text)
    print("✓ app.module.ts mis à jour (AnalysteModule)")
else:
    print("• app.module.ts déjà à jour")
PY
fi

echo "→ Build backend..."
(cd "$BACKEND" && npm run build)

echo ""
echo "✅ Module Analyste intégré dans erp-club-backend."
echo "   Déployer: cd $BACKEND && git add src/analyste src/app.module.ts && git commit && git push"
