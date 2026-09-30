import type { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
}

export const COOKIE_NAME = "ecosim_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export function getPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  return "dev-insecure-ecosim-session-password-32chars!!";
}

export function sessionOptions(): SessionOptions {
  return {
    cookieName: COOKIE_NAME,
    password: getPassword(),
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      httpOnly: true,
      path: "/",
    },
  };
}
