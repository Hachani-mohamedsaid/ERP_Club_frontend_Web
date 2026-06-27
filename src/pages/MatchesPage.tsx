import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Users } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { AICard } from "../components/coach/AICard";
import { NotificationPanel } from "../components/coach/NotificationPanel";
import { ClubBestXIPitch } from "../components/club/ClubBestXIPitch";
import { clubApi } from "../lib/api/club";
import { useClubResource } from "../hooks/useClubResource";
import { buildBestXiFromPlayers } from "../lib/clubAnalyticsBuilder";
import type { BestXiPlayer } from "../lib/analyticsNormalize";

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  location: string | null;
}

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  ovr: number;
  goals?: number;
  availability?: string;
}

interface InjuriesPayload {
  kpis?: { injured: number; available: number };
  injured: { name: string; injury: string; riskIA?: number }[];
}

function normalizePlayer(raw: Record<string, unknown>): PlayerRow {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? raw.fullName ?? "").trim(),
    position: String(raw.position ?? raw.positionFull ?? "MC"),
    ovr: Number(raw.ovr ?? 0),
    goals: Number(raw.goals ?? 0),
    availability: String(raw.availability ?? raw.status ?? "Disponible"),
  };
}

function playerKey(name: string) {
  return name.trim().toLowerCase();
}

function normalizeEvent(raw: Record<string, unknown>): CalendarEvent {
  const dateRaw = raw.eventDate;
  const iso =
    typeof dateRaw === "string"
      ? dateRaw.split("T")[0]
      : dateRaw instanceof Date
        ? dateRaw.toISOString().split("T")[0]
        : "";
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    eventDate: iso,
    eventTime: raw.eventTime ? String(raw.eventTime) : null,
    eventType: String(raw.eventType ?? "MATCH").toUpperCase(),
    location: raw.location ? String(raw.location) : null,
  };
}

function formatMatchDate(iso: string, time?: string | null) {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return time ? `${dateStr}, ${time}` : dateStr;
}

function isPlayerAvailable(p: PlayerRow, injuredNames: Set<string>) {
  if (!p.name) return false;
  const avail = p.availability.toLowerCase();
  if (avail.includes("fin contrat")) return false;
  if (injuredNames.has(playerKey(p.name))) return false;
  return true;
}

