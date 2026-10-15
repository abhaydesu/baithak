import { connectToDatabase } from "@/lib/mongoose";
import { EVENT_TYPES, type TrackPayload } from "@/lib/analytics/events";
import { AnalyticsEvent } from "@/lib/analytics/model";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;

const short = (v: unknown, max: number) =>
  typeof v === "string" && v ? v.slice(0, max) : undefined;

function deviceOf(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

/** Referrer host only, and only when it's from another site. */
function externalHost(referrer: string | undefined, host: string | null) {
  if (!referrer) return undefined;
  try {
    const h = new URL(referrer).host;
    return h === host ? undefined : h;
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });

  // 120 events per minute per address is far above real use.
  if (!rateLimit(`track:${clientIp(request.headers)}`, 120, 60_000)) {
    return new Response(null, { status: 429 });
  }

  let body: Partial<TrackPayload>;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const path = short(body.path, 200);
  const vid = short(body.vid, 64);
  const sid = short(body.sid, 64);
  if (
    !EVENT_TYPES.includes(body.type as never) ||
    !path?.startsWith("/") ||
    !vid ||
    !sid
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    if (!(await connectToDatabase())) return new Response(null, { status: 204 });
    await AnalyticsEvent.create({
      type: body.type,
      path,
      game: short(body.game, 40),
      referrer: externalHost(short(body.referrer, 300), request.headers.get("host")),
      source: short(body.source, 40),
      vid,
      sid,
      device: deviceOf(ua),
      country: short(request.headers.get("x-vercel-ip-country"), 2),
    });
  } catch (error) {
    console.error("track failed", error);
  }
  return new Response(null, { status: 204 });
}
