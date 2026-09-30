import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatINR } from "@/lib/utils/money";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "Awaiting payment",
    CONFIRMED: "Confirmed",
    PACKED: "Packed",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[status] ?? status;
}

export default async function OrdersPage() {
  const jar = await cookies();
  const session = await getIronSession<{ userId?: string; email?: string; name?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  if (!session.userId) redirect("/signin?next=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { placedAt: "desc" },
    include: { items: true, payments: true },
  });

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="mx-auto max-w-[1000px] px-4 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[28px] font-normal text-[#0F1111]">Your Orders</h1>
          <Link href="/s" className="text-[13px] text-[#007185] hover:text-[#C7511F]">
            Continue shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-[8px] border border-[#D5D9D9] bg-white p-8 text-center">
            <p className="text-[14px] text-[#565959]">You have not placed any orders yet.</p>
            <Link
              href="/s"
              className="mt-4 inline-block rounded-[8px] bg-cta-yellow px-6 py-2 text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="overflow-hidden rounded-[8px] border border-[#D5D9D9] bg-white">
                <div className="flex flex-wrap gap-4 bg-[#F0F2F2] px-4 py-3 text-[12px]">
                  <span>
                    <span className="text-[#565959]">ORDER PLACED</span>
                    <br />
                    <span className="text-[#0F1111]">
                      {new Date(order.placedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span>
                    <span className="text-[#565959]">TOTAL</span>
                    <br />
                    <span className="text-[#0F1111]">{formatINR(order.grandTotal)}</span>
                  </span>
                  <span className="ml-auto text-right">
                    <span className="text-[#565959]">ORDER # {order.id}</span>
                    <br />
                    <span className="font-bold text-[#067D62]">{statusLabel(order.status)}</span>
                  </span>
                </div>
                <ul className="divide-y divide-[#EAEDED]">
                  {order.items.map((it) => (
                    <li key={it.id} className="flex gap-3 px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {it.imageSnapshot && <img src={it.imageSnapshot} alt={it.titleSnapshot} className="h-16 w-16 object-contain" />}
                      <span className="flex-1 text-[13px] text-[#007185]">{it.titleSnapshot}</span>
                      <span className="text-[13px] text-[#565959]">Qty {it.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
