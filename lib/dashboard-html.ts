import type { AnalyticsData, DayPoint, Slice } from "./analytics-types";

/**
 * Builds the analytics dashboard markup (pure functions, no dependencies) so it can
 * be tested and rendered anywhere. Every dynamic text is escaped.
 */
const esc = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e4 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k" : n.toLocaleString("en-US"));
const BRAND = "#0E7C66";
const COLORS = ["#0E7C66", "#8FD1B8", "#F28B82", "#F2C879", "#B7A5E6", "#8DB9EA"];

const ICON = {
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.9.8 3 2.7 3 5.1"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M12 15 9 12c1-3 3-6 8-8 4-.5 4 .5 3.5 3.5-2 5-5 7-8.5 8Z"/><circle cx="15.5" cy="8.5" r="1.3"/>',
};
type IconKey = keyof typeof ICON;
const svgIcon = (k: IconKey) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

const delta = (cur: number, prev: number) => {
  if (!prev && !cur) return `<span class="dl flat">No change</span>`;
  if (!prev) return `<span class="dl up">New</span>`;
  const p = Math.round(((cur - prev) / prev) * 100);
  return `<span class="dl ${p > 0 ? "up" : p < 0 ? "dn" : "flat"}">${p > 0 ? "▲" : p < 0 ? "▼" : "•"} ${Math.abs(p)}%</span>`;
};

const niceMax = (m: number) => {
  if (m <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / pow;
  return (n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 3 ? 3 : n <= 5 ? 5 : 10) * pow;
};

const W = 620, H = 330, L = 44, R = 12, T = 16, B = 30;
const shortDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], mx = (x0 + x1) / 2;
    d += ` C${mx.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return d;
}

function areaChart(series: DayPoint[]) {
  const n = series.length;
  const max = niceMax(Math.max(0, ...series.map((s) => Math.max(s.views, s.visitors))));
  const x = (i: number) => L + (i * (W - L - R)) / Math.max(1, n - 1);
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const vp = series.map((s, i) => [x(i), y(s.views)] as [number, number]);
  const up = series.map((s, i) => [x(i), y(s.visitors)] as [number, number]);
  const grid = [0, 1, 2, 3, 4].map((k) => {
    const v = (max * k) / 4, yy = y(v);
    return `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 10}" y="${yy + 4}" text-anchor="end" class="ax">${fmt(Math.round(v))}</text>`;
  }).join("");
  const step = Math.max(1, Math.round((n - 1) / 5));
  const xl = series.map((s, i) => (i % step === 0 || i === n - 1) && (n - 1 - i >= step * 0.6 || i === n - 1) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ax">${shortDate(s.date)}</text>` : "").join("");
  const dots = n <= 31 ? vp.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.6" class="mk"/>`).join("") : "";
  const none = series.every((s) => s.views === 0);
  const peak = series.reduce((b, s, i) => (s.views > series[b].views ? i : b), 0);
  const data = encodeURIComponent(JSON.stringify(series.map((s) => [s.date, s.views, s.visitors])));
  return `<div class="ch" data-s="${data}" data-max="${max}" data-w="${W}" data-h="${H}" data-l="${L}" data-r="${R}" data-t="${T}" data-b="${B}" data-peak="${peak}">
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Page views and visitors over time">
<defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BRAND}" stop-opacity=".16"/><stop offset="1" stop-color="${BRAND}" stop-opacity="0"/></linearGradient></defs>
${grid}${xl}
<path d="${smooth(vp)} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z" fill="url(#gv)"/>
<path d="${smooth(up)}" fill="none" stroke="#8FD1B8" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>
<path d="${smooth(vp)}" fill="none" stroke="${BRAND}" stroke-width="2.6" stroke-linecap="round"/>
${dots}
<g class="hv" style="display:none"><line class="hl" y1="${T}" y2="${H - B}"/><circle class="h1" r="6.5"/></g>
</svg>
<div class="tt" style="display:none"></div>
${none ? `<div class="empty">No visits recorded yet. The chart fills in as people browse the live website.</div>` : ""}
</div>
<div class="lg"><span><i style="background:${BRAND}"></i>Page views</span><span><i class="dash"></i>Visitors</span></div>`;
}

