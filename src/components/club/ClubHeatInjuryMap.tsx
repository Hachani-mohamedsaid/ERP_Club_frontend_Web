import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BodyInjuryViewer, type BodyZone } from "../medical/BodyInjuryViewer";
import { CLUB_HEAT_ZONES, CLUB_BODY_ZONES } from "../../data/clubHeatInjuryData";

const SEVERITY_COLORS = {
  low: "#22C55E",
  medium: "#F59E0B",
  critical: "#EF4444",
};

export function ClubHeatInjuryMap({ zones = CLUB_BODY_ZONES }: { zones?: BodyZone[] }) {
  const [activeId, setActiveId] = useState<string | null>("groin");
  const heatZones = CLUB_HEAT_ZONES;
  const active = heatZones.find((z) => z.id === activeId);

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heat Injury Club</h3>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Zones à risque — effectif FC Carthage</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px]">
          {[
            { label: "Faible", color: SEVERITY_COLORS.low },
            { label: "Moyenne", color: SEVERITY_COLORS.medium },
            { label: "Critique", color: SEVERITY_COLORS.critical },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl border p-4 lg:p-6"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,107,87,0.08) 0%, rgba(15,29,58,0.6) 55%, rgba(7,11,31,0.9) 100%)",
          borderColor: "rgba(255,107,87,0.15)",
        }}
      >
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_200px]">
          <div className="flex justify-center">
            <BodyInjuryViewer
              zones={zones}
              onZoneClick={(zone) => setActiveId(zone.id)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Hotspots
            </p>
            {heatZones.map((zone) => {
              const color = SEVERITY_COLORS[zone.severity];
              const isActive = activeId === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setActiveId(zone.id)}
                  className="w-full rounded-xl border px-3 py-2.5 text-left transition-all"
                  style={{
                    borderColor: isActive ? `${color}60` : "rgba(255,255,255,0.06)",
                    background: isActive ? `${color}15` : "rgba(255,255,255,0.02)",
                    boxShadow: isActive ? `0 0 16px ${color}30` : "none",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: isActive ? color : "var(--text-primary)" }}>
                      {zone.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color }}>{zone.count}</span>
                  </div>
                  {zone.players.length > 0 && (
                    <p className="mt-0.5 truncate text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {zone.players.join(", ")}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border px-4 py-3"
              style={{
                borderColor: `${SEVERITY_COLORS[active.severity]}40`,
                background: `${SEVERITY_COLORS[active.severity]}10`,
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                style={{ background: `${SEVERITY_COLORS[active.severity]}25`, color: SEVERITY_COLORS[active.severity] }}
              >
                {active.count}
              </div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{active.label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {active.players.length > 0 ? `Joueurs : ${active.players.join(", ")}` : "Surveillance préventive"}
                </p>
              </div>
              <div className="text-right text-xs" style={{ color: "var(--text-muted)" }}>
                Dernier contrôle<br />
                <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>{active.lastControl}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
