import { NextResponse } from "next/server";
import { getProductDetail } from "@/lib/db/products.repo";

/** Next 16: params are async. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const product = await getProductDetail(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  } catch (e) {
    console.error("GET /api/products/[id] failed", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
