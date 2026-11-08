"use client";

import { useEffect, useRef } from "react";

/**
 * Mobile hero video. Put the file at public/videos/hero-mobile.mp4.
 * It autoplays muted and loops. On desktop the video is never downloaded.
 * If the file is missing, the poster image stays visible.
 */
export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!window.matchMedia("(max-width: 999px)").matches) return;
    v.muted = true;
    v.defaultMuted = true;
    v.src = "/videos/hero-mobile.mp4";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().catch(() => undefined);
    const resume = () => {
      if (document.visibilityState === "visible" && v.paused) v.play().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", resume);
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

  return (
    <video
      ref={ref}
      className="art"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster="/videos/hero-mobile-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
