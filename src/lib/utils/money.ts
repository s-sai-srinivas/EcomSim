/** Money helpers — all catalog amounts are integer minor units (paise). */

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function discountPercent(list: number, sale: number): number {
  if (list <= sale) return 0;
  return Math.round(((list - sale) / list) * 100);
}

export function formatCountIndian(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}
