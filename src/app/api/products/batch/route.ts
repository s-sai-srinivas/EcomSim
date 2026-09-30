import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

function toListItem(p: {
  id: string;
  asin: string | null;
  title: string;
  brand: string | null;
  categorySlug: string;
  listPrice: number;
  salePrice: number;
  currency: string;
  ratingAvg: number;
  ratingCount: number;
  images: string | null;
  isBestSeller: boolean;
  bestSellerRank: number | null;
  deliveryDaysSim: number;
}) {
  let images: string[] = [];
  try {
    const v = p.images ? JSON.parse(p.images) : [];
    if (Array.isArray(v)) images = v;
  } catch {}
  return {
    id: p.id,
    asin: p.asin,
    title: p.title,
    brand: p.brand,
    categorySlug: p.categorySlug,
    listPrice: p.listPrice,
    salePrice: p.salePrice,
    currency: p.currency,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    images,
    isBestSeller: p.isBestSeller,
    bestSellerRank: p.bestSellerRank,
    deliveryDaysSim: p.deliveryDaysSim,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const ids: unknown = body?.ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 50) {
    return NextResponse.json({ error: "Provide ids array (1–50)" }, { status: 400 });
  }
  const rows = await prisma.product.findMany({
    where: { OR: [{ id: { in: ids as string[] } }, { asin: { in: ids as string[] } }] },
  });
  // Preserve caller order
  const byKey = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    byKey.set(r.id, r);
    if (r.asin) byKey.set(r.asin, r);
  }
  const ordered = (ids as string[])
    .map((id) => byKey.get(id))
    .filter((r): r is NonNullable<typeof r> => r != null)
    .map(toListItem);
  return NextResponse.json({ data: ordered });
}
