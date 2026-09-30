/**
 * Demo seed — populates the catalog with sample products so the
 * storefront is browsable without the full Kaggle import.
 * Usage: DATABASE_URL=... npx tsx scripts/seed-demo.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const img = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;

const CATEGORIES = [
  { slug: "electronics", name: "Electronics", sortOrder: 1 },
  { slug: "fashion", name: "Fashion", sortOrder: 2 },
  { slug: "home-kitchen", name: "Home & Kitchen", sortOrder: 3 },
  { slug: "books", name: "Books", sortOrder: 4 },
];

const PRODUCTS = [
  {
    asin: "DEMO001",
    title: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds",
    brand: "boAt",
    categorySlug: "electronics",
    categoryPath: "electronics>earbuds",
    bullets: JSON.stringify(["42H playtime", "Low latency gaming mode", "IPX4 water resistance"]),
    listPrice: 449000,
    salePrice: 129900,
    ratingAvg: 4.1,
    ratingCount: 38214,
    images: JSON.stringify([img("earbuds")]),
    isBestSeller: true,
    bestSellerRank: 1,
    badges: JSON.stringify(["Best Seller"]),
  },
  {
    asin: "DEMO002",
    title: "Noise ColorFit Pro 4 Smartwatch with 1.72\" Display",
    brand: "Noise",
    categorySlug: "electronics",
    categoryPath: "electronics>smartwatches",
    bullets: JSON.stringify(["Bluetooth calling", "100+ watch faces", "7-day battery"]),
    listPrice: 799900,
    salePrice: 279900,
    ratingAvg: 4.0,
    ratingCount: 15230,
    images: JSON.stringify([img("smartwatch")]),
    isBestSeller: true,
    bestSellerRank: 2,
  },
  {
    asin: "DEMO003",
    title: "Logitech MX Master 3S Wireless Mouse",
    brand: "Logitech",
    categorySlug: "electronics",
    categoryPath: "electronics>accessories",
    bullets: JSON.stringify(["8K DPI sensor", "Quiet clicks", "USB-C fast charge"]),
    listPrice: 1099500,
    salePrice: 899500,
    ratingAvg: 4.7,
    ratingCount: 9211,
    images: JSON.stringify([img("mouse")]),
  },
  {
    asin: "DEMO004",
    title: "Samsung Galaxy Buds2 Pro True Wireless Earbuds",
    brand: "Samsung",
    categorySlug: "electronics",
    categoryPath: "electronics>earbuds",
    bullets: JSON.stringify(["24-bit Hi-Fi audio", "Intelligent ANC", "360 Audio"]),
    listPrice: 1799900,
    salePrice: 999900,
    ratingAvg: 4.4,
    ratingCount: 5842,
    images: JSON.stringify([img("buds")]),
  },
  {
    asin: "DEMO005",
    title: "Levi's Men's 511 Slim Fit Jeans",
    brand: "Levi's",
    categorySlug: "fashion",
    categoryPath: "fashion>men>jeans",
    bullets: JSON.stringify(["Slim through hip and thigh", "Stretch denim"]),
    listPrice: 399900,
    salePrice: 199900,
    ratingAvg: 4.3,
    ratingCount: 12480,
    images: JSON.stringify([img("jeans")]),
  },
  {
    asin: "DEMO006",
    title: "Nike Revolution 6 Men's Running Shoes",
    brand: "Nike",
    categorySlug: "fashion",
    categoryPath: "fashion>men>shoes",
    bullets: JSON.stringify(["Lightweight mesh", "Foam midsole"]),
    listPrice: 369500,
    salePrice: 259700,
    ratingAvg: 4.2,
    ratingCount: 8817,
    images: JSON.stringify([img("shoes")]),
    isBestSeller: true,
    bestSellerRank: 3,
  },
  {
    asin: "DEMO007",
    title: "Allen Solly Men's Regular Fit Casual Shirt",
    brand: "Allen Solly",
    categorySlug: "fashion",
    categoryPath: "fashion>men>shirts",
    bullets: JSON.stringify(["100% cotton", "Machine washable"]),
    listPrice: 229900,
    salePrice: 114900,
    ratingAvg: 4.1,
    ratingCount: 4310,
    images: JSON.stringify([img("shirt")]),
  },
  {
    asin: "DEMO008",
    title: "Prestige Iris 750 Watt Mixer Grinder with 3 Jars",
    brand: "Prestige",
    categorySlug: "home-kitchen",
    categoryPath: "home-kitchen>appliances",
    bullets: JSON.stringify(["750W motor", "3 stainless steel jars", "Overload protection"]),
    listPrice: 464500,
    salePrice: 279900,
    ratingAvg: 4.0,
    ratingCount: 22140,
    images: JSON.stringify([img("mixer")]),
  },
  {
    asin: "DEMO009",
    title: "Milton Thermosteel Flip Lid Flask, 1000ml",
    brand: "Milton",
    categorySlug: "home-kitchen",
    categoryPath: "home-kitchen>storage",
    bullets: JSON.stringify(["24-hour hot/cold", "Rust-proof steel", "Leak proof"]),
    listPrice: 115000,
    salePrice: 84900,
    ratingAvg: 4.4,
    ratingCount: 41023,
    images: JSON.stringify([img("flask")]),
    isBestSeller: true,
    bestSellerRank: 1,
  },
  {
    asin: "DEMO010",
    title: "Wakefit Orthopaedic Memory Foam Mattress, Queen",
    brand: "Wakefit",
    categorySlug: "home-kitchen",
    categoryPath: "home-kitchen>furniture",
    bullets: JSON.stringify(["Medium firm", "10-year warranty", "Breathable cover"]),
    listPrice: 1263500,
    salePrice: 783900,
    ratingAvg: 4.5,
    ratingCount: 18934,
    images: JSON.stringify([img("mattress")]),
  },
  {
    asin: "DEMO011",
    title: "Atomic Habits by James Clear — Paperback",
    brand: "Random House",
    categorySlug: "books",
    categoryPath: "books>self-help",
    bullets: JSON.stringify(["#1 NYT bestseller", "Tiny changes, remarkable results"]),
    listPrice: 89900,
    salePrice: 49900,
    ratingAvg: 4.7,
    ratingCount: 89210,
    images: JSON.stringify([img("atomic")]),
    isBestSeller: true,
    bestSellerRank: 1,
  },
  {
    asin: "DEMO012",
    title: "The Psychology of Money by Morgan Housel",
    brand: "Jaico",
    categorySlug: "books",
    categoryPath: "books>finance",
    bullets: JSON.stringify(["Timeless lessons on wealth", "19 short stories"]),
    listPrice: 39900,
    salePrice: 26900,
    ratingAvg: 4.6,
    ratingCount: 45218,
    images: JSON.stringify([img("money")]),
  },
  {
    asin: "DEMO013",
    title: "Deep Work by Cal Newport — Paperback",
    brand: "Piatkus",
    categorySlug: "books",
    categoryPath: "books>productivity",
    bullets: JSON.stringify(["Rules for focused success", "Distracted world guide"]),
    listPrice: 59900,
    salePrice: 39900,
    ratingAvg: 4.5,
    ratingCount: 21430,
    images: JSON.stringify([img("deepwork")]),
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  for (const p of PRODUCTS) {
    await prisma.product.upsert({ where: { asin: p.asin! }, update: p, create: p });
  }
  console.log(`Seeded ${CATEGORIES.length} categories, ${PRODUCTS.length} products`);
}

main().finally(() => prisma.$disconnect());
