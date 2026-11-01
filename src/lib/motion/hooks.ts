/**
 * Purpose: SSR-safe media-query hooks (server snapshot is always false, so hydration never mismatches).
 * useReduced: user prefers reduced motion. useFinePointer: mouse/trackpad with hover (gate for cursor, tilt, magnetic).
 * Used by: every motion component. Client-only.
 */
import { useSyncExternalStore } from "react";

function mediaQuery(query: string) {
  return {
    subscribe(callback: () => void) {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const reducedQuery = mediaQuery("(prefers-reduced-motion: reduce)");
const fineQuery = mediaQuery("(hover: hover) and (pointer: fine)");

export function useReduced(): boolean {
  return useSyncExternalStore(reducedQuery.subscribe, reducedQuery.get, () => false);
}

export function useFinePointer(): boolean {
  return useSyncExternalStore(fineQuery.subscribe, fineQuery.get, () => false);
}
