import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Ouvre un panneau/modal quand la navigation passe `state[key]: true` (ex. menu Créer). */
export function useOpenFromNavState(key: string, onOpen: () => void) {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as Record<string, boolean> | null;
    if (state?.[key]) {
      onOpen();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, key, onOpen]);
}
