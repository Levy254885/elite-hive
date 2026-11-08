import { adminDb } from "./firebase-admin";

export type PostType = "news" | "blog";
export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  type: PostType;
  excerpt: string;
  content: string;
  coverUrl: string;
  coverId: string;
  tags: string[];
  author: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PostInput = Pick<Post, "title" | "slug" | "type" | "excerpt" | "content" | "coverUrl" | "coverId" | "tags" | "author" | "status">;

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Validates and cleans an incoming post body. Returns an error message or the clean data. */
export function parsePostInput(body: Record<string, unknown>): { error: string } | { data: PostInput } {
  const title = str(body.title, 160);
  if (title.length < 3) return { error: "Please enter a title of at least 3 characters." };
  const type: PostType = body.type === "blog" ? "blog" : "news";
  const status: PostStatus = body.status === "published" ? "published" : "draft";
  const content = str(body.content, 60000);
  if (status === "published" && content.length < 20) return { error: "Add some article content before publishing." };
  const coverUrl = str(body.coverUrl, 500);
  if (coverUrl && !/^https:\/\//.test(coverUrl)) return { error: "Cover image must be an https link." };
  const tags = Array.isArray(body.tags) ? body.tags.map((t) => str(t, 30)).filter(Boolean).slice(0, 8) : [];
  return {
    data: {
      title,
      slug: slugify(str(body.slug, 80) || title),
      type,
      excerpt: str(body.excerpt, 300),
      content,
      coverUrl,
      coverId: str(body.coverId, 200),
      tags,
      author: str(body.author, 80) || "Elite Hive Kenya",
      status,
    },
  };
}

const COL = "posts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toPost = (id: string, d: Record<string, any>): Post => ({
  id,
  title: d.title ?? "",
  slug: d.slug ?? id,
  type: d.type === "blog" ? "blog" : "news",
  excerpt: d.excerpt ?? "",
  content: d.content ?? "",
  coverUrl: d.coverUrl ?? "",
  coverId: d.coverId ?? "",
  tags: Array.isArray(d.tags) ? d.tags : [],
  author: d.author ?? "Elite Hive Kenya",
  status: d.status === "published" ? "published" : "draft",
  createdAt: d.createdAt ?? "",
  updatedAt: d.updatedAt ?? "",
  publishedAt: d.publishedAt ?? null,
});

/** Public reads. They return empty results if Firebase is not configured or unreachable. */
export async function listPublished(limit = 60): Promise<Post[]> {
  const db = adminDb();
  if (!db) return [];
  try {
    const snap = await db.collection(COL).where("status", "==", "published").get();
    return snap.docs
      .map((d) => toPost(d.id, d.data()))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
      .slice(0, limit);
  } catch (err) {
    console.error("listPublished failed", err);
    return [];
  }
}

export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const db = adminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(COL).where("slug", "==", slug).limit(5).get();
    const doc = snap.docs.map((d) => toPost(d.id, d.data())).find((p) => p.status === "published");
    return doc ?? null;
  } catch (err) {
    console.error("getPublishedBySlug failed", err);
    return null;
  }
}

/** Admin reads and writes (called from protected API routes only). */
export async function listAllPosts(): Promise<Post[]> {
  const db = adminDb();
  if (!db) return [];
  const snap = await db.collection(COL).get();
  return snap.docs.map((d) => toPost(d.id, d.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPostById(id: string): Promise<Post | null> {
  const db = adminDb();
  if (!db) return null;
  const doc = await db.collection(COL).doc(id).get();
  return doc.exists ? toPost(doc.id, doc.data()!) : null;
}

export async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const db = adminDb();
  if (!db) return base;
  let slug = base || "post";
  for (let i = 2; i < 50; i++) {
    const snap = await db.collection(COL).where("slug", "==", slug).limit(2).get();
    if (snap.docs.every((d) => d.id === exceptId)) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export const postsCollection = () => adminDb()?.collection(COL) ?? null;
