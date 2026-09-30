import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

async function setSession(userId: string, email: string | null, name: string | null) {
  const jar = await cookies();
  const session = await getIronSession<{ userId?: string; email?: string; name?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
    cookieOptions: { secure: process.env.NODE_ENV === "production", sameSite: "lax", httpOnly: true, path: "/" },
  });
  session.userId = userId;
  session.email = email ?? undefined;
  session.name = name ?? undefined;
  await session.save();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name: name || email.split("@")[0], passwordHash },
  });
  await setSession(user.id, user.email, user.name);
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}
