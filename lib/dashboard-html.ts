import type { AnalyticsData, DayPoint, Slice } from "./analytics-types";

/**
 * Builds the analytics dashboard markup (pure functions, no dependencies) so it can
 * be tested and rendered anywhere. Every dynamic text is escaped.
 */
const esc = (s: unknown) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e4 ? (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k" : n.toLocaleString("en-US"));
const COLORS = ["#22D3EE", "#8B5CF6", "#FFD800", "#FB7185", "#34D399", "#F59E0B", "#60A5FA", "#F472B6"];

const ICON = {
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.9.8 3 2.7 3 5.1"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  db: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/><path d="M12 15 9 12c1-3 3-6 8-8 4-.5 4 .5 3.5 3.5-2 5-5 7-8.5 8Z"/><circle cx="15.5" cy="8.5" r="1.3"/>',
};
const svgIcon = (k: keyof typeof ICON) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

const delta = (cur: number, prev: number) => {
  if (!prev && !cur) return `<span class="dl flat">no change</span>`;
  if (!prev) return `<span class="dl up">new</span>`;
  const p = Math.round(((cur - prev) / prev) * 100);
  return `<span class="dl ${p > 0 ? "up" : p < 0 ? "dn" : "flat"}">${p > 0 ? "▲" : p < 0 ? "▼" : "•"} ${Math.abs(p)}%</span>`;
};

function spark(values: number[], color: string) {
  const w = 120, h = 36, max = Math.max(1, ...values);
  if (values.length < 2) return "";
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - 3 - (v / max) * (h - 8)).toFixed(1)}`);
  return `<svg class="sp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.join(" ")}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function kpi(label: string, value: string, cur: number, prev: number, icon: keyof typeof ICON, color: string, series?: number[], note?: string) {
  return `<article class="kpi" style="--c:${color}"><div class="ki">${svgIcon(icon)}</div><div class="kb"><span class="kl">${esc(label)}</span><strong class="kv">${esc(value)}</strong><div class="kf">${note ? `<span class="kn">${esc(note)}</span>` : delta(cur, prev)}</div></div>${series ? spark(series, color) : ""}</article>`;
}

const niceMax = (m: number) => {
  if (m <= 4) return 4;
  const pow = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / pow;
  return (n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 3 ? 3 : n <= 5 ? 5 : 10) * pow;
};

const W = 800, H = 300, L = 46, R = 14, T = 16, B = 30;
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
    return `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" class="ax">${fmt(Math.round(v))}</text>`;
  }).join("");
  const step = Math.max(1, Math.round((n - 1) / 5));
  const xl = series.map((s, i) => (i % step === 0 || i === n - 1) && (n - 1 - i >= step * 0.6 || i === n - 1) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="ax">${shortDate(s.date)}</text>` : "").join("");
  const area = `${smooth(vp)} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const none = series.every((s) => s.views === 0);
  const data = encodeURIComponent(JSON.stringify(series.map((s) => [s.date, s.views, s.visitors])));
  return `<div class="ch" data-s="${data}" data-max="${max}" data-w="${W}" data-h="${H}" data-l="${L}" data-r="${R}" data-t="${T}" data-b="${B}">
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Page views and visitors over time">
<defs><linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD800" stop-opacity=".42"/><stop offset="1" stop-color="#FFD800" stop-opacity="0"/></linearGradient>
<linearGradient id="gu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22D3EE" stop-opacity=".22"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></linearGradient>
<filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
${grid}${xl}
<path d="${area}" fill="url(#gv)"/>
<path d="${smooth(up)} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z" fill="url(#gu)"/>
<path d="${smooth(up)}" fill="none" stroke="#22D3EE" stroke-width="2.4" stroke-linecap="round" filter="url(#glow)"/>
<path d="${smooth(vp)}" fill="none" stroke="#FFD800" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/>
<g class="hv" style="display:none"><line class="hl" y1="${T}" y2="${H - B}"/><circle class="h1" r="5.5" fill="#FFD800" stroke="#0F1629" stroke-width="2.5"/><circle class="h2" r="5" fill="#22D3EE" stroke="#0F1629" stroke-width="2.5"/></g>
</svg>
<div class="tt" style="display:none"></div>
${none ? `<div class="empty">No visits recorded yet. Charts fill in as people browse the live website.</div>` : ""}
</div>
<div class="lg"><span><i style="background:#FFD800"></i>Page views</span><span><i style="background:#22D3EE"></i>Visitors</span></div>`;
}

