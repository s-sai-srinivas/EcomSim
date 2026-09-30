import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

export async function GET() {
  const jar = await cookies();
  const session = await getIronSession<{ userId?: string; email?: string; name?: string }>(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  if (!session.userId) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: session.userId, email: session.email, name: session.name } });
}
