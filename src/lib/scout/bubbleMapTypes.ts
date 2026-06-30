export type BubbleLevel = "continent" | "country" | "team";

export interface BubbleNodeInput {
  id: string;
  name: string;
  count: number;
  level: BubbleLevel;
  parentId?: string;
  color: string;
  icon?: string;
  logoUrl?: string;
  leagueLogoUrl?: string;
  subtitle?: string;
}

export interface BubbleNodeLayout extends BubbleNodeInput {
  x: number;
  y: number;
  radius: number;
}

export interface LabelBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LabelPlacement {
  nodeId: string;
  mode: "inside" | "outside";
  lines: string[];
  /** Label anchor (top-left of text box) */
  labelX: number;
  labelY: number;
  labelWidth: number;
  labelHeight: number;
  /** Leader line from bubble edge to label */
  leader?: { x1: number; y1: number; x2: number; y2: number };
}

export interface ScoutBubbleMapProps {
  nodes: BubbleNodeInput[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (node: BubbleNodeInput) => void;
  onHover?: (node: BubbleNodeInput | null) => void;
  hint?: string;
  className?: string;
}
