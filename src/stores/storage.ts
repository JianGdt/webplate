import { createJSONStorage } from "zustand/middleware";
export function storage<T>() {
  if (typeof window === "undefined") return undefined;
  try {
    return createJSONStorage<T>(() => window.localStorage);
  } catch {
    return undefined;
  }
}
