import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/db/products.repo";
import { prettifyCategoryName } from "@/lib/db/products.repo";
import { WishlistButton } from "@/components/product/WishlistButton";
import { RatingStars } from "@/components/product/RatingStars";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { formatCountIndian, discountPercent, formatINR } from "@/lib/utils/money";

function deliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function fastestDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getProductDetail(id);
  if (!p) notFound();

  const off = discountPercent(p.listPrice, p.salePrice);
  const img = p.images[0];
  const crumbs = p.categoryPath.split(">").filter(Boolean);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] px-5 pb-10">
        <nav className="flex flex-wrap items-center gap-1 py-3 text-[12px] text-[#565959]" aria-label="Breadcrumb">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && <span>›</span>}
              <Link href={`/s?category=${c}`} className="text-[#007185] hover:text-[#C7511F]">
                {prettifyCategoryName(c)}
              </Link>
            </span>
          ))}
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex gap-3 lg:w-[40%]">
            <div className="flex flex-col gap-2">
              {p.images.slice(0, 6).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  className={`h-[46px] w-[46px] cursor-pointer rounded-[4px] border object-contain p-0.5 ${i === 0 ? "border-[2px] border-[#007185] shadow-[0_0_3px_2px_rgba(0,113,133,0.3)]" : "border-[#D5D9D9]"}`}
                />
              ))}
            </div>
            <div className="flex flex-1 items-start justify-center">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={p.title} className="max-h-[520px] w-full object-contain" />
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1 lg:w-[38%]">
            <h1 className="text-[24px] font-normal leading-[1.3] text-[#0F1111]">{p.title}</h1>
            {p.brand && (
              <p className="mt-1 text-[14px]">
                Visit the{" "}
                <Link href={`/s?q=${encodeURIComponent(p.brand)}`} className="text-[#007185] hover:text-[#C7511F]">
                  {p.brand} Store
                </Link>
              </p>
            )}
            <div className="mt-1 flex items-center gap-2 border-b border-[#e7e7e7] pb-3">
              <span className="text-[14px] font-medium">{p.ratingAvg.toFixed(1)}</span>
              <RatingStars value={p.ratingAvg} size={16} />
              <a href="#reviews" className="text-[14px] text-[#007185] hover:text-[#C7511F]">
                ({formatCountIndian(p.ratingCount)})
              </a>
            </div>
            {p.isBestSeller && (
              <span className="mt-2 inline-block bg-[#232F3E] px-2 py-0.5 text-[12px] text-white">
                Amazon&apos;s Choice
              </span>
            )}
            <p className="mt-2 text-[14px]">
              <span className="font-bold">{formatCountIndian(Math.max(50, Math.round(p.ratingCount * 0.04)))}+</span>{" "}
              <span className="text-[#565959]">bought in past month</span>
            </p>

            <hr className="my-3 border-[#e7e7e7]" />

            <div className="flex flex-wrap items-baseline gap-2">
              {off > 0 && <span className="text-[26px] font-light text-[#CC0C39]">-{off}%</span>}
              <span className="text-[28px] font-medium tracking-tight text-[#0F1111]">
                {formatINR(p.salePrice)}
              </span>
            </div>
            {off > 0 && (
              <p className="text-[13px] text-[#565959]">
                M.R.P.: <s>{formatINR(p.listPrice)}</s>
              </p>
            )}
            <p className="mt-1 text-[14px] text-[#565959]">Inclusive of all taxes</p>

            {p.bullets.length > 0 && (
              <div className="mt-5">
                <h2 className="mb-2 text-[20px] font-bold text-[#0F1111]">About this item</h2>
                <ul className="list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-[#0F1111]">
                  {p.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:w-[300px]">
            <div className="rounded-[8px] border border-[#D5D9D9] p-4">
              <p className="text-[26px] font-medium text-[#0F1111]">{formatINR(p.salePrice)}</p>
              <p className="mt-2 text-[14px] text-[#565959]">
                FREE delivery{" "}
                <span className="font-bold text-[#0F1111]">{deliveryDate(p.deliveryDaysSim)}</span>
              </p>
              <p className="text-[14px] text-[#565959]">
                Or fastest delivery{" "}
                <span className="font-bold text-[#0F1111]">{fastestDate()}</span>
              </p>
              <p className="mt-3 text-[18px] font-medium text-success-green">In stock</p>

              <AddToCartButton productId={p.asin ?? p.id} />
              <div className="mt-2">
                <WishlistButton productId={p.asin ?? p.id} />
              </div>

              <dl className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[#565959]">Ships from</dt>
                  <dd className="text-[#0F1111]">EcoMart</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[#565959]">Sold by</dt>
                  <dd className="text-[#0F1111]">EcoMart Retail</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-[#565959]">Payment</dt>
                  <dd>
                    <a href="#" className="text-[#007185] hover:text-[#C7511F]">
                      Secure transaction
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {p.related.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-[21px] font-bold text-[#0F1111]">Customers also viewed</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
              {p.related.slice(0, 6).map((r) => (
                <Link
                  key={r.id}
                  href={`/product/${r.asin ?? r.id}`}
                  className="block rounded border border-[#e7e7e7] p-3 hover:shadow-md"
                >
                  <div className="flex h-28 items-center justify-center">
                    {r.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.images[0]} alt="" className="max-h-full object-contain" loading="lazy" />
                    ) : null}
                  </div>
                  <p className="clamp-2 mt-2 text-[13px] text-[#007185]">{r.title}</p>
                  <p className="mt-1 text-[14px] font-medium text-[#0F1111]">{formatINR(r.salePrice)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
