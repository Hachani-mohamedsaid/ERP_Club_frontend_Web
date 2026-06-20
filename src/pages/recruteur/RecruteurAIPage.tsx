import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Brain } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { ParticlesField } from "../../components/recruteur/ParticlesField";
import { PlayerProfileDrawer } from "../../components/recruteur/PlayerProfileDrawer";
import { TypewriterText } from "../../components/analyste/TypewriterText";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { SCOUT_PLAYERS, AI_SEARCH_PRESETS, type ScoutPlayer } from "../../data/recruteurData";

export function RecruteurAIPage() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "results">("idle");
  const [results, setResults] = useState<ScoutPlayer[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const run = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setPhase("thinking");
    setTimeout(() => {
      const ranked = [...SCOUT_PLAYERS]
        .map((p) => ({ p, score: p.aiScore + Math.random() * 6 }))
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
      setResults(ranked);
      setPhase("results");
    }, 1800);
  };

  const drawerPlayer = drawerId ? SCOUT_PLAYERS.find((p) => p.id === drawerId) ?? null : null;

  return (
    <RecruteurPageTransition>
      <div
        className="relative overflow-hidden rounded-[24px] border p-8"
        style={{ background: "linear-gradient(135deg, rgba(20,15,45,0.95), rgba(15,29,58,0.9))", borderColor: "rgba(139,92,246,0.3)" }}
      >
        <ParticlesField count={30} />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 40px rgba(139,92,246,0.6)" }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain size={30} className="text-white" />
          </motion.div>
          <h1 className="mt-4 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>AI Recruitment Engine</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Décrivez le profil recherché — l'IA scanne la base mondiale et classe les meilleurs candidats.</p>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border p-2" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(139,92,246,0.3)" }}>
            <Sparkles size={18} className="ml-2" style={{ color: "#A855F7" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && run(query)}
              placeholder="Ex: Défenseur central, budget 500k, moins de 24 ans"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            <button type="button" onClick={() => run(query)} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}>
              <Send size={15} /> Lancer
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {AI_SEARCH_PRESETS.map((p) => (
              <button key={p} type="button" onClick={() => run(p)} className="rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-white/5" style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--text-muted)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "thinking" && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: "#8B5CF6" }} />
            <TypewriterText text="Analyse de 2 847 profils · Scoring IA en cours · Filtrage par compatibilité..." className="text-sm" style={{ color: "var(--text-muted)" }} />
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} style={{ color: "#A855F7" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Top {Math.min(results.length, 10)} candidats recommandés</h3>
            </div>
            <div className="space-y-2.5">
              {results.slice(0, 10).map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => setDrawerId(p.id)}
                  className="flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-colors hover:bg-white/5"
                  style={{ background: "rgba(15,29,58,0.85)", borderColor: i === 0 ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.05)" }}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <span className="w-6 text-center text-lg font-extrabold" style={{ color: i === 0 ? "#A855F7" : "var(--text-muted)" }}>{i + 1}</span>
                  <PlayerAvatar name={p.name} size={48} ring={false} className="!rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                    <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{p.countryFlag} {p.club} • {p.positionFull} • {p.age} ans • {p.value}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold" style={{ color: "#A855F7" }}>{p.aiScore}%</div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Match IA</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlayerProfileDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </RecruteurPageTransition>
  );
}
