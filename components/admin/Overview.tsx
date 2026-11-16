"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "./AdminShell";
import { bindDashboard, dashboardHtml } from "@/lib/dashboard-html";
import type { AnalyticsData } from "@/lib/analytics-types";

export default function Overview() {
  const { api } = useAdmin();
  const router = useRouter();
  const [range, setRange] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [ms, setMs] = useState(0);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);

  const load = useCallback(async (r: number) => {
    const t0 = Date.now();
    try {
      const res = await api(`/api/admin/analytics?range=${r}`);
      const json = (await res.json()) as AnalyticsData & { message?: string };
      if (!res.ok) throw new Error(json.message ?? "Could not load analytics.");
      setData(json);
      setMs(Date.now() - t0);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load analytics.");
    }
  }, [api]);

  useEffect(() => { void load(range); }, [load, range]);
  useEffect(() => (root.current && data ? bindDashboard(root.current) : undefined), [data]);

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    const t = e.target as HTMLElement;
    const r = t.closest<HTMLElement>("[data-range]");
    if (r) return setRange(Number(r.dataset.range));
    if (t.closest("[data-refresh]")) return void load(range);
    const a = t.closest<HTMLAnchorElement>("a[data-go]");
    if (a) {
      e.preventDefault();
      router.push(a.getAttribute("href") ?? "/admin");
    }
  }

  if (error) return <p className="adm-err" role="alert">{error}</p>;
  if (!data) return <p className="adm-hint">Loading your dashboard...</p>;
  return <div ref={root} onClick={onClick} dangerouslySetInnerHTML={{ __html: dashboardHtml(data, ms) }} />;
}
