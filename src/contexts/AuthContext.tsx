import React, { createContext, useContext, useState } from "react";

/* eslint-disable react-refresh/only-export-components */

type Role = "responsable" | "coach" | "scout" | "medical" | "finance" | "superadmin" | "adminclub" | "joueur" | "guest";

interface User {
  email: string;
  role: Role;
  playerId?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string) => Role;
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
  "joueur@club.com": "joueur",
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser());
  const [loading] = useState(false);

  function login(email: string) {
    const normalized = email.toLowerCase();
    const role = ROLE_MAP[normalized] ?? "responsable";
    const playerId = PLAYER_ID_MAP[normalized];
    const u = { email, role, ...(playerId ? { playerId } : {}) } as User;
    setUser(u);
    localStorage.setItem("odin_user", JSON.stringify(u));
    return role;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("odin_user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
