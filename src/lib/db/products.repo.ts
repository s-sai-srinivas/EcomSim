import type { Prisma, Product } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export interface ProductListItem {
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
  images: string[];
  isBestSeller: boolean;
  bestSellerRank: number | null;
  deliveryDaysSim: number;
}

type ProductRow = Product;

function toListItem(p: ProductRow): ProductListItem {
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
    images: safeJsonArray(p.images),
    isBestSeller: p.isBestSeller,
    bestSellerRank: p.bestSellerRank,
    deliveryDaysSim: p.deliveryDaysSim,
  };
}

function safeJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export type SortKey = "bestsellers" | "price_asc" | "price_desc" | "rating" | "discount";

const SORTS: Record<SortKey, Prisma.ProductOrderByWithRelationInput[]> = {
  bestsellers: [{ isBestSeller: "desc" }, { ratingCount: "desc" }],
  price_asc: [{ salePrice: "asc" }],
  price_desc: [{ salePrice: "desc" }],
  rating: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
  discount: [], // computed post-query via expression below
};

export interface ListParams {
  q?: string;
  category?: string;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  maxPricePaise?: number;
  minRating?: number;
}

export async function listProducts(params: ListParams): Promise<{
  items: ProductListItem[];
  total: number;
}> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, params.pageSize ?? 24));

  const where: Prisma.ProductWhereInput = {};
  if (params.q?.trim()) {
    where.OR = [
      { title: { contains: params.q.trim() } },
      { brand: { contains: params.q.trim() } },
      { categoryPath: { contains: params.q.trim() } },
    ];
  }
  if (params.category) where.categorySlug = params.category;
  if (params.maxPricePaise) where.salePrice = { lte: params.maxPricePaise };
  if (params.minRating) where.ratingAvg = { gte: params.minRating };

  if (params.sort === "discount") {
    // SQLite lacks generated-order by expression in Prisma orderBy; fetch candidates then sort.
    const [rows, total] = await Promise.all([
      prisma.product.findMany({ where, take: 1000 }),
      prisma.product.count({ where }),
    ]);
    rows.sort(
      (a, b) =>
        discountOf(b.listPrice, b.salePrice) - discountOf(a.listPrice, a.salePrice),
    );
    return {
      items: rows.slice((page - 1) * pageSize, page * pageSize).map(toListItem),
      total,
    };
  }

  const orderBy = SORTS[params.sort ?? "bestsellers"];
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  return { items: rows.map(toListItem), total };
}

function discountOf(list: number, sale: number): number {
  return list > sale ? (list - sale) / list : 0;
}

export async function getProduct(idOrAsin: string): Promise<ProductListItem | null> {
  const p =
    (await prisma.product.findUnique({ where: { asin: idOrAsin } })) ??
    (await prisma.product.findUnique({ where: { id: idOrAsin } }));
  return p ? toListItem(p) : null;
}

export async function getProductDetail(idOrAsin: string) {
  const p =
    (await prisma.product.findUnique({ where: { asin: idOrAsin } })) ??
    (await prisma.product.findUnique({ where: { id: idOrAsin } }));
  if (!p) return null;
  const bullets = safeJsonArray(p.bullets);
  const related = await prisma.product.findMany({
    where: { categorySlug: p.categorySlug, id: { not: p.id } },
    orderBy: [{ ratingCount: "desc" }],
    take: 12,
  });
  return {
    ...toListItem(p),
    bullets,
    categoryPath: p.categoryPath,
    description: p.description,
    specs: (() => {
      try {
        return p.specs ? (JSON.parse(p.specs) as Record<string, string>) : null;
      } catch {
        return null;
      }
    })(),
    stockSim: p.stockSim,
    related: related.map(toListItem),
  };
}

export function prettifyCategoryName(nameOrSlug: string): string {
  // Handle joined slugs like "computersandaccessories"/"usbcables" that lost separators
  const special: Record<string, string> = {
    usbcables: "USB Cables",
    usbcable: "USB Cable",
    cablesandaccessories: "Cables and Accessories",
    computersandaccessories: "Computers and Accessories",
    smartwatches: "Smart Watches",
    smarttelevisions: "Smart Televisions",
    smartphones: "Smartphones",
    smarttelevisons: "Smart TVs",
    inear: "In Ear",
    mixergrinders: "Mixer Grinders",
    dryirons: "Dry Irons",
    instantwaterheaters: "Instant Water Heaters",
    remotecontrols: "Remote Controls",
  };
  const lower = nameOrSlug.toLowerCase();
  if (special[lower]) return special[lower];
  if (lower.startsWith("usb") && lower.length > 3) {
    return "USB " + prettifyCategoryName(lower.slice(3));
  }
  return nameOrSlug
    .replace(/and/gi, " and ")
    .replace(/&/g, " and ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b And \b/g, " and ");
}

export async function topCategories(take = 12) {
  const rows = await prisma.product.groupBy({
    by: ["categorySlug"],
    _count: { _all: true },
    orderBy: { _count: { categorySlug: "desc" } },
    take,
  });
  const names = await prisma.category.findMany();
  const nameBySlug = new Map(names.map((c) => [c.slug, c.name]));
  return rows.map((r) => ({
    slug: r.categorySlug,
    name: prettifyCategoryName(nameBySlug.get(r.categorySlug) ?? r.categorySlug),
    count: r._count._all,
  }));
}
