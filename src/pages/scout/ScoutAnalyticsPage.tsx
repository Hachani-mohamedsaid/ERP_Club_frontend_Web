import { useMemo } from "react";
import {
  BarChart3, TrendingUp, Globe, Target, DollarSign, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from "recharts";
import { ScoutPage, SCard, SKpi } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { useScoutProspects, useScoutDashboard } from "../../hooks/useScoutData";

const COLORS = [S.primary, S.info, S.success, "#8B5CF6", "#F59E0B", S.danger];

const MARKET_TREND = [
  { month: "Jan", budget: 2.1, signings: 1 },
  { month: "Fév", budget: 2.4, signings: 0 },
  { month: "Mar", budget: 3.2, signings: 2 },
  { month: "Avr", budget: 2.8, signings: 1 },
  { month: "Mai", budget: 4.1, signings: 1 },
  { month: "Jun", budget: 5.2, signings: 2 },
];

const AGE_DIST = [
  { range: "≤18", count: 0 },
  { range: "19-21", count: 0 },
  { range: "22-24", count: 0 },
  { range: "25+", count: 0 },
];

export function ScoutAnalyticsPage() {
  const { prospects } = useScoutProspects();
  const { data } = useScoutDashboard();

  const ageDist = useMemo(() => {
    const buckets = { "≤18": 0, "19-21": 0, "22-24": 0, "25+": 0 };
    prospects.forEach((p) => {
      if (p.age <= 18) buckets["≤18"]++;
      else if (p.age <= 21) buckets["19-21"]++;
      else if (p.age <= 24) buckets["22-24"]++;
      else buckets["25+"]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [prospects]);

  const valueByPos = useMemo(() => {
    const map: Record<string, number> = {};
    prospects.forEach((p) => {
      map[p.position] = (map[p.position] ?? 0) + p.valueMK;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value / 1000 * 10) / 10 }));
  }, [prospects]);

  const potTrend = prospects.slice(0, 6).map((p) => ({
    name: p.name.split(" ").pop() ?? p.name,
    potentiel: p.potential,
    ia: p.aiScore,
  }));

  const byCountry = data?.byCountry?.length
    ? data.byCountry.map((c, i) => ({ ...c, fill: COLORS[i % COLORS.length] }))
    : [];

  const byPosition = data?.byPosition?.length
    ? data.byPosition.map((p, i) => ({ name: p.name, v: p.v, fill: COLORS[i % COLORS.length] }))
    : [];

  const totalValue = prospects.reduce((a, p) => a + p.valueMK, 0);

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <BarChart3 size={20} style={{ color: S.primary }} /> Analytics & Intelligence Marché
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Tendances pipeline, répartition géographique et analyse budgétaire
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SKpi label="Pipeline total" value={prospects.length} icon={Users} color={S.primary} delay={0} />
        <SKpi label="Valeur pipeline" value={`${(totalValue / 1000).toFixed(1)}M€`} icon={DollarSign} color={S.success} delay={1} />
        <SKpi label="Potentiel moyen" value={data?.kpis.avgPotential ?? "—"} icon={TrendingUp} color={S.accent} delay={2} />
        <SKpi label="Pays couverts" value={byCountry.length || "—"} icon={Globe} color={S.info} delay={3} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Position distribution */}
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Target size={14} style={{ color: S.primary }} /> Répartition par poste
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPosition} barSize={28}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
                <Bar dataKey="v" radius={[6, 6, 0, 0]}>
                  {byPosition.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SCard>

        {/* Country pie */}
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Globe size={14} style={{ color: S.info }} /> Origine géographique
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCountry} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {byCountry.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SCard>

        {/* Age distribution */}
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Pyramide des âges</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDist.length ? ageDist : AGE_DIST} layout="vertical" barSize={16}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis type="category" dataKey="range" tick={{ fill: "var(--text-muted)", fontSize: 9 }} width={40} />
                <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
                <Bar dataKey="count" fill={S.accent} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SCard>

        {/* Value by position */}
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Valeur marché par poste (M€)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByPos}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
                <Bar dataKey="value" fill={S.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SCard>
      </div>

      {/* Potential vs IA */}
      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Potentiel vs Score IA par joueur</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={potTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
              <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
              <Line type="monotone" dataKey="potentiel" stroke={S.primary} strokeWidth={2} dot={{ fill: S.primary }} name="Potentiel" />
              <Line type="monotone" dataKey="ia" stroke={S.accent} strokeWidth={2} dot={{ fill: S.accent }} name="Score IA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SCard>

      {/* Budget trend */}
      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Tendance budget recrutement (M€)</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MARKET_TREND}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={S.primary} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={S.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
              <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
              <Area type="monotone" dataKey="budget" stroke={S.primary} fill="url(#budgetGrad)" strokeWidth={2} name="Budget (M€)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SCard>
    </ScoutPage>
  );
}
