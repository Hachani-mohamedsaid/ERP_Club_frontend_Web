import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { SQUAD_PLAYERS } from "../../data/joueurMockData";
import { MARKET_PLAYERS, SCOUT_RECOMMENDATIONS } from "../../data/joueurExtendedData";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";

function TransferGauge({ value }: { value: number }) {
  const color = value >= 70 ? "#2e9e5b" : value >= 40 ? "#d99a1f" : "#e0584a";
  return (
    <div className="text-center">
      <div className="relative mx-auto" style={{ width: 56, height: 56 }}>
        <svg width={56} height={56} className="-rotate-90">
          <circle cx={28} cy={28} r={22} fill="none" stroke="var(--surface-panel-border)" strokeWidth={5} />
          <motion.circle
            cx={28} cy={28} r={22} fill="none" stroke={color} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={2 * Math.PI * 22}
            initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - value / 100) }}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>Probabilité</p>
    </div>
  );
}

export function JoueurTransfersPage() {
  const { player } = useCurrentPlayer();
  const playerName = player?.name ?? "Ahmed Ben Salah";

  const TRANSFERS = [
    { id: "1", player: "Sami Jendoubi", type: "Sortant", club: "CS Sfaxien", value: "820K €", status: "Négociation", probability: 72 },
    { id: "2", player: "Rami Gharbi", type: "Sortant", club: "US Monastir", value: "540K €", status: "Offre reçue", probability: 85 },
    { id: "3", player: "Karim El Amri", type: "Entrant", club: "JS Kairouan", value: "600K €", status: "Scouting", probability: 45 },
    { id: "4", player: playerName, type: "Rumeur", club: "Al-Ahli", value: "3.5M €", status: "Intérêt", probability: 28 },
  ];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <GlassCard raised className="p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Entrants", value: 1, color: "var(--color-state-success)" },
            { label: "Sortants", value: 2, color: "var(--color-state-danger)" },
            { label: "Rumeurs", value: 1, color: "var(--color-state-warning)" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="space-y-3">
        {TRANSFERS.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="flex items-center gap-4 p-4">
              <ArrowRightLeft size={20} style={{ color: "var(--accent)" }} />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.player}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.type} → {t.club}</p>
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--color-state-success)" }}>{t.value}</span>
              <TransferGauge value={t.probability} />
              <AnimatedBadge tone={t.status === "Négociation" ? "warning" : "info"}>{t.status}</AnimatedBadge>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Marché — Joueurs disponibles</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {MARKET_PLAYERS.map((p) => (
              <motion.div key={p.id} whileHover={{ scale: 1.03 }} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position} • {p.club}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span style={{ color: "var(--color-state-success)" }}>{p.value}</span>
                  <span style={{ color: "var(--accent)" }}>OVR {p.ovr}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scouting — Recommandations</h3>
          <div className="space-y-3">
            {SCOUT_RECOMMENDATIONS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position} • {p.club} — {p.reason}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{p.match}%</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Match</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Fin de contrat proche</h3>
        <div className="space-y-2">
          {SQUAD_PLAYERS.filter((p) => p.availability === "Fin contrat").map((p) => (
            <div key={p.id} className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
              <span>{p.name}</span>
              <span style={{ color: "var(--color-state-warning)" }}>{p.contract.expiration}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
}
