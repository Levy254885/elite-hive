import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHead } from "@/components/Sections";
import { cld, projectCover } from "@/lib/media";
import { allProjects, getProjectBySlug } from "@/lib/projects-db";
import { SITE } from "@/lib/site";

export const revalidate = 60;
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return { title: "Project not found", robots: { index: false } };
  const img = projectCover(p, 1200);
  return {
    title: p.title,
    description: p.description || `${p.title}, a ${p.category} project by Elite Hive Kenya.`,
    alternates: { canonical: `/portfolio/${p.slug}` },
    openGraph: { url: `/portfolio/${p.slug}`, title: `${p.title} | Elite Hive Kenya`, description: p.description, images: img ? [img] : undefined },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return notFound();
  const more = (await allProjects()).filter((x) => x.slug !== p.slug).slice(0, 3);
  const cover = projectCover(p, 1400);
  const jsonLd = p.youtubeId
    ? { "@context": "https://schema.org", "@type": "VideoObject", name: p.title, description: p.description || p.title, thumbnailUrl: cover, embedUrl: `https://www.youtube-nocookie.com/embed/${p.youtubeId}` }
    : { "@context": "https://schema.org", "@type": "CreativeWork", name: p.title, description: p.description, image: cover || undefined, creator: { "@id": `${SITE.url}/#business` } };
  return (
    <>
      <PageHead title={p.title} text={[p.category, p.client].filter(Boolean).join(" · ")} photo="p7" crumbs={[{ label: "Home", href: "/" }, { label: "Portfolio", href: "/portfolio" }, { label: p.title }]} />
      <section className="pg" style={{ maxWidth: 1000 }}>
        {p.youtubeId ? (
          <div className="vid">
            <iframe src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}`} title={p.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        ) : (
          cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={p.title} style={{ width: "100%", height: "auto", display: "block", marginBottom: 28 }} />
          )
        )}
        <h2>About this project</h2>
        {p.description ? <p style={{ whiteSpace: "pre-line" }}>{p.description}</p> : <p>{p.title}</p>}
        {p.gallery && p.gallery.length > 0 && (
          <div className="pgal">
            {p.gallery.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={u} src={cld(u, 1000)} alt={`${p.title} image ${i + 1}`} loading="lazy" />
            ))}
          </div>
        )}
        {more.length > 0 && (
          <>
            <h2 style={{ marginTop: 48 }}>More projects</h2>
            <div className="chips">{more.map((m) => (<Link key={m.slug} href={`/portfolio/${m.slug}`}>{m.title}</Link>))}</div>
          </>
        )}
      </section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
