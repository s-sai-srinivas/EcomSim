import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const COOKIE_NAME = "ecosim_session";
function getPassword(): string {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? s : "dev-insecure-ecosim-session-password-32chars!!";
}

export async function POST() {
  const jar = await cookies();
  const session = await getIronSession(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  session.destroy();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const jar = await cookies();
  const session = await getIronSession(jar as never, {
    cookieName: COOKIE_NAME,
    password: getPassword(),
  });
  session.destroy();
  return NextResponse.json({ ok: true });
}
