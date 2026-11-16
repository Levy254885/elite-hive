import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { EVENTS, recordEvent, recordHit, type EventName, type Hit } from "@/lib/analytics";

export const runtime = "nodejs";
const done = () => new NextResponse(null, { status: 204 });

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|vercel|facebookexternalhit|whatsapp/i;

function sourceOf(ref: string): Hit["source"] {
  if (!ref) return "direct";
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase(); } catch { return "direct"; }
  if (/google\.|bing\.|duckduckgo|yahoo\.|yandex|ecosia|baidu/.test(host)) return "search";
  if (/facebook|instagram|twitter|^x\.com|t\.co$|linkedin|tiktok|youtube|youtu\.be|whatsapp|wa\.me|pinterest|reddit|telegram/.test(host)) return "social";
  return "referral";
}

/** Anonymous first party analytics. No cookies, no personal data. */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return done();
  const db = adminDb();
  if (!db) return done();
  let b: Record<string, unknown>;
  try { b = JSON.parse(await req.text()); } catch { return done(); }
  try {
    if (typeof b.event === "string") {
      if ((EVENTS as readonly string[]).includes(b.event)) await recordEvent(db, b.event as EventName);
      return done();
    }
    const path = typeof b.path === "string" ? b.path.split("?")[0].split("#")[0].slice(0, 200) : "";
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return done();
    const device: Hit["device"] = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";
    const referer = typeof b.ref === "string" ? b.ref.slice(0, 300) : "";
    let source: Hit["source"];
    if (b.first === true) {
      const own = (() => { try { return Boolean(referer) && new URL(referer).host === new URL(req.url).host; } catch { return false; } })();
      source = own ? undefined : sourceOf(referer);
    }
    await recordHit(db, { path, device, source, country: req.headers.get("x-vercel-ip-country") ?? undefined, newToday: b.newToday === true });
  } catch (err) {
    console.error("track failed", err);
  }
  return done();
}
