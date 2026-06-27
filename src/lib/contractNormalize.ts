export interface ContractRow {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  salaryMonthly: number;
  bonus: number;
  releaseClause: string | null;
  consumedPct: number;
  daysLeft: number;
}

export function computeConsumedPct(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

export function computeDaysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function normalizeContracts(raw: unknown): ContractRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const c = item as Record<string, unknown>;
    const startDate = String(c.startDate ?? "");
    const endDate = String(c.endDate ?? "");
    const storedPct = Number(c.consumedPct ?? 0);
    return {
      id: String(c.id ?? ""),
      holderName: String(c.holderName ?? ""),
      startDate,
      endDate,
      salaryMonthly: Number(c.salaryMonthly ?? 0),
      bonus: Number(c.bonus ?? 0),
      releaseClause: c.releaseClause ? String(c.releaseClause) : null,
      consumedPct: storedPct > 0 ? storedPct : computeConsumedPct(startDate, endDate),
      daysLeft: computeDaysLeft(endDate),
    };
  });
}

export function getAlertLevel(daysLeft: number) {
  if (daysLeft <= 30) return { color: "#EF4444", label: "Expire < 30 jours" };
  if (daysLeft <= 90) return { color: "#F59E0B", label: "Expire < 90 jours" };
  return { color: "#22C55E", label: "Actif" };
}

export function buildTimeline(contracts: ContractRow[]) {
  const buckets = [
    { label: "Expire dans 15 jours", max: 15, min: 0, color: "#EF4444" },
    { label: "Expire dans 45 jours", max: 45, min: 16, color: "#F59E0B" },
    { label: "Expire dans 3 mois", max: 90, min: 46, color: "#EAB308" },
    { label: "Actifs", max: Infinity, min: 91, color: "#22C55E" },
  ];

  return buckets.map((b) => {
    const players = contracts
      .filter((c) => {
        if (c.daysLeft < 0) return b.max === 15;
        if (b.label === "Actifs") return c.daysLeft > 90;
        if (b.max === 15) return c.daysLeft <= 15;
        if (b.max === 45) return c.daysLeft > 15 && c.daysLeft <= 45;
        if (b.max === 90) return c.daysLeft > 45 && c.daysLeft <= 90;
        return false;
      })
      .map((c) => c.holderName);
    return { ...b, count: players.length, players };
  });
}

export function buildAiRecommendations(contracts: ContractRow[]) {
  const recs: { action: string; player: string; reason: string; color: string; contractId?: string }[] = [];

  const renew = contracts
    .filter((c) => c.daysLeft > 0 && c.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0];
  if (renew) {
    recs.push({
      action: "Renouveler",
      player: renew.holderName,
      reason: `Contrat expire dans ${renew.daysLeft} jour${renew.daysLeft > 1 ? "s" : ""} — priorité renouvellement`,
      color: "#22C55E",
      contractId: renew.id,
    });
  }

  const sell = contracts
    .filter((c) => c.consumedPct >= 80 && c.daysLeft > 90)
    .sort((a, b) => b.consumedPct - a.consumedPct)[0];
  if (sell) {
    recs.push({
      action: "Vendre",
      player: sell.holderName,
      reason: `Contrat consommé à ${sell.consumedPct}% — évaluer transfert`,
      color: "#EF4444",
      contractId: sell.id,
    });
  }

  const loan = contracts
    .filter((c) => c.consumedPct >= 20 && c.consumedPct <= 50 && c.daysLeft > 180)[0];
  if (loan) {
    recs.push({
      action: "Prêter",
      player: loan.holderName,
      reason: "Temps de jeu limité, potentiel à développer en prêt",
      color: "#6366F1",
      contractId: loan.id,
    });
  }

  return recs.slice(0, 3);
}

export function extendContractEndDate(endDate: string, years = 1) {
  const d = new Date(endDate);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setFullYear(fallback.getFullYear() + years);
    return fallback.toISOString().split("T")[0];
  }
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split("T")[0];
}
