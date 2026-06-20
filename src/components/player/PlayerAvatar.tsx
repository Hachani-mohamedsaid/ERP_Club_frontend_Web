import { getInitials } from "../../data/joueurMockData";
import { PLAYER_AVATAR_URL } from "../../data/joueurPersonalData";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function PlayerAvatar({ name, size = 80, className = "", ring = true }: PlayerAvatarProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-[20px] ${className}`}
      style={{
        width: size,
        height: size,
        border: ring ? "2px solid rgba(255,107,87,0.5)" : undefined,
        boxShadow: ring ? "0 0 24px rgba(255,107,87,0.2)" : undefined,
      }}
    >
      <img
        src={PLAYER_AVATAR_URL}
        alt={name}
        className="h-full w-full object-cover object-top"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = "none";
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className="absolute inset-0 hidden items-center justify-center text-lg font-bold"
        style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}
      >
        {getInitials(name)}
      </div>
    </div>
  );
}
