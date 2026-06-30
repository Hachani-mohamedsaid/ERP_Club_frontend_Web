import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";
import type { BubbleNodeInput } from "../../lib/scout/bubbleMapTypes";
import { useWorldMap } from "../../hooks/useWorldMap";
import { fitTransformToPins, useMapPanZoom } from "../../hooks/useMapPanZoom";
import { getNodeCoords, markerRadius, resolveMapView, type MapViewConfig } from "../../data/scoutGeoCoords";
import { spreadMapPins } from "../../lib/scout/mapPinLayout";
import { S } from "../../data/scoutData";

export interface ScoutGeoMapProps {
  nodes: BubbleNodeInput[];
  step: number;
  continentId?: string | null;
  countryId?: string | null;
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (node: BubbleNodeInput) => void;
  onHover?: (node: BubbleNodeInput | null) => void;
  hint?: string;
  className?: string;
}

function MapPin({
  node,
  x,
  y,
  r,
  isHovered,
  isSelected,
  onSelect,
  onHover,
  onPinPointerDown,
}: {
  node: BubbleNodeInput;
  x: number;
  y: number;
  r: number;
  isHovered: boolean;
  isSelected: boolean;
  onSelect?: () => void;
  onHover?: (h: boolean, clientX?: number, clientY?: number) => void;
  onPinPointerDown?: (e: React.PointerEvent) => void;
}) {
  const active = isHovered || isSelected;
  const imgSize = r * 1.35;
  const badgeW = r >= 18 ? 22 : 18;
  const showLabel = active;

  return (
    <g data-pin="true" style={{ cursor: "grab" }}>
      <g
        transform={`translate(${x},${y})`}
        onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
        onMouseEnter={(e) => onHover?.(true, e.clientX, e.clientY)}
        onMouseLeave={() => onHover?.(false)}
        onPointerDown={onPinPointerDown}
        role="button"
        tabIndex={0}
        aria-label={`${node.name}, ${node.count}`}
      >
        {active && <circle r={r + 10} fill={node.color} opacity={0.12} />}

        {isSelected && (
          <circle r={r + 6} fill="none" stroke={S.primary} strokeWidth={2} opacity={0.85} />
        )}

        <circle
          r={r}
          fill="rgba(12,14,22,0.97)"
          stroke={active ? node.color : "rgba(255,255,255,0.22)"}
          strokeWidth={active ? 2.5 : 1.5}
          style={{ filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.5))" }}
        />

        {node.logoUrl ? (
          node.level === "country" || node.level === "continent" ? (
            <>
              <rect x={-(r - 2)} y={-(r - 2)} width={(r - 2) * 2} height={(r - 2) * 2} rx={5} fill="white" />
              <image
                href={node.logoUrl}
                x={-(r - 4)}
                y={-(r - 4)}
                width={(r - 4) * 2}
                height={(r - 4) * 2}
                preserveAspectRatio="xMidYMid meet"
              />
            </>
          ) : (
            <>
              <clipPath id={`pin-${node.id}`}>
                <circle r={r - 3} />
              </clipPath>
              <circle r={r - 2.5} fill="white" />
              <image
                href={node.logoUrl}
                x={-imgSize / 2}
                y={-imgSize / 2}
                width={imgSize}
                height={imgSize}
                clipPath={`url(#pin-${node.id})`}
                preserveAspectRatio="xMidYMid meet"
              />
            </>
          )
        ) : node.icon ? (
          <text textAnchor="middle" dominantBaseline="central" fontSize={r * 0.7}>
            {node.icon}
          </text>
        ) : null}

        <g transform={`translate(${r * 0.52}, ${-r * 0.52})`}>
          <rect
            x={-badgeW / 2}
            y={-9}
            width={badgeW}
            height={18}
            rx={9}
            fill={node.color}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth={0.5}
          />
          <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={r >= 18 ? 9 : 8} fontWeight={700}>
            {node.count > 99 ? "99+" : node.count}
          </text>
        </g>

        {showLabel && (
          <g transform={`translate(0, ${r + 12})`}>
            <rect
              x={-60}
              y={0}
              width={120}
              height={node.subtitle ? 34 : 22}
              rx={7}
              fill="rgba(8,10,18,0.97)"
              stroke={node.color}
              strokeWidth={1.2}
              strokeOpacity={0.55}
            />
            <text textAnchor="middle" y={15} fill="white" fontSize={11} fontWeight={600}>
              {node.name.length > 18 ? `${node.name.slice(0, 17)}…` : node.name}
            </text>
            {node.subtitle && (
              <text textAnchor="middle" y={28} fill="rgba(255,255,255,0.45)" fontSize={9}>
                {node.subtitle.length > 24 ? `${node.subtitle.slice(0, 23)}…` : node.subtitle}
              </text>
            )}
          </g>
        )}
      </g>
    </g>
  );
}

