import { ChevronDown, Search, Bell, MessageSquare, Plus, Building2, Users, CreditCard, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { MedicalNotificationsDropdown } from "../medical/MedicalNotificationsDropdown";
import { PrepNotificationsDropdown } from "../preparateur/PrepNotificationsDropdown";
import { JoueurNotificationsDropdown } from "../player/JoueurNotificationsDropdown";
import { getPlayerById } from "../../data/joueurMockData";
import { FinanceNotificationsDropdown } from "../finance/FinanceNotificationsDropdown";
import { ClubNotificationsDropdown } from "../club/ClubNotificationsDropdown";
import { SuperAdminNotificationsDropdown } from "../superadmin/SuperAdminNotificationsDropdown";
import { FinanceGlobalSearch } from "../finance/FinanceGlobalSearch";
import { useClubProfile } from "../../hooks/useClubProfile";
import { ClubLogo } from "../club/ClubLogo";

const JOUEUR_STATIC = ["performances", "medical", "planning", "profil", "ia", "messages"];

const TITLE_BY_PATH: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard Responsable Club", subtitle: "Vue exécutive du club" },
  "/responsable/validation":   { title: "Centre de Validation", subtitle: "Recrutements, contrats et budgets en attente" },
  "/responsable/recrutement":  { title: "Module Recrutement", subtitle: "Prospects, shortlist, agents et rapports scouting" },
  "/responsable/budget":       { title: "Gestion Budget", subtitle: "Budgets par catégorie et approbation des dépenses" },
  "/responsable/staff":        { title: "Gestion Staff", subtitle: "Coaches, médecins, analystes et personnel du club" },
  "/responsable/utilisateurs": { title: "Gestion Utilisateurs", subtitle: "Comptes, rôles et accès au sein du club" },
  "/responsable/parametres":   { title: "Paramètres Club", subtitle: "Général, identité visuelle et sécurité" },
  "/responsable/audit":        { title: "Journal d'Activité", subtitle: "Historique complet des actions — AUDIT_VIEW" },
  "/responsable/notifications": { title: "Centre de Notifications", subtitle: "Contrats, validations, blessures et alertes" },
  "/responsable/documents":    { title: "Gestion Documents", subtitle: "Contrats, rapports, médical et licences PDF" },
  "/players": { title: "Joueurs", subtitle: "" },
  "/teams": { title: "Équipes", subtitle: "Effectifs, staff et classement" },
  "/training": { title: "Entraînements", subtitle: "Présence et organisation des séances" },
  "/matches": { title: "Matchs", subtitle: "Composition, analyse et MVP" },
  "/performance": { title: "Performances", subtitle: "Indicateurs équipe & joueurs" },
  "/recruitment": { title: "Recrutement", subtitle: "Demandes et priorités pour le staff" },
  "/scouting": { title: "Scouting", subtitle: "Prospects et demandes de recrutement" },
  "/scout": { title: "Scout Dashboard", subtitle: "KPIs · Pipeline · Recommandations ODIN" },
  "/scout/search": { title: "Recherche Prospects", subtitle: "Filtres avancés · Profil complet · Watchlist" },
  "/scout/watchlist": { title: "Watchlist", subtitle: "Priorité A/B/C · Notes privées scout" },
  "/scout/recruitment": { title: "Workflow Recrutement", subtitle: "Kanban drag & drop · 5 étapes pipeline" },
  "/scout/ai": { title: "ODIN AI Scout", subtitle: "Recommandation intelligente · Analyse de compatibilité" },
  "/scout/report": { title: "Rapports Scouts", subtitle: "Rapports d'observation et analyses" },
  "/scout/favorites": { title: "Joueurs Favoris", subtitle: "Sélection et comparaison de prospects" },
  "/scout/comparison": { title: "Comparaison Joueurs", subtitle: "Analyse comparative multi-critères" },
  "/coach": { title: "Entraîneur", subtitle: "Tableau de bord de l'entraîneur" },
  "/contracts": { title: "Contrats", subtitle: "Contrats, alertes et renouvellement" },
  "/medical": { title: "Dashboard Médical", subtitle: "Vue synthétique — blessures, récupération et risques" },
  "/medical/dossiers": { title: "Dossiers Médicaux", subtitle: "Fiches joueurs complètes — FIFA Medical Card" },
  "/medical/blessures": { title: "Blessures", subtitle: "Suivi actif des blessures et gravité" },
  "/medical/reeducation": { title: "Rééducation", subtitle: "Board Kanban — phases de récupération" },
  "/medical/rendez-vous": { title: "Rendez-vous", subtitle: "Calendrier médical — consultations, IRM, rééducation" },
  "/medical/documents": { title: "Documents Médicaux", subtitle: "IRM, radios, certificats et analyses" },
  "/medical/rapports": { title: "Rapports Médicaux", subtitle: "Export PDF/Excel — rapports mensuels et joueurs" },
  "/medical/risque": { title: "Joueurs à Risque", subtitle: "Prédiction IA — heatmap et risk score" },
  "/medical/effectif": { title: "Effectif Disponible", subtitle: "Statut disponibilité pour le coach" },
  "/medical/ia": { title: "Medical AI", subtitle: "Assistant médical intelligent" },
  "/joueurs": { title: "Mon Dashboard", subtitle: "Vue personnelle — Ahmed Ben Salah" },
  "/joueurs/performances": { title: "Mes Performances", subtitle: "Radar FIFA, évolution et comparaison équipe" },
  "/joueurs/medical": { title: "Mon Suivi Médical", subtitle: "Statut, blessures et rendez-vous" },
  "/joueurs/planning": { title: "Mon Planning", subtitle: "Matchs, entraînements et repos" },
  "/joueurs/ia": { title: "AI Coach", subtitle: "Assistant personnel intelligent" },
  "/joueurs/profil": { title: "Mon Profil", subtitle: "Informations, contrat et documents" },
  "/club": { title: "Dashboard Club", subtitle: "" },
  "/club/joueurs": { title: "Gestion Joueurs", subtitle: "Effectif, statuts et comparaisons" },
  "/club/staff": { title: "Staff Technique", subtitle: "Coach, médecin, scout et préparateurs" },
  "/club/finances": { title: "Finances Club", subtitle: "Budget, dépenses et revenus" },
  "/club/contrats": { title: "Contrats", subtitle: "Alertes et renouvellements" },
  "/club/calendrier": { title: "Calendrier Club", subtitle: "Matchs, entraînements et réunions" },
  "/club/sante": { title: "Santé Club", subtitle: "Blessures, risques et disponibilité" },
  "/club/infrastructures": { title: "Infrastructures", subtitle: "Terrains, salles et centre médical" },
  "/club/analytics": { title: "Analytics Club", subtitle: "Performance, buteurs et valeur marchande" },
  "/club/ia": { title: "Assistant IA Club", subtitle: "Analyse intelligente du club" },
  "/club/parametres": { title: "Paramètres Club", subtitle: "Général, sécurité et notifications" },
  "/club/utilisateurs": { title: "Gestion Utilisateurs", subtitle: "Membres, rôles et accès du club" },
  "/club/permissions": { title: "Permissions & Rôles", subtitle: "Matrice RBAC des droits d'accès" },
  "/club/audit-logs": { title: "Audit Logs", subtitle: "Historique complet des actions" },
  "/club/notifications": { title: "Notifications", subtitle: "Alertes, contrats, finance et médical" },
  "/preparateur": { title: "Dashboard Préparateur", subtitle: "Hichem Mansouri — FC Carthage" },
  "/preparateur/charge": { title: "Charge d'Entraînement", subtitle: "Suivi charge, fatigue et récupération" },
  "/preparateur/condition": { title: "Condition Physique", subtitle: "Profils FIFA et évolution joueurs" },
  "/preparateur/risques": { title: "Risque Blessures", subtitle: "Heatmap, IA et recommandations coach" },
  "/preparateur/programmes": { title: "Programmes Physiques", subtitle: "Création, affectation et calendrier" },
  "/preparateur/historique": { title: "Historique Séances", subtitle: "Sessions passées et planifiées" },
  "/preparateur/disponibilite": { title: "Disponibilité Match", subtitle: "Fitness, fatigue et readiness joueurs" },
  "/preparateur/rapports": { title: "Rapports Physiques", subtitle: "Historique, export PDF et Excel" },
  "/preparateur/ia": { title: "Assistant IA Préparateur", subtitle: "Analyse charge, fatigue et disponibilité" },
  "/preparateur/seances": { title: "Gestion des Séances", subtitle: "Créer, modifier, supprimer séances · Présence joueurs" },
  "/preparateur/calendrier": { title: "Calendrier", subtitle: "Entraînements, matchs, récupération et programmes" },
  "/preparateur/comparaison": { title: "Comparaison Joueurs", subtitle: "Radar et métriques avancées côte à côte" },
  "/preparateur/wellness": { title: "Wellness Questionnaire", subtitle: "Pré-entraînement — Sommeil, fatigue, stress, humeur" },
  "/preparateur/recovery": { title: "Recovery Center", subtitle: "Cryothérapie, massage, repos et hydratation" },
  "/preparateur/notifications": { title: "Notifications", subtitle: "Blessures, fatigue, validations et alertes" },
  "/analyste": { title: "Performance Intelligence Center", subtitle: "" },
  "/analyste/tactique": { title: "Tactical Simulator", subtitle: "Terrain 3D · Drag & Drop · Métriques IA" },
  "/analyste/replay": { title: "Match Replay Intelligence", subtitle: "Détection auto · Timeline · Jump vidéo" },
  "/analyste/adversaire": { title: "Opponent Intelligence", subtitle: "Plan de match · Heatmap · Faiblesses" },
  "/analyste/blessures": { title: "Injury Prediction Lab", subtitle: "Modèle ML · Probabilités 7/14/30 jours" },
  "/analyste/evolution": { title: "Physical Evolution Lab", subtitle: "Deep Learning · Forecast ML" },
  "/analyste/valeur": { title: "Market Value Predictor", subtitle: "Estimation IA · Projection 3/6 mois" },
  "/analyste/scouting": { title: "Scouting Intelligence", subtitle: "Similarité IA · Top 10 joueurs" },
  "/analyste/patterns": { title: "Deep Learning Insights", subtitle: "Pattern Detection Premium" },
  "/analyste/training": { title: "Training Optimizer", subtitle: "Programme IA · Calendar DnD" },
  "/analyste/video-coach": { title: "AI Video Coach", subtitle: "Summary post-match · Voice AI" },
  "/analyste/executive": { title: "Executive Dashboard", subtitle: "KPIs direction · ROI · Stratégie IA" },
  "/analyste/prediction": { title: "Match Prediction Engine", subtitle: "Random Forest · XGBoost · CatBoost — Ensemble ML" },
  "/analyste/ppi": { title: "Player Performance Index", subtitle: "Score IA global — Profil FIFA · Évolution · Ranking" },
  "/analyste/chemistry": { title: "Team Chemistry Analysis", subtitle: "Graphe relationnel · Chimie par duo · Recommandations" },
  "/analyste/transfer": { title: "Transfer Recommendation Engine", subtitle: "Compatibilité IA · Gain xG · Budget estimé" },
  "/analyste/injury-forecast": { title: "Injury Recovery Forecast", subtitle: "Protocole rééducation · Retour estimé · Risque rechute" },
  "/analyste/live-match": { title: "Live Match Dashboard", subtitle: "Temps réel · Win probability · Fatigue · Substitutions IA" },
  "/analyste/fatigue-heatmap": { title: "Fatigue Heatmap", subtitle: "Par tranche 15min · Effondrement physique · Actions & Erreurs" },
  "/analyste/viiv": { title: "Viiv Smartwatch Hub", subtitle: "Montre 3D · Recovery · Énergie · HRV · SpO₂ · GPS · Sync joueurs" },
  "/analyste/whoop": { title: "Viiv Smartwatch Hub", subtitle: "Montre 3D · Recovery · Énergie · HRV · SpO₂ · GPS · Sync joueurs" },
  "/analyste/video-analysis": { title: "Video Analysis Pro", subtitle: "Upload · Vitesse km/h · Sprints · OpenAI Vision · Claude Coach" },
  "/recruteur": { title: "Dashboard Recruteur", subtitle: "Karim Belaïd — Cellule de recrutement" },
  "/recruteur/discovery": { title: "Talent Discovery", subtitle: "Filtres avancés · Score IA · Base mondiale" },
  "/recruteur/shortlist": { title: "Shortlist", subtitle: "Cibles prioritaires et suivi" },
  "/recruteur/ai": { title: "AI Recruitment", subtitle: "Recherche intelligente par critères" },
  "/recruteur/video": { title: "Video Scouting", subtitle: "Analyse vidéo IA · Timeline · Heatmap" },
  "/recruteur/compare": { title: "Player Compare", subtitle: "Comparaison split-screen · Radar" },
  "/recruteur/market": { title: "Market Value", subtitle: "Valeur, historique et prévision IA" },
  "/recruteur/negotiations": { title: "Negotiations", subtitle: "Pipeline Kanban des transferts" },
  "/recruteur/contracts": { title: "Contracts", subtitle: "Génération et conseil IA" },
  "/recruteur/transfers": { title: "Transfer Center", subtitle: "Offres, statuts et budget" },
  "/recruteur/requests": { title: "Requests & Validation", subtitle: "Workflow Scout → Responsable" },
  "/recruteur/reports": { title: "Reports", subtitle: "Export PDF · Excel · PowerPoint" },
  "/recruteur/scouts": { title: "Gestion Scouts", subtitle: "Liste · Zones géographiques · Performance" },
  "/recruteur/agents": { title: "Gestion Agents", subtitle: "Contacts · Joueurs représentés · Négociations" },
  "/recruteur/pipeline": { title: "Talent Pipeline", subtitle: "Kanban: Détecté → Analysé → Shortlist → Offre → Transfert" },
  "/recruteur/calendar": { title: "Calendrier Recrutement", subtitle: "Matchs à observer · RDV agents · Signatures" },
  "/recruteur/notifications": { title: "Notifications Recrutement", subtitle: "Offres · Contrats · Talents · Budget" },
  "/recruteur/audit": { title: "Journal d'Audit", subtitle: "Traçabilité complète des actions recrutement" },
  "/coach": { title: "Dashboard Coach", subtitle: "Vue générale · Effectif · Prochains matchs" },
  "/coach/effectif": { title: "Effectif / Squad", subtitle: "Liste joueurs · Forme · Fatigue · Blessures · Contrats" },
  "/coach/lineup": { title: "Composition d'Équipe", subtitle: "Lineup builder · Formations · Titulaires · Remplaçants" },
  "/coach/medical": { title: "Centre Médical", subtitle: "Blessures · Retours · Fatigue · Disponibilités" },
  "/coach/attendance": { title: "Présence Joueurs", subtitle: "Présent · Absent · Retard · Séances" },
  "/coach/training-builder": { title: "Training Builder", subtitle: "Créer et planifier les séances d'entraînement" },
  "/coach/tactical": { title: "Tableau Tactique", subtitle: "Positions · Mouvements · Pressing · Séquences" },
  "/coach/match-analysis": { title: "Analyse de Match", subtitle: "Avant · Pendant · Après — Vue complète" },
  "/coach/ai": { title: "ODIN AI Coach", subtitle: "Assistant IA · Recommandations tactiques & effectif" },
  "/coach/opponent": { title: "Analyse Adversaire", subtitle: "Forces · Faiblesses · Joueurs clés · Stratégie" },
  "/finance": { title: "Finance", subtitle: "Budget, revenus et dépenses" },
  "/reports": { title: "Rapports", subtitle: "Rapports sportifs, financiers et recrutement" },
  "/messages": { title: "Messages", subtitle: "Communication interne du club" },
  "/odin-ai": { title: "ODIN AI", subtitle: "Analyses intelligentes et prévisions" },
  "/administration/documents": { title: "Administration documentaire", subtitle: "Archivage et pièces de support" },
  "/superadmin/dashboard": { title: "Super Admin Dashboard", subtitle: "Vue globale de la plateforme SaaS" },
  "/superadmin/clubs": { title: "Clubs", subtitle: "Gestion des clubs et abonnements" },
  "/superadmin/users": { title: "Utilisateurs", subtitle: "Gestion des comptes et permissions" },
  "/superadmin/payments": { title: "Paiements", subtitle: "Suivi des factures et transactions" },
  "/superadmin/bi": { title: "Business Intelligence", subtitle: "Prévisions et recommandations IA" },
  "/superadmin/revenue-analytics": { title: "Revenue Analytics", subtitle: "MRR, ARR et churn" },
  "/superadmin/subscriptions": { title: "Abonnements", subtitle: "Revue des plans SaaS" },
  "/superadmin/analytics": { title: "Analytics", subtitle: "Tendances SaaS et performance" },
  "/superadmin/support": { title: "Support", subtitle: "Tickets et assistance" },
  "/superadmin/security": { title: "Sécurité", subtitle: "Risques et contrôles d'accès" },
  "/superadmin/settings": { title: "Paramètres", subtitle: "Configuration de la plateforme" },
  "/superadmin/ia": { title: "IA Admin", subtitle: "Supervision des services IA" },
};

