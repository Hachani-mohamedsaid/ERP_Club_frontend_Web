import { motion } from "framer-motion";
import { FileText, Download, User, Ruler, Scale, Footprints, Calendar, TrendingUp } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { OVRRing } from "../../components/player/OVRRing";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import {
  PLAYER_PROFILE_INFO,
  PLAYER_DOCUMENTS,
  CAREER_TIMELINE,
  PLAYER_TROPHIES,
  MARKET_VALUE_TREND,
} from "../../data/joueurPersonalData";

export function JoueurMonProfilPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  if (!player) return null;

  const infoItems = [
    { icon: Ruler, label: "Taille", value: PLAYER_PROFILE_INFO.height },
    { icon: Scale, label: "Poids", value: PLAYER_PROFILE_INFO.weight },
    { icon: Footprints, label: "Pied fort", value: PLAYER_PROFILE_INFO.foot },
    { icon: Calendar, label: "Naissance", value: PLAYER_PROFILE_INFO.birthDate },
  ];

  return (
    <JoueurPageTransition>
      <motion.div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "rgba(255,255,255,0.08)", background: "#141B2D" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative h-36" style={{ background: "linear-gradient(135deg, #FF6B57 0%, #141B2D 60%, #070B1A 100%)" }} />
        <div className="relative px-6 pb-6">
          <div className="absolute -top-14">
            <PlayerAvatar name={player.name} size={96} />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4 pt-20">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h1>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold" style={{ background: "#FF6B57", color: "white" }}>{PLAYER_PROFILE_INFO.number}</span>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--accent)" }}>{player.position} — {player.positionFull}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{player.flag} {player.nationality} • {player.age} ans</p>
              <AnimatedBadge tone="success" animated={false}>{t.profile.available}</AnimatedBadge>
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
          <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{MARKET_VALUE_TREND.value}</p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "#22C55E" }}>↗ {MARKET_VALUE_TREND.change}</p>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.08} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>🏆 {t.profile.trophies}</h3>
          <div className="grid grid-cols-3 gap-3">
            {PLAYER_TROPHIES.map((tr, idx) => (
              <motion.div key={tr.name} className="rounded-xl border p-3 text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + idx * 0.06 }}>
                <span className="text-2xl">{tr.icon}</span>
                <p className="mt-1 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{tr.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{tr.year}</p>
              </motion.div>
            ))}
          </div>
        </JoueurKpiCard>
      </div>

      <JoueurKpiCard delay={0.1}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📍 {t.profile.career}</h3>
        <div className="relative">
          {CAREER_TIMELINE.map((step, idx) => (
            <motion.div key={step.year} className="flex gap-4 pb-6 last:pb-0" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + idx * 0.08 }}>
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" style={{ background: "#FF6B57", color: "white" }}>{step.year.slice(2)}</div>
                {idx < CAREER_TIMELINE.length - 1 && <div className="mt-1 w-0.5 flex-1" style={{ background: "rgba(255,255,255,0.1)", minHeight: 32 }} />}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{step.club}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{step.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </JoueurKpiCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.12}>
          <div className="mb-4 flex items-center gap-2"><User size={18} style={{ color: "#FF6B57" }} /><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.info}</h3></div>
          <div className="grid grid-cols-2 gap-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <Icon size={14} style={{ color: "var(--text-muted)" }} />
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.contract}</h3>
          <div className="space-y-2">
            {[
              { label: "Début", value: `${player.contract.startYear}` },
              { label: "Fin", value: player.contract.expiration },
              { label: "Salaire", value: player.contract.salary },
              { label: "Clause", value: player.contract.clause },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between rounded-xl border px-4 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </JoueurKpiCard>
      </div>

      <JoueurKpiCard delay={0.18}>
        <div className="mb-4 flex items-center gap-2"><FileText size={18} style={{ color: "#FF6B57" }} /><h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.profile.documents}</h3></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLAYER_DOCUMENTS.map((doc) => (
            <button key={doc.id} type="button" className="flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <FileText size={18} style={{ color: "#FF6B57" }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{doc.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.size}</p>
              </div>
              <Download size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </JoueurKpiCard>
    </JoueurPageTransition>
  );
}
