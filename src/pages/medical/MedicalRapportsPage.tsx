import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Brain,
  Download,
  FileSpreadsheet,
  Shield,
  RotateCcw,
  BarChart2,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";

const C = {
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
  orange: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.25)" },
  indigo: { main: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
};

const INJURY_TYPE_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#f59e0b",
  "#22c55e",
  "#8b5cf6",
  "#0d9488",
  "#6366f1",
];

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(14,10,35,0.95)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 10,
    color: "var(--text-primary)",
    fontSize: 12,
  },
};

const lsGet = <T,>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
};

interface InjuryRow {
  id: string;
  name: string;
  injury: string;
  bodyPart: string;
  returnDate: string;
  riskIA: number;
  createdAt?: string;
}

interface PlayerRow {
  id: string;
  fullName: string;
  position: string;
  status: string;
}

interface InjuryEvalStored {
  score?: number;
  data?: Record<string, unknown>;
}

const parseDate = (d: string): Date | null => {
  if (!d || d === "—") return null;
  if (d.includes("/")) {
    const [day, month, year] = d.split("/").map(Number);
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const daysRemaining = (returnDate: string): number => {
  const d = parseDate(returnDate);
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
};

const isOverdue = (returnDate: string): boolean => {
  const d = parseDate(returnDate);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const categorizeInjury = (injury: string): string => {
  const lower = (injury ?? "").toLowerCase();
  if (
    lower.includes("hamstring") ||
    lower.includes("ischio") ||
    lower.includes("musculaire") ||
    lower.includes("muscle")
  ) {
    return "Musculaire";
  }
  if (
    lower.includes("genou") ||
    lower.includes("cheville") ||
    lower.includes("articulaire") ||
    lower.includes("ligament")
  ) {
    return "Articulaire";
  }
  if (lower.includes("fracture") || lower.includes("os") || lower.includes("osseux")) {
    return "Osseux";
  }
  if (lower.includes("tendon") || lower.includes("tendineux")) return "Tendineux";
  if (lower.includes("épaule") || lower.includes("shoulder")) return "Épaule";
  if (lower.includes("dos") || lower.includes("back") || lower.includes("lombaire")) return "Dos";
  return "Autre";
};

const getMonthLabel = (dateStr: string): string => {
  const d = dateStr?.includes("/")
    ? (() => {
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day);
      })()
    : new Date(dateStr ?? "");

  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
};

const exportPDF = () => {
  window.print();
};

export function MedicalRapportsPage() {
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let injData: InjuryRow[] = [];
      let playersData: PlayerRow[] = [];

      try {
        const r = (await clubApi.getInjuries()) as { injured?: unknown[] };
        const raw = Array.isArray(r?.injured) ? r.injured : [];
        injData = raw.map((item, i) => {
          const row = item as Record<string, unknown>;
          return {
            id: String(row.id ?? `inj-${i}`),
            name: String(row.name ?? ""),
            injury: String(row.injury ?? row.injuryType ?? ""),
            bodyPart: String(row.bodyPart ?? "—"),
            returnDate: String(row.returnDate ?? "—"),
            riskIA: Number(row.riskIA ?? 0),
            createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
          };
        });
      } catch (e) {
        console.warn(e);
      }

      try {
        const raw = (await clubApi.getPlayers()) as unknown[];
        playersData = Array.isArray(raw)
          ? raw.map((p) => {
              const row = p as Record<string, unknown>;
              return {
                id: String(row.id ?? ""),
                fullName: String(row.fullName ?? row.name ?? ""),
                position: String(row.position ?? ""),
                status: String(row.status ?? ""),
              };
            })
          : [];
      } catch (e) {
        console.warn(e);
      }

      setInjuries(injData);
      setPlayers(playersData);
      setLoading(false);
    };
    load();
  }, []);

  const phases = useMemo(
    () => lsGet<Record<string, number>>("odin_reeducation_phases", {}),
    [],
  );
  const resolvedIds = useMemo(
    () => lsGet<string[]>("odin_resolved_injuries", []),
    [],
  );
  const evals = useMemo(
    () => lsGet<Record<string, InjuryEvalStored>>("odin_reeducation_evals", {}),
    [],
  );

  const totalPlayers = useMemo(() => players.length, [players]);

  const disponibles = useMemo(
    () =>
      players.filter((p) => (p.status ?? "").toUpperCase() === "DISPONIBLE").length,
    [players],
  );

  const blesses = useMemo(
    () => players.filter((p) => (p.status ?? "").toUpperCase() === "BLESSE").length,
    [players],
  );

  const totalInjuries = useMemo(() => injuries.length, [injuries]);

  const inReeducation = useMemo(() => {
    return injuries.filter((inj) => {
      const phase = phases[inj.id];
      const isResolved = resolvedIds.includes(inj.id);
      if (phase && (phase === 1 || phase === 2) && !isResolved) {
        return true;
      }
      if (!phase && !isResolved) {
        const player = players.find(
          (p) =>
            (p.fullName ?? "").toLowerCase().trim() ===
            (inj.name ?? "").toLowerCase().trim(),
        );
        return (player?.status ?? "").toUpperCase() === "BLESSE";
      }
      return false;
    }).length;
  }, [injuries, phases, resolvedIds, players]);

  const readyToReturn = useMemo(
    () =>
      injuries.filter(
        (inj) => phases[inj.id] === 3 || resolvedIds.includes(inj.id),
      ).length,
    [injuries, phases, resolvedIds],
  );

  const highRisk = useMemo(
    () => injuries.filter((inj) => Number(inj.riskIA ?? 0) >= 7).length,
    [injuries],
  );

  const availabilityPct = useMemo(() => {
    if (totalPlayers === 0) return 0;
    const pct = Math.round((disponibles / totalPlayers) * 100);
    return Number.isNaN(pct) ? 0 : pct;
  }, [disponibles, totalPlayers]);

  const newThisMonth = useMemo(() => {
    const now = new Date();
    return injuries.filter((inj) => {
      if (!inj.createdAt) return false;
      try {
        const d = new Date(inj.createdAt);
        if (Number.isNaN(d.getTime())) return false;
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } catch {
        return false;
      }
    }).length;
  }, [injuries]);

  const avgRecovery = useMemo(() => {
    const activeInjuries = injuries.filter((i) => !resolvedIds.includes(i.id));
    if (activeInjuries.length === 0) return 0;

    const vals = activeInjuries.map((i) => daysRemaining(i.returnDate));
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [injuries, resolvedIds]);

  const overdueCount = useMemo(
    () =>
      injuries.filter((inj) => {
        if (resolvedIds.includes(inj.id)) return false;
        return isOverdue(inj.returnDate);
      }).length,
    [injuries, resolvedIds],
  );

  const clearedThisMonth = resolvedIds.length;

  const rehabSuccessRate = useMemo(() => {
    if (totalInjuries === 0) return 0;
    const pct = Math.round((resolvedIds.length / totalInjuries) * 100);
    return Number.isNaN(pct) ? 0 : pct;
  }, [resolvedIds.length, totalInjuries]);

  const safeAvailabilityPct = Number.isNaN(availabilityPct) ? 0 : availabilityPct;
  const safeRehabSuccessRate = Number.isNaN(rehabSuccessRate) ? 0 : rehabSuccessRate;

  const injuryTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    injuries.forEach((inj) => {
      const cat = categorizeInjury(inj.injury);
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value], i) => ({
        name,
        value,
        color: INJURY_TYPE_COLORS[i % INJURY_TYPE_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [injuries]);

  const injuryTrendData = useMemo(() => {
    if (injuries.length === 0) return [];

    const monthCounts: Record<string, number> = {};
    injuries.forEach((inj) => {
      if (inj.createdAt) {
        const label = getMonthLabel(inj.createdAt);
        if (label !== "—") {
          monthCounts[label] = (monthCounts[label] ?? 0) + 1;
        }
      }
    });

    if (Object.keys(monthCounts).length === 0) {
      const label = new Date().toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      });
      monthCounts[label] = injuries.length;
    }

    return Object.entries(monthCounts).map(([month, blessures]) => ({
      month,
      blessures,
    }));
  }, [injuries]);

  const monthlyActivityData = useMemo(() => {
    if (injuries.length === 0) return [];

    const data: Record<string, { blessures: number; retours: number }> = {};

    injuries.forEach((inj) => {
      if (inj.createdAt) {
        const label = getMonthLabel(inj.createdAt);
        if (label !== "—") {
          if (!data[label]) data[label] = { blessures: 0, retours: 0 };
          data[label].blessures++;
        }
      }
      if (inj.returnDate && inj.returnDate !== "—") {
        const label = getMonthLabel(inj.returnDate);
        if (label !== "—") {
          if (!data[label]) data[label] = { blessures: 0, retours: 0 };
          data[label].retours++;
        }
      }
    });

    if (Object.keys(data).length === 0) {
      const label = new Date().toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      });
      data[label] = {
        blessures: injuries.length,
        retours: resolvedIds.length,
      };
    }

    return Object.entries(data).map(([month, vals]) => ({
      month,
      ...vals,
    }));
  }, [injuries, resolvedIds]);

  const aiInsights = useMemo(() => {
    const insights: {
      type: "warning" | "success" | "info" | "danger";
      icon: typeof AlertTriangle;
      title: string;
      desc: string;
      color: string;
    }[] = [];

    const highRiskPlayers = injuries.filter((i) => Number(i.riskIA ?? 0) >= 7);
    if (highRiskPlayers.length > 0) {
      insights.push({
        type: "danger",
        icon: AlertTriangle,
        title: `${highRiskPlayers.length} joueur(s) à risque élevé`,
        desc: highRiskPlayers.map((i) => i.name).join(", "),
        color: C.red.main,
      });
    }

    if (overdueCount > 0) {
      insights.push({
        type: "warning",
        icon: Clock,
        title: `${overdueCount} retour(s) en retard`,
        desc: injuries
          .filter((i) => isOverdue(i.returnDate) && !resolvedIds.includes(i.id))
          .map((i) => `${i.name} (${i.returnDate})`)
          .join(", "),
        color: C.amber.main,
      });
    }

    const readyToProgress = injuries.filter((inj) => {
      const evalData = evals[inj.id];
      const phase = phases[inj.id] ?? 1;
      if (!evalData || phase === 3) return false;
      const threshold = phase === 1 ? 85 : phase === 2 ? 90 : 95;
      return (evalData.score ?? 0) >= threshold;
    });
    if (readyToProgress.length > 0) {
      insights.push({
        type: "success",
        icon: CheckCircle2,
        title: `${readyToProgress.length} joueur(s) prêt(s) à progresser`,
        desc: readyToProgress.map((i) => i.name).join(", "),
        color: C.green.main,
      });
    }

    if (injuryTypeData.length > 0) {
      const top = injuryTypeData[0];
      if (top.value >= 2) {
        insights.push({
          type: "info",
          icon: Activity,
          title: `Blessures ${top.name} dominantes`,
          desc: `${top.value} cas — Renforcer la prévention sur cette zone`,
          color: C.blue.main,
        });
      }
    }

    if (availabilityPct < 50 && totalPlayers > 0) {
      insights.push({
        type: "danger",
        icon: Shield,
        title: "Disponibilité critique",
        desc: `Seulement ${Number.isNaN(availabilityPct) ? 0 : availabilityPct}% de l'effectif disponible`,
        color: C.red.main,
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "success",
        icon: CheckCircle2,
        title: "Effectif en bonne santé",
        desc: "Aucune alerte médicale détectée",
        color: C.green.main,
      });
    }

    return insights;
  }, [
    injuries,
    phases,
    evals,
    resolvedIds,
    overdueCount,
    availabilityPct,
    injuryTypeData,
    totalPlayers,
  ]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          padding: "80px 0",
        }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{
            color: "var(--text-muted)",
          }}
        />
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Chargement du rapport médical...
        </p>
      </div>
    );
  }

  if (players.length === 0 && injuries.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <Shield size={36} style={{ color: "var(--text-muted)" }} />
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Aucune donnée médicale disponible
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          Les statistiques apparaîtront lorsque l&apos;effectif et les blessures seront enregistrés.
        </p>
      </div>
    );
  }

  const kpis = [
    { label: "Total joueurs", value: totalPlayers, color: C.blue, icon: Users },
    { label: "Disponibles", value: disponibles, color: C.green, icon: CheckCircle2 },
    { label: "Blessés", value: blesses, color: C.red, icon: HeartPulse },
    { label: "En rééducation", value: inReeducation, color: C.amber, icon: Activity },
    { label: "Retour imminent", value: readyToReturn, color: C.teal, icon: TrendingUp },
    { label: "Risque élevé", value: highRisk, color: C.violet, icon: AlertTriangle },
    {
      label: "Disponibilité",
      value: `${safeAvailabilityPct}%`,
      color: C.orange,
      icon: Shield,
    },
  ];

  const injuryStats = [
    { label: "Total blessures", value: totalInjuries, color: C.red },
    { label: "Nouvelles ce mois", value: newThisMonth, color: C.amber },
    { label: "Moy. jours retour", value: `${avgRecovery}j`, color: C.blue },
    { label: "Retours en retard", value: overdueCount, color: C.violet },
    { label: "Libérés total", value: clearedThisMonth, color: C.green },
    {
      label: "Taux de réussite",
      value: `${safeRehabSuccessRate}%`,
      color: C.teal,
    },
  ];

  const rehabRows = [
    {
      label: "En rééducation actuellement",
      value: inReeducation,
      color: C.amber,
    },
    {
      label: "Phase 1 — Immobilisation",
      value: injuries.filter((i) => phases[i.id] === 1).length,
      color: C.blue,
    },
    {
      label: "Phase 2 — Renforcement",
      value: injuries.filter((i) => phases[i.id] === 2).length,
      color: C.violet,
    },
    {
      label: "Retour terrain (Phase 3)",
      value: injuries.filter((i) => phases[i.id] === 3).length,
      color: C.teal,
    },
    {
      label: "Libérés pour la compétition",
      value: resolvedIds.length,
      color: C.green,
    },
    {
      label: "Taux de réussite retour",
      value: `${safeRehabSuccessRate}%`,
      color: C.orange,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            Rapport Résumé
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 3,
            }}
          >
            Dashboard médical · Saison 2025/2026 · Mis à jour:{" "}
            {new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <motion.button
            type="button"
            onClick={exportPDF}
            whileHover={{ scale: 1.04 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              background: C.red.bg,
              border: `1px solid ${C.red.border}`,
              color: C.red.main,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Download size={13} /> PDF
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            onClick={() => {
              const rows = [
                ["Joueur", "Blessure", "Zone", "Retour", "Risque"],
                ...injuries.map((i) => [
                  i.name,
                  i.injury,
                  i.bodyPart,
                  i.returnDate,
                  `${i.riskIA * 10}%`,
                ]),
              ];
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rapport-medical.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              background: C.green.bg,
              border: `1px solid ${C.green.border}`,
              color: C.green.main,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={13} /> Excel
          </motion.button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          gap: 10,
        }}
      >
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              padding: "14px 12px",
              borderRadius: 14,
              background: k.color.bg,
              border: `1px solid ${k.color.border}`,
              borderTop: `3px solid ${k.color.main}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: `${k.color.main}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px",
              }}
            >
              <k.icon size={15} style={{ color: k.color.main }} />
            </div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: k.color.main,
                lineHeight: 1,
              }}
            >
              {k.value}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                marginTop: 5,
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {k.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <GlassCard raised className="p-5">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Activity size={14} style={{ color: C.red.main }} />
            Statistiques des blessures
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {injuryStats.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: s.color.bg,
                  border: `1px solid ${s.color.border}`,
                  borderLeft: `3px solid ${s.color.main}`,
                }}
              >
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: s.color.main,
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: 5,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-5">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <HeartPulse size={14} style={{ color: C.violet.main }} />
            Répartition des blessures
          </p>

          {injuryTypeData.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--text-muted)",
                fontSize: 13,
              }}
            >
              Aucune donnée disponible
            </div>
          ) : (
            <>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={injuryTypeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {injuryTypeData.map((e) => (
                        <Cell key={e.name} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 8,
                  justifyContent: "center",
                }}
              >
                {injuryTypeData.map((e) => (
                  <div
                    key={e.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: e.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                      }}
                    >
                      {e.name} ({e.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      <GlassCard raised className="p-5">
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <TrendingUp size={14} style={{ color: C.blue.main }} />
          Tendance des blessures
        </p>

        {injuryTrendData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-muted)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Données historiques disponibles après 1 mois d&apos;utilisation
          </div>
        ) : (
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={injuryTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
                <Line
                  type="monotone"
                  dataKey="blessures"
                  name="Blessures"
                  stroke={C.red.main}
                  strokeWidth={2.5}
                  dot={{
                    fill: C.red.main,
                    r: 4,
                    strokeWidth: 2,
                    stroke: "rgba(14,10,35,0.8)",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <GlassCard raised className="p-5">
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <BarChart2 size={14} style={{ color: C.teal.main }} />
          Activité médicale mensuelle
        </p>

        {monthlyActivityData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-muted)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Données historiques disponibles après 1 mois d&apos;utilisation
          </div>
        ) : (
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivityData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE.contentStyle} />
                <Legend
                  wrapperStyle={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                />
                <Bar
                  dataKey="blessures"
                  name="Blessures"
                  fill={C.red.main}
                  fillOpacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="retours"
                  name="Retours"
                  fill={C.green.main}
                  fillOpacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <GlassCard raised className="p-5">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <RotateCcw size={14} style={{ color: C.amber.main }} />
            Performance rééducation
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {rehabRows.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: item.color.bg,
                  border: `1px solid ${item.color.border}`,
                  borderLeft: `3px solid ${item.color.main}`,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: item.color.main,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-5">
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Brain size={14} style={{ color: C.violet.main }} />
            Recommandations IA
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {aiInsights.map((insight, i) => (
              <motion.div
                key={`${insight.title}-${i}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: `${insight.color}10`,
                  border: `1px solid ${insight.color}25`,
                  borderLeft: `3px solid ${insight.color}`,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: `${insight.color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <insight.icon size={14} style={{ color: insight.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 3,
                    }}
                  >
                    {insight.title}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {insight.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
