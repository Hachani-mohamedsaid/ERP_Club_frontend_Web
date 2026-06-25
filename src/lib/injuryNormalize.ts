import type { BodyZone } from "../components/medical/BodyInjuryViewer";

export interface InjuryRow {
  id: string;
  name: string;
  injury: string;
  bodyPart: string | null;
  returnDate: string;
  riskIA: number;
  createdAt?: string;
}

export interface ClubHeatZone {
  id: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "critical";
  players: string[];
  lastControl: string;
}

export const BODY_PART_OPTIONS = [
  { id: "knee-left", label: "Genou gauche" },
  { id: "knee-right", label: "Genou droit" },
  { id: "ankle-left", label: "Cheville gauche" },
  { id: "ankle-right", label: "Cheville droite" },
  { id: "groin", label: "Ischio-jambiers" },
  { id: "shoulder-left", label: "Épaule gauche" },
  { id: "shoulder-right", label: "Épaule droite" },
  { id: "chest", label: "Poitrine" },
  { id: "abdomen", label: "Abdomen" },
  { id: "arm-left", label: "Bras gauche" },
  { id: "arm-right", label: "Bras droit" },
  { id: "head", label: "Tête / Cou" },
] as const;

export const INJURY_TYPE_OPTIONS = [
  "Hamstring",
  "Entorse",
  "Déchirure musculaire",
  "Inflammation",
  "Fracture",
  "Tendinite",
  "Contusion",
  "Pubalgie",
  "LCA / Ligaments",
  "Autre",
] as const;

const ALL_ZONE_IDS = [
  "head", "shoulder-left", "shoulder-right", "arm-left", "arm-right",
  "chest", "abdomen", "groin", "knee-left", "knee-right", "ankle-left", "ankle-right",
] as const;

