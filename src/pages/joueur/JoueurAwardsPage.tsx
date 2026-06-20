import { motion } from "framer-motion";
import { GlassCard } from "../../components/ui/GlassCard";
import { JOUEUR_AWARDS, JOUEUR_TROPHIES } from "../../data/joueurExtendedData";
import { CareerTimeline } from "../../components/player/CareerTimeline";

const CAREER_MILESTONES = [
  { year: "2022", club: "Club Sportif Sfaxien", event: "Première sélection" },
  { year: "2024", club: "FC Carthage", event: "Championnat remporté" },
  { year: "2026", club: "Équipe Nationale", event: "CAN Qualifiers" },
];

export function JoueurAwardsPage() {
  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Awards & Achievements</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOUEUR_AWARDS.map((award, i) => (
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
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{award.player}</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{award.season}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Trophées Cabinet</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOUEUR_TROPHIES.map((trophy, i) => (
            <motion.div
              key={trophy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <GlassCard className="p-5 text-center" style={{ borderTop: "3px solid #d99a1f" }}>
                <motion.span
                  className="text-4xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                >
                  {trophy.icon}
                </motion.span>
                <p className="mt-2 font-bold" style={{ color: "var(--text-primary)" }}>{trophy.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{trophy.year} — {trophy.club}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Career Timeline — Ahmed Ben Salah</h3>
        <CareerTimeline steps={CAREER_MILESTONES} />
      </GlassCard>
    </motion.div>
  );
}
