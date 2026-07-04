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
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { Button } from "../../components/ui/Button";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";
import { parseApiError } from "../../lib/api/config";
import { type Injury, type InjuryStatus } from "../../data/medicalMockData";

type Filter = "Tous" | "Actives" | "En rééducation" | "Terminées";

type DisplayInjury = Injury & { bodyPart?: string; riskIA: number; createdAt?: string };

interface ApiPlayer {
  id: string;
  fullName: string;
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
  border: "1px solid rgba(255,122,0,0.25)",
  borderRadius: "20px",
  padding: "28px",
  width: "100%",
  maxWidth: "480px",
  maxHeight: "90vh",
  boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,122,0,0.1)",
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
          background: "rgba(255,122,0,0.08)",
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
          background: "rgba(79,70,229,0.06)",
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
  { bg: "rgba(124,58,237,0.2)", color: "#7c3aed" },
  { bg: "rgba(13,148,136,0.2)", color: "#0d9488" },
  { bg: "rgba(219,39,119,0.2)", color: "#db2777" },
  { bg: "rgba(245,158,11,0.2)", color: "#d99a1f" },
  { bg: "rgba(58,123,213,0.2)", color: "#3a7bd5" },
];

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

const CONTEXT_OPTIONS = ["Entraînement", "Match", "Autre"] as const;

const ADD_MECHANISM_OPTIONS = [
  "Contact",
  "Non-contact",
  "Sprint",
  "Réception de saut",
  "Surmenage",
  "Changement de direction",
  "Inconnu",
] as const;

const ZONE_SELECT_OPTIONS: { label: string; key: string }[] = [
  { label: "Tête", key: "tete" },
  { label: "Épaule gauche", key: "shoulder-left" },
  { label: "Épaule droite", key: "shoulder-right" },
  { label: "Bras gauche", key: "arm-left" },
  { label: "Bras droit", key: "arm-right" },
  { label: "Poitrine", key: "chest" },
  { label: "Abdomen", key: "abdomen" },
  { label: "Aine", key: "groin" },
  { label: "Genou gauche", key: "knee-left" },
  { label: "Genou droit", key: "knee-right" },
  { label: "Cheville gauche", key: "ankle-left" },
  { label: "Cheville droite", key: "ankle-right" },
  { label: "Cuisse gauche", key: "thigh-left" },
  { label: "Cuisse droite", key: "thigh-right" },
  { label: "Ischio-jambiers", key: "hamstring" },
  { label: "Dos", key: "back" },
  { label: "Autre", key: "autre" },
];

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
  const bg =
    riskIA >= 7
      ? "var(--color-state-danger)"
      : riskIA >= 5
        ? "var(--color-state-warning)"
        : "var(--color-state-info)";
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

function ActiveStatusBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--color-state-danger-bg)",
        color: "var(--color-state-danger)",
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--color-state-danger)",
          animation: "medical-pulse 2s infinite",
        }}
      />
      Active
    </span>
  );
}

