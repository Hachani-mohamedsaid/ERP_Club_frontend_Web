import { ChevronDown, Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";

const TITLE_BY_PATH: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard Responsable Club", subtitle: "Vue exécutive du club" },
  "/players": { title: "Joueurs", subtitle: "" },
  "/teams": { title: "Équipes", subtitle: "Effectifs, staff et classement" },
  "/training": { title: "Entraînements", subtitle: "Présence et organisation des séances" },
  "/matches": { title: "Matchs", subtitle: "Composition, analyse et MVP" },
  "/performance": { title: "Performances", subtitle: "Indicateurs équipe & joueurs" },
  "/recruitment": { title: "Recrutement", subtitle: "Demandes et priorités pour le staff" },
  "/scouting": { title: "Scouting", subtitle: "Prospects et demandes de recrutement" },
  "/scout": { title: "Scout Dashboard", subtitle: "Tableau de bord scout avec analyse de prospects" },
  "/coach": { title: "Entraîneur", subtitle: "Tableau de bord de l'entraîneur" },
  "/contracts": { title: "Contrats", subtitle: "Contrats, alertes et renouvellement" },
  "/medical": { title: "Médical", subtitle: "Vue synthétique sans dossier médical détaillé" },
  "/finance": { title: "Finance", subtitle: "Budget, revenus et dépenses" },
  "/reports": { title: "Rapports", subtitle: "Rapports sportifs, financiers et recrutement" },
  "/messages": { title: "Messages", subtitle: "Communication interne du club" },
  "/odin-ai": { title: "ODIN AI", subtitle: "Analyses intelligentes et prévisions" },
  "/administration/documents": { title: "Administration documentaire", subtitle: "Archivage et pièces de support" },
};

export function Topbar() {
  const location = useLocation();
  const current = TITLE_BY_PATH[location.pathname] ?? TITLE_BY_PATH["/dashboard"];

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5">
      {location.pathname !== "/players" && (
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {current.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {current.subtitle}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Rechercher un joueur, un contrat, un prospect..."
            className="glass-input w-64 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <button className="glass-input relative flex h-10 w-10 items-center justify-center">
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </button>

        <button className="glass-input flex items-center gap-2 py-2 pl-2 pr-3">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            FC
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            FC Carthage
          </span>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
