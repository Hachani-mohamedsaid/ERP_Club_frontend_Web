import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain, Users, FileText, CheckCircle2, Clock, Star, ArrowRight,
  Calendar, MapPin, Loader2, AlertCircle, Inbox,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { ScoutPage, SKpi, SCard, SCOUT_TOOLTIP } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto } from "../../components/scout/ScoutPlayerPhoto";
import { S, PRIORITY_META, WORKFLOW_COLS } from "../../data/scoutData";
import { useScoutDashboard } from "../../hooks/useScoutData";
import { useAuth } from "../../contexts/AuthContext";

const CHART_COLORS = ["#FF7A00", "#6366F1", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

function withColors<T extends { fill?: string }>(items: T[]): T[] {
  return items.map((item, i) => ({ ...item, fill: CHART_COLORS[i % CHART_COLORS.length] }));
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Inbox size={28} style={{ color: "var(--text-muted)", opacity: 0.5 }} />
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

export function ScoutDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error, refresh } = useScoutDashboard();

  const kpis = data?.kpis;
  const clubName = data?.clubName ?? user?.organization?.clubName ?? "Club";
  const season = data?.season ?? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const byPos = withColors((data?.byPosition ?? []).map((p) => ({ name: p.name, v: p.v, fill: "" })));
  const byCountry = withColors((data?.byCountry ?? []).map((c) => ({ name: c.name, value: c.value, fill: "" })));
  const pipelineTrend = data?.pipelineTrend ?? [];
  const aiRecs = data?.aiRecs ?? [];
  const workflowCounts = data?.workflowCounts ?? {};
  const priorityCounts = data?.priorityCounts ?? { A: 0, B: 0, C: 0 };
  const spark = data?.sparklines;
  const ready = !loading && !!data;

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Tableau de Bord Scout
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Saison {season} · {clubName}
            {ready ? ` · ${kpis?.totalProspects ?? 0} prospects suivis` : ""}
            {loading ? " · chargement..." : ""}
            {ready && data?.aiPowered ? " · IA active" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
          >
            Actualiser
          </button>
          <motion.button
            type="button"
            onClick={() => navigate("/scout/search")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)`, boxShadow: `0 0 16px ${S.primary}40` }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            + Nouveau prospect
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs"
          style={{ borderColor: `${S.warning}40`, background: `${S.warning}10`, color: S.warning }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm" style={{ color: "var(--text-muted)" }}>
          <Loader2 size={18} className="animate-spin" />
          Chargement dashboard scout...
        </div>
      )}

      {ready && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SKpi
              label="Prospects observés"
              value={kpis?.totalProspects ?? 0}
              icon={Users}
              trend={kpis?.prospectsThisMonth != null ? { value: kpis.prospectsThisMonth, label: "ce mois" } : undefined}
              color={S.primary}
              sparkline={spark?.prospects}
              delay={0}
            />
            <SKpi
              label="Rapports créés"
              value={kpis?.reportsCount ?? 0}
              icon={FileText}
              trend={kpis?.reportsThisMonth != null ? { value: kpis.reportsThisMonth, label: "ce mois" } : undefined}
              color={S.success}
              sparkline={spark?.reports}
              delay={1}
            />
            <SKpi
              label="Validations"
              value={kpis?.validatedCount ?? 0}
              icon={CheckCircle2}
              trend={kpis?.validationsThisMonth != null ? { value: kpis.validationsThisMonth, label: "ce mois" } : undefined}
              color={S.success}
              sparkline={spark?.validations}
              delay={2}
            />
            <SKpi
              label="En cours"
              value={kpis?.inProgress ?? 0}
              icon={Clock}
              color={S.info}
              sparkline={spark?.inProgress}
              delay={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SKpi label="Potentiel moyen" value={`${kpis?.avgPotential ?? 0}/100`} color={S.success} delay={4} />
            <SKpi label="Âge moyen" value={`${kpis?.avgAge ?? 0} ans`} color={S.info} delay={5} />
            <SKpi
              label="Budget priorité A"
              value={`${((kpis?.priorityABudget ?? 0) / 1000).toFixed(1)}M €`}
              color={S.primary}
              trend={
                kpis?.budgetDeltaMK != null && kpis.budgetDeltaMK !== 0
                  ? { value: kpis.budgetDeltaMK, label: "M vs mois passé" }
                  : undefined
              }
              delay={6}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SCard glow>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pipeline mensuel</p>
              {pipelineTrend.length > 0 ? (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pipelineTrend}>
                      <defs>
                        <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={S.accent} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={S.accent} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={S.success} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={S.success} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...SCOUT_TOOLTIP} />
                      <Area type="monotone" dataKey="prospects" stroke={S.accent} fill="url(#pgGrad)" strokeWidth={2} name="Prospects" />
                      <Area type="monotone" dataKey="validated" stroke={S.success} fill="url(#valGrad)" strokeWidth={2} name="Validés" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyBlock label="Aucune donnée pipeline" />
              )}
            </SCard>

            <div className="grid grid-cols-2 gap-3">
              <SCard>
                <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Par poste</p>
                {byPos.length > 0 ? (
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byPos} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip {...SCOUT_TOOLTIP} />
                        <Bar dataKey="v" radius={[5, 5, 0, 0]} name="Prospects">
                          {byPos.map((entry, i) => (
                            <Cell key={entry.name} fill={entry.fill} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyBlock label="Aucun prospect" />
                )}
              </SCard>
              <SCard>
                <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Par pays</p>
                {byCountry.length > 0 ? (
                  <>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={byCountry} dataKey="value" innerRadius={28} outerRadius={52} paddingAngle={3}>
                            {byCountry.map((e) => (
                              <Cell key={e.name} fill={e.fill} />
                            ))}
                          </Pie>
                          <Tooltip {...SCOUT_TOOLTIP} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1 space-y-0.5 max-h-16 overflow-y-auto">
                      {byCountry.map((c) => (
                        <div key={c.name} className="flex items-center gap-1.5 text-[9px]">
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.fill }} />
                          <span style={{ color: "var(--text-muted)" }}>{c.name}</span>
                          <span className="ml-auto font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyBlock label="Aucune nationalité" />
                )}
              </SCard>
            </div>
          </div>

          <SCard>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statut pipeline</p>
            <div className="grid grid-cols-5 gap-2">
              {WORKFLOW_COLS.map((col) => {
                const count = workflowCounts[col.id] ?? 0;
                return (
                  <motion.div
                    key={col.id}
                    className="rounded-xl border p-3 text-center cursor-pointer"
                    style={{ background: col.bg, borderColor: `${col.color}30` }}
                    whileHover={{ scale: 1.04 }}
                    onClick={() => navigate("/scout/recruitment")}
                  >
                    <p className="text-xl font-extrabold" style={{ color: col.color }}>{count}</p>
                    <p className="text-[9px] font-semibold mt-0.5" style={{ color: col.color }}>{col.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </SCard>

          <SCard glow>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `linear-gradient(135deg,${S.accent},${S.primary})`, boxShadow: `0 0 20px ${S.accent}50` }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Brain size={18} className="text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  ODIN AI — Top 3 Recommandations
                  {data.aiPowered && (
                    <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full"
                      style={{ background: `${S.success}20`, color: S.success }}>
                      GPT
                    </span>
                  )}
                </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {data.recSource === "openai"
                ? "Analyse GPT · prospects réels DB"
                : "Scoring ODIN · potentiel + budget + pipeline"}
            </p>
              </div>
            </div>
            {aiRecs.length > 0 ? (
              <div className="space-y-3">
                {aiRecs.map((rec, i) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 rounded-[16px] border p-4 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.025)", borderColor: "var(--surface-panel-border)" }}
                    whileHover={{ borderColor: `${S.accent}40`, y: -2 }}
                    onClick={() => navigate(`/scout/prospect/${rec.id}`)}
                  >
                    <div className="relative shrink-0">
                      <ScoutPlayerPhoto name={rec.name} photoUrl={rec.photoUrl} size={44} accent={S.accent} />
                      <span className="absolute -top-1 -left-1 text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {rec.flag} {rec.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {rec.pos} · {rec.age} ans · {rec.club} · {rec.budget}
                          </p>
                        </div>
                        <div className="text-center shrink-0">
                          <p className="text-xl font-extrabold" style={{ color: S.accent }}>{rec.score}%</p>
                          <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Match IA</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {rec.reasons.map((r, ri) => (
                          <span
                            key={ri}
                            className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                            style={{ background: "rgba(34,197,94,0.1)", color: S.success, border: `1px solid ${S.success}20` }}
                          >
                            ✓ {r}
                          </span>
                        ))}
                        {rec.warn && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                            style={{ background: "rgba(245,158,11,0.1)", color: S.warning, border: `1px solid ${S.warning}20` }}
                          >
                            ⚠ {rec.warn}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={14} style={{ color: S.accent }} className="shrink-0 mt-1" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyBlock label="Aucune recommandation — ajoutez des prospects" />
            )}
          </SCard>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <SCard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Rapports récents</p>
              {data.recentReports?.length ? (
                <div className="space-y-2">
                  {data.recentReports.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs cursor-pointer"
                      style={{ borderColor: "var(--surface-panel-border)" }}
                      onClick={() => navigate("/scout/reports")}
                    >
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.prospectName}</p>
                        <p style={{ color: "var(--text-muted)" }}>{r.decision}</p>
                      </div>
                      {r.aiScore != null && (
                        <span className="font-bold" style={{ color: S.accent }}>{r.aiScore}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock label="Aucun rapport scout" />
              )}
            </SCard>

            <SCard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Missions à venir</p>
              {data.upcomingMissions?.length ? (
                <div className="space-y-2">
                  {data.upcomingMissions.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border px-3 py-2 text-xs cursor-pointer"
                      style={{ borderColor: "var(--surface-panel-border)" }}
                      onClick={() => navigate("/scout/missions")}
                    >
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{m.title}</p>
                      <div className="mt-1 flex flex-wrap gap-3" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(m.date).toLocaleDateString("fr-FR")}
                          {m.time ? ` · ${m.time}` : ""}
                        </span>
                        {m.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {m.location}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock label="Aucune mission planifiée" />
              )}
            </SCard>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(["A", "B", "C"] as const).map((p, i) => {
              const meta = PRIORITY_META[p];
              const count = priorityCounts[p] ?? 0;
              return (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-[20px] border p-4 cursor-pointer"
                  style={{ background: meta.bg, borderColor: `${meta.color}30` }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate("/scout/watchlist")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold" style={{ color: meta.color }}>{count}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: meta.color, color: "white" }}>
                      P.{p}
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-medium" style={{ color: meta.color }}>{meta.label}</p>
                </motion.div>
              );
            })}
          </div>

          <SCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} style={{ color: S.warning }} />
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Watchlist — {kpis?.watchlistCount ?? 0} joueur(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/scout/watchlist")}
                className="text-xs font-semibold"
                style={{ color: S.accent }}
              >
                Voir tout →
              </button>
            </div>
          </SCard>
        </>
      )}
    </ScoutPage>
  );
}
