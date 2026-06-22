import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, Send, Sparkles, SendHorizonal, AlertTriangle, CheckCircle2, TrendingUp, Heart, Zap } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PLAYER_DETAILS } from "../../data/preparateurData";

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>
      )}
    </span>
  );
}

interface RichCard {
  player: string; risk: number; reasons: string[]; recommendations: string[];
  ready?: boolean; color: string;
}

interface AIResponse {
  text: string; cards?: RichCard[];
}

const QUICK_QUESTIONS = [
  { icon: AlertTriangle, label: "Qui risque une blessure ?",   color: "#EF4444", key: "blessure"   },
  { icon: Heart,         label: "Qui doit récupérer ?",        color: "#FF7A00", key: "recuperer"  },
  { icon: CheckCircle2,  label: "Qui est prêt pour samedi ?",  color: "#22C55E", key: "pret"       },
  { icon: TrendingUp,    label: "Qui progresse le plus ?",     color: "#3B82F6", key: "progresse"  },
  { icon: Zap,           label: "Charge critique ce soir ?",   color: "#8B5CF6", key: "charge"     },
];

function getAIResponse(q: string): AIResponse {
  const lower = q.toLowerCase();

  if (lower.includes("blessure") || lower.includes("risque")) {
    return {
      text: "Analyse de risque effectuée pour l'ensemble de l'effectif FC Carthage :",
      cards: [
        { player: "Ahmed Ben Salah", risk: 82, color: "#EF4444",
          reasons: ["Fatigue élevée (85%)", "Charge semaine 92%", "Ischio-jambier droit actif"],
          recommendations: ["Réduire charge 20%", "Cryothérapie 15min", "Repos 48h obligatoire"] },
        { player: "Karim Dridi", risk: 58, color: "#FF7A00",
          reasons: ["Fatigue 78%", "Genou sous surveillance", "Charge 88% cette semaine"],
          recommendations: ["Massage préventif", "Réduire sprints demain", "Surveiller J1 séance"] },
        { player: "Youssef Trabelsi", risk: 45, color: "#F59E0B",
          reasons: ["En rééducation cheville", "Charge réduite (55%)"],
          recommendations: ["Maintien programme retour blessure", "Pas de match avant J+2 semaines"] },
      ],
    };
  }

  if (lower.includes("récupér") || lower.includes("recuper")) {
    return {
      text: "Joueurs nécessitant une attention particulière en récupération :",
      cards: [
        { player: "Ahmed Ben Salah", risk: 85, color: "#EF4444",
          reasons: ["Fatigue critique", "Charge maximale cette semaine"],
          recommendations: ["Cryo + repos 48h", "Hydratation 3L/j", "Éviter séance force"] },
        { player: "Karim Dridi", risk: 70, color: "#FF7A00",
          reasons: ["Fatigue 78%", "Tension musculaire genou"],
          recommendations: ["Massage 30min", "Mobilité légère", "Bain chaud 37°C"] },
        { player: "Mohamed Sassi", risk: 55, color: "#F59E0B",
          reasons: ["Fatigue modérée 62%"],
          recommendations: ["Hydratation renforcée", "Étirements 20min"] },
      ],
    };
  }

  if (lower.includes("prêt") || lower.includes("pret") || lower.includes("samedi")) {
    return {
      text: "Évaluation disponibilité pour le prochain match :",
      cards: [
        { player: "Ali Mansouri",  risk: 10, color: "#22C55E", ready: true,
          reasons: ["Fatigue faible (20%)", "Recovery 90%", "Forme optimale"],
          recommendations: ["Titulaire recommandé"] },
        { player: "Ridha Ammar",   risk: 15, color: "#22C55E", ready: true,
          reasons: ["Forme excellente", "Aucune douleur"],
          recommendations: ["Disponible 90min"] },
        { player: "Haddad",        risk: 8,  color: "#22C55E", ready: true,
          reasons: ["Gardien en pleine forme", "Récupération 88%"],
          recommendations: ["Disponible match"] },
        { player: "Ahmed Ben Salah", risk: 82, color: "#EF4444", ready: false,
          reasons: ["Risque blessure 82%", "Charge critique"],
          recommendations: ["Déconseillé — repos obligatoire"] },
      ],
    };
  }

  if (lower.includes("progress")) {
    return {
      text: "Analyse de progression de l'effectif sur les 4 dernières semaines :",
      cards: [
        { player: "Ali Mansouri", risk: 12, color: "#22C55E",
          reasons: ["+6% endurance sur 3 mois", "Vitesse max +2 km/h", "Note match +0.8"],
          recommendations: ["Maintenir intensité actuelle", "Passage niveau supérieur envisageable"] },
        { player: "Mohamed Sassi", risk: 20, color: "#3B82F6",
          reasons: ["+3% vitesse", "Sprints +8 par match"],
          recommendations: ["Ajouter pliométrie avancée"] },
        { player: "Sami Bouazizi", risk: 18, color: "#3B82F6",
          reasons: ["+4% force physique", "Stabilité technique accrue"],
          recommendations: ["Progresser vers charges plus élevées"] },
      ],
    };
  }

  if (lower.includes("charge") || lower.includes("ce soir")) {
    const critical = PLAYER_DETAILS.filter(p => p.charge >= 85);
    return {
      text: `${critical.length} joueur(s) en charge critique pour la séance du soir :`,
      cards: critical.map(p => ({
        player: p.name, risk: p.charge, color: p.charge >= 90 ? "#EF4444" : "#FF7A00",
        reasons: [`Charge ${p.charge}%`, `Fatigue ${p.fatigue}%`],
        recommendations: p.charge >= 90 ? ["Séance allégée obligatoire", "Pas de sprint"] : ["Surveiller pendant la séance"],
      })),
    };
  }

  return {
    text: `Analyse globale FC Carthage — Saison 2026 :\n\nCharge moyenne: 72% · 3 joueurs à risque · 5 disponibles pour match.\n\nPosez une question spécifique pour une analyse détaillée.`,
  };
}

