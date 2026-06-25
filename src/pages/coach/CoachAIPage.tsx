import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, Zap } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { SQUAD } from "../../data/coachData";

interface AIMessage { role: "user" | "ai"; text: string; cards?: AICard[] }
interface AICard { title: string; value: string; color: string; detail: string }

const QUICK_QUESTIONS = [
  "Qui doit jouer titulaire contre EST ?",
  "Quel joueur est le plus fatigué ?",
  "Recommandation pour la composition demain",
  "Risques blessures cette semaine",
  "Qui mérite d'être capitaine ?",
  "Performances des 6 derniers matchs",
];

function generateResponse(q: string): { text: string; cards?: AICard[] } {
  const ql = q.toLowerCase();
  if (ql.includes("fatigué") || ql.includes("fatigue")) {
    const sorted = [...SQUAD].sort((a, b) => b.fatigue - a.fatigue).slice(0, 3);
    return {
      text: `Les 3 joueurs avec la fatigue la plus élevée sont identifiés. Je recommande leur mise au repos ou une intensité réduite à l'entraînement demain.`,
      cards: sorted.map(p => ({
        title: p.name, value: `${p.fatigue}%`,
        color: p.fatigue > 60 ? "#EF4444" : "#F59E0B",
        detail: `${p.positionFull} · Forme: ${p.forme}/100`,
      })),
    };
  }
  if (ql.includes("titulaire") || ql.includes("composition")) {
    const best = [...SQUAD].filter(p => p.status === "Disponible").sort((a, b) => b.forme - a.forme).slice(0, 5);
    return {
      text: `Voici les 5 joueurs en meilleure forme actuellement. Ils devraient constituer le noyau de la composition pour le prochain match.`,
      cards: best.map((p, i) => ({
        title: p.name, value: `${p.forme}/100`,
        color: COACH_ACCENT,
        detail: `#${i + 1} · ${p.positionFull} · Fatigue: ${p.fatigue}%`,
      })),
    };
  }
  if (ql.includes("risque") || ql.includes("blessure")) {
    const risk = [...SQUAD].filter(p => p.fatigue > 45 || p.status === "Surveillance");
    return {
      text: `${risk.length} joueurs présentent un risque blessure modéré à élevé. Je recommande une consultation médicale préventive et une réduction de charge.`,
      cards: risk.slice(0, 4).map(p => ({
        title: p.name,
        value: p.status === "Blessé" ? "Blessé" : `Risque ${Math.min(99, Math.round(p.fatigue * 0.7 + 10))}%`,
        color: p.status === "Blessé" ? "#EF4444" : "#F59E0B",
        detail: `${p.positionFull} · Fatigue: ${p.fatigue}%${p.injury ? ` · ${p.injury}` : ""}`,
      })),
    };
  }
  if (ql.includes("capitaine")) {
    const best = [...SQUAD].filter(p => p.status === "Disponible").sort((a, b) => b.mental + b.odinScore - (a.mental + a.odinScore))[0];
    return {
      text: `Ma recommandation pour le capitanat est ${best.name}. Score mental le plus élevé (${best.mental}/100) avec un ODIN Score de ${best.odinScore}/100 — leadership naturel confirmé.`,
      cards: [{ title: best.name, value: `Mental ${best.mental}/100`, color: "#22C55E", detail: `${best.positionFull} · ODIN: ${best.odinScore}/100` }],
    };
  }
  if (ql.includes("performance") || ql.includes("match")) {
    return {
      text: `Analyse des 6 derniers matchs: FC Carthage est en très bonne forme avec une moyenne de 8.3/10 pour le collectif. Les milieux offensifs dominent les évaluations individuelles.`,
      cards: [
        { title: "Victoires",     value: "4/6",      color: "#22C55E", detail: "66% win rate" },
        { title: "Buts marqués",  value: "12",        color: COACH_ACCENT, detail: "Moy. 2.0 / match" },
        { title: "Buts encaissés",value: "5",         color: "#EF4444", detail: "Moy. 0.83 / match" },
        { title: "Top joueur",    value: "R. Zouaoui",color: "#8B5CF6", detail: "Moy. 8.4/10" },
      ],
    };
  }
  return { text: `Analyse en cours pour: "${q}". Voici mes observations basées sur les données actuelles de l'effectif FC Carthage Saison 2026.` };
}

export function CoachAIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: "ai", text: `Bonjour Coach Nabil ! 👋 Je suis votre assistant IA ODIN. Posez-moi n'importe quelle question sur votre effectif, vos tactiques ou la préparation de match.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const send = (q: string) => {
    if (!q.trim() || thinking) return;
    const userMsg: AIMessage = { role: "user", text: q };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const resp = generateResponse(q);
      setMessages(prev => [...prev, { role: "ai", ...resp }]);
      setThinking(false);
    }, 1400);
  };

  return (
    <CoachPageTransition>
      <div className="flex items-center gap-3">
        <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 30px ${COACH_ACCENT}50` }}
          animate={{ scale: [1,1.08,1], rotate: [0,5,-5,0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Brain size={22} className="text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>ODIN AI Coach</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Assistant intelligent · Analyse effectif & tactique</p>
        </div>
      </div>

      {/* Quick questions */}
      <CCard>
        <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Questions rapides</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(q => (
            <motion.button key={q} type="button" onClick={() => send(q)}
              className="rounded-full border px-3 py-1.5 text-[11px]"
              style={{ borderColor: `${COACH_ACCENT}30`, color: "var(--text-muted)", background: `${COACH_ACCENT}06` }}
              whileHover={{ borderColor: COACH_ACCENT, color: COACH_ACCENT, scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Zap size={9} className="inline mr-1" style={{ color: COACH_ACCENT }} />{q}
            </motion.button>
          ))}
        </div>
      </CCard>

      {/* Chat */}
      <CCard className="!p-4">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
                        style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}>
                        <Brain size={12} className="text-white" />
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: COACH_ACCENT }}>ODIN AI</span>
                    </div>
                  )}
                  <div className="rounded-2xl px-4 py-3"
                    style={{
                      background: msg.role === "user" ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.05)",
                      borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      color: msg.role === "user" ? "white" : "var(--text-secondary)",
                    }}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  {/* AI cards */}
                  {msg.cards && msg.cards.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.cards.map((card, ci) => (
                        <motion.div key={ci} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: ci * 0.08 }}
                          className="rounded-xl border p-3 min-w-[130px]"
                          style={{ background: `${card.color}08`, borderColor: `${card.color}25` }}>
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{card.title}</p>
                          <p className="text-lg font-extrabold mt-0.5" style={{ color: card.color }}>{card.value}</p>
                          <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{card.detail}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}>
                  <Loader2 size={12} className="text-white animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <motion.div key={i} className="h-2 w-2 rounded-full" style={{ background: COACH_ACCENT }}
                        animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border p-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: `${COACH_ACCENT}30` }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Posez une question sur votre effectif, tactique, match..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
          <motion.button type="button" onClick={() => send(input)} disabled={!input.trim() || thinking}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Send size={14} />
          </motion.button>
        </div>
      </CCard>
    </CoachPageTransition>
  );
}
