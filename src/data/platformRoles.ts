import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck, Building2, LayoutDashboard, Dumbbell, Brain, Briefcase, Goal,
  Stethoscope, Radar, Wallet, User,
} from "lucide-react";

export interface PlatformRole {
  id: string;
  email: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}

/** Rôles officiels de la plateforme ODIN ERP (login + Super Admin). */
export const PLATFORM_ROLES: PlatformRole[] = [
  { id: "superadmin", email: "superadmin@club.com", label: "Super Admin", desc: "Plateforme · Clubs · Sécurité", icon: ShieldCheck, color: "#8B5CF6" },
  { id: "adminclub", email: "admin@club.com", label: "Admin Club", desc: "Effectif · Staff · Infrastructures", icon: Building2, color: "#6366F1" },
  { id: "responsable", email: "responsable@club.com", label: "Responsable", desc: "Direction · Vue d'ensemble", icon: LayoutDashboard, color: "#EC4899" },
  { id: "preparateur", email: "preparateur@club.com", label: "Préparateur Physique", desc: "Charge · Condition · Risques", icon: Dumbbell, color: "#EF4444" },
  { id: "analyste", email: "analyste@club.com", label: "Analyste Performance", desc: "Tactique 3D · IA · Patterns", icon: Brain, color: "#06B6D4" },
  { id: "recruteur", email: "recruteur@club.com", label: "Recruteur", desc: "Talents · Négociations · Transferts", icon: Briefcase, color: "#A855F7" },
  { id: "coach", email: "coach@club.com", label: "Coach", desc: "Tactique · Entraînements · Matchs", icon: Goal, color: "#F59E0B" },
  { id: "medical", email: "medecin@club.com", label: "Médecin", desc: "Blessures · Suivi · Rééducation", icon: Stethoscope, color: "#22C55E" },
  { id: "scout", email: "scout@club.com", label: "Scout", desc: "Recherche · Prospects · Rapports", icon: Radar, color: "#3B82F6" },
  { id: "finance", email: "finance@club.com", label: "Finance", desc: "Budget · Salaires · Contrats", icon: Wallet, color: "#EAB308" },
  { id: "joueur", email: "joueur@club.com", label: "Joueur", desc: "Stats · Planning · Profil", icon: User, color: "#84CC16" },
];

export const PLATFORM_ROLE_LABELS = PLATFORM_ROLES.map((r) => r.label);

export const PLATFORM_ROLE_FILTER_OPTIONS = ["Tous", ...PLATFORM_ROLE_LABELS];

/** Rôles visibles sur la page login (accès rapide démo). Super Admin exclu — connexion email/mot de passe uniquement. */
export const LOGIN_QUICK_ROLES: PlatformRole[] = PLATFORM_ROLES.filter(
  (r) => r.id !== "superadmin",
);

/** Répartition indicative pour les graphiques Super Admin. */
export const PLATFORM_ROLES_CHART = [
  { name: "Admin Club", value: 820 },
  { name: "Coach", value: 640 },
  { name: "Responsable", value: 520 },
  { name: "Scout", value: 410 },
  { name: "Finance", value: 380 },
  { name: "Médecin", value: 290 },
  { name: "Préparateur Physique", value: 260 },
  { name: "Analyste Performance", value: 240 },
  { name: "Recruteur", value: 220 },
  { name: "Joueur", value: 680 },
  { name: "Super Admin", value: 12 },
];
