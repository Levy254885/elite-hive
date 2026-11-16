import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHead } from "@/components/Sections";
import { NewsCard } from "@/components/Newsroom";
import { NEWS_CATEGORIES, categoryLabel, isCategory } from "@/lib/categories";
import { listPublished } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Newsroom",
  description: "Independent journalism, news and blog posts from Elite Hive on media, technology, innovation, fashion, business and more across Kenya, Africa and the world.",
  alternates: { canonical: "/newsroom" },
  openGraph: { url: "/newsroom", title: "Newsroom | Elite Hive Kenya" },
};

export default async function NewsroomPage({ searchParams }: { searchParams: Promise<{ category?: string; type?: string }> }) {
  const sp = await searchParams;
  const category = isCategory(sp.category) ? sp.category : undefined;
  const type = sp.type === "blog" || sp.type === "news" ? sp.type : undefined;
  const all = await listPublished(200);
  const posts = all.filter((p) => (!category || p.category === category) && (!type || p.type === type));
  const used = new Set(all.map((p) => p.category));
  const href = (c?: string, t?: string) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (t) q.set("type", t);
    const s = q.toString();
    return s ? `/newsroom?${s}` : "/newsroom";
  };
  return (
    <>
      <PageHead title={category ? categoryLabel(category) : "Newsroom"} text="Independent journalism, news and stories from Elite Hive. Kenya, Africa and the world." photo="p1" crumbs={[{ label: "Home", href: "/" }, { label: "Newsroom", href: category ? "/newsroom" : undefined }, ...(category ? [{ label: categoryLabel(category) }] : [])]} />
      <section className="pg">
        <nav className="chips sc" aria-label="Article type">
          <Link href={href(category)} aria-current={!type ? "page" : undefined}>All</Link>
          <Link href={href(category, "news")} aria-current={type === "news" ? "page" : undefined}>News</Link>
          <Link href={href(category, "blog")} aria-current={type === "blog" ? "page" : undefined}>Blogs</Link>
        </nav>
        <nav className="chips sc" aria-label="Categories">
          <Link href={href(undefined, type)} aria-current={!category ? "page" : undefined}>All categories</Link>
          {NEWS_CATEGORIES.map((c) => (
            <Link key={c.slug} href={href(c.slug, type)} aria-current={category === c.slug ? "page" : undefined} className={used.has(c.slug) || category === c.slug ? "" : "dim"}>{c.label}</Link>
          ))}
        </nav>
        {posts.length > 0 ? (
          <div className="ng">{posts.map((p) => (<NewsCard key={p.id} post={p} />))}</div>
        ) : (
          <p>No articles here yet. Try another category, or <Link href="/contact">contact us</Link>.</p>
        )}
      </section>
      <CtaBand />
    </>
  );
}
