import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, User, Ruler, Scale, Footprints, Calendar, TrendingUp, Pencil, Check, X } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { OVRRing } from "../../components/player/OVRRing";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { clubApi } from "../../lib/api/club";
import { Target, Zap, Clock, Square } from "lucide-react";
import { CountUpStat } from "../../components/player/CountUpStat";
import jsPDF from "jspdf";

function downloadPDF(playerName: string, filename: string, clubName = "—") {
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.text(`${clubName} — Document Officiel`, 20, 20);
  pdf.setFontSize(12);
  pdf.line(20, 25, 190, 25);
  pdf.text(`Joueur  : ${playerName}`, 20, 38);
  pdf.text(`Fichier : ${filename}`, 20, 48);
  pdf.text(`Date    : ${new Date().toLocaleString("fr-TN")}`, 20, 58);
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Ce document est confidentiel et réservé à ${clubName}.`, 20, 72);
  pdf.save(filename.replace(/\s+/g, "_") + ".pdf");
}

interface PhysicalEdit {
  height: string;
  weight: string;
  strongFoot: string;
  nationality: string;
  birthDate: string;
  jerseyNumber: string;
}

export function JoueurMonProfilPage() {
  const { player, photoUrl, handleFileChange, backendPlayer } = useCurrentPlayer();
  const { t } = useLocale();
  const { awards, documents, matchStats, playerStats, myContract, myPlayerId, refetchPlayer, orgProfile } = useJoueurBackendData();
  const clubName = orgProfile?.clubName ?? "—";

  const [editingPhysical, setEditingPhysical] = useState(false);
  const [physicalForm, setPhysicalForm] = useState<PhysicalEdit>({
    height: backendPlayer?.height ?? "",
    weight: backendPlayer?.weight ?? "",
    strongFoot: backendPlayer?.strongFoot ?? "Droit",
    nationality: backendPlayer?.nationality ?? "",
    birthDate: backendPlayer?.birthDate ?? "",
    jerseyNumber: String(backendPlayer?.jerseyNumber ?? ""),
  });
  const [savingPhysical, setSavingPhysical] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  if (!player) return null;

  const trophiesFromBackend = awards.filter((a) => a.awardType === "trophy");
  const careerTimeline = awards.filter((a) => a.awardType === "career");

  const seasonGoals = matchStats.reduce((s, m) => s + m.goals, 0);
  const seasonAssists = matchStats.reduce((s, m) => s + m.assists, 0);
  const seasonMatches = matchStats.length;
  const seasonMinutes = matchStats.reduce((s, m) => s + m.minutes, 0);

  const heroMarketValue = playerStats?.dashboardHero?.marketValue ?? player.marketValue;
  const marketValueChange = playerStats?.marketValueTrend?.change ?? "+5%";

  async function handleSavePhysical() {
    if (!myPlayerId) return;
    setSavingPhysical(true);
    try {
      await clubApi.updatePlayerPhysical(myPlayerId, {
        height: physicalForm.height,
        weight: physicalForm.weight,
        strongFoot: physicalForm.strongFoot,
        nationality: physicalForm.nationality,
        birthDate: physicalForm.birthDate,
        jerseyNumber: physicalForm.jerseyNumber ? Number(physicalForm.jerseyNumber) : undefined,
      });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
      setEditingPhysical(false);
      await refetchPlayer();
    } catch { /* non-blocking */ } finally {
      setSavingPhysical(false);
    }
  }

  const displayHeight = backendPlayer?.height || physicalForm.height || "—";
  const displayWeight = backendPlayer?.weight || physicalForm.weight || "—";
  const displayFoot = backendPlayer?.strongFoot || physicalForm.strongFoot || "—";
  const displayBirth = backendPlayer?.birthDate || physicalForm.birthDate || "—";
  const displayNationality = backendPlayer?.nationality || physicalForm.nationality || "—";
  const jerseyNumber = backendPlayer?.jerseyNumber ?? (physicalForm.jerseyNumber ? Number(physicalForm.jerseyNumber) : 0);

  const seasonYellow = matchStats.reduce((s, m) => s + (m.yellowCards ?? 0), 0);
  const seasonRed = matchStats.reduce((s, m) => s + (m.redCards ?? 0), 0);

  const infoItems = [
    { icon: Ruler, label: "Taille", value: displayHeight },
    { icon: Scale, label: "Poids", value: displayWeight },
    { icon: Footprints, label: "Pied fort", value: displayFoot },
    { icon: Calendar, label: "Naissance", value: displayBirth },
    { icon: User, label: "Nationalité", value: displayNationality },
  ];

  return (
    <JoueurPageTransition>
      <motion.div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-panel-solid)" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative h-36" style={{ background: "linear-gradient(135deg, #FF6B57 0%, var(--surface-panel-solid) 60%, #070B1A 100%)" }} />
        <div className="relative px-6 pb-6">
          <div className="absolute -top-14">
            <PlayerAvatar name={player.name} size={96} photoUrl={photoUrl} onPhotoUpload={handleFileChange} />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 pt-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h1>
                {jerseyNumber > 0 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: "#FF6B57", color: "white" }}>
                    #{jerseyNumber}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--accent)" }}>{player.position} — {player.positionFull}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{player.flag} {player.nationality} • {player.age} ans</p>
              {backendPlayer?.availability && (
                <AnimatedBadge
                  tone={backendPlayer.availability === "Blessé" ? "danger" : backendPlayer.availability === "Limité" ? "warning" : "success"}
                  animated={false}
                >
                  {backendPlayer.availability}
                </AnimatedBadge>
              )}
            </div>
            <OVRRing value={player.ovr} size={100} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JoueurKpiCard delay={0.05}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} style={{ color: "#22C55E" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.marketValue}</h3>
          </div>
          <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{heroMarketValue}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#22C55E" }}>↗ {marketValueChange}</p>
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Valeur fixée par le responsable</p>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.08} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>🏆 {t.profile.trophies}</h3>
          {trophiesFromBackend.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {trophiesFromBackend.map((tr, idx) => (
                <motion.div key={tr.id} className="rounded-xl border p-3 text-center" style={{ borderColor: "var(--surface-panel-border)" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + idx * 0.06 }}>
                  <span className="text-2xl">{tr.icon}</span>
                  <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{tr.title}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{tr.year ?? tr.season}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun trophée — ajouté par le responsable</p>
          )}
        </JoueurKpiCard>
      </div>

      {/* Career Stats */}
      <JoueurKpiCard delay={0.09}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📊 Statistiques de carrière</h3>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Saison {new Date().getFullYear() - 1}-{String(new Date().getFullYear()).slice(2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { icon: Calendar, label: "Matchs",    value: seasonMatches, color: "#3B82F6" },
            { icon: Target,   label: "Buts",      value: seasonGoals,   color: "#FF6B57" },
            { icon: Zap,      label: "Assists",   value: seasonAssists, color: "#22C55E" },
            { icon: Clock,    label: "Minutes",   value: seasonMinutes, color: "#F59E0B" },
            { icon: Square,   label: "🟨 Jaunes", value: seasonYellow, color: "#EAB308" },
            { icon: Square,   label: "🟥 Rouges", value: seasonRed,   color: "#EF4444" },
          ].map(({ icon: Icon, label, value, color }, idx) => (
            <motion.div key={label} className="rounded-2xl border p-3 text-center" style={{ borderColor: "var(--surface-panel-border)", background: `${color}0c` }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} whileHover={{ y: -4, borderColor: `${color}40` }}>
              <Icon size={15} className="mx-auto" style={{ color }} />
              <p className="mt-1.5 text-xl font-black" style={{ color }}><CountUpStat end={value} /></p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: "rgba(255,107,87,0.2)", background: "rgba(255,107,87,0.06)" }}>
            <span className="text-2xl">⚽</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Ratio but/match</p>
              <p className="text-lg font-black" style={{ color: "#FF6B57" }}>
                {seasonMatches > 0 ? (seasonGoals / seasonMatches).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--surface-panel-border)" }}>
            {matchStats.length > 0 ? matchStats.slice(0, 5).map((m, idx) => (
              <motion.div key={m.id} className="flex items-center gap-3 px-4 py-2" style={{ borderTop: idx > 0 ? "1px solid var(--divider)" : undefined }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.05 }}>
                <span className="w-20 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                  {new Date(m.matchDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </span>
                <span className="flex-1 text-xs" style={{ color: "var(--text-muted)" }}>vs {m.opponent}</span>
                <span className="text-xs" style={{ color: "#3B82F6" }}>{m.result}</span>
                <span className="text-xs font-semibold" style={{ color: "#FF6B57" }}>{m.goals} ⚽</span>
                <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>{m.assists} 🅰</span>
              </motion.div>
            )) : (
              <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>Aucun match enregistré — ajouté par le staff</p>
            )}
          </div>
        </div>
      </JoueurKpiCard>

      <JoueurKpiCard delay={0.1}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📍 {t.profile.career}</h3>
        {careerTimeline.length > 0 ? (
          <div className="relative">
            {careerTimeline.map((step, idx) => (
              <motion.div key={step.id} className="flex gap-4 pb-6 last:pb-0" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.08 }}>
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" style={{ background: "#FF6B57", color: "white" }}>
                    {(step.year ?? "?").slice(-2)}
                  </div>
                  {idx < careerTimeline.length - 1 && <div className="mt-1 w-0.5 flex-1" style={{ background: "var(--divider)", minHeight: 32 }} />}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{step.club ?? clubName}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{step.event ?? step.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune étape — ajoutée par le responsable</p>
        )}
      </JoueurKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Physical Info — joueur can self-edit */}
        <JoueurKpiCard delay={0.12}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={18} style={{ color: "#FF6B57" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.info}</h3>
            </div>
            {!editingPhysical && (
              <button
                type="button"
                onClick={() => {
                  setPhysicalForm({
                    height: backendPlayer?.height ?? "",
                    weight: backendPlayer?.weight ?? "",
                    strongFoot: backendPlayer?.strongFoot ?? "Droit",
                    nationality: backendPlayer?.nationality ?? "",
                    birthDate: backendPlayer?.birthDate ?? "",
                    jerseyNumber: String(backendPlayer?.jerseyNumber ?? ""),
                  });
                  setEditingPhysical(true);
                }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}
              >
                <Pencil size={12} /> Modifier
              </button>
            )}
          </div>

          {editingPhysical ? (
            <div className="space-y-3">
              {[
                { label: "Taille (ex: 182 cm)", field: "height" as const },
                { label: "Poids (ex: 77 kg)", field: "weight" as const },
                { label: "Nationalité", field: "nationality" as const },
                { label: "Date de naissance (ex: 1999-06-15)", field: "birthDate" as const },
                { label: "Numéro de maillot", field: "jerseyNumber" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
                  <input
                    type="text"
                    value={physicalForm[field]}
                    onChange={(e) => setPhysicalForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="glass-input mt-1 w-full py-2 text-sm"
                    placeholder={label}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Pied fort</label>
                <select
                  value={physicalForm.strongFoot}
                  onChange={(e) => setPhysicalForm((prev) => ({ ...prev, strongFoot: e.target.value }))}
                  className="glass-input mt-1 w-full py-2 text-sm"
                >
                  <option value="Droit">Droit</option>
                  <option value="Gauche">Gauche</option>
                  <option value="Les deux">Les deux</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSavePhysical}
                  disabled={savingPhysical}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "#22C55E", color: "white" }}
                >
                  <Check size={12} /> {savingPhysical ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPhysical(false)}
                  className="flex items-center justify-center rounded-xl px-3 py-2 text-xs"
                  style={{ background: "var(--surface-input)", color: "var(--text-muted)" }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <Icon size={14} style={{ color: "var(--text-muted)" }} />
                  <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </JoueurKpiCard>

        {/* Contract — read-only, set by responsable */}
        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.contract}</h3>
          {myContract ? (
            <div className="space-y-2">
              {[
                { label: "Début", value: myContract.startDate },
                { label: "Fin", value: myContract.endDate },
                { label: "Salaire", value: myContract.salary },
                { label: "Clause libératoire", value: myContract.releaseClause },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between rounded-xl border px-4 py-2" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun contrat enregistré — géré par le responsable</p>
          )}
        </JoueurKpiCard>
      </div>

      <JoueurKpiCard delay={0.18}>
        <div className="mb-4 flex items-center gap-2"><FileText size={18} style={{ color: "#FF6B57" }} /><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.documents}</h3></div>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {documents.slice(0, 6).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => downloadPDF(player.name, doc.name, clubName)}
                className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderColor: "var(--surface-panel-border)" }}
                title={`Télécharger ${doc.name}`}
              >
                <FileText size={18} style={{ color: "#FF6B57" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.size}</p>
                </div>
                <Download size={14} style={{ color: "#22C55E" }} />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun document — uploadez via la page Documents</p>
        )}
      </JoueurKpiCard>

      {/* Save toast */}
      <AnimatePresence>
        {saveOk && (
          <motion.div
            key="save-toast"
            className="fixed bottom-6 right-6 z-[210] flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl"
            style={{ background: "var(--surface-panel-solid)", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Check size={18} />
            <span className="text-sm font-semibold">Profil physique sauvegardé !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
