import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHead } from "@/components/Sections";
import { NewsCard } from "@/components/Newsroom";
import { listPublished } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Newsroom",
  description: "Independent journalism, news and blog posts from Elite Hive on media, technology, innovation and aerial intelligence across Kenya, Africa and the world.",
  alternates: { canonical: "/newsroom" },
  openGraph: { url: "/newsroom", title: "Newsroom | Elite Hive Kenya" },
};

export default async function NewsroomPage() {
  const posts = await listPublished(100);
  return (
    <>
      <PageHead title="Newsroom" text="Independent journalism, news and stories from Elite Hive. Kenya, Africa and the world." photo="p1" crumbs={[{ label: "Home", href: "/" }, { label: "Newsroom" }]} />
      <section className="pg">
        {posts.length > 0 ? (
          <div className="ng">{posts.map((p) => (<NewsCard key={p.id} post={p} />))}</div>
        ) : (
          <p>No articles have been published yet. Please check back soon, or <Link href="/contact">contact us</Link>.</p>
        )}
      </section>
      <CtaBand />
    </>
  );
}
