import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  FileText,
  History,
  Loader2,
  Calendar,
  HeartPulse,
  SortDesc,
  Download,
  Upload,
  FlaskConical,
  AlertTriangle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi, type PlayerNutritionRecord } from "../../lib/api/club";
import {
  extractMedicalNutrients,
  mentionsToNutritionValues,
  NUTRITION_META,
  MODEL_NUTRITION_KEYS,
} from "../../lib/api/ocrApi";
import type { MedicalNutritionValues } from "../../lib/api/viivAiApi";

const getInitials = (name: string): string =>
  (name ?? "?")
    .split(" ")
    .map((n: string) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

/** Clinical Steel blues — same language as Rééducation */
const C = {
  slate: "#64748b",
  ice: "#38bdf8",
  sky: "#7dd3fc",
  deep: "#0ea5e9",
  white: "#f8fafc",
  muted: "#94a3b8",
  panel: "rgba(100, 116, 139, 0.14)",
  border: "rgba(100, 116, 139, 0.4)",
  /** soft status — same degree as ice */
  red: "#f83a3a",
  green: "#3af899",
  purple: "#993af8",
} as const;

const softBg = (hex: string, alpha = 0.12) => {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  url?: string;
  path?: string;
  fileUrl?: string;
}

type Tab = "Statut actuel" | "Informations" | "Antécédents" | "Blessures" | "Documents";

const TABS: Tab[] = ["Statut actuel", "Informations", "Antécédents", "Blessures", "Documents"];

const TAB_COLORS: Record<Tab, string> = {
  "Statut actuel": C.ice,
  Informations: C.deep,
  Antécédents: C.slate,
  Blessures: C.sky,
  Documents: C.ice,
};

type DocTypeKey = "IRM" | "Scanner" | "Radio" | "Certificat" | "Analyse" | "default";

const DOC_TYPE_STYLES: Record<DocTypeKey, { color: string; bg: string }> = {
  IRM: { color: C.ice, bg: softBg(C.ice) },
  Scanner: { color: C.deep, bg: softBg(C.deep) },
  Radio: { color: C.sky, bg: softBg(C.sky) },
  Certificat: { color: C.slate, bg: softBg(C.slate) },
  Analyse: { color: C.muted, bg: softBg(C.muted) },
  default: { color: C.ice, bg: softBg(C.ice) },
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
  console.log("Document raw data:", raw);
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `doc-${i}`),
      name: String(row.name ?? ""),
      docDate: String(row.docDate ?? "—"),
      url: row.url ? String(row.url) : undefined,
      path: row.path ? String(row.path) : undefined,
      fileUrl: row.fileUrl ? String(row.fileUrl) : undefined,
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

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function apiStatusTopBarColor(status?: string): string {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "DISPONIBLE") return C.green;
  if (upper === "BLESSE") return C.red;
  if (upper === "LIMITE") return C.sky;
  return C.ice;
}

function clearanceBadgeFromApi(status?: string): { label: string; color: string; bg: string } {
  const upper = (status ?? "").trim().toUpperCase();
  if (upper === "DISPONIBLE") {
    return { label: "Apte à jouer", color: C.green, bg: softBg(C.green) };
  }
  if (upper === "BLESSE") {
    return { label: "Inapte — En blessure", color: C.red, bg: softBg(C.red) };
  }
  if (upper === "LIMITE") {
    return { label: "Apte avec restrictions", color: C.sky, bg: softBg(C.sky) };
  }
  return { label: "Statut en attente", color: C.ice, bg: softBg(C.ice) };
}

function gradeFromRiskIA(riskIA: number): string {
  if (riskIA >= 8) return "Grade III";
  if (riskIA >= 5) return "Grade II";
  return "Grade I";
}

function gradeColor(grade: string): string {
  if (grade.includes("III")) return C.red;
  if (grade.includes("II")) return C.ice;
  return C.slate;
}

function gradeBg(grade: string): string {
  if (grade.includes("III")) return softBg(C.red);
  if (grade.includes("II")) return softBg(C.ice);
  return softBg(C.slate);
}

