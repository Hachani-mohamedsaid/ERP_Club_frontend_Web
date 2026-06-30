import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BubbleNodeInput, BubbleNodeLayout, ScoutBubbleMapProps } from "../../lib/scout/bubbleMapTypes";
import { useBubbleForceLayout } from "../../hooks/useBubbleForceLayout";
import { S } from "../../data/scoutData";

function NodeAvatar({
  node,
  r,
  hovered,
}: {
  node: BubbleNodeLayout;
  r: number;
  hovered: boolean;
}) {
  const imgSize = Math.min(r * 0.62, node.level === "continent" ? 28 : 34);
  const showImage = node.logoUrl && r >= 20;

  if (showImage) {
    return (
      <>
        <circle r={imgSize / 2 + 2} fill="rgba(255,255,255,0.96)" />
        <clipPath id={`clip-${node.id}`}>
          <circle r={imgSize / 2} />
        </clipPath>
        <image
          href={node.logoUrl}
          x={-imgSize / 2}
          y={-imgSize / 2}
          width={imgSize}
          height={imgSize}
          clipPath={`url(#clip-${node.id})`}
          preserveAspectRatio="xMidYMid meet"
          opacity={hovered ? 1 : 0.92}
        />
        {node.leagueLogoUrl && node.level === "team" && r >= 26 && (
          <>
            <circle cx={r * 0.36} cy={-r * 0.48} r={8} fill="rgba(255,255,255,0.96)" stroke="rgba(0,0,0,0.08)" strokeWidth={0.5} />
            <image
              href={node.leagueLogoUrl}
              x={r * 0.36 - 6}
              y={-r * 0.48 - 6}
              width={12}
              height={12}
              preserveAspectRatio="xMidYMid meet"
            />
          </>
        )}
      </>
    );
  }

  if (node.icon) {
    return (
      <text textAnchor="middle" dominantBaseline="central" fontSize={Math.min(r * 0.48, 26)}>
        {node.icon}
      </text>
    );
  }

  const initials = node.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <text textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.85)" fontSize={Math.min(r * 0.34, 14)} fontWeight={700}>
      {initials}
    </text>
  );
}

function CountBadge({ count, r, color }: { count: number; r: number; color: string }) {
  const label = count >= 100 ? "99+" : String(count);
  const w = Math.max(18, label.length * 6 + 10);
  return (
    <g transform={`translate(${r * 0.55}, ${r * 0.55})`}>
      <rect
        x={-w / 2}
        y={-9}
        width={w}
        height={18}
        rx={9}
        fill="rgba(8,10,18,0.92)"
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.55}
      />
      <text textAnchor="middle" dominantBaseline="central" y={0} fill="white" fontSize={9} fontWeight={700}>
        {label}
      </text>
    </g>
  );
}

