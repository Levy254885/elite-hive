"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Mail, X } from "lucide-react";
import { EMAIL_HREF, QUOTE_HREF, SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [shadow, setShadow] = useState(false);

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setShadow(y > 10);
      setHidden(y > last && y > 260);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (k: string) => setSub((v) => (v === k ? null : k));

  return (
    <>
      <header className={`hd${shadow ? " sh" : ""}${hidden && !open ? " h" : ""}`}>
        <div className="r">
          <Link className="lg" href="/" aria-label="Elite Hive Kenya home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" width={334} height={303} alt="Elite Hive Kenya, Imagine More" />
          </Link>
          <a className="ph" href={EMAIL_HREF}>
            <Mail aria-hidden /> <span className="short">Email us</span><span className="long">{SITE.email}</span>
          </a>
          <nav className="dn" aria-label="Main">
            <Link href="/portfolio">Our Work</Link>
            <Link href="/services">Our Services</Link>
            <Link href="/newsroom">Newsroom</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <a className="rq" href={QUOTE_HREF}>Request a Quote</a>
          <button className="bg" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <i /><i /><i />
          </button>
        </div>
      </header>

      <div className={`mn${open ? " o" : ""}`} aria-hidden={!open}>
        <button className="x" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button>
        <ul>
          <li className={pathname === "/" ? "on" : ""}><Link href="/">Home</Link></li>
          <li><Link href="/portfolio">Our Work</Link></li>
          <li className={sub === "s" ? "op" : ""}>
            <button aria-expanded={sub === "s"} onClick={() => toggle("s")}>Our Services<ChevronDown aria-hidden /></button>
            <div className="sub"><div>
              {SERVICES.map((s) => (<Link key={s.slug} href={`/services/${s.slug}`}>{s.title}</Link>))}
            </div></div>
          </li>
          <li><Link href="/newsroom">Newsroom</Link></li>
          <li><Link href="/about">About</Link></li>
          <li className={sub === "c" ? "op" : ""}>
            <button aria-expanded={sub === "c"} onClick={() => toggle("c")}>Contact<ChevronDown aria-hidden /></button>
            <div className="sub"><div>
              <a href={QUOTE_HREF}>Request a Quote</a>
              <a href={EMAIL_HREF}>Email Us</a>
              <Link href="/contact">Contact Form</Link>
            </div></div>
          </li>
        </ul>
      </div>
    </>
  );
}
