import { useEffect, useState } from "react";

type ScoutPlayerPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
  variant?: "card" | "cutout" | "circle";
  accent?: string;
};

const STAR_PHOTOS: Record<string, string> = {
  "kylian mbappe": "https://r2.thesportsdb.com/images/media/player/cutout/h9u9vz1733653583.png",
  "erling haaland": "https://r2.thesportsdb.com/images/media/player/cutout/un3jr11769182465.png",
  "jude bellingham": "https://r2.thesportsdb.com/images/media/player/cutout/trk5271750271712.png",
  "vinicius junior": "https://r2.thesportsdb.com/images/media/player/cutout/ejuxsh1750271859.png",
  "vinicius jr": "https://r2.thesportsdb.com/images/media/player/cutout/ejuxsh1750271859.png",
  "lamine yamal": "https://r2.thesportsdb.com/images/media/player/cutout/m9n4ja1761512633.png",
  "robert lewandowski": "https://r2.thesportsdb.com/images/media/player/cutout/xg2rl51762289740.png",
  "harry kane": "https://r2.thesportsdb.com/images/media/player/cutout/j4ouvd1756408895.png",
  "mohamed salah": "https://r2.thesportsdb.com/images/media/player/cutout/3blc581757088735.png",
  "kevin de bruyne": "https://r2.thesportsdb.com/images/media/player/cutout/o4flia1764089447.png",
  "rodri": "https://r2.thesportsdb.com/images/media/player/cutout/0ml2zi1761148957.png",
  "bukayo saka": "https://r2.thesportsdb.com/images/media/player/cutout/xfwok41769331816.png",
  "phil foden": "https://r2.thesportsdb.com/images/media/player/cutout/lbn4sx1769182620.png",
  "pedri": "https://r2.thesportsdb.com/images/media/player/cutout/srwppu1424795582.png",
  "gavi": "https://r2.thesportsdb.com/images/media/player/cutout/29005498.png",
  "florian wirtz": "https://r2.thesportsdb.com/images/media/player/cutout/8t6bzo1757088899.png",
  "bruno fernandes": "https://r2.thesportsdb.com/images/media/player/cutout/jhasls1766826690.png",
  "marcus rashford": "https://r2.thesportsdb.com/images/media/player/cutout/soi5zw1761512565.png",
  "leny yoro": "https://r2.thesportsdb.com/images/media/player/cutout/pn8gp91766827044.png",
};

const clientPhotoCache = new Map<string, string | null>();
const clientInflight = new Map<string, Promise<string | null>>();

function normalizePhotoKey(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function lookupLocalPhoto(name: string): string | null {
  const key = normalizePhotoKey(name);
  if (STAR_PHOTOS[key]) return STAR_PHOTOS[key];
  const parts = key.split(/\s+/);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    for (const [catalogKey, url] of Object.entries(STAR_PHOTOS)) {
      if (catalogKey.endsWith(` ${last}`) || catalogKey.split(" ").pop() === last) {
        if (catalogKey.split(" ")[0][0] === parts[0][0]) return url;
      }
    }
  }
  return null;
}

async function fetchScoutPlayerPhoto(name: string): Promise<string | null> {
  const key = normalizePhotoKey(name);
  if (clientPhotoCache.has(key)) return clientPhotoCache.get(key) ?? null;

  const local = lookupLocalPhoto(name);
  if (local) {
    clientPhotoCache.set(key, local);
    return local;
  }

  const pending = clientInflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    try {
      const res = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as {
        player?: { strCutout?: string; strThumb?: string; strRender?: string }[] | null;
      };
      const player = json.player?.[0];
      return player?.strCutout ?? player?.strRender ?? player?.strThumb ?? null;
    } catch {
      return null;
    }
  })();

  clientInflight.set(key, task);
  try {
    const url = await task;
    clientPhotoCache.set(key, url);
    if (url) STAR_PHOTOS[key] = url;
    return url;
  } finally {
    clientInflight.delete(key);
  }
}

export function resolveScoutPhotoUrl(
  name: string,
  direct?: string | null,
  catalog?: Array<{ name: string; photoUrl?: string | null }>,
): string | null | undefined {
  if (direct) return direct;
  const hit = catalog?.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (hit?.photoUrl) return hit.photoUrl;
  return lookupLocalPhoto(name);
}

export function ScoutPlayerPhoto({
  name,
  photoUrl: directPhoto,
  size = 56,
  className = "",
  variant = "cutout",
  accent = "#FF7A00",
}: ScoutPlayerPhotoProps) {
  const [resolved, setResolved] = useState<string | null | undefined>(
    () => resolveScoutPhotoUrl(name, directPhoto) ?? undefined,
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    const immediate = resolveScoutPhotoUrl(name, directPhoto);
    if (immediate) {
      setResolved(immediate);
      return;
    }
    setResolved(undefined);
    let cancelled = false;
    void fetchScoutPlayerPhoto(name).then((url) => {
      if (!cancelled && url) setResolved(url);
    });
    return () => {
      cancelled = true;
    };
  }, [name, directPhoto]);

  const photoUrl = directPhoto || resolved;
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
