import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHead } from "@/components/Sections";
import { NewsCard } from "@/components/Newsroom";
import { NEWS_CATEGORIES, categoryLabel, isCategory } from "@/lib/categories";
import { listPublished } from "@/lib/posts";
import { tagSlug } from "@/lib/tags";

export const metadata: Metadata = {
  title: "Newsroom",
  description: "Independent journalism, news and blog posts from Elite Hive on media, technology, innovation, fashion, business and more across Kenya, Africa and the world.",
  alternates: { canonical: "/newsroom" },
  openGraph: { url: "/newsroom", title: "Newsroom | Elite Hive Kenya" },
};

type SP = { category?: string; type?: string; tag?: string };

export default async function NewsroomPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = isCategory(sp.category) ? sp.category : undefined;
  const type = sp.type === "blog" || sp.type === "news" ? sp.type : undefined;
  const tag = sp.tag ? tagSlug(sp.tag) : undefined;
  const all = await listPublished(200);

  // tag name as the editor typed it, and the most used tags
  const counts = new Map<string, { label: string; n: number }>();
  for (const p of all) for (const t of p.tags) {
    const k = tagSlug(t);
    if (!k) continue;
    const cur = counts.get(k);
    counts.set(k, { label: cur?.label ?? t, n: (cur?.n ?? 0) + 1 });
  }
  const topTags = [...counts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 16);
  const tagName = tag ? counts.get(tag)?.label ?? tag.replace(/-/g, " ") : undefined;

  const posts = all.filter((p) => (!category || p.category === category) && (!type || p.type === type) && (!tag || p.tags.some((t) => tagSlug(t) === tag)));
  const used = new Set(all.map((p) => p.category));
  const href = (c?: string, t?: string, g?: string) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (t) q.set("type", t);
    if (g) q.set("tag", g);
    const s = q.toString();
    return s ? `/newsroom?${s}` : "/newsroom";
  };
  const title = tagName ? `#${tagName}` : category ? categoryLabel(category) : "Newsroom";

  return (
    <>
      <PageHead title={title} text="Independent journalism, news and stories from Elite Hive. Kenya, Africa and the world." photo="p1" crumbs={[{ label: "Home", href: "/" }, { label: "Newsroom", href: category || tag ? "/newsroom" : undefined }, ...(tagName ? [{ label: `Tag: ${tagName}` }] : category ? [{ label: categoryLabel(category) }] : [])]} />
      <section className="pg">
        <nav className="chips sc" aria-label="Article type">
          <Link href={href(category, undefined, tag)} aria-current={!type ? "page" : undefined}>All</Link>
          <Link href={href(category, "news", tag)} aria-current={type === "news" ? "page" : undefined}>News</Link>
          <Link href={href(category, "blog", tag)} aria-current={type === "blog" ? "page" : undefined}>Blogs</Link>
        </nav>
        <nav className="chips sc" aria-label="Categories">
          <Link href={href(undefined, type, tag)} aria-current={!category ? "page" : undefined}>All categories</Link>
          {NEWS_CATEGORIES.map((c) => (
            <Link key={c.slug} href={href(c.slug, type, tag)} aria-current={category === c.slug ? "page" : undefined} className={used.has(c.slug) || category === c.slug ? "" : "dim"}>{c.label}</Link>
          ))}
        </nav>
        {topTags.length > 0 && (
          <nav className="chips sc tagrow" aria-label="Popular tags">
            {tag && <Link href={href(category, type)}>Clear tag ×</Link>}
            {topTags.map(([k, v]) => (
              <Link key={k} href={href(category, type, k)} aria-current={tag === k ? "page" : undefined}>#{v.label}</Link>
            ))}
          </nav>
        )}
        {posts.length > 0 ? (
          <div className="ng">{posts.map((p) => (<NewsCard key={p.id} post={p} />))}</div>
        ) : (
          <p>No articles here yet. Try another category or tag, or <Link href="/contact">contact us</Link>.</p>
        )}
      </section>
      <CtaBand />
    </>
  );
}
