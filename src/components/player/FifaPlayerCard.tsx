import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { getFifaAttributes, PLAYER_CUTOUT_URL } from "../../data/joueurPersonalData";
import { getInitials } from "../../data/joueurMockData";

export const FIFA_CARD_WIDTH = 260;
export const FIFA_CARD_HEIGHT = 390;
const BOTTOM_H = 108;
const FOOTER_BOTTOM = 30;
const STAT_SIDE_PAD = 18;
const STAT_ROW_GAP = 10;

interface FifaPlayerCardProps {
  name: string;
  position: string;
  ovr: number;
  age: number;
  flag: string;
  nationality: string;
  number?: number;
  club?: string;
  radar: { speed: number; passing: number; shooting: number; physical: number; vision: number; defending: number };
  cutoutUrl?: string | null;
  badge?: "forme" | "totw" | null;
  onPhotoUpload?: (file: File) => void;
}

const CARD_CLIP = "polygon(6% 2%, 94% 2%, 100% 7%, 100% 67%, 50% 100%, 0% 67%, 0% 7%)";

const STAT_COLOR = "#1a1008";
const STAT_LABEL = "rgba(26,16,8,0.78)";

const BADGE_STYLES = {
  forme: { label: "🔥 FORME", bg: "rgba(255,107,87,0.92)", color: "#fff" },
  totw: { label: "⭐ TOTW", bg: "rgba(30,30,30,0.88)", color: "#FFD86E" },
};

function formatFifaName(name: string) {
  const last = name.trim().split(/\s+/).pop() ?? name;
  return last.charAt(0).toUpperCase() + last.slice(1).toLowerCase();
}

function resolvePhotoUrl(cutoutUrl?: string | null) {
  if (cutoutUrl) return cutoutUrl;
  if (PLAYER_CUTOUT_URL) return PLAYER_CUTOUT_URL;
  return null;
}

function StatCell({ value, label, align }: { value: number; label: string; align: "left" | "right" }) {
  return (
    <div
      className="flex items-baseline gap-1"
      style={{ justifyContent: align === "left" ? "flex-start" : "flex-end" }}
    >
      <span
        className="font-black tabular-nums leading-none"
        style={{ fontSize: 12, color: STAT_COLOR, fontFamily: "Arial Black, Impact, sans-serif", textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}
      >
        {value}
      </span>
      <span className="font-bold leading-none" style={{ fontSize: 7.5, color: STAT_LABEL }}>
        {label}
      </span>
    </div>
  );
}

function StatsGrid({ rows }: { rows: { left: { key: string; value: number }; right: { key: string; value: number } }[] }) {
  return (
    <div
      className="absolute z-20 w-full"
      style={{ top: "38%", left: 0, paddingLeft: STAT_SIDE_PAD, paddingRight: STAT_SIDE_PAD }}
    >
      {rows.map((row) => (
        <div
          key={`${row.left.key}-${row.right.key}`}
          className="grid grid-cols-2 items-center"
          style={{ marginBottom: STAT_ROW_GAP }}
        >
          <StatCell value={row.left.value} label={row.left.key} align="left" />
          <StatCell value={row.right.value} label={row.right.key} align="right" />
        </div>
      ))}
    </div>
  );
}

function LeagueLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden style={{ opacity: 0.85 }}>
      <circle cx="16" cy="16" r="15" fill="#c0392b" stroke="#8b0000" strokeWidth="1" />
      <text x="16" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="800" fontFamily="Arial,sans-serif">L1</text>
    </svg>
  );
}

function ClubLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 36" fill="none" aria-hidden style={{ opacity: 0.88 }}>
      <path d="M16 1 L30 8 V20 C30 28 16 35 16 35 C16 35 2 28 2 20 V8 Z" fill="#FF6B57" stroke="#c0392b" strokeWidth="1.2" />
      <path d="M16 6 L24 10 V18 C24 23 16 28 16 28 C16 28 8 23 8 18 V10 Z" fill="#fff" fillOpacity="0.25" />
      <text x="16" y="21" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="Arial,sans-serif">FCC</text>
    </svg>
  );
}

function PlayerSilhouette({ initials }: { initials: string }) {
  return (
    <div
      className="flex h-full w-full items-end justify-center pb-4"
      style={{ transform: "scale(1.05)", transformOrigin: "bottom center" }}
    >
      <div
        className="flex items-center justify-center rounded-full font-black"
        style={{
          width: 120,
          height: 120,
          fontSize: 42,
          color: "rgba(42,24,5,0.28)",
          background: "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.35) 0%, rgba(80,45,0,0.06) 70%)",
          border: "2px solid rgba(42,24,5,0.1)",
          boxShadow: "inset 0 -8px 20px rgba(80,45,0,0.08)",
        }}
      >
        {initials}
      </div>
    </div>
  );
}

