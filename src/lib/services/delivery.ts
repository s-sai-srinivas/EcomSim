/** Simulated delivery estimates based on pincode. Mirrors amazon.in rules. */

export type SpeedTier = "STANDARD" | "FASTER" | "SAME_DAY";

export interface DeliveryOption {
  tier: SpeedTier;
  label: string;
  feePaise: number;
  eta: Date;
  etaLabel: string;
}

/** Free delivery threshold mirrors amazon.in: ₹499+ */
export const FREE_DELIVERY_THRESHOLD_PAISE = 49900;

function hashPincode(pincode: string): number {
  let h = 0;
  for (const c of pincode) h = (h * 31 + c.charCodeAt(0)) % 1000;
  return h;
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function formatEta(d: Date): string {
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export function deliveryOptionsFor(pincode: string, now = new Date()): DeliveryOption[] {
  const h = hashPincode(pincode || "560001");
  const standardDays = 2 + (h % 3); // 2–4 days
  const fasterDays = Math.max(1, standardDays - 1);
  const sameDayEligible = h % 5 !== 0; // 80% of pincodes

  const options: DeliveryOption[] = [
    {
      tier: "STANDARD",
      label: "FREE Standard Delivery",
      feePaise: 0,
      eta: addDays(now, standardDays),
      etaLabel: formatEta(addDays(now, standardDays)),
    },
    {
      tier: "FASTER",
      label: "Faster Delivery",
      feePaise: 49_00,
      eta: addDays(now, fasterDays),
      etaLabel: formatEta(addDays(now, fasterDays)),
    },
  ];

  if (sameDayEligible) {
    options.push({
      tier: "SAME_DAY",
      label: "Same-Day Delivery",
      feePaise: 99_00,
      eta: addDays(now, 0),
      etaLabel: "Today",
    });
  }

  return options;
}

export function isCodEligible(grandTotalPaise: number): boolean {
  return grandTotalPaise < 50_000_00; // ₹50,000
}

export function deliveryFeeFor(
  tier: SpeedTier,
  itemsTotalPaise: number,
  pincode: string,
): number {
  if (itemsTotalPaise >= FREE_DELIVERY_THRESHOLD_PAISE && tier === "STANDARD") return 0;
  const opt = deliveryOptionsFor(pincode).find((o) => o.tier === tier);
  return opt?.feePaise ?? 0;
}
