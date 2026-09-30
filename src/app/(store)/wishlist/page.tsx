"use client";

/* eslint-disable react-hooks/set-state-in-effect -- wishlist batch fetch intentionally updates state after mount */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useCartStore } from "@/stores/cart.store";
import { formatINR } from "@/lib/utils/money";

interface ProductLite {
  id: string;
  asin: string | null;
  title: string;
  images: string[];
  salePrice: number;
  listPrice: number;
}

export default function WishlistPage() {
  const lines = useWishlistStore((s) => s.lines);
  const remove = useWishlistStore((s) => s.remove);
  const addToCart = useCartStore((s) => s.add);
  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [loading, setLoading] = useState(false);

  const idsKey = lines.map((l) => l.productId).join(",");

  const fetchProducts = useCallback(async () => {
    if (lines.length === 0) {
      setProducts({});
      return;
    }
    setLoading(true);
    try {
      const ids = lines.map((l) => l.productId);
      const res = await fetch("/api/products/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const json = await res.json();
      const map: Record<string, ProductLite> = {};
      for (const p of json.data ?? []) {
        map[p.id] = p;
        if (p.asin) map[p.asin] = p;
      }
      setProducts(map);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  // wishlist data fetch — intentionally triggers state updates after mount
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="bg-[#EAEDED] px-5 py-4">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex items-baseline gap-2">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Wish List</h1>
          <span className="text-[14px] text-[#565959]">({lines.length} items)</span>
          <Link href="/" className="ml-auto text-[13px] text-[#007185] hover:text-[#C7511F]">
            Continue shopping
          </Link>
        </div>

        <div className="bg-white p-5">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[18px] text-[#0F1111]">Your Wish List is empty</p>
              <p className="mt-2 text-[14px] text-[#565959]">
                Save items you want to buy later. Look for &ldquo;Add to List&rdquo; on product pages.
              </p>
              <Link
                href="/s"
                className="mt-4 inline-block rounded-[8px] bg-cta-yellow px-6 py-2 text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
              >
                Continue shopping
              </Link>
            </div>
          ) : loading && Object.keys(products).length === 0 ? (
            <p className="py-10 text-center text-[14px] text-[#565959]">Loading…</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {lines.map((line) => {
                const p = products[line.productId];
                if (!p) return null;
                return (
                  <div key={line.productId} className="flex flex-col rounded border border-[#E7E7E7] p-3">
                    <Link href={`/product/${p.asin ?? p.id}`} className="flex h-28 items-center justify-center">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="max-h-full object-contain" loading="lazy" />
                      ) : null}
                    </Link>
                    <Link
                      href={`/product/${p.asin ?? p.id}`}
                      className="clamp-2 mt-2 text-[13px] text-[#007185] hover:text-[#C7511F]"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-[14px] font-bold text-[#0F1111]">{formatINR(p.salePrice)}</p>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(line.productId, 1);
                        }}
                        className="rounded-full bg-cta-yellow py-1.5 text-[12px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line.productId)}
                        className="rounded-full border border-[#D5D9D9] bg-white py-1.5 text-[12px] text-[#0F1111] hover:bg-[#F7FAFA]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