function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-orange-500/50 hover:text-orange-400";
  return (
    <div
      className="absolute top-3 right-3 flex flex-col gap-1.5 rounded-xl border p-1.5"
      style={{ background: "rgba(8,10,16,0.92)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <button type="button" className={btn} onClick={onZoomIn} aria-label="Zoom avant" style={{ color: "var(--text-muted)" }}>
        <ZoomIn size={15} />
      </button>
      <button type="button" className={btn} onClick={onZoomOut} aria-label="Zoom arrière" style={{ color: "var(--text-muted)" }}>
        <ZoomOut size={15} />
      </button>
      <button type="button" className={btn} onClick={onReset} aria-label="Réinitialiser" style={{ color: "var(--text-muted)" }}>
        <Maximize2 size={14} />
      </button>
    </div>
  );
}

export function ScoutGeoMap({
  nodes,
  step,
  continentId = null,
  countryId = null,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
  hint = "Sélectionnez sur la carte",
  className = "",
}: ScoutGeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 820, height: 440 });
  const [view, setView] = useState<MapViewConfig>(() => resolveMapView(step, continentId, countryId, 820));
  const [tooltip, setTooltip] = useState<{ node: BubbleNodeInput; x: number; y: number } | null>(null);
  const [pinOffsets, setPinOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const pinDrag = useRef<{ id: string; startX: number; startY: number; origDx: number; origDy: number } | null>(null);
  const { countries, loading } = useWorldMap();

  const resetKey = `${step}-${continentId}-${countryId}-${size.width}`;

  useEffect(() => {
    setPinOffsets({});
  }, [resetKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setView(resolveMapView(step, continentId, countryId, size.width));
  }, [step, continentId, countryId, size.width]);

  const projection = useMemo(
    () =>
      geoNaturalEarth1()
        .center(view.center)
        .scale(view.scale)
        .translate([size.width / 2, size.height / 2]),
    [view, size],
  );

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const maxCount = Math.max(...nodes.map((n) => n.count), 1);
  const level = nodes[0]?.level ?? "continent";

  const baseLayoutPins = useMemo(() => {
    const anchors = nodes.map((node) => {
      const coords = getNodeCoords(node.id, node.level, node.parentId);
      const pt = projection(coords);
      const r = markerRadius(node.count, node.level, maxCount, nodes.length);
      return {
        node,
        anchorX: pt?.[0] ?? 0,
        anchorY: pt?.[1] ?? 0,
        r,
      };
    });

    const spread = spreadMapPins(
      anchors.map((a) => ({
        id: a.node.id,
        anchorX: a.anchorX,
        anchorY: a.anchorY,
        radius: a.r,
        level: a.node.level,
      })),
      size.width,
      size.height,
    );

    const byId = new Map(spread.map((s) => [s.id, s]));

    return anchors.map((a) => {
      const pos = byId.get(a.node.id)!;
      return { ...a, ...pos };
    });
  }, [nodes, projection, maxCount, size.width, size.height]);

  const layoutPins = useMemo(
    () =>
      baseLayoutPins.map((p) => {
        const off = pinOffsets[p.node.id];
        return {
          ...p,
          x: p.x + (off?.dx ?? 0),
          y: p.y + (off?.dy ?? 0),
        };
      }),
    [baseLayoutPins, pinOffsets],
  );

  const autoFit = useMemo(
    () => fitTransformToPins(baseLayoutPins, size.width, size.height, 56),
    [baseLayoutPins, size.width, size.height],
  );

  const {
    transform,
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    reset,
  } = useMapPanZoom(size.width, size.height, resetKey, autoFit);

  const toScreen = useCallback(
    (svgX: number, svgY: number) => ({
      x: transform.x + svgX * transform.k,
      y: transform.y + svgY * transform.k,
    }),
    [transform],
  );

  const handlePinHover = useCallback(
    (node: BubbleNodeInput, hovered: boolean, pinX: number, pinY: number, clientX?: number, clientY?: number) => {
      onHover?.(hovered ? node : null);
      if (hovered) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (clientX != null && clientY != null && rect) {
          setTooltip({ node, x: clientX - rect.left, y: clientY - rect.top });
        } else {
          const s = toScreen(pinX, pinY);
          setTooltip({ node, x: s.x, y: s.y });
        }
      } else {
        setTooltip(null);
      }
    },
    [onHover, toScreen],
  );

  const handlePinPointerDown = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      e.stopPropagation();
      const off = pinOffsets[nodeId] ?? { dx: 0, dy: 0 };
      pinDrag.current = { id: nodeId, startX: e.clientX, startY: e.clientY, origDx: off.dx, origDy: off.dy };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    },
    [pinOffsets],
  );

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      onPointerMove(e);
      if (!pinDrag.current) return;
      const { id, startX, startY, origDx, origDy } = pinDrag.current;
      const dx = (e.clientX - startX) / transform.k;
      const dy = (e.clientY - startY) / transform.k;
      setPinOffsets((prev) => ({
        ...prev,
        [id]: { dx: origDx + dx, dy: origDy + dy },
      }));
    },
    [onPointerMove, transform.k],
  );

  const handleSvgPointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      pinDrag.current = null;
      onPointerUp(e);
    },
    [onPointerUp],
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border ${className}`}
      style={{
        background: "linear-gradient(180deg, #0a0d14 0%, #060810 100%)",
        borderColor: "rgba(255,255,255,0.06)",
        minHeight: 440,
        aspectRatio: "16/9",
      }}
    >
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} />

      <svg
        width={size.width}
        height={size.height}
        className="block w-full h-full touch-none"
        style={{ cursor: pinDrag.current ? "grabbing" : "grab" }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerLeave={handleSvgPointerUp}
      >
        <defs>
          <linearGradient id="land-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          <motion.g
            key={`view-${step}-${continentId}-${countryId}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {countries.map((geo, i) => (
              <path
                key={geo.id ?? i}
                d={pathGen(geo) ?? ""}
                fill="url(#land-fill)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={0.5 / transform.k}
              />
            ))}
          </motion.g>

          {layoutPins.map(({ node, anchorX, anchorY, x, y, displaced }) =>
            displaced ? (
              <g key={`ln-${node.id}`}>
                <line
                  x1={anchorX}
                  y1={anchorY}
                  x2={x}
                  y2={y}
                  stroke={node.color}
                  strokeWidth={1.5 / transform.k}
                  strokeOpacity={0.35}
                  strokeDasharray="3 4"
                />
                <circle cx={anchorX} cy={anchorY} r={3.5 / transform.k} fill={node.color} opacity={0.5} />
              </g>
            ) : null,
          )}

          {layoutPins.map(({ node, x, y, anchorX, anchorY, displaced, r }) => (
            <MapPin
              key={node.id}
              node={node}
              x={x}
              y={y}
              r={r}
              isHovered={hoveredId === node.id || tooltip?.node.id === node.id}
              isSelected={selectedId === node.id}
              onSelect={() => onSelect?.(node)}
              onHover={(h, cx, cy) => handlePinHover(node, h, x, y, cx, cy)}
              onPinPointerDown={(e) => handlePinPointerDown(node.id, e)}
            />
          ))}
        </g>

        {loading && (
          <text x={size.width / 2} y={size.height / 2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={11}>
            Chargement…
          </text>
        )}
      </svg>

      <AnimatePresence>
        {tooltip && (
          <motion.div
            className="pointer-events-none absolute z-30 rounded-xl border px-3.5 py-2.5 backdrop-blur-sm"
            style={{
              left: Math.min(tooltip.x + 12, size.width - 210),
              top: Math.max(tooltip.y - 76, 8),
              background: "rgba(10,12,20,0.97)",
              borderColor: `${tooltip.node.color}40`,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
            }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex items-center gap-2.5">
              {tooltip.node.logoUrl && (
                <div className="h-9 w-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
                  <img src={tooltip.node.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-white">{tooltip.node.name}</p>
                <p className="text-[10px] text-white/45 mt-0.5">
                  {tooltip.node.count} prospects
                  {tooltip.node.subtitle ? ` · ${tooltip.node.subtitle}` : ""}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
        style={{ background: "rgba(8,10,16,0.94)", borderColor: "rgba(255,255,255,0.05)" }}
      >
        <span className="text-[10px] text-white/40">{hint}</span>
        <span className="text-[10px] text-white/35 flex items-center gap-1.5">
          <Move size={11} />
          Glisser carte · Glisser pin · Molette zoom
        </span>
      </div>
    </div>
  );
}

export type { BubbleNodeInput };
