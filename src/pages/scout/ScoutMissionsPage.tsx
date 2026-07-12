import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin, Calendar, Plus, Target, Clock, ChevronDown, Search, FileText, X, Sparkles,
} from "lucide-react";
import { ScoutPage, SCard, SBadge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto, resolveScoutPhotoUrl } from "../../components/scout/ScoutPlayerPhoto";
import { S } from "../../data/scoutData";
import { scoutApi, type ScoutMissionDto, type ScoutProspectDto } from "../../lib/api/scout";
import { useScoutProspects } from "../../hooks/useScoutData";
import { showToast } from "../../components/scout/ScoutToast";

const MISSION_TYPES = [
  { id: "live", label: "Observation live", hint: "Match en stade" },
  { id: "video", label: "Analyse vidéo", hint: "Clip / replay" },
  { id: "tour", label: "Tour scouting", hint: "Multi-matchs" },
] as const;

const FOCUS_CHIPS = [
  "Pressing",
  "1v1",
  "Jeu aérien",
  "Passes décisives",
  "Transitions",
  "Défense",
  "Finishing",
  "Attitude",
];

const STADIUMS: Record<string, string> = {
  arsenal: "Emirates Stadium, Londres",
  chelsea: "Stamford Bridge, Londres",
  liverpool: "Anfield, Liverpool",
  "manchester city": "Etihad Stadium, Manchester",
  "manchester united": "Old Trafford, Manchester",
  "ajax amsterdam": "Johan Cruyff Arena, Amsterdam",
  "as monaco": "Stade Louis-II, Monaco",
  "crystal palace": "Selhurst Park, Londres",
  brighton: "Amex Stadium, Brighton",
  "ipswich town": "Portman Road, Ipswich",
  "rb salzburg": "Red Bull Arena, Salzbourg",
  "us lecce": "Stadio Via del Mare, Lecce",
  "paris fc": "Stade Charléty, Paris",
  burnley: "Turf Moor, Burnley",
  "leeds united": "Elland Road, Leeds",
  palmeiras: "Allianz Parque, São Paulo",
  barcelona: "Spotify Camp Nou, Barcelone",
  "real madrid": "Santiago Bernabéu, Madrid",
};

const RIVALS: Record<string, string> = {
  arsenal: "Chelsea",
  chelsea: "Arsenal",
  liverpool: "Manchester City",
  "manchester city": "Liverpool",
  "manchester united": "Liverpool",
  "ajax amsterdam": "Feyenoord",
  "as monaco": "PSG",
  "crystal palace": "Brighton",
  brighton: "Crystal Palace",
  "ipswich town": "Norwich",
  "rb salzburg": "Sturm Graz",
  "us lecce": "Napoli",
  "paris fc": "PSG",
  burnley: "Sheffield United",
  "leeds united": "Sheffield Wednesday",
  palmeiras: "Flamengo",
  barcelona: "Real Madrid",
  "real madrid": "Barcelona",
};

function formatMissionDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nextWeekendDate() {
  const d = new Date();
  const day = d.getDay();
  const add = day === 0 ? 6 : day === 6 ? 7 : 6 - day;
  d.setDate(d.getDate() + add);
  return d.toISOString().split("T")[0];
}

function clubKey(club: string) {
  return club.toLowerCase().trim();
}

function suggestOpponent(club: string) {
  const key = clubKey(club);
  return (
    RIVALS[key] ??
    Object.entries(RIVALS).find(([k]) => key.includes(k) || k.includes(key))?.[1] ??
    "Adversaire"
  );
}

function suggestStadium(club: string) {
  const key = clubKey(club);
  return (
    STADIUMS[key] ??
    Object.entries(STADIUMS).find(([k]) => key.includes(k) || k.includes(key))?.[1] ??
    `Stade — ${club}`
  );
}

function buildTitle(
  missionType: (typeof MISSION_TYPES)[number]["id"],
  name: string,
  club: string,
  opponent: string,
) {
  const typeLabel =
    missionType === "video"
      ? "Analyse vidéo"
      : missionType === "tour"
        ? "Tour scouting"
        : "Observation";
  return `${typeLabel} ${name} — ${club} vs ${opponent}`;
}

function emptyForm() {
  return {
    prospectId: "",
    prospectName: "",
    title: "",
    date: nextWeekendDate(),
    time: "18:30",
    location: "",
    opponent: "",
    missionType: "live" as (typeof MISSION_TYPES)[number]["id"],
    focus: [] as string[],
    notes: "",
  };
}

