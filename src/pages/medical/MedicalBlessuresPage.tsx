import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Activity,
  ClipboardList,
  ShieldCheck,
  X,
  Search,
  Check,
  User,
  Loader2,
  Save,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { Button } from "../../components/ui/Button";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";
import { parseApiError } from "../../lib/api/config";
import {
  BODY_PART_OPTIONS,
  INJURY_TYPE_OPTIONS,
  buildPreviewBodyZones,
  getBodyPartLabel,
} from "../../lib/injuryNormalize";
import { type Injury, type InjuryStatus } from "../../data/medicalMockData";

const RESOLVED_KEY = "odin_resolved_injuries";

const getResolvedIds = (): string[] => {
  try {
    const saved = localStorage.getItem(RESOLVED_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
};

const markAsResolved = (injuryId: string) => {
  const current = getResolvedIds();
  if (!current.includes(injuryId)) {
    const updated = [...current, injuryId];
    try {
      localStorage.setItem(RESOLVED_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }
};

const calcInjuryStatus = (
  inj: any,
  players: any[]
): "Active" | "En rééducation" | "Terminée" => {
  // 1. Check resolved localStorage
  const resolvedIds = (() => {
    try {
      const v = localStorage.getItem("odin_resolved_injuries");
      return v ? JSON.parse(v) : [];
    } catch {
      return [];
    }
  })();

  if (resolvedIds.includes(inj.id)) {
    return "Terminée";
  }

  // 2. Check reeducation phases localStorage
  const phases = (() => {
    try {
      const v = localStorage.getItem("odin_reeducation_phases");
      return v ? JSON.parse(v) : {};
    } catch {
      return {};
    }
  })();

  const phase = phases[inj.id];
  if (phase === 3) return "Terminée";
  if (phase === 2) return "En rééducation";
  if (phase === 1) return "En rééducation";

  // 3. Check player status in DB
  const player = players.find(
    (p: any) =>
      (p.fullName ?? p.name ?? "").toLowerCase().trim() ===
      (inj.name ?? "").toLowerCase().trim()
  );

  if ((player?.status ?? "").toUpperCase() === "DISPONIBLE") {
    return "Terminée";
  }

  // 4. Parse returnDate
  const parseDate = (d: string): Date | null => {
    if (!d || d === "—") return null;
    if (d.includes("/")) {
      const parts = d.split("/").map(Number);
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const returnDate = parseDate(inj.returnDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 5. returnDate in the FUTURE → Active
  if (returnDate && returnDate >= today) {
    return "Active";
  }

  // 6. returnDate OVERDUE + player still BLESSE → En rééducation
  if (returnDate && returnDate < today) {
    return "En rééducation";
  }

  // 7. No returnDate → Active by default
  return "Active";
};

const STATUS_STYLE: Record<
  InjuryStatus,
  { color: string; bg: string; border: string }
> = {
  Active: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.30)",
  },
  "En rééducation": {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.30)",
  },
  Terminée: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.30)",
  },
};

const FALLBACK_STATUS_STYLE = {
  color: "#6b7280",
  bg: "rgba(107,114,128,0.12)",
  border: "rgba(107,114,128,0.30)",
};
const C = {
  ice: "#38bdf8",
  red: "#f83a3a",
  purple: "#993af8",
  green: "#3af899",
  grey: "#8799ab",
  slate: "#64748b",
  white: "#f8fafc",
  muted: "#94a3b8",
  border: "rgba(100, 116, 139, 0.4)",
  iceRgb: "56, 189, 248",
  redRgb: "248, 58, 58",
  purpleRgb: "153, 58, 248",
  greenRgb: "58, 248, 153",
  greyRgb: "135, 153, 171",
} as const;

type Filter = "Tous" | "Actives" | "En rééducation" | "Terminées";

type DisplayInjury = Injury & {
  bodyPart?: string;
  riskIA: number;
  createdAt?: string;
  computedStatus?: InjuryStatus;
  name?: string;
};

interface ApiPlayer {
  id: string;
  fullName: string;
  status?: string;
}

const FILTERS: Filter[] = ["Tous", "Actives", "En rééducation", "Terminées"];

const TH_STYLE: CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const TD_STYLE: CSSProperties = { padding: "12px 14px" };

const MODAL_OVERLAY_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const MODAL_CARD_STYLE: CSSProperties = {
  background: "linear-gradient(145deg, rgba(26,26,46,0.98) 0%, rgba(15,15,30,0.99) 100%)",
  border: `1px solid rgba(${C.iceRgb},0.35)`,
  borderRadius: "20px",
  padding: "28px",
  width: "100%",
  maxWidth: "480px",
  maxHeight: "90vh",
  boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(${C.iceRgb},0.12)`,
  position: "relative",
  overflow: "hidden",
};

const FORM_LABEL_STYLE: CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
};

function ModalCardDecorations() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -60,
          left: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `rgba(${C.iceRgb},0.1)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: `rgba(${C.purpleRgb},0.08)`,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClose}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <X size={18} style={{ color: "var(--text-secondary)" }} />
    </button>
  );
}

