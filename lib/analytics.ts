import { FieldPath, FieldValue, type Firestore } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "./firebase-admin";
import { categoryLabel } from "./categories";
import { listAllPosts } from "./posts";
import { listAllProjects } from "./projects-db";
import { PROJECTS } from "./projects";
import type { AnalyticsData, DayPoint, PageStat, Slice } from "./analytics-types";

const COL = "analytics_daily";

/** Day key in Kenya time (UTC+3). */
export const dayKey = (d = new Date()) => new Date(d.getTime() + 3 * 3600 * 1000).toISOString().slice(0, 10);
const encodeKey = (s: string) => s.replace(/\//g, "|").replace(/[.\[\]*`~#$]/g, "_").slice(0, 110) || "|";
const decodeKey = (s: string) => s.replace(/\|/g, "/");

export type Hit = { path: string; device: "mobile" | "tablet" | "desktop"; source?: "direct" | "search" | "social" | "referral"; country?: string; newToday: boolean };
export const EVENTS = ["email_click", "quote_click", "contact_form"] as const;
export type EventName = (typeof EVENTS)[number];

export async function recordHit(db: Firestore, hit: Hit) {
  const inc = (n = 1) => FieldValue.increment(n);
  const data: Record<string, unknown> = {
    views: inc(),
    visitors: inc(hit.newToday ? 1 : 0),
    pages: { [encodeKey(hit.path)]: inc() },
    devices: { [hit.device]: inc() },
  };
  if (hit.source) data.sources = { [hit.source]: inc() };
  if (hit.country && /^[A-Z]{2}$/.test(hit.country)) data.countries = { [hit.country]: inc() };
  await db.collection(COL).doc(dayKey()).set(data, { merge: true });
}

export async function recordEvent(db: Firestore, name: EventName) {
  await db.collection(COL).doc(dayKey()).set({ events: { [name]: FieldValue.increment(1) } }, { merge: true });
}

type Day = { views?: number; visitors?: number; pages?: Record<string, number>; devices?: Record<string, number>; sources?: Record<string, number>; countries?: Record<string, number>; events?: Record<string, number> };

const addDays = (key: string, n: number) => new Date(new Date(key + "T00:00:00Z").getTime() + n * 86400000).toISOString().slice(0, 10);
const sumMap = (into: Record<string, number>, m?: Record<string, number>) => {
  if (m) for (const [k, v] of Object.entries(m)) into[k] = (into[k] ?? 0) + (Number(v) || 0);
};
const toSlices = (m: Record<string, number>, label: (k: string) => string = (k) => k, limit = 8): Slice[] =>
  Object.entries(m).map(([k, v]) => ({ label: label(k), value: v })).filter((s) => s.value > 0).sort((a, b) => b.value - a.value).slice(0, limit);

function totalsOf(days: Day[]) {
  const t = { views: 0, visitors: 0, contacts: 0, emailClicks: 0, quoteClicks: 0 };
  for (const d of days) {
    t.views += d.views ?? 0;
    t.visitors += d.visitors ?? 0;
    t.contacts += d.events?.contact_form ?? 0;
    t.emailClicks += d.events?.email_click ?? 0;
    t.quoteClicks += d.events?.quote_click ?? 0;
  }
  return t;
}

export async function loadAnalytics(range: number): Promise<AnalyticsData> {
  const db = adminDb();
  const today = dayKey();
  const start = addDays(today, -(range - 1));
  const prevStart = addDays(start, -range);
  const days: Record<string, Day> = {};
  let collecting = Boolean(db);

  if (db) {
    try {
      const snap = await db.collection(COL).where(FieldPath.documentId(), ">=", prevStart).where(FieldPath.documentId(), "<=", today).get();
      snap.docs.forEach((d) => (days[d.id] = d.data() as Day));
    } catch (err) {
      console.error("analytics read failed", err);
      collecting = false;
    }
  }

  const series: DayPoint[] = [];
  const current: Day[] = [];
  for (let i = 0; i < range; i++) {
    const k = addDays(start, i);
    const d = days[k] ?? {};
    current.push(d);
    series.push({ date: k, views: d.views ?? 0, visitors: d.visitors ?? 0 });
  }
  const previous: Day[] = [];
  for (let i = 0; i < range; i++) previous.push(days[addDays(prevStart, i)] ?? {});

  const devices: Record<string, number> = {}, sources: Record<string, number> = {}, countries: Record<string, number> = {}, pageMap: Record<string, number> = {};
  for (const d of current) {
    sumMap(devices, d.devices);
    sumMap(sources, d.sources);
    sumMap(countries, d.countries);
    sumMap(pageMap, d.pages);
  }

  const [posts, projects] = await Promise.all([listAllPosts().catch(() => []), listAllProjects().catch(() => [])]);
  const postBySlug = new Map(posts.map((p) => [p.slug, p]));
  const projectTitles = new Map<string, string>([...PROJECTS.map((p) => [p.slug, p.title] as [string, string]), ...projects.map((p) => [p.slug, p.title] as [string, string])]);

  const pages: PageStat[] = Object.entries(pageMap).map(([k, views]) => {
    const path = decodeKey(k);
    let label = path === "/" ? "Home" : path;
    let kind: PageStat["kind"] = path === "/" ? "home" : "page";
    const art = path.match(/^\/newsroom\/(.+)$/);
    const prj = path.match(/^\/portfolio\/(.+)$/);
    if (art) { kind = "article"; label = postBySlug.get(art[1])?.title ?? path; }
    else if (prj) { kind = "project"; label = projectTitles.get(prj[1]) ?? path; }
    else if (path !== "/") label = path.replace(/^\//, "").replace(/\//g, " / ").replace(/^./, (c) => c.toUpperCase());
    return { path, label, kind, views };
  }).sort((a, b) => b.views - a.views);

  const byCat: Record<string, number> = {};
  for (const p of posts) if (p.status === "published") byCat[p.category] = (byCat[p.category] ?? 0) + 1;

  let dbOk = false;
  const t0 = Date.now();
  if (db) {
    try { await db.collection("posts").limit(1).get(); dbOk = true; } catch { dbOk = false; }
  }
  const ms = Date.now() - t0;

  return {
    range,
    generatedAt: new Date().toISOString(),
    collecting,
    series,
    totals: totalsOf(current),
    previous: totalsOf(previous),
    devices: toSlices(devices, (k) => k[0].toUpperCase() + k.slice(1)),
    sources: toSlices(sources, (k) => ({ direct: "Direct", search: "Search", social: "Social", referral: "Other sites" })[k] ?? k),
    countries: toSlices(countries, (k) => k),
    pages: pages.slice(0, 12),
    topArticles: pages.filter((p) => p.kind === "article").slice(0, 6).map((p) => ({ ...p, category: categoryLabel(postBySlug.get(p.path.replace("/newsroom/", ""))?.category ?? "news") })),
    topProjects: pages.filter((p) => p.kind === "project").slice(0, 6),
    content: {
      published: posts.filter((p) => p.status === "published").length,
      drafts: posts.filter((p) => p.status === "draft").length,
      projectsPublished: projects.filter((p) => p.status === "published").length,
      projectsDrafts: projects.filter((p) => p.status === "draft").length,
      byCategory: toSlices(byCat, categoryLabel, 8),
    },
    system: {
      database: { ok: dbOk, ms },
      auth: adminAuth() !== null,
      images: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      email: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL),
      admins: (process.env.ADMIN_EMAILS ?? "").split(",").filter((s) => s.trim()).length,
      deploy: {
        env: process.env.VERCEL_ENV ?? "local",
        commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7),
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? "",
        region: process.env.VERCEL_REGION ?? "",
      },
    },
  };
}