function donut(items: Slice[], centre: string) {
  const total = items.reduce((a, b) => a + b.value, 0);
  const r = 62, c = 2 * Math.PI * r;
  let off = 0;
  const segs = total
    ? items.map((s, i) => {
        const len = (s.value / total) * c;
        const el = `<circle cx="80" cy="80" r="${r}" fill="none" stroke="${COLORS[i % COLORS.length]}" stroke-width="20" stroke-dasharray="${Math.max(0, len - 2).toFixed(2)} ${(c - Math.max(0, len - 2)).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 80 80)" stroke-linecap="butt"/>`;
        off += len;
        return el;
      }).join("")
    : "";
  const legend = items.length
    ? items.map((s, i) => `<li><i style="background:${COLORS[i % COLORS.length]}"></i><span>${esc(s.label)}</span><b>${total ? Math.round((s.value / total) * 100) : 0}%</b></li>`).join("")
    : `<li class="mt">No data yet</li>`;
  return `<div class="dn"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="${r}" fill="none" stroke="#1E2945" stroke-width="20"/>${segs}<text x="80" y="78" text-anchor="middle" class="dv">${fmt(total)}</text><text x="80" y="98" text-anchor="middle" class="dk">${esc(centre)}</text></svg><ul>${legend}</ul></div>`;
}