function riskPercentColor(riskPercent: number): string {
  if (riskPercent >= 70) return C.red;
  if (riskPercent >= 50) return C.ice;
  return C.green;
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

function formatDocDate(dateStr: string): string {
  if (!dateStr || dateStr === "—") return "—";
  try {
    let date: Date;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateStr);
    }
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function isNewDoc(dateStr: string): boolean {
  try {
    let date: Date;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateStr);
    }
    const diffDays = Math.ceil((Date.now() - date.getTime()) / 86400000);
    return diffDays <= 7;
  } catch {
    return false;
  }
}

function ApiInformationsPlaceholder({
  apiPlayer,
  playerInjuries,
}: {
  apiPlayer: ApiPlayer;
  playerInjuries: ApiInjury[];
}) {
  const statusLabel = (() => {
    const s = (apiPlayer.status ?? "").toUpperCase();
    if (s === "DISPONIBLE") return "Disponible";
    if (s === "BLESSE") return "Blessé";
    if (s === "LIMITE") return "Limité";
    return "—";
  })();

  const statusColor = (() => {
    const s = (apiPlayer.status ?? "").toUpperCase();
    if (s === "DISPONIBLE") return "var(--color-state-success)";
    if (s === "BLESSE") return "var(--color-state-danger)";
    return "var(--color-state-warning)";
  })();

  const totalRisk =
    playerInjuries.length > 0
      ? Math.round(
          (playerInjuries.reduce((sum, i) => sum + i.riskIA, 0) / playerInjuries.length) * 10,
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{
            borderColor: "var(--surface-panel-border)",
            borderLeft: "3px solid var(--color-state-indigo)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Poste
          </p>
          <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>
            {translatePosition(apiPlayer.position)}
          </p>
        </div>

        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{
            borderColor: "var(--surface-panel-border)",
            borderLeft: `3px solid ${statusColor}`,
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Statut médical
          </p>
          <p className="mt-1 font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </p>
        </div>

        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{
            borderColor: "var(--surface-panel-border)",
            borderLeft: "3px solid var(--color-state-rose)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Blessures actives
          </p>
          <p className="mt-1 font-semibold" style={{ color: "var(--color-state-rose)" }}>
            {playerInjuries.length} blessure(s)
          </p>
        </div>

        <div
          className="rounded-[var(--radius-odin-md)] border p-4"
          style={{
            borderColor: "var(--surface-panel-border)",
            borderLeft: "3px solid var(--color-state-warning)",
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Risque moyen
          </p>
          <p className="mt-1 font-semibold" style={{ color: "var(--color-state-warning)" }}>
            {totalRisk > 0 ? `${totalRisk}%` : "—"}
          </p>
        </div>
      </div>

      <div
        className="rounded-[var(--radius-odin-md)] border p-4"
        style={{ borderColor: "var(--surface-panel-border)" }}
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Disponibilité médicale
        </p>
        <div className="flex flex-col gap-2">
          {[
            {
              label: "Entraînement",
              ok: (apiPlayer.status ?? "").toUpperCase() !== "BLESSE",
            },
            {
              label: "Match",
              ok: (apiPlayer.status ?? "").toUpperCase() === "DISPONIBLE",
            },
            {
              label: "Contact physique",
              ok:
                (apiPlayer.status ?? "").toUpperCase() === "DISPONIBLE" && playerInjuries.length === 0,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                {item.label}
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: item.ok ? "var(--color-state-success-bg)" : "var(--color-state-danger-bg)",
                  color: item.ok ? "var(--color-state-success)" : "var(--color-state-danger)",
                }}
              >
                {item.ok ? "✓ Autorisé" : "✗ Restreint"}
              </span>
            </div>
          ))}
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
          ⚠ Les informations complémentaires (groupe sanguin, allergies, poids, taille) sont gérées par
          l&apos;administrateur du club.
        </p>
      </div>
    </div>
  );
}

function InjurySummaryPills({ injuries }: { injuries: ApiInjury[] }) {
  if (injuries.length === 0) return null;

  const totalDays = injuries.reduce((sum, injury) => sum + injuryRecoveryDays(injury), 0);
  const mostInjured = injuries.reduce(
    (max, injury) => (injury.riskIA > max.riskIA ? injury : max),
    injuries[0],
  );

  return (
    <div className="flex flex-row flex-wrap justify-end gap-2">
      <span
        style={{
          background: softBg(C.ice),
          color: C.ice,
          padding: "4px 10px",
          borderRadius: "99px",
          fontSize: "12px",
        }}
      >
        {injuries.length} blessure{injuries.length > 1 ? "s" : ""}
      </span>
      <span
        style={{
          background: softBg(C.sky),
          color: C.sky,
          padding: "4px 10px",
          borderRadius: "99px",
          fontSize: "12px",
        }}
      >
        {totalDays}j de récupération
      </span>
      <span
        style={{
          background: softBg(C.slate),
          color: C.slate,
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
  injuries,
}: {
  apiPlayer: ApiPlayer;
  injuries: ApiInjury[];
}) {
  const headerColor = apiStatusTopBarColor(apiPlayer.status);
  const clearance = clearanceBadgeFromApi(apiPlayer.status);
  const positionLabel = translatePosition(apiPlayer.position);

  return (
    <GlassCard
      raised
      className="relative overflow-hidden p-6"
      style={{
        borderColor: C.border,
        borderTop: `2px solid ${headerColor}`,
        background: "linear-gradient(180deg, rgba(56,189,248,0.06) 0%, var(--surface-panel-solid) 40%)",
      }}
    >
      <div className="flex flex-row items-center gap-5">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{
            background: softBg(C.ice, 0.18),
            color: C.ice,
            border: `1px solid ${C.ice}45`,
          }}
        >
          {getInitials(apiPlayer.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold" style={{ color: C.white }}>{apiPlayer.fullName}</h2>
          <p className="text-sm" style={{ color: C.slate }}>
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
        <InjuryCard key={inj.id} inj={inj} borderColor={C.sky} showRecovery />
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
        <InjuryCard key={inj.id} inj={inj} borderColor={C.ice} />
      ))}
    </div>
  );
}

function TabContent({
  apiPlayer,
  tab,
  injuries,
}: {
  apiPlayer: ApiPlayer;
  tab: Tab;
  injuries: ApiInjury[];
  documents?: ApiPlayerDocument[];
}) {
  if (tab === "Statut actuel") {
    return <StatutActuelTabContent injuries={injuries} />;
  }

  if (tab === "Blessures") {
    return <BlessuresTabContent injuries={injuries} />;
  }

  if (tab === "Informations") {
    return <ApiInformationsPlaceholder apiPlayer={apiPlayer} playerInjuries={injuries} />;
  }

  if (tab === "Antécédents") {
    if (injuries.length === 0) {
      return (
        <div
          className="py-8 text-center"
          style={{
            border: "1px dashed var(--surface-panel-border)",
            borderRadius: "var(--radius-odin-md)",
          }}
        >
          <History
            size={28}
            style={{
              color: "var(--text-muted)",
              margin: "0 auto 8px",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Aucun antécédent enregistré
          </p>
          <p
            className="mt-1 text-xs"
            style={{
              color: "var(--text-muted)",
              opacity: 0.7,
            }}
          >
            L&apos;historique médical apparaîtra après enregistrement des blessures
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {injuries.length} blessure(s) enregistrée(s)
        </p>
        {injuries.map((inj) => {
          const grade = gradeFromRiskIA(inj.riskIA);
          const gradeAccent = gradeColor(grade);
          const riskPercent = Math.min(100, Math.max(0, inj.riskIA * 10));
          return (
            <div
              key={inj.id}
              className="rounded-[var(--radius-odin-md)] border p-4"
              style={{
                borderColor: "var(--surface-panel-border)",
                borderLeft: "3px solid var(--color-state-purple)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <History
                    size={15}
                    style={{
                      color: "var(--color-state-purple)",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {inj.injuryType}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {translateBodyPart(inj.bodyPart)}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      Retour prévu: {inj.returnDate}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: gradeBg(grade),
                      color: gradeAccent,
                    }}
                  >
                    {grade}
                  </span>
                  <span className="text-xs font-bold" style={{ color: riskPercentColor(riskPercent) }}>
                    {riskPercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
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
  const [nutrition, setNutrition] = useState<PlayerNutritionRecord | null>(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [nutritionMsg, setNutritionMsg] = useState<{ kind: "error" | "info"; text: string } | null>(null);
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [nutritionDraft, setNutritionDraft] = useState<Record<string, string>>({});
  const [savingNutrition, setSavingNutrition] = useState(false);

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

  // Charge le bilan nutritionnel persistant du joueur sélectionné (valeurs OCR).
  useEffect(() => {
    setNutritionMsg(null);
    setEditingNutrition(false);
    setNutritionDraft({});
    if (!selectedId) {
      setNutrition(null);
      return;
    }

    let cancelled = false;

    clubApi
      .getPlayerNutrition(selectedId)
      .then((rec) => {
        if (!cancelled) setNutrition(rec);
      })
      .catch(() => {
        if (!cancelled) setNutrition(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedPlayer = apiPlayers.find((p) => p.id === selectedId) ?? null;
  const filtered = apiPlayers.filter((p) =>
    p.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  const playerInjuries = useMemo(() => {
    if (!selectedPlayer) return [];
    const key = normalizeName(selectedPlayer.fullName);
    return injuries.filter((injury) => normalizeName(injury.name) === key);
  }, [injuries, selectedPlayer]);

  // Nutriments hors-normes (low/high) pour la coloration de l'affichage.
  const nutritionStatus = useMemo(() => {
    const map: Record<string, "low" | "high"> = {};
    for (const m of nutrition?.flagged ?? []) {
      if (m.status === "low" || m.status === "high") map[m.nutrient] = m.status;
    }
    return map;
  }, [nutrition]);

  // Valeurs modèle présentes, dans un ordre stable.
  const nutritionEntries = useMemo(() => {
    const values: MedicalNutritionValues = nutrition?.values ?? {};
    return MODEL_NUTRITION_KEYS.filter(
      (k) => typeof values[k] === "number" && Number.isFinite(values[k] as number),
    ).map((k) => ({ key: k, value: values[k] as number, meta: NUTRITION_META[k] }));
  }, [nutrition]);

  async function handleNutritionUpload(file: File) {
    if (!selectedPlayer) return;
    setOcrBusy(true);
    setNutritionMsg(null);
    try {
      const extraction = await extractMedicalNutrients(file);
      const values = mentionsToNutritionValues(extraction.mentions);
      if (Object.keys(values).length === 0) {
        setNutritionMsg({
          kind: "error",
          text: "Aucune valeur nutritionnelle exploitable détectée dans ce rapport.",
        });
        return;
      }
      const saved = await clubApi.savePlayerNutrition(selectedPlayer.id, {
        values,
        mentions: extraction.mentions,
        flagged: extraction.flagged,
        source: file.name,
      });
      setNutrition(saved);
      const n = Object.keys(values).length;
      setNutritionMsg({
        kind: "info",
        text: `${n} valeur${n > 1 ? "s" : ""} extraite${n > 1 ? "s" : ""} — transmise${n > 1 ? "s" : ""} aux modèles Analyste.`,
      });
    } catch (e) {
      setNutritionMsg({
        kind: "error",
        text: e instanceof Error ? e.message : "Échec de l'extraction OCR.",
      });
    } finally {
      setOcrBusy(false);
    }
  }

  // Ouvre le formulaire d'édition pré-rempli avec les valeurs actuelles (toutes les
  // clés modèle, y compris manquantes, pour permettre l'ajout d'un nutriment oublié).
  function startEditNutrition() {
    const values: MedicalNutritionValues = nutrition?.values ?? {};
    const next: Record<string, string> = {};
    for (const key of MODEL_NUTRITION_KEYS) {
      const v = values[key];
      next[key] = typeof v === "number" && Number.isFinite(v) ? String(v) : "";
    }
    setNutritionDraft(next);
    setNutritionMsg(null);
    setEditingNutrition(true);
  }

  function cancelEditNutrition() {
    setEditingNutrition(false);
    setNutritionDraft({});
  }

  // Enregistre les valeurs corrigées / ajoutées manuellement via le même endpoint PUT.
  async function handleSaveNutrition() {
    if (!selectedPlayer) return;
    const values: MedicalNutritionValues = {};
    for (const key of MODEL_NUTRITION_KEYS) {
      const raw = (nutritionDraft[key] ?? "").trim();
      if (!raw) continue;
      const num = Number(raw);
      if (Number.isFinite(num) && num >= 0) values[key] = num;
    }
    // La coloration bas/élevé provient de l'OCR : on ne conserve un statut que pour
    // les valeurs inchangées (aucune plage de référence côté client pour recalculer).
    const originalValues: MedicalNutritionValues = nutrition?.values ?? {};
    const keptFlagged = (nutrition?.flagged ?? []).filter((m) => {
      const k = m.nutrient as keyof MedicalNutritionValues;
      return typeof values[k] === "number" && values[k] === originalValues[k];
    });
    const baseSource = nutrition?.source ?? null;
    const source = baseSource
      ? baseSource.includes("corrigé")
        ? baseSource
        : `${baseSource} · corrigé`
      : "Saisie manuelle";

    setSavingNutrition(true);
    setNutritionMsg(null);
    try {
      const saved = await clubApi.savePlayerNutrition(selectedPlayer.id, {
        values,
        mentions: nutrition?.mentions ?? [],
        flagged: keptFlagged,
        source,
      });
      setNutrition(saved);
      setEditingNutrition(false);
      const n = Object.keys(values).length;
      setNutritionMsg({
        kind: "info",
        text:
          n > 0
            ? `${n} valeur${n > 1 ? "s" : ""} enregistrée${n > 1 ? "s" : ""} — transmise${n > 1 ? "s" : ""} aux modèles Analyste.`
            : "Bilan nutritionnel vidé.",
      });
    } catch (e) {
      setNutritionMsg({
        kind: "error",
        text: e instanceof Error ? e.message : "Échec de l'enregistrement.",
      });
    } finally {
      setSavingNutrition(false);
    }
  }

  const sortedDocuments = useMemo(() => {
    return [...playerDocuments].sort((a, b) => {
      const parseDate = (d: string) => {
        if (!d || d === "—") return 0;
        if (d.includes("/")) {
          const [day, month, year] = d.split("/");
          return new Date(`${year}-${month}-${day}`).getTime();
        }
        return new Date(d).getTime();
      };
      return parseDate(b.docDate) - parseDate(a.docDate);
    });
  }, [playerDocuments]);

  const handleDownload = async (doc: ApiPlayerDocument) => {
    try {
      const token = localStorage.getItem("odin_token");
      const baseUrl =
        import.meta.env.VITE_API_URL ?? "https://erp-club-backend.onrender.com";

      const res = await fetch(`${baseUrl}/club/documents/${doc.id}/file`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Download failed:", err);
      alert(
        "Impossible de télécharger ce document. Veuillez réessayer.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: C.ice }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: C.red }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: C.white }}>
          Dossiers médicaux
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.slate }}>
          Fiches cliniques joueurs · {apiPlayers.length} dossier{apiPlayers.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <GlassCard
            className="p-4"
            style={{
              borderColor: C.border,
              borderTop: `2px solid ${C.ice}`,
              background: "linear-gradient(180deg, rgba(56,189,248,0.05) 0%, var(--surface-panel-solid) 28%)",
            }}
          >
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass-input w-full py-2 pl-9 pr-3 text-sm"
                style={{ borderColor: C.border }}
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
                      background: active ? softBg(C.ice, 0.16) : "transparent",
                      borderLeft: active ? `3px solid ${C.ice}` : "3px solid transparent",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                      style={{
                        background: softBg(C.ice, 0.18),
                        color: C.ice,
                        border: `1px solid ${C.ice}40`,
                      }}
                    >
                      {getInitials(p.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: C.white }}>{p.fullName}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{p.position}</p>
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
                  injuries={playerInjuries}
                />
              </motion.div>

              <GlassCard
                raised
                className="p-4"
                style={{
                  borderColor: C.border,
                  borderTop: `2px solid ${C.ice}`,
                  background: "linear-gradient(180deg, rgba(56,189,248,0.05) 0%, var(--surface-panel-solid) 32%)",
                }}
              >
                <div className="mb-4 flex flex-wrap gap-1 border-b pb-0" style={{ borderColor: C.border }}>
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
                          background: active ? softBg(tabColor, 0.2) : "transparent",
                          color: active ? tabColor : C.muted,
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "none",
                          borderBottom: active ? `2px solid ${tabColor}` : "2px solid transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: tabColor,
                            flexShrink: 0,
                          }}
                        />
                        {t}
                      </button>
                    );
                  })}
                </div>
                {tab === "Documents" ? (
                  <div className="space-y-4">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        Documents médicaux
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-state-teal)",
                          background: "var(--color-state-teal-bg)",
                          padding: "2px 8px",
                          borderRadius: 99,
                        }}
                      >
                        {sortedDocuments.length} fichier(s)
                      </span>
                    </div>

                    {sortedDocuments.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "48px 0",
                          border: "1px dashed var(--surface-panel-border)",
                          borderRadius: "var(--radius-odin-md)",
                        }}
                      >
                        <FileText
                          size={32}
                          style={{
                            color: "var(--text-muted)",
                            margin: "0 auto 10px",
                          }}
                        />
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                          }}
                        >
                          Aucun document médical
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            marginTop: 4,
                            color: "var(--text-muted)",
                            opacity: 0.7,
                          }}
                        >
                          Les documents apparaissent après upload
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {sortedDocuments.map((doc, i) => {
                          const docType = detectDocType(doc.name);
                          const docStyle = DOC_TYPE_STYLES[docType];
                          const isNew = isNewDoc(doc.docDate);
                          const isNewest = i === 0;

                          return (
                            <div
                              key={doc.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 16px",
                                borderRadius: "var(--radius-odin-md)",
                                border: `1px solid ${
                                  isNewest
                                    ? `${docStyle.color}40`
                                    : "var(--surface-panel-border)"
                                }`,
                                borderLeft: `3px solid ${docStyle.color}`,
                                background: isNewest ? `${docStyle.color}06` : "transparent",
                                position: "relative",
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 10,
                                  flexShrink: 0,
                                  background: docStyle.bg,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FileText size={16} style={{ color: docStyle.color }} />
                              </div>

                              <div
                                style={{
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    marginBottom: 3,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "var(--text-primary)",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {doc.name}
                                  </p>
                                  {isNew ? (
                                    <span
                                      style={{
                                        fontSize: 9,
                                        fontWeight: 800,
                                        color: "white",
                                        background: "var(--color-state-success)",
                                        padding: "1px 5px",
                                        borderRadius: 99,
                                        flexShrink: 0,
                                      }}
                                    >
                                      NOUVEAU
                                    </span>
                                  ) : null}
                                </div>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {formatDocDate(doc.docDate)}
                                </p>
                              </div>

                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  flexShrink: 0,
                                  padding: "3px 8px",
                                  borderRadius: 99,
                                  background: docStyle.bg,
                                  color: docStyle.color,
                                }}
                              >
                                {docType === "default" ? "Document" : docType}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleDownload(doc)}
                                title={`Télécharger ${doc.name}`}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 8,
                                  flexShrink: 0,
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.10)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.background =
                                    "var(--color-state-teal-bg)";
                                  (e.currentTarget as HTMLElement).style.borderColor =
                                    "var(--color-state-teal)";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.background =
                                    "rgba(255,255,255,0.05)";
                                  (e.currentTarget as HTMLElement).style.borderColor =
                                    "rgba(255,255,255,0.10)";
                                }}
                              >
                                <Download
                                  size={13}
                                  style={{ color: "var(--color-state-teal)" }}
                                />
                              </button>

                              {isNewest ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: "var(--color-state-success)",
                                    boxShadow: "0 0 6px var(--color-state-success)",
                                  }}
                                />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {sortedDocuments.length > 1 ? (
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          textAlign: "right",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 4,
                        }}
                      >
                        <SortDesc size={10} />
                        Triés du plus récent au plus ancien
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <TabContent
                    apiPlayer={selectedPlayer}
                    tab={tab}
                    injuries={playerInjuries}
                  />
                )}
              </GlassCard>
            </>
          ) : null}
        </div>

        <div className="xl:col-span-3 space-y-4">
          {selectedPlayer ? (
            <>
            <GlassCard
              raised
              className="p-4"
              style={{
                borderColor: C.border,
                borderTop: `2px solid ${C.ice}`,
                background: "linear-gradient(180deg, rgba(56,189,248,0.05) 0%, var(--surface-panel-solid) 40%)",
              }}
            >
              <h3 className="mb-3 text-sm font-semibold" style={{ color: C.white }}>
                Actions rapides
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/medical/rendez-vous")}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-4 py-3 text-left transition-colors"
                  style={{
                    border: `1px solid ${C.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: C.ice,
                    background: softBg(C.ice, 0.1),
                  }}
                >
                  <Calendar size={16} style={{ color: C.ice }} />
                  <span className="text-sm font-medium" style={{ color: C.white }}>
                    Planifier un rendez-vous
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/medical/blessures")}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-4 py-3 text-left transition-colors"
                  style={{
                    border: `1px solid ${C.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: C.sky,
                    background: softBg(C.sky, 0.1),
                  }}
                >
                  <HeartPulse size={16} style={{ color: C.sky }} />
                  <span className="text-sm font-medium" style={{ color: C.white }}>
                    Voir les blessures
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Export PDF disponible dans la version complète.")}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-4 py-3 text-left transition-colors"
                  style={{
                    border: `1px solid ${C.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: C.slate,
                    background: softBg(C.slate, 0.12),
                  }}
                >
                  <FileText size={16} style={{ color: C.slate }} />
                  <span className="text-sm font-medium" style={{ color: C.white }}>
                    Exporter le dossier (PDF)
                  </span>
                </button>
              </div>
            </GlassCard>

            <GlassCard
              raised
              className="p-4"
              style={{
                borderColor: C.border,
                borderTop: `2px solid ${C.purple}`,
                background: "linear-gradient(180deg, rgba(153,58,248,0.05) 0%, var(--surface-panel-solid) 40%)",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <FlaskConical size={16} style={{ color: C.purple }} />
                <h3 className="text-sm font-semibold" style={{ color: C.white }}>
                  Bilan nutritionnel (OCR)
                </h3>
              </div>
              <p className="mb-3 text-[11px] leading-snug" style={{ color: C.muted }}>
                Importez un rapport biologique. Les valeurs extraites alimentent les
                modèles de prédiction de blessure (section Analyste).
              </p>

              {!editingNutrition ? (
                <>
                  <label
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      border: `1px solid ${C.border}`,
                      borderLeftWidth: 3,
                      borderLeftColor: C.purple,
                      background: softBg(C.purple, 0.12),
                      color: C.white,
                      opacity: ocrBusy ? 0.6 : 1,
                      pointerEvents: ocrBusy ? "none" : "auto",
                    }}
                  >
                    {ocrBusy ? (
                      <Loader2 size={16} className="animate-spin" style={{ color: C.purple }} />
                    ) : (
                      <Upload size={16} style={{ color: C.purple }} />
                    )}
                    <span>{ocrBusy ? "Analyse OCR…" : "Importer un rapport"}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,image/*,application/pdf"
                      className="hidden"
                      disabled={ocrBusy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (file) void handleNutritionUpload(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={startEditNutrition}
                    disabled={ocrBusy}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-2 text-[13px] font-medium transition-colors"
                    style={{
                      border: `1px solid ${C.border}`,
                      background: softBg(C.slate, 0.1),
                      color: C.sky,
                      opacity: ocrBusy ? 0.5 : 1,
                    }}
                  >
                    <Pencil size={14} />
                    <span>
                      {nutritionEntries.length > 0 ? "Corriger / compléter" : "Saisir manuellement"}
                    </span>
                  </button>
                </>
              ) : null}

              {nutritionMsg ? (
                <div
                  className="mt-3 flex items-start gap-2 rounded-[var(--radius-odin-md)] px-3 py-2 text-[11px]"
                  style={{
                    border: `1px solid ${nutritionMsg.kind === "error" ? C.red : C.green}`,
                    background: softBg(nutritionMsg.kind === "error" ? C.red : C.green, 0.1),
                    color: nutritionMsg.kind === "error" ? C.red : C.green,
                  }}
                >
                  {nutritionMsg.kind === "error" ? (
                    <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  ) : null}
                  <span>{nutritionMsg.text}</span>
                </div>
              ) : null}

              {editingNutrition ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] leading-snug" style={{ color: C.muted }}>
                    Corrigez une valeur mal extraite ou renseignez un nutriment manquant.
                    Laissez un champ vide pour retirer la valeur.
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {MODEL_NUTRITION_KEYS.map((key) => {
                      const meta = NUTRITION_META[key];
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 rounded-[var(--radius-odin-sm)] px-2.5 py-1.5"
                          style={{ background: softBg(C.slate, 0.08), border: `1px solid ${C.border}` }}
                        >
                          <span className="flex-1 text-[12px]" style={{ color: C.sky }}>
                            {meta.label}
                          </span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            inputMode="decimal"
                            value={nutritionDraft[key] ?? ""}
                            placeholder="—"
                            onChange={(e) =>
                              setNutritionDraft((d) => ({ ...d, [key]: e.target.value }))
                            }
                            className="w-16 rounded-[var(--radius-odin-sm)] px-2 py-1 text-right text-[12px] font-semibold outline-none"
                            style={{
                              background: "var(--surface-panel-solid)",
                              border: `1px solid ${C.border}`,
                              color: C.white,
                            }}
                          />
                          <span className="w-10 text-[10px]" style={{ color: C.muted }}>
                            {meta.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => void handleSaveNutrition()}
                      disabled={savingNutrition}
                      className="flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-2 text-[13px] font-semibold transition-colors"
                      style={{
                        border: `1px solid ${C.green}`,
                        background: softBg(C.green, 0.14),
                        color: C.green,
                        opacity: savingNutrition ? 0.6 : 1,
                      }}
                    >
                      {savingNutrition ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      <span>Enregistrer</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditNutrition}
                      disabled={savingNutrition}
                      className="flex items-center justify-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-2 text-[13px] font-medium transition-colors"
                      style={{
                        border: `1px solid ${C.border}`,
                        background: softBg(C.slate, 0.1),
                        color: C.muted,
                        opacity: savingNutrition ? 0.6 : 1,
                      }}
                    >
                      <X size={14} />
                      <span>Annuler</span>
                    </button>
                  </div>
                </div>
              ) : nutritionEntries.length > 0 ? (
                <div className="mt-3">
                  <div className="grid grid-cols-1 gap-1.5">
                    {nutritionEntries.map(({ key, value, meta }) => {
                      const status = nutritionStatus[key];
                      const color = status === "low" || status === "high" ? C.red : C.green;
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-[var(--radius-odin-sm)] px-2.5 py-1.5"
                          style={{ background: softBg(C.slate, 0.1), border: `1px solid ${C.border}` }}
                        >
                          <span className="text-[12px]" style={{ color: C.sky }}>
                            {meta.label}
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color }}>
                            {value}
                            <span className="text-[10px] font-normal" style={{ color: C.muted }}>
                              {meta.unit}
                            </span>
                            {status ? (
                              <span
                                className="rounded px-1 text-[9px] font-bold uppercase"
                                style={{ background: softBg(C.red, 0.18), color: C.red }}
                              >
                                {status === "low" ? "bas" : "élevé"}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {nutrition?.source ? (
                    <p className="mt-2 truncate text-[10px]" style={{ color: C.muted }}>
                      Source : {nutrition.source}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className="mt-3 text-[11px]" style={{ color: C.muted }}>
                  Aucun bilan importé pour ce joueur.
                </p>
              )}
            </GlassCard>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
