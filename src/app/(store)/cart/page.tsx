"use client";

/* eslint-disable react-hooks/set-state-in-effect -- cart batch fetch intentionally updates state after mount */

import { useCallback, useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import Link from "next/link";
import { formatINR } from "@/lib/utils/money";

interface ProductLite {
  id: string;
  asin: string | null;
  title: string;
  images: string[];
  salePrice: number;
  listPrice: number;
  stockSim: number;
}

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const hydrated = useCartStore((s): boolean => (s as unknown as { _hasHydrated?: boolean })._hasHydrated ?? true);
  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [loading, setLoading] = useState(false);

  const ids = lines.map((l) => l.productId);

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

  // cart data fetch — intentionally triggers state updates after mount
  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  if (!hydrated && lines.length === 0) {
    return <div className="mx-auto max-w-[1500px] bg-white p-6 text-[14px]">Loading cart…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="bg-[#EAEDED] px-5 py-4">
        <div className="mx-auto max-w-[1500px] bg-white p-6">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Your EcoMart Cart is empty</h1>
          <p className="mt-2 text-[14px] text-[#007185]">
            Your shopping cart lives to serve. Give it purpose –
            <Link href="/s" className="ml-1 underline">
              continue shopping
            </Link>
          </p>
          <p className="mt-4 rounded bg-[#F0F2F2] p-3 text-[12px] text-[#565959]">
            The price and availability of items at EcoMart.in are subject to change. The shopping cart is a
            temporary place to store a list of your items. Sign in to see whether any items previously in
            your shopping cart qualify now.
          </p>
        </div>
      </div>
    );
  }

  const subtotalPaise = lines.reduce((acc, l) => acc + (products[l.productId]?.salePrice ?? 0) * l.qty, 0);
  const totalItems = lines.reduce((acc, l) => acc + l.qty, 0);
  const qualifiesFree = subtotalPaise >= 49900;

  return (
    <div className="bg-[#EAEDED] px-5 py-4">
      <div className="mx-auto flex max-w-[1500px] gap-4">
        <div className="min-w-0 flex-1 bg-white p-5">
          <h1 className="text-[21px] font-bold text-[#0F1111]">Shopping Cart</h1>
          <a href="#" className="text-[14px] text-[#007185]">
            Deselect all items
          </a>
          <div className="mt-3 border-t border-[#DDD] pt-2 text-right text-[14px] text-[#565959]">Price</div>

          {loading && lines.length > 0 && Object.keys(products).length === 0 ? (
            <p className="py-10 text-center text-[14px] text-[#565959]">Loading items…</p>
          ) : (
            <ul className="divide-y divide-[#DDD]">
              {lines.map((line) => {
                const p = products[line.productId];
                if (!p) return null;
                return (
                  <li key={line.productId} className="flex gap-3 py-4">
                    <Link href={`/product/${p.asin ?? p.id}`} className="h-[100px] w-[120px] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.images[0] ? (
                        <img src={p.images[0]} alt={p.title} className="h-full w-full object-contain" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${p.asin ?? p.id}`}
                        className="clamp-2 text-[16px] leading-snug text-[#0F1111] hover:text-[#C7511F]"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-1 text-[12px] text-[#007600]">In stock</p>
                      <p className="text-[12px] text-[#565959]">Eligible for FREE Shipping</p>
                      <p className="mt-1 flex items-center gap-2 text-[12px]">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-[#067D62] bg-[#067D62] text-[10px] text-white">
                          ✓
                        </span>
                        <span className="font-bold text-[#067D62]">EcoMart Fulfilled</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-1 text-[13px]">
                          <span className="sr-only">Quantity</span>
                          <select
                            value={line.qty}
                            onChange={(e) => setQty(line.productId, Number(e.target.value))}
                            className="rounded-[8px] border border-[#D5D9D9] bg-[#F0F2F2] px-2 py-1 text-[13px] shadow-sm"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                              <option key={n} value={n}>
                                Qty: {n}
                              </option>
                            ))}
                          </select>
                        </label>
                        <span className="hidden text-[#DDD] sm:inline">|</span>
                        <button
                          type="button"
                          onClick={() => remove(line.productId)}
                          className="text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline"
                        >
                          Delete
                        </button>
                        <span className="text-[#DDD]">|</span>
                        <Link href="#" className="text-[12px] text-[#007185] hover:text-[#C7511F] hover:underline">
                          Save for later
                        </Link>
                      </div>
                    </div>
                    <span className="shrink-0 text-[18px] font-bold text-[#0F1111]">{formatINR(p.salePrice)}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="border-t border-[#DDD] pt-3 text-right text-[18px] text-[#0F1111]">
            Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}):{" "}
            <span className="font-bold">{formatINR(subtotalPaise)}</span>
          </p>
        </div>

        <div className="w-[300px] shrink-0">
          <div className="bg-white p-4">
            {!qualifiesFree && (
              <p className="mb-3 rounded bg-[#FFF3CD] p-2 text-[13px] text-[#0F1111]">
                Add {formatINR(49900 - subtotalPaise)} more for FREE delivery
              </p>
            )}
            {qualifiesFree && (
              <p className="mb-3 flex items-center gap-1 text-[13px] text-[#067D62]">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#067D62] text-[10px] text-white">
                  ✓
                </span>{" "}
                Your order is eligible for FREE delivery.
              </p>
            )}
            <p className="text-[18px] text-[#0F1111]">
              Subtotal ({totalItems} items): <span className="font-bold">{formatINR(subtotalPaise)}</span>
            </p>
            <label className="mt-2 flex items-start gap-2 text-[14px]">
              <input type="checkbox" className="mt-1" />
              <span>This order contains a gift</span>
            </label>
            <Link
              href="/checkout"
              className="mt-3 flex h-[33px] w-full items-center justify-center rounded-full bg-cta-yellow text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
            >
              Proceed to Buy
            </Link>
            <p className="mt-2 text-[12px] text-[#067D62]">
              EMI available on checkout.{" "}
              <a href="#" className="text-[#007185]">
                Details
              </a>
            </p>
          </div>

          <div className="mt-3 bg-white p-4 text-[13px] text-[#0F1111]">
            <p className="font-bold">Items saved for later are not in this view.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
