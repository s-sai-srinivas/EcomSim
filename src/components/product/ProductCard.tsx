import Link from "next/link";
import type { ProductListItem } from "@/lib/db/products.repo";
import { formatCountIndian, discountPercent, formatINR } from "@/lib/utils/money";
import { RatingStars } from "./RatingStars";

function deliveryDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function ProductCard({ product }: { product: ProductListItem }) {
  const off = discountPercent(product.listPrice, product.salePrice);
  const img = product.images[0];
  return (
    <div className="group relative flex h-full flex-col bg-white p-3 transition-shadow hover:shadow-[0_4px_12px_rgba(15,17,17,0.15)]">
      <Link href={`/product/${product.asin ?? product.id}`} className="block">
        <div className="mb-2 flex h-40 items-center justify-center overflow-hidden bg-white">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.title}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <span className="text-3xl font-bold text-[#D5D9D9]">
              {product.title.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {product.isBestSeller && (
          <span className="mb-1 inline-block bg-[#CC6600] px-1.5 py-0.5 text-[11px] font-bold text-white">
            #1 Best Seller
          </span>
        )}
        <h3 className="clamp-2 text-[16px] leading-[1.3] text-[#0F1111] group-hover:text-[#C7511F]">
          {product.title}
        </h3>
      </Link>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="text-[13px] font-medium text-[#0F1111]">
          {product.ratingAvg.toFixed(1)}
        </span>
        <RatingStars value={product.ratingAvg} />
        <span className="text-[13px] text-[#007185]">
          ({formatCountIndian(product.ratingCount)})
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[21px] font-medium tracking-tight text-[#0F1111]">
          {formatINR(product.salePrice)}
        </span>
        {off > 0 && (
          <>
            <span className="text-[12px] text-[#565959]">
              M.R.P.: <s>{formatINR(product.listPrice)}</s>
            </span>
            <span className="text-[14px] font-medium text-[#CC0C39]">({off}% off)</span>
          </>
        )}
      </div>
      <p className="mt-auto pt-1.5 text-[12px] text-[#565959]">
        FREE delivery{" "}
        <span className="font-bold text-[#0F1111]">{deliveryDate(product.deliveryDaysSim)}</span>
      </p>
    </div>
  );
}
