import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils/money";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jar = await cookies();
  const session = await getIronSession<{ userId?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  if (!session.userId) notFound();

  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: { items: true },
  });
  if (!order) notFound();

  const addr = JSON.parse(order.addressSnapshot as string) as {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <header className="flex items-center gap-2 border-b border-[#DDD] bg-white px-6 py-3">
        <Link href="/" className="text-[22px] font-bold tracking-tight text-[#0F1111]">
          EcoMart<span className="text-[#FF9900]">.in</span>
        </Link>
        <span className="text-[18px] font-normal text-[#067D62]">Order confirmed</span>
      </header>

      <div className="mx-auto max-w-[800px] px-4 py-6">
        <div className="rounded-[8px] border border-[#067D62] bg-white p-6">
          <p className="flex items-center gap-2 text-[18px] font-bold text-[#067D62]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#067D62] text-[13px] text-white">
              ✓
            </span>{" "}
            Order placed, thanks!
          </p>
          <p className="mt-2 text-[14px] text-[#0F1111]">
            Confirmation will be sent to your email. You can track your order in{" "}
            <Link href="/orders" className="text-[#007185] hover:text-[#C7511F]">
              Your Orders
            </Link>
            .
          </p>
          <div className="mt-4 rounded bg-[#F0F2F2] p-4 text-[14px]">
            <p>
              <span className="text-[#565959]">Order #</span>{" "}
              <span className="font-bold text-[#0F1111]">{order.id}</span>
            </p>
            <p className="mt-1 text-[#565959]">
              Deliver to <span className="font-bold text-[#0F1111]">{addr.fullName}</span> — {addr.line1},{" "}
              {addr.city}, {addr.state} {addr.pincode}
            </p>
            <p className="text-[#565959]">
              Estimated delivery:{" "}
              <span className="font-bold text-[#0F1111]">
                {order.estDeliveryAt
                  ? new Date(order.estDeliveryAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  : "—"}
              </span>
            </p>
          </div>
          <div className="mt-4 divide-y divide-[#EAEDED] rounded border border-[#EAEDED]">
            {order.items.map((it) => (
              <div key={it.id} className="flex gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.imageSnapshot && <img src={it.imageSnapshot} alt={it.titleSnapshot} className="h-16 w-16 object-contain" />}
                <span className="flex-1 text-[13px] text-[#0F1111]">{it.titleSnapshot}</span>
                <span className="text-[13px] font-bold text-[#0F1111]">Qty {it.qty}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-right text-[18px] font-bold text-[#B12704]">{formatINR(order.grandTotal)}</p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/orders"
              className="rounded-[8px] bg-cta-yellow px-6 py-2 text-[13px] font-medium text-[#0F1111] hover:bg-[#F7CA00]"
            >
              Go to Your Orders
            </Link>
            <Link
              href="/s"
              className="rounded-[8px] border border-[#D5D9D9] bg-white px-6 py-2 text-[13px] text-[#0F1111] hover:bg-[#F7FAFA]"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
