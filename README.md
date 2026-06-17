# ODIN ERP CLUB — Design System (Web)

Frontend foundation for ODIN ERP CLUB, built per the cahier des charges
(section 10 — Charte Graphique) with full light/dark mode and strict
glassmorphism. This is meant to be dropped into the real React app, not a
disposable mockup.

## Stack

- React 19 + TypeScript
- Vite 8 (build tool)
- Tailwind CSS v4 (CSS-first config — see `src/index.css`, no `tailwind.config.js`)
- lucide-react (icons, per cahier spec)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Structure

```
src/
  index.css                  Design tokens (@theme) + light/dark CSS vars
  styles/glass.css            Glassmorphism utility classes
  lib/theme.tsx                ThemeProvider + useTheme() hook (persists to localStorage)
  components/
    ui/                       Reusable primitives: GlassCard, Badge, Button, ThemeToggle
    dashboard/                Page-level composition: Sidebar, Topbar, KpiFormation,
                               PlayersTable, ContractAlerts, Dashboard
```

## Design tokens

All brand colors come straight from the cahier (section 10):

| Token            | Hex       | Usage                          |
|------------------|-----------|---------------------------------|
| `--color-odin-ink`    | `#1A1A2E` | Primary / dark surfaces   |
| `--color-odin-red`    | `#C0392B` | Accent, primary actions   |
| `--color-odin-text`   | `#4A4A4A` | Body text (light mode)    |
| `--color-odin-surface`| `#F2F4F6` | Light backgrounds          |
| `--color-odin-text-muted` | `#7F8C8D` | Secondary/meta text   |

These raw brand tokens feed into **semantic** tokens (`--text-primary`,
`--surface-canvas`, `--accent`, etc.) defined per theme in `:root` /
`[data-theme="dark"]`. Components should always consume the semantic
tokens, never the raw `--color-odin-*` values directly — that's what makes
the light/dark toggle work without touching component code.

## Theme toggle

`ThemeProvider` (in `src/lib/theme.tsx`) sets `data-theme="light"|"dark"`
on `<html>`, persists the choice to `localStorage`, and falls back to the
OS preference (`prefers-color-scheme`) on first load. Use `useTheme()` in
any component that needs to read or flip the theme.

## Glassmorphism

Three reusable classes in `src/styles/glass.css`:

- `.glass-panel` — frosted card (blur + translucent bg + hairline border + sheen)
- `.glass-panel--raised` — same, with a stronger shadow for emphasis (used for the
  KPI section)
- `.glass-nav` — heavier blur variant for the sidebar
- `.glass-input` — frosted form controls (search bar, buttons, club switcher)

The ambient `.odin-backdrop` element renders two soft, slowly-drifting blurred
blobs (accent red + ink) behind the glass panels — this is what the glass
is actually "frosting." It respects `prefers-reduced-motion`.

## Signature element — KPI formation

`KpiFormation.tsx` is the one deliberate visual risk in this system: instead
of generic stat cards in a row, the four headline KPIs (wins, active squad,
budget, injuries) are arranged on a faint pitch-marking SVG (touchline,
center circle, penalty boxes), echoing the product's subject matter — a
football club — without being literal or cheesy. Everything else in the UI
stays disciplined and standard so this one moment carries the visual identity.

## What's mocked vs real

Every component currently uses static sample data (players, contracts, KPIs)
matching the entities and modules defined in the cahier (section 9.3 and
section 5). When you wire up the NestJS/Prisma backend, swap the static
arrays in `PlayersTable.tsx`, `ContractAlerts.tsx`, and `KpiFormation.tsx`
for real API calls — the presentation layer (cards, badges, tables) is
already decoupled from the data.

## Not yet built

- Auth/login screens
- Multi-club switcher dropdown (currently a static button)
- Responsive breakpoints below tablet (cahier marks mobile native as
  out-of-scope for this version — see section 4.2)
- Arabic/RTL layout (cahier lists French/English/Arabic as a "Could" — US-29)
