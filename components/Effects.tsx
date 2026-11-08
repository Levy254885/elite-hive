"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const REVEAL =
  ".st>*,.ab .in>*,.bdg div,.ph3,.ban,.rl .in>*,.tg h3,.cg li,.ft .in>*,.v,.dk h2,.gd div,.dk p,.pm>*,.dp h2,.sv,.ct>*,.ct form>*,.pg>*,.cb .in>*";

/** Scroll reveal and hero parallax. Renders nothing. */
export default function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("v-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      if (el.hasAttribute("data-r")) return;
      el.setAttribute("data-r", "");
      const idx = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.setProperty("--d", `${(idx % 4) * 0.09}s`);
      if (reduce) el.classList.add("v-in");
      else io.observe(el);
    });

    const art = document.querySelector<HTMLElement>(
      window.matchMedia("(min-width:1000px)").matches ? ".hero .art-d" : ".hero .art",
    );
    let ticking = false;
    const onScroll = () => {
      if (ticking || !art || reduce) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 900) art.style.translate = `0 ${y * 0.22}px`;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
