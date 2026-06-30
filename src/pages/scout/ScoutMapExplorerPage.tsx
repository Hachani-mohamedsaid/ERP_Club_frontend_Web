import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Globe, MapPin, Building2, ChevronRight, ChevronLeft, Search,
  Users, TrendingUp, Zap, RotateCcw,
} from "lucide-react";
import { ScoutPage, SCard, SGauge } from "../../components/scout/ScoutUI";
import { ScoutGeoMap } from "../../components/scout/ScoutGeoMap";
import type { BubbleNodeInput } from "../../lib/scout/bubbleMapTypes";
import { S } from "../../data/scoutData";
import {
  CONTINENTS, COUNTRIES, TEAMS, STEPS,
  getCountriesByContinent, getTeamsByCountry,
  getContinent, getCountry, getTeam,
  buildContinentNodes, buildCountryNodes, buildTeamNodes,
  getTeamLogo, getLeagueLogo, getCountryLeagueLogo, getContinentLogo,
  type GeoContinent, type GeoCountry, type GeoTeam,
} from "../../data/scoutGeoData";
import { useScoutProspects } from "../../hooks/useScoutData";
import { staggerContainer, staggerItem } from "../../lib/animations";

type Step = 0 | 1 | 2 | 3;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, filter: "blur(6px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, filter: "blur(6px)" }),
};

