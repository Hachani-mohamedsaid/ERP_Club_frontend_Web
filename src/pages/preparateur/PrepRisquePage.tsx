import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Stethoscope, Plus, Pencil, Trash2, CalendarPlus } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar, downloadCsv, downloadTextReport } from "../../components/preparateur/PrepToolbar";
import { ClubHeatInjuryMap } from "../../components/club/ClubHeatInjuryMap";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { getRiskColor, type InjuryRiskEntry } from "../../data/preparateurData";
import { PrepPlayerDrawer } from "../../components/preparateur/PrepPlayerDrawer";
import { PrepRiskModal } from "../../components/preparateur/PrepRiskModal";
import { PrepScheduleModal } from "../../components/preparateur/PrepScheduleModal";
import type { CalendarEventPayload } from "../../components/preparateur/PrepScheduleModal";
import { clubApi } from "../../lib/api/club";
import type { ClubHeatZone } from "../../data/clubHeatInjuryData";
import type { BodyZone } from "../../components/medical/BodyInjuryViewer";

// ─── Dérivation dynamique de la heatmap ──────────────────────────────────────

const ZONE_TO_ID: Record<string, string> = {
  "Hamstring": "groin",
  "Ischio-jambiers": "groin",
  "Adducteurs": "groin",
  "Genou gauche": "knee-left",
  "Genou droit": "knee-right",
  "Genou": "knee-left",
  "Cheville gauche": "ankle-left",
  "Cheville droite": "ankle-right",
  "Cheville": "ankle-right",
  "Épaule gauche": "shoulder-left",
  "Épaule droite": "shoulder-right",
  "Dos / Lombaires": "back",
  "Dos": "back",
  "Mollet gauche": "calf-left",
  "Mollet droit": "calf-right",
  "Hanche": "hip",
  "Cuisse gauche": "thigh-left",
  "Cuisse droite": "thigh-right",
  "Pied gauche": "foot-left",
  "Pied droit": "foot-right",
  "Cervicales": "neck",
  "Abdominaux": "abdomen",
};

function riskToSeverity(risk: number): "low" | "medium" | "critical" {
  if (risk >= 60) return "critical";
  if (risk >= 30) return "medium";
  return "low";
}

function buildHeatZones(risks: InjuryRiskEntry[]): ClubHeatZone[] {
  const map = new Map<string, { label: string; players: string[]; maxRisk: number; lastDate: string }>();

  for (const r of risks) {
    const zoneId = ZONE_TO_ID[r.zone] ?? "other";
    const existing = map.get(zoneId);
    if (existing) {
      if (!existing.players.includes(r.name)) existing.players.push(r.name);
      if (r.risk > existing.maxRisk) existing.maxRisk = r.risk;
    } else {
      map.set(zoneId, { label: r.zone, players: [r.name], maxRisk: r.risk, lastDate: new Date().toLocaleDateString("fr-FR") });
    }
  }

  return Array.from(map.entries()).map(([id, z]) => ({
    id,
    label: z.label,
    count: z.players.length,
    severity: riskToSeverity(z.maxRisk),
    players: z.players,
    lastControl: z.lastDate,
  }));
}

