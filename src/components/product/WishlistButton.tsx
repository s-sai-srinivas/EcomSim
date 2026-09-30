"use client";

import { useWishlistStore } from "@/stores/wishlist.store";

export function WishlistButton({ productId }: { productId: string }) {
  const has = useWishlistStore((s) => s.lines.some((l) => l.productId === productId));
  const add = useWishlistStore((s) => s.add);
  const remove = useWishlistStore((s) => s.remove);

  return (
    <button
      type="button"
      onClick={() => (has ? remove(productId) : add(productId))}
      className={`h-[31px] w-full rounded-[8px] border text-[13px] ${
        has
          ? "border-[#E77600] bg-[#FFF8F0] text-[#E77600]"
          : "border-[#D5D9D9] bg-white text-[#0F1111] hover:bg-[#F7FAFA]"
      }`}
    >
      {has ? "♥ Added to Wish List" : "Add to Wish List"}
    </button>
  );
}
