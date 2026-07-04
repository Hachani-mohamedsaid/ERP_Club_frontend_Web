import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Crosshair, TrendingUp } from "lucide-react";
import {
  HEATMAP_BY_PERIOD,
  HEATMAP_FILTERS,
  HEATMAP_LEGEND,
  HEATMAP_PLAYER_INFO,
  intensityColors,
  type HeatBlob,
  type HeatmapPeriod,
} from "../../data/joueurPersonalData";

interface PlayerHeatmapProps {
  compact?: boolean;
}

function PitchSvg() {
  return (
    <svg viewBox="0 0 68 105" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pitchGradPremium" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5c32" />
          <stop offset="50%" stopColor="#1e6b3a" />
          <stop offset="100%" stopColor="#1a5c32" />
        </linearGradient>
      </defs>
      <rect width="68" height="105" fill="url(#pitchGradPremium)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="0" y={i * 21} width="68" height="10.5" fill="rgba(0,0,0,0.06)" />
      ))}
      <line x1="0" y1="0" x2="68" y2="0" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      <rect x="14" y="0" width="40" height="16" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      <rect x="24" y="0" width="20" height="6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
      <circle cx="34" cy="11" r="0.8" fill="rgba(255,255,255,0.5)" />
      <path d="M 24 16 A 10 10 0 0 0 44 16" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" />
      <path d="M 14 0 A 10 10 0 0 0 54 0" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
      <line x1="0" y1="105" x2="68" y2="105" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <rect x="28" y="100" width="12" height="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
    </svg>
  );
}

function HeatBlobLayer({ blob, index, onHover, onLeave }: {
  blob: HeatBlob;
  index: number;
  onHover: (b: HeatBlob) => void;
  onLeave: () => void;
}) {
  const colors = intensityColors(blob.intensity);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: colors.size,
        height: colors.size,
        transform: "translate(-50%, -50%)",
        zIndex: Math.round(blob.intensity * 10),
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
    >
      {/* Blur heat blob */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.inner} 0%, ${colors.mid} 45%, transparent 70%)`,
          filter: "blur(18px)",
        }}
      />
      {/* Hover hit area */}
      <button
        type="button"
        className="absolute inset-0 rounded-full opacity-0"
        style={{ cursor: "crosshair" }}
        onMouseEnter={() => onHover(blob)}
        onMouseLeave={onLeave}
        onFocus={() => onHover(blob)}
        onBlur={onLeave}
        aria-label={blob.label}
      />
    </motion.div>
  );
}

export function PlayerHeatmap({ compact = false }: PlayerHeatmapProps) {
  const [period, setPeriod] = useState<HeatmapPeriod>("season");
  const [hovered, setHovered] = useState<HeatBlob | null>(null);

  const data = HEATMAP_BY_PERIOD[period];
  const display = hovered ?? data.blobs[0];
  const pitchMaxWidth = compact ? 288 : 360;

  return (
    <div className="space-y-4">
      {/* Zone préférée banner */}
      <motion.div
        className="rounded-[16px] border px-4 py-3"
        style={{ borderColor: "rgba(255,107,87,0.35)", background: "rgba(255,107,87,0.08)" }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#FF6B57" }}>
                Zone préférée
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {data.favoriteZone.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {data.favoriteZone.actions} actions
              </p>
              <p className="text-xs font-semibold" style={{ color: "#22C55E" }}>
                {data.favoriteZone.trend} vs mois dernier
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {HEATMAP_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => { setPeriod(f.id); setHovered(null); }}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: period === f.id ? "#FF6B57" : "rgba(255,255,255,0.05)",
              color: period === f.id ? "white" : "var(--text-muted)",
              border: "1px solid var(--surface-panel-border)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-1 gap-4 ${compact ? "lg:grid-cols-[1fr_168px]" : "lg:grid-cols-[1fr_200px]"}`}>
        {/* Pitch + blobs */}
        <div className="relative mx-auto w-full" style={{ maxWidth: pitchMaxWidth }}>
          <motion.div
            className="relative overflow-hidden rounded-2xl border-2"
            style={{ borderColor: "var(--surface-panel-border)", aspectRatio: "68 / 105" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <PitchSvg />

            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  className="absolute inset-x-[6%] bottom-[3%] top-[32%]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {data.blobs.map((blob, i) => (
                    <HeatBlobLayer
                      key={blob.id}
                      blob={blob}
                      index={i}
                      onHover={setHovered}
                      onLeave={() => setHovered(null)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pointer-events-none absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white/50">
              Mi-terrain → Surface
            </div>
          </motion.div>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                key={hovered.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-3 rounded-[16px] border p-4"
                style={{ borderColor: "rgba(255,107,87,0.3)", background: "var(--surface-panel-solid)" }}
              >
                <p className="text-sm font-bold" style={{ color: "#FF6B57" }}>{hovered.label}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {hovered.actions} actions
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span><strong style={{ color: "var(--text-primary)" }}>{hovered.shots}</strong> tirs</span>
                  <span><strong style={{ color: "var(--text-primary)" }}>{hovered.passes}</strong> passes</span>
                  <span><strong style={{ color: "var(--text-primary)" }}>{hovered.goals}</strong> buts</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {HEATMAP_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Position panel */}
        <div className="space-y-3">
          <div className="rounded-[16px] border p-4" style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}>
            <div className="mb-2 flex items-center gap-2">
              <Crosshair size={14} style={{ color: "#FF6B57" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Position principale
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {HEATMAP_PLAYER_INFO.mainPosition}
            </p>
          </div>

          <div className="rounded-[16px] border p-4" style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-input)" }}>
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={14} style={{ color: "#F59E0B" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Zone favorite
              </span>
            </div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              {HEATMAP_PLAYER_INFO.favoriteZone}
            </p>
          </div>

          <div className="rounded-[16px] border p-4" style={{ borderColor: "rgba(255,107,87,0.2)", background: "rgba(255,107,87,0.06)" }}>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp size={14} style={{ color: "#22C55E" }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Zone active
              </span>
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{display.label}</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: "#FF6B57" }}>{display.actions}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>actions sur la période</p>
          </div>

          <div className="rounded-[16px] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Intensité</p>
            <div className="space-y-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(185,28,28,0.9)" }} /> Rouge foncé — 75%+
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,99,71,0.85)" }} /> Orange — 45-75%
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: "rgba(255,214,0,0.7)" }} /> Jaune — 20-45%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
