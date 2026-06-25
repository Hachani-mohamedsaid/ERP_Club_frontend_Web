import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Brain, BarChart3, TrendingUp, CheckCircle, Sparkles, MessageSquare } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B", ai: "#6366F1" };

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  chart?: { type: "area" | "bar" | "line"; data: { label: string; val: number }[]; color: string; title: string };
}

type ChartType = "area" | "bar" | "line";

const SUGGESTIONS = [
  { icon: "👤", q: "Si nous recrutons un joueur à 2M DT, quel sera le budget restant?",   cat: "Recrutement" },
  { icon: "🤝", q: "Quel sponsor rapporte le plus ce mois?",                               cat: "Sponsors"    },
  { icon: "📊", q: "Prévoir les revenus des 6 prochains mois",                             cat: "Prévisions"  },
  { icon: "💰", q: "Quelle est la catégorie de dépense la plus importante?",              cat: "Analyse"     },
  { icon: "📈", q: "Comparaison budget réel vs budget prévu",                              cat: "Analyse"     },
  { icon: "⚡", q: "Recommandations pour optimiser les dépenses",                          cat: "Optimisation"},
];

const INIT_GREETING: Message = {
  id: "init",
  type: "ai",
  content: "Bonjour ! Je suis ODIN Finance AI — votre assistant intelligent pour l'analyse budgétaire du FC Carthage. Posez-moi une question sur les dépenses, revenus, sponsors ou prévisions, et je génère une réponse détaillée avec graphiques automatiques.",
  timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
};

function buildAIResponse(q: string): { content: string; chart?: Message["chart"] } {
  const lower = q.toLowerCase();

  if (lower.includes("prévoir") || lower.includes("revenu") || lower.includes("6 mois")) {
    return {
      content: "📈 Voici la prévision des revenus pour les 6 prochains mois, basée sur les tendances historiques et les contrats sponsors actifs :",
      chart: {
        type: "area" as ChartType,
        title: "Prévision Revenus 6 mois (K DT)",
        color: F.success,
        data: [
          { label: "Juil", val: 1680 }, { label: "Août", val: 1720 }, { label: "Sep", val: 1750 },
          { label: "Oct", val: 1800 }, { label: "Nov", val: 1850 }, { label: "Déc", val: 1950 },
        ],
      },
    };
  }
  if (lower.includes("recrut")) {
    return {
      content: "✅ Budget actuel : 9.8M DT · Utilisé : 7.7M DT · Restant : 2.1M DT\nAprès un recrutement à 2M DT, il vous resterait 0.1M DT de réserve. ⚠️ Risque budgétaire élevé — recommandation : négocier à 1.5M DT maximum.",
      chart: {
        type: "bar" as ChartType,
        title: "Impact recrutement sur le budget (M DT)",
        color: F.warning,
        data: [
          { label: "Budget total", val: 9.8 }, { label: "Utilisé", val: 7.7 },
          { label: "Restant", val: 2.1 }, { label: "Après recrut.", val: 0.1 },
        ],
      },
    };
  }
  if (lower.includes("dépense") || lower.includes("catégorie")) {
    return {
      content: "💼 La masse salariale représente 66% des dépenses — c'est la principale poste. Infrastructure 20%, Équipements 8%, Divers 6%.",
      chart: {
        type: "bar" as ChartType,
        title: "Répartition dépenses par catégorie (K DT)",
        color: F.danger,
        data: [
          { label: "Salaires", val: 520 }, { label: "Infra", val: 160 },
          { label: "Équipements", val: 64 }, { label: "Transport", val: 30 }, { label: "Divers", val: 48 },
        ],
      },
    };
  }
  if (lower.includes("sponsor")) {
    return {
      content: "🏆 Nike reste le sponsor principal avec 450K DT/an (+12%). Ooredoo expire dans 45 jours — action requise.",
      chart: {
        type: "bar" as ChartType,
        title: "Revenus sponsors (K DT / an)",
        color: F.primary,
        data: [
          { label: "Nike", val: 450 }, { label: "Emirates", val: 350 },
          { label: "Ooredoo", val: 280 }, { label: "STEG", val: 200 }, { label: "Attijari", val: 150 },
        ],
      },
    };
  }
  if (lower.includes("budget") || lower.includes("comparaison")) {
    return {
      content: "📊 Le budget réel suit le budget prévu avec un écart moyen de +3.5%. Juin a connu un pic de dépenses dû aux transferts.",
      chart: {
        type: "line" as ChartType,
        title: "Budget réel vs prévu (M DT)",
        color: F.info,
        data: [
          { label: "Jan", val: 8.0 }, { label: "Fév", val: 8.5 }, { label: "Mar", val: 9.2 },
          { label: "Avr", val: 8.8 }, { label: "Mai", val: 10.2 }, { label: "Jun", val: 9.8 },
        ],
      },
    };
  }
  if (lower.includes("optim")) {
    return {
      content: "⚡ Top 3 optimisations :\n1. Renégociation contrats fournisseurs → +50K DT/mois\n2. Groupage déplacements transport → +10K DT/mois\n3. Renouvellement Ooredoo tôt → garantit 280K DT/an\n\nÉconomies potentielles : 85K DT/mois → 1.02M DT/an 💰",
    };
  }
  return {
    content: `Analyse de « ${q} » en cours...\n\nBasé sur les données financières de la saison 2025-2026, le club est dans une position saine avec un ratio revenus/dépenses de 1.12. Consultez les rapports détaillés pour approfondir cette analyse.`,
  };
}