export function PrepAIPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string; response?: AIResponse; typing?: boolean }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  function ask(q: string) {
    setChat(prev => [...prev, { role: "user", text: q }]);
    setThinking(true);
    setTimeout(() => {
      const response = getAIResponse(q);
      setThinking(false);
      setChat(prev => [...prev, { role: "ai", text: response.text, response, typing: true }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 900);
  }

  return (
    <PrepPageTransition className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <PrepKpiCard hover={false}>
        <div className="flex items-center gap-3">
          <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "rgba(99,102,241,0.18)" }}
            animate={{ boxShadow: ["0 0 0px #6366F100", "0 0 20px #6366F155", "0 0 0px #6366F100"] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles size={22} style={{ color: "#6366F1" }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>ODIN AI — Préparateur Physique</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse charge · Détection risque · Recommandations personnalisées</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <motion.div className="h-2 w-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-xs" style={{ color: "#22C55E" }}>En ligne</span>
          </div>
        </div>
      </PrepKpiCard>

      {/* Quick questions */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Questions rapides</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map(({ icon: Icon, label, color, key }) => (
            <motion.button key={key} type="button" onClick={() => ask(label)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ borderColor: `${color}30`, color, background: `${color}08` }}
              whileHover={{ scale: 1.04, background: `${color}15`, borderColor: `${color}50` }}
              whileTap={{ scale: 0.96 }}>
              <Icon size={11} />
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <PrepKpiCard hover={false} className="min-h-[400px]">
        <div className="mb-4 flex items-center gap-2">
          <Bot size={16} style={{ color: "#6366F1" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Conversation</span>
        </div>

        <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1 pb-2">
          {chat.length === 0 && (
            <motion.div className="flex flex-col items-center justify-center py-12"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "rgba(99,102,241,0.12)" }}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Sparkles size={24} style={{ color: "#6366F1" }} />
              </motion.div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Prêt à analyser votre effectif</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Utilisez les questions rapides ou posez votre question</p>
            </motion.div>
          )}

          <AnimatePresence>
            {chat.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "user" ? (
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm"
                    style={{ background: "rgba(99,102,241,0.18)", color: "var(--text-primary)" }}>
                    {msg.text}
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "rgba(99,102,241,0.18)" }}>
                        <Bot size={12} style={{ color: "#6366F1" }} />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                        style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-primary)" }}>
                        {msg.typing ? <TypingText text={msg.text} /> : msg.text}
                      </div>
                    </div>

                    {/* Rich player cards */}
                    {msg.response?.cards && msg.response.cards.length > 0 && (
                      <div className="ml-9 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {msg.response.cards.map((card, ci) => (
                          <motion.div key={ci} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + ci * 0.1 }}
                            className="rounded-2xl border p-3"
                            style={{ background: `${card.color}08`, borderColor: `${card.color}25` }}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{card.player}</p>
                              <div className="flex items-center gap-1.5">
                                {card.ready !== undefined && (
                                  <span className="text-[9px] font-bold rounded-full px-1.5 py-0.5"
                                    style={{ background: card.ready ? "#22C55E18" : "#EF444418", color: card.ready ? "#22C55E" : "#EF4444" }}>
                                    {card.ready ? "✓ Disponible" : "✗ Indisponible"}
                                  </span>
                                )}
                                <span className="text-lg font-extrabold" style={{ color: card.color }}>{card.risk}%</span>
                              </div>
                            </div>
                            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <motion.div className="h-full rounded-full" style={{ background: card.color }}
                                initial={{ width: 0 }} animate={{ width: `${card.risk}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + ci * 0.1 }} />
                            </div>
                            <div className="mb-2 space-y-0.5">
                              {card.reasons.map((r, ri) => (
                                <p key={ri} className="text-[10px]" style={{ color: "var(--text-muted)" }}>• {r}</p>
                              ))}
                            </div>
                            <div className="space-y-0.5">
                              {card.recommendations.map((r, ri) => (
                                <p key={ri} className="text-[10px] font-semibold" style={{ color: card.color }}>→ {r}</p>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {thinking && (
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(99,102,241,0.18)" }}>
                <Bot size={12} style={{ color: "#6366F1" }} />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm"
                style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                  Analyse données Catapult & Polar Team Pro...
                </motion.span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && input.trim()) { ask(input.trim()); setInput(""); } }}
            placeholder="Ex: Ahmed peut-il jouer samedi ? Qui doit récupérer ?"
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "var(--text-primary)" }} />
          <motion.button type="button" onClick={() => { if (input.trim()) { ask(input.trim()); setInput(""); } }}
            className="rounded-xl px-4 py-2.5"
            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", color: "white" }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            <Send size={16} />
          </motion.button>
        </div>
      </PrepKpiCard>

      {/* Quick actions */}
      <PrepKpiCard delay={0.1}>
        <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions rapides</p>
        <div className="flex flex-wrap gap-2">
          <motion.button type="button" onClick={() => navigate("/preparateur/charge")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}
            whileHover={{ scale: 1.04 }}>
            <SendHorizonal size={12} /> Charge équipe
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/preparateur/risques")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}
            whileHover={{ scale: 1.04 }}>
            <AlertTriangle size={12} /> Risques blessures
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/preparateur/programmes")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1" }}
            whileHover={{ scale: 1.04 }}>
            <Sparkles size={12} /> Créer programme
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/preparateur/comparaison")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}
            whileHover={{ scale: 1.04 }}>
            <TrendingUp size={12} /> Comparer joueurs
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/preparateur/wellness")}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
            whileHover={{ scale: 1.04 }}>
            <Heart size={12} /> Wellness équipe
          </motion.button>
        </div>
      </PrepKpiCard>
    </PrepPageTransition>
  );
}