export function ScoutBubbleMap({
  nodes,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  hint = "Sélectionnez un élément",
  className = "",
}: ScoutBubbleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { layout, labelById, width, height } = useBubbleForceLayout(nodes, containerRef);
  const [tooltip, setTooltip] = useState<{ node: BubbleNodeLayout; x: number; y: number } | null>(null);

  const handleEnter = useCallback(
    (node: BubbleNodeLayout, e: React.MouseEvent) => {
      onHover?.(node);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setTooltip({ node, x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    },
    [onHover],
  );

  const handleLeave = useCallback(() => {
    onHover?.(null);
    setTooltip(null);
  }, [onHover]);

  const maxCount = Math.max(...nodes.map((n) => n.count), 1);
  const level = nodes[0]?.level ?? "continent";

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border ${className}`}
      style={{
        background: "linear-gradient(165deg, rgba(14,16,24,0.98) 0%, rgba(8,10,16,1) 100%)",
        borderColor: "rgba(255,255,255,0.06)",
        minHeight: 440,
        aspectRatio: "16/9",
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(0,0,0,0.35) 100%)",
        }}
      />

      <svg width={width} height={height} className="block w-full h-full" role="img" aria-label="Carte exploration scout">
        <defs>
          <filter id="bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Leader lines (under bubbles) */}
        {layout.map((n) => {
          const label = labelById.get(n.id);
          if (!label?.leader || label.mode !== "outside") return null;
          return (
            <line
              key={`ln-${n.id}`}
              x1={label.leader.x1}
              y1={label.leader.y1}
              x2={label.leader.x2}
              y2={label.leader.y2}
              stroke={n.color}
              strokeWidth={1}
              strokeOpacity={0.25}
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Bubbles */}
        {layout.map((n) => {
          const label = labelById.get(n.id);
          const isSelected = selectedId === n.id;
          const isHovered = hoveredId === n.id || tooltip?.node.id === n.id;
          const scale = isHovered ? 1.04 : isSelected ? 1.02 : 1;
          const fontSize = Math.min(12, Math.max(9, n.radius * 0.19));
          const showInsideText = label?.mode === "inside";

          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y}) scale(${scale})`}
              style={{ cursor: "pointer", transition: "transform 0.22s ease" }}
              onClick={() => onSelect?.(n)}
              onMouseEnter={(e) => handleEnter(n, e)}
              onMouseLeave={handleLeave}
              onFocus={() => onHover?.(n)}
              onBlur={handleLeave}
              tabIndex={0}
              role="button"
              aria-label={`${n.name}, ${n.count} prospects`}
            >
              {isSelected && (
                <circle r={n.radius + 8} fill="none" stroke={S.primary} strokeWidth={1.5} strokeOpacity={0.7} strokeDasharray="4 3" />
              )}

              {/* Glow ring on hover */}
              {isHovered && (
                <circle r={n.radius + 4} fill="none" stroke={n.color} strokeWidth={1} strokeOpacity={0.35} />
              )}

              {/* Main bubble */}
              <circle
                r={n.radius}
                fill={`${n.color}14`}
                stroke={isHovered || isSelected ? n.color : `${n.color}66`}
                strokeWidth={isHovered ? 2 : 1.5}
                filter="url(#bubble-shadow)"
              />

              {/* Inner highlight */}
              <circle r={n.radius * 0.88} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />

              <NodeAvatar node={n} r={n.radius} hovered={isHovered} />

              {/* Count badge when label is outside */}
              {label?.mode === "outside" && <CountBadge count={n.count} r={n.radius} color={n.color} />}

              {showInsideText && label && (
                <g transform={`translate(0, ${n.radius * (n.logoUrl ? 0.38 : 0.32)})`}>
                  {label.lines.map((line, li) => (
                    <text
                      key={li}
                      x={0}
                      y={li * fontSize * 1.3}
                      textAnchor="middle"
                      fill={li === 0 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)"}
                      fontSize={li === 0 ? fontSize : fontSize * 0.88}
                      fontWeight={li === 0 ? 600 : 500}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )}
            </g>
          );
        })}

        {/* Outside label cards */}
        {layout.map((n) => {
          const label = labelById.get(n.id);
          if (!label || label.mode !== "outside") return null;
          const isHovered = hoveredId === n.id || tooltip?.node.id === n.id;
          const fs = 11;
          const subFs = 9.5;

          return (
            <g key={`lbl-${n.id}`} pointerEvents="none" opacity={isHovered ? 1 : 0.92}>
              <rect
                x={label.labelX - 6}
                y={label.labelY - 5}
                width={label.labelWidth}
                height={label.labelHeight}
                rx={8}
                fill="rgba(12,14,22,0.94)"
                stroke={isHovered ? n.color : "rgba(255,255,255,0.08)"}
                strokeWidth={isHovered ? 1.5 : 1}
              />
              {label.lines.map((line, li) => (
                <text
                  key={li}
                  x={label.labelX}
                  y={label.labelY + li * fs * 1.35 + (li === 0 ? fs : fs + 2)}
                  fill={li === 0 ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.42)"}
                  fontSize={li === 0 ? fs : subFs}
                  fontWeight={li === 0 ? 600 : 500}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            className="pointer-events-none absolute z-30 rounded-lg border px-3 py-2"
            style={{
              left: Math.min(tooltip.x + 14, width - 200),
              top: Math.max(tooltip.y - 52, 10),
              background: "rgba(12,14,22,0.97)",
              borderColor: "rgba(255,255,255,0.1)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              {tooltip.node.logoUrl ? (
                <img src={tooltip.node.logoUrl} alt="" className="h-5 w-5 rounded-full object-contain bg-white p-0.5" />
              ) : tooltip.node.icon ? (
                <span className="text-sm">{tooltip.node.icon}</span>
              ) : null}
              {tooltip.node.name}
            </p>
            <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
              {tooltip.node.count} prospects
              {tooltip.node.subtitle ? ` · ${tooltip.node.subtitle}` : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend bar */}
      <div
        className="absolute bottom-3 inset-x-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
        style={{ background: "rgba(10,12,18,0.92)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Taille ∝ prospects
          </span>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full border" style={{ borderColor: S.primary, background: `${S.primary}20` }} />
            <span className="h-3 w-3 rounded-full border" style={{ borderColor: S.primary, background: `${S.primary}30` }} />
            <span className="text-[9px] ml-0.5" style={{ color: "var(--text-muted)" }}>max {maxCount}</span>
          </div>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
            {level === "continent" ? "Continents" : level === "country" ? "Pays" : "Clubs"}
          </span>
        </div>
      </div>
    </div>
  );
}

export type { BubbleNodeInput };
