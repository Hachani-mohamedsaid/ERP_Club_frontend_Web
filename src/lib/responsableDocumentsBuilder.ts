type DocCategory = "Contrats PDF" | "Rapports PDF" | "Documents médicaux" | "Licences joueurs";

export interface ResponsableDocument {
  id: string;
  name: string;
  category: DocCategory;
  player?: string;
  size: string;
  date: string;
  status: "Valide" | "Expiré" | "En révision";
}

interface ContractInput {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  consumedPct: number;
}

interface InjuryInput {
  id: string;
  name: string;
  injury: string;
  createdAt?: string;
}

interface AuditInput {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
}

function contractStatus(endDate: string, consumedPct: number): ResponsableDocument["status"] {
  const end = new Date(endDate);
  if (end.getTime() < Date.now()) return "Expiré";
  if (consumedPct >= 90) return "En révision";
  return "Valide";
}

function formatDate(raw: string) {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleDateString("fr-FR");
}

export function buildDocumentsFromClubData(input: {
  contracts: ContractInput[];
  injuries: InjuryInput[];
  auditLogs: AuditInput[];
  players: { id: string; name: string }[];
}): ResponsableDocument[] {
  const docs: ResponsableDocument[] = [];

  for (const c of input.contracts) {
    docs.push({
      id: `contract-${c.id}`,
      name: `Contrat_${c.holderName.replace(/\s+/g, "_")}.pdf`,
      category: "Contrats PDF",
      player: c.holderName,
      size: "280 KB",
      date: formatDate(c.startDate),
      status: contractStatus(c.endDate, c.consumedPct),
    });
  }

  for (const inj of input.injuries) {
    docs.push({
      id: `medical-${inj.id}`,
      name: `Fiche_Medical_${inj.name.replace(/\s+/g, "_")}.pdf`,
      category: "Documents médicaux",
      player: inj.name,
      size: "120 KB",
      date: inj.createdAt ? formatDate(inj.createdAt) : formatDate(new Date().toISOString()),
      status: "Valide",
    });
  }

  for (const log of input.auditLogs.filter((a) => /rapport|scouting|analytique/i.test(a.action))) {
    docs.push({
      id: `report-${log.id}`,
      name: `Rapport_${log.entity.replace(/\s+/g, "_")}.pdf`,
      category: "Rapports PDF",
      size: "950 KB",
      date: formatDate(log.createdAt),
      status: "Valide",
    });
  }

  for (const p of input.players) {
    docs.push({
      id: `licence-${p.id}`,
      name: `Licence_FTF_${p.name.replace(/\s+/g, "_")}.pdf`,
      category: "Licences joueurs",
      player: p.name,
      size: "78 KB",
      date: formatDate(new Date().toISOString()),
      status: "Valide",
    });
  }

  return docs;
}
