"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const send = (payload: Record<string, unknown>) => {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "text/plain" }));
    else void fetch("/api/track", { method: "POST", body, keepalive: true });
  } catch {
    /* analytics must never break the site */
  }
};

/** Anonymous page view and click tracking for the admin analytics. No cookies. */
export default function Tracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    let newToday = false;
    try {
      const day = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
      if (localStorage.getItem("eh_day") !== day) {
        newToday = true;
        localStorage.setItem("eh_day", day);
      }
    } catch {
      /* private mode */
    }
    send({ path: pathname, ref: first.current ? document.referrer : "", first: first.current, newToday });
    first.current = false;
  }, [pathname]);

  useEffect(() => {
    if (navigator.doNotTrack === "1") return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='mailto:']") as HTMLAnchorElement | null;
      if (!a) return;
      send({ event: a.getAttribute("href")?.includes("Quote%20request") ? "quote_click" : "email_click" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
