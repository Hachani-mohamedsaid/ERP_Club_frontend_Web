export type ReqType = "Recrutement" | "Contrat" | "Budget" | "Convocation" | "Médical";
export type ReqStatus = "En attente" | "Validé" | "Refusé" | "Retour";

export interface ValidationRequest {
  id: string;
  type: ReqType;
  title: string;
  from: string;
  detail: string;
  amount?: string;
  priority: "Critique" | "Haute" | "Normale";
  status: ReqStatus;
  date: string;
  sourceId?: string;
  sourceKind?: "notification" | "contract" | "injury" | "finance";
}

interface NotificationInput {
  id: string;
  title: string;
  body: string;
  type: string;
  level: string;
  isRead: boolean;
  createdAt: string;
}

interface ContractInput {
  id: string;
  holderName: string;
  endDate: string;
  consumedPct: number;
  salaryMonthly: number;
}

interface InjuryInput {
  id: string;
  name: string;
  injury: string;
  bodyPart?: string;
  returnDate?: string;
  riskIA?: number;
  createdAt?: string;
}

function mapNotifType(type: string): ReqType {
  if (/contrat/i.test(type)) return "Contrat";
  if (/finance|budget/i.test(type)) return "Budget";
  if (/medical|médical/i.test(type)) return "Médical";
  if (/recrut/i.test(type)) return "Recrutement";
  return "Convocation";
}

function mapPriority(level: string): ValidationRequest["priority"] {
  if (level === "critical") return "Critique";
  if (level === "warning") return "Haute";
  return "Normale";
}

function formatDateTime(raw: string) {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function buildValidationRequests(input: {
  notifications: NotificationInput[];
  contracts: ContractInput[];
  injuries: InjuryInput[];
}): ValidationRequest[] {
  const items: ValidationRequest[] = [];

  for (const n of input.notifications) {
    items.push({
      id: `notif-${n.id}`,
      sourceId: n.id,
      sourceKind: "notification",
      type: mapNotifType(n.type),
      title: n.title,
      from: "Système club",
      detail: n.body,
      priority: mapPriority(n.level),
      status: n.isRead ? "Validé" : "En attente",
      date: formatDateTime(n.createdAt),
    });
  }

  for (const c of input.contracts.filter((x) => x.consumedPct >= 85)) {
    items.push({
      id: `contract-${c.id}`,
      sourceId: c.id,
      sourceKind: "contract",
      type: "Contrat",
      title: "Renouvellement contrat",
      from: "Direction sportive",
      detail: `${c.holderName} — ${c.salaryMonthly.toLocaleString("fr-FR")} DT/mois — expire ${new Date(c.endDate).toLocaleDateString("fr-FR")}`,
      priority: c.consumedPct >= 95 ? "Critique" : "Haute",
      status: "En attente",
      date: formatDateTime(c.endDate),
    });
  }

  for (const inj of input.injuries) {
    items.push({
      id: `injury-${inj.id}`,
      sourceId: inj.id,
      sourceKind: "injury",
      type: "Médical",
      title: "Arrêt médical",
      from: "Staff médical",
      detail: `${inj.name} — ${inj.injury}${inj.bodyPart ? ` (${inj.bodyPart})` : ""} — retour ${inj.returnDate ?? "—"}`,
      priority: (inj.riskIA ?? 0) >= 7 ? "Haute" : "Normale",
      status: "En attente",
      date: formatDateTime(inj.createdAt ?? new Date().toISOString()),
    });
  }

  return items.sort((a, b) => {
    const order = { "En attente": 0, Retour: 1, Validé: 2, Refusé: 3 };
    return order[a.status] - order[b.status];
  });
}
