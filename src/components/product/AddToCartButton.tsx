"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";

export function AddToCartButton({ productId }: { productId: string }) {
  const add = useCartStore((s) => s.add);
  const router = useRouter();
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => {
          add(productId, 1);
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="h-[33px] w-full rounded-full bg-cta-yellow text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00] active:translate-y-px"
      >
        {added ? "✓ Added to Cart" : "Add to Cart"}
      </button>
      <button
        type="button"
        onClick={() => {
          add(productId, 1);
          router.push("/checkout");
        }}
        className="h-[33px] w-full rounded-full bg-cta-orange text-[13px] font-medium text-[#0F1111] hover:bg-[#FA8900] active:translate-y-px"
      >
        Buy Now
      </button>
    </div>
  );
}
