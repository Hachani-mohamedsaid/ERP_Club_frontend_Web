import { forceSimulation, forceCollide, forceX, forceY } from "d3-force";
import type { BubbleLevel } from "./bubbleMapTypes";

export interface PinLayoutInput {
  id: string;
  anchorX: number;
  anchorY: number;
  radius: number;
  level: BubbleLevel;
}

export interface PinLayoutResult {
  id: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  displaced: boolean;
}

const TICKS = 150;

function collidePad(level: BubbleLevel): number {
  if (level === "continent") return 28;
  if (level === "country") return 24;
  return 20;
}

function anchorStrength(level: BubbleLevel, count: number): number {
  if (level === "continent") return 0.35;
  if (level === "country") return count > 5 ? 0.08 : 0.14;
  return count > 3 ? 0.1 : 0.18;
}

/**
 * Spreads overlapping map pins while keeping them near geographic anchors.
 * Pure layout — no DOM.
 */
export function spreadMapPins(
  pins: PinLayoutInput[],
  width: number,
  height: number,
): PinLayoutResult[] {
  if (pins.length === 0) return [];

  const pad = 24;
  const strength = anchorStrength(pins[0]?.level ?? "country", pins.length);

  type SimNode = PinLayoutInput & { x: number; y: number };

  const simNodes: SimNode[] = pins.map((p) => ({
    ...p,
    x: p.anchorX,
    y: p.anchorY,
  }));

  const sim = forceSimulation(simNodes)
    .force(
      "collide",
      forceCollide<SimNode>((d) => d.radius + collidePad(d.level)).strength(1).iterations(4),
    )
    .force("x", forceX<SimNode>((d) => d.anchorX).strength(strength))
    .force("y", forceY<SimNode>((d) => d.anchorY).strength(strength))
    .stop();

  for (let i = 0; i < TICKS; i++) sim.tick();

  return simNodes.map((n) => {
    const x = Math.max(pad, Math.min(width - pad, n.x));
    const y = Math.max(pad, Math.min(height - pad, n.y));
    const dx = x - n.anchorX;
    const dy = y - n.anchorY;
    return {
      id: n.id,
      x,
      y,
      anchorX: n.anchorX,
      anchorY: n.anchorY,
      displaced: Math.hypot(dx, dy) > 6,
    };
  });
}