function buildBodyZones(heatZones: ClubHeatZone[]): BodyZone[] {
  return heatZones.map((z) => ({
    id: z.id,
    name: z.label,
    severity: z.severity,
    description: `${z.count} blessure${z.count > 1 ? "s" : ""}`,
    risk: z.severity === "critical" ? 78 : z.severity === "medium" ? 52 : 22,
    lastControl: z.lastControl,
    injuryInfo: z.players[0]
      ? { player: z.players[0], grade: "Grade II", risk: z.severity === "critical" ? 82 : 55, daysRemaining: 12 }
      : undefined,
  }));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ApiPlayerFull {
  id: string;
  name: string;
  position: string;
  age?: number;
  height?: string;
  weight?: string;
}

interface ApiChargePlayer {
  id: string;
  name: string;
  position: string;
  loadScore: number;
  fatigueScore: number;
  recoveryScore: number;
  statut: string;
}

export function PrepRisquePage() {
  const [risks, setRisks] = useState<InjuryRiskEntry[]>([]);
  const [chargeData, setChargeData] = useState<ApiChargePlayer[]>([]);
  const [playerData, setPlayerData] = useState<ApiPlayerFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<InjuryRiskEntry | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleEntry, setScheduleEntry] = useState<InjuryRiskEntry | null>(null);

  // ── Fetch parallèle ────────────────────────────────────────────
  const fetchRisks = useCallback(() => {
    setLoading(true);
    Promise.all([
      clubApi.getInjuryRisks() as Promise<InjuryRiskEntry[]>,
      (clubApi.getChargeEquipe() as Promise<{ players: ApiChargePlayer[] }>).then((r) => r.players),
      clubApi.getPlayers() as Promise<ApiPlayerFull[]>,
    ])
      .then(([risks, charge, players]) => {
        setRisks(risks);
        setChargeData(charge);
        setPlayerData(players);
      })
      .catch(() => showToast("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRisks(); }, [fetchRisks]);

  // ── CRUD ───────────────────────────────────────────────────────
  async function handleSubmitRisk(entry: InjuryRiskEntry) {
    try {
      if (editEntry) {
        const updated = await (clubApi.updateInjuryRisk(entry.id, {
          zone: entry.zone,
          risk: entry.risk,
          recommendation: entry.recommendation,
          medicalComment: entry.medicalComment,
          medicalAuthor: entry.medicalAuthor,
        }) as Promise<InjuryRiskEntry>);
        setRisks((prev) => prev.map((r) => (r.id === entry.id ? updated : r)));
        showToast(`Risque mis à jour — ${updated.name}`);
      } else {
        const created = await (clubApi.createInjuryRisk({
          playerId: entry.playerId,
          zone: entry.zone,
          risk: entry.risk,
          recommendation: entry.recommendation,
          medicalComment: entry.medicalComment,
          medicalAuthor: entry.medicalAuthor,
        }) as Promise<InjuryRiskEntry>);
        setRisks((prev) => [created, ...prev]);
        showToast(`Risque ajouté — ${created.name}`);
      }
    } catch {
      showToast("Erreur — impossible d'enregistrer le risque");
    }
    setEditEntry(null);
  }

  async function deleteRisk(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await clubApi.deleteInjuryRisk(id);
      setRisks((prev) => prev.filter((r) => r.id !== id));
      showToast("Entrée supprimée");
    } catch {
      showToast("Erreur — impossible de supprimer");
    }
  }

  function openEdit(entry: InjuryRiskEntry, e: React.MouseEvent) {
    e.stopPropagation();
    setEditEntry(entry);
    setModalOpen(true);
  }

  function openSchedule(entry: InjuryRiskEntry, e: React.MouseEvent) {
    e.stopPropagation();
    setScheduleEntry(entry);
    setScheduleOpen(true);
  }

  async function handleScheduleSubmit(payload: CalendarEventPayload) {
    await (clubApi.createPreparateurCalendarEvent(payload as Record<string, unknown>) as Promise<unknown>);
    showToast(`Événement planifié — visible dans le calendrier Admin Club`);
  }

  function sendRecommendation(entry: InjuryRiskEntry) {
    showToast(`Recommandation envoyée au coach — ${entry.name}`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── Export ─────────────────────────────────────────────────────
  const filtered = risks.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.zone.toLowerCase().includes(search.toLowerCase())
  );

  function exportCsv() {
    downloadCsv(
      "risques-blessures.csv",
      ["Joueur", "Zone", "Risque %", "Recommandations"],
      filtered.map((r) => [r.name, r.zone, String(r.risk), r.recommendation.join("; ")])
    );
  }

  function exportPdf() {
    const content = filtered.map((r) =>
      `${r.name}\nZone: ${r.zone}\nRisque: ${r.risk}%\nRecommandations:\n${r.recommendation.map((x) => `  - ${x}`).join("\n")}\n`
    ).join("\n---\n");
    downloadTextReport("rapport-risques.txt", `RAPPORT RISQUES BLESSURES\n${"=".repeat(40)}\n\n${content}`);
  }

  // ── Heatmap dynamique ─────────────────────────────────────────
  const heatZones = buildHeatZones(risks);
  const bodyZones = buildBodyZones(heatZones);

  const criticalCount = risks.filter((r) => r.risk >= 60).length;
  const mediumCount = risks.filter((r) => r.risk >= 30 && r.risk < 60).length;

  const drawerPlayer = drawerId
    ? (() => {
        const r = risks.find((x) => x.id === drawerId);
        if (!r) return null;
        const charge = chargeData.find((c) => c.id === r.playerId);
        const player = playerData.find((p) => p.id === r.playerId);
        return {
          id: r.playerId ?? r.id,
          name: r.name,
          position: player?.position ?? charge?.position ?? "—",
          age: player?.age ?? 0,
          weight: player?.weight ?? "—",
          height: player?.height ?? "—",
          weekCharge: charge?.loadScore ?? 0,
          injuryHistory: [{ date: new Date().getFullYear().toString(), injury: r.zone, status: "En cours" }],
          activePrograms: r.recommendation,
          lastMatch: { opponent: "—", date: "—", rating: 0 },
          availability: r.risk >= 60 ? "Limité" : r.risk >= 30 ? "À surveiller" : "Disponible",
          charge: charge?.loadScore ?? 0,
          fatigue: charge?.fatigueScore ?? 0,
          recovery: charge?.recoveryScore ?? 0,
        };
      })()
    : null;

  return (
    <PrepPageTransition>
      <PrepToolbar
        search={search}
        onSearchChange={setSearch}
        onExportCsv={exportCsv}
        onExportPdf={exportPdf}
        placeholder="Rechercher joueur ou zone..."
      />

      <PrepKpiCard hover={false}>
        <ClubHeatInjuryMap
          clubName="FC Carthage"
          heatZones={heatZones.length > 0 ? heatZones : []}
          bodyZones={bodyZones}
        />
      </PrepKpiCard>

      <PrepKpiCard hover={false} delay={0.1}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Liste Risques</h3>
            <div className="flex items-center gap-1.5">
              {criticalCount > 0 && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                  {criticalCount} critique{criticalCount > 1 ? "s" : ""}
                </span>
              )}
              {mediumCount > 0 && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                  {mediumCount} moyen{mediumCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <motion.button
            type="button"
            onClick={() => { setEditEntry(null); setModalOpen(true); }}
            whileHover={{ scale: 1.04, boxShadow: "0 6px 18px rgba(255,107,87,0.35)" }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #e0584a, #c0392b)" }}
          >
            <Plus size={14} />
            Nouveau risque
          </motion.button>
        </div>

        {loading ? (
          <ListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              <Sparkles size={22} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Aucun risque trouvé</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
              {risks.length === 0 ? "Ajoutez un premier risque avec le bouton ci-dessus" : "Modifiez la recherche"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const color = getRiskColor(entry.risk);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="cursor-pointer rounded-xl border p-4 transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: `${color}30`, background: `${color}08` }}
                  onClick={() => setDrawerId(entry.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={entry.name} size={44} />
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{entry.name}</p>
                        <p className="text-sm" style={{ color }}>{entry.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Sparkles size={14} style={{ color }} />
                          <span className="text-2xl font-bold" style={{ color }}>{entry.risk}%</span>
                        </div>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Risk IA</p>
                      </div>
                      <div className="ml-2 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => openEdit(entry, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.08]"
                          style={{ color: "var(--text-muted)" }}
                          title="Modifier"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteRisk(entry.id, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                          style={{ color: "var(--text-muted)" }}
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                    <p className="mb-1 text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Recommandation IA</p>
                    <ul className="space-y-1">
                      {entry.recommendation.map((rec) => (
                        <li key={rec} className="text-xs" style={{ color: "var(--text-secondary)" }}>• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  {entry.medicalComment && (
                    <div className="mt-3 rounded-lg border px-3 py-2.5" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)" }}>
                      <div className="mb-1 flex items-center gap-1.5">
                        <Stethoscope size={12} style={{ color: "#F59E0B" }} />
                        <p className="text-[10px] font-semibold uppercase" style={{ color: "#F59E0B" }}>
                          Commentaire Médecin{entry.medicalAuthor ? ` — ${entry.medicalAuthor}` : ""}
                        </p>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{entry.medicalComment}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); sendRecommendation(entry); }}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
                    >
                      <Send size={12} /> Envoyer au coach
                    </button>
                    <motion.button
                      type="button"
                      onClick={(e) => openSchedule(entry, e)}
                      whileHover={{ scale: 1.03, boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                    >
                      <CalendarPlus size={12} /> Planifier séance
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </PrepKpiCard>

      <PrepPlayerDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />

      <PrepRiskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditEntry(null); }}
        onSubmit={handleSubmitRisk}
        editEntry={editEntry}
      />

      <PrepScheduleModal
        open={scheduleOpen}
        onClose={() => { setScheduleOpen(false); setScheduleEntry(null); }}
        onSubmit={handleScheduleSubmit}
        riskEntry={scheduleEntry}
      />

      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm"
          style={{ background: "#0F1D3A", borderColor: "rgba(255,107,87,0.3)", color: "#FF6B57" }}
        >
          {toast}
        </motion.div>
      )}
    </PrepPageTransition>
  );
}
