import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { destroyImage } from "@/lib/cloudinary";
import { getProjectById, parseProjectInput, projectsCollection, uniqueProjectSlug } from "@/lib/projects-db";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

function refresh(slug?: string) {
  revalidatePath("/portfolio");
  revalidatePath("/");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function GET(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const { id } = await params;
  const project = await getProjectById(id);
  return project ? NextResponse.json({ project }) : NextResponse.json({ message: "Project not found." }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = projectsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getProjectById(id);
  if (!existing) return NextResponse.json({ message: "Project not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const parsed = parseProjectInput(body);
  if ("error" in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
  try {
    const now = new Date().toISOString();
    const slug = await uniqueProjectSlug(parsed.data.slug, id);
    const publishedAt = parsed.data.status === "published" ? existing.publishedAt ?? now : existing.publishedAt;
    await col.doc(id).set({ ...parsed.data, slug, createdAt: existing.createdAt, updatedAt: now, publishedAt });
    // remove images that are no longer used
    if (existing.coverId && existing.coverId !== parsed.data.coverId) await destroyImage(existing.coverId);
    for (const gid of existing.galleryIds) if (gid && !parsed.data.galleryIds.includes(gid)) await destroyImage(gid);
    refresh(existing.slug);
    refresh(slug);
    return NextResponse.json({ id, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not save the project." }, { status: 500 });
  }
}

/** Quick publish or unpublish from the dashboard list. */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = projectsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getProjectById(id);
  if (!existing) return NextResponse.json({ message: "Project not found." }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = body.status === "published" ? "published" : "draft";
  if (status === "published" && !existing.coverUrl && !existing.youtubeId && existing.gallery.length === 0) {
    return NextResponse.json({ message: "Add a cover image, a YouTube link or gallery images before publishing." }, { status: 400 });
  }
  const now = new Date().toISOString();
  await col.doc(id).update({ status, updatedAt: now, publishedAt: status === "published" ? existing.publishedAt ?? now : existing.publishedAt });
  refresh(existing.slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = projectsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getProjectById(id);
  if (!existing) return NextResponse.json({ message: "Project not found." }, { status: 404 });
  await col.doc(id).delete();
  if (existing.coverId) await destroyImage(existing.coverId);
  for (const gid of existing.galleryIds) if (gid) await destroyImage(gid);
  refresh(existing.slug);
  return NextResponse.json({ ok: true });
}