export function FifaPlayerCard({
  name,
  position,
  ovr,
  flag,
  nationality,
  club = "FC Carthage",
  radar,
  cutoutUrl,
  badge = "forme",
  onPhotoUpload,
}: FifaPlayerCardProps) {
  const attr = getFifaAttributes(radar);
  const displayName = formatFifaName(name);
  const initials = getInitials(name);
  const photoUrl = resolvePhotoUrl(cutoutUrl);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showPhoto = Boolean(photoUrl) && !photoFailed;

  const statRows = [
    { left: { key: "PAC", value: attr.pac }, right: { key: "DRI", value: attr.dri } },
    { left: { key: "SHO", value: attr.sho }, right: { key: "DEF", value: attr.def } },
    { left: { key: "PAS", value: attr.pas }, right: { key: "PHY", value: attr.phy } },
  ];

  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  return (
    <motion.div
      className="fifa-ut-card group relative select-none overflow-visible"
      style={{
        width: FIFA_CARD_WIDTH,
        height: FIFA_CARD_HEIGHT,
        perspective: 1000,
        boxShadow: "0 20px 50px rgba(255,180,0,0.15), 0 8px 28px rgba(0,0,0,0.28)",
        filter: "drop-shadow(0 0 22px rgba(255,180,0,0.25))",
      }}
      initial={{ opacity: 0, rotateY: -10, scale: 0.94 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ rotateY: 8, scale: 1.03, y: -4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div
        className="fifa-card-shine-hover pointer-events-none absolute inset-0 z-[25] opacity-0"
        style={{ clipPath: CARD_CLIP, background: "linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.72) 50%, transparent 65%)" }}
      />

      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: CARD_CLIP }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fce38a 0%, #f5b942 42%, #d89216 100%)" }} />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(125deg, transparent, transparent 12px, rgba(255,255,255,0.18) 12px, rgba(255,255,255,0.18) 24px), radial-gradient(circle at 30% 18%, rgba(255,255,255,0.5) 0%, transparent 40%)",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-25"
          style={{ background: "linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.4) 50%, transparent 58%)" }}
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: BOTTOM_H, background: "linear-gradient(to top, rgba(140,85,5,0.2) 0%, transparent 100%)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), inset 0 -14px 28px rgba(80,45,0,0.14)" }}
        />
      </div>

      {/* ULT badge — top right */}
      {badgeStyle && (
        <div
          className="absolute right-3.5 top-3.5 z-30 rounded-full px-2.5 py-1 text-[7px] font-black uppercase tracking-wide shadow-md"
          style={{ background: badgeStyle.bg, color: badgeStyle.color }}
        >
          {badgeStyle.label}
        </div>
      )}

      {/* Player render */}
      <div
        className="pointer-events-none absolute z-[5] overflow-visible"
        style={{
          top: -28,
          left: "50%",
          bottom: BOTTOM_H + FOOTER_BOTTOM + 4,
          width: "106%",
          transform: "translateX(-50%)",
        }}
      >
        {showPhoto ? (
          <motion.img
            src={photoUrl!}
            alt={displayName}
            draggable={false}
            className="h-full w-full object-contain object-bottom"
            style={{
              filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.42))",
              transform: "scale(1.04)",
              transformOrigin: "bottom center",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <PlayerSilhouette initials={initials} />
        )}
      </div>

      {/* Camera upload overlay — visible on hover when onPhotoUpload provided */}
      {onPhotoUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onPhotoUpload(file);
                setPhotoFailed(false);
              }
              e.target.value = "";
            }}
          />
          <AnimatePresence>
            {hovered && (
              <motion.button
                key="cam"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.18 }}
                className="absolute z-40 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg"
                style={{
                  bottom: 48,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(14,14,28,0.88)",
                  color: "#FF6B57",
                  border: "1px solid rgba(255,107,87,0.45)",
                  backdropFilter: "blur(8px)",
                  whiteSpace: "nowrap",
                }}
                title="Changer la photo (PNG recommandé)"
              >
                <Camera size={13} />
                Photo
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}

      <div className="relative z-10 flex h-full flex-col" style={{ clipPath: CARD_CLIP }}>
        {/* OVR — dominant */}
        <div className="px-5 pt-4">
          <span
            className="block font-black leading-none"
            style={{
              fontSize: 48,
              color: STAT_COLOR,
              fontFamily: "Arial Black, Impact, sans-serif",
              textShadow: "0 1px 0 rgba(255,255,255,0.5)",
              letterSpacing: "-0.03em",
            }}
          >
            {ovr}
          </span>
          <span
            className="mt-1 block font-bold leading-none"
            style={{ fontSize: 14, color: STAT_COLOR, letterSpacing: "0.05em", textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
          >
            {position}
          </span>
        </div>

        <StatsGrid rows={statRows} />

        {/* Logos + nom */}
        <div
          className="absolute inset-x-0 flex flex-col items-center px-4"
          style={{ bottom: FOOTER_BOTTOM, height: BOTTOM_H - FOOTER_BOTTOM }}
        >
          <div className="mb-3 flex items-center justify-center gap-4">
            <span className="text-base leading-none" style={{ opacity: 0.92 }} title={nationality}>
              {flag}
            </span>
            <span title="Ligue 1 Tunisie">
              <LeagueLogo />
            </span>
            <span title={club}>
              <ClubLogo />
            </span>
          </div>

          <p
            className="text-center leading-none"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: STAT_COLOR,
              fontFamily: "Arial, Helvetica, sans-serif",
              textShadow: "0 1px 0 rgba(255,255,255,0.45)",
              letterSpacing: "0.03em",
              paddingBottom: 2,
            }}
          >
            {displayName}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