function zoneLabel(id: string): string {
  return BODY_PART_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export function getBodyPartLabel(value: string): string {
  const byId = BODY_PART_OPTIONS.find((o) => o.id === value);
  if (byId) return byId.label;
  return value;
}

export function bodyPartToZoneId(bodyPart: string | null | undefined): string {
  if (!bodyPart?.trim()) return "groin";
  const lower = bodyPart.toLowerCase().trim();
  const byId = BODY_PART_OPTIONS.find((o) => o.id === lower);
  if (byId) return byId.id;
  const byLabel = BODY_PART_OPTIONS.find((o) => o.label.toLowerCase() === lower);
  if (byLabel) return byLabel.id;
  if (lower.includes("genou") && lower.includes("gauche")) return "knee-left";
  if (lower.includes("genou") && lower.includes("droit")) return "knee-right";
  if (lower.includes("cheville") && lower.includes("gauche")) return "ankle-left";
  if (lower.includes("cheville") && lower.includes("droit")) return "ankle-right";
  if (lower.includes("ischio") || lower.includes("cuisse")) return "groin";
  if (lower.includes("épaule") && lower.includes("gauche")) return "shoulder-left";
  if (lower.includes("épaule") && lower.includes("droit")) return "shoulder-right";
  return "groin";
}

export function riskToSeverity(risk: number): "low" | "medium" | "critical" {
  if (risk >= 7) return "critical";
  if (risk >= 4) return "medium";
  return "low";
}

export function riskToPercent(riskIA: number): number {
  return Math.min(100, Math.max(0, riskIA * 10));
}

export function injuryStorageKeys(row: InjuryRow): string[] {
  const keys = new Set<string>([row.id]);
  const base = `${row.name.trim().toLowerCase()}|${row.injury.trim().toLowerCase()}`;
  keys.add(base);
  const dates = new Set<string>([row.returnDate]);
  if (row.returnDate && row.returnDate !== "—") {
    const parsed = new Date(row.returnDate.includes("/")
      ? row.returnDate.split("/").reverse().join("-")
      : row.returnDate);
    if (!Number.isNaN(parsed.getTime())) {
      dates.add(parsed.toLocaleDateString("fr-FR"));
      dates.add(parsed.toISOString().split("T")[0]);
    }
  }
  for (const d of dates) keys.add(`${base}|${d}`);
  return [...keys];
}

export function lookupBodyPartOverride(
  row: InjuryRow,
  overrides: Record<string, string>,
): string | null {
  if (row.bodyPart?.trim()) return row.bodyPart;
  for (const key of injuryStorageKeys(row)) {
    const hit = overrides[key];
    if (hit) return hit;
  }
  return null;
}

export function buildOverrideEntries(
  zoneId: string,
  row: Pick<InjuryRow, "id" | "name" | "injury" | "returnDate">,
  isoReturnDate?: string,
): Record<string, string> {
  const entries: Record<string, string> = {};
  const frDate = isoReturnDate
    ? new Date(`${isoReturnDate}T12:00:00`).toLocaleDateString("fr-FR")
    : row.returnDate;
  const draft: InjuryRow = {
    id: row.id,
    name: row.name,
    injury: row.injury,
    returnDate: frDate,
    bodyPart: null,
    riskIA: 0,
  };
  for (const key of injuryStorageKeys(draft)) entries[key] = zoneId;
  if (isoReturnDate) {
    const isoDraft = { ...draft, returnDate: isoReturnDate };
    for (const key of injuryStorageKeys(isoDraft)) entries[key] = zoneId;
  }
  return entries;
}

export function resolveInjuryZoneId(inj: InjuryRow): string {
  return bodyPartToZoneId(inj.bodyPart);
}

export function buildHeatZones(injuries: InjuryRow[]): ClubHeatZone[] {
  const grouped = new Map<string, { players: Set<string>; risks: number[]; lastControl: string }>();

  for (const inj of injuries) {
    const zoneId = resolveInjuryZoneId(inj);
    const entry = grouped.get(zoneId) ?? { players: new Set(), risks: [], lastControl: "" };
    entry.players.add(inj.name);
    entry.risks.push(inj.riskIA);
    if (inj.createdAt) {
      const d = new Date(inj.createdAt).toLocaleDateString("fr-FR");
      if (!entry.lastControl || d > entry.lastControl) entry.lastControl = d;
    }
    grouped.set(zoneId, entry);
  }

  return [...grouped.entries()]
    .map(([id, data]) => {
      const maxRisk = Math.max(...data.risks, 0);
      const zoneInjuries = injuries.filter((i) => resolveInjuryZoneId(i) === id);
      return {
        id,
        label: zoneLabel(id),
        count: zoneInjuries.length,
        severity: riskToSeverity(maxRisk),
        players: [...data.players],
        lastControl: data.lastControl || "—",
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function buildPreviewBodyZones(zoneId: string, riskScore: number): BodyZone[] {
  const severity = riskToSeverity(riskScore);
  const riskPercent = riskToPercent(riskScore);
  return ALL_ZONE_IDS.map((id) => ({
    id,
    name: zoneLabel(id),
    severity: id === zoneId ? severity : "none",
    risk: id === zoneId ? riskPercent : undefined,
    lastControl: "—",
  }));
}

export function mergeBodyZonesWithPreview(
  base: BodyZone[],
  zoneId: string,
  riskScore: number,
): BodyZone[] {
  const preview = buildPreviewBodyZones(zoneId, riskScore).find((z) => z.id === zoneId);
  if (!preview) return base;
  return base.map((z) => (z.id === zoneId ? { ...z, ...preview } : z));
}

export function buildBodyZones(heatZones: ClubHeatZone[], injuries: InjuryRow[]): BodyZone[] {
  const heatMap = new Map(heatZones.map((z) => [z.id, z]));

  return ALL_ZONE_IDS.map((id) => {
    const heat = heatMap.get(id);
    if (!heat) {
      return { id, name: zoneLabel(id), severity: "none" as const };
    }
    const zoneInjuries = injuries.filter((i) => resolveInjuryZoneId(i) === id);
    const maxRisk = zoneInjuries.reduce((m, i) => Math.max(m, i.riskIA), 0);
    const riskPercent = riskToPercent(maxRisk);

    return {
      id,
      name: heat.label,
      severity: heat.severity,
      description: `${heat.count} blessure${heat.count > 1 ? "s" : ""}`,
      risk: riskPercent,
      lastControl: heat.lastControl,
      injuryInfo: heat.players[0]
        ? {
            player: heat.players[0],
            grade: heat.severity === "critical" ? "Grade II" : "Grade I",
            risk: riskPercent,
            daysRemaining: 12,
          }
        : undefined,
    };
  });
}

export function normalizeInjuryData(raw: unknown): {
  kpis: { injured: number; available: number; avgRisk: number };
  injured: InjuryRow[];
} {
  if (!raw || typeof raw !== "object") {
    return {
      kpis: { injured: 0, available: 0, avgRisk: 0 },
      injured: [],
    };
  }

  const data = raw as Record<string, unknown>;
  const kpisRaw = (data.kpis ?? {}) as Record<string, number>;
  const list = Array.isArray(data.injured) ? data.injured : [];

  const injured: InjuryRow[] = list.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      name: String(row.name ?? ""),
      injury: String(row.injury ?? row.injuryType ?? ""),
      bodyPart: row.bodyPart != null ? String(row.bodyPart) : null,
      returnDate: String(row.returnDate ?? "—"),
      riskIA: Number(row.riskIA ?? 0),
      createdAt: row.createdAt ? String(row.createdAt) : undefined,
    };
  });

  return {
    kpis: {
      injured: Number(kpisRaw.injured ?? new Set(injured.map((i) => i.name)).size),
      available: Number(kpisRaw.available ?? 0),
      avgRisk: injured.length
        ? Math.round(injured.reduce((s, i) => s + riskToPercent(i.riskIA), 0) / injured.length)
        : Number(kpisRaw.avgRisk ?? 0),
    },
    injured,
  };
}
