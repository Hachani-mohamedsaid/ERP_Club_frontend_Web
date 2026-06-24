import React, { createContext, useContext, useState } from "react";
import { loginUser } from "../lib/api/login";
import { setAccessToken } from "../lib/api/authHeaders";

/* eslint-disable react-refresh/only-export-components */

type Role = "responsable" | "coach" | "scout" | "medical" | "finance" | "superadmin" | "adminclub" | "preparateur" | "analyste" | "recruteur" | "joueur" | "guest";

interface OrganizationInfo {
  id: string;
  clubName: string;
  country: string;
  league: string;
  logoUrl: string | null;
}

interface User {
  id?: string;
  email: string;
  fullName?: string;
  role: Role;
  playerId?: string;
  organization?: OrganizationInfo | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<Role>;
  loginDemo: (email: string) => Role;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ROLE_MAP: Record<string, Role> = {
  "coach@club.com": "coach",
  "responsable@club.com": "responsable",
  "scout@club.com": "scout",
  "medecin@club.com": "medical",
  "finance@club.com": "finance",
  "superadmin@club.com": "superadmin",
  "admin@club.com": "adminclub",
  "preparateur@club.com": "preparateur",
  "analyste@club.com": "analyste",
  "recruteur@club.com": "recruteur",
  "joueur@club.com": "joueur",
};

const BACKEND_ROLE_MAP: Record<string, Role> = {
  ADMIN_CLUB: "adminclub",
  SUPER_ADMIN: "superadmin",
};

const PLAYER_ID_MAP: Record<string, string> = {
  "joueur@club.com": "1",
};

function getInitialUser(): User | null {
  try {
    const raw = localStorage.getItem("odin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User) {
  localStorage.setItem("odin_user", JSON.stringify(user));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser());
  const [loading] = useState(false);

  async function loginWithCredentials(email: string, password: string): Promise<Role> {
    const res = await loginUser(email, password);
    setAccessToken(res.accessToken);
    const role = BACKEND_ROLE_MAP[res.user.role] ?? "adminclub";
    const u: User = {
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.fullName,
      role,
      organization: res.organization,
    };
    setUser(u);
    persistUser(u);
    return role;
  }

  function loginDemo(email: string): Role {
    const normalized = email.toLowerCase();
    const role = ROLE_MAP[normalized] ?? "responsable";
    const playerId = PLAYER_ID_MAP[normalized];
    const u = { email, role, ...(playerId ? { playerId } : {}) } as User;
    setUser(u);
    persistUser(u);
    return role;
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("odin_user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithCredentials, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { Role, User };
