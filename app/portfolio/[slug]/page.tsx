import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand, PageHead } from "@/components/Sections";
import { PHOTOS } from "@/lib/media";
import { PROJECTS, getProject } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/portfolio/${p.slug}` },
    openGraph: { url: `/portfolio/${p.slug}`, title: `${p.title} | Elite Hive Kenya`, description: p.description, images: [PHOTOS[p.photo].src] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "VideoObject", name: p.title, description: p.description, thumbnailUrl: PHOTOS[p.photo].src, embedUrl: `https://www.youtube-nocookie.com/embed/${p.youtubeId}` };
  return (
    <>
      <PageHead title={p.title} text={p.category} photo="p7" crumbs={[{ label: "Home", href: "/" }, { label: "Portfolio", href: "/portfolio" }, { label: p.title }]} />
      <section className="pg" style={{ maxWidth: 1000 }}>
        <div className="vid">
          <iframe src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}`} title={p.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <h2>About this project</h2>
        <p>{p.description}</p>
      </section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
