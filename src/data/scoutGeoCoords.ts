import type { BubbleLevel } from "../lib/scout/bubbleMapTypes";

export type LngLat = [number, number];

export interface MapViewConfig {
  center: LngLat;
  scale: number;
}

/** Geographic center of each continent */
export const CONTINENT_COORDS: Record<string, LngLat> = {
  afrique: [20, 4],
  europe: [15, 50],
  asie: [95, 32],
  "am-nord": [-98, 42],
  "am-sud": [-58, -12],
  oceanie: [135, -22],
};

/** Capital / hub coordinates for countries */
export const COUNTRY_COORDS: Record<string, LngLat> = {
  tn: [9.5, 34],
  dz: [3, 28.5],
  ma: [-6.8, 33.5],
  ci: [-5.3, 7.5],
  sn: [-17.4, 14.7],
  ng: [8, 9.5],
  eg: [31, 30],
  fr: [2.5, 46.5],
  es: [-3.7, 40.4],
  pt: [-8.6, 39.5],
  gb: [-1.5, 52.5],
  de: [10.5, 51],
  it: [12.5, 42.5],
  nl: [5.5, 52.2],
  be: [4.5, 50.8],
  br: [-47.9, -15.8],
  ar: [-58.4, -34.6],
};

/** City coordinates for clubs */
export const TEAM_COORDS: Record<string, LngLat> = {
  est: [10.64, 35.83],
  ca: [10.18, 36.8],
  css: [10.76, 34.74],
  st: [10.18, 36.8],
  ari: [10.19, 36.86],
  mon: [10.83, 35.77],
  kab: [4.05, 36.73],
  mc: [3.04, 36.75],
  wyd: [-7.62, 33.59],
  raj: [-6.83, 34.02],
  asec: [-4.03, 5.33],
  afad: [-4.03, 6.5],
  gen: [-16.93, 14.79],
  jaraaf: [-17.44, 14.69],
  ahly: [31.22, 30.06],
  zamalek: [31.22, 30.06],
  pyramids: [31.0, 30.05],
  enyimba: [7.37, 5.1],
  rivers: [6.99, 4.78],
  psg: [2.35, 48.86],
  ol: [4.84, 45.76],
  om: [5.37, 43.3],
  rm: [-3.7, 40.42],
  barca: [2.17, 41.38],
  atm: [-3.7, 40.42],
  benfica: [-9.14, 38.72],
  porto: [-8.61, 41.16],
  city: [-2.28, 53.48],
  arsenal: [-0.13, 51.56],
  liverpool: [-2.99, 53.41],
  manu: [-2.29, 53.46],
  chelsea: [-0.19, 51.48],
  bayern: [11.58, 48.14],
  dortmund: [7.47, 51.49],
  leverkusen: [7.0, 51.03],
  inter: [9.19, 45.46],
  milan: [9.12, 45.48],
  juve: [7.64, 45.11],
  napoli: [14.27, 40.86],
  ajax: [4.94, 52.34],
  psv: [5.47, 51.44],
  feyenoord: [4.49, 51.92],
  brugge: [3.22, 51.19],
  anderlecht: [4.29, 50.84],
  flamengo: [-43.23, -22.91],
  palmeiras: [-46.72, -23.53],
  boca: [-58.37, -34.61],
  river: [-58.45, -34.55],
};

const CONTINENT_VIEWS: Record<string, MapViewConfig> = {
  afrique: { center: [15, 5], scale: 340 },
  europe: { center: [5, 52], scale: 560 },
  asie: { center: [90, 35], scale: 300 },
  "am-nord": { center: [-100, 45], scale: 380 },
  "am-sud": { center: [-58, -15], scale: 420 },
  oceanie: { center: [140, -22], scale: 450 },
};

const COUNTRY_VIEWS: Record<string, MapViewConfig> = {
  tn: { center: [9.5, 34], scale: 3200 },
  dz: { center: [3, 28], scale: 2200 },
  ma: { center: [-6.5, 32], scale: 2400 },
  ci: { center: [-5.5, 7.5], scale: 2800 },
  sn: { center: [-16, 14.5], scale: 3200 },
  ng: { center: [8, 9], scale: 2200 },
  eg: { center: [30, 27], scale: 2200 },
  fr: { center: [2.5, 46.5], scale: 2200 },
  es: { center: [-3.5, 40], scale: 2200 },
  pt: { center: [-8.5, 39.5], scale: 2800 },
  gb: { center: [-2, 53.5], scale: 2800 },
  de: { center: [10.5, 51], scale: 2200 },
  it: { center: [12.5, 42.5], scale: 2200 },
  nl: { center: [5.5, 52], scale: 3500 },
  be: { center: [4.5, 50.8], scale: 4000 },
  br: { center: [-52, -14], scale: 900 },
  ar: { center: [-64, -34], scale: 1800 },
};

export const WORLD_VIEW: MapViewConfig = { center: [10, 12], scale: 135 };

export function getNodeCoords(id: string, level: BubbleLevel, parentId?: string): LngLat {
  if (level === "continent") return CONTINENT_COORDS[id] ?? [0, 0];
  if (level === "country") return COUNTRY_COORDS[id] ?? [0, 0];
  return TEAM_COORDS[id] ?? (parentId ? COUNTRY_COORDS[parentId] : [0, 0]) ?? [0, 0];
}

export function resolveMapView(
  step: number,
  continentId: string | null,
  countryId: string | null,
  width: number,
): MapViewConfig {
  const k = width / 820;
  if (step === 2 && countryId && COUNTRY_VIEWS[countryId]) {
    const v = COUNTRY_VIEWS[countryId];
    return { center: v.center, scale: v.scale * k };
  }
  if (step >= 1 && continentId && CONTINENT_VIEWS[continentId]) {
    const v = CONTINENT_VIEWS[continentId];
    return { center: v.center, scale: v.scale * k };
  }
  return { center: WORLD_VIEW.center, scale: WORLD_VIEW.scale * k };
}

export function markerRadius(
  count: number,
  level: BubbleLevel,
  maxCount: number,
  nodeCount = 1,
): number {
  let min = level === "continent" ? 18 : level === "country" ? 16 : 14;
  let max = level === "continent" ? 28 : level === "country" ? 24 : 22;
  if (nodeCount > 6 && level === "country") {
    min = 14;
    max = 20;
  }
  if (maxCount <= 0) return (min + max) / 2;
  const t = Math.sqrt(count / maxCount);
  return min + t * (max - min);
}