function StepIndicator({ step, labels }: { step: Step; labels: string[] }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-xl mx-auto">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <motion.div
              className="flex flex-col items-center gap-1 relative z-10"
              animate={{ scale: active ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold"
                style={{
                  borderColor: done || active ? S.primary : "rgba(255,255,255,0.12)",
                  background: done ? S.primary : active ? `${S.primary}20` : "rgba(12,9,30,0.9)",
                  color: done ? "white" : active ? S.primary : "var(--text-muted)",
                  boxShadow: active ? `0 0 20px ${S.primary}50` : "none",
                }}
                animate={active ? { boxShadow: [`0 0 12px ${S.primary}30`, `0 0 24px ${S.primary}60`, `0 0 12px ${S.primary}30`] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {done ? "✓" : s.icon}
              </motion.div>
              <span className="text-[9px] font-bold whitespace-nowrap hidden sm:block"
                style={{ color: active ? S.primary : "var(--text-muted)" }}>
                {labels[i] ?? s.label}
              </span>
            </motion.div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 relative overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: `linear-gradient(90deg,${S.primary},${S.accent})` }}
                  initial={{ width: "0%" }}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function matchClub(prospectClub: string, teamName: string) {
  const a = prospectClub.toLowerCase();
  const b = teamName.toLowerCase();
  return a.includes(b) || b.includes(a) || a.includes(b.split(" ").pop() ?? "");
}

export function ScoutMapExplorerPage() {
  const navigate = useNavigate();
  const { prospects } = useScoutProspects();
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [continentId, setContinentId] = useState<string | null>(null);
  const [countryId, setCountryId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const continent = continentId ? getContinent(continentId) : null;
  const country = countryId ? getCountry(countryId) : null;
  const team = teamId ? getTeam(teamId) : null;

  const teamProspectCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of TEAMS) {
      map[t.id] = prospects.filter((p) => matchClub(p.club, t.name)).length || t.playerCount;
    }
    return map;
  }, [prospects]);

  const mapNodes: BubbleNodeInput[] = useMemo(() => {
    if (step === 0) return buildContinentNodes();
    if (step === 1 && continentId) return buildCountryNodes(continentId);
    if (step === 2 && countryId) return buildTeamNodes(countryId, teamProspectCounts);
    return [];
  }, [step, continentId, countryId, teamProspectCounts]);

  const selectedMapId = step === 1 ? countryId : step === 2 ? teamId : step === 0 ? continentId : null;

  const teamProspects = useMemo(() => {
    if (!team) return [];
    return prospects.filter((p) => matchClub(p.club, team.name));
  }, [team, prospects]);

  const breadcrumb = [
    continent ? `${continent.icon} ${continent.name}` : null,
    country ? `${country.flag} ${country.name}` : null,
    team ? `⚽ ${team.name}` : null,
  ].filter(Boolean);

  const go = (next: Step, dir = 1) => {
    setDirection(dir);
    setStep(next);
    setHoveredId(null);
  };

  const selectContinent = (c: GeoContinent) => {
    setContinentId(c.id);
    setCountryId(null);
    setTeamId(null);
    go(1);
  };

  const selectCountry = (c: GeoCountry) => {
    setCountryId(c.id);
    setTeamId(null);
    go(2);
  };

  const selectTeam = (t: GeoTeam) => {
    setTeamId(t.id);
    go(3);
  };

  const handleBubbleSelect = (node: BubbleNodeInput) => {
    if (node.level === "continent") {
      const c = getContinent(node.id);
      if (c) selectContinent(c);
    } else if (node.level === "country") {
      const c = getCountry(node.id);
      if (c) selectCountry(c);
    } else if (node.level === "team") {
      const t = getTeam(node.id);
      if (t) selectTeam(t);
    }
  };

  const back = () => {
    if (step === 3) { setTeamId(null); go(2, -1); }
    else if (step === 2) { setCountryId(null); go(1, -1); }
    else if (step === 1) { setContinentId(null); go(0, -1); }
  };

  const reset = () => {
    setContinentId(null);
    setCountryId(null);
    setTeamId(null);
    setHoveredId(null);
    setDirection(-1);
    setStep(0);
  };

  const stepLabels = [
    "Continent",
    continent?.name ?? "Pays",
    country?.name ?? "Équipe",
    team?.name ?? "Résultats",
  ];

  const mapHint =
    step === 0 ? "Cliquez sur un continent" :
    step === 1 ? "Sélectionnez un pays" :
    step === 2 ? "Choisissez une équipe" : "";

  const listHighlight = (id: string) =>
    hoveredId === id || selectedMapId === id;

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Globe size={20} style={{ color: S.primary }} />
            Exploration Géographique
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Continent → Pays → Équipe · carte géographique interactive
          </p>
        </div>
        {step > 0 && (
          <div className="flex gap-2">
            <motion.button type="button" onClick={back}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--text-muted)" }}
              whileHover={{ borderColor: S.primary, color: S.primary }}
              whileTap={{ scale: 0.96 }}>
              <ChevronLeft size={14} /> Retour
            </motion.button>
            <motion.button type="button" onClick={reset}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--text-muted)" }}
              whileTap={{ scale: 0.96 }}>
              <RotateCcw size={13} /> Recommencer
            </motion.button>
          </div>
        )}
      </div>

      <StepIndicator step={step} labels={stepLabels} />

      <AnimatePresence>
        {breadcrumb.length > 0 && (
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {breadcrumb.map((b, i) => (
              <motion.span key={i}
                className="flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold"
                style={{ background: `${S.primary}10`, borderColor: `${S.primary}30`, color: S.primary }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}>
                {i > 0 && <ChevronRight size={10} className="opacity-50" />}
                {b}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        {step < 3 ? (
          <ScoutGeoMap
            key={`map-${step}-${continentId}-${countryId}`}
            nodes={mapNodes}
            step={step}
            continentId={continentId}
            countryId={countryId}
            selectedId={selectedMapId}
            hoveredId={hoveredId}
            onSelect={handleBubbleSelect}
            onHover={(n) => setHoveredId(n?.id ?? null)}
            hint={mapHint}
          />
        ) : (
          <SCard className="!p-6 min-h-[420px] flex items-center justify-center">
            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
              Consultez le panneau de droite pour explorer {team?.name}
            </p>
          </SCard>
        )}

        <div className="space-y-3">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {step < 3 ? (
                <SCard className="!p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                    {step === 0 ? "Continents disponibles" : step === 1 ? "Pays" : "Équipes & clubs"}
                  </p>
                  <motion.div
                    className="space-y-2 max-h-[420px] overflow-y-auto pr-1"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {step === 0 && CONTINENTS.map((c) => (
                      <motion.button
                        key={c.id}
                        type="button"
                        variants={staggerItem}
                        onClick={() => selectContinent(c)}
                        onMouseEnter={() => setHoveredId(c.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
                        style={{
                          background: listHighlight(c.id) ? `${c.color}18` : "rgba(255,255,255,0.02)",
                          borderColor: listHighlight(c.id) ? `${c.color}55` : "rgba(255,255,255,0.06)",
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img src={getContinentLogo(c)} alt="" className="h-7 w-7 rounded-md object-contain bg-white/95 p-0.5 ring-1 ring-white/10 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                            {c.countries} pays · {c.prospects} prospects
                          </p>
                        </div>
                        <ChevronRight size={14} style={{ color: c.color }} />
                      </motion.button>
                    ))}

                    {step === 1 && continentId && getCountriesByContinent(continentId).map((c) => (
                      <motion.button
                        key={c.id}
                        type="button"
                        variants={staggerItem}
                        onClick={() => selectCountry(c)}
                        onMouseEnter={() => setHoveredId(c.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
                        style={{
                          background: listHighlight(c.id) ? `${c.color}18` : "rgba(255,255,255,0.02)",
                          borderColor: listHighlight(c.id) ? `${c.color}55` : "rgba(255,255,255,0.06)",
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <img src={getCountryLeagueLogo(c)} alt="" className="h-6 w-6 rounded-md object-contain bg-white/95 p-0.5 ring-1 ring-white/10" />
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{c.name}</p>
                          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{c.leagues.join(" · ")}</p>
                        </div>
                        <span className="text-xs font-extrabold" style={{ color: c.color }}>{c.prospects}</span>
                      </motion.button>
                    ))}

                    {step === 2 && countryId && getTeamsByCountry(countryId).map((t) => (
                      <motion.button
                        key={t.id}
                        type="button"
                        variants={staggerItem}
                        onClick={() => selectTeam(t)}
                        onMouseEnter={() => setHoveredId(t.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
                        style={{
                          background: listHighlight(t.id) ? `${S.primary}18` : "rgba(255,255,255,0.02)",
                          borderColor: listHighlight(t.id) ? `${S.primary}55` : "rgba(255,255,255,0.06)",
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative h-9 w-9 shrink-0">
                          <img src={getTeamLogo(t)} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                          <img src={getLeagueLogo(t)} alt="" className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-1 ring-black/40" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{t.name}</p>
                          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                            {t.city} · {t.league} · {teamProspectCounts[t.id]} joueurs
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-extrabold" style={{ color: S.primary }}>{t.avgPotential}</p>
                          <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>pot. moy.</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </SCard>
              ) : team ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <SCard className="!p-5" glow>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <img src={getTeamLogo(team)} alt="" className="h-14 w-14 rounded-2xl object-cover ring-2 ring-orange-500/30" />
                        <img src={getLeagueLogo(team)} alt="" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full ring-2 ring-[rgba(8,6,24,0.96)]" />
                      </div>
                      <div>
                        <p className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>{team.name}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {country?.flag} {team.city} · {team.league}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: "Potentiel moy.", value: team.avgPotential, color: S.primary },
                        { label: "Activité scout", value: team.scoutActivity, color: S.success },
                        { label: "Niveau", value: team.tier, color: S.info },
                        { label: "Joueurs", value: teamProspects.length || teamProspectCounts[team.id], color: S.accent },
                      ].map((k) => (
                        <div key={k.label} className="rounded-xl border p-2.5 text-center"
                          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <p className="text-sm font-extrabold" style={{ color: k.color }}>{k.value}</p>
                          <p className="text-[8px] mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
                        </div>
                      ))}
                    </div>

                    <SGauge value={team.avgPotential} color={S.primary} />

                    <div className="space-y-2 mt-4">
                      <motion.button type="button" onClick={() => navigate("/scout/search")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)` }}
                        whileTap={{ scale: 0.97 }}>
                        <Search size={14} /> Explorer les joueurs
                      </motion.button>
                      <motion.button type="button" onClick={() => navigate("/scout/missions")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold"
                        style={{ background: `${S.info}12`, color: S.info, border: `1px solid ${S.info}30` }}
                        whileTap={{ scale: 0.97 }}>
                        <MapPin size={14} /> Planifier mission
                      </motion.button>
                    </div>
                  </SCard>

                  <SCard className="!p-4 mt-3">
                    <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      <Users size={11} /> Effectif scouté ({teamProspects.length})
                    </p>
                    {teamProspects.length === 0 ? (
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Aucun prospect lié — ajoutez via Recherche</p>
                    ) : (
                      <div className="space-y-2">
                        {teamProspects.map((p, i) => (
                          <motion.button key={p.id} type="button"
                            onClick={() => navigate(`/scout/prospect/${p.id}`)}
                            className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left"
                            style={{ borderColor: "rgba(255,255,255,0.06)" }}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            whileHover={{ borderColor: `${S.primary}40`, x: 3 }}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black text-white"
                              style={{ background: S.primary }}>
                              {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                {p.flag} {p.name}
                              </p>
                              <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{p.position} · Pot. {p.potential}</p>
                            </div>
                            <TrendingUp size={12} style={{ color: S.success }} />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </SCard>
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {step === 0 && (
            <motion.div className="grid grid-cols-3 gap-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {[
                { icon: Globe, label: "Continents", value: CONTINENTS.length, color: S.primary },
                { icon: MapPin, label: "Pays", value: COUNTRIES.length, color: S.info },
                { icon: Building2, label: "Clubs", value: TEAMS.length, color: S.accent },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border p-2.5 text-center"
                  style={{ background: "rgba(12,9,30,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                  <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {step >= 1 && step < 3 && (
            <motion.div className="rounded-xl border p-3 flex items-center gap-2"
              style={{ background: `${S.accent}08`, borderColor: `${S.accent}25` }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Zap size={14} style={{ color: S.accent }} />
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Survolez la liste pour surligner la bulle correspondante
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </ScoutPage>
  );
}