function donut(items: Slice[], centre: string) {
  const total = items.reduce((a, b) => a + b.value, 0);
  const r = 64, c = 2 * Math.PI * r;
  let off = 0;
  const segs = total
    ? items.map((s, i) => {
        const len = (s.value / total) * c;
        const vis = Math.max(0, len - 4);
        const el = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="22" stroke-dasharray="${vis.toFixed(2)} ${(c - vis).toFixed(2)}" stroke-dashoffset="${(-off - 2).toFixed(2)}" transform="rotate(-90 90 90)"/>`;
        off += len;
        return el;
      }).join("")
    : "";
  const legend = items.length
    ? items.map((s, i) => `<li><i style="background:${COLORS[i % COLORS.length]}"></i><span>${esc(s.label)}</span><b>${total ? Math.round((s.value / total) * 100) : 0}%</b></li>`).join("")
    : `<li class="mt">No data yet</li>`;
  return `<div class="dn"><svg viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="${r}" fill="none" stroke="#EEF3F0" stroke-width="22"/>${segs}<text x="90" y="88" text-anchor="middle" class="dv">${fmt(total)}</text><text x="90" y="108" text-anchor="middle" class="dk">${esc(centre)}</text></svg><ul>${legend}</ul></div>`;
}

function hbars(items: { label: string; value: number; sub?: string }[], empty: string) {
  if (!items.length) return `<p class="mt">${esc(empty)}</p>`;
  const max = Math.max(...items.map((i) => i.value), 1);
  return `<ul class="hb">${items.map((it) => `<li><div class="hr"><span class="hn" title="${esc(it.label)}">${esc(it.label)}${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</span><b>${fmt(it.value)}</b></div><div class="bt"><i style="width:${Math.max(3, (it.value / max) * 100)}%"></i></div></li>`).join("")}</ul>`;
}

const NAMES: Record<string, string> = { KE: "Kenya", US: "United States", GB: "United Kingdom", TZ: "Tanzania", UG: "Uganda", NG: "Nigeria", ZA: "South Africa", IN: "India", DE: "Germany", FR: "France", CA: "Canada", AE: "UAE", CN: "China", ET: "Ethiopia", RW: "Rwanda", GH: "Ghana", EG: "Egypt", AU: "Australia", NL: "Netherlands" };
const flag = (cc: string) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌍");

type State = "ok" | "warn" | "bad";
function sysRow(icon: IconKey, title: string, state: State, detail: string, label: string, metric?: string) {
  return `<li class="sr"><span class="ic">${svgIcon(icon)}</span><div class="sb"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>${metric ? `<em>${esc(metric)}</em>` : ""}<span class="pill ${state}">${esc(label)}</span></li>`;
}

function weekday(series: DayPoint[]) {
  const sum = [0, 0, 0, 0, 0, 0, 0], cnt = [0, 0, 0, 0, 0, 0, 0];
  for (const s of series) {
    const i = (new Date(s.date + "T00:00:00Z").getUTCDay() + 6) % 7;
    sum[i] += s.views;
    cnt[i] += 1;
  }
  const avg = sum.map((v, i) => (cnt[i] ? v / cnt[i] : 0));
  const max = Math.max(...avg, 1);
  const top = avg.indexOf(Math.max(...avg));
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return `<div class="wd" role="img" aria-label="Average page views by weekday">${avg.map((v, i) => `<div class="${i === top && v > 0 ? "mx" : ""}" title="${names[i]}: ${Math.round(v)} views a day on average"><b>${v ? fmt(Math.round(v)) : ""}</b><i style="height:${Math.max(4, (v / max) * 100)}%"></i><span>${names[i]}</span></div>`).join("")}</div>`;
}

const KIND: Record<string, [string, string]> = { home: ["Home", "mint"], article: ["Article", "lav"], project: ["Project", "sky"], page: ["Page", "gry"] };

function insights(d: AnalyticsData) {
  const out: string[] = [];
  const best = [...d.series].sort((a, b) => b.views - a.views)[0];
  if (best && best.views > 0) out.push(`Best day: <b>${esc(shortDate(best.date))}</b> with <b>${fmt(best.views)}</b> views`);
  if (d.pages[0]) out.push(`Most viewed: <b>${esc(d.pages[0].label)}</b>`);
  const dev = d.devices.reduce((a, b) => a + b.value, 0);
  const mob = d.devices.find((x) => x.label === "Mobile");
  if (dev && mob) out.push(`<b>${Math.round((mob.value / dev) * 100)}%</b> of visits are on phones`);
  const ppv = d.totals.visitors ? d.totals.views / d.totals.visitors : 0;
  if (ppv) out.push(`Visitors view <b>${ppv.toFixed(1)}</b> pages per day on average`);
  if (!out.length) out.push("Highlights appear once the site has some traffic.");
  return `<ul class="in">${out.map((o) => `<li>${o}</li>`).join("")}</ul>`;
}

const card = (cls: string, label: string, value: string, cur: number, prev: number) =>
  `<div class="sc ${cls}"><span class="sl">${esc(label)}</span><strong>${esc(value)}</strong>${delta(cur, prev)}</div>`;
const tile = (cls: string, icon: IconKey, label: string, value: string, extra: string) =>
  `<div class="tile"><span class="ci ${cls}">${svgIcon(icon)}</span><div><span class="tl">${esc(label)}</span><strong>${esc(value)}</strong>${extra}</div></div>`;

export function dashboardHtml(d: AnalyticsData, roundTripMs: number): string {
  const ppv = d.totals.visitors ? d.totals.views / d.totals.visitors : 0;
  const ppvPrev = d.previous.visitors ? d.previous.views / d.previous.visitors : 0;
  const act = d.totals.emailClicks + d.totals.quoteClicks, actPrev = d.previous.emailClicks + d.previous.quoteClicks;
  const sys = d.system;
  const totalViews = d.totals.views;

  const range = [7, 30, 90].map((r) => `<button data-range="${r}" class="${d.range === r ? "on" : ""}" type="button">${r} days</button>`).join("");
  const header = `<div class="ovh"><div><h2>Welcome back</h2><p>Here is how the Elite Hive website is performing.</p></div><div class="ctl"><div class="rg" role="group" aria-label="Date range">${range}</div><button type="button" class="btn s" data-refresh>Refresh</button></div></div>`;
  const notice = d.collecting ? "" : `<div class="nt">Analytics and the database are not connected yet. Add the Firebase variables in Vercel (see README) to start collecting data.</div>`;

  const quick = `<section class="ra"><div class="pn"><header><h3>Quick analytics</h3><span>Last ${d.range} days, Kenya time</span></header>
<div class="qi"><div class="sc3">${card("y", "Page views", fmt(d.totals.views), d.totals.views, d.previous.views)}${card("l", "Visitors", fmt(d.totals.visitors), d.totals.visitors, d.previous.visitors)}${card("b", "Pages per visit", ppv ? ppv.toFixed(1) : "0", ppv, ppvPrev)}</div>
<div>${areaChart(d.series)}</div></div></div>
<div class="pn"><header><h3>Traffic sources</h3><span>Where visitors come from</span></header>${donut(d.sources, "sessions")}</div></section>`;

  const tiles = `<section class="tiles">${[
    tile("g", "chat", "Enquiries sent", fmt(d.totals.contacts), delta(d.totals.contacts, d.previous.contacts)),
    tile("r", "mail", "Email and quote clicks", fmt(act), delta(act, actPrev)),
    tile("v", "file", "Articles live", String(d.content.published), `<span class="sub">${d.content.drafts} in drafts</span>`),
    tile("o", "folder", "Projects live", String(d.content.projectsPublished), `<span class="sub">${d.content.projectsDrafts} in drafts</span>`),
  ].join("")}</section>`;

  const rows = d.pages.slice(0, 7).map((p) => {
    const [kl, kc] = KIND[p.kind] ?? KIND.page;
    const share = totalViews ? Math.round((p.views / totalViews) * 100) : 0;
    return `<tr><td class="pt" title="${esc(p.label)}">${esc(p.label)}</td><td><span class="pill ${kc}">${kl}</span></td><td class="num">${fmt(p.views)}</td><td class="shr"><div class="bt"><i style="width:${Math.max(3, share)}%"></i></div><span>${share}%</span></td></tr>`;
  }).join("");
  const pagesCard = `<div class="pn"><header><h3>Top pages</h3><span>Most viewed in this period</span></header>${rows ? `<div class="tw"><table class="dt"><thead><tr><th>Page</th><th>Type</th><th class="num">Views</th><th>Share</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<p class="mt">No page views yet</p>`}</div>`;
  const dev = d.devices.reduce((a, b) => a + b.value, 0);
  const devCard = `<div class="pn"><header><h3>Devices</h3><span>How people browse</span></header>${dev ? `<div class="sg">${d.devices.map((s, i) => `<i style="width:${(s.value / dev) * 100}%;background:${COLORS[i % COLORS.length]}"></i>`).join("")}</div>` : ""}<ul class="dl2">${d.devices.length ? d.devices.map((s, i) => `<li><i style="background:${COLORS[i % COLORS.length]}"></i><span>${esc(s.label)}</span><b>${fmt(s.value)}</b><em>${dev ? Math.round((s.value / dev) * 100) : 0}%</em></li>`).join("") : `<li class="mt">No data yet</li>`}</ul></div>`;
  const wdCard = `<div class="pn"><header><h3>Views by weekday</h3><span>Daily average</span></header>${weekday(d.series)}</div>`;
  const mid = `<section class="rb">${pagesCard}<div class="stack">${wdCard}${devCard}</div></section>`;

  const art = d.topArticles.length
    ? `<ul class="rk">${d.topArticles.map((a, i) => `<li><span class="rn">${i + 1}</span><div class="rt"><strong title="${esc(a.label)}">${esc(a.label)}</strong><span class="pill lav">${esc(a.category)}</span></div><b>${fmt(a.views)}</b></li>`).join("")}</ul>`
    : `<p class="mt">No article views yet. Publish news in the Posts tab.</p>`;
  const prj = d.topProjects.length
    ? `<ul class="rk">${d.topProjects.map((a, i) => `<li><span class="rn">${i + 1}</span><div class="rt"><strong title="${esc(a.label)}">${esc(a.label)}</strong></div><b>${fmt(a.views)}</b></li>`).join("")}</ul>`
    : `<p class="mt">No project views yet</p>`;
  const countries = d.countries.length
    ? `<ul class="cn">${d.countries.slice(0, 6).map((c) => `<li><span class="fg">${flag(c.label)}</span><span class="cname">${esc(NAMES[c.label] ?? c.label)}</span><b>${fmt(c.value)}</b><div class="bt"><i style="width:${Math.max(4, (c.value / d.countries[0].value) * 100)}%"></i></div></li>`).join("")}</ul>`
    : `<p class="mt">No location data yet</p>`;
  const low = `<section class="rc"><div class="pn"><header><h3>Top articles</h3><span>By views</span></header>${art}<header class="sub"><h3>Top projects</h3></header>${prj}</div>
<div class="pn"><header><h3>Top countries</h3><span>Visitor locations</span></header>${countries}</div>
<div class="pn"><header><h3>Articles by category</h3><span>Published</span></header>${hbars(d.content.byCategory.map((c) => ({ label: c.label, value: c.value })), "No published articles yet")}</div></section>`;

  const dbState: State = !sys.database.ok ? (d.collecting ? "bad" : "warn") : sys.database.ms > 1200 ? "warn" : "ok";
  const label = (s: State, ok: string, warn = "Not set up", bad = "Offline") => (s === "ok" ? ok : s === "warn" ? warn : bad);
  const authS: State = sys.auth ? "ok" : "warn", imgS: State = sys.images ? "ok" : "warn", mailS: State = sys.email ? "ok" : "warn", spdS: State = roundTripMs > 3000 ? "warn" : "ok";
  const system = `<section class="rd"><div class="pn"><header><h3>System monitoring</h3><span>Live status</span></header><ul class="sy">
${sysRow("db", "Database", dbState, sys.database.ok ? "Firestore" : "Not connected", label(dbState, "Connected"), sys.database.ok ? `${sys.database.ms} ms` : undefined)}
${sysRow("lock", "Authentication", authS, sys.auth ? `Firebase Auth, ${sys.admins} admin${sys.admins === 1 ? "" : "s"} allowed` : "Firebase Admin keys missing", label(authS, "Active"))}
${sysRow("image", "Image storage", imgS, sys.images ? "Cloudinary" : "Cloudinary keys missing", label(imgS, "Connected"))}
${sysRow("mail", "Email delivery", mailS, sys.email ? "Contact form email" : "Resend keys missing, the form shows your email address", label(mailS, "Active"))}
${sysRow("pulse", "Dashboard speed", spdS, "Analytics request time", label(spdS, "Fast", "Slow"), `${roundTripMs} ms`)}
${sysRow("rocket", "Deployment", "ok", `${sys.deploy.env}${sys.deploy.branch ? ", " + sys.deploy.branch : ""}${sys.deploy.region ? ", " + sys.deploy.region : ""}`, "Live", sys.deploy.commit || "local")}
</ul></div>
<div class="pn"><header><h3>Highlights</h3><span>Auto generated</span></header>${insights(d)}
<header class="sub"><h3>Quick actions</h3></header><div class="qa"><a class="btn p" data-go href="/admin/new">Write a post</a><a class="btn s" data-go href="/admin/projects/new">Add a project</a><a class="btn s" data-go href="/admin/posts">Manage posts</a><a class="btn s" href="/" target="_blank" rel="noopener">View website</a></div>
<p class="fn">Updated ${esc(new Date(d.generatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}. Analytics are anonymous: no cookies and no personal data are stored.</p></div></section>`;

  return header + notice + quick + tiles + mid + low + system;
}

/** Adds the hover tooltip to the traffic chart. Returns a clean up function. */
export function bindDashboard(root: HTMLElement): () => void {
  const ch = root.querySelector<HTMLElement>(".ch");
  if (!ch) return () => undefined;
  const series = JSON.parse(decodeURIComponent(ch.dataset.s ?? "[]")) as [string, number, number][];
  const [w, h, l, r, t, b] = ["w", "h", "l", "r", "t", "b"].map((k) => Number(ch.dataset[k]));
  const max = Number(ch.dataset.max) || 1;
  const peak = Number(ch.dataset.peak) || 0;
  const svg = ch.querySelector("svg") as SVGSVGElement, hv = ch.querySelector<SVGGElement>(".hv")!, tt = ch.querySelector<HTMLElement>(".tt")!;
  const n = series.length;
  const show = (i: number) => {
    const rect = svg.getBoundingClientRect();
    const x = l + (i * (w - l - r)) / Math.max(1, n - 1);
    const y = (v: number) => t + (1 - v / max) * (h - t - b);
    hv.style.display = "";
    hv.querySelector(".hl")!.setAttribute("x1", String(x));
    hv.querySelector(".hl")!.setAttribute("x2", String(x));
    hv.querySelector(".h1")!.setAttribute("cx", String(x));
    hv.querySelector(".h1")!.setAttribute("cy", String(y(series[i][1])));
    tt.style.display = "grid";
    tt.innerHTML = `<small>${shortDate(series[i][0])}</small><strong>${series[i][1].toLocaleString("en-US")} views</strong><span>${series[i][2].toLocaleString("en-US")} visitors</span>`;
    const px = (x / w) * rect.width;
    tt.style.left = Math.min(Math.max(px, 62), rect.width - 62) + "px";
    tt.style.top = Math.max(2, (y(series[i][1]) / h) * rect.height - 78) + "px";
  };
  const move = (e: MouseEvent | TouchEvent) => {
    const pt = "touches" in e ? e.touches[0] : e;
    const rect = svg.getBoundingClientRect();
    const sx = ((pt.clientX - rect.left) / rect.width) * w;
    show(Math.min(n - 1, Math.max(0, Math.round(((sx - l) / (w - l - r)) * (n - 1)))));
  };
  const rest = () => { if (series[peak] && series[peak][1] > 0) show(peak); else { hv.style.display = "none"; tt.style.display = "none"; } };
  rest();
  svg.addEventListener("mousemove", move);
  svg.addEventListener("touchmove", move, { passive: true });
  svg.addEventListener("mouseleave", rest);
  svg.addEventListener("touchend", rest);
  return () => {
    svg.removeEventListener("mousemove", move);
    svg.removeEventListener("touchmove", move);
    svg.removeEventListener("mouseleave", rest);
    svg.removeEventListener("touchend", rest);
  };
}
