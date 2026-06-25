import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, Zap, Brain, Activity, Smile, CheckCircle2, ClipboardList,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

type Category = "sommeil" | "fatigue" | "stress" | "douleur" | "humeur";

interface WellnessScore {
  playerId: string; name: string; sommeil: number; fatigue: number;
  stress: number; douleur: number; humeur: number; filled: boolean;
}

const INIT_WELLNESS: WellnessScore[] = [
  { playerId: "1", name: "Ahmed Ben Salah",  sommeil: 5, fatigue: 8, stress: 7, douleur: 7, humeur: 4, filled: true },
  { playerId: "2", name: "Ali Mansouri",     sommeil: 9, fatigue: 3, stress: 2, douleur: 1, humeur: 9, filled: true },
  { playerId: "3", name: "Youssef Trabelsi", sommeil: 7, fatigue: 6, stress: 5, douleur: 8, humeur: 6, filled: true },
  { playerId: "4", name: "Mohamed Sassi",    sommeil: 8, fatigue: 5, stress: 4, douleur: 4, humeur: 7, filled: true },
  { playerId: "5", name: "Karim Dridi",      sommeil: 6, fatigue: 7, stress: 6, douleur: 5, humeur: 6, filled: true },
  { playerId: "6", name: "Sami Bouazizi",    sommeil: 0, fatigue: 0, stress: 0, douleur: 0, humeur: 0, filled: false },
  { playerId: "7", name: "Ridha Ammar",      sommeil: 0, fatigue: 0, stress: 0, douleur: 0, humeur: 0, filled: false },
  { playerId: "8", name: "Haddad",           sommeil: 0, fatigue: 0, stress: 0, douleur: 0, humeur: 0, filled: false },
];

const CAT_CONFIG: Record<Category, { icon: typeof Moon; label: string; color: string; inverted: boolean }> = {
  sommeil: { icon: Moon,     label: "Sommeil",       color: "#3B82F6", inverted: false },
  fatigue: { icon: Zap,      label: "Fatigue",       color: "#EF4444", inverted: true  },
  stress:  { icon: Brain,    label: "Stress",        color: "#8B5CF6", inverted: true  },
  douleur: { icon: Activity, label: "Douleur",       color: "#FF7A00", inverted: true  },
  humeur:  { icon: Smile,    label: "Humeur",        color: "#22C55E", inverted: false },
};

