export type ContinentId = "afrique" | "europe" | "asie" | "am-nord" | "am-sud" | "oceanie";

export const CONTINENT_META: Record<ContinentId, { name: string; icon: string; color: string }> = {
  afrique: { name: "Afrique", icon: "🌍", color: "#FF7A00" },
  europe: { name: "Europe", icon: "🇪🇺", color: "#3B82F6" },
  asie: { name: "Asie", icon: "🌏", color: "#8B5CF6" },
  "am-nord": { name: "Amérique du Nord", icon: "🌎", color: "#10B981" },
  "am-sud": { name: "Amérique du Sud", icon: "🌎", color: "#EC4899" },
  oceanie: { name: "Océanie", icon: "🏝️", color: "#F59E0B" },
};

const AFRICA = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG",
  "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML",
  "MR", "MU", "MA", "MZ", "NA", "NE", "NG", "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD",
  "TZ", "TG", "TN", "UG", "ZM", "ZW",
]);

const ASIA = new Set([
  "AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "CY", "GE", "IN", "ID", "IR", "IQ", "IL",
  "JP", "JO", "KZ", "KW", "KG", "LA", "LB", "MY", "MV", "MN", "MM", "NP", "KP", "OM", "PK", "PS",
  "PH", "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TL", "TR", "TM", "AE", "UZ", "VN", "YE",
]);

const NORTH_AMERICA = new Set(["US", "CA", "MX", "GT", "HN", "SV", "NI", "CR", "PA", "BZ", "JM", "HT", "DO", "CU", "TT", "BB"]);

const SOUTH_AMERICA = new Set(["AR", "BO", "BR", "CL", "CO", "EC", "GY", "PY", "PE", "SR", "UY", "VE"]);

const OCEANIA = new Set(["AU", "NZ", "FJ", "PG", "NC", "PF", "WS", "TO", "VU", "SB"]);

const EUROPE = new Set([
  "AL", "AD", "AT", "BY", "BE", "BA", "BG", "HR", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MT", "MD", "MC", "ME", "NL", "MK", "NO", "PL",
  "PT", "RO", "RU", "SM", "RS", "SK", "SI", "ES", "SE", "CH", "UA", "GB", "EN", "WA", "SC",
]);

export function countryToContinent(code: string | null | undefined): ContinentId {
  const c = (code ?? "").toUpperCase();
  if (AFRICA.has(c)) return "afrique";
  if (ASIA.has(c)) return "asie";
  if (NORTH_AMERICA.has(c)) return "am-nord";
  if (SOUTH_AMERICA.has(c)) return "am-sud";
  if (OCEANIA.has(c)) return "oceanie";
  if (EUROPE.has(c)) return "europe";
  return "europe";
}

export function flagEmoji(code: string): string {
  const c = code.toUpperCase();
  if (c.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

export function flagUrl(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function currentSeasonYear(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

/** Free API-Sports plan: seasons 2022–2024. Try those first. */
export function seasonCandidates(): number[] {
  const y = currentSeasonYear();
  return [...new Set([2024, 2023, 2022, y, y - 1, y - 2])];
}
