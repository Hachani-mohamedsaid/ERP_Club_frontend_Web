import { motion } from "framer-motion";
import { GlassCard } from "../../components/ui/GlassCard";
import { CareerTimeline } from "../../components/player/CareerTimeline";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";

export function JoueurAwardsPage() {
  const { player } = useCurrentPlayer();
  const { awards } = useJoueurBackendData();

  const awardsOnly = awards.filter((a) => a.awardType === "award");
  const trophies = awards.filter((a) => a.awardType === "trophy");
  const careerItems = awards.filter((a) => a.awardType === "career");

  const careerSteps = careerItems.map((c) => ({
    year: c.year ?? c.season,
    club: c.club ?? "FC Carthage",
    event: c.event ?? c.title,
  }));

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Awards */}
      {awardsOnly.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Awards & Achievements</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {awardsOnly.map((award, i) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: `0 8px 32px ${award.color}40` }}
              >
                <GlassCard raised className="p-6 text-center">
                  <motion.span
                    className="text-5xl"
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                  >
                    {award.icon}
                  </motion.span>
                  <p className="mt-3 text-base font-bold" style={{ color: award.color }}>{award.title}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{player?.name ?? "—"}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{award.season}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trophies */}
      {trophies.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Trophées Cabinet</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trophies.map((trophy, i) => (
              <motion.div
                key={trophy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
              >
                <GlassCard className="p-5 text-center" style={{ borderTop: `3px solid ${trophy.color}` }}>
                  <motion.span
                    className="text-4xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {trophy.icon}
                  </motion.span>
                  <p className="mt-2 font-bold" style={{ color: "var(--text-primary)" }}>{trophy.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {trophy.year ?? trophy.season} — {trophy.club ?? "FC Carthage"}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {awards.length === 0 && (
        <GlassCard raised className="p-10 text-center">
          <p className="text-4xl">🏅</p>
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Aucun award enregistré pour le moment</p>
        </GlassCard>
      )}

      {/* Career Timeline */}
      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Career Timeline — {player?.name ?? "—"}
        </h3>
        {careerSteps.length > 0 ? (
          <CareerTimeline steps={careerSteps} />
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune étape de carrière enregistrée</p>
        )}
      </GlassCard>
    </motion.div>
  );
}
