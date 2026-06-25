import { motion } from "framer-motion";
import { ArrowRightLeft, TrendingUp } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useJoueurBackendData, type OrgProfile } from "../../hooks/useJoueurBackendData";

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

function statusTone(status: string): "warning" | "info" | "success" | "danger" {
  if (status === "Négociation") return "warning";
  if (status === "Offre reçue") return "success";
  if (status === "Intérêt" || status === "Rumeur") return "info";
  return "info";
}

export function JoueurTransfersPage() {
  const { transfers, squadPlayers, orgProfile } = useJoueurBackendData();
  const clubName = (orgProfile as OrgProfile | null)?.clubName ?? "FC Carthage";

  const outgoing = transfers.filter((t) => t.transferType === "Sortant");
  const incoming = transfers.filter((t) => t.transferType === "Entrant");
  const rumors = transfers.filter((t) => t.transferType === "Rumeur");

  // Players whose contracts might be expiring (low OVR as a proxy, or just pick a few)
  const contractWarningPlayers = squadPlayers
    .filter((p) => p.availability === "Fin contrat")
    .slice(0, 5);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Summary KPIs */}
      <GlassCard raised className="p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Entrants", value: incoming.length, color: "var(--color-state-success)" },
            { label: "Sortants", value: outgoing.length, color: "var(--color-state-danger)" },
            { label: "Rumeurs", value: rumors.length, color: "var(--color-state-warning)" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Transfer list */}
      {transfers.length === 0 ? (
        <GlassCard raised className="p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun transfert enregistré</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {transfers.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="flex items-center gap-4 p-4">
                <ArrowRightLeft size={20} style={{ color: "var(--accent)" }} />
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{t.playerName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.transferType} → {t.club}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--color-state-success)" }}>{t.value}</span>
                <TransferGauge value={t.probability} />
                <AnimatedBadge tone={statusTone(t.status)}>{t.status}</AnimatedBadge>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Market + Scouts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "var(--accent)" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Marché — Joueurs disponibles</h3>
          </div>
          {squadPlayers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {squadPlayers.slice(0, 4).map((p) => (
                <motion.div key={p.id} whileHover={{ scale: 1.03 }}
                  className="rounded-[var(--radius-odin-md)] border p-3"
                  style={{ borderColor: "var(--surface-panel-border)" }}>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position} • {clubName}</p>
                  <div className="mt-2 flex justify-between text-xs">
                    <span style={{ color: "var(--color-state-success)" }}>{p.marketValue}</span>
                    <span style={{ color: "var(--accent)" }}>OVR {p.ovr}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun joueur dans l'effectif</p>
          )}
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Scouting — Cibles potentielles</h3>
          {squadPlayers.length > 0 ? (
            <div className="space-y-3">
              {squadPlayers.slice(4, 8).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border p-3"
                  style={{ borderColor: "var(--surface-panel-border)" }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position} • Analyse en cours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold" style={{ color: "var(--accent)" }}>{Math.min(99, (p.ovr ?? 70) + 7)}%</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Match OVR</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune recommandation</p>
          )}
        </GlassCard>
      </div>

      {/* Fin de contrat */}
      {contractWarningPlayers.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Fin de contrat proche</h3>
          <div className="space-y-2">
            {contractWarningPlayers.map((p) => (
              <div key={p.id} className="flex justify-between text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>{p.name}</span>
                <span style={{ color: "var(--color-state-warning)" }}>Fin de contrat</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