export function MatchesPage() {
  const { data: rawEvents, loading: loadingEvents } = useClubResource(() => clubApi.getCalendar());
  const { data: playersRaw, loading: loadingPlayers } = useClubResource(
    () => clubApi.getPlayers() as Promise<Record<string, unknown>[]>,
  );
  const { data: injuries, loading: loadingInjuries } = useClubResource(
    () => clubApi.getInjuries() as Promise<InjuriesPayload>,
  );

  const [lineup, setLineup] = useState<{ formation: string; players: BestXiPlayer[] } | null>(null);
  const [lineupMatch, setLineupMatch] = useState<CalendarEvent | null>(null);
  const [generating, setGenerating] = useState(false);

  const matches = useMemo(
    () => ((rawEvents ?? []) as Record<string, unknown>[]).map(normalizeEvent).filter((e) => e.eventType === "MATCH"),
    [rawEvents],
  );

  const now = Date.now();
  const upcoming = matches.filter((m) => new Date(m.eventDate).getTime() >= now).slice(0, 5);
  const past = matches.filter((m) => new Date(m.eventDate).getTime() < now).slice(-5).reverse();

  const squad = useMemo(
    () => (Array.isArray(playersRaw) ? playersRaw : []).map((p) => normalizePlayer(p)),
    [playersRaw],
  );

  const injuredNames = useMemo(
    () => new Set((injuries?.injured ?? []).map((i) => playerKey(i.name)).filter(Boolean)),
    [injuries],
  );

  const compositionPool = useMemo(
    () => squad.filter((p) => isPlayerAvailable(p, injuredNames)),
    [squad, injuredNames],
  );

  const effectifDispo = injuries?.kpis?.available ?? compositionPool.length;

  const topPlayer = [...compositionPool].sort((a, b) => b.ovr - a.ovr)[0]
    ?? [...squad].sort((a, b) => b.ovr - a.ovr)[0];

  const injuredHighRisk = (injuries?.injured ?? [])[0];
  const nextMatch = upcoming[0] ?? null;

  const substitutes = useMemo(() => {
    if (!lineup) return [];
    const starterNames = new Set(lineup.players.map((p) => p.name.toLowerCase()));
    return compositionPool
      .filter((p) => {
        const short = p.name.trim().split(/\s+/).pop()?.toLowerCase() ?? p.name.toLowerCase();
        return !starterNames.has(short) && !starterNames.has(p.name.toLowerCase());
      })
      .sort((a, b) => b.ovr - a.ovr)
      .slice(0, 7);
  }, [lineup, compositionPool]);

  const dataLoading = loadingEvents || loadingPlayers || loadingInjuries;

  async function generateComposition() {
    const pool = compositionPool.length > 0 ? compositionPool : squad;
    if (pool.length === 0) {
      alert("Aucun joueur dans l'effectif. Ajoutez des joueurs depuis la page Joueurs.");
      return;
    }
    setGenerating(true);
    try {
      const bestXi = buildBestXiFromPlayers(
        pool.map((p) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          ovr: p.ovr,
          goals: p.goals,
          availability: p.availability,
        })),
      );
      if (bestXi.players.length === 0) {
        alert("Impossible de placer les joueurs sur le terrain — vérifiez les postes.");
        return;
      }
      setLineup(bestXi);
      setLineupMatch(nextMatch);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Matchs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Composition, analyse et MVP — calendrier club
        </p>
      </div>

      {dataLoading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Résultats récents
            </h2>
            {past.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun match passé enregistré.</p>
            ) : (
              <div className="space-y-3">
                {past.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{m.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatMatchDate(m.eventDate, m.eventTime)}</p>
                    </div>
                    <Badge tone="success">Terminé</Badge>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Matchs à venir
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun match planifié.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{m.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {formatMatchDate(m.eventDate, m.eventTime)}
                        {m.location ? ` · ${m.location}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard raised className="p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Composition</h2>
              <Button
                variant="primary"
                size="sm"
                disabled={dataLoading || generating || squad.length === 0}
                onClick={generateComposition}
              >
                <Sparkles size={14} />
                {generating ? "Génération…" : "Générer composition"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Effectif dispo", value: String(effectifDispo) },
                { label: "ODIN MVP", value: topPlayer?.name ?? "—" },
                { label: "Score MVP", value: topPlayer ? String(topPlayer.ovr) : "—" },
                { label: "Matchs planifiés", value: String(upcoming.length) },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {lineup && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-6 border-t pt-6"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                        Composition générée
                      </p>
                      {lineupMatch && (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Pour {lineupMatch.title} — {formatMatchDate(lineupMatch.eventDate, lineupMatch.eventTime)}
                        </p>
                      )}
                    </div>
                    <Badge tone="info">{lineup.players.length}/11 titulaires</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ClubBestXIPitch formation={lineup.formation} players={lineup.players} />

                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        <Users size={14} /> Titulaires
                      </p>
                      <div className="space-y-2">
                        {lineup.players.map((p) => (
                          <div
                            key={`${p.position}-${p.name}`}
                            className="flex items-center justify-between rounded-xl border px-3 py-2"
                            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                          >
                            <div>
                              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                              {compositionPool.find((pl) => pl.name.endsWith(p.name) || pl.name === p.name)?.ovr ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {substitutes.length > 0 && (
                        <>
                          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                            Remplaçants suggérés
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {substitutes.map((p) => (
                              <span
                                key={p.id}
                                className="rounded-full px-3 py-1 text-xs font-medium"
                                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}
                              >
                                {p.name} ({p.position}) · {p.ovr}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <AICard
            title="Recommandation IA"
            message={
              lineup && topPlayer
                ? `Composition ${lineup.formation} prête avec ${lineup.players.length} titulaires. ${topPlayer.name} (OVR ${topPlayer.ovr}) en tête du onze.`
                : topPlayer
                  ? `${topPlayer.name} est en forme optimale pour le prochain match (OVR ${topPlayer.ovr}).`
                  : "Données joueurs insuffisantes."
            }
          />
          <NotificationPanel
            notifications={[
              { title: "Points forts", subtitle: lineup ? "Bloc compact, transitions via les ailiers" : "Transitions rapides selon analytics club" },
              { title: "Points faibles", subtitle: lineup && lineup.players.length < 11 ? "Effectif incomplet — compléter le onze" : "Pression haute à surveiller" },
              { title: "Ajustement", subtitle: lineupMatch ? `Préparer le bloc bas contre ${lineupMatch.title.split(" vs ")[1] ?? "l'adversaire"}` : "Compactage axial recommandé" },
            ]}
          />
          {injuredHighRisk && (
            <GlassCard className="p-4">
              <p className="text-xs font-semibold uppercase" style={{ color: "#EF4444" }}>Risque Blessure</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {injuredHighRisk.name} : {injuredHighRisk.injury}
                {(injuredHighRisk.riskIA ?? 0) > 0 ? ` (risque ${Math.round(injuredHighRisk.riskIA ?? 0)}%)` : ""}
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