function RechuteBadge() {
  return (
    <span
      style={{
        background: "rgba(217,154,31,0.2)",
        color: "var(--color-state-warning)",
        border: "1px solid var(--color-state-warning)",
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
            background: "var(--accent)",
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

function statusTone(status: InjuryStatus) {
  if (status === "Active") return "danger";
  if (status === "En rééducation") return "warning";
  return "success";
}

function todayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const evenBg = "rgba(255,255,255,0.015)";

  const baseRowStyle: CSSProperties = {
    cursor: "pointer",
    borderBottom: "0.5px solid var(--surface-panel-border)",
    transition: "background 0.15s, border-left 0.15s",
    borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
    background: isSelected
      ? "rgba(var(--accent-rgb), 0.1)"
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
          e.currentTarget.style.background = "rgba(var(--accent-rgb), 0.06)";
          e.currentTarget.style.borderLeft = "3px solid var(--accent)";
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
        {injury.status === "Active" ? (
          <ActiveStatusBadge />
        ) : (
          <AnimatedBadge tone={statusTone(injury.status)}>{injury.status}</AnimatedBadge>
        )}
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
                  ? "var(--color-state-warning)"
                  : daysRemaining < 0
                    ? "var(--color-state-danger)"
                    : "var(--accent)",
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
            <Pencil size={14} style={{ color: "var(--text-secondary)" }} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose(injury);
            }}
            className="rounded p-1.5 transition-colors hover:bg-white/5"
          >
            <CheckCircle size={14} style={{ color: "var(--color-state-success)" }} />
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
}: {
  injury: DisplayInjury;
  showRechute: boolean;
  onClose: () => void;
  onEdit: (injury: DisplayInjury) => void;
  onCloseCase: (injury: DisplayInjury) => void;
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
    injury.riskIA >= 7 ? "danger" : injury.riskIA >= 5 ? "warning" : "info";

  const infoRows = [
    { label: "Diagnostic", value: injury.injury },
    { label: "Zone", value: translateBodyPart(injury.bodyPart) },
    { label: "Sévérité", value: severityLabel, badge: severityToneVal as "danger" | "warning" | "info" },
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
              <AnimatedBadge tone={statusTone(injury.status)}>
                {injury.status === "Active" ? "Actif" : injury.status}
              </AnimatedBadge>
              {showRechute ? (
                <span
                  className="mt-1 inline-block"
                  style={{
                    fontSize: 10,
                    color: "var(--color-state-warning)",
                    background: "var(--color-state-warning-bg)",
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
              background: "var(--accent)",
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
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,122,0,0.3)";
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

function InjuryFormModal({
  players,
  onClose,
  onSubmit,
}: {
  players: ApiPlayer[];
  onClose: () => void;
  onSubmit: (values: {
    playerName: string;
    injuryType: string;
    bodyPart: string;
    returnDate: string;
    riskScore: string;
  }) => Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState({
    playerName: "",
    injuryDate: todayInputValue(),
    context: "" as (typeof CONTEXT_OPTIONS)[number] | "",
    mechanism: "" as (typeof ADD_MECHANISM_OPTIONS)[number] | "",
  });
  const [step2, setStep2] = useState({
    diagnostic: "",
    zone: "",
    riskScore: "5",
    returnDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validateStep1(): boolean {
    if (!step1.playerName.trim()) {
      setSubmitError("Veuillez sélectionner un joueur.");
      return false;
    }
    if (!step1.injuryDate) {
      setSubmitError("La date de blessure est requise.");
      return false;
    }
    if (!step1.context) {
      setSubmitError("Veuillez sélectionner un contexte.");
      return false;
    }
    if (!step1.mechanism) {
      setSubmitError("Veuillez sélectionner un mécanisme.");
      return false;
    }
    setSubmitError(null);
    return true;
  }

  function handleNext() {
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!step2.diagnostic.trim()) {
      setSubmitError("Le diagnostic est requis.");
      return;
    }
    if (!step2.zone) {
      setSubmitError("Veuillez sélectionner une zone anatomique.");
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      await onSubmit({
        playerName: step1.playerName.trim(),
        injuryType: step2.diagnostic.trim(),
        bodyPart: step2.zone,
        returnDate: step2.returnDate,
        riskScore: step2.riskScore,
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,122,0,0.15)",
                border: "1px solid rgba(255,122,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Plus size={16} style={{ color: "var(--accent)" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
              Ajouter un cas médical
            </h2>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        <div style={{ display: "flex", gap: 8, margin: "20px 0 8px" }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                transition: "all 0.4s ease",
                ...(step >= s
                  ? {
                      background: "linear-gradient(90deg, var(--accent), #ff9a40)",
                      boxShadow: "0 0 8px rgba(255,122,0,0.4)",
                    }
                  : { background: "rgba(255,255,255,0.1)" }),
              }}
            />
          ))}
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {step}
          </span>
          sur 2 — {step === 1 ? "Contexte" : "Diagnostic"}
        </p>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
        {step === 1 ? (
          <div>
            <FormField label="Joueur">
              {players.length > 0 ? (
                <select
                  value={step1.playerName}
                  onChange={(e) => setStep1((prev) => ({ ...prev, playerName: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Sélectionner un joueur…</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.fullName}>
                      {p.fullName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={step1.playerName}
                  onChange={(e) => setStep1((prev) => ({ ...prev, playerName: e.target.value }))}
                  placeholder="Nom du joueur"
                  className={inputClass}
                />
              )}
            </FormField>

            <FormField label="Date de blessure">
              <input
                type="date"
                value={step1.injuryDate}
                onChange={(e) => setStep1((prev) => ({ ...prev, injuryDate: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Contexte">
              <select
                value={step1.context}
                onChange={(e) =>
                  setStep1((prev) => ({
                    ...prev,
                    context: e.target.value as (typeof CONTEXT_OPTIONS)[number],
                  }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner…</option>
                {CONTEXT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Mécanisme">
              <select
                value={step1.mechanism}
                onChange={(e) =>
                  setStep1((prev) => ({
                    ...prev,
                    mechanism: e.target.value as (typeof ADD_MECHANISM_OPTIONS)[number],
                  }))
                }
                className={inputClass}
              >
                <option value="">Sélectionner…</option>
                {ADD_MECHANISM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            {submitError ? (
              <p className="mb-4 text-sm" style={{ color: "var(--color-state-danger)" }}>{submitError}</p>
            ) : null}

            <button
              type="button"
              onClick={handleNext}
              className="modal-premium-btn-next flex w-full items-center justify-center gap-2"
              style={{
                width: "100%",
                padding: 14,
                background: "var(--accent)",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                marginTop: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-strong)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,122,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Suivant
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField label="Type de blessure / Diagnostic">
              <input
                type="text"
                value={step2.diagnostic}
                onChange={(e) => setStep2((prev) => ({ ...prev, diagnostic: e.target.value }))}
                placeholder="Ex: Entorse cheville"
                className={inputClass}
              />
            </FormField>

            <FormField label="Zone anatomique">
              <select
                value={step2.zone}
                onChange={(e) => setStep2((prev) => ({ ...prev, zone: e.target.value }))}
                className={inputClass}
              >
                <option value="">Sélectionner…</option>
                {ZONE_SELECT_OPTIONS.map((z) => (
                  <option key={z.key} value={z.key}>
                    {z.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Score de risque (1-10)">
              <input
                type="number"
                min={1}
                max={10}
                value={step2.riskScore}
                onChange={(e) => setStep2((prev) => ({ ...prev, riskScore: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Date de retour estimée">
              <input
                type="date"
                value={step2.returnDate}
                onChange={(e) => setStep2((prev) => ({ ...prev, returnDate: e.target.value }))}
                className={inputClass}
              />
            </FormField>

            <FormField label="Notes cliniques">
              <textarea
                rows={3}
                value={step2.notes}
                onChange={(e) => setStep2((prev) => ({ ...prev, notes: e.target.value }))}
                className={`${inputClass} modal-premium-textarea`}
                placeholder="Observations optionnelles…"
              />
            </FormField>

            {submitError ? (
              <p className="mb-4 text-sm" style={{ color: "var(--color-state-danger)" }}>{submitError}</p>
            ) : null}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSubmitError(null);
                }}
                className="modal-premium-btn-back flex items-center justify-center"
                style={{
                  flex: 1,
                  padding: 13,
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text-secondary)",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={saving}
                className="modal-premium-btn-save flex items-center justify-center gap-2"
                style={{
                  flex: 2,
                  padding: 13,
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 12,
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.background = "var(--accent-strong)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,122,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Enregistrer"}
              </button>
            </div>
          </form>
        )}
        </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const KPI_CARDS = [
  {
    label: "Total cas",
    key: "total" as const,
    borderColor: "var(--color-state-info)",
    iconColor: "var(--color-state-info)",
    iconBg: "var(--color-state-info-bg)",
    cardBg: "var(--color-state-info-bg)",
    valueColor: "var(--color-state-info)",
    Icon: ClipboardList,
    trend: null as "active" | "done" | null,
  },
  {
    label: "Cas actifs",
    key: "active" as const,
    borderColor: "var(--color-state-danger)",
    iconColor: "var(--color-state-danger)",
    iconBg: "var(--color-state-danger-bg)",
    cardBg: "var(--color-state-danger-bg)",
    valueColor: "var(--color-state-danger)",
    Icon: AlertCircle,
    trend: "active" as const,
  },
  {
    label: "En rééducation",
    key: "reeducation" as const,
    borderColor: "var(--color-state-warning)",
    iconColor: "var(--color-state-warning)",
    iconBg: "var(--color-state-warning-bg)",
    cardBg: "var(--color-state-warning-bg)",
    valueColor: "var(--color-state-warning)",
    Icon: Activity,
    trend: null as "active" | "done" | null,
  },
  {
    label: "Cas résolus",
    key: "done" as const,
    borderColor: "var(--color-state-success)",
    iconColor: "var(--color-state-success)",
    iconBg: "var(--color-state-success-bg)",
    cardBg: "var(--color-state-success-bg)",
    valueColor: "var(--color-state-success)",
    Icon: CheckCircle,
    trend: "done" as const,
  },
];

function KpiTrend({ trend, count }: { trend: "active" | "done" | null; count: number }) {
  if (trend === "active") {
    return count > 0 ? (
      <span className="text-xs" style={{ color: "var(--color-state-danger)" }}>
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
      <span className="text-xs" style={{ color: "var(--color-state-success)" }}>
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
  const [showAdd, setShowAdd] = useState(false);
  const [editingInjury, setEditingInjury] = useState<DisplayInjury | null>(null);
  const [selectedInjury, setSelectedInjury] = useState<DisplayInjury | null>(null);
  const [closeConfirmInjury, setCloseConfirmInjury] = useState<DisplayInjury | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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

  const stats = useMemo(
    () => ({
      total: injuries.length,
      active: injuries.filter((i) => i.status === "Active").length,
      reeducation: injuries.filter((i) => i.status === "En rééducation").length,
      done: injuries.filter((i) => i.status === "Terminée").length,
    }),
    [injuries],
  );

  const filterCounts: Record<Filter, number> = {
    Tous: stats.total,
    Actives: stats.active,
    "En rééducation": stats.reeducation,
    Terminées: stats.done,
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return injuries
      .filter((inj) => {
        if (filter === "Tous") return true;
        if (filter === "Actives") return inj.status === "Active";
        if (filter === "En rééducation") return inj.status === "En rééducation";
        return inj.status === "Terminée";
      })
      .filter(
        (inj) =>
          !q ||
          inj.player.toLowerCase().includes(q) ||
          inj.injury.toLowerCase().includes(q),
      );
  }, [injuries, filter, search]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
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
      <style>{`
        @keyframes medical-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .medical-blessures-input {
          border: 1px solid var(--surface-panel-border);
        }
        .medical-blessures-input:focus {
          border-color: var(--accent);
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
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255,122,0,0.12);
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
        <Button onClick={() => setShowAdd(true)}>
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
            Aucun cas médical
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {filter === "Tous"
              ? "Aucune blessure enregistrée pour ce club."
              : `Aucun cas avec le statut "${filter}".`}
          </p>
        </div>
      ) : (
        <GlassCard raised className="overflow-hidden">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "2px solid var(--surface-panel-border)",
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
        {selectedInjury ? (
          <InjuryDetailPanel
            key={selectedInjury.id}
            injury={selectedInjury}
            showRechute={(playerInjuryCounts[selectedInjury.player] ?? 0) > 1}
            onClose={() => setSelectedInjury(null)}
            onEdit={(inj) => {
              setEditingInjury(inj);
            }}
            onCloseCase={setCloseConfirmInjury}
          />
        ) : null}
        {showAdd ? (
          <InjuryFormModal
            players={players}
            onClose={() => setShowAdd(false)}
            onSubmit={handleCreateInjury}
          />
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
