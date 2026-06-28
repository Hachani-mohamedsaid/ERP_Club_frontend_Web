import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Droplets,
  AlertTriangle,
  Scale,
  Ruler,
  FileText,
  Pill,
  History,
  Loader2,
  Activity,
  Calendar,
  HeartPulse,
  Download,
  Stethoscope,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";
import { PLAYERS, getInitials, type AvailabilityStatus, type PlayerMedicalRecord } from "../../data/medicalMockData";

interface ApiPlayer {
  id: string;
  fullName: string;
  position: string;
  status?: string;
}

interface ApiInjury {
  id: string;
  name: string;
  injuryType: string;
  bodyPart: string;
  returnDate: string;
  riskIA: number;
  createdAt?: string;
}

interface ApiPlayerDocument {
  id: string;
  name: string;
  docDate: string;
}

type HistoryEntry = {
  date: string;
  event: string;
  type: "consultation" | "injury" | "exam" | "certificat" | "document";
};

type Tab = "Statut actuel" | "Informations" | "Antécédents" | "Blessures" | "Documents" | "Traitements";

const TABS: Tab[] = ["Statut actuel", "Informations", "Antécédents", "Blessures", "Documents", "Traitements"];

const TAB_COLORS: Record<Tab, string> = {
  "Statut actuel": "var(--color-state-danger)",
  Informations: "var(--color-state-indigo, #4f46e5)",
  Antécédents: "var(--color-state-purple, #7c3aed)",
  Blessures: "var(--color-state-rose, #e11d48)",
  Documents: "var(--color-state-teal, #0d9488)",
  Traitements: "var(--color-state-pink, #db2777)",
};

type DocTypeKey = "IRM" | "Scanner" | "Radio" | "Certificat" | "Analyse" | "default";

const DOC_TYPE_STYLES: Record<DocTypeKey, { color: string; bg: string }> = {
  IRM: { color: "var(--color-state-indigo)", bg: "var(--color-state-indigo-bg)" },
  Scanner: { color: "var(--color-state-cyan)", bg: "var(--color-state-cyan-bg)" },
  Radio: { color: "var(--color-state-violet)", bg: "var(--color-state-violet-bg)" },
  Certificat: { color: "var(--color-state-emerald)", bg: "var(--color-state-emerald-bg)" },
  Analyse: { color: "var(--color-state-teal)", bg: "var(--color-state-teal-bg)" },
  default: { color: "var(--color-state-teal)", bg: "var(--color-state-teal-bg)" },
};

function normalizePlayers(raw: unknown): ApiPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      fullName: String(row.fullName ?? row.name ?? ""),
      position: String(row.position ?? ""),
      status: row.status != null ? String(row.status) : undefined,
    };
  });
}

function normalizeInjuries(raw: unknown): ApiInjury[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as Record<string, unknown>;
  const list = Array.isArray(data.injured) ? data.injured : [];
  return list.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      name: String(row.name ?? ""),
      injuryType: String(row.injury ?? row.injuryType ?? ""),
      bodyPart: String(row.bodyPart ?? "—"),
      returnDate: String(row.returnDate ?? "—"),
      riskIA: Number(row.riskIA ?? 0),
      createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
    };
  });
}

function normalizePlayerDocuments(raw: unknown): ApiPlayerDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `doc-${i}`),
      name: String(row.name ?? ""),
      docDate: String(row.docDate ?? "—"),
    };
  });
}

const translateBodyPart = (bodyPart: string | null): string => {
  if (!bodyPart) return "—";
  const map: Record<string, string> = {
    head: "Tête",
    "shoulder-left": "Épaule gauche",
    "shoulder-right": "Épaule droite",
    "arm-left": "Bras gauche",
    "arm-right": "Bras droit",
    chest: "Poitrine",
    abdomen: "Abdomen",
    groin: "Aine",
    "knee-left": "Genou gauche",
    "knee-right": "Genou droit",
    "ankle-left": "Cheville gauche",
    "ankle-right": "Cheville droite",
    "thigh-left": "Cuisse gauche",
    "thigh-right": "Cuisse droite",
    hamstring: "Ischio-jambiers",
    "calf-left": "Mollet gauche",
    "calf-right": "Mollet droit",
  };
  return map[bodyPart.toLowerCase()] ?? bodyPart;
};

