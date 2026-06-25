import { useSyncExternalStore } from "react";

interface RecruteurState {
  shortlist: string[];
  compare: string[];
}

let state: RecruteurState = { shortlist: ["sp1", "sp3"], compare: ["sp1", "sp4"] };
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function toggleShortlist(id: string) {
  state.shortlist = state.shortlist.includes(id)
    ? state.shortlist.filter((x) => x !== id)
    : [...state.shortlist, id];
  emit();
}

export function toggleCompare(id: string) {
  if (state.compare.includes(id)) {
    state.compare = state.compare.filter((x) => x !== id);
  } else {
    state.compare = [...state.compare, id].slice(-2);
  }
  emit();
}

export function setCompare(ids: string[]) {
  state.compare = ids.slice(0, 2);
  emit();
}

export function useRecruteurStore() {
  return useSyncExternalStore(subscribe, () => state);
}