const AVATAR_COLORS = [
  { bg: `rgba(${C.iceRgb},0.22)`, color: C.ice },
  { bg: "rgba(125, 211, 252, 0.2)", color: "#7dd3fc" },
  { bg: `rgba(${C.iceRgb},0.14)`, color: "#0ea5e9" },
  { bg: "rgba(100, 116, 139, 0.25)", color: C.slate },
  { bg: `rgba(${C.greyRgb},0.22)`, color: C.grey },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const EDIT_BODY_PART_OPTIONS = [
  "genou-droit",
  "genou-gauche",
  "cheville-droite",
  "cheville-gauche",
  "cuisse-droite",
  "cuisse-gauche",
  "epaule-droite",
  "epaule-gauche",
  "tete",
  "dos",
  "autre",
] as const;

function translateBodyPart(bp: string | null | undefined): string {
  if (!bp) return "—";
  const lower = bp.toLowerCase();
  const map: Record<string, string> = {
    head: "Tête",
    tete: "Tête",
    "shoulder-left": "Épaule gauche",
    "shoulder-right": "Épaule droite",
    "knee-left": "Genou gauche",
    "knee-right": "Genou droit",
    "ankle-left": "Cheville gauche",
    "ankle-right": "Cheville droite",
    "thigh-left": "Cuisse gauche",
    "thigh-right": "Cuisse droite",
    hamstring: "Ischio-jambiers",
    groin: "Aine",
    back: "Dos",
    "calf-left": "Mollet gauche",
    "calf-right": "Mollet droit",
    "arm-left": "Bras gauche",
    "arm-right": "Bras droit",
    chest: "Poitrine",
    abdomen: "Abdomen",
    "genou-droit": "Genou droit",
    "genou-gauche": "Genou gauche",
    "cheville-droite": "Cheville droite",
    "cheville-gauche": "Cheville gauche",
    "cuisse-droite": "Cuisse droite",
    "cuisse-gauche": "Cuisse gauche",
    "epaule-droite": "Épaule droite",
    "epaule-gauche": "Épaule gauche",
    dos: "Dos",
    autre: "Autre",
  };
  if (map[lower]) return map[lower];
  return bp.charAt(0).toUpperCase() + bp.slice(1);
}

function SeverityBadge({ riskIA }: { riskIA: number }) {
  const label = riskIA >= 7 ? "Grade III" : riskIA >= 5 ? "Grade II" : "Grade I";
  const bg = riskIA >= 7 ? C.red : riskIA >= 5 ? C.ice : C.slate;
  return (
    <span
      style={{
        background: bg,
        color: "white",
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

function ComputedStatusBadge({ status }: { status: InjuryStatus }) {
  const statusStyle = STATUS_STYLE[status] ?? FALLBACK_STATUS_STYLE;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: statusStyle.color,
        background: statusStyle.bg,
        border: `1px solid ${statusStyle.border}`,
        padding: "4px 12px",
        borderRadius: 99,
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: statusStyle.color,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function RechuteBadge() {
  return (
    <span
      style={{
        background: `rgba(${C.iceRgb},0.14)`,
        color: C.ice,
        border: `1px solid rgba(${C.iceRgb},0.4)`,
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 99,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 500,
      }}
    >
      <AlertTriangle size={9} />
      Rechute
    </span>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={FORM_LABEL_STYLE}>
        <span
          style={{
            display: "inline-block",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: C.ice,
            marginRight: 6,
            verticalAlign: "middle",
          }}
        />
        {label}
      </label>
      {children}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function normalizePlayers(raw: unknown): ApiPlayer[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `player-${i}`),
      fullName: String(row.fullName ?? row.name ?? ""),
      status: row.status != null ? String(row.status) : undefined,
    };
  });
}

function formatDateFr(value: string | undefined): string {
  if (!value) return "—";
  if (value.includes("/")) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("fr-FR");
}

function parseReturnDate(returnDate: string): Date | null {
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

function calcDaysRemainingSigned(returnDate: string): number | null {
  const target = parseReturnDate(returnDate);
  if (!target) return null;
  return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function riskToSeverity(riskIA: number): Injury["severity"] {
  if (riskIA >= 7) return "Grade III";
  if (riskIA >= 5) return "Grade II";
  return "Grade I";
}

function returnDateToInput(returnDate: string): string {
  const parsed = parseReturnDate(returnDate);
  if (!parsed) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBodyPartForSelect(bodyPart?: string): string {
  if (!bodyPart) return "";
  const lower = bodyPart.toLowerCase().trim();
  const map: Record<string, string> = {
    "knee-right": "genou-droit",
    "knee-left": "genou-gauche",
    "ankle-right": "cheville-droite",
    "ankle-left": "cheville-gauche",
    "thigh-right": "cuisse-droite",
    "thigh-left": "cuisse-gauche",
    "shoulder-right": "epaule-droite",
    "shoulder-left": "epaule-gauche",
    head: "tete",
    back: "dos",
  };
  const mapped = map[lower] ?? lower;
  return EDIT_BODY_PART_OPTIONS.includes(mapped as (typeof EDIT_BODY_PART_OPTIONS)[number]) ? mapped : "autre";
}

function mapApiInjury(row: Record<string, unknown>): DisplayInjury {
  const riskIA = Number(row.riskIA ?? 0);
  const returnDate = formatDateFr(String(row.returnDate ?? ""));
  const createdAt = row.createdAt ? String(row.createdAt) : undefined;
  return {
    id: String(row.id ?? `inj-${Date.now()}`),
    playerId: String(row.playerId ?? row.id ?? ""),
    player: String(row.name ?? ""),
    name: String(row.name ?? ""),
    injury: String(row.injury ?? row.injuryType ?? ""),
    severity: riskToSeverity(riskIA),
    status: "Active",
    startDate: formatDateFr(createdAt),
    returnDate,
    daysRemaining: calcDaysRemainingSigned(returnDate) ?? 0,
    bodyPart: row.bodyPart ? String(row.bodyPart) : undefined,
    riskIA,
    createdAt,
  };
}

function normalizeInjuries(raw: unknown): DisplayInjury[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as Record<string, unknown>;
  const list = Array.isArray(data.injured) ? data.injured : [];
  return list.map((item) => mapApiInjury(item as Record<string, unknown>));
}

function InjuryRow({
  injury,
  rowIndex,
  isSelected,
  showRechute,
  onSelect,
  onEdit,
  onClose,
}: {
  injury: DisplayInjury;
  rowIndex: number;
  isSelected: boolean;
  showRechute: boolean;
  onSelect: (injury: DisplayInjury) => void;
  onEdit: (injury: DisplayInjury) => void;
  onClose: (injury: DisplayInjury) => void;
}) {
  const daysRemaining = calcDaysRemainingSigned(injury.returnDate);
  const createdDate = injury.createdAt
    ? new Date(injury.createdAt).toLocaleDateString("fr-FR")
    : injury.startDate;
  const avatar = getAvatarColor(injury.player);
  const evenBg = `rgba(${C.iceRgb},0.03)`;

  const baseRowStyle: CSSProperties = {
    cursor: "pointer",
    borderBottom: `0.5px solid rgba(${C.iceRgb},0.12)`,
    transition: "background 0.15s, border-left 0.15s",
    borderLeft: isSelected ? `3px solid ${C.ice}` : "3px solid transparent",
    background: isSelected
      ? `rgba(${C.iceRgb},0.12)`
      : rowIndex % 2 === 0
        ? evenBg
        : "transparent",
  };

  return (
    <tr
      onClick={() => onSelect(injury)}
      style={baseRowStyle}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = `rgba(${C.iceRgb},0.08)`;
          e.currentTarget.style.borderLeft = `3px solid ${C.ice}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = rowIndex % 2 === 0 ? evenBg : "transparent";
          e.currentTarget.style.borderLeft = "3px solid transparent";
        }
      }}
    >
      <td style={TD_STYLE}>
        <div className="flex items-center gap-3">
          <div
            className="flex shrink-0 items-center justify-center text-xs font-bold"
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: avatar.bg,
              color: avatar.color,
            }}
          >
            {getInitials(injury.player)}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {injury.player}
            </p>
            {showRechute ? <RechuteBadge /> : null}
          </div>
        </div>
      </td>
      <td style={TD_STYLE}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {injury.injury}
        </p>
      </td>
      <td style={TD_STYLE}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {translateBodyPart(injury.bodyPart)}
        </p>
      </td>
      <td style={TD_STYLE}>
        <SeverityBadge riskIA={injury.riskIA} />
      </td>
      <td style={TD_STYLE}>
        <ComputedStatusBadge
          status={injury.computedStatus ?? injury.status}
        />
      </td>
      <td style={TD_STYLE}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {createdDate}
        </p>
      </td>
      <td style={TD_STYLE}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {injury.returnDate ?? "—"}
        </p>
      </td>
      <td style={TD_STYLE}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color:
              daysRemaining === null
                ? "var(--text-muted)"
                : daysRemaining === 0
                  ? C.ice
                  : daysRemaining < 0
                    ? C.red
                    : C.ice,
          }}
        >
          {daysRemaining === null
            ? "—"
            : daysRemaining === 0
              ? "Aujourd'hui"
              : daysRemaining < 0
                ? "Dépassé"
                : `${daysRemaining}j`}
        </p>
      </td>
      <td style={TD_STYLE}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(injury);
            }}
            className="rounded p-1.5 transition-colors hover:bg-white/5"
          >
            <Pencil size={14} style={{ color: C.ice }} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(injury);
            }}
            className="rounded p-1.5 transition-colors hover:bg-white/5"
          >
            <CheckCircle size={14} style={{ color: C.green }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function InjuryDetailPanel({
  injury,
  showRechute,
  onClose,
  onEdit,
  onCloseCase,
  onMarkResolved,
}: {
  injury: DisplayInjury;
  showRechute: boolean;
  onClose: () => void;
  onEdit: (injury: DisplayInjury) => void;
  onCloseCase: (injury: DisplayInjury) => void;
  onMarkResolved: (injury: DisplayInjury) => void;
}) {
  const navigate = useNavigate();
  const createdFormatted = injury.createdAt
    ? new Date(injury.createdAt).toLocaleDateString("fr-FR")
    : injury.startDate;

  const steps = [
    { label: "Blessure signalée", done: true, date: createdFormatted },
    { label: "Examen clinique", done: false, date: "En attente" },
    { label: "Diagnostic confirmé", done: false, date: "En cours" },
    { label: "Rééducation", done: false, date: "Non démarrée" },
    { label: "Retour terrain", done: false, date: injury.returnDate || "—" },
  ];

  const severityLabel =
    injury.riskIA >= 7 ? "Grade III" : injury.riskIA >= 5 ? "Grade II" : "Grade I";
  const severityToneVal =
    injury.riskIA >= 7 ? "danger" : injury.riskIA >= 5 ? "info" : "neutral";

  const infoRows = [
    { label: "Diagnostic", value: injury.injury },
    { label: "Zone", value: translateBodyPart(injury.bodyPart) },
    { label: "Sévérité", value: severityLabel, badge: severityToneVal as "danger" | "info" | "neutral" },
    { label: "Date", value: createdFormatted },
    { label: "Retour estimé", value: injury.returnDate || "—" },
    { label: "Risque", value: `${injury.riskIA * 10}%` },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 40,
        }}
      />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 400,
          background: "var(--surface-panel, var(--bg-primary))",
          borderLeft: "1px solid var(--surface-panel-border)",
          zIndex: 50,
          overflowY: "auto",
          padding: 24,
        }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex shrink-0 items-center justify-center text-sm font-bold"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(var(--accent-rgb), 0.15)",
                color: "var(--accent)",
              }}
            >
              {getInitials(injury.player)}
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {injury.player}
              </h2>
              <ComputedStatusBadge
                status={injury.computedStatus ?? injury.status}
              />
              {showRechute ? (
                <span
                  className="mt-1 inline-block"
                  style={{
                    fontSize: 10,
                    color: C.ice,
                    background: `rgba(${C.iceRgb},0.14)`,
                    border: `1px solid rgba(${C.iceRgb},0.35)`,
                    padding: "1px 6px",
                    borderRadius: 99,
                    fontWeight: 500,
                  }}
                >
                  ⚠ Rechute
                </span>
              ) : null}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/5">
            <X size={20} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <h3
            className="mb-2 text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Informations de la blessure
          </h3>
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {row.label}
              </span>
              {row.badge ? (
                <AnimatedBadge tone={row.badge}>{row.value}</AnimatedBadge>
              ) : (
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {row.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3
            className="mb-3 text-xs font-medium uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Progression du cas
          </h3>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: step.done
                        ? "var(--color-state-success)"
                        : "var(--surface-panel-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {step.done ? <Check size={10} color="white" /> : null}
                  </div>
                  {i < steps.length - 1 ? (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 24,
                        background: "var(--surface-panel-border)",
                      }}
                    />
                  ) : null}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {step.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onEdit(injury)}
            className="flex w-full items-center gap-2 py-3 pl-3 text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              borderLeft: "3px solid var(--color-state-warning)",
              background: "var(--surface-panel)",
              borderRadius: "var(--radius-odin-md)",
              color: "var(--text-primary)",
            }}
          >
            <Pencil size={15} /> Modifier le cas
          </button>
          <button
            type="button"
            onClick={() => navigate("/medical/dossiers")}
            className="flex w-full items-center gap-2 py-3 pl-3 text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              borderLeft: "3px solid var(--color-state-info)",
              background: "var(--surface-panel)",
              borderRadius: "var(--radius-odin-md)",
              color: "var(--text-primary)",
            }}
          >
            <User size={15} /> Voir dossier joueur
          </button>
          <button
            type="button"
            onClick={() => onCloseCase(injury)}
            className="flex w-full items-center gap-2 py-3 pl-3 text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              borderLeft: "3px solid var(--color-state-success)",
              background: "var(--surface-panel)",
              borderRadius: "var(--radius-odin-md)",
              color: "var(--text-primary)",
            }}
          >
            <CheckCircle size={15} /> Clôturer le cas
          </button>

          {injury.computedStatus !== "Terminée" ? (
            <motion.button
              type="button"
              onClick={() => onMarkResolved(injury)}
              whileHover={{ scale: 1.02 }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                border: "1px solid rgba(34,197,94,0.25)",
                cursor: "pointer",
                marginTop: 8,
                background: "rgba(34,197,94,0.12)",
                color: "#22c55e",
              }}
            >
              ✓ Marquer comme résolu
            </motion.button>
          ) : (
            <div
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
                background: "rgba(34,197,94,0.08)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,0.20)",
                marginTop: 8,
              }}
            >
              ✓ Cas médical résolu
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function CloseConfirmModal({
  injury,
  onConfirm,
  onCancel,
}: {
  injury: DisplayInjury;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      style={MODAL_OVERLAY_STYLE}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        style={{ ...MODAL_CARD_STYLE, maxWidth: 400 }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCardDecorations />
        <div style={{ position: "relative", zIndex: 1 }}>
        <p className="mb-4 text-sm" style={{ color: "var(--text-primary)" }}>
          Confirmer la clôture du cas de <strong>{injury.player}</strong> — {injury.injury} ?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center rounded-[var(--radius-odin-md)] py-2.5 text-sm font-medium"
            style={{ background: "var(--color-state-success)", color: "white" }}
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex flex-1 items-center justify-center rounded-[var(--radius-odin-md)] py-2.5 text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Annuler
          </button>
        </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InjuryEditModal({
  injury,
  onClose,
  onSubmit,
}: {
  injury: DisplayInjury;
  onClose: () => void;
  onSubmit: (values: {
    injuryType: string;
    bodyPart: string;
    returnDate: string;
    riskScore: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    injuryType: injury.injury,
    bodyPart: normalizeBodyPartForSelect(injury.bodyPart),
    returnDate: returnDateToInput(injury.returnDate),
    riskScore: String(injury.riskIA || 5),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.injuryType.trim()) {
      setSubmitError("Le type de blessure est requis.");
      return;
    }
    onSubmit({
      injuryType: form.injuryType.trim(),
      bodyPart: form.bodyPart,
      returnDate: form.returnDate,
      riskScore: form.riskScore,
    });
    onClose();
  }

  const inputClass = "modal-premium-input w-full";

  return (
    <motion.div
      style={MODAL_OVERLAY_STYLE}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={MODAL_CARD_STYLE}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalCardDecorations />
        <div style={{ position: "relative", zIndex: 1, maxHeight: "calc(90vh - 56px)", overflowY: "auto" }}>
        <div
          className="flex items-center justify-between"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Modifier le cas
          </h2>
          <ModalCloseButton onClose={onClose} />
        </div>

        <form onSubmit={handleSubmit}>
          <FormField label="Type de blessure">
            <input
              type="text"
              value={form.injuryType}
              onChange={(e) => setForm((prev) => ({ ...prev, injuryType: e.target.value }))}
              className={inputClass}
            />
          </FormField>

          <FormField label="Partie du corps">
            <select
              value={form.bodyPart}
              onChange={(e) => setForm((prev) => ({ ...prev, bodyPart: e.target.value }))}
              className={inputClass}
            >
              <option value="">Sélectionner…</option>
              {EDIT_BODY_PART_OPTIONS.map((part) => (
                <option key={part} value={part}>
                  {translateBodyPart(part)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Date de retour">
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => setForm((prev) => ({ ...prev, returnDate: e.target.value }))}
              className={inputClass}
            />
          </FormField>

          <FormField label="Score de risque (1-10)">
            <input
              type="number"
              min={1}
              max={10}
              value={form.riskScore}
              onChange={(e) => setForm((prev) => ({ ...prev, riskScore: e.target.value }))}
              className={inputClass}
            />
          </FormField>

          {submitError ? (
            <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{submitError}</p>
          ) : null}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2"
            style={{
              padding: 13,
              background: C.ice,
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              marginTop: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-strong)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(56,189,248,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Enregistrer
          </button>
        </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

const KPI_CARDS = [
  {
    label: "Total cas",
    key: "total" as const,
    borderColor: C.ice,
    iconColor: C.ice,
    iconBg: `rgba(${C.iceRgb},0.12)`,
    cardBg: `rgba(${C.iceRgb},0.06)`,
    valueColor: C.ice,
    Icon: ClipboardList,
    trend: null as "active" | "done" | null,
  },
  {
    label: "Cas actifs",
    key: "active" as const,
    borderColor: C.red,
    iconColor: C.red,
    iconBg: `rgba(${C.redRgb},0.12)`,
    cardBg: `rgba(${C.redRgb},0.06)`,
    valueColor: C.red,
    Icon: AlertCircle,
    trend: "active" as const,
  },
  {
    label: "En rééducation",
    key: "reeducation" as const,
    borderColor: C.purple,
    iconColor: C.purple,
    iconBg: `rgba(${C.purpleRgb},0.12)`,
    cardBg: `rgba(${C.purpleRgb},0.06)`,
    valueColor: C.purple,
    Icon: Activity,
    trend: null as "active" | "done" | null,
  },
  {
    label: "Cas résolus",
    key: "done" as const,
    borderColor: C.green,
    iconColor: C.green,
    iconBg: `rgba(${C.greenRgb},0.12)`,
    cardBg: `rgba(${C.greenRgb},0.06)`,
    valueColor: C.green,
    Icon: CheckCircle,
    trend: "done" as const,
  },
];

function KpiTrend({ trend, count }: { trend: "active" | "done" | null; count: number }) {
  if (trend === "active") {
    return count > 0 ? (
      <span className="text-xs" style={{ color: C.red }}>
        ↑ Nécessite attention
      </span>
    ) : (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        Aucun cas
      </span>
    );
  }
  if (trend === "done") {
    return count > 0 ? (
      <span className="text-xs" style={{ color: C.green }}>
        ✓ Guéris cette saison
      </span>
    ) : (
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        Aucun cas
      </span>
    );
  }
  return null;
}

export function MedicalBlessuresPage() {
  const [injuries, setInjuries] = useState<DisplayInjury[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("Tous");
  const [search, setSearch] = useState("");
  const [resolvedVersion, setResolvedVersion] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    playerName: "",
    injuryType: INJURY_TYPE_OPTIONS[0],
    bodyPart: BODY_PART_OPTIONS[0].id,
    returnDate: "",
    riskScore: "5",
  });
  const [saving, setSaving] = useState(false);
  const [editingInjury, setEditingInjury] = useState<DisplayInjury | null>(null);
  const [selectedInjury, setSelectedInjury] = useState<DisplayInjury | null>(null);
  const [closeConfirmInjury, setCloseConfirmInjury] = useState<DisplayInjury | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const previewZones = useMemo(
    () => buildPreviewBodyZones(modalForm.bodyPart, Number(modalForm.riskScore) || 0),
    [modalForm.bodyPart, modalForm.riskScore],
  );

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const reloadInjuries = useCallback(async () => {
    const res = await apiFetch("/club/injuries");
    if (!res.ok) throw new Error(await parseApiError(res));
    const data = await res.json();
    setInjuries(normalizeInjuries(data));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [injuriesRes, playersRes] = await Promise.all([
        apiFetch("/club/injuries"),
        clubApi.getPlayers(),
      ]);
      if (!injuriesRes.ok) throw new Error(await parseApiError(injuriesRes));
      const injuriesData = await injuriesRes.json();
      setInjuries(normalizeInjuries(injuriesData));
      setPlayers(normalizePlayers(playersRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const playerInjuryCounts = useMemo(() => {
    return injuries.reduce((acc, inj) => {
      acc[inj.player] = (acc[inj.player] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [injuries]);

  const handleUpdateInjury = useCallback(
    (id: string, formData: { injuryType: string; bodyPart: string; returnDate: string; riskScore: string }) => {
      const returnDateFormatted = formData.returnDate ? formatDateFr(formData.returnDate) : "—";
      const riskIA = Number(formData.riskScore) || 1;
      setInjuries((prev) =>
        prev.map((inj) => {
          if (inj.id !== id) return inj;
          const updated: DisplayInjury = {
            ...inj,
            injury: formData.injuryType,
            bodyPart: formData.bodyPart,
            returnDate: returnDateFormatted,
            riskIA,
            severity: riskToSeverity(riskIA),
            daysRemaining: calcDaysRemainingSigned(returnDateFormatted) ?? 0,
          };
          return updated;
        }),
      );
      setSelectedInjury((prev) => {
        if (!prev || prev.id !== id) return prev;
        const returnDateFormatted = formData.returnDate ? formatDateFr(formData.returnDate) : "—";
        const riskIA = Number(formData.riskScore) || 1;
        return {
          ...prev,
          injury: formData.injuryType,
          bodyPart: formData.bodyPart,
          returnDate: returnDateFormatted,
          riskIA,
          severity: riskToSeverity(riskIA),
          daysRemaining: calcDaysRemainingSigned(returnDateFormatted) ?? 0,
        };
      });
      showToast("Cas mis à jour ✓", "success");
    },
    [showToast],
  );

  const handleConfirmClose = useCallback(
    (id: string) => {
      setInjuries((prev) => prev.filter((injury) => injury.id !== id));
      setSelectedInjury((prev) => (prev?.id === id ? null : prev));
      setCloseConfirmInjury(null);
      showToast("Blessure clôturée ✓", "success");
    },
    [showToast],
  );

  const handleCreateInjury = useCallback(
    async (values: {
      playerName: string;
      injuryType: string;
      bodyPart: string;
      returnDate: string;
      riskScore: string;
    }) => {
      const res = await apiFetch("/club/injuries", {
        method: "POST",
        body: JSON.stringify({
          playerName: values.playerName.trim(),
          injuryType: values.injuryType.trim(),
          bodyPart: values.bodyPart.trim(),
          returnDate: values.returnDate || null,
          riskScore: Number(values.riskScore) || 1,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res));
      await reloadInjuries();
      showToast("Cas médical enregistré ✓", "success");
    },
    [reloadInjuries, showToast],
  );

  const enrichedInjuries = useMemo(
    () =>
      injuries.map((inj) => {
        const computedStatus = calcInjuryStatus(inj, players);
        return {
          ...inj,
          computedStatus,
          status: computedStatus,
        };
      }),
    [injuries, players, resolvedVersion],
  );

  const casActifs = enrichedInjuries.filter(
    (i) => i.computedStatus === "Active"
  ).length;

  const enReeducation = enrichedInjuries.filter(
    (i) => i.computedStatus === "En rééducation"
  ).length;

  const casResolus = enrichedInjuries.filter(
    (i) => i.computedStatus === "Terminée"
  ).length;

  const stats = {
    total: enrichedInjuries.length,
    active: casActifs,
    reeducation: enReeducation,
    done: casResolus,
  };

  const filterCounts = useMemo(
    () => ({
      Tous: enrichedInjuries.length,
      Actives: enrichedInjuries.filter((i) => i.computedStatus === "Active").length,
      "En rééducation": enrichedInjuries.filter(
        (i) => i.computedStatus === "En rééducation"
      ).length,
      Terminées: enrichedInjuries.filter((i) => i.computedStatus === "Terminée")
        .length,
    }),
    [enrichedInjuries]
  );

  const filtered = useMemo(() => {
    let result = enrichedInjuries;

    if (filter === "Actives") {
      result = result.filter((i) => i.computedStatus === "Active");
    } else if (filter === "En rééducation") {
      result = result.filter((i) => i.computedStatus === "En rééducation");
    } else if (filter === "Terminées") {
      result = result.filter((i) => i.computedStatus === "Terminée");
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          (i.name ?? i.player ?? "").toLowerCase().includes(q) ||
          (i.injury ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [enrichedInjuries, filter, search]);

  const selectedEnriched = useMemo(() => {
    if (!selectedInjury) return null;
    return enrichedInjuries.find((i) => i.id === selectedInjury.id) ?? selectedInjury;
  }, [selectedInjury, enrichedInjuries]);

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
    <div
      className="medical-blessures space-y-6"
      style={{
        // Scoped clinical tokens — same degree as ice for semantic hues
        ["--accent" as string]: C.ice,
        ["--accent-strong" as string]: "#0ea5e9",
        ["--accent-rgb" as string]: C.iceRgb,
        ["--color-state-danger" as string]: C.red,
        ["--color-state-danger-bg" as string]: `rgba(${C.redRgb},0.12)`,
        ["--color-state-warning" as string]: C.purple,
        ["--color-state-warning-bg" as string]: `rgba(${C.purpleRgb},0.12)`,
        ["--color-state-success" as string]: C.green,
        ["--color-state-success-bg" as string]: `rgba(${C.greenRgb},0.12)`,
        ["--color-state-info" as string]: C.ice,
        ["--color-state-info-bg" as string]: `rgba(${C.iceRgb},0.12)`,
      }}
    >
      <style>{`
        @keyframes medical-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .medical-blessures-input {
          border: 1px solid var(--surface-panel-border);
        }
        .medical-blessures-input:focus {
          border-color: ${C.ice};
          outline: none;
        }
        .medical-blessures-input::placeholder {
          color: var(--text-muted);
        }
        .modal-premium-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .modal-premium-input:focus {
          border-color: ${C.ice};
          box-shadow: 0 0 0 3px rgba(${C.iceRgb},0.18);
        }
        .modal-premium-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
        select.modal-premium-input option {
          background: #1a1a2e;
          color: var(--text-primary);
        }
        .modal-premium-textarea {
          min-height: 90px;
          resize: vertical;
        }
      `}</style>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              padding: "12px 20px",
              borderRadius: "var(--radius-odin-md)",
              background:
                toast.type === "success"
                  ? "var(--color-state-success)"
                  : "var(--color-state-danger)",
              color: "white",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPI_CARDS.map(({ label, key, borderColor, iconColor, iconBg, cardBg, valueColor, Icon, trend }) => (
          <GlassCard
            key={label}
            raised
            className="p-6"
            style={{
              borderLeft: `3px solid ${borderColor}`,
              background: cardBg,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
                <p className="mt-1 text-4xl font-bold" style={{ color: valueColor }}>
                  {stats[key]}
                </p>
                <div className="mt-2">
                  <KpiTrend trend={trend} count={stats[key]} />
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[400px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Rechercher un joueur ou diagnostic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input medical-blessures-input w-full"
              style={{
                paddingLeft: 36,
                paddingRight: search ? 36 : 12,
                border: "1px solid var(--surface-panel-border)",
              }}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-white/10"
              >
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  background: filter === f ? "var(--accent)" : "rgba(var(--accent-rgb), 0.1)",
                  color: filter === f ? "white" : "var(--text-secondary)",
                }}
              >
                {f} ({filterCounts[f]})
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Ajouter un cas médical
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", paddingTop: 64, paddingBottom: 64 }}>
          <ShieldCheck
            size={48}
            style={{
              color: "var(--color-state-success)",
              margin: "0 auto 16px",
              display: "block",
            }}
          />
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {filter === "Terminées"
              ? "Aucun cas résolu"
              : filter === "En rééducation"
                ? "Aucun joueur en rééducation"
                : "Aucun cas médical actif"}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {filter === "Terminées"
              ? "Les cas clôturés apparaîtront ici"
              : filter === "En rééducation"
                ? "Les joueurs dont la date de retour est dépassée apparaîtront ici"
                : "L'effectif est en bonne santé"}
          </p>
        </div>
      ) : (
        <GlassCard
          raised
          className="overflow-hidden"
          style={{ borderColor: C.border, borderTop: `2px solid ${C.ice}` }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: `rgba(${C.iceRgb},0.06)`,
                  borderBottom: `2px solid rgba(${C.iceRgb},0.25)`,
                }}
              >
                <th style={TH_STYLE}>Joueur</th>
                <th style={TH_STYLE}>Diagnostic</th>
                <th style={TH_STYLE}>Zone</th>
                <th style={TH_STYLE}>Sévérité</th>
                <th style={TH_STYLE}>Statut</th>
                <th style={TH_STYLE}>Date</th>
                <th style={TH_STYLE}>Retour estimé</th>
                <th style={TH_STYLE}>Jours restants</th>
                <th style={TH_STYLE}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((injury, index) => (
                <InjuryRow
                  key={injury.id}
                  injury={injury}
                  rowIndex={index}
                  isSelected={selectedInjury?.id === injury.id}
                  showRechute={(playerInjuryCounts[injury.player] ?? 0) > 1}
                  onSelect={setSelectedInjury}
                  onEdit={setEditingInjury}
                  onClose={setCloseConfirmInjury}
                />
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <AnimatePresence>
        {selectedEnriched ? (
          <InjuryDetailPanel
            key={selectedEnriched.id}
            injury={selectedEnriched}
            showRechute={(playerInjuryCounts[selectedEnriched.player] ?? 0) > 1}
            onClose={() => setSelectedInjury(null)}
            onEdit={(inj) => {
              setEditingInjury(inj);
            }}
            onCloseCase={setCloseConfirmInjury}
            onMarkResolved={(inj) => {
              markAsResolved(inj.id);
              setInjuries((prev) =>
                prev.map((i) =>
                  i.id === inj.id
                    ? { ...i, computedStatus: "Terminée", status: "Terminée" }
                    : i,
                ),
              );
              setResolvedVersion((v) => v + 1);
              setSelectedInjury(null);
            }}
          />
        ) : null}
        {showModal ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-[24px] border p-6"
              style={{
                background: "var(--surface-panel-solid)",
                borderColor: "rgba(255,107,87,0.25)",
              }}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
                  Enregistrer une blessure
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-2 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Joueur
                    </label>
                    <select
                      value={modalForm.playerName}
                      onChange={(e) => setModalForm((p) => ({ ...p, playerName: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(30,35,50,0.97)",
                        borderColor: "var(--surface-panel-border)",
                        color: "var(--text-primary)",
                        colorScheme: "dark",
                      }}
                    >
                      <option value="">Sélectionner un joueur…</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.fullName}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Type de blessure
                    </label>
                    <select
                      value={modalForm.injuryType}
                      onChange={(e) => setModalForm((p) => ({ ...p, injuryType: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(30,35,50,0.97)",
                        borderColor: "var(--surface-panel-border)",
                        color: "var(--text-primary)",
                        colorScheme: "dark",
                      }}
                    >
                      {INJURY_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Zone
                    </label>
                    <select
                      value={modalForm.bodyPart}
                      onChange={(e) => setModalForm((p) => ({ ...p, bodyPart: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(30,35,50,0.97)",
                        borderColor: "var(--surface-panel-border)",
                        color: "var(--text-primary)",
                        colorScheme: "dark",
                      }}
                    >
                      {BODY_PART_OPTIONS.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Retour prévu
                    </label>
                    <input
                      type="date"
                      value={modalForm.returnDate}
                      onChange={(e) => setModalForm((p) => ({ ...p, returnDate: e.target.value }))}
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "var(--surface-panel-border)",
                        color: "var(--text-primary)",
                        colorScheme: "dark",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Score risque IA (0-10)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={modalForm.riskScore}
                      onChange={(e) => setModalForm((p) => ({ ...p, riskScore: e.target.value }))}
                      placeholder="5"
                      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderColor: "var(--surface-panel-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="flex flex-col items-center justify-center rounded-2xl border p-3"
                  style={{
                    borderColor: "rgba(255,107,87,0.2)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Aperçu zone — {getBodyPartLabel(modalForm.bodyPart)}
                  </p>
                  <BodyInjuryViewer
                    zones={previewZones}
                    selectedZoneId={modalForm.bodyPart}
                    onZoneClick={(zone) => setModalForm((p) => ({ ...p, bodyPart: zone.id }))}
                  />
                  <p className="mt-1 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Cliquez sur le corps ou choisissez dans la liste Zone
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                disabled={saving}
                onClick={async () => {
                  if (!modalForm.playerName.trim()) {
                    alert("Sélectionnez un joueur.");
                    return;
                  }
                  setSaving(true);
                  try {
                    await handleCreateInjury({
                      playerName: modalForm.playerName,
                      injuryType: modalForm.injuryType,
                      bodyPart: modalForm.bodyPart,
                      returnDate: modalForm.returnDate,
                      riskScore: modalForm.riskScore,
                    });
                    setShowModal(false);
                    setModalForm({
                      playerName: "",
                      injuryType: INJURY_TYPE_OPTIONS[0],
                      bodyPart: BODY_PART_OPTIONS[0].id,
                      returnDate: "",
                      riskScore: "5",
                    });
                  } catch (err) {
                    alert(err instanceof Error ? err.message : "Erreur");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg,#FF6B57,#E65240)",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={14} />
                {saving ? "Enregistrement…" : "Enregistrer"}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : null}
        {editingInjury ? (
          <InjuryEditModal
            key={editingInjury.id}
            injury={editingInjury}
            onClose={() => setEditingInjury(null)}
            onSubmit={(values) => handleUpdateInjury(editingInjury.id, values)}
          />
        ) : null}
        {closeConfirmInjury ? (
          <CloseConfirmModal
            injury={closeConfirmInjury}
            onConfirm={() => handleConfirmClose(closeConfirmInjury.id)}
            onCancel={() => setCloseConfirmInjury(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
