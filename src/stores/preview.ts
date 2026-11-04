import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storage } from "./storage";
type Saved = { device: "desktop" | "tablet" | "phone" };
export function readSaved(value: unknown): Saved | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 1) return;
  if (
    record.device === "desktop" ||
    record.device === "tablet" ||
    record.device === "phone"
  )
    return { device: record.device };
}
export const usePreviewStore = create<
  Saved & { setDevice: (device: Saved["device"]) => void }
>()(
  persist(
    (set) => ({ device: "desktop", setDevice: (device) => set({ device }) }),
    {
      name: "th-preview",
      version: 1,
      storage: storage<Saved>(),
      skipHydration: true,
      partialize: (s) => ({ device: s.device }),
      migrate: (value) => {
        return readSaved(value) ?? { device: "desktop" as const };
      },
      merge: (value, current) => {
        const saved = readSaved(value);
        return saved ? { ...current, ...saved } : current;
      },
    },
  ),
);

// Both preview islands share one hydration attempt, including storage failures.
let hydration: Promise<void> | undefined;
export function hydratePreview(): Promise<void> {
  return (hydration ??= (async () => {
    try {
      await usePreviewStore.persist?.rehydrate();
    } catch {
      /* Keep the in-memory desktop default if storage is unavailable. */
    }
  })());
}
