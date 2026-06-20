import { useState } from "react";
import { Send, Sparkles, TrendingUp } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface AIRecommendation {
  id: string;
  name: string;
  position: string;
  club: string;
  compatibility: number;
  reason: string;
}

const SAMPLE_QUERIES = [
  "Je cherche un milieu défensif moins de 20 ans",
  "Jeune attaquant avec potentiel 85+",
  "Défenseur central expérimenté",
  "Ailier rapide et technique",
];

const QUERY_RESULTS: Record<string, AIRecommendation[]> = {
  "Je cherche un milieu défensif moins de 20 ans": [
    {
      id: "1",
      name: "Nader Trabelsi",
      position: "Milieu Défensif",
      club: "Stade Tunisien",
      compatibility: 91,
      reason: "Profil technique et physique exceptionnels pour son âge",
    },
    {
      id: "2",
      name: "Karim Sassi",
      position: "Milieu Défensif",
      club: "US Monastir",
      compatibility: 87,
      reason: "Excellente lecture du jeu et positionnement",
    },
  ],
  "Jeune attaquant avec potentiel 85+": [
    {
      id: "3",
      name: "Youssef Ben Ali",
      position: "Attaquant",
      club: "AS Ariana",
      compatibility: 92,
      reason: "Potentiel offensif remarquable, finition excellente",
    },
    {
      id: "4",
      name: "Mouhamed Diallo",
      position: "Ailier",
      club: "AFAD Djékanou",
      compatibility: 88,
      reason: "Profil explosif avec vitesse et technique",
    },
  ],
  "Défenseur central expérimenté": [
    {
      id: "5",
      name: "Karim Sassi",
      position: "Défenseur Central",
      club: "US Monastir",
      compatibility: 84,
      reason: "Leadership et expérience défensive solides",
    },
  ],
  "Ailier rapide et technique": [
    {
      id: "6",
      name: "Mouhamed Diallo",
      position: "Ailier",
      club: "AFAD Djékanou",
      compatibility: 89,
      reason: "Combinaison rare de vitesse et technique offensive",
    },
  ],
};

export function AIAssistantPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const queryLower = query.toLowerCase();
    let matchedResults: AIRecommendation[] = [];

    for (const [key, value] of Object.entries(QUERY_RESULTS)) {
      if (key.toLowerCase().includes(queryLower) || queryLower.includes(key.toLowerCase().split(" ")[0])) {
        matchedResults = value;
        break;
      }
    }

    if (matchedResults.length === 0) {
      matchedResults = Object.values(QUERY_RESULTS).flat().slice(0, 3);
    }

    setResults(matchedResults);
    setIsLoading(false);
  };

  const handleQuickSearch = (quickQuery: string) => {
    setQuery(quickQuery);
    setTimeout(() => {
      const input = document.querySelector("input[type='text']") as HTMLInputElement;
      if (input) input.value = quickQuery;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={24} style={{ color: "var(--accent)" }} />
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            ODIN AI Scout
          </h1>
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Recherchez les meilleurs prospects avec l'IA. Décrivez simplement vos besoins.
        </p>
      </div>

      <GlassCard raised className="p-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ex: Je cherche un milieu défensif moins de 20 ans..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="glass-input flex-1 px-4 py-3 text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-3 text-sm font-medium transition-all duration-300 disabled:opacity-50"
            style={{ background: "var(--accent)", color: "white" }}
          >
            <Send size={16} />
            Chercher
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Recherches populaires
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  handleQuickSearch(suggestion);
                  setQuery(suggestion);
                }}
                className="rounded-full border px-3 py-1.5 text-xs transition-all duration-200 hover:bg-accent/10"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="space-y-3 text-center">
            <div
              className="h-12 w-12 mx-auto rounded-full border-4 border-[color:var(--surface-panel-border)] border-t-[color:var(--accent)] animate-spin"
            />
            <p style={{ color: "var(--text-muted)" }}>Recherche en cours...</p>
          </div>
        </div>
      )}

      {!isLoading && hasSearched && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {results.length} Résultats trouvés
            </h2>
          </div>

          {results.map((result) => (
            <GlassCard key={result.id} raised className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {result.name}
                      </h3>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {result.position} • {result.club}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    {result.reason}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Badge tone="success">IA Recommandé</Badge>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}>
                    {result.compatibility}%
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Compatibilité
                  </p>
                  <button
                    className="mt-4 rounded-[var(--radius-odin-md)] px-4 py-2 text-sm font-medium transition-all duration-200"
                    style={{ background: "var(--accent)", color: "white" }}
                  >
                    Voir Profil
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-[color:var(--surface-panel-border)]">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${result.compatibility}%`, background: "var(--accent)" }}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <GlassCard raised className="p-12 text-center">
          <p style={{ color: "var(--text-muted)" }}>
            Aucun résultat trouvé. Essayez une autre recherche.
          </p>
        </GlassCard>
      )}

      {!hasSearched && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <GlassCard raised className="p-6">
            <div className="mb-3 text-2xl">🔍</div>
            <h3 className="mb-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              Recherche Intelligente
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Décrivez votre besoin en langage naturel et l'IA trouvera les meilleurs prospects.
            </p>
          </GlassCard>

          <GlassCard raised className="p-6">
            <div className="mb-3 text-2xl">📊</div>
            <h3 className="mb-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              Analyse Profonde
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Chaque résultat inclut une analyse de compatibilité avec votre club.
            </p>
          </GlassCard>

          <GlassCard raised className="p-6">
            <div className="mb-3 text-2xl">⭐</div>
            <h3 className="mb-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              Recommandations
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Découvrez des talents cachés grâce aux algorithmes avancés d'ODIN.
            </p>
          </GlassCard>

          <GlassCard raised className="p-6">
            <div className="mb-3 text-2xl">🚀</div>
            <h3 className="mb-2 font-semibold" style={{ color: "var(--text-primary)" }}>
              Gain de Temps
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Analysez des centaines de joueurs en quelques secondes.
            </p>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