function wellnessScore(w: WellnessScore) {
  if (!w.filled) return 0;
  return Math.round(
    ((w.sommeil + (10 - w.fatigue) + (10 - w.stress) + (10 - w.douleur) + w.humeur) / 50) * 100
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? "#22C55E" : score >= 50 ? "#FF7A00" : "#EF4444";
  return (
    <motion.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 text-base font-black"
      style={{ borderColor: color, color: "var(--text-primary)" }}
      animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}50`, `0 0 0px ${color}00`] }}
      transition={{ duration: 2.5, repeat: Infinity }}>
      {score}
    </motion.div>
  );
}

export function PrepWellnessPage() {
  const [wellness, setWellness] = useState<WellnessScore[]>(INIT_WELLNESS);
  const [formPlayer, setFormPlayer] = useState<WellnessScore | null>(null);
  const [tempValues, setTempValues] = useState<Partial<Record<Category, number>>>({});

  const filled   = wellness.filter(w => w.filled);
  const missing  = wellness.filter(w => !w.filled);
  const avgScore = filled.length ? Math.round(filled.reduce((sum, w) => sum + wellnessScore(w), 0) / filled.length) : 0;
  const atRisk   = filled.filter(w => wellnessScore(w) < 50).length;

  const teamRadar = (Object.keys(CAT_CONFIG) as Category[]).map(cat => ({
    subject: CAT_CONFIG[cat].label,
    Équipe: filled.length ? Math.round(filled.reduce((s, w) => s + w[cat], 0) / filled.length) : 0,
  }));

  function openForm(w: WellnessScore) {
    setFormPlayer(w);
    setTempValues({ sommeil: w.sommeil || 7, fatigue: w.fatigue || 3, stress: w.stress || 3, douleur: w.douleur || 2, humeur: w.humeur || 7 });
  }
  function saveForm() {
    if (!formPlayer) return;
    setWellness(prev => prev.map(w => w.playerId === formPlayer.playerId
      ? { ...w, ...tempValues, filled: true }
      : w
    ));
    setFormPlayer(null);
  }

  const TOOLTIP_STYLE = {
    contentStyle: { background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "white", borderRadius: 12 },
  };

  return (
    <PrepPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Questionnaires remplis", value: `${filled.length}/${wellness.length}`, color: "#22C55E", icon: ClipboardList },
          { label: "Score moyen équipe",     value: `${avgScore}/100`,                     color: "#3B82F6", icon: TrendingUp   },
          { label: "À risque",               value: String(atRisk),                        color: "#EF4444", icon: AlertTriangle},
          { label: "En attente",             value: String(missing.length),                color: "#FF7A00", icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <PrepKpiCard hover={false}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 10px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </PrepKpiCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Player list */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statut questionnaire pré-entraînement</h3>
          {wellness.map((w, i) => {
            const score = wellnessScore(w);
            const scoreColor = score >= 75 ? "#22C55E" : score >= 50 ? "#FF7A00" : "#EF4444";
            return (
              <motion.div key={w.playerId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <PrepKpiCard hover={false}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                      style={{ background: w.filled ? `${scoreColor}22` : "rgba(255,255,255,0.06)", color: w.filled ? scoreColor : "var(--text-muted)" }}>
                      {w.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{w.name}</p>
                      {w.filled ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(Object.keys(CAT_CONFIG) as Category[]).map(cat => (
                            <span key={cat} className="text-[10px]" style={{ color: CAT_CONFIG[cat].color }}>
                              {CAT_CONFIG[cat].label.slice(0,3)}: <strong>{w[cat]}/10</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Questionnaire non rempli</p>
                      )}
                    </div>
                    {w.filled ? (
                      <ScoreRing score={score} />
                    ) : (
                      <motion.button type="button" onClick={() => openForm(w)}
                        className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                        style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        Remplir
                      </motion.button>
                    )}
                    {w.filled && (
                      <motion.button type="button" onClick={() => openForm(w)}
                        className="shrink-0 rounded-xl px-2 py-1 text-[11px] border"
                        style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                        whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                        Éditer
                      </motion.button>
                    )}
                  </div>
                </PrepKpiCard>
              </motion.div>
            );
          })}
        </div>

        {/* Team radar */}
        <div className="space-y-4">
          <PrepKpiCard hover={false}>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil Wellness équipe</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={teamRadar}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                  <Radar name="Équipe" dataKey="Équipe" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.22} strokeWidth={2} />
                  <Tooltip {...TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </PrepKpiCard>

          <PrepKpiCard hover={false}>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Scores individuels</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filled.map(w => ({ name: w.name.split(" ")[0], score: wellnessScore(w) }))} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, "Score"]} />
                  <Bar dataKey="score" radius={[6,6,0,0]} fill="#FF7A00" fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PrepKpiCard>
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {formPlayer && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(8,14,30,0.98)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
              <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                Questionnaire Wellness
              </h3>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>{formPlayer.name} · Pré-entraînement</p>
              <div className="space-y-4">
                {(Object.keys(CAT_CONFIG) as Category[]).map(cat => {
                  const cfg = CAT_CONFIG[cat];
                  const Icon = cfg.icon;
                  const val = tempValues[cat] ?? 5;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Icon size={11} style={{ color: cfg.color }} /> {cfg.label}
                        </div>
                        <span className="text-sm font-bold" style={{ color: cfg.color }}>{val}/10</span>
                      </div>
                      <input type="range" min={1} max={10} value={val}
                        onChange={e => setTempValues(p => ({ ...p, [cat]: Number(e.target.value) }))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{ accentColor: cfg.color }} />
                      <div className="flex justify-between text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                        <span>{cfg.inverted ? "Élevé" : "Faible"}</span>
                        <span>{cfg.inverted ? "Faible" : "Élevé"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 flex gap-2">
                <motion.button type="button" onClick={saveForm}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", boxShadow: "0 0 16px rgba(255,122,0,0.3)" }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <CheckCircle2 size={13} /> Enregistrer
                </motion.button>
                <motion.button type="button" onClick={() => setFormPlayer(null)}
                  className="rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
                  whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PrepPageTransition>
  );
}
