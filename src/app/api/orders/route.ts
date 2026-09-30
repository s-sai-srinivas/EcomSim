import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { deliveryFeeFor, type SpeedTier } from "@/lib/services/delivery";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

async function requireUserId(): Promise<string | null> {
  const jar = await cookies();
  const session = await getIronSession<{ userId?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  return session.userId ?? null;
}

function orderNumber(): string {
  const rand = () => Math.floor(Math.random() * 900000 + 100000);
  return `171-${rand()}-${rand()}${Math.floor(Math.random() * 10)}`;
}

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, payments: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ data: order });
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" },
    include: { items: true, payments: true },
  });
  return NextResponse.json({ data: orders });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const addressId: string | null = body?.addressId ?? null;
  const speedTier: SpeedTier = ["STANDARD", "FASTER", "SAME_DAY"].includes(body?.speedTier)
    ? body.speedTier
    : "STANDARD";
  const paymentMethod: string = String(body?.paymentMethod ?? "COD").toUpperCase();
  const items: Array<{ productId: string; qty: number }> = Array.isArray(body?.items) ? body.items : [];

  if (!addressId) return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
  if (items.length === 0) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) return NextResponse.json({ error: "Address not found." }, { status: 400 });

  // Fetch products for pricing snapshot
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { OR: [{ id: { in: productIds } }, { asin: { in: productIds } }] },
  });
  const byKey = new Map<string, (typeof products)[number]>();
  for (const p of products) {
    byKey.set(p.id, p);
    if (p.asin) byKey.set(p.asin, p);
  }

  let itemsTotal = 0;
  const orderItemsData: Array<{
    productId: string;
    titleSnapshot: string;
    imageSnapshot: string | null;
    priceAtPurchase: number;
    qty: number;
  }> = [];

  for (const it of items) {
    const p = byKey.get(it.productId);
    if (!p) return NextResponse.json({ error: `Product not found: ${it.productId}` }, { status: 400 });
    const qty = Math.max(1, Math.min(10, Number(it.qty) || 1));
    itemsTotal += p.salePrice * qty;
    let img: string | null = null;
    try {
      const arr = p.images ? (JSON.parse(p.images) as string[]) : [];
      img = arr[0] ?? null;
    } catch {}
    orderItemsData.push({
      productId: p.id,
      titleSnapshot: p.title,
      imageSnapshot: img,
      priceAtPurchase: p.salePrice,
      qty,
    });
  }

  const deliveryFee = deliveryFeeFor(speedTier, itemsTotal, address.pincode);
  const grandTotal = itemsTotal + deliveryFee;

  // ETA
  const eta = new Date();
  eta.setDate(eta.getDate() + (speedTier === "SAME_DAY" ? 0 : speedTier === "FASTER" ? 2 : 4));

  const id = orderNumber();
  const txnId = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const order = await prisma.order.create({
    data: {
      id,
      userId,
      status: paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
      addressSnapshot: JSON.stringify(address),
      itemsTotal,
      deliveryFee,
      discount: 0,
      grandTotal,
      speedTier,
      estDeliveryAt: eta,
      items: { create: orderItemsData },
      payments: {
        create: {
          method: paymentMethod,
          state: paymentMethod === "COD" ? "CAPTURED" : "INITIATED",
          amount: grandTotal,
          txnId,
          maskedDetails: JSON.stringify({ method: paymentMethod }),
        },
      },
    },
    include: { items: true, payments: true },
  });

  return NextResponse.json({ data: order }, { status: 201 });
}
