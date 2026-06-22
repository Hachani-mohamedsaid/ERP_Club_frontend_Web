import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Pencil, X, CheckCircle2, Plus, Trash2, Eye } from "lucide-react";
import { ScoutPage, SCard, SBadge, SGauge } from "../../components/scout/ScoutUI";
import { PROSPECTS, S, PRIORITY_META, type Priority } from "../../data/scoutData";

type NoteEntry = { date: string; text: string };

export function ScoutWatchlistPage() {
  const navigate = useNavigate();
  const [activePriority, setActivePriority] = useState<Priority | "ALL">("ALL");
  const [notesMap, setNotesMap] = useState<Record<string, NoteEntry[]>>(
    Object.fromEntries(PROSPECTS.map(p => [p.id, [...p.notes]]))
  );
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [priorities, setPriorities] = useState<Record<string, Priority>>(
    Object.fromEntries(PROSPECTS.map(p => [p.id, p.priority]))
  );

  const filtered = PROSPECTS.filter(p =>
    activePriority === "ALL" || priorities[p.id] === activePriority
  );

  const addNote = (id: string) => {
    const text = noteInput[id]?.trim();
    if (!text) return;
    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    setNotesMap(prev => ({ ...prev, [id]: [{ date: today, text }, ...(prev[id] ?? [])] }));
    setNoteInput(prev => ({ ...prev, [id]: "" }));
  };

  const removeNote = (id: string, idx: number) => {
    setNotesMap(prev => ({ ...prev, [id]: prev[id].filter((_, i) => i !== idx) }));
  };

  const cyclePriority = (id: string) => {
    const order: Priority[] = ["A", "B", "C"];
    setPriorities(prev => {
      const cur = prev[id] ?? "C";
      const next = order[(order.indexOf(cur) + 1) % order.length];
      return { ...prev, [id]: next };
    });
  };

  const totals = { A: filtered.filter(p => priorities[p.id] === "A").length, B: filtered.filter(p => priorities[p.id] === "B").length, C: filtered.filter(p => priorities[p.id] === "C").length };

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Watchlist</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Joueurs suivis avec priorité et notes privées
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
          const count = PROSPECTS.filter(pr => priorities[pr.id] === p).length;
          return (
            <motion.div key={p} className="rounded-[18px] border p-3 text-center"
              style={{ background: meta.bg, borderColor: `${meta.color}30` }}
              whileHover={{ scale: 1.04 }}>
              <p className="text-xl font-extrabold" style={{ color: meta.color }}>{count}</p>
              <p className="text-[10px] font-semibold" style={{ color: meta.color }}>Priorité {p}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Player cards with notes */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => {
            const priority = priorities[p.id];
            const meta = PRIORITY_META[priority];
            const notes = notesMap[p.id] ?? [];
            const showNotes = expandedNotes.has(p.id);
            return (
              <motion.div key={p.id} layout
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-[20px] border overflow-hidden"
                style={{ background: "rgba(12,9,30,0.85)", borderColor: `${meta.color}20` }}>
                {/* Header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg,${S.primary},S.primary)` }}>
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.flag} {p.name}</p>
                      <motion.button type="button" onClick={() => cyclePriority(p.id)}
                        className="rounded-full px-2 py-0.5 text-[9px] font-black shrink-0"
                        style={{ background: meta.color, color: "white" }}
                        whileHover={{ scale: 1.1 }} title="Cliquer pour changer priorité">
                        P.{priority}
                      </motion.button>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {p.position} · {p.age} ans · {p.club} · {p.marketValue}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <SGauge value={p.potential} color={meta.color} />
                      <span className="text-[10px] font-bold shrink-0" style={{ color: meta.color }}>{p.potential}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <motion.button type="button" onClick={() => navigate(`/scout/prospect/${p.id}`)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border"
                      style={{ borderColor: `${S.primary}40`, color: S.primary }}
                      whileHover={{ scale: 1.12 }}>
                      <Eye size={12} />
                    </motion.button>
                    <motion.button type="button"
                      onClick={() => setExpandedNotes(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: showNotes ? `${meta.color}50` : "rgba(255,255,255,0.1)",
                        color: showNotes ? meta.color : "var(--text-muted)",
                        background: showNotes ? `${meta.color}10` : "transparent",
                      }}
                      whileHover={{ scale: 1.12 }}>
                      <Pencil size={11} />
                    </motion.button>
                  </div>
                </div>

                {/* Notes panel */}
                <AnimatePresence>
                  {showNotes && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="p-4 pt-3">
                        {/* Add note */}
                        <div className="flex items-center gap-2 mb-3">
                          <input value={noteInput[p.id] ?? ""} onChange={e => setNoteInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && addNote(p.id)}
                            placeholder="Note privée scout... (Entrée pour valider)"
                            className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.09)", color: "var(--text-primary)" }} />
                          <motion.button type="button" onClick={() => addNote(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl"
                            style={{ background: `${meta.color}20`, color: meta.color }}
                            whileHover={{ scale: 1.1 }}>
                            <Plus size={12} />
                          </motion.button>
                        </div>
                        {/* Notes list */}
                        {notes.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {notes.map((note, ni) => (
                              <motion.div key={ni} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="group flex items-start gap-2 rounded-xl border px-3 py-2"
                                style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: meta.color }} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold mb-0.5" style={{ color: "var(--text-muted)" }}>{note.date}</p>
                                  <p className="text-xs" style={{ color: "var(--text-primary)" }}>{note.text}</p>
                                </div>
                                <motion.button type="button" onClick={() => removeNote(p.id, ni)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  whileHover={{ scale: 1.2 }}>
                                  <X size={10} style={{ color: S.danger }} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-xs py-3" style={{ color: "var(--text-muted)" }}>
                            Aucune note — saisissez votre première observation
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ScoutPage>
  );
}
