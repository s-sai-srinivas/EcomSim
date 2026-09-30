import { NextResponse, type NextRequest } from "next/server";
import { listProducts, type SortKey } from "@/lib/db/products.repo";

const SORT_KEYS = ["bestsellers", "price_asc", "price_desc", "rating", "discount"];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const category = sp.get("category") ?? undefined;
  const sortParam = sp.get("sort") ?? "bestsellers";
  const sort = (SORT_KEYS.includes(sortParam) ? sortParam : "bestsellers") as SortKey;
  const page = Number.parseInt(sp.get("page") ?? "1", 10) || 1;
  const pageSize = Number.parseInt(sp.get("pageSize") ?? "24", 10) || 24;

  try {
    const result = await listProducts({ q, category, sort, page, pageSize });
    return NextResponse.json({
      data: result.items,
      meta: { total: result.total, page, pageSize },
    });
  } catch (e) {
    console.error("GET /api/products failed", e);
    return NextResponse.json({ error: "Failed to list products" }, { status: 500 });
  }
}
