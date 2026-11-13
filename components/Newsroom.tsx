import Link from "next/link";
import { bgUrl, cld } from "@/lib/media";
import { listPublished, type Post } from "@/lib/posts";

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" }) : "";

export function NewsCard({ post }: { post: Post }) {
  return (
    <Link className="nc" href={`/newsroom/${post.slug}`}>
      <div className="nci" style={post.coverUrl ? bgUrl(cld(post.coverUrl, 800)) : { background: "linear-gradient(135deg,#2a3148,#07080c)" }} role="img" aria-label={post.title} />
      <div className="ncb">
        <small>{post.type === "blog" ? "Blog" : "News"} <span>{fmtDate(post.publishedAt)}</span></small>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
      </div>
    </Link>
  );
}

/** Home page strip. Renders nothing until there is at least one published post. */
export async function LatestNews() {
  const posts = (await listPublished(3));
  if (posts.length === 0) return null;
  return (
    <section className="ln">
      <div className="in">
        <div className="bar" />
        <h2>From the Newsroom</h2>
        <div className="ng">{posts.map((p) => (<NewsCard key={p.id} post={p} />))}</div>
        <Link className="bd" href="/newsroom">All News and Blogs</Link>
      </div>
    </section>
  );
}
