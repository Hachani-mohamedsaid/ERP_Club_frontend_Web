export type ProspectLiveReel = {
  id: string;
  title: string;
  caption: string;
  duration: string;
  views: string;
  tag: string;
  accent: string;
  query: string;
  searchUrl: string;
};

function ytSearch(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIYAQ%253D%253D`;
}

export function youtubeSearchUrl(query: string) {
  return ytSearch(query);
}

export function youtubeWatchEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

/** Résout via proxy serveur `/api/scout/youtube/resolve` (évite CORS). */
export async function resolveYoutubeVideoId(query: string): Promise<string | null> {
  const data = await resolveYoutubeForPlayer(query);
  return data.videoId;
}

export async function resolveYoutubeForPlayer(query: string): Promise<{
  videoId: string | null;
  embedUrl?: string;
  searchUrl: string;
}> {
  try {
    const { apiFetch } = await import("../authHeaders");
    const res = await apiFetch(`/scout/youtube/resolve?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      return { videoId: null, searchUrl: ytSearch(query) };
    }
    return (await res.json()) as {
      videoId: string | null;
      embedUrl?: string;
      searchUrl: string;
    };
  } catch {
    return { videoId: null, searchUrl: ytSearch(query) };
  }
}

function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1]! : fullName;
}

/** Reels IA — titres contextuels + liens YouTube Shorts */
export function buildAiReels(
  name: string,
  club: string,
  position: string,
  goals: number,
  assists: number,
): ProspectLiveReel[] {
  const sn = shortName(name);
  const isStriker = position === "BU";
  const isWinger = position === "Ailier G" || position === "Ailier D" || position === "AG" || position === "AD";
  const isMid = position === "MC" || position === "MOC" || position === "MDC";

  const ideas: Omit<ProspectLiveReel, "id" | "searchUrl" | "query">[] = [];

  if (goals >= 5) {
    ideas.push({
      title: `${sn} — ${goals} buts`,
      caption: `Compilation buts · ${club}`,
      duration: "0:58",
      views: `${(1.1 + goals * 0.08).toFixed(1)}M`,
      tag: "Buts",
      accent: "#22C55E",
    });
  }

  ideas.push({
    title: isStriker ? `${sn} — finition clinique` : `${sn} — meilleures actions`,
    caption: isStriker ? "Tirs, appels, finitions" : "Actions décisives",
    duration: "0:42",
    views: "890K",
    tag: "Highlights",
    accent: "#FF7A00",
  });

  if (isWinger || isStriker) {
    ideas.push({
      title: `${sn} — vitesse & dribbles`,
      caption: "Accélérations en contre",
      duration: "0:36",
      views: "1.4M",
      tag: "Vitesse",
      accent: "#3B82F6",
    });
  }

  if (assists >= 3 || isMid) {
    ideas.push({
      title: `${sn} — passes décisives`,
      caption: `${assists} assists · vision de jeu`,
      duration: "0:48",
      views: "620K",
      tag: "Passes",
      accent: "#8B5CF6",
    });
  }

  ideas.push({
    title: `${sn} vs top clubs`,
    caption: `Performances ${club}`,
    duration: "0:52",
    views: "2.1M",
    tag: "Matchs",
    accent: "#F59E0B",
  });

  ideas.push({
    title: `Skills ${sn}`,
    caption: "Contrôle, feintes, technique",
    duration: "0:33",
    views: "1.8M",
    tag: "Skills",
    accent: "#EC4899",
  });

  if (isMid || position === "DC") {
    ideas.push({
      title: `${sn} — récupérations`,
      caption: "Duels & pressing",
      duration: "0:41",
      views: "540K",
      tag: "Défense",
      accent: "#14B8A6",
    });
  }

  return ideas.slice(0, 6).map((reel, i) => {
    const query = `${name} ${club} ${reel.tag} football highlights #shorts`;
    return {
      ...reel,
      id: `reel-${i}`,
      query,
      searchUrl: ytSearch(query),
    };
  });
}
