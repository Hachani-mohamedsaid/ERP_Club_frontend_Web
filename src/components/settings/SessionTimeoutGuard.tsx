import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

export function SessionTimeoutGuard() {
  const { user, logout } = useAuth();
  const { preferences } = useUserPreferences();
  const lastActivityRef = useRef(Date.now());
  const timeout = preferences.sessionTimeoutMinutes;

  useEffect(() => {
    if (!user || timeout === 0) return;

    const touch = () => {
      lastActivityRef.current = Date.now();
    };

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, touch, { passive: true });
    }

    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= timeout * 60_000) {
        logout();
        window.location.href = "/login";
      }
    }, 30_000);

    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, touch);
      }
      window.clearInterval(interval);
    };
  }, [user, timeout, logout]);

  return null;
}
