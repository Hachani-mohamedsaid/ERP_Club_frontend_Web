import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Plus, X, ChevronRight, Star, TrendingUp } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";

type Stage = "Détecté" | "Analysé" | "Shortlist" | "Scout confirmé" | "Offre" | "Contrat" | "Transfert";

const STAGES: Stage[] = ["Détecté", "Analysé", "Shortlist", "Scout confirmé", "Offre", "Contrat", "Transfert"];

const STAGE_COLORS: Record<Stage, string> = {
  "Détecté":        "#6B7280",
  "Analysé":        "#3B82F6",
  "Shortlist":      "#8B5CF6",
  "Scout confirmé": "#F59E0B",
  "Offre":          "#FF7A00",
  "Contrat":        "#22C55E",
  "Transfert":      "#10B981",
};

interface PipelinePlayer {
  id: string;
  name: string;
  position: string;
  club: string;
  country: string;
  flag: string;
  age: number;
  value: string;
  aiScore: number;
  stage: Stage;
  priority: "High" | "Medium" | "Low";
  note?: string;
}

const INITIAL_PLAYERS: PipelinePlayer[] = [
  { id: "pp1", name: "Ahmed Ali",       position: "BU",  club: "Académie Sfax",  country: "Tunisie", flag: "🇹🇳", age: 18, value: "1.2M€", aiScore: 94, stage: "Shortlist",      priority: "High",   note: "Priorité absolue" },
  { id: "pp2", name: "Yassine Khemiri", position: "MOC", club: "US Monastir",    country: "Tunisie", flag: "🇹🇳", age: 20, value: "2.1M€", aiScore: 89, stage: "Offre",          priority: "High",   note: "Offre envoyée 15 juin" },
  { id: "pp3", name: "Ibrahim Touré",   position: "DC",  club: "Maroc Pro",      country: "Maroc",   flag: "🇲🇦", age: 22, value: "1.5M€", aiScore: 86, stage: "Analysé",        priority: "Medium", note: "" },
  { id: "pp4", name: "Ryad Bouassem",   position: "MDF", club: "CRB Alger",      country: "Algérie", flag: "🇩🇿", age: 21, value: "1.1M€", aiScore: 84, stage: "Détecté",        priority: "Medium", note: "Scout Ahmed suit ce profil" },
  { id: "pp5", name: "Khalil Maatoug",  position: "LB",  club: "CS Sfax",        country: "Tunisie", flag: "🇹🇳", age: 24, value: "0.8M€", aiScore: 80, stage: "Scout confirmé", priority: "Low",    note: "" },
  { id: "pp6", name: "Sofiane Bellal",  position: "GK",  club: "Foot Connect FR",country: "France",  flag: "🇫🇷", age: 23, value: "1.8M€", aiScore: 85, stage: "Contrat",        priority: "High",   note: "Contrat en cours signature" },
  { id: "pp7", name: "Mohamed Camara",  position: "MDF", club: "Global Soccer",  country: "Sénégal", flag: "🇸🇳", age: 20, value: "2.0M€", aiScore: 88, stage: "Transfert",      priority: "High",   note: "Transfert finalisé" },
  { id: "pp8", name: "Nizar Ben Amor",  position: "DC",  club: "EST",            country: "Tunisie", flag: "🇹🇳", age: 25, value: "0.6M€", aiScore: 77, stage: "Détecté",        priority: "Low",    note: "" },
];

const PRIORITY_COLORS: Record<PipelinePlayer["priority"], string> = {
  High: "#EF4444", Medium: "#F59E0B", Low: "#6B7280",
};

function PlayerCard({ player, onMove, onRemove }: {
  player: PipelinePlayer;
  onMove: (id: string, dir: "left" | "right") => void;
  onRemove: (id: string) => void;
}) {
  const stageIdx = STAGES.indexOf(player.stage);
  return (
    <motion.div layout className="rounded-xl border p-3 cursor-grab active:cursor-grabbing"
      style={{ background: "rgba(14,10,35,0.85)", borderColor: "rgba(255,255,255,0.08)" }}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ borderColor: `${STAGE_COLORS[player.stage]}40`, y: -1 }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{player.flag}</span>
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: "var(--text-primary)" }}>{player.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{player.position} · {player.age}a</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical size={10} style={{ color: "var(--text-muted)" }} />
          <button type="button" onClick={() => onRemove(player.id)} className="rounded-md p-0.5"
            style={{ background: "rgba(239,68,68,0.12)" }}>
            <X size={9} style={{ color: "#EF4444" }} />
          </button>
        </div>
      </div>
      <p className="text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>{player.club}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold" style={{ color: "#22C55E" }}>{player.value}</span>
        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#8B5CF6" }}>
          <Star size={8} /> {player.aiScore}
        </span>
        <span className="text-[9px] rounded-full px-1.5 py-0.5"
          style={{ background: `${PRIORITY_COLORS[player.priority]}18`, color: PRIORITY_COLORS[player.priority] }}>
          {player.priority}
        </span>
      </div>
      {player.note && (
        <p className="text-[9px] rounded-lg px-2 py-1 mb-2"
          style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-muted)" }}>
          {player.note}
        </p>
      )}
      <div className="flex gap-1">
        <button type="button" disabled={stageIdx === 0} onClick={() => onMove(player.id, "left")}
          className="flex-1 rounded-lg py-1 text-[9px] font-medium disabled:opacity-30"
          style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
          ← Retour
        </button>
        <button type="button" disabled={stageIdx === STAGES.length - 1} onClick={() => onMove(player.id, "right")}
          className="flex-1 rounded-lg py-1 text-[9px] font-medium disabled:opacity-30"
          style={{ background: `${STAGE_COLORS[player.stage]}20`, color: STAGE_COLORS[player.stage] }}>
          Avancer →
        </button>
      </div>
    </motion.div>
  );
}

