import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Activity, Zap, Loader2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { getInitials } from "../../data/medicalMockData";
import { clubApi } from "../../lib/api/club";

type RiskLevel = "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";

interface ApiPlayer {
  id: string;
  fullName: string;
  position: string;
}

interface InjuredRow {
  id: string;
  name: string;
  injury: string;
  riskIA: number;
  returnDate: string;
}

interface RiskPlayer {
  id: string;
  name: string;
  position: string;
  riskScore: number;
  level: RiskLevel;
  reasons: { label: string; impact: number }[];
}

function normalizePlayers(raw: unknown): ApiPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      fullName: String(row.fullName ?? row.name ?? ""),
      position: String(row.position ?? "—"),
    };
  });
}

function normalizeInjured(raw: unknown): InjuredRow[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as Record<string, unknown>;
  const list = Array.isArray(data.injured) ? data.injured : [];
  return list.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      name: String(row.name ?? ""),
      injury: String(row.injury ?? row.injuryType ?? ""),
      riskIA: Number(row.riskIA ?? 0),
      returnDate: String(row.returnDate ?? ""),
    };
  });
}

function parseReturnDate(returnDate: string): Date | null {
  if (!returnDate || returnDate === "—") return null;
  if (returnDate.includes("/")) {
    const parts = returnDate.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
  }
  const isoMatch = returnDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(returnDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function calcDaysRemaining(returnDate: string): number | null {
  const target = parseReturnDate(returnDate);
  if (!target) return null;
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function findPlayerPosition(name: string, players: ApiPlayer[]): string {
  const key = name.trim().toLowerCase();
  const match = players.find((player) => player.fullName.trim().toLowerCase() === key);
  return match?.position || "—";
}

function buildRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= 75) return "HIGH RISK";
  if (riskScore >= 50) return "MEDIUM RISK";
  return "LOW RISK";
}

function buildReasons(injury: InjuredRow): { label: string; impact: number }[] {
  const reasons: { label: string; impact: number }[] = [
    { label: injury.injury, impact: injury.riskIA * 8 },
  ];

  const daysRemaining = calcDaysRemaining(injury.returnDate);
  if (daysRemaining !== null && daysRemaining > 20) {
    reasons.push({ label: "Blessure longue durée", impact: 25 });
  } else if (daysRemaining !== null && daysRemaining <= 5) {
    reasons.push({ label: "Retour imminent", impact: 15 });
  } else {
    reasons.push({ label: "Surveillance recommandée", impact: 18 });
  }

  return reasons;
}

function buildRiskPlayers(injured: InjuredRow[], players: ApiPlayer[]): RiskPlayer[] {
  return injured
    .map((row) => {
      const riskScore = row.riskIA * 10;
      return {
        id: row.id,
        name: row.name,
        position: findPlayerPosition(row.name, players),
        riskScore,
        level: buildRiskLevel(riskScore),
        reasons: buildReasons(row),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 75 ? "#c0392b" : score >= 50 ? "#d99a1f" : "#2e9e5b";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--surface-panel-border)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transformOrigin: "60px 60px", rotate: -90 }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold" style={{ color }}>{score}%</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Risk Score</p>
      </div>
    </div>
  );
}

function HeatmapCell({ value, label }: { value: number; label: string }) {
  const intensity = value / 100;
  const bg = value >= 75
    ? `rgba(192, 57, 43, ${0.2 + intensity * 0.6})`
    : value >= 50
    ? `rgba(217, 154, 31, ${0.2 + intensity * 0.5})`
    : `rgba(46, 158, 91, ${0.2 + intensity * 0.4})`;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-[var(--radius-odin-md)] p-3 text-center"
      style={{ background: bg }}
    >
      <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}%</p>
      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

export function MedicalRiskPage() {
  const [riskPlayers, setRiskPlayers] = useState<RiskPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [injuriesRes, playersRes] = await Promise.all([
        clubApi.getInjuries(),
        clubApi.getPlayers(),
      ]);
      const injured = normalizeInjured(injuriesRes);
      const players = normalizePlayers(playersRes);
      setRiskPlayers(buildRiskPlayers(injured, players));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const topPlayer = useMemo(
    () => riskPlayers[0] ?? null,
    [riskPlayers],
  );

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  if (riskPlayers.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Aucun joueur à risque
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {riskPlayers.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard
              raised
              className="relative overflow-hidden p-5"
              style={{
                borderTop: `3px solid ${player.riskScore >= 75 ? "#c0392b" : player.riskScore >= 50 ? "#d99a1f" : "#2e9e5b"}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  >
                    {getInitials(player.name)}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.position}</p>
                  </div>
                </div>
                <AnimatedBadge tone={player.riskScore >= 75 ? "danger" : player.riskScore >= 50 ? "warning" : "success"}>
                  {player.level}
                </AnimatedBadge>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold" style={{ color: player.riskScore >= 75 ? "#c0392b" : player.riskScore >= 50 ? "#d99a1f" : "#2e9e5b" }}>
                    {player.riskScore}%
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Risque global</p>
                </div>
                <AlertTriangle size={28} style={{ color: player.riskScore >= 75 ? "#c0392b" : "#d99a1f", opacity: 0.6 }} />
              </div>
              <div className="mt-4 space-y-2">
                {player.reasons.map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                      <span style={{ color: "var(--text-muted)" }}>{r.impact}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
                      <div className="h-full rounded-full" style={{ width: `${r.impact}%`, background: "var(--accent)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="flex flex-col items-center p-6">
          <h3 className="mb-4 self-start text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Gauge — {topPlayer?.name}
          </h3>
          <RiskGauge score={topPlayer?.riskScore ?? 0} />
          <div className="mt-4 flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Faible</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Moyen</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Élevé</span>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heatmap — Facteurs de risque</h3>
          <div className="grid grid-cols-3 gap-2">
            <HeatmapCell value={82} label="Fatigue" />
            <HeatmapCell value={75} label="Charge" />
            <HeatmapCell value={68} label="Historique" />
            <HeatmapCell value={55} label="Flexibilité" />
            <HeatmapCell value={48} label="Sommeil" />
            <HeatmapCell value={42} label="Nutrition" />
            <HeatmapCell value={35} label="Hydratation" />
            <HeatmapCell value={28} label="Récupération" />
            <HeatmapCell value={22} label="Stress" />
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          {[
            { icon: Activity, label: "Charge moyenne", value: "847 UA" },
            { icon: TrendingUp, label: "Tendance", value: "+12% cette semaine" },
            { icon: Zap, label: "Alertes actives", value: `${riskPlayers.length} joueur${riskPlayers.length > 1 ? "s" : ""}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={18} style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
