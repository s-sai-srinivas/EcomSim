import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const jar = await cookies();
  const session = await getIronSession<{ userId?: string; email?: string; name?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
    cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "lax", httpOnly: true, path: "/" },
  });
  session.userId = user.id;
  session.email = user.email ?? undefined;
  session.name = user.name ?? undefined;
  await session.save();

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}
