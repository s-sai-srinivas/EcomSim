import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistLine {
  productId: string;
  addedAt: number;
}

interface WishlistState {
  lines: WishlistLine[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId) =>
        set((s) =>
          s.lines.some((l) => l.productId === productId)
            ? s
            : { lines: [...s.lines, { productId, addedAt: Date.now() }] },
        ),
      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      has: (productId) => get().lines.some((l) => l.productId === productId),
      clear: () => set({ lines: [] }),
    }),
    { name: "ecosim-wishlist" },
  ),
);
