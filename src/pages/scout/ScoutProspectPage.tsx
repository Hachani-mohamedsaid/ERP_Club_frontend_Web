import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, X, Video, Star, Brain, CheckCircle2,
  Activity, Shield, Zap, Target, Heart, Sparkles,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";
import { SGauge, SCOUT_TOOLTIP } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto } from "../../components/scout/ScoutPlayerPhoto";
import { PROSPECTS, S, PRIORITY_META, type Prospect } from "../../data/scoutData";
import { scoutApi } from "../../lib/api/scout";
import { buildAiReels, resolveYoutubeForPlayer, youtubeWatchEmbedUrl, type ProspectLiveReel } from "../../lib/api/scout/playerReels";
import { showToast } from "../../components/scout/ScoutToast";

const TABS = ["Performance", "Heatmap", "Historique", "Notes", "Vidéo"] as const;
type Tab = typeof TABS[number];

function injuryLevel(risk: number) {
  if (risk <= 15)  return { label: "Faible",  color: S.success, bg: "rgba(34,197,94,0.12)"  };
  if (risk <= 30)  return { label: "Modéré",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)" };
  return           { label: "Élevé",  color: S.danger,  bg: "rgba(239,68,68,0.12)"  };
}

function heatColor(intensity: number) {
  if (intensity >= 80) return { stroke: S.danger,   fill: "rgba(239,68,68,0.7)"   };
  if (intensity >= 60) return { stroke: S.primary,  fill: "rgba(255,122,0,0.65)"  };
  if (intensity >= 40) return { stroke: S.info,     fill: "rgba(59,130,246,0.55)" };
  return                      { stroke: S.success,  fill: "rgba(34,197,94,0.35)"  };
}

function potColor(v: number) { return v >= 85 ? S.success : v >= 78 ? S.primary : S.info; }