export function FinanceAIPage() {
  const [messages, setMessages] = useState<Message[]>([INIT_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = (text?: string) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    const id = msgCount;
    setMsgCount(c => c + 1);
    setMessages(prev => [...prev, { id: `u${id}`, type: "user", content: q, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const { content, chart } = buildAIResponse(q);
      setMessages(prev => [...prev, { id: `a${id}`, type: "ai", content, chart, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
      setLoading(false);
    }, 900 + Math.random() * 400);
  };

  const liveQuestions = messages.filter(m => m.type === "user").length;
  const liveReports   = messages.filter(m => m.chart).length;
  const liveAnalyses  = messages.filter(m => m.type === "ai").length;

  const KPI_STATS = [
    { label: "Questions aujourd'hui", value: (12 + liveQuestions).toString(),   icon: MessageSquare, color: F.info    },
    { label: "Précision IA",          value: "96%",                               icon: CheckCircle,   color: F.success },
    { label: "Rapports générés",      value: (27 + liveReports).toString(),       icon: BarChart3,     color: F.primary },
    { label: "Budget analysé",        value: liveAnalyses > 3 ? `${(12.5 + liveAnalyses * 0.1).toFixed(1)}M DT` : "12.5M DT", icon: TrendingUp, color: F.warning },
  ];

  return (
    <motion.div className="h-full space-y-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}
            animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <Brain size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>ODIN Finance AI</h1>
            <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Assistant intelligent · FC Carthage</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold" style={{ color: F.success }}>En ligne</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KPI_STATS.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i} className="rounded-[16px] border p-3"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={11} style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{k.label}</p>
              <p className="text-lg font-extrabold" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        {/* Chat area */}
        <div className="flex flex-col rounded-[22px] border overflow-hidden"
          style={{ background: "rgba(8,6,24,0.92)", borderColor: "rgba(255,255,255,0.07)", minHeight: "520px" }}>

          {/* Chat messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "440px" }}>
            <AnimatePresence initial={false}>
              {messages.map(msg => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} gap-2`}>
                  {msg.type === "ai" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5"
                      style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}>
                      <Sparkles size={11} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[72%] ${msg.type === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                    <div className="rounded-[16px] px-4 py-3"
                      style={{
                        background: msg.type === "user"
                          ? `linear-gradient(135deg,${F.primary},${F.primary}cc)`
                          : "rgba(255,255,255,0.05)",
                        color: "white",
                        borderRadius: msg.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="mt-1 text-[9px] opacity-50">{msg.timestamp}</p>
                    </div>
                    {/* Auto-generated chart */}
                    {msg.chart && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="w-full rounded-[16px] border p-3"
                        style={{ background: "rgba(255,255,255,0.04)", borderColor: `${msg.chart.color}25` }}>
                        <p className="text-[9px] font-bold mb-2" style={{ color: msg.chart.color }}>
                          📊 {msg.chart.title}
                        </p>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            {msg.chart.type === "area" ? (
                              <AreaChart data={msg.chart.data.map(d => ({ name: d.label, v: d.val }))}>
                                <defs>
                                  <linearGradient id={`g${msg.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={msg.chart.color} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={msg.chart.color} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
                                <Area type="monotone" dataKey="v" stroke={msg.chart.color} fill={`url(#g${msg.id})`} strokeWidth={2} />
                              </AreaChart>
                            ) : msg.chart.type === "line" ? (
                              <LineChart data={msg.chart.data.map(d => ({ name: d.label, v: d.val }))}>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
                                <Line type="monotone" dataKey="v" stroke={msg.chart.color} strokeWidth={2.5} dot={{ fill: msg.chart.color, r: 3 }} />
                              </LineChart>
                            ) : (
                              <BarChart data={msg.chart.data.map(d => ({ name: d.label, v: d.val }))}>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
                                <Bar dataKey="v" fill={msg.chart.color} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading dots */}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}>
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-[16px] px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "18px 18px 18px 4px" }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: F.ai }}
                      animate={{ scale: [0.6, 1.2, 0.6] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <input type="text"
                placeholder="Posez une question financière... (ex: Prévoir revenus 6 mois)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                className="flex-1 rounded-xl border bg-transparent px-4 py-2 text-xs outline-none"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }} />
              <motion.button type="button"
                onClick={() => sendMessage()}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0"
                style={{ background: input.trim() ? `linear-gradient(135deg,${F.ai},${F.primary})` : "rgba(255,255,255,0.08)" }}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}>
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right: suggestions */}
        <div className="space-y-3">
          <div className="rounded-[20px] border p-4" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              💡 Questions suggérées
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button key={i} type="button"
                  onClick={() => sendMessage(s.q)}
                  className="w-full rounded-[14px] border p-3 text-left"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
                  whileHover={{ scale: 1.02, borderColor: `${F.primary}30`, background: `${F.primary}06` }}
                  whileTap={{ scale: 0.98 }}>
                  <div className="flex items-start gap-2">
                    <span className="text-sm shrink-0">{s.icon}</span>
                    <div>
                      <p className="text-[8px] font-bold mb-0.5" style={{ color: F.primary }}>{s.cat}</p>
                      <p className="text-[9px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>{s.q}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="rounded-[20px] border p-4" style={{ background: "rgba(8,6,24,0.88)", borderColor: `${F.ai}20` }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: F.ai }}>🤖 Capacités ODIN AI</p>
            <div className="space-y-1.5 text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {["Analyse budgétaire automatique","Graphiques générés en temps réel","Prévisions sur 6 mois","Alertes budget & sponsors","Recommandations optimisation"].map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full" style={{ background: F.ai }} />
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
