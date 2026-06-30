import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, HeartPulse, Clock, TrendingUp, Users, Loader2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { MONTHLY_INJURY_DATA } from "../../data/medicalMockData";
import { clubApi } from "../../lib/api/club";

const REPORT_TYPES = [
  { id: "1", title: "Rapport mensuel", desc: "Synthèse blessures et disponibilité — Juin 2026", type: "Mensuel" },
  { id: "2", title: "Rapport joueur", desc: "Dossier complet Ahmed Ben Salah", type: "Joueur" },
  { id: "3", title: "Rapport blessure", desc: "Analyse genou droit — Grade II", type: "Blessure" },
];

const INJURY_TYPE_COLORS = {
  Musculaire: "#e0584a",
  Articulaire: "#3a7bd5",
  Osseux: "#d99a1f",
  Tendineux: "#2e9e5b",
} as const;

type InjuryCategory = keyof typeof INJURY_TYPE_COLORS;

interface InjuredRow {
  id: string;
  injury: string;
  returnDate: string;
}

interface InjuryKpis {
  injured: number;
  available: number;
  avgRisk: number;
}

const LINE_CHART_DATA = MONTHLY_INJURY_DATA.map((d, i) => ({
  ...d,
  dispo: 70 + i * 2 + 3,
}));

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

function availabilityPercent(injured: number, available: number): number {
  const total = injured + available;
  if (total === 0) return 0;
  return Math.round((available / total) * 100);
}

function categorizeInjuryType(injury: string): InjuryCategory {
  const lower = injury.toLowerCase();
  if (
    lower.includes("hamstring")
    || lower.includes("ischio")
    || lower.includes("cuisse")
    || lower.includes("musculaire")
  ) {
    return "Musculaire";
  }
  if (
    lower.includes("genou")
    || lower.includes("cheville")
    || lower.includes("articulaire")
  ) {
    return "Articulaire";
  }
  if (
    lower.includes("os")
    || lower.includes("fracture")
    || lower.includes("osseux")
  ) {
    return "Osseux";
  }
  return "Tendineux";
}

function normalizeInjuryReport(raw: unknown): { kpis: InjuryKpis; injured: InjuredRow[] } {
  if (!raw || typeof raw !== "object") {
    return { kpis: { injured: 0, available: 0, avgRisk: 0 }, injured: [] };
  }
  const data = raw as Record<string, unknown>;
  const kpisRaw = (data.kpis ?? {}) as Record<string, number>;
  const list = Array.isArray(data.injured) ? data.injured : [];
  const injured = list.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      injury: String(row.injury ?? row.injuryType ?? ""),
      returnDate: String(row.returnDate ?? ""),
    };
  });
  return {
    kpis: {
      injured: Number(kpisRaw.injured ?? injured.length),
      available: Number(kpisRaw.available ?? 0),
      avgRisk: Number(kpisRaw.avgRisk ?? 0),
    },
    injured,
  };
}

function buildInjuryTypeData(injured: InjuredRow[]) {
  const counts: Record<InjuryCategory, number> = {
    Musculaire: 0,
    Articulaire: 0,
    Osseux: 0,
    Tendineux: 0,
  };
  for (const row of injured) {
    counts[categorizeInjuryType(row.injury)] += 1;
  }
  return (Object.keys(INJURY_TYPE_COLORS) as InjuryCategory[]).map((name) => ({
    name,
    value: counts[name],
    color: INJURY_TYPE_COLORS[name],
  }));
}

function averageReturnDays(injured: InjuredRow[]): number {
  const values = injured
    .map((row) => calcDaysRemaining(row.returnDate))
    .filter((days): days is number => days !== null);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, days) => sum + days, 0) / values.length);
}

export function MedicalRapportsPage() {
  const [kpis, setKpis] = useState<InjuryKpis>({ injured: 0, available: 0, avgRisk: 0 });
  const [injured, setInjured] = useState<InjuredRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clubApi.getInjuries();
      const normalized = normalizeInjuryReport(res);
      setKpis(normalized.kpis);
      setInjured(normalized.injured);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const availability = useMemo(
    () => availabilityPercent(kpis.injured, kpis.available),
    [kpis.injured, kpis.available],
  );

  const avgReturnDays = useMemo(() => averageReturnDays(injured), [injured]);
  const injuryTypeData = useMemo(() => buildInjuryTypeData(injured), [injured]);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Blessures actives", value: kpis.injured, icon: HeartPulse, color: "var(--color-state-danger)" },
          { label: "Temps moyen retour", value: `${avgReturnDays}j`, icon: Clock, color: "var(--color-state-warning)" },
          { label: "Retour terrain", value: `${availability}%`, icon: TrendingUp, color: "var(--color-state-success)" },
          { label: "Disponibilité", value: `${availability}%`, icon: Users, color: "var(--color-state-info)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <GlassCard key={label} raised className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="mt-2 text-2xl font-bold" style={{ color }}>{value}</p>
              </div>
              <Icon size={22} style={{ color }} />
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Blessures vs Retours</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_INJURY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="blessures" fill="#e0584a" name="Blessures" radius={[4, 4, 0, 0]} />
              <Bar dataKey="retours" fill="#2e9e5b" name="Retours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Types de blessures</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={injuryTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {injuryTypeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution disponibilité effectif</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={LINE_CHART_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
            <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} domain={[60, 100]} />
            <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="dispo" stroke="#3a7bd5" strokeWidth={2} dot={{ fill: "#3a7bd5" }} name="Disponibilité %" />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <GlassCard key={report.id} raised className="p-5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {report.type}
            </span>
            <h3 className="mt-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{report.title}</h3>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{report.desc}</p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1 text-xs"><Download size={14} /> PDF</Button>
              <Button className="flex-1 text-xs" variant="ghost"><FileSpreadsheet size={14} /> Excel</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