/* ─── Super Admin Global Search ────────────────────────────────── */
const SA_SEARCH_DATA = [
  { category: "Clubs", items: ["FC Carthage — Enterprise — Actif", "ES Sahel — Pro — Actif", "CS Sfaxien — Starter — Suspendu"] },
  { category: "Utilisateurs", items: ["Amine Mansour — Coach — FC Carthage", "Sarra Belhaj — Responsable — ES Sahel"] },
  { category: "Abonnements", items: ["Enterprise Plan — 20 400 DT/mois", "Pro Plan — 15 000 DT/mois"] },
  { category: "Paiements", items: ["PAY-001 — 20 400 DT — Payé", "PAY-003 — 20 400 DT — En retard"] },
  { category: "Logs", items: ["Connexion suspecte — IP 192.168.1.200", "Brute force détecté — 28 tentatives"] },
];

const CATEGORY_COLORS: Record<string, string> = {
  Clubs: "#3B82F6",
  Utilisateurs: "#10B981",
  Abonnements: "#8B5CF6",
  Paiements: "#FF7A00",
  Logs: "#EF4444",
};

function SuperAdminGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? SA_SEARCH_DATA
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((cat) => cat.items.length > 0)
    : SA_SEARCH_DATA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2 transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "rgba(255,255,255,0.08)",
          boxShadow: open ? "0 0 0 2px rgba(255,122,0,0.1)" : "none",
          width: open ? 280 : 220,
          transition: "all 0.25s ease",
        }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher clubs, users, paiements..."
          className="w-full bg-transparent text-xs outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setQuery(""); }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border p-3 shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <p className="mb-2 px-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {query ? `Résultats pour "${query}"` : "Recherche rapide"}
            </p>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {results.map((cat) => (
                <div key={cat.category}>
                  <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: CATEGORY_COLORS[cat.category] }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_COLORS[cat.category] }} />
                    {cat.category}
                  </p>
                  {cat.items.map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                      whileHover={{ background: "rgba(255,122,0,0.08)", color: "#FF7A00", x: 2 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setOpen(false)}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun résultat</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Super Admin Quick Actions ─────────────────────────────────── */
function SuperAdminQuickActions() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const actions = [
    { icon: Building2, label: "Nouveau Club", color: "#3B82F6", path: "/superadmin/clubs", stateKey: "openCreate" },
    { icon: Users, label: "Nouvel Utilisateur", color: "#10B981", path: "/superadmin/users", stateKey: "openCreate" },
    { icon: CreditCard, label: "Abonnement", color: "#FF7A00", path: "/superadmin/payments", stateKey: "openForm" },
  ] as const;

  function handleAction(path: string, stateKey: string) {
    setOpen(false);
    navigate(path, { state: { [stateKey]: true } });
  }

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border"
        style={{
          background: open ? "linear-gradient(135deg,#FF7A00,#E66000)" : "rgba(255,122,0,0.12)",
          borderColor: "rgba(255,122,0,0.3)",
          color: open ? "white" : "#FF7A00",
          boxShadow: open ? "0 0 20px rgba(255,122,0,0.4)" : "none",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border p-2 shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <p className="mb-1.5 px-2 text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Créer</p>
            {actions.map(({ icon: Icon, label, color, path, stateKey }, i) => (
              <motion.button
                key={label}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ background: `${color}14`, color }}
                onClick={() => handleAction(path, stateKey)}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${color}1f` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Responsable Global Search ─────────────────────────────────── */
const RESP_SEARCH_DATA = [
  {
    category: "Joueurs", color: "#3B82F6",
    items: [
      "Yassine Brahmi — Attaquant — Actif",
      "Karim Sassi — Milieu — Blessé",
      "Walid Hammami — Défenseur — Actif",
      "Ahmed Ben Salah — Gardien — Actif",
      "Karim Gharbi — Milieu — Suspendu",
    ],
  },
  {
    category: "Contrats", color: "#FF7A00",
    items: [
      "Contrat Yassine Brahmi — Expire 12/05/2027 — 18 000 DT",
      "Contrat Karim Sassi — Expire 30/06/2028 — 14 000 DT",
      "Contrat Walid Hammami — ⚠ Expire dans 30 jours",
    ],
  },
  {
    category: "Documents", color: "#8B5CF6",
    items: [
      "Licence FTF Karim Gharbi — Valide",
      "Contrat PDF Ahmed Ben Salah — 2025",
      "Rapport Scouting Youssef Ben Ali — 15/06",
      "Certificat Médical — Ines Mejri",
    ],
  },
  {
    category: "Staff", color: "#22C55E",
    items: [
      "Sonia Baccouche — Coach Équipe 1ère",
      "Ines Mejri — Médecin Staff médical",
      "Tarek Bouzid — Scout Recrutement",
      "Rami Ben Slimane — Analyste Data",
    ],
  },
  {
    category: "Validation", color: "#F59E0B",
    items: [
      "Recrutement Youssef Ben Ali — En attente",
      "Renouvellement contrat Ahmed BS — En attente",
      "Achat équipement médical 18 500 DT — En attente",
    ],
  },
];

function ResponsableGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? RESP_SEARCH_DATA
        .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())) }))
        .filter((cat) => cat.items.length > 0)
    : RESP_SEARCH_DATA;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, []);

  const ROUTE_MAP: Record<string, string> = {
    Joueurs: "/players", Contrats: "/contracts", Documents: "/responsable/documents",
    Staff: "/responsable/staff", Validation: "/responsable/validation",
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <motion.div
        className="flex cursor-text items-center gap-2 rounded-xl border px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: open ? "rgba(255,122,0,0.45)" : "rgba(255,255,255,0.08)",
          boxShadow: open ? "0 0 0 2px rgba(255,122,0,0.1)" : "none",
        }}
        animate={{ width: open ? 300 : 230 }}
        transition={{ duration: 0.22 }}
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
      >
        <Search size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Joueurs, contrats, staff… ⌘K"
          className="w-full bg-transparent text-xs outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setQuery(""); }}>
            <X size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              background: "var(--surface-modal)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(255,122,0,0.06)",
            }}
          >
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {query ? `Résultats pour "${query}"` : "Recherche globale — Joueurs, Contrats, Documents, Staff"}
              </p>
            </div>
            <div className="max-h-80 space-y-1 overflow-y-auto p-2">
              {results.map((cat) => (
                <div key={cat.category} className="mb-3">
                  <button
                    type="button"
                    onClick={() => { navigate(ROUTE_MAP[cat.category] ?? "/dashboard"); setOpen(false); }}
                    className="mb-1.5 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left"
                    style={{ color: cat.color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{cat.category}</span>
                    <span className="ml-auto text-[10px] opacity-50">→ Voir tout</span>
                  </button>
                  {cat.items.map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs"
                      style={{ color: "var(--text-secondary)" }}
                      whileHover={{ background: `${cat.color}10`, color: cat.color, x: 3 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => { navigate(ROUTE_MAP[cat.category] ?? "/dashboard"); setOpen(false); setQuery(""); }}
                    >
                      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: `${cat.color}60` }} />
                      {item}
                    </motion.button>
                  ))}
                </div>
              ))}
              {results.length === 0 && (
                <p className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun résultat pour "{query}"</p>
              )}
            </div>
            <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>↵</kbd> Naviguer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>Esc</kbd> Fermer</span>
                <span><kbd className="rounded px-1 py-0.5" style={{ background: "var(--surface-input)" }}>⌘K</kbd> Ouvrir</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Topbar ───────────────────────────────────────────────── */
export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adminName, clubName, season, logoUrl } = useClubProfile();
  const { t, locale } = useLocale();
  const isMedical = user?.role === "medical";
  const isJoueur = user?.role === "joueur";
  const isPreparateur = user?.role === "preparateur";
  const isSuperAdmin = location.pathname.startsWith("/superadmin") || user?.role === "superadmin";
  const isResponsable = user?.role === "responsable";
  const isFinance = user?.role === "finance" || location.pathname.startsWith("/finance");
  const isClubAdmin = user?.role === "adminclub";

  const profileMatch = location.pathname.match(/^\/joueurs\/([^/]+)$/);
  const profileId = profileMatch?.[1];
  const isProfilePage = profileId && !JOUEUR_STATIC.includes(profileId);
  const profilePlayer = isProfilePage && profileId ? getPlayerById(profileId) : null;
  const currentPlayer = isJoueur ? getPlayerById(user?.playerId ?? "1") : null;

  const joueurTitles: Record<string, { title: string; subtitle: string }> = {
    "/joueurs": {
      title: t.nav.dashboard,
      subtitle:
        locale === "ar"
          ? `عرض شخصي — ${currentPlayer?.name ?? "لاعب"}`
          : locale === "en"
            ? `Personal view — ${currentPlayer?.name ?? "Player"}`
            : `Vue personnelle — ${currentPlayer?.name ?? "Joueur"}`,
    },
    "/joueurs/performances": {
      title: t.nav.performances,
      subtitle:
        locale === "ar"
          ? "رادار FIFA والتطور ومقارنة الفريق"
          : locale === "en"
            ? "FIFA radar, progression and team comparison"
            : "Radar FIFA, évolution et comparaison équipe",
    },
    "/joueurs/medical": {
      title: t.nav.medical,
      subtitle:
        locale === "ar"
          ? "الحالة والإصابات والمواعيد"
          : locale === "en"
            ? "Status, injuries and appointments"
            : "Statut, blessures et rendez-vous",
    },
    "/joueurs/planning": {
      title: t.nav.planning,
      subtitle:
        locale === "ar"
          ? "مباريات وتدريبات وراحة"
          : locale === "en"
            ? "Matches, training and rest"
            : "Matchs, entraînements et repos",
    },
    "/joueurs/ia": {
      title: t.nav.aiCoach,
      subtitle:
        locale === "ar"
          ? "مساعد شخصي ذكي"
          : locale === "en"
            ? "Personal intelligent assistant"
            : "Assistant personnel intelligent",
    },
    "/joueurs/profil": {
      title: t.nav.profile,
      subtitle: currentPlayer?.name ?? (locale === "ar" ? "ملف اللاعب" : locale === "en" ? "Player profile" : "Profil joueur"),
    },
    "/messages": {
      title: t.nav.messages,
      subtitle:
        locale === "ar"
          ? "التواصل الداخلي للنادي"
          : locale === "en"
            ? "Internal club communication"
            : "Communication interne du club",
    },
  };

  const prepFicheMatch = location.pathname.match(/^\/preparateur\/fiche\/(.+)$/);
  const prepFicheTitle = prepFicheMatch
    ? { title: "Fiche Joueur", subtitle: "Profil complet — charge, fatigue, blessures & KPI avancés" }
    : null;

  const recruteurPlayerMatch = location.pathname.match(/^\/recruteur\/player\/(.+)$/);
  const recruteurPlayerTitle = recruteurPlayerMatch
    ? { title: "Profil Joueur", subtitle: "Informations · Stats · Valeur marchande · Risque blessure" }
    : null;

  const coachPlayerMatch = location.pathname.match(/^\/coach\/player\/(.+)$/);
  const coachPlayerTitle = coachPlayerMatch
    ? { title: "Fiche Joueur", subtitle: "Performance · Médical · Historique · IA Coach" }
    : null;

  const scoutProspectMatch = location.pathname.match(/^\/scout\/prospect\/(.+)$/);
  const scoutProspectTitle = scoutProspectMatch
    ? { title: "Fiche Prospect", subtitle: "Performance · Heatmap · Historique · Notes · Vidéo" }
    : null;

  const current = (scoutProspectTitle ?? coachPlayerTitle ?? recruteurPlayerTitle ?? prepFicheTitle
    ?? (isProfilePage && profilePlayer
      ? { title: profilePlayer.name, subtitle: `${profilePlayer.position} • OVR ${profilePlayer.ovr} • ${profilePlayer.marketValue}` }
      : isJoueur && joueurTitles[location.pathname]
        ? joueurTitles[location.pathname]
        : TITLE_BY_PATH[location.pathname]))
    ?? TITLE_BY_PATH["/dashboard"];

  const clubSubtitle = `Bonjour ${adminName} — ${clubName}, Saison ${season}`;
  const pageMeta = isClubAdmin && location.pathname.startsWith("/club")
    ? {
        title: current.title,
        subtitle: location.pathname === "/club"
          ? clubSubtitle
          : `${clubName} · Saison ${season}`,
      }
    : location.pathname.startsWith("/analyste")
      ? {
          title: current.title,
          subtitle: location.pathname === "/analyste"
            ? `${adminName} — ${clubName}`
            : current.subtitle,
        }
      : current;

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5">
      {location.pathname !== "/players" && (
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {pageMeta.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {pageMeta.subtitle}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {isSuperAdmin ? (
          <SuperAdminGlobalSearch />
        ) : isResponsable ? (
          <ResponsableGlobalSearch />
        ) : isFinance ? (
          <FinanceGlobalSearch />
        ) : !isJoueur && (
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
        )}

        {isSuperAdmin && <SuperAdminQuickActions />}

        {isMedical ? (
          <MedicalNotificationsDropdown />
        ) : isSuperAdmin ? (
          <SuperAdminNotificationsDropdown />
        ) : isJoueur ? (
          <JoueurNotificationsDropdown />
        ) : isPreparateur ? (
          <PrepNotificationsDropdown />
        ) : isFinance ? (
          <FinanceNotificationsDropdown />
        ) : isClubAdmin ? (
          <ClubNotificationsDropdown />
        ) : (
          <button
            type="button"
            className="glass-input relative flex h-10 w-10 items-center justify-center"
            onClick={() => {
              const path =
                user?.role === "responsable" ? "/responsable/notifications"
                : user?.role === "recruteur" ? "/recruteur/notifications"
                : null;
              if (path) navigate(path);
            }}
          >
            <Bell size={16} style={{ color: "var(--text-secondary)" }} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          </button>
        )}

        {(isMedical || isJoueur) && (
          <button
            type="button"
            onClick={() => navigate("/messages")}
            className="glass-input relative flex h-10 w-10 items-center justify-center"
          >
            <MessageSquare size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        )}

        <button className="glass-input flex items-center gap-2 py-2 pl-2 pr-3">
          {isSuperAdmin ? (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              SA
            </div>
          ) : isClubAdmin ? (
            <ClubLogo name={clubName} logoUrl={logoUrl} size="xs" />
          ) : (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {(user?.fullName ?? user?.email ?? "U").slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {isSuperAdmin
              ? (user?.fullName ?? "Super Admin")
              : isClubAdmin
                ? clubName
                : (user?.fullName ?? "Utilisateur")}
          </span>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

      </div>
    </header>
  );
}