export function ScoutMissionsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { prospects } = useScoutProspects();
  const [missions, setMissions] = useState<ScoutMissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerQuery, setPlayerQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  const selectedProspect = useMemo(
    () => prospects.find((p) => p.id === form.prospectId) ?? null,
    [prospects, form.prospectId],
  );

  const load = useCallback(() => {
    setLoading(true);
    scoutApi
      .getMissions()
      .then(setMissions)
      .catch(() => showToast("Erreur chargement missions", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyProspect = useCallback((p: ScoutProspectDto, missionType?: (typeof MISSION_TYPES)[number]["id"]) => {
    const opponent = suggestOpponent(p.club);
    const location = suggestStadium(p.club);
    setForm((prev) => {
      const resolvedType = missionType ?? prev.missionType;
      return {
        ...prev,
        missionType: resolvedType,
        prospectId: p.id,
        prospectName: p.name,
        opponent,
        location,
        title: buildTitle(resolvedType, p.name, p.club, opponent),
        notes:
          prev.notes ||
          `Focus ${p.position} · Potentiel ${p.potential} · Vérifier intensité 90 min.`,
      };
    });
    setPlayerOpen(false);
    setPlayerQuery("");
  }, []);

  const setMissionType = (id: (typeof MISSION_TYPES)[number]["id"]) => {
    setForm((prev) => {
      if (!selectedProspect) return { ...prev, missionType: id };
      return {
        ...prev,
        missionType: id,
        title: buildTitle(id, selectedProspect.name, selectedProspect.club, prev.opponent || suggestOpponent(selectedProspect.club)),
      };
    });
  };

  const setOpponent = (opponent: string) => {
    setForm((prev) => {
      if (!selectedProspect) return { ...prev, opponent };
      return {
        ...prev,
        opponent,
        title: buildTitle(prev.missionType, selectedProspect.name, selectedProspect.club, opponent || "Adversaire"),
      };
    });
  };

  // Prefill from URL or open form
  useEffect(() => {
    const wanted = searchParams.get("prospectId") || searchParams.get("id");
    if (!wanted || prospects.length === 0) return;
    const p = prospects.find((x) => x.id === wanted);
    if (!p) return;
    setShowForm(true);
    applyProspect(p);
  }, [searchParams, prospects, applyProspect]);

  const filteredProspects = useMemo(() => {
    const q = playerQuery.trim().toLowerCase();
    const list = [...prospects].sort((a, b) => b.potential - a.potential);
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q),
    );
  }, [prospects, playerQuery]);

  const toggleFocus = (chip: string) => {
    setForm((prev) => ({
      ...prev,
      focus: prev.focus.includes(chip)
        ? prev.focus.filter((c) => c !== chip)
        : [...prev.focus, chip],
    }));
  };

  const openNewForm = () => {
    if (showForm) {
      setShowForm(false);
      return;
    }
    setForm(emptyForm());
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.prospectName.trim()) {
      showToast("Sélectionnez un joueur cible", "error");
      return;
    }
    if (!form.title.trim()) {
      showToast("Titre requis", "error");
      return;
    }
    if (!form.date) {
      showToast("Date requise", "error");
      return;
    }

    const focusLine = form.focus.length ? `Focus: ${form.focus.join(", ")}.` : "";
    const notes = [form.notes.trim(), focusLine].filter(Boolean).join(" ");

    setSubmitting(true);
    try {
      await scoutApi.createMission({
        title: form.title,
        date: form.date,
        time: form.time,
        location: form.location,
        opponent: form.opponent,
        prospectName: form.prospectName,
        prospectId: form.prospectId || undefined,
        matchType: form.missionType,
        notes,
      });
      showToast(`Mission planifiée — ${form.prospectName} ✓`, "success");
      setShowForm(false);
      setForm(emptyForm());
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur création mission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = missions.filter((m) => new Date(m.date) >= new Date(new Date().toDateString()));
  const past = missions.filter((m) => new Date(m.date) < new Date(new Date().toDateString()));

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Missions Scout
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Planification pro · joueur auto · stade & adversaire suggérés
          </p>
        </div>
        <motion.button
          type="button"
          onClick={openNewForm}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)` }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Fermer" : "Planifier mission"}
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "À venir", value: upcoming.length, color: S.primary },
          { label: "Passées", value: past.length, color: S.info },
          { label: "Total", value: missions.length, color: S.success },
        ].map((k) => (
          <SCard key={k.label} className="!p-3 text-center">
            <p className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{k.label}</p>
          </SCard>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <SCard className="!p-5 space-y-4" glow>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>
                    Nouvelle mission
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Choisissez le joueur — le reste se remplit automatiquement
                  </p>
                </div>
                <SBadge color={S.primary} bg={`${S.primary}15`}>
                  <Sparkles size={10} className="inline mr-1" /> Auto-fill
                </SBadge>
              </div>

              {/* Mission type */}
              <div className="flex flex-wrap gap-2">
                {MISSION_TYPES.map((t) => (
                  <motion.button
                    key={t.id}
                    type="button"
                    onClick={() => setMissionType(t.id)}
                    className="rounded-xl border px-3 py-2 text-left"
                    style={{
                      background: form.missionType === t.id ? `${S.primary}15` : "rgba(255,255,255,0.03)",
                      borderColor: form.missionType === t.id ? `${S.primary}45` : "var(--surface-panel-border)",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <p className="text-xs font-bold" style={{ color: form.missionType === t.id ? S.primary : "var(--text-primary)" }}>
                      {t.label}
                    </p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{t.hint}</p>
                  </motion.button>
                ))}
              </div>

              {/* Player picker */}
              <div>
                <label className="text-[10px] font-semibold uppercase block mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Joueur cible *
                </label>
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setPlayerOpen(!playerOpen)}
                    className="flex w-full items-center gap-3 rounded-xl border p-3"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: `${S.primary}30` }}
                  >
                    {selectedProspect ? (
                      <>
                        <ScoutPlayerPhoto
                          name={selectedProspect.name}
                          photoUrl={selectedProspect.photoUrl}
                          size={44}
                          accent={S.primary}
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {selectedProspect.flag} {selectedProspect.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                            {selectedProspect.position} · {selectedProspect.age} ans · {selectedProspect.club}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold" style={{ color: S.primary }}>
                          {selectedProspect.potential}
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ background: `${S.primary}15`, color: S.primary }}
                        >
                          <Target size={18} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            Sélectionner un prospect
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            Depuis l&apos;annuaire scout
                          </p>
                        </div>
                      </>
                    )}
                    <ChevronDown
                      size={14}
                      style={{
                        color: "var(--text-muted)",
                        transform: playerOpen ? "rotate(180deg)" : undefined,
                        transition: "transform 0.2s",
                      }}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {playerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-30 w-full mt-1 rounded-xl border overflow-hidden shadow-xl"
                        style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
                      >
                        <div
                          className="flex items-center gap-2 px-3 py-2 border-b"
                          style={{ borderColor: "var(--surface-panel-border)" }}
                        >
                          <Search size={12} style={{ color: "var(--text-muted)" }} />
                          <input
                            autoFocus
                            value={playerQuery}
                            onChange={(e) => setPlayerQuery(e.target.value)}
                            placeholder="Rechercher nom, club, poste…"
                            className="flex-1 bg-transparent text-xs outline-none"
                            style={{ color: "var(--text-primary)" }}
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {filteredProspects.length === 0 ? (
                            <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                              Aucun prospect — importez depuis Recherche
                            </p>
                          ) : (
                            filteredProspects.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => applyProspect(p)}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                              >
                                <ScoutPlayerPhoto
                                  name={p.name}
                                  photoUrl={resolveScoutPhotoUrl(p.name, p.photoUrl, prospects)}
                                  size={32}
                                  accent={S.primary}
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                    {p.flag} {p.name}
                                  </p>
                                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                                    {p.position} · {p.club}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold" style={{ color: S.primary }}>{p.potential}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Auto fields */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    Titre (auto)
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Se remplit après sélection du joueur"
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    Adversaire (auto)
                  </label>
                  <input
                    value={form.opponent}
                    onChange={(e) => setOpponent(e.target.value)}
                    placeholder="Suggéré selon le club"
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    Lieu / stade (auto)
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Stade suggéré"
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <p className="text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>
                    Défaut: prochain week-end
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: "var(--text-muted)" }}>
                    Heure
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Focus chips */}
              <div>
                <label className="text-[10px] font-semibold uppercase block mb-1.5" style={{ color: "var(--text-muted)" }}>
                  Points de focus
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_CHIPS.map((chip) => {
                    const on = form.focus.includes(chip);
                    return (
                      <motion.button
                        key={chip}
                        type="button"
                        onClick={() => toggleFocus(chip)}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                        style={{
                          background: on ? `${S.info}20` : "rgba(255,255,255,0.05)",
                          color: on ? S.info : "var(--text-muted)",
                          border: `1px solid ${on ? `${S.info}40` : "var(--surface-panel-border)"}`,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {chip}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes / consignes terrain…"
                rows={2}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />

              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  onClick={() => void submit()}
                  disabled={submitting}
                  className="flex-1 min-w-[180px] rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: S.success }}
                  whileTap={{ scale: 0.98 }}
                >
                  {submitting ? "Enregistrement…" : "Enregistrer la mission"}
                </motion.button>
                {form.prospectId && (
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/scout/report?prospectId=${form.prospectId}`)}
                    className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold"
                    style={{ borderColor: `${S.primary}40`, color: S.primary }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText size={14} /> Préparer rapport
                  </motion.button>
                )}
              </div>
            </SCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</p>
      ) : (
        <>
          <section>
            <p className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Target size={14} style={{ color: S.primary }} /> À venir ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <SCard className="!p-6 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Aucune mission planifiée — cliquez « Planifier mission »
                </p>
              </SCard>
            ) : (
              <div className="space-y-2">
                {upcoming.map((m) => (
                  <MissionCard
                    key={m.id}
                    mission={m}
                    photoCatalog={prospects}
                    onReport={(prospectId) =>
                      navigate(prospectId ? `/scout/report?prospectId=${prospectId}` : "/scout/report")
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-6">
              <p className="text-xs font-bold mb-3" style={{ color: "var(--text-muted)" }}>
                Passées ({past.length})
              </p>
              <div className="space-y-2 opacity-70">
                {past.map((m) => (
                  <MissionCard key={m.id} mission={m} past photoCatalog={prospects} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </ScoutPage>
  );
}

function MissionCard({
  mission,
  past,
  photoCatalog,
  onReport,
}: {
  mission: ScoutMissionDto;
  past?: boolean;
  photoCatalog?: Array<{ id?: string; name: string; photoUrl?: string | null }>;
  onReport?: (prospectId?: string) => void;
}) {
  const extra = mission.extra as {
    opponent?: string;
    prospectName?: string;
    prospectId?: string;
    matchType?: string;
  } | null;
  const prospectPhoto = extra?.prospectName
    ? resolveScoutPhotoUrl(extra.prospectName, undefined, photoCatalog)
    : null;
  const linked = photoCatalog?.find(
    (p) => p.name.toLowerCase() === (extra?.prospectName ?? "").toLowerCase(),
  );

  return (
    <motion.div
      className="rounded-[18px] border p-4"
      style={{
        background: "rgba(12,9,30,0.85)",
        borderColor: past ? "rgba(255,255,255,0.05)" : `${S.primary}25`,
      }}
      whileHover={{ y: past ? 0 : -2 }}
    >
      <div className="flex items-start gap-3">
        {extra?.prospectName ? (
          <ScoutPlayerPhoto
            name={extra.prospectName}
            photoUrl={prospectPhoto}
            size={44}
            accent={S.primary}
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${S.primary}15`, color: S.primary }}
          >
            <Calendar size={18} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {mission.title}
            </p>
            {extra?.matchType && (
              <SBadge color={S.info} bg={`${S.info}12`}>
                {extra.matchType === "video" ? "Vidéo" : extra.matchType === "tour" ? "Tour" : "Live"}
              </SBadge>
            )}
          </div>
          <p className="text-[10px] mt-1 flex flex-wrap gap-3" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <Calendar size={10} /> {formatMissionDate(mission.date)}
            </span>
            {mission.time && (
              <span className="flex items-center gap-1">
                <Clock size={10} /> {mission.time}
              </span>
            )}
            {mission.location && (
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {mission.location}
              </span>
            )}
          </p>
          {extra?.prospectName && (
            <p className="text-[10px] mt-1" style={{ color: S.info }}>
              Cible: {extra.prospectName}
              {extra.opponent ? ` · vs ${extra.opponent}` : ""}
            </p>
          )}
          {mission.notes && (
            <p className="text-[10px] mt-2 italic line-clamp-2" style={{ color: "var(--text-muted)" }}>
              {mission.notes}
            </p>
          )}
        </div>
        {!past && onReport && (
          <motion.button
            type="button"
            onClick={() => onReport(extra?.prospectId || linked?.id)}
            className="shrink-0 rounded-xl border px-2.5 py-1.5 text-[10px] font-bold"
            style={{ borderColor: `${S.primary}35`, color: S.primary }}
            whileTap={{ scale: 0.96 }}
          >
            Rapport
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
