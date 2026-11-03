import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHead } from "@/components/Sections";
import { bgVar } from "@/lib/media";
import { ALL_CATEGORIES, CATEGORIES, PROJECTS } from "@/lib/projects";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Aerial photography, film production, corporate photography, events and documentaries by Elite Hive Kenya.",
  alternates: { canonical: "/portfolio" },
  openGraph: { url: "/portfolio", title: "Portfolio | Elite Hive Kenya" },
};

const v = (key: string) => ({ "--bg": bgVar(key, "linear-gradient(#0004,#000b)") }) as CSSProperties;

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = ALL_CATEGORIES.find((c) => c === category);
  const list = active ? PROJECTS.filter((p) => p.category === active) : PROJECTS;
  return (
    <>
      <PageHead title="Our Work" text="Explore our latest work in aerial cinematography, photography and media production." photo="p6" crumbs={[{ label: "Home", href: "/" }, { label: "Portfolio" }]} />
      <section className="pg">
        <nav className="chips" aria-label="Portfolio categories">
          <Link href="/portfolio" aria-current={!active ? "page" : undefined}>All</Link>
          {ALL_CATEGORIES.map((c) => (
            <Link key={c} href={`/portfolio?category=${encodeURIComponent(c)}`} aria-current={active === c ? "page" : undefined}>{c}</Link>
          ))}
        </nav>
        {list.length > 0 ? (
          <div className="vl" style={{ display: "grid" }}>
            {list.map((p) => (
              <Link key={p.slug} className="v" style={v(p.photo)} href={`/portfolio/${p.slug}`}>
                <span>{p.title}</span><em>Watch film</em>
              </Link>
            ))}
          </div>
        ) : (
          <p>No {active} projects are published yet. <Link href="/contact">Contact us</Link> and we will share relevant work.</p>
        )}
        {!active && (
          <>
            <h2 style={{ marginTop: 56 }}>Browse by category</h2>
            <div className="vl" style={{ display: "grid" }}>
              {CATEGORIES.map((c) => (
                <Link key={c.name} className="v" style={v(c.photo)} href={`/portfolio?category=${encodeURIComponent(c.name)}`}>
                  <span>{c.name}</span><em>Enquire</em>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
      <CtaBand />
    </>
  );
}
