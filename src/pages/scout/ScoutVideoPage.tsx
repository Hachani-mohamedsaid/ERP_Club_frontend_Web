import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Film, Play, Clock, Search, Upload, Eye } from "lucide-react";
import { ScoutPage, SCard, SBadge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto, resolveScoutPhotoUrl } from "../../components/scout/ScoutPlayerPhoto";
import { S } from "../../data/scoutData";
import { useScoutProspects } from "../../hooks/useScoutData";

const VIDEO_LIBRARY = [
  { id: "v1", prospectId: "", player: "Youssef Ben Ali", flag: "🇹🇳", pos: "BU", title: "Buts & accélérations — ES Sahel", duration: "2:34", type: "Highlights", date: "18/06/2026", tags: ["Buts", "Vitesse", "Pressing"] },
  { id: "v2", prospectId: "", player: "Youssef Ben Ali", flag: "🇹🇳", pos: "BU", title: "Jeu de tête & duels aériens", duration: "1:48", type: "Technique", date: "14/06/2026", tags: ["Aérien", "Physique"] },
  { id: "v3", prospectId: "", player: "Nader Trabelsi", flag: "🇹🇳", pos: "MC", title: "Passes décisives & vision", duration: "3:12", type: "Technique", date: "17/06/2026", tags: ["Passes", "Vision"] },
  { id: "v4", prospectId: "", player: "Ibrahim Touré", flag: "🇸🇳", pos: "MC", title: "Transitions offensives", duration: "2:55", type: "Tactique", date: "17/06/2026", tags: ["Transition", "MC"] },
  { id: "v5", prospectId: "", player: "Mouhamed Diallo", flag: "🇨🇮", pos: "Ailier G", title: "1v1 & dribbles côté gauche", duration: "2:10", type: "Highlights", date: "15/06/2026", tags: ["Dribble", "Ailier"] },
  { id: "v6", prospectId: "", player: "Karim Sassi", flag: "🇹🇳", pos: "DC", title: "Jeu aérien défensif", duration: "1:35", type: "Défense", date: "16/06/2026", tags: ["DC", "Aérien"] },
];

const TYPE_COLORS: Record<string, string> = {
  Highlights: S.primary,
  Technique: S.info,
  Tactique: S.success,
  Défense: "#8B5CF6",
  "Scout Report": S.accent,
};

export function ScoutVideoPage() {
  const navigate = useNavigate();
  const { prospects } = useScoutProspects();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Tous");
  const [playing, setPlaying] = useState<string | null>(null);

  const videos = useMemo(() => {
    return VIDEO_LIBRARY.map((v) => {
      const p = prospects.find((pr) => pr.name === v.player);
      return { ...v, prospectId: p?.id ?? "", photoUrl: p?.photoUrl ?? null };
    });
  }, [prospects]);

  const types = ["Tous", ...Array.from(new Set(videos.map((v) => v.type)))];

  const filtered = videos.filter((v) => {
    if (filterType !== "Tous" && v.type !== filterType) return false;
    if (search && !v.player.toLowerCase().includes(search.toLowerCase()) && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = videos.find((v) => v.id === playing);

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Film size={20} style={{ color: S.primary }} /> Vidéothèque Scout
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Clips match, highlights et rapports vidéo par joueur
          </p>
        </div>
        <motion.button
          type="button"
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: S.primary }}
          whileTap={{ scale: 0.96 }}
        >
          <Upload size={14} /> Importer clip
        </motion.button>
      </div>

      {/* Player preview */}
      {active && (
        <SCard className="!p-0 overflow-hidden" glow>
          <div className="relative aspect-video flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,var(--surface-panel-solid),rgba(20,15,45,0.98))" }}>
            <div className="text-center">
              <motion.div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: `${S.primary}25`, border: `2px solid ${S.primary}` }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Play size={28} style={{ color: S.primary }} fill={S.primary} />
              </motion.div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{active.title}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                {active.player} · {active.duration} · {active.date}
              </p>
            </div>
            <button type="button" onClick={() => setPlaying(null)}
              className="absolute top-3 right-3 text-xs opacity-60 hover:opacity-100" style={{ color: "var(--text-muted)" }}>
              Fermer
            </button>
          </div>
          <div className="p-4 flex flex-wrap items-center gap-3">
            <ScoutPlayerPhoto
              name={active.player}
              photoUrl={resolveScoutPhotoUrl(active.player, active.photoUrl, prospects)}
              size={48}
              accent={S.primary}
            />
            <div className="flex flex-wrap gap-2 flex-1">
            {active.tags.map((t) => (
              <SBadge key={t} color={S.info} bg={`${S.info}12`}>{t}</SBadge>
            ))}
            </div>
            {active.prospectId && (
              <motion.button
                type="button"
                onClick={() => navigate(`/scout/prospect/${active.prospectId}`)}
                className="ml-auto flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold"
                style={{ background: `${S.primary}15`, color: S.primary }}
              >
                <Eye size={11} /> Voir profil
              </motion.button>
            )}
          </div>
        </SCard>
      )}

      {/* Search & filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher joueur ou clip..."
            className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
        </div>
        {types.map((t) => (
          <motion.button key={t} type="button" onClick={() => setFilterType(t)}
            className="rounded-full px-3 py-1.5 text-[10px] font-bold"
            style={{
              background: filterType === t ? S.primary : "rgba(255,255,255,0.05)",
              color: filterType === t ? "white" : "var(--text-muted)",
            }}
            whileTap={{ scale: 0.95 }}>
            {t}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => {
          const typeColor = TYPE_COLORS[v.type] ?? S.accent;
          return (
            <motion.div key={v.id}
              className="rounded-[18px] border overflow-hidden cursor-pointer"
              style={{ background: "rgba(12,9,30,0.92)", borderColor: "var(--surface-panel-border)" }}
              whileHover={{ y: -3, borderColor: `${typeColor}40` }}
              onClick={() => setPlaying(v.id)}>
              <div className="relative aspect-video flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,${typeColor}08,transparent)` }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: `${typeColor}20`, border: `1px solid ${typeColor}50` }}>
                  <Play size={18} style={{ color: typeColor }} />
                </div>
                <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: "rgba(0,0,0,0.7)", color: "white" }}>
                  <Clock size={9} /> {v.duration}
                </span>
                <span className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[8px] font-bold"
                  style={{ background: `${typeColor}25`, color: typeColor }}>
                  {v.type}
                </span>
              </div>
              <div className="p-3 flex items-start gap-3">
                <ScoutPlayerPhoto
                  name={v.player}
                  photoUrl={resolveScoutPhotoUrl(v.player, v.photoUrl, prospects)}
                  size={40}
                  accent={typeColor}
                />
                <div className="min-w-0 flex-1">
                <p className="text-xs font-bold line-clamp-2" style={{ color: "var(--text-primary)" }}>{v.title}</p>
                <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                  {v.flag} {v.player} · {v.pos} · {v.date}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {v.tags.slice(0, 2).map((t) => (
                    <span key={t} className="text-[8px] rounded-full px-2 py-0.5 font-bold"
                      style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScoutPage>
  );
}
