/**
 * Phase 02 Step 2 — Import live-scraped amazon.in bestsellers (fresh data).
 * Overwrites existing products where ASIN matches; inserts new ASINs.
 * Sets isBestSeller + bestSellerRank per department from real rank badges.
 *
 * Usage: npm run seed:bestsellers
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DIR = path.resolve(process.cwd(), "data/raw/bestsellers");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function slugify(s: string): string {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** "₹1,099.00" | "₹399" -> paise */
function parseINR(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.replace(/[₹,\s]/g, "").match(/^(\d+(?:\.\d{1,2})?)$/);
  if (!m) return null;
  return Math.round(Number.parseFloat(m[1]) * 100);
}

function parseRating(raw: string | null): number {
  if (!raw) return 0;
  const m = raw.match(/([\d.]+) out of 5/);
  return m ? Number.parseFloat(m[1]) : 0;
}

function parseReviews(raw: string | null): number {
  if (!raw) return 0;
  const n = Number.parseInt(raw.replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

const DEPT_NAMES: Record<string, string> = {
  apparel: "Clothing & Accessories",
  automotive: "Car & Motorbike",
  baby: "Baby Products",
  beauty: "Beauty",
  computers: "Computers & Accessories",
  electronics: "Electronics",
  garden: "Garden & Outdoors",
  grocery: "Grocery & Gourmet Foods",
  "home-improvement": "Home Improvement",
  hpc: "Health & Personal Care",
  industrial: "Industrial & Scientific",
  jewelry: "Jewellery",
  kitchen: "Home & Kitchen",
  luggage: "Bags, Wallets and Luggage",
  "musical-instruments": "Musical Instruments",
  office: "Office Products",
  "pet-supplies": "Pet Supplies",
  shoes: "Shoes",
  sports: "Sports & Outdoors",
  toys: "Toys & Games",
  videogames: "Video Games",
  watches: "Watches",
};

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  console.log(`${files.length} crawl files`);

  let upserted = 0;
  const errors: string[] = [];

  for (const file of files) {
    const dept = file.replace(/-p\d+\.json$/, "");
    const deptName = DEPT_NAMES[dept] ?? dept;
    const deptSlug = slugify(deptName);

    // Ensure department Category row
    await prisma.category.upsert({
      where: { slug: deptSlug },
      update: {},
      create: { slug: deptSlug, name: deptName },
    });

    const data = JSON.parse(readFileSync(path.join(DIR, file), "utf8")) as {
      cards: Array<{
        asin: string;
        rank: string | null;
        title: string;
        img: string | null;
        rating: string | null;
        reviews: string | null;
        price: string | null;
      }>;
    };

    for (const card of data.cards) {
      const salePrice = parseINR(card.price);
      const rankNum = card.rank ? Number.parseInt(card.rank.replace("#", ""), 10) : null;
      const ratingAvg = parseRating(card.rating);
      const ratingCount = parseReviews(card.reviews);
      const brandMatch = card.title.match(/^(Amazon Brand\s*-\s*)?([A-Za-z][A-Za-z0-9.&']*)/);
      const brand = brandMatch ? brandMatch[2] : null;

      // Fresh price unknown → derive plausible from nothing? Skip product if no price at all.
      const payload = {
        asin: card.asin,
        title: card.title,
        brand,
        categorySlug: deptSlug,
        categoryPath: deptSlug,
        salePrice: salePrice ?? 0,
        listPrice: salePrice ?? 0,
        currency: "INR",
        ratingAvg,
        ratingCount,
        images: card.img ? JSON.stringify([card.img]) : null,
        isBestSeller: rankNum === 1,
        bestSellerRank: rankNum,
        deliveryDaysSim: 2 + ((ratingCount % 3) || 1),
        badges: JSON.stringify(rankNum && rankNum <= 10 ? ["Best Seller"] : []),
      };
      if (!salePrice) {
        errors.push(`${card.asin}: no price (${card.title.slice(0, 40)})`);
        continue;
      }

      const existing = await prisma.product.findUnique({ where: { asin: card.asin } });
      if (existing) {
        // Fresh scrape wins: update price/rating/rank, keep richer old content (bullets/specs)
        await prisma.product.update({
          where: { asin: card.asin },
          data: {
            salePrice: payload.salePrice,
            listPrice: payload.salePrice,
            ratingAvg: payload.ratingAvg,
            ratingCount: payload.ratingCount,
            isBestSeller: payload.isBestSeller,
            bestSellerRank: payload.bestSellerRank,
            categorySlug: payload.categorySlug,
            images: payload.images ?? existing.images,
          },
        });
      } else {
        await prisma.product.create({ data: payload });
      }
      upserted++;
    }
  }

  const total = await prisma.product.count();
  const best = await prisma.product.count({ where: { isBestSeller: true } });
  console.log(`Upserted ${upserted} bestseller rows. Total products: ${total}, #1 bestsellers: ${best}`);
  if (errors.length) console.log(`Skipped ${errors.length}:\n` + errors.slice(0, 10).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
