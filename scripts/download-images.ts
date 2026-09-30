/**
 * Phase 02 Step 3 — Download real product images to /public/products/{asin}.{ext}
 * and repoint DB image paths to local assets. Resumable: skips existing files.
 *
 * Usage: npx tsx scripts/download-images.ts
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const OUT_DIR = path.resolve(process.cwd(), "public/products");
const CONCURRENCY = 12;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? `file:${process.cwd()}/dev.db`,
  }),
});

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i);
  return m ? m[1].toLowerCase() : "jpg";
}

async function fetchWithRetry(url: string, tries = 3): Promise<Buffer> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(20_000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; EcomSimSeed/1.0)" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

/** Normalize stale dataset URLs (".../images/W/WEBP_x/images/I/id.jpg") to canonical form. */
function normalizeUrl(url: string): string {
  const m = url.match(/\/images\/(I\/[A-Za-z0-9._%+-]+\.(?:jpe?g|png|webp|gif))$/i);
  if (m) return `https://m.media-amazon.com/images/${m[1]}`;
  return url;
}

async function processOne(id: string, asin: string | null, imagesJson: string | null) {
  if (!imagesJson) return { id, ok: false, reason: "no-image" } as const;
  let urls: string[];
  try {
    urls = JSON.parse(imagesJson) as string[];
  } catch {
    return { id, ok: false, reason: "bad-json" } as const;
  }
  const raw = urls[0];
  if (!raw) return { id, ok: false, reason: "no-url" } as const;

  const key = asin ?? id;

  // Already migrated to a local asset in a previous run.
  if (raw.startsWith("/")) {
    if (existsSync(path.join(OUT_DIR, path.basename(raw)))) {
      return { id, ok: true } as const;
    }
    return { id, ok: false, reason: "local-file-missing" } as const;
  }

  const url = normalizeUrl(raw);
  const ext = extFromUrl(url);
  const relPath = `/products/${key}.${ext}`;
  const absPath = path.join(OUT_DIR, `${key}.${ext}`);

  if (!existsSync(absPath)) {
    try {
      const buf = await fetchWithRetry(url);
      await writeFile(absPath, buf);
    } catch (e) {
      return { id, ok: false, reason: `fetch: ${String(e).slice(0, 80)}` } as const;
    }
  }

  await prisma.product.update({
    where: { id },
    data: { images: JSON.stringify([relPath]) },
  });
  return { id, ok: true } as const;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const products = await prisma.product.findMany({
    where: { images: { not: null } },
    select: { id: true, asin: true, images: true },
  });
  console.log(`${products.length} products to process`);

  let done = 0;
  let failed = 0;
  const failures: string[] = [];
  const queue = [...products];

  async function worker() {
    for (;;) {
      const item = queue.shift();
      if (!item) return;
      const result = await processOne(item.id, item.asin, item.images);
      if (result.ok) done++;
      else {
        failed++;
        failures.push(`${item.asin ?? item.id}: ${result.reason}`);
      }
      if ((done + failed) % 200 === 0) console.log(`progress: ${done + failed}/${products.length}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`Downloaded+linked: ${done}, failed: ${failed}`);
  if (failures.length) console.log("Failures:\n" + failures.slice(0, 20).join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
