"use client";

/* eslint-disable react-hooks/set-state-in-effect -- checkout data fetching intentionally updates state */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import { formatINR } from "@/lib/utils/money";
import { deliveryOptionsFor, type SpeedTier } from "@/lib/services/delivery";
import { Logo as SiteLogo } from "@/components/layout/Logo";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  line1: string;
  line2: string | null;
  isDefault: boolean;
}

interface ProductLite {
  id: string;
  asin: string | null;
  title: string;
  images: string[];
  salePrice: number;
}

type Step = 1 | 2 | 3;

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery / Pay on Delivery", desc: "Cash, UPI and Cards accepted." },
  { id: "UPI", label: "UPI", desc: "Pay by any UPI app" },
  { id: "CARD", label: "Credit or Debit card", desc: "Add and secure your card as per RBI guidelines" },
  { id: "NETBANKING", label: "Net Banking", desc: "Choose your bank" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);

  const [step, setStep] = useState<Step>(1);
  const [meChecked, setMeChecked] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ fullName: "", phone: "", pincode: "", city: "", state: "", line1: "" });

  const [speedTier, setSpeedTier] = useState<SpeedTier>("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");

  const [products, setProducts] = useState<Record<string, ProductLite>>({});
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  // fetch session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => setAuthed(Boolean(j.user)))
      .catch(() => setAuthed(false))
      .finally(() => setMeChecked(true));
  }, []);

  useEffect(() => {
    if (meChecked && authed === false) router.replace("/signin?next=/checkout");
  }, [meChecked, authed, router]);

  // fetch addresses
  const fetchAddresses = useCallback(async () => {
    const res = await fetch("/api/addresses");
    if (!res.ok) return;
    const json = await res.json();
    const list: Address[] = json.data ?? [];
    setAddresses(list);
    const def = list.find((a) => a.isDefault) ?? list[0];
    if (def) setSelectedAddressId((prev) => prev ?? def.id);
  }, []);

  useEffect(() => {
    if (authed) void fetchAddresses();
  }, [authed, fetchAddresses]);

  // fetch products for cart
  const idsKey = lines.map((l) => l.productId).join(",");
  useEffect(() => {
    if (lines.length === 0) {
      setProducts({});
      return;
    }
    void (async () => {
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
    })();
  }, [idsKey, lines]);

  const itemsTotal = lines.reduce((acc, l) => acc + (products[l.productId]?.salePrice ?? 0) * l.qty, 0);
  const selectedAddr = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const deliveryOpts = selectedAddr ? deliveryOptionsFor(selectedAddr.pincode) : [];
  const chosenOpt = deliveryOpts.find((o) => o.tier === speedTier) ?? deliveryOpts[0];
  const deliveryFee = chosenOpt?.feePaise ?? 0;
  const grandTotal = itemsTotal + deliveryFee;

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddingAddress(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newAddr),
    });
    setAddingAddress(false);
    if (!res.ok) return;
    setNewAddr({ fullName: "", phone: "", pincode: "", city: "", state: "", line1: "" });
    await fetchAddresses();
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setPlaceError("Please select a delivery address.");
      setStep(1);
      return;
    }
    setPlacing(true);
    setPlaceError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddressId,
        speedTier,
        paymentMethod,
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
      }),
    });
    const json = await res.json().catch(() => ({}));
    setPlacing(false);
    if (!res.ok) {
      setPlaceError(json.error ?? "Failed to place order.");
      return;
    }
    clearCart();
    const id: string = json.data.id;
    router.push(`/order-confirmation/${id}`);
  }

  if (!meChecked || authed === null) {
    return <div className="min-h-screen bg-[#EAEDED] p-8 text-center text-[14px]">Loading checkout…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#EAEDED]">
        <CheckoutHeader count={0} />
        <div className="mx-auto max-w-[1100px] bg-white p-8 text-center">
          <p className="text-[18px] text-[#0F1111]">Your cart is empty.</p>
          <Link href="/s" className="mt-4 inline-block text-[13px] text-[#007185] hover:text-[#C7511F]">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <CheckoutHeader count={lines.reduce((a, l) => a + l.qty, 0)} />

      <div className="mx-auto flex max-w-[1150px] gap-5 px-4 py-4">
        {/* Left: accordion */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Step 1: Address */}
          <section className="overflow-hidden rounded-[8px] border border-[#D5D9D9] bg-white">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#232F3E] text-[13px] font-bold text-white">
                  1
                </span>
                <span className="text-[18px] font-bold text-[#0F1111]">Delivery Address</span>
              </span>
              {step !== 1 && selectedAddr && (
                <span className="text-[13px] text-[#067D62]">✓ {selectedAddr.fullName}, {selectedAddr.city}</span>
              )}
            </button>
            {step === 1 && (
              <div className="border-t border-[#EAEDED] p-4">
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer gap-3 rounded-[8px] border p-3 ${selectedAddressId === a.id ? "border-[#E77600] bg-[#FFF8F0]" : "border-[#D5D9D9] bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1"
                        />
                        <span className="text-[13px] leading-relaxed text-[#0F1111]">
                          <span className="font-bold">{a.fullName}</span> — {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode} · {a.phone}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <details className="mt-3">
                  <summary className="cursor-pointer text-[13px] font-bold text-[#007185]">Add a new address</summary>
                  <form onSubmit={handleAddAddress} className="mt-3 grid grid-cols-2 gap-2">
                    <input
                      placeholder="Full name"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr((s) => ({ ...s, fullName: e.target.value }))}
                      className="rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <input
                      placeholder="Mobile number"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr((s) => ({ ...s, phone: e.target.value }))}
                      className="rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <input
                      placeholder="Pincode (6 digits)"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr((s) => ({ ...s, pincode: e.target.value }))}
                      className="rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <input
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr((s) => ({ ...s, city: e.target.value }))}
                      className="rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <input
                      placeholder="State"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr((s) => ({ ...s, state: e.target.value }))}
                      className="rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <input
                      placeholder="House / Area / Street"
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr((s) => ({ ...s, line1: e.target.value }))}
                      className="col-span-2 rounded border border-[#888C8C] px-2 py-2 text-[13px]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={addingAddress}
                      className="col-span-2 mt-1 h-8 rounded-[8px] bg-cta-yellow text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00] disabled:opacity-60"
                    >
                      {addingAddress ? "Adding…" : "Add address"}
                    </button>
                  </form>
                </details>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedAddressId}
                  className="mt-4 h-8 rounded-[8px] bg-cta-yellow px-6 text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00] disabled:opacity-50"
                >
                  Use this address
                </button>
              </div>
            )}
          </section>

          {/* Step 2: Delivery speed */}
          <section className="overflow-hidden rounded-[8px] border border-[#D5D9D9] bg-white">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#232F3E] text-[13px] font-bold text-white">
                  2
                </span>
                <span className="text-[18px] font-bold text-[#0F1111]">Delivery Options</span>
              </span>
              {step !== 2 && chosenOpt && (
                <span className="text-[13px] text-[#067D62]">✓ {chosenOpt.label} — {chosenOpt.etaLabel}</span>
              )}
            </button>
            {step === 2 && (
              <div className="border-t border-[#EAEDED] p-4">
                {!selectedAddr ? (
                  <p className="text-[13px] text-[#565959]">Select a delivery address first.</p>
                ) : (
                  <div className="space-y-2">
                    {deliveryOpts.map((opt) => (
                      <label
                        key={opt.tier}
                        className={`flex cursor-pointer items-center gap-3 rounded-[8px] border p-3 ${speedTier === opt.tier ? "border-[#E77600] bg-[#FFF8F0]" : "border-[#D5D9D9]"}`}
                      >
                        <input
                          type="radio"
                          name="speedTier"
                          checked={speedTier === opt.tier}
                          onChange={() => setSpeedTier(opt.tier)}
                        />
                        <span className="flex-1 text-[13px] text-[#0F1111]">
                          <span className="font-bold">{opt.label}</span>{" "}
                          <span className="text-[#067D62]">{opt.etaLabel}</span>
                        </span>
                        <span className="text-[13px] font-bold text-[#0F1111]">
                          {opt.feePaise === 0 ? "FREE" : formatINR(opt.feePaise)}
                        </span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="mt-3 h-8 rounded-[8px] bg-cta-yellow px-6 text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Step 3: Payment + Review */}
          <section className="overflow-hidden rounded-[8px] border border-[#D5D9D9] bg-white">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#232F3E] text-[13px] font-bold text-white">
                  3
                </span>
                <span className="text-[18px] font-bold text-[#0F1111]">Payment & Review</span>
              </span>
              {step !== 3 && <span className="text-[13px] text-[#067D62]">✓ {paymentMethod}</span>}
            </button>
            {step === 3 && (
              <div className="border-t border-[#EAEDED] p-4">
                <h3 className="text-[14px] font-bold text-[#0F1111]">Payment method</h3>
                <div className="mt-2 space-y-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer gap-3 rounded-[8px] border p-3 ${paymentMethod === m.id ? "border-[#E77600] bg-[#FFF8F0]" : "border-[#D5D9D9]"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === m.id}
                        onChange={() => setPaymentMethod(m.id)}
                        className="mt-1"
                      />
                      <span className="text-[13px] text-[#0F1111]">
                        <span className="font-bold">{m.label}</span>{" "}
                        <span className="text-[#565959]">— {m.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>

                <h3 className="mt-4 text-[14px] font-bold text-[#0F1111]">Review items</h3>
                <ul className="mt-2 divide-y divide-[#EAEDED] rounded-[8px] border border-[#EAEDED]">
                  {lines.map((line) => {
                    const p = products[line.productId];
                    if (!p) return null;
                    return (
                      <li key={line.productId} className="flex gap-3 p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-16 w-16 object-contain" />}
                        <span className="flex-1 text-[13px] text-[#0F1111]">{p.title}</span>
                        <span className="text-[13px] font-bold text-[#0F1111]">Qty {line.qty}</span>
                      </li>
                    );
                  })}
                </ul>

                {placeError && (
                  <p className="mt-3 rounded border border-[#C40000] bg-[#FFF4F4] p-2 text-[13px] text-[#C40000]">
                    {placeError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-cta-yellow text-[14px] font-bold text-[#0F1111] hover:bg-[#F7CA00] disabled:opacity-60"
                >
                  {placing ? "Placing order…" : `Place your order — ${formatINR(grandTotal)}`}
                </button>
                <p className="mt-2 text-center text-[12px] text-[#565959]">
                  By placing your order, you agree to EcoMart&apos;s simulated checkout. No real money is charged.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right: order summary */}
        <div className="hidden w-[300px] shrink-0 lg:block">
          <div className="rounded-[8px] border border-[#D5D9D9] bg-white p-4">
            <button
              type="button"
              onClick={step === 3 ? handlePlaceOrder : () => setStep(3)}
              disabled={placing}
              className="flex h-9 w-full items-center justify-center rounded-full bg-cta-yellow text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00] disabled:opacity-60"
            >
              {step === 3 ? `Place your order` : "Continue"}
            </button>
            <p className="mt-2 text-center text-[12px] text-[#565959]">
              By placing your order, you agree to our simulated checkout.
            </p>
            <h3 className="mt-4 text-[18px] font-bold text-[#0F1111]">Order Summary</h3>
            <dl className="mt-2 space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-[#565959]">Items ({lines.reduce((a, l) => a + l.qty, 0)}):</dt>
                <dd className="text-[#0F1111]">{formatINR(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#565959]">Delivery:</dt>
                <dd className={deliveryFee === 0 ? "font-bold text-[#067D62]" : "text-[#0F1111]"}>
                  {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[#EAEDED] pt-2 text-[18px] font-bold text-[#B12704]">
                <dt>Order Total:</dt>
                <dd>{formatINR(grandTotal)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutHeader({ count }: { count: number }) {
  return (
    <header className="flex items-center justify-between border-b border-[#DDD] bg-white px-6 py-3">
      <Link href="/" className="flex items-center gap-2">
        <SiteLogo />
        <span className="text-[18px] font-normal text-[#0F1111]">Checkout</span>
        <span className="text-[18px] text-[#007600]">({count} items)</span>
      </Link>
      <span className="flex items-center gap-1 text-[14px] text-[#067D62]">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#067D62] text-[10px] text-white">
          ✓
        </span>{" "}
        Secure checkout
      </span>
    </header>
  );
}
