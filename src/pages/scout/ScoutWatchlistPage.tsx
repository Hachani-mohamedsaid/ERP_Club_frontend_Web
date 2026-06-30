import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, CheckCircle2, Plus, Trash2, Eye } from "lucide-react";
import { ScoutPage, SCard, SBadge, SGauge } from "../../components/scout/ScoutUI";
import { S, PRIORITY_META, type Priority } from "../../data/scoutData";
import { useScoutWatchlist } from "../../hooks/useScoutData";
import { scoutApi } from "../../lib/api/scout";
import { showToast } from "../../components/scout/ScoutToast";

export function ScoutWatchlistPage() {
  const navigate = useNavigate();
  const { items, loading, refresh } = useScoutWatchlist();
  const [activePriority, setActivePriority] = useState<Priority | "ALL">("ALL");
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const priorities: Record<string, Priority> = Object.fromEntries(
    items.map((p) => [p.id, p.priority]),
  );

  const filtered = items.filter(
    (p) => activePriority === "ALL" || priorities[p.id] === activePriority,
  );

  const addNote = async (id: string) => {
    const text = noteInput[id]?.trim();
    if (!text) return;
    try {
      await scoutApi.addWatchlistNote(id, text);
      setNoteInput((prev) => ({ ...prev, [id]: "" }));
      await refresh();
      showToast("Note ajoutée ✓", "success");
    } catch {
      showToast("Erreur ajout note", "error");
    }
  };

  const removeNote = async (id: string, idx: number) => {
    try {
      await scoutApi.removeWatchlistNote(id, idx);
      await refresh();
    } catch {
      showToast("Erreur suppression note", "error");
    }
  };

  const cyclePriority = async (id: string) => {
    const order: Priority[] = ["A", "B", "C"];
    const cur = priorities[id] ?? "C";
    const next = order[(order.indexOf(cur) + 1) % order.length];
    try {
      await scoutApi.updateWatchlistPriority(id, next);
      await refresh();
    } catch {
      showToast("Erreur mise à jour priorité", "error");
    }
  };

  const totals = {
    A: filtered.filter((p) => priorities[p.id] === "A").length,
    B: filtered.filter((p) => priorities[p.id] === "B").length,
    C: filtered.filter((p) => priorities[p.id] === "C").length,
  };

  if (loading) {
    return (
      <ScoutPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement watchlist...</p>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Watchlist</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {items.length} joueur{items.length !== 1 ? "s" : ""} suivis avec priorité et notes privées
        </p>
      </div>

      {/* Priority tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {([["ALL", "Tous", "rgba(255,255,255,0.08)", "var(--text-muted)"], ["A", `Priorité A (${totals.A})`, PRIORITY_META.A.bg, PRIORITY_META.A.color], ["B", `Priorité B (${totals.B})`, PRIORITY_META.B.bg, PRIORITY_META.B.color], ["C", `Priorité C (${totals.C})`, PRIORITY_META.C.bg, PRIORITY_META.C.color]] as const).map(([key, label, bg, color]) => (
          <motion.button key={key} type="button" onClick={() => setActivePriority(key as typeof activePriority)}
            className="rounded-xl px-4 py-2 text-xs font-bold"
            style={{
              background: activePriority === key ? bg : "rgba(255,255,255,0.04)",
              color: activePriority === key ? color : "var(--text-muted)",
              border: `1px solid ${activePriority === key ? color + "40" : "transparent"}`,
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {label}
          </motion.button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["A", "B", "C"] as Priority[]).map(p => {
          const meta = PRIORITY_META[p];
          const count = items.filter(pr => priorities[pr.id] === p).length;
          return (
            <motion.div key={p} className="rounded-[18px] border p-3 text-center"
              style={{ background: meta.bg, borderColor: `${meta.color}25` }}
              whileHover={{ y: -2 }}>
              <p className="text-2xl font-extrabold" style={{ color: meta.color }}>{count}</p>
              <p className="text-[9px] font-bold mt-0.5" style={{ color: meta.color }}>{meta.label.split("—")[0]}</p>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <SCard className="!p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun joueur en watchlist. Ajoutez-en depuis la recherche.
          </p>
        </SCard>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const priority = PRIORITY_META[priorities[p.id] ?? "B"];
            const notes = p.notes ?? [];
            const isExpanded = expandedNotes.has(p.id);

            return (
              <SCard key={p.id} className="!p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}>
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {p.flag} {p.name}
                      </p>
                      <SBadge color={priority.color} bg={priority.bg}>P.{priorities[p.id]}</SBadge>
                      <SBadge color={S.info} bg={`${S.info}15`}>{p.position}</SBadge>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {p.age} ans · {p.club} · Potentiel {p.potential}
                    </p>
                    <div className="mt-2 max-w-xs">
                      <SGauge value={p.potential} color={S.primary} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button type="button" onClick={() => cyclePriority(p.id)}
                      className="rounded-xl border px-3 py-1.5 text-[10px] font-bold"
                      style={{ borderColor: `${priority.color}40`, color: priority.color }}
                      whileTap={{ scale: 0.95 }}>
                      <Pencil size={10} className="inline mr-1" />Priorité
                    </motion.button>
                    <motion.button type="button" onClick={() => navigate(`/scout/prospect/${p.id}`)}
                      className="rounded-xl border px-3 py-1.5 text-[10px] font-bold"
                      style={{ borderColor: `${S.info}40`, color: S.info }}
                      whileTap={{ scale: 0.95 }}>
                      <Eye size={10} className="inline mr-1" />Profil
                    </motion.button>
                  </div>
                </div>

                {/* Notes section */}
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <motion.button type="button" onClick={() => {
                    setExpandedNotes(prev => {
                      const n = new Set(prev);
                      if (n.has(p.id)) n.delete(p.id); else n.add(p.id);
                      return n;
                    });
                  }}
                    className="flex items-center gap-1.5 text-[10px] font-bold mb-2"
                    style={{ color: "var(--text-muted)" }}>
                    <CheckCircle2 size={11} /> Notes privées ({notes.length})
                  </motion.button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <div className="flex gap-2 mb-2">
                          <input value={noteInput[p.id] ?? ""} onChange={e => setNoteInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Ajouter une note..."
                            className="flex-1 rounded-xl border px-3 py-1.5 text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                            onKeyDown={e => e.key === "Enter" && void addNote(p.id)} />
                          <motion.button type="button" onClick={() => void addNote(p.id)}
                            className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                            style={{ background: S.primary }}
                            whileTap={{ scale: 0.95 }}>
                            <Plus size={12} />
                          </motion.button>
                        </div>
                        {notes.map((n, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-xl border px-3 py-2 mb-1.5"
                            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <span className="text-[9px] font-bold shrink-0 mt-0.5" style={{ color: S.primary }}>{n.date}</span>
                            <p className="flex-1 text-[11px]" style={{ color: "var(--text-muted)" }}>{n.text}</p>
                            <motion.button type="button" onClick={() => void removeNote(p.id, i)}
                              whileHover={{ scale: 1.2 }}>
                              <Trash2 size={11} style={{ color: S.danger }} />
                            </motion.button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </SCard>
            );
          })}
        </div>
      )}
    </ScoutPage>
  );
}
