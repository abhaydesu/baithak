import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE = "vybrid-admin";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** True when `key` equals ANALYTICS_KEY. Always false if that isn't set. */
export function keyMatches(key: string | undefined) {
  const secret = process.env.ANALYTICS_KEY;
  if (!secret || !key) return false;
  return safeEqual(key, secret);
}

function sign(expires: string, secret: string) {
  return createHmac("sha256", secret).update(`session:${expires}`).digest("hex");
}

/** Signed, expiring cookie value. It never contains the key itself. */
export function createSession(now = Date.now()) {
  const secret = process.env.ANALYTICS_KEY;
  if (!secret) return undefined;
  const expires = String(Math.floor(now / 1000) + SESSION_SECONDS);
  return `${expires}.${sign(expires, secret)}`;
}

/** True for an unexpired token signed with the current ANALYTICS_KEY. */
export function sessionValid(token: string | undefined, now = Date.now()) {
  const secret = process.env.ANALYTICS_KEY;
  if (!secret || !token) return false;
  const [expires, signature, ...rest] = token.split(".");
  if (!expires || !signature || rest.length || !/^\d+$/.test(expires)) return false;
  if (Number(expires) * 1000 < now) return false;
  return safeEqual(signature, sign(expires, secret));
}