const translatePosition = (pos: string): string => {
  const map: Record<string, string> = {
    ST: "Avant-Centre",
    BU: "Buteur",
    MC: "Milieu Central",
    MD: "Milieu Défensif",
    MO: "Milieu Offensif",
    DC: "Défenseur Central",
    DG: "Défenseur Gauche",
    DD: "Défenseur Droit",
    GB: "Gardien de But",
    ATT: "Attaquant",
    DEF: "Défenseur",
  };
  return map[pos.trim().toUpperCase()] ?? pos;
};

function parseReturnDateValue(returnDate: string): Date | null {
  if (!returnDate || returnDate === "—") return null;
  if (returnDate.includes("/")) {
    const parts = returnDate.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
  }
  const isoMatch = returnDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(returnDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function injuryRecoveryDays(injury: ApiInjury): number {
  const target = parseReturnDateValue(injury.returnDate);
  if (!target) return 0;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatHistoryDate(dateStr: string): string {
  if (!dateStr || dateStr === "—") return "—";
  if (dateStr.includes("/")) return dateStr;
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString("fr-FR");
  return dateStr;
}

function parseHistorySortKey(dateStr: string): number {
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/").map(Number);
    if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
  }
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function buildApiHistory(injuries: ApiInjury[], documents: ApiPlayerDocument[]): HistoryEntry[] {
  const events: HistoryEntry[] = [];

  for (const injury of injuries) {
    events.push({
      date: formatHistoryDate(injury.createdAt ?? injury.returnDate),
      event: `Blessure enregistrée — ${injury.injuryType}`,
      type: "injury",
    });
  }

  for (const doc of documents) {
    events.push({
      date: formatHistoryDate(doc.docDate),
      event: `Document ajouté — ${doc.name}`,
      type: "document",
    });
  }

  return dedupeHistory(events).sort((a, b) => parseHistorySortKey(b.date) - parseHistorySortKey(a.date));
}

function dedupeHistory(entries: HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.date}|${entry.event}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapMockHistoryEntry(
  entry: PlayerMedicalRecord["history"][number],
): HistoryEntry {
  return {
    date: entry.date,
    event: entry.event,
    type: entry.type,
  };
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function findMockRecord(fullName: string): PlayerMedicalRecord | undefined {
  return PLAYERS.find((player) => normalizeName(player.name) === normalizeName(fullName));
}

function apiStatusTopBarColor(status?: string): string {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "DISPONIBLE") return "var(--color-state-success)";
  if (upper === "BLESSE") return "var(--color-state-danger)";
  if (upper === "LIMITE") return "var(--color-state-warning)";
  return "var(--color-state-info)";
}

function clearanceBadgeFromApi(status?: string): { label: string; color: string; bg: string } {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "DISPONIBLE") {
    return {
      label: "Apte à jouer",
      color: "var(--color-state-success)",
      bg: "var(--color-state-success-bg)",
    };
  }
  if (upper === "BLESSE") {
    return {
      label: "Inapte — En blessure",
      color: "var(--color-state-danger)",
      bg: "var(--color-state-danger-bg)",
    };
  }
  if (upper === "LIMITE") {
    return {
      label: "Apte avec restrictions",
      color: "var(--color-state-warning)",
      bg: "var(--color-state-warning-bg)",
    };
  }
  return {
    label: "Statut en attente",
    color: "var(--color-state-info)",
    bg: "var(--color-state-info-bg)",
  };
}

function apiStatusLabel(status?: string): string {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "DISPONIBLE") return "Disponible";
  if (upper === "BLESSE") return "Blessé";
  if (upper === "LIMITE") return "Limité";
  return "—";
}

function historyTypeMeta(type: HistoryEntry["type"]): { color: string; label: string } {
  if (type === "injury") return { color: "var(--color-state-danger)", label: "Blessure" };
  if (type === "exam") return { color: "var(--color-state-info)", label: "Examen médical" };
  if (type === "certificat") return { color: "var(--color-state-success)", label: "Certificat" };
  if (type === "document") return { color: "var(--color-state-teal, #0d9488)", label: "Document" };
  return { color: "var(--color-state-warning)", label: "Consultation" };
}

function clearanceStyle(availability: AvailabilityStatus): { label: string; color: string; bg: string } {
  if (availability === "Disponible") {
    return {
      label: "Apte à jouer",
      color: "var(--color-state-emerald)",
      bg: "var(--color-state-emerald-bg)",
    };
  }
  if (availability === "Partiellement disponible") {
    return {
      label: "Apte avec restrictions",
      color: "var(--color-state-warning)",
      bg: "var(--color-state-warning-bg)",
    };
  }
  return {
    label: "Inapte — En blessure",
    color: "var(--color-state-rose)",
    bg: "var(--color-state-rose-bg)",
  };
}

function gradeFromRiskIA(riskIA: number): string {
  if (riskIA >= 8) return "Grade III";
  if (riskIA >= 5) return "Grade II";
  return "Grade I";
}

function gradeColor(grade: string): string {
  if (grade.includes("III")) return "var(--color-state-rose)";
  if (grade.includes("II")) return "var(--color-state-warning)";
  return "var(--color-state-info)";
}

function gradeBg(grade: string): string {
  if (grade.includes("III")) return "var(--color-state-rose-bg)";
  if (grade.includes("II")) return "var(--color-state-warning-bg)";
  return "var(--color-state-info-bg)";
}

function riskPercentColor(riskPercent: number): string {
  if (riskPercent >= 70) return "var(--color-state-rose)";
  if (riskPercent >= 50) return "var(--color-state-warning)";
  return "var(--color-state-success)";
}

function detectDocType(event: string): DocTypeKey {
  const lower = event.toLowerCase();
  if (lower.includes("irm")) return "IRM";
  if (lower.includes("scanner")) return "Scanner";
  if (lower.includes("radio")) return "Radio";
  if (lower.includes("certificat")) return "Certificat";
  if (lower.includes("analyse") || lower.includes("sang")) return "Analyse";
  return "default";
}

function ApiInformationsPlaceholder({ apiPlayer }: { apiPlayer: ApiPlayer }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{ borderColor: "var(--surface-panel-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Poste</p>
          <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
            {translatePosition(apiPlayer.position)}
          </p>
        </div>
        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{ borderColor: "var(--surface-panel-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Statut médical</p>
          <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
            {apiStatusLabel(apiPlayer.status)}
          </p>
        </div>
      </div>
      <div
        className="rounded-[var(--radius-odin-md)] border p-4"
        style={{
          borderColor: "var(--surface-panel-border)",
          borderLeft: "3px solid var(--color-state-warning)",
        }}
      >
        <p className="text-[13px]" style={{ color: "var(--color-state-warning)" }}>
          ⚠ Dossier médical complet non disponible pour ce joueur. Les informations détaillées (groupe sanguin, allergies, certificats) sont gérées par l&apos;administrateur du club.
        </p>
      </div>
    </div>
  );
}

function HistoryTimeline({
  entries,
  showAll,
  onToggleShowAll,
}: {
  entries: HistoryEntry[];
  showAll: boolean;
  onToggleShowAll: () => void;
}) {
  const visible = showAll ? entries : entries.slice(0, 10);

  if (entries.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun historique disponible.</p>;
  }

  return (
    <>
      <div>
        {visible.map((event, index) => {
          const meta = historyTypeMeta(event.type);
          const isLast = index === visible.length - 1;
          return (
            <div
              key={`${event.date}|${event.event}|${index}`}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                paddingBottom: "12px",
                borderBottom: isLast ? "none" : "0.5px solid var(--surface-panel-border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: meta.color,
                  }}
                />
                {!isLast ? (
                  <div
                    style={{
                      width: "1px",
                      flex: 1,
                      background: "var(--surface-panel-border)",
                      minHeight: "20px",
                    }}
                  />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                    {event.event}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                      marginLeft: "8px",
                    }}
                  >
                    {event.date}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: meta.color,
                    marginTop: "2px",
                    display: "block",
                  }}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {entries.length > 10 ? (
        <button
          type="button"
          onClick={onToggleShowAll}
          className="mt-3 text-xs font-medium"
          style={{ color: "var(--color-state-info)" }}
        >
          {showAll ? "Réduire" : "Voir tout"}
        </button>
      ) : null}
    </>
  );
}

function UnavailablePlaceholder() {
  return (
    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
      Données non disponibles
    </p>
  );
}

function InjurySummaryPills({ injuries }: { injuries: ApiInjury[] }) {
  if (injuries.length === 0) return null;

  const totalDays = injuries.reduce((sum, injury) => sum + injuryRecoveryDays(injury), 0);
  const mostInjured = injuries.reduce((max, injury) =>
    injury.riskIA > max.riskIA ? injury : max,
  injuries[0]);

  return (
    <div className="flex flex-row flex-wrap justify-end gap-2">
      <span
        style={{
          background: "var(--color-state-danger-bg)",
          color: "var(--color-state-danger)",
          padding: "4px 10px",
          borderRadius: "99px",
          fontSize: "12px",
        }}
      >
        {injuries.length} blessure{injuries.length > 1 ? "s" : ""}
      </span>
      <span
        style={{
          background: "var(--color-state-warning-bg)",
          color: "var(--color-state-warning)",
          padding: "4px 10px",
          borderRadius: "99px",
          fontSize: "12px",
        }}
      >
        {totalDays}j de récupération
      </span>
      <span
        style={{
          background: "var(--color-state-purple-bg, rgba(124, 58, 237, 0.12))",
          color: "var(--color-state-purple, #7c3aed)",
          padding: "4px 10px",
          borderRadius: "99px",
          fontSize: "12px",
        }}
      >
        Zone: {translateBodyPart(mostInjured.bodyPart)}
      </span>
    </div>
  );
}

function PlayerCard({
  apiPlayer,
  mockPlayer,
  injuries,
}: {
  apiPlayer: ApiPlayer;
  mockPlayer?: PlayerMedicalRecord;
  injuries: ApiInjury[];
}) {
  const headerColor = apiStatusTopBarColor(apiPlayer.status);
  const clearance = apiPlayer.status
    ? clearanceBadgeFromApi(apiPlayer.status)
    : mockPlayer
    ? clearanceStyle(mockPlayer.availability)
    : clearanceBadgeFromApi(undefined);
  const positionLabel = translatePosition(apiPlayer.position);

  return (
    <GlassCard raised className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: headerColor, height: "4px" }} />
      <div className="flex flex-row items-center gap-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ background: "var(--color-state-indigo-bg)", color: "var(--color-state-indigo)" }}
        >
          {getInitials(apiPlayer.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{apiPlayer.fullName}</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {apiPlayer.position} • {positionLabel}
          </p>
          <div className="mt-2">
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: clearance.bg, color: clearance.color }}
            >
              {clearance.label}
            </span>
          </div>
        </div>
        <InjurySummaryPills injuries={injuries} />
      </div>
    </GlassCard>
  );
}

