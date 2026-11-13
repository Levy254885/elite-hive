import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, PageHead } from "@/components/Sections";
import { bg } from "@/lib/media";
import { SERVICES, getService } from "@/lib/services";
import { SITE } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: s.title,
    description: `${s.intro.split(". ")[0]}. Elite Hive Kenya, Nairobi.`,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { url: `/services/${s.slug}`, title: `${s.title} | Elite Hive Kenya` },
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.intro, provider: { "@id": `${SITE.url}/#business` }, areaServed: "Kenya" };
  return (
    <>
      <PageHead title={s.title} text={s.short} photo={s.photo} crumbs={[{ label: "Home", href: "/" }, { label: "Our Services", href: "/services" }, { label: s.title }]} />
      <section className="pg">
        <div className="two">
          <div>
            <h2>What we offer</h2>
            <p>{s.intro}</p>
            <ul className="off">
              {s.offerings.map((o) => (<li key={o.title}><b>{o.title}</b>{o.text}</li>))}
            </ul>
          </div>
          <div className="pic" role="img" aria-label={`${s.title} by Elite Hive Kenya`} style={bg(s.photo)} />
        </div>
        <h2 style={{ marginTop: 56 }}>Other services</h2>
        <div className="chips">
          {SERVICES.filter((o) => o.slug !== s.slug).map((o) => (<Link key={o.slug} href={`/services/${o.slug}`}>{o.title}</Link>))}
        </div>
      </section>
      <CtaBand />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
