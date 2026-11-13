import { adminDb } from "./firebase-admin";
import { slugify } from "./posts";
import { ALL_CATEGORIES, PROJECTS, youtubeIdFrom, type Project, type ProjectRecord } from "./projects";

const COL = "projects";
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type ProjectInput = Pick<ProjectRecord, "title" | "slug" | "category" | "description" | "client" | "youtubeId" | "coverUrl" | "coverId" | "gallery" | "galleryIds" | "status">;

export function parseProjectInput(body: Record<string, unknown>): { error: string } | { data: ProjectInput } {
  const title = str(body.title, 160);
  if (title.length < 3) return { error: "Please enter a project title of at least 3 characters." };
  const category = str(body.category, 60);
  if (!ALL_CATEGORIES.includes(category)) return { error: "Please choose a category." };
  const rawYt = str(body.youtube, 200);
  const youtubeId = youtubeIdFrom(rawYt);
  if (rawYt && !youtubeId) return { error: "That YouTube link is not valid. Paste the link from the YouTube share button." };
  const coverUrl = str(body.coverUrl, 500);
  if (coverUrl && !/^https:\/\//.test(coverUrl)) return { error: "Cover image must be an https link." };
  const gallery: string[] = [];
  const galleryIds: string[] = [];
  if (Array.isArray(body.gallery)) {
    for (const g of body.gallery.slice(0, 12)) {
      const item = g as { url?: unknown; id?: unknown };
      const url = str(item?.url, 500);
      if (/^https:\/\//.test(url)) {
        gallery.push(url);
        galleryIds.push(str(item?.id, 200));
      }
    }
  }
  const status = body.status === "published" ? "published" : "draft";
  if (status === "published" && !coverUrl && !youtubeId && gallery.length === 0) return { error: "Add a cover image, a YouTube link or gallery images before publishing." };
  return {
    data: {
      title,
      slug: slugify(str(body.slug, 80) || title),
      category,
      description: str(body.description, 3000),
      client: str(body.client, 100),
      youtubeId,
      coverUrl,
      coverId: str(body.coverId, 200),
      gallery,
      galleryIds,
      status,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toRecord = (id: string, d: Record<string, any>): ProjectRecord => ({
  id,
  title: d.title ?? "",
  slug: d.slug ?? id,
  category: d.category ?? "Events",
  description: d.description ?? "",
  client: d.client ?? "",
  youtubeId: d.youtubeId ?? "",
  coverUrl: d.coverUrl ?? "",
  coverId: d.coverId ?? "",
  gallery: Array.isArray(d.gallery) ? d.gallery : [],
  galleryIds: Array.isArray(d.galleryIds) ? d.galleryIds : [],
  status: d.status === "published" ? "published" : "draft",
  createdAt: d.createdAt ?? "",
  updatedAt: d.updatedAt ?? "",
  publishedAt: d.publishedAt ?? null,
});

const toPublic = (r: ProjectRecord): Project => ({
  slug: r.slug,
  title: r.title,
  category: r.category,
  description: r.description,
  client: r.client || undefined,
  youtubeId: r.youtubeId || undefined,
  coverUrl: r.coverUrl || undefined,
  gallery: r.gallery.length ? r.gallery : undefined,
});

async function publishedFromDb(): Promise<ProjectRecord[]> {
  const db = adminDb();
  if (!db) return [];
  try {
    const snap = await db.collection(COL).where("status", "==", "published").get();
    return snap.docs.map((d) => toRecord(d.id, d.data())).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  } catch (err) {
    console.error("publishedFromDb failed", err);
    return [];
  }
}

/** Projects added in /admin first (newest first), then the built in ones. */
export async function allProjects(): Promise<Project[]> {
  const fromDb = (await publishedFromDb()).map(toPublic);
  const slugs = new Set(fromDb.map((p) => p.slug));
  return [...fromDb, ...PROJECTS.filter((p) => !slugs.has(p.slug))];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return (await allProjects()).find((p) => p.slug === slug) ?? null;
}

/** Admin side */
export const projectsCollection = () => adminDb()?.collection(COL) ?? null;

export async function listAllProjects(): Promise<ProjectRecord[]> {
  const db = adminDb();
  if (!db) return [];
  const snap = await db.collection(COL).get();
  return snap.docs.map((d) => toRecord(d.id, d.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  const db = adminDb();
  if (!db) return null;
  const doc = await db.collection(COL).doc(id).get();
  return doc.exists ? toRecord(doc.id, doc.data()!) : null;
}

export async function uniqueProjectSlug(base: string, exceptId?: string): Promise<string> {
  const db = adminDb();
  const root = base || "project";
  if (!db) return root;
  let slug = root;
  for (let i = 2; i < 50; i++) {
    const snap = await db.collection(COL).where("slug", "==", slug).limit(2).get();
    if (snap.docs.every((d) => d.id === exceptId) && !PROJECTS.some((p) => p.slug === slug)) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}
