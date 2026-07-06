import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Brain, BarChart3, TrendingUp, CheckCircle, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { financeApi, type FinanceAiMeta, type FinanceAiChart } from "../lib/api/finance";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B", ai: "#6366F1" };

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  chart?: FinanceAiChart;
}

const SUGGESTION_META = [
  { icon: "👤", cat: "Recrutement" },
  { icon: "🤝", cat: "Sponsors" },
  { icon: "📊", cat: "Prévisions" },
  { icon: "💰", cat: "Analyse" },
  { icon: "📈", cat: "Analyse" },
  { icon: "⚡", cat: "Optimisation" },
];

export function FinanceAIPage() {
  const [meta, setMeta] = useState<FinanceAiMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [kpiOverride, setKpiOverride] = useState<{ questionsToday: number; reportsGenerated: number } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    financeApi
      .getAi()
      .then((data) => {
        setMeta(data);
        setMessages([
          {
            id: "init",
            type: "ai",
            content: data.greeting,
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      })
      .catch(() => {
        setMessages([
          {
            id: "init",
            type: "ai",
            content: "Bonjour ! Je suis ODIN Finance AI. Posez-moi une question sur le budget, les revenus ou les sponsors.",
            timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      })
      .finally(() => setMetaLoading(false));
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    const id = msgCount + 1;
    setMsgCount(id);
    setMessages((prev) => [
      ...prev,
      {
        id: `u${id}`,
        type: "user",
        content: q,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await financeApi.chatAi(q);
      setKpiOverride(res.kpiStats);
      setMessages((prev) => [
        ...prev,
        {
          id: `a${id}`,
          type: "ai",
          content: res.text,
          chart: res.chart ?? undefined,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur assistant IA";
      setMessages((prev) => [
        ...prev,
        {
          id: `a${id}`,
          type: "ai",
          content: msg,
          timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, msgCount]);

  const liveQuestions = messages.filter((m) => m.type === "user").length;
  const liveReports = messages.filter((m) => m.chart).length;

  const kpiStats = meta?.kpiStats;
  const questionsToday = kpiOverride?.questionsToday ?? (kpiStats ? kpiStats.questionsToday + liveQuestions : liveQuestions);
  const reportsGenerated = kpiOverride?.reportsGenerated ?? (kpiStats ? kpiStats.reportsGenerated + liveReports : liveReports);
  const budgetAnalyzed = kpiStats?.budgetAnalyzed ?? "—";

  const KPI_STATS = [
    { label: "Questions aujourd'hui", value: questionsToday.toString(), icon: MessageSquare, color: F.info },
    { label: "Précision IA", value: kpiStats?.aiAccuracy ?? "96%", icon: CheckCircle, color: F.success },
    { label: "Rapports générés", value: reportsGenerated.toString(), icon: BarChart3, color: F.primary },
    { label: "Budget analysé", value: budgetAnalyzed, icon: TrendingUp, color: F.warning },
  ];

  const suggestions = meta?.suggestedQuestions ?? [
    "Si nous recrutons un joueur à 2M DT, quel sera le budget restant?",
    "Quel sponsor rapporte le plus ce mois?",
    "Prévoir les revenus des 6 prochains mois",
    "Quelle est la catégorie de dépense la plus importante?",
    "Comparaison budget réel vs budget prévu",
    "Recommandations pour optimiser les dépenses",
  ];

  const statusLabel =
    meta?.status === "available" ? "En ligne" :
    meta?.status === "no_key" ? "Mode local" :
    meta?.status === "disabled" ? "IA désactivée" : "En ligne";

  const statusColor =
    meta?.status === "available" ? F.success :
    meta?.status === "no_key" ? F.warning : F.danger;

  return (
    <motion.div className="h-full space-y-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Brain size={18} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>ODIN Finance AI</h1>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Assistant intelligent · {meta?.clubName ?? "Club"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {metaLoading ? (
            <Loader2 size={14} className="animate-spin" style={{ color: F.ai }} />
          ) : (
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: statusColor }} />
          )}
          <span className="text-xs font-bold" style={{ color: statusColor }}>{statusLabel}</span>
        </div>
      </div>

      {meta?.status === "no_key" && (
        <div className="rounded-xl border px-4 py-2 text-[10px]" style={{ borderColor: "rgba(245,158,11,0.3)", color: F.warning }}>
          Clé OpenAI non configurée — réponses basées sur les données financières du club.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KPI_STATS.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={i}
              className="rounded-[16px] border p-3"
              style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={11} style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{k.label}</p>
              <p className="text-lg font-extrabold" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div
          className="flex flex-col overflow-hidden rounded-[22px] border"
          style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)", minHeight: "520px" }}
        >
          <div ref={chatRef} className="max-h-[440px] flex-1 space-y-4 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} gap-2`}
                >
                  {msg.type === "ai" && (
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}
                    >
                      <Sparkles size={11} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[72%] ${msg.type === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                    <div
                      className="rounded-[16px] px-4 py-3"
                      style={{
                        background: msg.type === "user"
                          ? `linear-gradient(135deg,${F.primary},${F.primary}cc)`
                          : "rgba(255,255,255,0.05)",
                        color: "white",
                        borderRadius: msg.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}
                    >
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
                      <p className="mt-1 text-[9px] opacity-50">{msg.timestamp}</p>
                    </div>
                    {msg.chart && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full rounded-[16px] border p-3"
                        style={{ background: "rgba(255,255,255,0.04)", borderColor: `${msg.chart.color}25` }}
                      >
                        <p className="mb-2 text-[9px] font-bold" style={{ color: msg.chart.color }}>
                          📊 {msg.chart.title}
                        </p>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            {msg.chart.type === "area" ? (
                              <AreaChart data={msg.chart.data.map((d) => ({ name: d.label, v: d.val }))}>
                                <defs>
                                  <linearGradient id={`g${msg.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={msg.chart.color} stopOpacity={0.35} />
                                    <stop offset="100%" stopColor={msg.chart.color} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
                                <Area type="monotone" dataKey="v" stroke={msg.chart.color} fill={`url(#g${msg.id})`} strokeWidth={2} />
                              </AreaChart>
                            ) : msg.chart.type === "line" ? (
                              <LineChart data={msg.chart.data.map((d) => ({ name: d.label, v: d.val }))}>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
                                <Line type="monotone" dataKey="v" stroke={msg.chart.color} strokeWidth={2.5} dot={{ fill: msg.chart.color, r: 3 }} />
                              </LineChart>
                            ) : (
                              <BarChart data={msg.chart.data.map((d) => ({ name: d.label, v: d.val }))}>
                                <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 8 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "none", color: "white", borderRadius: 8, fontSize: 10 }} />
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

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `linear-gradient(135deg,${F.ai},${F.primary})` }}
                >
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-[16px] px-4 py-3" style={{ background: "rgba(255,255,255,0.05)", borderRadius: "18px 18px 18px 4px" }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: F.ai }}
                      animate={{ scale: [0.6, 1.2, 0.6] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="border-t px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Posez une question financière... (ex: Prévoir revenus 6 mois)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void sendMessage()}
                className="flex-1 rounded-xl border bg-transparent px-4 py-2 text-xs outline-none"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
              <motion.button
                type="button"
                onClick={() => void sendMessage()}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: input.trim() && !loading ? `linear-gradient(135deg,${F.ai},${F.primary})` : "rgba(255,255,255,0.08)" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
              >
                <Send size={14} />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[20px] border p-4" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
            <p className="mb-3 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>
              💡 Questions suggérées
            </p>
            <div className="space-y-2">
              {suggestions.map((q, i) => {
                const sm = SUGGESTION_META[i] ?? { icon: "💡", cat: "Finance" };
                return (
                  <motion.button
                    key={q}
                    type="button"
                    onClick={() => void sendMessage(q)}
                    disabled={loading}
                    className="w-full rounded-[14px] border p-3 text-left disabled:opacity-50"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}
                    whileHover={{ scale: 1.02, borderColor: `${F.primary}30`, background: `${F.primary}06` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 text-sm">{sm.icon}</span>
                      <div>
                        <p className="mb-0.5 text-[8px] font-bold" style={{ color: F.primary }}>{sm.cat}</p>
                        <p className="text-[9px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>{q}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[20px] border p-4" style={{ background: "var(--surface-panel-solid)", borderColor: `${F.ai}20` }}>
            <p className="mb-2 text-[10px] font-bold" style={{ color: F.ai }}>🤖 Capacités ODIN AI</p>
            <div className="space-y-1.5 text-[9px]" style={{ color: "var(--text-muted)" }}>
              {["Analyse budgétaire automatique", "Graphiques générés en temps réel", "Prévisions sur 6 mois", "Alertes budget & sponsors", "Recommandations optimisation"].map((c, i) => (
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
