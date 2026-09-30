import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

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

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ data: addresses });
}

export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const fullName = String(body?.fullName ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const pincode = String(body?.pincode ?? "").trim();
  const city = String(body?.city ?? "").trim();
  const state = String(body?.state ?? "").trim();
  const line1 = String(body?.line1 ?? "").trim();
  const line2 = String(body?.line2 ?? "").trim();
  const landmark = String(body?.landmark ?? "").trim();
  const type = String(body?.type ?? "HOME").toUpperCase() === "WORK" ? "WORK" : "HOME";

  if (!fullName || !phone || !pincode || !city || !state || !line1) {
    return NextResponse.json({ error: "Missing required address fields." }, { status: 400 });
  }

  const existing = await prisma.address.count({ where: { userId } });
  const isDefault = existing === 0;

  const addr = await prisma.address.create({
    data: { userId, fullName, phone, pincode, city, state, line1, line2: line2 || null, landmark: landmark || null, type, isDefault },
  });
  return NextResponse.json({ data: addr }, { status: 201 });
}
