import { useState } from "react";

type ScoutPlayerPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  variant?: "card" | "cutout" | "circle";
  accent?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ScoutPlayerPhoto({
  name,
  photoUrl,
  size = 56,
  className = "",
  variant = "cutout",
  accent = "#FF7A00",
}: ScoutPlayerPhotoProps) {
  const [failed, setFailed] = useState(false);
  const radius = variant === "circle" ? "9999px" : variant === "card" ? "16px" : "18px";
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: showPhoto
          ? "linear-gradient(180deg, rgba(255,122,0,0.12), rgba(8,6,24,0.95))"
          : `linear-gradient(135deg, ${accent}, ${accent}99)`,
        border: showPhoto ? `1px solid ${accent}35` : undefined,
      }}
    >
      {showPhoto ? (
        <img
          src={photoUrl!}
          alt={name}
          className="h-full w-full object-contain object-bottom scale-110"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.45))" }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-extrabold text-white"
          style={{ fontSize: Math.max(10, size * 0.28) }}
        >
          {initials(name)}
        </div>
      )}
    </div>
  );
}
