/**
 * Phase 02 — Day-1 seed: import real amazon.in products (karkavelrajaj dataset)
 * into our Prisma/SQLite catalog. Idempotent: re-runnable via upserts on asin.
 *
 * Usage: npm run seed:day1
 */
import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const RAW_FILE = path.resolve(process.cwd(), "data/raw/karkavelrajaj-amazon-in.csv");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "₹1,099" | "₹399.00" -> paise (109900). Returns null when unparseable. */
function parseINR(raw: string): number | null {
  const m = raw.replace(/[₹,\s]/g, "").match(/^(\d+(?:\.\d{1,2})?)$/);
  if (!m) return null;
  const rupees = Number.parseFloat(m[1]);
  if (!Number.isFinite(rupees)) return null;
  return Math.round(rupees * 100);
}

function parseIntCommas(raw: string): number {
  const n = Number.parseInt(raw.replace(/[,.\s]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

interface Row {
  product_id: string;
  product_name: string;
  category: string;
  discounted_price: string;
  actual_price: string;
  discount_percentage: string;
  rating: string;
  rating_count: string;
  about_product: string;
  img_link: string;
  product_link: string;
}

async function ensureCategories(categoryPaths: string[][]): Promise<Map<string, string>> {
  // categoryPaths: array of ["Computers&Accessories", "Accessories&Peripherals", ...]
  const slugToName = new Map<string, string>();
  for (const segments of categoryPaths) {
    for (let depth = 0; depth < segments.length; depth++) {
      const name = segments[depth];
      const slug = slugify(name);
      if (!slugToName.has(slug)) slugToName.set(slug, name);
    }
  }
  for (const [slug] of [...slugToName].sort((a, b) => a[0].split("-").length - b[0].split("-").length)) {
    await prisma.category.upsert({ where: { slug }, update: {}, create: { slug, name: slugToName.get(slug)! } });
  }
  return slugToName;
}

async function main() {
  const csv = readFileSync(RAW_FILE, "utf8");
  const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Row[];
  console.log(`Parsed ${rows.length} raw rows`);

  // Collect category chains first — create rows for EVERY level so leaf names resolve
  const paths = new Set<string[]>();
  for (const r of rows) {
    const segs = r.category.split("|").map((s) => s.trim()).filter(Boolean);
    if (segs.length > 0) paths.add(segs);
  }

  // Create parent->child links after all categories exist
  await ensureCategories([...paths]);
  for (const segs of paths) {
    for (let i = 1; i < segs.length; i++) {
      const childSlug = slugify(segs[i]);
      const parentSlug = slugify(segs[i - 1]);
      await prisma.category.updateMany({
        where: { slug: childSlug, parentSlug: null },
        data: { parentSlug },
      });
    }
  }
  console.log("Categories ensured");

  let imported = 0;
  let skipped = 0;

  for (const r of rows) {
    const title = (r.product_name ?? "").trim();
    const salePrice = parseINR(r.discounted_price ?? "");
    const listPriceRaw = parseINR(r.actual_price ?? "");
    if (!title || !salePrice) {
      skipped++;
      continue;
    }
    const listPrice = listPriceRaw && listPriceRaw >= salePrice ? listPriceRaw : salePrice;

    const ratingAvg = Number.parseFloat((r.rating ?? "").trim());
    const ratingCount = parseIntCommas(r.rating_count ?? "0");
    const bullets = (r.about_product ?? "")
      .split("|")
      .map((b) => b.trim())
      .filter(Boolean)
      .slice(0, 6);
    const image = (r.img_link ?? "").trim();
    const segs = r.category.split("|").map((s) => s.trim()).filter(Boolean);
    const categorySlug = slugify(segs[segs.length - 1] ?? "unknown");
    const categoryPath = segs.map(slugify).join(">");

    // Heuristic brand from title start ("Brand Name Model ..." / "Amazon Brand - X ...")
    let brand: string | null = null;
    const bm = title.match(/^(Amazon Brand\s*-\s*)?([A-Za-z][A-Za-z0-9.&']*)/);
    if (bm) brand = bm[2];

    const data = {
      asin: r.product_id,
      title,
      brand,
      categorySlug,
      categoryPath,
      bullets: bullets.length ? JSON.stringify(bullets) : null,
      description: null,
      specs: null,
      listPrice,
      salePrice,
      currency: "INR",
      ratingAvg: Number.isFinite(ratingAvg) ? ratingAvg : 0,
      ratingCount,
      images: image ? JSON.stringify([image]) : null,
      isBestSeller: false, // set below for ranked subset
      stockSim: 40 + (Math.abs(title.length * 7) % 160),
      deliveryDaysSim: 2 + (ratingCount % 3),
      badges: JSON.stringify([]),
    };

    await prisma.product.upsert({
      where: { asin: r.product_id },
      update: data,
      create: { ...data, id: undefined },
    });
    imported++;
  }

  // Mark top sellers per category by (ratingAvg desc, ratingCount desc)
  const cats = await prisma.product.findMany({
    select: { categorySlug: true },
    distinct: ["categorySlug"],
  });
  for (const { categorySlug } of cats) {
    const top = await prisma.product.findMany({
      where: { categorySlug },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 10,
      select: { id: true },
    });
    for (let i = 0; i < top.length; i++) {
      await prisma.product.update({
        where: { id: top[i].id },
        data: { isBestSeller: i === 0, bestSellerRank: i + 1 },
      });
    }
  }

  console.log(`Imported ${imported} products (${skipped} skipped). Categories: ${cats.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
