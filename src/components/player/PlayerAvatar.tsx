import { useRef } from "react";
import { Camera } from "lucide-react";
import { getInitials } from "../../data/joueurMockData";
import { PLAYER_CUTOUT_URL } from "../../data/joueurPersonalData";

interface PlayerAvatarProps {
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
  photoUrl?: string | null;
  onPhotoUpload?: (file: File) => void;
}

export function PlayerAvatar({ name, size = 80, className = "", ring = true, photoUrl, onPhotoUpload }: PlayerAvatarProps) {
  const src = photoUrl ?? PLAYER_CUTOUT_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadButton = onPhotoUpload ? (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPhotoUpload(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
        style={{
          width: size * 0.35,
          height: size * 0.35,
          background: "#FF6B57",
          border: "2px solid var(--surface-bg)",
          color: "white",
          zIndex: 10,
        }}
        title="Changer la photo"
      >
        <Camera size={size * 0.16} />
      </button>
    </>
  ) : null;

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
          overflow: "visible",
        }}
      >
        <div className="h-full w-full overflow-hidden rounded-[20px]">
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
        {uploadButton}
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-visible rounded-[20px] font-bold ${className}`}
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
      {uploadButton}
    </div>
  );
}
