import React, { createContext, useContext, useEffect, useState } from "react";

type Role = "responsable" | "coach" | "scout" | "guest";

interface User {
  email: string;
  role: Role;
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
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("odin_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  function login(email: string) {
    const role = ROLE_MAP[email.toLowerCase()] ?? "responsable";
    const u = { email, role } as User;
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