export function ScoutProspectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Performance");
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<{ date: string; text: string }[]>([]);
  const [liked, setLiked] = useState(false);
  const [p, setP] = useState<Prospect | null>(null);
  const [videos, setVideos] = useState<{ title: string; duration: string; type: string; icon: string }[]>([]);
  const [reels, setReels] = useState<ProspectLiveReel[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveSource, setLiveSource] = useState<"api-football" | "flashscore" | null>(null);
  const [playing, setPlaying] = useState<{
    id: string;
    title: string;
    kind: "reel" | "clip" | "upload";
    embedUrl?: string;
    localUrl?: string;
    searchUrl?: string;
    loading?: boolean;
    notFound?: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const openYoutubeInSite = async (id: string, title: string, query: string, kind: "reel" | "clip") => {
    setPlaying({ id, title, kind, loading: true });
    requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    const resolved = await resolveYoutubeForPlayer(query);
    const videoId = resolved.videoId;
    setPlaying({
      id,
      title,
      kind,
      loading: false,
      searchUrl: resolved.searchUrl,
      embedUrl: videoId
        ? (resolved.embedUrl ?? youtubeWatchEmbedUrl(videoId))
        : undefined,
      notFound: !videoId,
    });
  };

  const onImportVideo = (file?: File | null) => {
    if (!file) return;
    if (playing?.localUrl) URL.revokeObjectURL(playing.localUrl);
    const localUrl = URL.createObjectURL(file);
    setPlaying({
      id: `upload-${Date.now()}`,
      title: file.name,
      kind: "upload",
      localUrl,
    });
    requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  useEffect(() => {
    return () => {
      if (playing?.localUrl) URL.revokeObjectURL(playing.localUrl);
    };
  }, [playing?.localUrl]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setLiveSource(null);
    setVideos([]);
    setReels([]);
    setPlaying(null);
    scoutApi
      .getProspect(id)
      .then(async (dto) => {
        const mock = PROSPECTS.find((pr) => pr.id === dto.legacyId || pr.name === dto.name);
        let live = null;
        try {
          live = await scoutApi.getProspectLive({
            name: dto.name,
            club: dto.club,
            legacyId: dto.legacyId,
            apiSportsId: dto.apiSportsId,
          });
        } catch {
          live = null;
        }

        const hasLive = Boolean(live);
        setLiveSource(hasLive ? live!.source ?? "api-football" : null);
        const base = mock ?? PROSPECTS[0];

        setP({
          ...base,
          id: dto.id,
          name: live?.name ?? dto.name,
          age: live?.age ?? dto.age,
          nationality: dto.nationality,
          flag: dto.flag,
          club: live?.club ?? dto.club,
          league: live?.league ?? dto.league,
          position: live?.position ?? dto.position,
          potential: live?.potential ?? dto.potential,
          currentRating: live?.currentRating ?? dto.currentRating,
          marketValue: live?.marketValue ?? dto.marketValue,
          valueMK: live?.valueMK ?? dto.valueMK,
          priority: dto.priority as Prospect["priority"],
          status: dto.status as Prospect["status"],
          aiScore: live?.aiScore ?? dto.aiScore,
          injuryRisk: dto.injuryRisk,
          foot: dto.foot as Prospect["foot"],
          height: live?.height ?? dto.height,
          weight: live?.weight ?? dto.weight,
          goals: live?.goals ?? dto.goals,
          assists: live?.assists ?? dto.assists,
          matches: live?.matches ?? dto.matches,
          speed: live?.speed ?? dto.speed,
          dribble: live?.dribble ?? dto.dribble,
          passing: live?.passing ?? dto.passing,
          defense: live?.defense ?? dto.defense,
          physical: live?.physical ?? dto.physical,
          mental: live?.mental ?? dto.mental,
          contractEnd: dto.contractEnd,
          agent: dto.agent,
          addedDate: dto.addedDate,
          notes: dto.notes?.length ? dto.notes : [],
          matchHistory: live?.matchHistory ?? [],
          monthlyPotential: live?.monthlyPotential ?? [dto.potential, dto.potential, dto.potential, dto.potential, dto.potential, dto.potential],
          heatmapZones: live?.heatmapZones ?? [],
        });
        setVideos(
          hasLive
            ? live!.videos
            : [],
        );
        setReels(
          hasLive && live!.reels?.length
            ? live!.reels.map((r, i) => ({
                ...r,
                id: r.id ?? `reel-${i}`,
                query:
                  r.query
                  ?? `${live!.name} ${live!.club} ${r.tag} football highlights shorts`,
                searchUrl:
                  r.searchUrl
                  ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${live!.name} ${live!.club} ${r.tag}`,
                  )}`,
              }))
            : buildAiReels(
                live?.name ?? dto.name,
                live?.club ?? dto.club,
                live?.position ?? dto.position,
                live?.goals ?? dto.goals,
                live?.assists ?? dto.assists,
              ),
        );
        setNotes(dto.notes?.length ? dto.notes : []);
        setLiked(Boolean(dto.inWatchlist));
        setPhotoUrl(live?.photoUrl ?? dto.photoUrl ?? null);
      })
      .catch(() => {
        const fallback = PROSPECTS.find((pr) => pr.id === id);
        if (fallback) {
          setP(fallback);
          setNotes([...fallback.notes]);
          setLiveSource(null);
          setVideos([]);
          setReels([]);
          setPhotoUrl(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        Chargement du profil...
      </div>
    );
  }

  if (!p) return (
    <div className="flex h-64 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
      Prospect introuvable.
    </div>
  );

  const safeNotes = notes;
  const priority = PRIORITY_META[p.priority];
  const injury  = injuryLevel(p.injuryRisk);
  const pc = potColor(p.potential);

  const radarData = [
    { subject: "Vitesse",  A: p.speed    },
    { subject: "Dribble",  A: p.dribble  },
    { subject: "Passes",   A: p.passing  },
    { subject: "Défense",  A: p.defense  },
    { subject: "Physique", A: p.physical },
    { subject: "Mental",   A: p.mental   },
  ];

  const trendData = p.monthlyPotential.map((v, i) => ({
    month: ["Jan","Fév","Mar","Avr","Mai","Jun"][i],
    potentiel: v,
  }));

  const addNote = () => {
    const text = newNote.trim();
    if (!text) return;
    const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    setNotes(prev => [{ date: today, text }, ...(prev ?? [])]);
    setNewNote("");
  };

  const heatPositions: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
    "Attaque gauche":   { cx: 80,  cy: 80,  rx: 72, ry: 58 },
    "Axe central att.": { cx: 210, cy: 90,  rx: 75, ry: 58 },
    "Attaque droite":   { cx: 340, cy: 80,  rx: 72, ry: 58 },
    "Milieu offensif":  { cx: 210, cy: 200, rx: 115, ry: 58 },
    "Milieu central":   { cx: 210, cy: 290, rx: 115, ry: 58 },
    "Défense":          { cx: 210, cy: 430, rx: 155, ry: 90 },
  };

  return (
    <motion.div className="space-y-5"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>

      {/* ── PLAYER HERO CARD ─────────────────────────────────────── */}
      <motion.div className="relative overflow-hidden rounded-[28px] border"
        style={{
          background: "var(--surface-panel-solid)",
          borderColor: `${priority.color}30`,
          boxShadow: `0 0 60px ${priority.color}10, 0 20px 60px rgba(0,0,0,0.4)`,
        }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>

        {/* Decorative gradient top strip */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px]"
          style={{ background: `linear-gradient(90deg,${priority.color},${S.primary},${priority.color})` }} />

        {/* Background glow orb */}
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full opacity-10 blur-3xl"
          style={{ background: priority.color }} />

        <div className="relative p-6">
          {/* Back + Like */}
          <div className="flex items-center justify-between mb-6">
            <motion.button type="button" onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
              whileHover={{ scale: 1.06, borderColor: priority.color, color: priority.color }}>
              <ArrowLeft size={12} /> Retour
            </motion.button>
            <motion.button type="button" onClick={async () => {
              if (!p) return;
              try {
                if (liked) {
                  await scoutApi.removeFromWatchlist(p.id);
                  setLiked(false);
                  showToast("Retiré de la Watchlist", "info");
                } else {
                  await scoutApi.addToWatchlist(p.id);
                  setLiked(true);
                  showToast("Ajouté à la Watchlist ✓", "success");
                }
              } catch {
                showToast("Erreur watchlist", "error");
              }
            }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border"
              style={{
                borderColor: liked ? `${S.danger}50` : "rgba(255,255,255,0.1)",
                background: liked ? `${S.danger}10` : "transparent",
              }}
              whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}>
              <Heart size={16} fill={liked ? S.danger : "none"} style={{ color: liked ? S.danger : "var(--text-muted)" }} />
            </motion.button>
          </div>

          <div className="flex flex-wrap items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <ScoutPlayerPhoto name={p.name} photoUrl={photoUrl} size={96} accent={priority.color} />
              <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-xl border-2 border-[var(--surface-panel-solid)] text-[10px] font-black text-white"
                style={{ background: priority.color }}>
                P.{p.priority}
              </div>
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-[180px]">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </h1>
                {liveSource && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-black"
                    style={{ background: `${S.success}20`, color: S.success }}>
                    {liveSource === "api-football" ? "API-Sports live" : "Flashscore backend"}
                  </span>
                )}
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-white"
                  style={{ background: priority.color }}>P.{p.priority}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {p.flag} {p.nationality}
                </span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {p.position}
                </span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {p.age} ans
                </span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {p.height} cm · {p.weight} kg
                </span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Pied {p.foot}
                </span>
              </div>

              {/* Club pill */}
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  🏟 {p.club} · {p.league}
                </span>
                {p.agent && (
                  <span className="flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold"
                    style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                    🤝 {p.agent}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: "Comparer", path: `/scout/comparison?ids=${p.id}`, color: S.info },
                  { label: "Mission", path: `/scout/missions?prospectId=${p.id}`, color: "#F59E0B" },
                  { label: "Vidéos", path: "/scout/videos", color: S.accent },
                  { label: "Compatibilité", path: "/scout/squad-fit", color: S.success },
                  { label: "Rapport", path: `/scout/report?prospectId=${p.id}`, color: S.primary },
                ].map((action) => (
                  <motion.button key={action.label} type="button" onClick={() => navigate(action.path)}
                    className="rounded-xl border px-3 py-1.5 text-[10px] font-bold"
                    style={{ borderColor: `${action.color}35`, color: action.color, background: `${action.color}08` }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Right stats cluster */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Potential big display */}
              <motion.div className="relative text-center"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
                <p className="text-5xl font-black leading-none" style={{ color: pc }}>{p.potential}</p>
                <p className="text-[9px] font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>POTENTIEL</p>
                <div className="mt-1 flex justify-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={9} fill={s <= Math.round(p.potential/20) ? pc : "none"}
                      style={{ color: pc, opacity: s <= Math.round(p.potential/20) ? 1 : 0.3 }} />
                  ))}
                </div>
              </motion.div>

              {/* Market value */}
              <div className="text-right">
                <p className="text-lg font-extrabold" style={{ color: S.success }}>{p.marketValue}</p>
                <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Valeur marchande</p>
              </div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Target,   label: "Buts",       value: p.goals,   color: S.success },
              { icon: Zap,      label: "Passes D.",   value: p.assists, color: S.info    },
              { icon: Activity, label: "Matchs",      value: p.matches, color: S.primary },
              { icon: Shield,   label: "IA Score",    value: `${p.aiScore}%`, color: pc  },
            ].map((s, i) => (
              <motion.div key={s.label} className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}
                whileHover={{ scale: 1.03, y: -1 }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${s.color}15` }}>
                  <s.icon size={15} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Bottom info row ── */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Injury risk pill */}
            <motion.div className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{ background: injury.bg, borderColor: `${injury.color}30` }}
              animate={{ boxShadow: p.injuryRisk > 25 ? [`0 0 0px ${injury.color}00`, `0 0 12px ${injury.color}40`, `0 0 0px ${injury.color}00`] : undefined }}
              transition={{ duration: 2, repeat: Infinity }}>
              <div className="h-2 w-2 rounded-full" style={{ background: injury.color }} />
              <p className="text-[11px] font-bold" style={{ color: injury.color }}>
                Risque blessure: {p.injuryRisk}% — {injury.label}
              </p>
            </motion.div>

            {/* Contract */}
            <div className="flex items-center gap-2 rounded-xl border px-3 py-1.5"
              style={{
                background: p.contractEnd <= "2026-12" ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
                borderColor: p.contractEnd <= "2026-12" ? `${S.danger}25` : "rgba(255,255,255,0.1)",
              }}>
              <div className="h-2 w-2 rounded-full" style={{ background: p.contractEnd <= "2026-12" ? S.danger : S.success }} />
              <p className="text-[11px] font-bold" style={{ color: p.contractEnd <= "2026-12" ? S.danger : "var(--text-muted)" }}>
                Contrat jusqu'à {p.contractEnd}
              </p>
            </div>

            {/* Notes count */}
            <div className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5"
              style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}>
              <CheckCircle2 size={11} style={{ color: S.primary }} />
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {safeNotes.length} note{safeNotes.length !== 1 ? "s" : ""} scout
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TABS ── */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map(tab => (
          <motion.button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className="relative rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap overflow-hidden"
            style={{
              background: activeTab === tab ? `${S.primary}14` : "rgba(255,255,255,0.03)",
              color: activeTab === tab ? S.primary : "var(--text-muted)",
              border: "1px solid var(--surface-panel-border)",
            }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
            {activeTab === tab && (
              <motion.div className="absolute inset-0 rounded-xl"
                style={{ background: `linear-gradient(135deg,${S.primary}08,transparent)` }}
                layoutId="activeTab" />
            )}
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>

          {/* ── PERFORMANCE ── */}
          {activeTab === "Performance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Radar */}
                <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                  <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Profil attributs</p>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                        <Radar dataKey="A" stroke={priority.color} fill={priority.color} fillOpacity={0.2} strokeWidth={2.5}
                          animationDuration={1200} />
                        <Tooltip {...SCOUT_TOOLTIP} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Potential trend */}
                <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                  <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Évolution potentiel</p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <defs>
                          <linearGradient id="potGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={pc} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={pc} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[70, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip {...SCOUT_TOOLTIP} />
                        <Line type="monotone" dataKey="potentiel" stroke={pc} strokeWidth={2.5}
                          dot={{ fill: pc, r: 4, strokeWidth: 2, stroke: "var(--surface-panel-solid)" }}
                          animationDuration={1200} name="Potentiel" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Attributes bars */}
              <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                <p className="mb-4 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Attributs détaillés</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { label: "Vitesse",   value: p.speed,    color: S.danger  },
                    { label: "Dribble",   value: p.dribble,  color: S.primary },
                    { label: "Passes",    value: p.passing,  color: S.info    },
                    { label: "Défense",   value: p.defense,  color: S.success },
                    { label: "Physique",  value: p.physical, color: S.primary },
                    { label: "Mental",    value: p.mental,   color: S.info    },
                  ].map((a, ai) => (
                    <motion.div key={a.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ai * 0.05 }}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span style={{ color: "var(--text-muted)" }}>{a.label}</span>
                        <span className="font-extrabold" style={{ color: a.color }}>{a.value}</span>
                      </div>
                      <SGauge value={a.value} color={a.color} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats bar chart */}
              <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Performance saison</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Buts",   v: p.goals,    c: S.success },
                      { name: "Assist", v: p.assists,  c: S.info    },
                      { name: "Matchs", v: p.matches,  c: S.primary },
                    ]} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip {...SCOUT_TOOLTIP} />
                      <Bar dataKey="v" radius={[6,6,0,0]} animationDuration={1000}>
                        {[S.success, S.info, S.primary].map((c, i) => <Cell key={i} fill={c} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ── HEATMAP ── */}
          {activeTab === "Heatmap" && (
            <div className="space-y-4">
              <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Heatmap — {p.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Zones d'action · {p.matches} matchs analysés
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1"
                    style={{ background: "rgba(255,122,0,0.08)", borderColor: "rgba(255,122,0,0.2)" }}>
                    <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: S.primary }} />
                    <span className="text-[10px] font-bold" style={{ color: S.primary }}>Live tracking</span>
                  </div>
                </div>

                {/* SVG Football Pitch Heatmap */}
                <div className="relative mx-auto" style={{ maxWidth: 460 }}>
                  <svg viewBox="0 0 420 600" style={{ width: "100%", borderRadius: 16 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0a1e12" />
                        <stop offset="50%" stopColor="#0d2515" />
                        <stop offset="100%" stopColor="#0a1e12" />
                      </linearGradient>
                      <pattern id="pitchStripes" x="0" y="0" width="420" height="60" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="420" height="30" fill="rgba(255,255,255,0.018)" />
                        <rect x="0" y="30" width="420" height="30" fill="rgba(0,0,0,0.0)" />
                      </pattern>
                      <filter id="heatBlur">
                        <feGaussianBlur stdDeviation="14" />
                      </filter>
                      <filter id="heatBlurMed">
                        <feGaussianBlur stdDeviation="8" />
                      </filter>
                    </defs>

                    {/* Grass */}
                    <rect x="0" y="0" width="420" height="600" fill="url(#pitchGrad)" rx="16" />
                    <rect x="0" y="0" width="420" height="600" fill="url(#pitchStripes)" rx="16" />

                    {/* Heat blobs — blurred layer */}
                    <g filter="url(#heatBlur)">
                      {p.heatmapZones.map((z) => {
                        const pos = heatPositions[z.zone];
                        if (!pos) return null;
                        const hc = heatColor(z.intensity);
                        const alpha = (z.intensity / 100) * 0.8;
                        const r = alpha.toFixed(2);
                        const fill = hc.fill.replace(/[\d.]+\)$/, `${r})`);
                        return (
                          <ellipse key={z.zone} cx={pos.cx} cy={pos.cy} rx={pos.rx * 1.3} ry={pos.ry * 1.3}
                            fill={fill} />
                        );
                      })}
                    </g>

                    {/* Heat blobs — crisp inner layer */}
                    {p.heatmapZones.map((z) => {
                      const pos = heatPositions[z.zone];
                      if (!pos) return null;
                      const hc = heatColor(z.intensity);
                      const alpha = Math.min((z.intensity / 100) * 0.9, 0.92);
                      return (
                        <g key={`c-${z.zone}`}>
                          <ellipse cx={pos.cx} cy={pos.cy} rx={pos.rx * 0.6} ry={pos.ry * 0.6}
                            fill={hc.fill.replace(/[\d.]+\)$/, `${alpha})`)} />
                        </g>
                      );
                    })}

                    {/* Pitch lines */}
                    <rect x="20" y="20" width="380" height="560" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" rx="4" />
                    <line x1="20" y1="300" x2="400" y2="300" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" />
                    <circle cx="210" cy="300" r="52" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
                    <circle cx="210" cy="300" r="4" fill="rgba(255,255,255,0.4)" />
                    {/* Top penalty */}
                    <rect x="90" y="20" width="240" height="88" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
                    <rect x="150" y="20" width="120" height="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
                    <circle cx="210" cy="78" r="3" fill="rgba(255,255,255,0.3)" />
                    {/* Top goal */}
                    <rect x="175" y="9" width="70" height="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" rx="2" />
                    {/* Bottom penalty */}
                    <rect x="90" y="492" width="240" height="88" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
                    <rect x="150" y="538" width="120" height="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.2" />
                    <circle cx="210" cy="524" r="3" fill="rgba(255,255,255,0.3)" />
                    {/* Bottom goal */}
                    <rect x="175" y="577" width="70" height="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" rx="2" />
                    {/* Corners */}
                    {[[20,20],[400,20],[20,580],[400,580]].map(([cx,cy],i) => (
                      <path key={i} d={`M ${cx} ${cy + (cy < 300 ? 12 : -12)} A 12 12 0 0 ${cx > 200 ? 0 : 1} ${cx + (cx > 200 ? -12 : 12)} ${cy}`}
                        fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
                    ))}

                    {/* Zone labels */}
                    {p.heatmapZones.map((z) => {
                      const pos = heatPositions[z.zone];
                      if (!pos) return null;
                      const hc = heatColor(z.intensity);
                      return (
                        <g key={`label-${z.zone}`}>
                          <rect x={pos.cx - 28} y={pos.cy - 12} width="56" height="24" rx="8"
                            fill="rgba(0,0,0,0.6)" stroke={`${hc.stroke}60`} strokeWidth="1" />
                          <text x={pos.cx} y={pos.cy - 2} textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700">
                            {z.zone.replace("central","cent.").replace("offensif","off.")}
                          </text>
                          <text x={pos.cx} y={pos.cy + 8} textAnchor="middle" fill={hc.stroke} fontSize="8" fontWeight="900">
                            {z.intensity}%
                          </text>
                        </g>
                      );
                    })}

                    {/* Attaque arrow */}
                    <text x="210" y="55" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="600" letterSpacing="3">ATTAQUE ↑</text>
                    <text x="210" y="568" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="8" fontWeight="600" letterSpacing="3">↓ DÉFENSE</text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  {[
                    { label: "Zone critique (80-100%)", color: S.danger  },
                    { label: "Zone active (60-80%)",   color: S.primary  },
                    { label: "Zone modérée (40-60%)",  color: S.info     },
                    { label: "Zone rare (<40%)",       color: S.success  },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[9px]">
                      <span className="h-2 w-5 rounded-full" style={{ background: l.color, opacity: 0.8 }} />
                      <span style={{ color: "var(--text-muted)" }}>{l.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Zone breakdown */}
              <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Breakdown par zone</p>
                <div className="space-y-2">
                  {[...p.heatmapZones].sort((a, b) => b.intensity - a.intensity).map((z, i) => {
                    const hc = heatColor(z.intensity);
                    return (
                      <motion.div key={z.zone} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3">
                        <p className="text-[10px] w-36 shrink-0" style={{ color: "var(--text-muted)" }}>{z.zone}</p>
                        <div className="flex-1">
                          <SGauge value={z.intensity} color={hc.stroke} />
                        </div>
                        <p className="text-[10px] font-extrabold w-8 text-right" style={{ color: hc.stroke }}>{z.intensity}%</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {activeTab === "Historique" && (
            <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
              <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique matchs</p>
              <div className="space-y-2">
                {p.matchHistory.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
                    Aucun match disponible pour cette saison.
                  </p>
                ) : p.matchHistory.map((m, i) => {
                  const ratingColor = m.rating >= 8 ? S.success : m.rating >= 7 ? S.primary : S.danger;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4 rounded-[16px] border p-4"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}
                      whileHover={{ borderColor: `${ratingColor}25`, x: 2 }}>
                      <div className="w-20 shrink-0">
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{m.match}</p>
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{m.date}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Star size={12} fill={ratingColor} style={{ color: ratingColor }} />
                        <p className="text-xl font-extrabold" style={{ color: ratingColor }}>{m.rating}</p>
                      </div>
                      <div className="flex flex-1 justify-around text-center">
                        {[
                          { label: "Buts",    value: m.goals   },
                          { label: "Assist.", value: m.assists  },
                          { label: "Min.",    value: m.minutes  },
                        ].map(s => (
                          <div key={s.label}>
                            <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                            <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="w-28 shrink-0">
                        <SGauge value={m.rating * 10} color={ratingColor} max={100} />
                        <p className="text-[8px] mt-0.5 text-right" style={{ color: "var(--text-muted)" }}>
                          {m.rating >= 8 ? "Excellent" : m.rating >= 7 ? "Bon" : "Passable"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Season summary */}
              {p.matchHistory.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-[16px] border p-4"
                style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                {[
                  {
                    label: "Moy. rating",
                    value: (p.matchHistory.reduce((a, m) => a + m.rating, 0) / p.matchHistory.length).toFixed(1),
                    color: S.success,
                  },
                  { label: "Total buts",  value: p.matchHistory.reduce((a, m) => a + m.goals, 0),   color: S.primary },
                  { label: "Total min.",  value: p.matchHistory.reduce((a, m) => a + m.minutes, 0), color: S.info    },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* ── NOTES ── */}
          {activeTab === "Notes" && (
            <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
              <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Notes privées scout</p>
              <div className="flex gap-2 mb-4">
                <input value={newNote} onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addNote()}
                  placeholder="Observation, qualité, risque... (Entrée pour valider)"
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: `${S.primary}30`, color: "var(--text-primary)" }} />
                <motion.button type="button" onClick={addNote}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Plus size={13} /> Ajouter
                </motion.button>
              </div>
              {safeNotes.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {safeNotes.map((note, ni) => (
                      <motion.div key={ni} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="group flex items-start gap-3 rounded-[14px] border p-3"
                        style={{ background: "rgba(255,122,0,0.03)", borderColor: "rgba(255,122,0,0.15)" }}
                        whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: S.primary }} />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold mb-0.5" style={{ color: S.primary }}>{note.date}</p>
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{note.text}</p>
                        </div>
                        <motion.button type="button"
                          onClick={() => setNotes(prev => (prev ?? []).filter((_, i) => i !== ni))}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          whileHover={{ scale: 1.2 }}>
                          <X size={12} style={{ color: S.danger }} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12">
                  <Brain size={32} className="mb-2 opacity-20" style={{ color: S.primary }} />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune note — saisissez votre première observation</p>
                </div>
              )}
            </div>
          )}

          {/* ── VIDÉO (profil SaaS média) ── */}
          {activeTab === "Vidéo" && (
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  onImportVideo(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />

              {/* Header profil média */}
              <div
                className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Médias · {p.name}
                  </p>
                  <h2 className="mt-0.5 text-base font-bold" style={{ color: "var(--text-primary)" }}>
                    Bibliothèque vidéo
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {reels.length} reels IA · {videos.length} clips scout · {p.club}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold"
                    style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
                  >
                    <Sparkles size={11} style={{ color: S.accent }} />
                    ODIN AI
                  </span>
                  <motion.button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                    style={{ background: S.primary }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Video size={12} /> Importer
                  </motion.button>
                </div>
              </div>

              {/* Lecteur in-site */}
              <div
                ref={playerRef}
                className="border-b px-5 py-5"
                style={{ borderColor: "var(--surface-panel-border)", background: "rgba(0,0,0,0.18)" }}
              >
                {playing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                          Lecture · {playing.kind === "upload" ? "Import local" : playing.kind === "reel" ? "Reel" : "Clip"}
                        </p>
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {playing.title}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (playing.localUrl) URL.revokeObjectURL(playing.localUrl);
                          setPlaying(null);
                        }}
                        className="rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                        style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
                      >
                        Fermer
                      </button>
                    </div>

                    <div
                      className={`relative mx-auto w-full overflow-hidden rounded-xl border bg-black ${
                        playing.kind === "reel" ? "max-w-sm aspect-[9/16]" : "aspect-video"
                      }`}
                      style={{ borderColor: "var(--surface-panel-border)" }}
                    >
                      {playing.loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <motion.div
                            className="h-6 w-6 rounded-full border-2"
                            style={{ borderColor: `${S.primary}40`, borderTopColor: S.primary }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          />
                          Recherche de la vidéo…
                        </div>
                      ) : playing.localUrl ? (
                        <video
                          key={playing.localUrl}
                          src={playing.localUrl}
                          controls
                          autoPlay
                          className="h-full w-full object-contain"
                        />
                      ) : playing.embedUrl ? (
                        <iframe
                          key={playing.embedUrl}
                          title={playing.title}
                          src={playing.embedUrl}
                          className="absolute inset-0 h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                        />
                      ) : playing.notFound ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                          <Video size={26} className="opacity-40" style={{ color: "var(--text-muted)" }} />
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Aucune vidéo intégrable trouvée automatiquement.
                          </p>
                          {playing.searchUrl && (
                            <a
                              href={playing.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
                              style={{ background: S.primary }}
                            >
                              Ouvrir sur YouTube
                            </a>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <Video size={28} className="mb-2 opacity-35" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sélectionnez une vidéo</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Cliquez un reel ou un clip pour le lire ici
                    </p>
                  </div>
                )}
              </div>

              {/* Reels — grille SaaS */}
              <div className="border-b px-5 py-5" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Reels suggérés</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Lecture intégrée sur le profil
                    </p>
                  </div>
                </div>

                {reels.length === 0 ? (
                  <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    Aucun reel disponible pour ce profil.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {reels.map((reel, i) => {
                      const selected = playing?.id === reel.id;
                      return (
                        <motion.button
                          key={reel.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => void openYoutubeInSite(reel.id, reel.title, reel.query, "reel")}
                          className="group text-left"
                        >
                          <div
                            className="relative aspect-[9/14] overflow-hidden rounded-xl border"
                            style={{
                              borderColor: selected ? S.primary : "var(--surface-panel-border)",
                              boxShadow: selected ? `0 0 0 1px ${S.primary}` : undefined,
                              background: "rgba(255,255,255,0.03)",
                            }}
                          >
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-55"
                              />
                            ) : null}
                            <div
                              className="absolute inset-0"
                              style={{
                                background: photoUrl
                                  ? "linear-gradient(180deg, transparent 35%, rgba(6,8,16,0.92) 100%)"
                                  : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(6,8,16,0.9) 100%)",
                              }}
                            />
                            <div className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-white/90"
                              style={{ background: "rgba(0,0,0,0.5)" }}>
                              {reel.duration}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <div
                                className="flex h-9 w-9 items-center justify-center rounded-full text-xs text-white"
                                style={{ background: S.primary }}
                              >
                                ▶
                              </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-2.5">
                              <p className="text-[10px] font-semibold leading-snug text-white line-clamp-2">{reel.title}</p>
                              <div className="mt-1.5 flex items-center justify-between gap-1">
                                <span className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                                  {reel.tag}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Clips scout — liste profil */}
              <div className="px-5 py-5">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Clips & highlights</p>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Lecture intégrée · import local possible
                    </p>
                  </div>
                </div>

                {videos.length === 0 ? (
                  <div
                    className="rounded-xl border border-dashed px-4 py-10 text-center"
                    style={{ borderColor: "var(--surface-panel-border)" }}
                  >
                    <Video size={20} className="mx-auto mb-2 opacity-40" style={{ color: "var(--text-muted)" }} />
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucun clip scout pour l’instant</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--surface-panel-border)" }}>
                    {videos.map((v, i) => {
                      const clipId = `clip-${i}`;
                      const selected = playing?.id === clipId;
                      return (
                        <motion.button
                          key={clipId}
                          type="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() =>
                            void openYoutubeInSite(
                              clipId,
                              v.title,
                              `${p.name} ${p.club} ${v.type} football highlights`,
                              "clip",
                            )
                          }
                          className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]"
                          style={{
                            borderTop: i === 0 ? undefined : "1px solid var(--surface-panel-border)",
                            background: selected ? `${S.primary}10` : undefined,
                          }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--surface-panel-border)" }}
                          >
                            {v.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                              {v.title}
                            </p>
                            <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                              {v.type} · {v.duration}
                            </p>
                          </div>
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] text-white"
                            style={{ background: S.primary }}
                          >
                            ▶
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-[11px] font-semibold transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
                >
                  <Video size={13} />
                  Ajouter un clip scout
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
