import Link from "next/link";
import { listProducts, type SortKey } from "@/lib/db/products.repo";
import { RatingStars } from "@/components/product/RatingStars";
import { formatCountIndian, discountPercent, formatINR } from "@/lib/utils/money";

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "bestsellers", label: "Featured" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "rating", label: "Avg. Customer Review" },
  { key: "discount", label: "Discount" },
];

interface SearchParams {
  k?: string;
  category?: string;
  sort?: string;
  page?: string;
}

function buildHref(base: SearchParams, patch: Partial<SearchParams>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...base, ...patch })) {
    if (value) qs.set(key, value);
  }
  return `/s?${qs.toString()}`;
}

function deliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function ResultRow({ p }: { p: Awaited<ReturnType<typeof listProducts>>["items"][number] }) {
  const off = discountPercent(p.listPrice, p.salePrice);
  const img = p.images[0];
  return (
    <div className="flex gap-4 border-b border-[#e7e7e7] pb-6">
      <Link
        href={`/product/${p.asin ?? p.id}`}
        className="flex h-[200px] w-[180px] shrink-0 items-center justify-center"
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.title} className="max-h-full max-w-full object-contain" loading="lazy" />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        {p.isBestSeller && (
          <span className="mb-1 inline-block bg-[#232F3E] px-2 py-0.5 text-[12px] text-white">
            Amazon&apos;s Choice
          </span>
        )}
        <Link href={`/product/${p.asin ?? p.id}`}>
          <h3 className="clamp-2 text-[18px] font-medium leading-snug text-[#0F1111] hover:text-[#C7511F]">
            {p.title}
          </h3>
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[14px] text-[#0F1111]">{p.ratingAvg.toFixed(1)}</span>
          <RatingStars value={p.ratingAvg} />
          <span className="text-[14px] text-[#007185]">
            ({formatCountIndian(p.ratingCount)})
          </span>
        </div>
        <p className="mt-1 text-[13px]">
          <span className="font-bold text-[#0F1111]">
            {formatCountIndian(Math.max(50, Math.round(p.ratingCount * 0.04)))}+ bought
          </span>{" "}
          <span className="text-[#565959]">in past month</span>
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[28px] font-normal tracking-tight text-[#0F1111]">
            {formatINR(p.salePrice)}
          </span>
          {off > 0 && (
            <>
              <span className="text-[13px] text-[#565959]">
                M.R.P.: <s>{formatINR(p.listPrice)}</s>
              </span>
              <span className="text-[14px] text-[#CC0C39]">({off}% off)</span>
            </>
          )}
        </div>
        <p className="mt-1 text-[13px] text-[#565959]">
          FREE delivery{" "}
          <span className="font-bold text-[#0F1111]">{deliveryDate(p.deliveryDaysSim)}</span>
        </p>
      </div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const sort = (SORT_OPTIONS.find((o) => o.key === sp.sort)?.key ?? "bestsellers") as SortKey;
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const { items, total } = await listProducts({
    q: sp.k,
    category: sp.category,
    sort,
    page,
    pageSize: 16,
  });
  const totalPages = Math.ceil(total / 16);

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-[1500px] gap-5 px-5 py-3">
        {/* Filter rail */}
        <aside className="hidden w-[240px] shrink-0 space-y-5 md:block">
          <div>
            <h4 className="mb-1 text-[14px] font-bold text-[#0F1111]">Results</h4>
            <p className="text-[13px] text-[#565959]">
              Check each product page for other buying options.
            </p>
          </div>
          <div>
            <h4 className="mb-1 text-[14px] font-bold text-[#0F1111]">Sort by</h4>
            <ul className="space-y-1">
              {SORT_OPTIONS.map((o) => (
                <li key={o.key}>
                  <Link
                    href={buildHref(sp, { sort: o.key, page: undefined })}
                    className={`text-[14px] ${o.key === sort ? "font-bold text-[#0F1111]" : "text-[#0F1111] hover:text-[#C7511F]"}`}
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Results column */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[16px] text-[#0F1111]">
            1-{items.length} of {total > 1000 ? "over " : ""}
            {formatCountIndian(total)} results
            {sp.k ? (
              <>
                {" "}
                for <span className="font-bold text-[#C7511F]">&ldquo;{sp.k}&rdquo;</span>
              </>
            ) : null}
          </p>

          <div className="mb-3 flex justify-end">
            <Link
              href={buildHref(sp, { sort: sort === "bestsellers" ? "price_asc" : "bestsellers", page: undefined })}
              className="rounded-[8px] border border-[#D5D9D9] px-4 py-1.5 text-[13px] text-[#0F1111] shadow-sm hover:bg-[#F7FAFA]"
            >
              Sort by: {SORT_OPTIONS.find((o) => o.key === sort)?.label}
            </Link>
          </div>

          <div className="space-y-6">
            {items.map((p) => (
              <ResultRow key={p.id} p={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-6 flex justify-center gap-2 pb-8" aria-label="Pagination">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={buildHref(sp, { page: String(n) })}
                  className={`rounded border px-3 py-1.5 text-[14px] ${
                    n === page
                      ? "border-[#e77600] bg-[#FFF8F0] font-bold text-[#0F1111]"
                      : "border-[#D5D9D9] text-[#007185]"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
