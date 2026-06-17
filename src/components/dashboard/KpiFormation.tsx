import type { LucideIcon } from "lucide-react";
import { Trophy, Users, Wallet, HeartPulse } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface KpiNode {
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down" | "flat";
  icon: LucideIcon;
  /** position on the pitch, percentage based */
  top: string;
  left: string;
}

const KPI_NODES: KpiNode[] = [
  {
    label: "Victoires (saison)",
    value: "14/18",
    delta: "+3 vs N-1",
    deltaTone: "up",
    icon: Trophy,
    top: "8%",
    left: "50%",
  },
  {
    label: "Effectif actif",
    value: "27",
    delta: "2 en attente",
    deltaTone: "flat",
    icon: Users,
    top: "42%",
    left: "14%",
  },
  {
    label: "Budget restant",
    value: "184 200 DT",
    delta: "−6% ce mois",
    deltaTone: "down",
    icon: Wallet,
    top: "42%",
    left: "86%",
  },
  {
    label: "Joueurs blessés",
    value: "3",
    delta: "1 en rééducation",
    deltaTone: "flat",
    icon: HeartPulse,
    top: "82%",
    left: "50%",
  },
];

const DELTA_COLOR: Record<KpiNode["deltaTone"], string> = {
  up: "var(--color-state-success)",
  down: "var(--color-state-danger)",
  flat: "var(--text-muted)",
};

export function KpiFormation() {
  return (
    <GlassCard raised className="relative overflow-hidden p-6">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Indicateurs clés
        </h2>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Mis à jour il y a 12 min
        </span>
      </div>

      {/* Pitch markings — subtle, structural, not decorative-for-its-own-sake */}
      <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-xl">
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect
            x="8"
            y="8"
            width="384"
            height="284"
            rx="12"
            fill="none"
            stroke="var(--surface-panel-border)"
            strokeWidth="1.5"
          />
          <line
            x1="8"
            y1="150"
            x2="392"
            y2="150"
            stroke="var(--surface-panel-border)"
            strokeWidth="1.5"
          />
          <circle
            cx="200"
            cy="150"
            r="38"
            fill="none"
            stroke="var(--surface-panel-border)"
            strokeWidth="1.5"
          />
          <rect
            x="140"
            y="8"
            width="120"
            height="46"
            fill="none"
            stroke="var(--surface-panel-border)"
            strokeWidth="1.5"
          />
          <rect
            x="140"
            y="246"
            width="120"
            height="46"
            fill="none"
            stroke="var(--surface-panel-border)"
            strokeWidth="1.5"
          />
        </svg>

        {KPI_NODES.map(({ label, value, delta, deltaTone, icon: Icon, top, left }) => (
          <div
            key={label}
            className="glass-panel absolute flex w-[168px] -translate-x-1/2 -translate-y-1/2 flex-col gap-1 p-3"
            style={{ top, left }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-odin-sm)]"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <Icon size={14} strokeWidth={2.2} />
              </div>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {value}
              </span>
              <span
                className="text-[11px] font-medium"
                style={{ color: DELTA_COLOR[deltaTone] }}
              >
                {delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
