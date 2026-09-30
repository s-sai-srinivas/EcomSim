import Link from "next/link";
import { listProducts, topCategories, type ProductListItem } from "@/lib/db/products.repo";
import { ProductCard } from "@/components/product/ProductCard";
import { formatINR } from "@/lib/utils/money";

const HERO_DEPTS: Array<{ slug: string; label: string }> = [
  { slug: "watches", label: "Smart Watches" },
  { slug: "electronics", label: "Electronics" },
  { slug: "kitchen", label: "Home & Kitchen" },
  { slug: "shoes", label: "Shoes" },
];

async function heroProduct(): Promise<ProductListItem | null> {
  for (const { slug } of HERO_DEPTS) {
    const { items } = await listProducts({ category: slug, sort: "bestsellers", pageSize: 1 });
    if (items[0]?.images[0] && items[0].bestSellerRank === 1) return items[0];
  }
  const { items } = await listProducts({ sort: "bestsellers", pageSize: 1 });
  return items[0] ?? null;
}

function Hero({ product }: { product: ProductListItem | null }) {
  const headline = product?.categorySlug === "watches" ? "Smart Watches" : "Top picks for you";
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#F4E7CD] via-[#F7EEDD] to-[#F4E7CD]">
      <div className="mx-auto flex h-[420px] max-w-[1500px] items-center justify-between px-8">
        <div className="max-w-[520px]">
          <h1 className="text-[40px] font-bold leading-tight text-[#0F1111]">
            Starting {formatINR(product?.salePrice ?? 29900)}
          </h1>
          <p className="mt-1 text-[24px] text-[#0F1111]">{headline}</p>
          <div className="mt-4 flex items-center gap-3 text-[14px] text-[#0F1111]">
            <span>Free Delivery</span>
            <span className="h-4 w-px bg-[#8a8a8a]" />
            <span>UPI Payment</span>
          </div>
          <Link
            href="/s?sort=discount"
            className="mt-5 inline-block rounded-[8px] bg-cta-yellow px-16 py-2 text-[14px] font-medium text-[#0F1111] shadow-sm hover:bg-[#F7CA00]"
          >
            Shop now
          </Link>
        </div>
        {product?.images[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt=""
            className="hidden h-[300px] w-auto rounded-lg object-contain md:block"
          />
        )}
      </div>
      {/* Carousel chevrons (decorative until Phase 03 carousel) */}
      <span aria-hidden className="absolute left-2 top-1/2 -translate-y-1/2 text-6xl font-light text-white/80 drop-shadow">‹</span>
      <span aria-hidden className="absolute right-2 top-1/2 -translate-y-1/2 text-6xl font-light text-white/80 drop-shadow">›</span>
    </section>
  );
}

async function CategoryCards() {
  const categories = await topCategories(8);
  const cards: Array<{ name: string; slug: string; images: string[] }> = [];
  for (const c of categories) {
    const { items } = await listProducts({ category: c.slug, sort: "bestsellers", pageSize: 4 });
    const images = items.map((i) => i.images[0]).filter(Boolean) as string[];
    if (images.length >= 2) cards.push({ name: c.name, slug: c.slug, images: images.slice(0, 4) });
    if (cards.length === 4) break;
  }
  if (cards.length === 0) return null;
  return (
    <div className="relative mx-auto -mt-[120px] grid max-w-[1500px] grid-cols-2 gap-5 px-5 md:grid-cols-4">
      {cards.map((card) => (
        <div key={card.slug} className="bg-white p-5">
          <h2 className="mb-3 line-clamp-2 text-[21px] font-bold leading-tight text-[#0F1111]">
            Shop deals in {card.name}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {card.images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="h-[110px] w-full object-cover" loading="lazy" />
            ))}
          </div>
          <Link href={`/s?category=${card.slug}`} className="mt-3 inline-block text-[13px] text-[#007185] hover:text-[#C7511F]">
            See more
          </Link>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [hero, { items: topSellers }] = await Promise.all([heroProduct(), listProducts({ sort: "bestsellers", pageSize: 30 })]);

  return (
    <>
      <Hero product={hero} />
      <div className="bg-page-bg pb-10">
        <CategoryCards />
        <section aria-labelledby="top-sellers" className="mx-auto mt-8 max-w-[1500px] bg-white p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="top-sellers" className="text-[21px] font-bold text-[#0F1111]">
              Top Sellers on EcoMart
            </h2>
            <Link href="/s?sort=bestsellers" className="text-[13px] text-[#007185] hover:text-[#C7511F]">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {topSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