export function RecruteurPipelinePage() {
  const [players, setPlayers] = useState<PipelinePlayer[]>(INITIAL_PLAYERS);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPos, setNewPos] = useState("BU");

  const move = (id: string, dir: "left" | "right") => {
    setPlayers(prev => prev.map(p => {
      if (p.id !== id) return p;
      const idx = STAGES.indexOf(p.stage);
      const next = dir === "right" ? idx + 1 : idx - 1;
      if (next < 0 || next >= STAGES.length) return p;
      return { ...p, stage: STAGES[next] };
    }));
  };

  const remove = (id: string) => setPlayers(prev => prev.filter(p => p.id !== id));

  const addPlayer = () => {
    if (!newName.trim()) return;
    const np: PipelinePlayer = {
      id: `pp${Date.now()}`, name: newName, position: newPos, club: "—", country: "—", flag: "🌍",
      age: 22, value: "—", aiScore: 75, stage: "Détecté", priority: "Medium", note: "",
    };
    setPlayers(prev => [np, ...prev]);
    setNewName(""); setShowModal(false);
  };

  const byStage = (stage: Stage) => players.filter(p => p.stage === stage);

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Talent Pipeline</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {players.length} joueurs · Kanban de suivi du recrutement
          </p>
        </div>
        <motion.button type="button" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Ajouter joueur
        </motion.button>
      </div>

      {/* Stage summary chips */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map(s => {
          const count = byStage(s).length;
          return (
            <motion.div key={s} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{ background: `${STAGE_COLORS[s]}12`, borderColor: `${STAGE_COLORS[s]}30`, color: STAGE_COLORS[s] }}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                style={{ background: STAGE_COLORS[s] }}>{count}</span>
              {s}
            </motion.div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: `${STAGES.length * 200}px` }}>
          {STAGES.map(stage => (
            <div key={stage} className="flex w-[188px] shrink-0 flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center justify-between rounded-xl border px-3 py-2"
                style={{ background: `${STAGE_COLORS[stage]}10`, borderColor: `${STAGE_COLORS[stage]}30` }}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
                  <span className="text-[11px] font-bold" style={{ color: STAGE_COLORS[stage] }}>{stage}</span>
                </div>
                <span className="text-[10px] rounded-full px-1.5 py-0.5 font-bold"
                  style={{ background: `${STAGE_COLORS[stage]}20`, color: STAGE_COLORS[stage] }}>
                  {byStage(stage).length}
                </span>
              </div>
              {/* Cards */}
              <AnimatePresence mode="popLayout">
                {byStage(stage).map(p => (
                  <PlayerCard key={p.id} player={p} onMove={move} onRemove={remove} />
                ))}
              </AnimatePresence>
              {byStage(stage).length === 0 && (
                <div className="rounded-xl border border-dashed py-6 text-center"
                  style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                  <p className="text-[10px]">Vide</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span className="font-semibold">Priorité:</span>
        {(["High","Medium","Low"] as const).map(p => (
          <span key={p} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full inline-block" style={{ background: PRIORITY_COLORS[p] }} />
            {p}
          </span>
        ))}
        <span className="ml-2 flex items-center gap-1"><TrendingUp size={10} /> Cliquer les boutons pour avancer/reculer un joueur dans le pipeline</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Offres en cours",   value: byStage("Offre").length,    color: "#FF7A00" },
          { label: "Contrats signés",   value: byStage("Contrat").length,  color: "#22C55E" },
          { label: "Transferts faits",  value: byStage("Transfert").length, color: "#10B981" },
          { label: "Score IA moyen",    value: `${Math.round(players.reduce((a,p) => a + p.aiScore, 0) / players.length)}/100`, color: "#8B5CF6" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Ajouter joueur au pipeline</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={12} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Nom joueur</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: Ahmed Ben Ali"
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Poste</label>
                  <select value={newPos} onChange={e => setNewPos(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(10,8,28,0.95)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}>
                    {["BU","MOC","MDF","DC","LB","GK","ATT","LAT"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={addPlayer}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Plus size={12} className="inline mr-1" /> Ajouter
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow legend */}
      <div className="flex flex-wrap items-center gap-1 rounded-[16px] border p-4 text-[11px]"
        style={{ background: "rgba(14,10,35,0.6)", borderColor: "rgba(255,255,255,0.06)" }}>
        <span style={{ color: "var(--text-muted)" }}>Flux:</span>
        {STAGES.map((s, i) => (
          <span key={s} className="flex items-center gap-1">
            <span style={{ color: STAGE_COLORS[s] }}>{s}</span>
            {i < STAGES.length - 1 && <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />}
          </span>
        ))}
      </div>
    </RecruteurPageTransition>
  );
}
