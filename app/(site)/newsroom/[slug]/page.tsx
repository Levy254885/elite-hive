import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHead } from "@/components/Sections";
import { fmtDate, NewsCard } from "@/components/Newsroom";
import { cld } from "@/lib/media";
import { renderMarkdown } from "@/lib/markdown";
import { getPublishedBySlug, listPublished } from "@/lib/posts";
import { SITE } from "@/lib/site";

export const revalidate = 60;
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublishedBySlug(slug);
  if (!p) return { title: "Article not found", robots: { index: false } };
  return {
    title: p.title,
    description: p.excerpt || p.content.slice(0, 150),
    alternates: { canonical: `/newsroom/${p.slug}` },
    openGraph: { type: "article", url: `/newsroom/${p.slug}`, title: p.title, description: p.excerpt, publishedTime: p.publishedAt ?? undefined, images: p.coverUrl ? [cld(p.coverUrl, 1200)] : undefined },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const p = await getPublishedBySlug(slug);
  if (!p) return notFound();
  const more = (await listPublished(4)).filter((x) => x.id !== p.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": p.type === "blog" ? "BlogPosting" : "NewsArticle",
    headline: p.title,
    description: p.excerpt,
    image: p.coverUrl ? [cld(p.coverUrl, 1200)] : undefined,
    datePublished: p.publishedAt,
    dateModified: p.updatedAt,
    author: { "@type": "Organization", name: p.author },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/images/logo.png` } },
    mainEntityOfPage: `${SITE.url}/newsroom/${p.slug}`,
  };
  return (
    <>
      <PageHead title={p.title} text={`${p.type === "blog" ? "Blog" : "News"} · ${fmtDate(p.publishedAt)} · ${p.author}`} photo="p9" crumbs={[{ label: "Home", href: "/" }, { label: "Newsroom", href: "/newsroom" }, { label: p.title }]} />
      <article className="pg art-page">
        {p.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="art-cover" src={cld(p.coverUrl, 1400)} alt={p.title} />
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
        {p.tags.length > 0 && <p className="tags">{p.tags.map((t) => (<span key={t}>{t}</span>))}</p>}
        <p><Link href="/newsroom">Back to the newsroom</Link></p>
      </article>
      {more.length > 0 && (
        <section className="ln">
          <div className="in"><h2>More from the Newsroom</h2><div className="ng">{more.map((m) => (<NewsCard key={m.id} post={m} />))}</div></div>
        </section>
      )}
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
