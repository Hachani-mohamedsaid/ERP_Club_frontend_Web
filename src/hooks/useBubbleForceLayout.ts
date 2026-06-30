import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  forceSimulation,
  forceCollide,
  forceX,
  forceY,
  forceCenter,
  forceManyBody,
  type SimulationNodeDatum,
} from "d3-force";
import type { BubbleNodeInput, BubbleNodeLayout, LabelPlacement, BubbleLevel } from "../lib/scout/bubbleMapTypes";
import { countExtents, radiusForLevel } from "../lib/scout/bubbleRadius";
import { collidePadding, placeBubbleLabels } from "../lib/scout/labelCollision";

interface SimNode extends BubbleNodeInput, SimulationNodeDatum {
  radius: number;
}

const TICKS = 280;

function runSimulation(
  inputs: BubbleNodeInput[],
  width: number,
  height: number,
): BubbleNodeLayout[] {
  if (inputs.length === 0 || width <= 0 || height <= 0) return [];

  const level: BubbleLevel = inputs[0]?.level ?? "continent";
  const counts = inputs.map((n) => n.count);
  const { min, max } = countExtents(counts);
  const cx = width / 2;
  const cy = height / 2;
  const pad = collidePadding(level, inputs.length);

  const simNodes: SimNode[] = inputs.map((n, i) => {
    const radius = radiusForLevel(n.level, n.count, min, max, width);
    const angle = (i / inputs.length) * Math.PI * 2 - Math.PI / 2;
    const spreadFactor = level === "continent" ? 0.34 : level === "country" ? 0.28 : 0.24;
    const spread = Math.min(width, height) * spreadFactor;
    return {
      ...n,
      radius,
      x: cx + Math.cos(angle) * spread,
      y: cy + Math.sin(angle) * spread,
    };
  });

  const sim = forceSimulation(simNodes)
    .force(
      "collide",
      forceCollide<SimNode>((d) => d.radius + pad).strength(1).iterations(4),
    )
    .force("charge", forceManyBody<SimNode>().strength(level === "continent" ? -28 : -18))
    .force("x", forceX(cx).strength(0.05))
    .force("y", forceY(cy).strength(0.05))
    .force("center", forceCenter(cx, cy).strength(0.06))
    .stop();

  for (let i = 0; i < TICKS; i++) sim.tick();

  const edge = 16;
  return simNodes.map((n) => ({
    ...n,
    x: Math.max(n.radius + edge, Math.min(width - n.radius - edge, n.x ?? cx)),
    y: Math.max(n.radius + edge, Math.min(height - n.radius - edge, n.y ?? cy)),
  }));
}

function nodesKey(nodes: BubbleNodeInput[]) {
  return nodes.map((n) => `${n.id}:${n.count}:${n.level}`).join("|");
}

export function useBubbleForceLayout(
  nodes: BubbleNodeInput[],
  containerRef: RefObject<HTMLElement | null>,
) {
  const [size, setSize] = useState({ width: 800, height: 460 });
  const [layout, setLayout] = useState<BubbleNodeLayout[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let debounce: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width <= 0 || height <= 0) return;
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }, 100);
    });

    ro.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.width > 0) {
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }

    return () => {
      clearTimeout(debounce);
      ro.disconnect();
    };
  }, [containerRef]);

  const nodeKey = useMemo(() => nodesKey(nodes), [nodes]);

  useEffect(() => {
    setLayout(runSimulation(nodes, size.width, size.height));
  }, [nodeKey, nodes, size.width, size.height]);

  const labels = useMemo(() => placeBubbleLabels(layout), [layout]);

  const labelById = useMemo(() => {
    const map = new Map<string, LabelPlacement>();
    labels.forEach((l) => map.set(l.nodeId, l));
    return map;
  }, [labels]);

  return { layout, labels, labelById, width: size.width, height: size.height };
}
