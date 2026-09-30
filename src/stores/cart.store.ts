import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
}

/**
 * Client-side cart mirror (Phase 00 skeleton).
 * Phase 05 syncs this to the server-backed cart per user/anon session.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          return existing
            ? {
                lines: s.lines.map((l) =>
                  l.productId === productId ? { ...l, qty: l.qty + qty } : l,
                ),
              }
            : { lines: [...s.lines, { productId, qty }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),
      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((acc, l) => acc + l.qty, 0),
    }),
    { name: "ecosim-cart" },
  ),
);
