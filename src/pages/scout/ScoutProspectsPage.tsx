import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Eye, GitCompare, Filter } from "lucide-react";
import { ScoutPage, SCard, SBadge, SGauge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto } from "../../components/scout/ScoutPlayerPhoto";
import { S, PRIORITY_META, WORKFLOW_COLS } from "../../data/scoutData";
import { useScoutProspects } from "../../hooks/useScoutData";
import type { WorkflowStatus } from "../../data/scoutData";

const VIEWS = ["Grille", "Liste"] as const;

export function ScoutProspectsPage() {
  const navigate = useNavigate();
  const { prospects, loading, watchlistIds } = useScoutProspects();
  const [view, setView] = useState<(typeof VIEWS)[number]>("Grille");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"potential" | "aiScore" | "age" | "value">("potential");

  const filtered = useMemo(() => {
    let list = [...prospects];
    if (statusFilter !== "ALL") list = list.filter((p) => p.status === statusFilter);
    list.sort((a, b) => {
      if (sort === "potential") return b.potential - a.potential;
      if (sort === "aiScore") return b.aiScore - a.aiScore;
      if (sort === "age") return a.age - b.age;
      return b.valueMK - a.valueMK;
    });
    return list;
  }, [prospects, statusFilter, sort]);

  if (loading) {
    return (
      <ScoutPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des profils...</p>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <LayoutGrid size={20} style={{ color: S.primary }} /> Annuaire des profils
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {filtered.length} fiches · saison 2026-2027 · photos réelles
          </p>
        </div>
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <motion.button key={v} type="button" onClick={() => setView(v)}
              className="rounded-xl px-3 py-1.5 text-[10px] font-bold"
              style={{
                background: view === v ? S.primary : "rgba(255,255,255,0.05)",
                color: view === v ? "white" : "var(--text-muted)",
              }}
              whileTap={{ scale: 0.95 }}>
              {v}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={12} style={{ color: "var(--text-muted)" }} />
        <motion.button type="button" onClick={() => setStatusFilter("ALL")}
          className="rounded-full px-3 py-1 text-[10px] font-bold"
          style={{ background: statusFilter === "ALL" ? S.primary : "rgba(255,255,255,0.05)", color: statusFilter === "ALL" ? "white" : "var(--text-muted)" }}>
          Tous
        </motion.button>
        {WORKFLOW_COLS.map((col) => (
          <motion.button key={col.id} type="button" onClick={() => setStatusFilter(col.id)}
            className="rounded-full px-3 py-1 text-[10px] font-bold"
            style={{
              background: statusFilter === col.id ? col.bg : "rgba(255,255,255,0.05)",
              color: statusFilter === col.id ? col.color : "var(--text-muted)",
              border: "1px solid var(--surface-panel-border)",
            }}
            whileTap={{ scale: 0.95 }}>
            {col.label}
          </motion.button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto rounded-xl border px-3 py-1.5 text-[10px] font-bold outline-none"
          style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
          <option value="potential">Tri: Potentiel</option>
          <option value="aiScore">Tri: Score IA</option>
          <option value="age">Tri: Âge</option>
          <option value="value">Tri: Valeur</option>
        </select>
      </div>

      {view === "Grille" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => {
            const priority = PRIORITY_META[p.priority];
            const wf = WORKFLOW_COLS.find((c) => c.id === p.status);
            const inWatch = watchlistIds.has(p.id);
            return (
              <motion.div
                key={p.id}
                className="rounded-[20px] border p-4 cursor-pointer"
                style={{
                  background: "rgba(12,9,30,0.92)",
                  borderColor: inWatch ? `${S.danger}30` : "rgba(255,255,255,0.07)",
                }}
                whileHover={{ y: -4, borderColor: `${S.primary}40` }}
                onClick={() => navigate(`/scout/prospect/${p.id}`)}
              >
                <div className="flex items-start justify-between">
                  <ScoutPlayerPhoto name={p.name} photoUrl={p.photoUrl} size={56} accent={S.primary} />
                  {inWatch && (
                    <span className="text-[9px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: `${S.danger}15`, color: S.danger }}>♥ Watchlist</span>
                  )}
                </div>
                <p className="text-sm font-extrabold mt-3" style={{ color: "var(--text-primary)" }}>
                  {p.flag} {p.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {p.position} · {p.age} ans · {p.club}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <SBadge color={priority.color} bg={priority.bg}>P.{p.priority}</SBadge>
                  {wf && <SBadge color={wf.color} bg={wf.bg}>{wf.label}</SBadge>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                    <p className="text-lg font-extrabold" style={{ color: S.primary }}>{p.potential}</p>
                    <SGauge value={p.potential} color={S.primary} />
                  </div>
                  <div>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Score IA</p>
                    <p className="text-lg font-extrabold" style={{ color: S.accent }}>{p.aiScore}</p>
                    <SGauge value={p.aiScore} color={S.accent} />
                  </div>
                </div>
                <p className="text-[10px] font-bold mt-2 text-center" style={{ color: S.primary }}>{p.marketValue}</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const priority = PRIORITY_META[p.priority];
            return (
              <motion.div key={p.id}
                className="flex flex-wrap items-center gap-4 rounded-[16px] border p-3 cursor-pointer"
                style={{ background: "rgba(12,9,30,0.85)", borderColor: "var(--surface-panel-border)" }}
                whileHover={{ borderColor: `${S.primary}35` }}
                onClick={() => navigate(`/scout/prospect/${p.id}`)}>
                <ScoutPlayerPhoto name={p.name} photoUrl={p.photoUrl} size={40} accent={S.primary} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.flag} {p.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{p.position} · {p.club}</p>
                </div>
                <SBadge color={priority.color} bg={priority.bg}>P.{p.priority}</SBadge>
                <p className="text-sm font-extrabold w-12 text-center" style={{ color: S.primary }}>{p.potential}</p>
                <p className="text-sm font-extrabold w-12 text-center" style={{ color: S.accent }}>{p.aiScore}</p>
                <p className="text-xs font-bold w-20 text-right" style={{ color: "var(--text-muted)" }}>{p.marketValue}</p>
                <motion.button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/scout/comparison?ids=${p.id}`); }}
                  className="rounded-xl p-2" style={{ color: S.info }}
                  whileTap={{ scale: 0.9 }}>
                  <GitCompare size={14} />
                </motion.button>
                <Eye size={14} style={{ color: "var(--text-muted)" }} />
              </motion.div>
            );
          })}
        </div>
      )}
    </ScoutPage>
  );
}