function VitalStats({ player }: { player: PlayerMedicalRecord }) {
  const bmi = (player.weight / ((player.height / 100) ** 2)).toFixed(1);
  const stats = [
    { icon: Droplets, label: "Groupe sanguin", value: player.bloodGroup, color: "var(--color-state-rose)", bg: "var(--color-state-rose-bg)" },
    { icon: AlertTriangle, label: "Allergies", value: player.allergies.join(", "), color: "var(--color-state-warning)", bg: "var(--color-state-warning-bg)" },
    { icon: Scale, label: "Poids", value: `${player.weight} kg`, color: "var(--color-state-indigo)", bg: "var(--color-state-indigo-bg)" },
    { icon: Ruler, label: "Taille", value: `${(player.height / 100).toFixed(2).replace(".", "m")}`, color: "var(--color-state-teal)", bg: "var(--color-state-teal-bg)" },
    { icon: Activity, label: "IMC", value: bmi, color: "var(--color-state-cyan)", bg: "var(--color-state-cyan-bg)" },
  ];

  return (
    <div className="space-y-3">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <GlassCard key={label} className="p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: bg, color }}
            >
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function QuickActionsSidebar() {
  const actions = [
    { label: "Planifier RDV", icon: Calendar, color: "var(--color-state-cyan)" },
    { label: "Voir blessures", icon: AlertTriangle, color: "var(--color-state-rose)" },
    { label: "Exporter PDF", icon: Download, color: "var(--color-state-emerald)" },
  ];

  return (
    <GlassCard className="mt-4 p-4">
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions rapides</h3>
      <div className="space-y-2">
        {actions.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            type="button"
            className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left text-sm transition-colors"
            style={{ borderLeft: `3px solid ${color}`, color: "var(--text-primary)" }}
          >
            <Icon size={16} style={{ color }} />
            {label}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function InjuryCard({
  inj,
  borderColor,
  showRecovery,
}: {
  inj: ApiInjury;
  borderColor: string;
  showRecovery?: boolean;
}) {
  const grade = gradeFromRiskIA(inj.riskIA);
  const gradeAccent = gradeColor(grade);
  const riskPercent = Math.min(100, Math.max(0, inj.riskIA * 10));
  const recovery = Math.max(5, 100 - riskPercent);

  return (
    <div
      className="rounded-[var(--radius-odin-md)] border p-4"
      style={{ borderColor: "var(--surface-panel-border)", borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>{inj.injuryType}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{translateBodyPart(inj.bodyPart)}</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{inj.returnDate}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: gradeBg(grade), color: gradeAccent }}
          >
            {grade}
          </span>
          <span className="text-xs font-semibold" style={{ color: riskPercentColor(riskPercent) }}>
            {riskPercent}%
          </span>
        </div>
      </div>
      {showRecovery ? (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
            <span>Récupération</span>
            <span style={{ color: gradeAccent }}>{recovery}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
            <div className="h-full rounded-full" style={{ width: `${recovery}%`, background: gradeAccent }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatutActuelTabContent({ injuries }: { injuries: ApiInjury[] }) {
  if (injuries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Aucune blessure active enregistrée.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {injuries.map((inj) => (
        <InjuryCard key={inj.id} inj={inj} borderColor="var(--color-state-rose)" showRecovery />
      ))}
    </div>
  );
}

function BlessuresTabContent({ injuries }: { injuries: ApiInjury[] }) {
  if (injuries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Aucune blessure enregistrée.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {injuries.map((inj) => (
        <InjuryCard key={inj.id} inj={inj} borderColor="var(--color-state-danger)" />
      ))}
    </div>
  );
}

function TabContent({
  player,
  apiPlayer,
  tab,
  injuries,
}: {
  player?: PlayerMedicalRecord;
  apiPlayer: ApiPlayer;
  tab: Tab;
  injuries: ApiInjury[];
}) {
  if (tab === "Statut actuel") {
    return <StatutActuelTabContent injuries={injuries} />;
  }

  if (tab === "Blessures") {
    return <BlessuresTabContent injuries={injuries} />;
  }

  if (tab === "Informations" && !player) {
    return <ApiInformationsPlaceholder apiPlayer={apiPlayer} />;
  }

  if (!player) {
    return <UnavailablePlaceholder />;
  }

  if (tab === "Informations") {
    const bmi = (player.weight / ((player.height / 100) ** 2)).toFixed(1);
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-[var(--radius-odin-md)] border p-4"
            style={{ borderColor: "var(--surface-panel-border)", borderLeft: "3px solid var(--color-state-indigo)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Poste</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{player.position}</p>
          </div>
          <div
            className="rounded-[var(--radius-odin-md)] border p-4"
            style={{ borderColor: "var(--surface-panel-border)", borderLeft: "3px solid var(--color-state-cyan)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>IMC</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{bmi}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Certificats médicaux</h3>
          {player.certificates.map((cert) => (
            <div
              key={cert.name}
              className="mb-2 flex items-center justify-between rounded-[var(--radius-odin-md)] border px-4 py-3"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-center gap-2">
                <FileText size={15} style={{ color: "var(--color-state-indigo)" }} />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{cert.name}</span>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: cert.valid ? "var(--color-state-emerald-bg)" : "var(--color-state-rose-bg)",
                  color: cert.valid ? "var(--color-state-emerald)" : "var(--color-state-rose)",
                }}
              >
                {cert.valid ? "Valide" : "Expiré"}
              </span>
            </div>
          ))}
        </div>
        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{ borderColor: "var(--surface-panel-border)", borderLeft: "3px solid var(--color-state-teal)" }}
        >
          <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--color-state-teal)" }}>Contact d&apos;urgence</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {player.allergies.length > 0 && player.allergies[0] !== "Aucune"
              ? `Allergie signalée : ${player.allergies.join(", ")}`
              : "Aucune allergie signalée — contact club en cas d'urgence"}
          </p>
        </div>
      </div>
    );
  }

  if (tab === "Antécédents") {
    return (
      <div className="space-y-3">
        {player.antecedents.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun antécédent enregistré.</p>
        ) : (
          player.antecedents.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3 transition-colors"
              style={{
                borderColor: "var(--surface-panel-border)",
                borderLeft: "3px solid var(--color-state-purple)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-state-purple-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <History size={15} style={{ color: "var(--color-state-purple)" }} />
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  if (tab === "Documents") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {player.history.filter((h) => h.type === "exam" || h.type === "certificat").map((doc) => {
          const docType = detectDocType(doc.event);
          const style = DOC_TYPE_STYLES[docType];
          return (
            <div
              key={doc.date + doc.event}
              className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border p-4"
              style={{ borderColor: "var(--surface-panel-border)", borderLeft: `3px solid ${style.color}` }}
            >
              <FileText size={18} style={{ color: style.color }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{doc.event}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.date}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: style.bg, color: style.color }}
              >
                {docType === "default" ? "Document" : docType}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {player.treatments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun traitement en cours.</p>
      ) : (
        player.treatments.map((t) => (
          <div
            key={t.name}
            className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3"
            style={{ borderColor: "var(--surface-panel-border)", borderLeft: "3px solid var(--color-state-pink)" }}
          >
            <Pill size={15} style={{ color: "var(--color-state-pink)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.name}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.dosage} — depuis {t.since}</p>
            </div>
          </div>
        ))
      )}
      {player.medications.length > 0 ? (
        <>
          <h3 className="mt-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Médicaments</h3>
          {player.medications.map((med) => (
            <div
              key={med}
              className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3 text-sm"
              style={{ borderColor: "var(--surface-panel-border)", borderLeft: "3px solid var(--color-state-violet)" }}
            >
              <Pill size={15} style={{ color: "var(--color-state-violet)" }} />
              <span style={{ color: "var(--text-secondary)" }}>{med}</span>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

export function MedicalDossiersPage() {
  const navigate = useNavigate();
  const [apiPlayers, setApiPlayers] = useState<ApiPlayer[]>([]);
  const [injuries, setInjuries] = useState<ApiInjury[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Informations");
  const [search, setSearch] = useState("");
  const [playerDocuments, setPlayerDocuments] = useState<ApiPlayerDocument[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [playersRes, injuriesRes] = await Promise.all([
          clubApi.getPlayers(),
          clubApi.getInjuries(),
        ]);
        if (cancelled) return;
        const players = normalizePlayers(playersRes);
        setApiPlayers(players);
        setInjuries(normalizeInjuries(injuriesRes));
        setSelectedId((current) => current ?? players[0]?.id ?? null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setPlayerDocuments([]);
      return;
    }

    let cancelled = false;

    clubApi
      .getDocuments(selectedId)
      .then((data) => {
        if (!cancelled) setPlayerDocuments(normalizePlayerDocuments(data));
      })
      .catch(() => {
        if (!cancelled) setPlayerDocuments([]);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedPlayer = apiPlayers.find((p) => p.id === selectedId) ?? null;
  const mockPlayer = selectedPlayer ? findMockRecord(selectedPlayer.fullName) : undefined;
  const filtered = apiPlayers.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  const playerInjuries = useMemo(() => {
    if (!selectedPlayer) return [];
    const key = normalizeName(selectedPlayer.fullName);
    return injuries.filter((injury) => normalizeName(injury.name) === key);
  }, [injuries, selectedPlayer]);

  useEffect(() => {
    setShowAllHistory(false);
  }, [selectedId]);

  const historyEntries = useMemo((): HistoryEntry[] => {
    const raw = mockPlayer
      ? mockPlayer.history.map(mapMockHistoryEntry)
      : buildApiHistory(playerInjuries, playerDocuments);
    return dedupeHistory(raw).sort((a, b) => parseHistorySortKey(b.date) - parseHistorySortKey(a.date));
  }, [mockPlayer, playerInjuries, playerDocuments]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--color-state-indigo)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <GlassCard className="p-4">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              {filtered.map((p) => {
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: active ? "var(--color-state-indigo-bg)" : "transparent",
                      borderLeft: active ? "3px solid var(--color-state-indigo)" : "3px solid transparent",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{ background: "var(--color-state-indigo-bg)", color: "var(--color-state-indigo)" }}
                    >
                      {getInitials(p.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.fullName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4 xl:col-span-6">
          {selectedPlayer ? (
            <>
              <motion.div key={selectedPlayer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <PlayerCard
                  apiPlayer={selectedPlayer}
                  mockPlayer={mockPlayer}
                  injuries={playerInjuries}
                />
              </motion.div>

              <GlassCard raised className="p-4">
                <div className="mb-4 flex flex-wrap gap-1 border-b pb-0" style={{ borderColor: "var(--surface-panel-border)" }}>
                  {TABS.map((t) => {
                    const tabColor = TAB_COLORS[t];
                    const active = tab === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: active
                            ? "var(--radius-odin-md) var(--radius-odin-md) 0 0"
                            : "var(--radius-odin-md)",
                          background: active ? tabColor : "transparent",
                          color: active ? "white" : "var(--text-muted)",
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "none",
                          borderBottom: active ? `3px solid ${tabColor}` : "3px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: active ? "white" : tabColor,
                            flexShrink: 0,
                          }}
                        />
                        {t}
                      </button>
                    );
                  })}
                </div>
                <TabContent
                  player={mockPlayer}
                  apiPlayer={selectedPlayer}
                  tab={tab}
                  injuries={playerInjuries}
                />
              </GlassCard>

              <GlassCard className="p-4">
                <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique complet</h3>
                <HistoryTimeline
                  entries={historyEntries}
                  showAll={showAllHistory}
                  onToggleShowAll={() => setShowAllHistory((value) => !value)}
                />
              </GlassCard>
            </>
          ) : null}
        </div>

        <div className="xl:col-span-3">
          {selectedPlayer ? (
            <>
              {mockPlayer ? (
                <VitalStats player={mockPlayer} />
              ) : (
                <GlassCard className="p-4">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Informations médicales non disponibles pour ce joueur.
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Les données de base sont gérées par l&apos;administrateur du club.
                  </p>
                </GlassCard>
              )}
              <GlassCard raised className="p-4 mt-4">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                    Actions rapides
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/medical/rendez-vous")}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-odin-md)] transition-colors text-left"
                      style={{
                        borderLeft: "3px solid var(--color-state-cyan, #0891b2)",
                        background: "var(--color-state-info-bg)",
                      }}
                    >
                      <Calendar size={16} style={{ color: "var(--color-state-info)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Planifier un rendez-vous
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/medical/blessures")}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-odin-md)] transition-colors text-left"
                      style={{
                        borderLeft: "3px solid var(--color-state-danger)",
                        background: "var(--color-state-danger-bg)",
                      }}
                    >
                      <HeartPulse size={16} style={{ color: "var(--color-state-danger)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Voir les blessures
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert("Export PDF disponible dans la version complète.")}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-odin-md)] transition-colors text-left"
                      style={{
                        borderLeft: "3px solid var(--color-state-success)",
                        background: "var(--color-state-success-bg)",
                      }}
                    >
                      <FileText size={16} style={{ color: "var(--color-state-success)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Exporter le dossier (PDF)
                      </span>
                    </button>
                  </div>
                </GlassCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
