import { getInitials } from "../../data/joueurMockData";
import { PLAYER_CUTOUT_URL } from "../../data/joueurPersonalData";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
  photoUrl?: string | null;
}

export function PlayerAvatar({ name, size = 80, className = "", ring = true, photoUrl }: PlayerAvatarProps) {
  const src = photoUrl ?? PLAYER_CUTOUT_URL;

  if (src) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-[20px] ${className}`}
        style={{
          width: size,
          height: size,
          border: ring ? "2px solid rgba(255,107,87,0.5)" : undefined,
          boxShadow: ring ? "0 0 24px rgba(255,107,87,0.2)" : undefined,
          background: "linear-gradient(180deg, rgba(255,107,87,0.08), rgba(7,11,26,0.9))",
        }}
      >
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover object-[center_8%] scale-[1.35]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className="absolute inset-0 hidden items-center justify-center font-bold"
          style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57", fontSize: size * 0.32 }}
        >
          {getInitials(name)}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[20px] font-bold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        border: ring ? "2px solid rgba(255,107,87,0.5)" : undefined,
        boxShadow: ring ? "0 0 24px rgba(255,107,87,0.2)" : undefined,
        background: "linear-gradient(180deg, rgba(255,107,87,0.18), rgba(7,11,26,0.95))",
        color: "#FF6B57",
      }}
    >
      {getInitials(name)}
    </div>
  );
}