function hbars(items: { label: string; value: number; sub?: string }[], empty: string) {
  if (!items.length) return `<p class="mt">${esc(empty)}</p>`;
  const max = Math.max(...items.map((i) => i.value), 1);
  return `<ul class="hb">${items.map((it, i) => `<li><div class="hr"><span class="hn" title="${esc(it.label)}">${esc(it.label)}${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</span><b>${fmt(it.value)}</b></div><div class="bt"><i style="width:${Math.max(3, (it.value / max) * 100)}%;background:linear-gradient(90deg,${COLORS[i % COLORS.length]},${COLORS[(i + 1) % COLORS.length]})"></i></div></li>`).join("")}</ul>`;
}

const NAMES: Record<string, string> = { KE: "Kenya", US: "United States", GB: "United Kingdom", TZ: "Tanzania", UG: "Uganda", NG: "Nigeria", ZA: "South Africa", IN: "India", DE: "Germany", FR: "France", CA: "Canada", AE: "UAE", CN: "China", ET: "Ethiopia", RW: "Rwanda", GH: "Ghana", EG: "Egypt", AU: "Australia", NL: "Netherlands" };
const flag = (cc: string) => (/^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌍");

function tile(icon: keyof typeof ICON, title: string, state: "ok" | "warn" | "bad", text: string, pill?: string) {
  return `<div class="tl ${state}"><div class="ti">${svgIcon(icon)}</div><div class="tb"><strong>${esc(title)}</strong><span>${esc(text)}</span></div>${pill ? `<em>${esc(pill)}</em>` : ""}<i class="dot"></i></div>`;
}

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
  if (!out.length) out.push("Insights appear once the site has some traffic.");
  return `<ul class="in">${out.map((o) => `<li>${o}</li>`).join("")}</ul>`;
}

export function dashboardHtml(d: AnalyticsData, roundTripMs: number): string {
  const v = d.series.map((s) => s.views), u = d.series.map((s) => s.visitors);
  const ppv = d.totals.visitors ? d.totals.views / d.totals.visitors : 0;
  const ppvPrev = d.previous.visitors ? d.previous.views / d.previous.visitors : 0;
  const act = d.totals.emailClicks + d.totals.quoteClicks, actPrev = d.previous.emailClicks + d.previous.quoteClicks;
  const published = d.content.published + d.content.projectsPublished;
  const sys = d.system;

  const range = [7, 30, 90].map((r) => `<button data-range="${r}" class="${d.range === r ? "on" : ""}" type="button">${r} days</button>`).join("");
  const header = `<div class="ovh"><div><h1>Command center</h1><p>Website performance, content and system health for Elite Hive.</p></div><div class="ctl"><div class="rg" role="group" aria-label="Date range">${range}</div><button type="button" class="rf" data-refresh>Refresh</button></div></div>`;
  const notice = d.collecting ? "" : `<div class="nt">Analytics and the database are not connected yet. Add the Firebase variables in Vercel (see README) to start collecting data.</div>`;

  const kpis = `<section class="kpis">${[
    kpi("Page views", fmt(d.totals.views), d.totals.views, d.previous.views, "eye", "#FFD800", v),
    kpi("Visitors", fmt(d.totals.visitors), d.totals.visitors, d.previous.visitors, "users", "#22D3EE", u),
    kpi("Pages per visit", ppv ? ppv.toFixed(1) : "0", ppv, ppvPrev, "pulse", "#8B5CF6"),
    kpi("Enquiries sent", fmt(d.totals.contacts), d.totals.contacts, d.previous.contacts, "chat", "#34D399"),
    kpi("Email and quote clicks", fmt(act), act, actPrev, "mail", "#FB7185"),
    kpi("Published content", fmt(published), 0, 0, "layers", "#F59E0B", undefined, `${d.content.published} articles, ${d.content.projectsPublished} projects`),
  ].join("")}</section>`;

  const traffic = `<section class="gr g2"><div class="pn span"><header><h2>Traffic overview</h2><span>Last ${d.range} days, Kenya time</span></header>${areaChart(d.series)}</div>
<div class="pn"><header><h2>Devices</h2><span>How people browse</span></header>${donut(d.devices, "visits")}</div></section>`;

  const middle = `<section class="gr g3">
<div class="pn"><header><h2>Top pages</h2><span>Most viewed</span></header>${hbars(d.pages.slice(0, 7).map((p) => ({ label: p.label, value: p.views })), "No page views yet")}</div>
<div class="pn"><header><h2>Traffic sources</h2><span>Where visitors come from</span></header>${donut(d.sources, "sessions")}</div>
<div class="pn"><header><h2>Top countries</h2><span>Visitor locations</span></header>${d.countries.length ? `<ul class="cn">${d.countries.slice(0, 6).map((c, i) => `<li><span class="fg">${flag(c.label)}</span><span class="cname">${esc(NAMES[c.label] ?? c.label)}</span><b>${fmt(c.value)}</b><div class="bt"><i style="width:${Math.max(4, (c.value / d.countries[0].value) * 100)}%;background:linear-gradient(90deg,${COLORS[i % COLORS.length]},${COLORS[(i + 2) % COLORS.length]})"></i></div></li>`).join("")}</ul>` : `<p class="mt">No location data yet</p>`}</div></section>`;

  const content = `<section class="gr g2">
<div class="pn"><header><h2>Top articles</h2><span>By views</span></header>${hbars(d.topArticles.map((a) => ({ label: a.label, value: a.views, sub: a.category })), "No article views yet. Publish news in the Posts tab.")}
<header class="sub"><h2>Top projects</h2><span>By views</span></header>${hbars(d.topProjects.map((a) => ({ label: a.label, value: a.views })), "No project views yet")}</div>
<div class="pn"><header><h2>Content library</h2><span>What is on the site</span></header>
<div class="cs"><div><b>${d.content.published}</b><span>Articles live</span></div><div><b>${d.content.drafts}</b><span>Article drafts</span></div><div><b>${d.content.projectsPublished}</b><span>Projects live</span></div><div><b>${d.content.projectsDrafts}</b><span>Project drafts</span></div></div>
<header class="sub"><h2>Articles by category</h2></header>${hbars(d.content.byCategory.map((c) => ({ label: c.label, value: c.value })), "No published articles yet")}</div></section>`;

  const dbState = !sys.database.ok ? (d.collecting ? "bad" : "warn") : sys.database.ms > 1200 ? "warn" : "ok";
  const system = `<section class="gr g2"><div class="pn"><header><h2>System monitoring</h2><span>Live status</span></header><div class="tls">
${tile("db", "Database", dbState, sys.database.ok ? "Firestore connected" : "Not connected", sys.database.ok ? `${sys.database.ms} ms` : undefined)}
${tile("lock", "Authentication", sys.auth ? "ok" : "warn", sys.auth ? `Firebase Auth, ${sys.admins} admin${sys.admins === 1 ? "" : "s"} allowed` : "Firebase Admin keys missing")}
${tile("image", "Image storage", sys.images ? "ok" : "warn", sys.images ? "Cloudinary connected" : "Cloudinary keys missing")}
${tile("mail", "Email delivery", sys.email ? "ok" : "warn", sys.email ? "Contact form email active" : "Resend keys missing, form shows email address")}
${tile("pulse", "Dashboard speed", roundTripMs > 3000 ? "warn" : "ok", "Analytics request time", `${roundTripMs} ms`)}
${tile("rocket", "Deployment", "ok", `${sys.deploy.env}${sys.deploy.branch ? ", " + sys.deploy.branch : ""}${sys.deploy.region ? ", " + sys.deploy.region : ""}`, sys.deploy.commit || "local")}
</div></div>
<div class="pn"><header><h2>Highlights</h2><span>Auto generated</span></header>${insights(d)}
<header class="sub"><h2>Quick actions</h2></header><div class="qa"><a data-go href="/admin/new">Write a post</a><a data-go href="/admin/projects/new">Add a project</a><a data-go href="/admin/posts">Manage posts</a><a href="/" target="_blank" rel="noopener">View website</a></div>
<p class="fn">Updated ${esc(new Date(d.generatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}. Analytics are anonymous: no cookies and no personal data are stored.</p></div></section>`;

  return header + notice + kpis + traffic + middle + content + system;
}

/** Adds the hover tooltip to the traffic chart. Returns a clean up function. */
export function bindDashboard(root: HTMLElement): () => void {
  const ch = root.querySelector<HTMLElement>(".ch");
  if (!ch) return () => undefined;
  const series = JSON.parse(decodeURIComponent(ch.dataset.s ?? "[]")) as [string, number, number][];
  const [w, h, l, r, t, b] = ["w", "h", "l", "r", "t", "b"].map((k) => Number(ch.dataset[k]));
  const max = Number(ch.dataset.max) || 1;
  const svg = ch.querySelector("svg") as SVGSVGElement, hv = ch.querySelector<SVGGElement>(".hv")!, tt = ch.querySelector<HTMLElement>(".tt")!;
  const n = series.length;
  const move = (e: MouseEvent | TouchEvent) => {
    const pt = "touches" in e ? e.touches[0] : e;
    const rect = svg.getBoundingClientRect();
    const sx = ((pt.clientX - rect.left) / rect.width) * w;
    const i = Math.min(n - 1, Math.max(0, Math.round(((sx - l) / (w - l - r)) * (n - 1))));
    const x = l + (i * (w - l - r)) / Math.max(1, n - 1);
    const y = (v: number) => t + (1 - v / max) * (h - t - b);
    hv.style.display = "";
    hv.querySelector(".hl")!.setAttribute("x1", String(x));
    hv.querySelector(".hl")!.setAttribute("x2", String(x));
    hv.querySelector(".h1")!.setAttribute("cx", String(x));
    hv.querySelector(".h1")!.setAttribute("cy", String(y(series[i][1])));
    hv.querySelector(".h2")!.setAttribute("cx", String(x));
    hv.querySelector(".h2")!.setAttribute("cy", String(y(series[i][2])));
    tt.style.display = "block";
    tt.innerHTML = `<strong>${shortDate(series[i][0])}</strong><span><i style="background:#FFD800"></i>${series[i][1].toLocaleString("en-US")} views</span><span><i style="background:#22D3EE"></i>${series[i][2].toLocaleString("en-US")} visitors</span>`;
    const px = (x / w) * rect.width;
    tt.style.left = Math.min(Math.max(px, 70), rect.width - 70) + "px";
    tt.style.top = Math.max(4, (y(series[i][1]) / h) * rect.height - 70) + "px";
  };
  const leave = () => { hv.style.display = "none"; tt.style.display = "none"; };
  svg.addEventListener("mousemove", move);
  svg.addEventListener("touchmove", move, { passive: true });
  svg.addEventListener("mouseleave", leave);
  svg.addEventListener("touchend", leave);
  return () => {
    svg.removeEventListener("mousemove", move);
    svg.removeEventListener("touchmove", move);
    svg.removeEventListener("mouseleave", leave);
    svg.removeEventListener("touchend", leave);
  };
}
