import type { BubbleLevel, BubbleNodeLayout, LabelBox, LabelPlacement } from "./bubbleMapTypes";

const LABEL_PAD = 6;
const LABEL_MARGIN = 4;
const OUTSIDE_GAP = 12;

function boxesOverlap(a: LabelBox, b: LabelBox, margin = LABEL_MARGIN): boolean {
  return !(
    a.x + a.width + margin <= b.x ||
    b.x + b.width + margin <= a.x ||
    a.y + a.height + margin <= b.y ||
    b.y + b.height + margin <= a.y
  );
}

function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52;
}

function labelLines(node: BubbleNodeLayout): string[] {
  const countLabel =
    node.level === "team"
      ? `${node.count} joueur${node.count > 1 ? "s" : ""}`
      : `${node.count} prospects`;
  return [node.name, node.subtitle ?? countLabel];
}

function shouldUseInside(node: BubbleNodeLayout): boolean {
  if (node.level === "continent" || node.level === "country") return false;
  if (node.radius < 46) return false;
  if (node.name.length > 16) return false;
  const lines = labelLines(node);
  const fontSize = Math.min(12, node.radius * 0.2);
  const maxW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize)));
  return maxW <= node.radius * 1.55;
}

function insideLabelBox(node: BubbleNodeLayout, lines: string[]): LabelBox {
  const fontSize = Math.min(12, Math.max(9, node.radius * 0.2));
  const lineHeight = fontSize * 1.3;
  const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize)));
  const w = Math.min(maxLineW + LABEL_PAD * 2, node.radius * 1.6);
  const h = lines.length * lineHeight + LABEL_PAD;
  return {
    x: node.x - w / 2,
    y: node.y - h / 2 + node.radius * 0.28,
    width: w,
    height: h,
  };
}

function outsideLabelBox(
  node: BubbleNodeLayout,
  lines: string[],
  angleRad: number,
): { box: LabelBox; leader: { x1: number; y1: number; x2: number; y2: number } } {
  const fontSize = 11;
  const lineHeight = fontSize * 1.35;
  const maxLineW = Math.max(...lines.map((l) => estimateTextWidth(l, fontSize)), 56);
  const w = maxLineW + LABEL_PAD * 2 + 4;
  const h = lines.length * lineHeight + LABEL_PAD * 2;

  const edgeX = node.x + Math.cos(angleRad) * (node.radius + OUTSIDE_GAP);
  const edgeY = node.y + Math.sin(angleRad) * (node.radius + OUTSIDE_GAP);
  const dist = node.radius + OUTSIDE_GAP + w / 2 + 6;
  const labelCenterX = node.x + Math.cos(angleRad) * dist;
  const labelCenterY = node.y + Math.sin(angleRad) * dist;

  return {
    box: {
      x: labelCenterX - w / 2,
      y: labelCenterY - h / 2,
      width: w,
      height: h,
    },
    leader: { x1: edgeX, y1: edgeY, x2: labelCenterX, y2: labelCenterY },
  };
}

function tryOutside(
  node: BubbleNodeLayout,
  lines: string[],
  occupied: LabelBox[],
): LabelPlacement | null {
  const steps = 16;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const { box, leader } = outsideLabelBox(node, lines, angle);
    if (!occupied.some((o) => boxesOverlap(box, o))) {
      occupied.push(box);
      return {
        nodeId: node.id,
        mode: "outside",
        lines,
        labelX: box.x + LABEL_PAD,
        labelY: box.y + LABEL_PAD,
        labelWidth: box.width,
        labelHeight: box.height,
        leader,
      };
    }
  }
  return null;
}

/**
 * Pure label placement — no DOM.
 * Continents & countries: always outside. Teams: inside only when space allows.
 */
export function placeBubbleLabels(nodes: BubbleNodeLayout[]): LabelPlacement[] {
  const placed: LabelPlacement[] = [];
  const occupied: LabelBox[] = [];

  const sorted = [...nodes].sort((a, b) => b.radius - a.radius);

  for (const node of sorted) {
    const lines = labelLines(node);

    if (shouldUseInside(node)) {
      const box = insideLabelBox(node, lines);
      if (!occupied.some((o) => boxesOverlap(box, o))) {
        occupied.push(box);
        placed.push({
          nodeId: node.id,
          mode: "inside",
          lines,
          labelX: box.x,
          labelY: box.y + LABEL_PAD,
          labelWidth: box.width,
          labelHeight: box.height,
        });
        continue;
      }
    }

    const outside = tryOutside(node, lines, occupied);
    if (outside) {
      placed.push(outside);
      continue;
    }

    const angle = (sorted.indexOf(node) / sorted.length) * Math.PI * 2;
    const { box, leader } = outsideLabelBox(node, lines, angle);
    occupied.push(box);
    placed.push({
      nodeId: node.id,
      mode: "outside",
      lines,
      labelX: box.x + LABEL_PAD,
      labelY: box.y + LABEL_PAD,
      labelWidth: box.width,
      labelHeight: box.height,
      leader,
    });
  }

  return placed;
}

export function collidePadding(level: BubbleLevel, nodeCount: number): number {
  const base = level === "continent" ? 18 : level === "country" ? 14 : 10;
  return base + Math.min(nodeCount, 8);
}
