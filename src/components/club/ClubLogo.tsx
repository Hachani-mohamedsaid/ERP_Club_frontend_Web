import { getClubInitials } from "../../hooks/useClubProfile";

const SIZES = {
  xs: { box: "h-6 w-6 rounded-full text-[10px]", img: "h-6 w-6 rounded-full" },
  sm: { box: "h-8 w-8 rounded-lg text-xs", img: "h-8 w-8 rounded-lg" },
  md: { box: "h-16 w-16 rounded-2xl text-xl", img: "h-16 w-16 rounded-2xl" },
  lg: { box: "h-20 w-20 rounded-2xl text-2xl", img: "h-20 w-20 rounded-2xl" },
} as const;

interface ClubLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
  accent?: string;
}

export function ClubLogo({
  name,
  logoUrl,
  size = "md",
  className = "",
  accent = "#FF6B57",
}: ClubLogoProps) {
  const s = SIZES[size];
  const initials = getClubInitials(name);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={`${s.img} object-contain bg-white/5 p-1 ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-bold ${s.box} ${className}`}
      style={{ background: `${accent}33`, color: accent }}
    >
      {initials}
    </div>
  );
}
