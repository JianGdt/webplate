import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";
import { storage } from "./storage";
export const CartSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).max(64),
            qty: z.number().int().min(1).max(99),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();
type Saved = z.infer<typeof CartSchema>;
type Cart = Saved & {
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};
export const useCartStore = create<Cart>()(
  persist(
    (set) => ({
      items: [],
      add: (id) =>
        set((s) => {
          if (!z.string().trim().min(1).max(64).safeParse(id).success) return s;
          const exists = s.items.some((i) => i.id === id);
          return {
            items: exists
              ? s.items.map((i) =>
                  i.id === id ? { ...i, qty: Math.min(i.qty + 1, 99) } : i,
                )
              : s.items.length < 100
                ? [...s.items, { id, qty: 1 }]
                : s.items,
          };
        }),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "th-cart",
      version: 1,
      skipHydration: true,
      storage: storage<Saved>(),
      partialize: (s) => ({ items: s.items }),
      migrate: (value) => {
        const p = CartSchema.safeParse(value);
        return p.success ? p.data : { items: [] };
      },
      merge: (value, current) => {
        const p = CartSchema.safeParse(value);
        return p.success ? { ...current, ...p.data } : current;
      },
    },
  ),
);
export const selectCartCount = (s: Saved) =>
  s.items.reduce((n, i) => n + i.qty, 0);
