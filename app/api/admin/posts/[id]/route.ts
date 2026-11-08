import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { destroyImage } from "@/lib/cloudinary";
import { getPostById, parsePostInput, postsCollection, uniqueSlug } from "@/lib/posts";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

function refresh(slug?: string) {
  revalidatePath("/newsroom");
  revalidatePath("/");
  if (slug) revalidatePath(`/newsroom/${slug}`);
}

export async function GET(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const { id } = await params;
  const post = await getPostById(id);
  return post ? NextResponse.json({ post }) : NextResponse.json({ message: "Post not found." }, { status: 404 });
}

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = postsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ message: "Post not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const parsed = parsePostInput(body);
  if ("error" in parsed) return NextResponse.json({ message: parsed.error }, { status: 400 });
  try {
    const now = new Date().toISOString();
    const slug = await uniqueSlug(parsed.data.slug, id);
    const publishedAt = parsed.data.status === "published" ? existing.publishedAt ?? now : existing.publishedAt;
    await col.doc(id).set({ ...parsed.data, slug, createdAt: existing.createdAt, updatedAt: now, publishedAt });
    if (existing.coverId && existing.coverId !== parsed.data.coverId) await destroyImage(existing.coverId);
    refresh(existing.slug);
    refresh(slug);
    return NextResponse.json({ id, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not save the post." }, { status: 500 });
  }
}

/** Quick publish or unpublish from the dashboard list. */
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = postsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ message: "Post not found." }, { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const status = body.status === "published" ? "published" : "draft";
  if (status === "published" && existing.content.length < 20) return NextResponse.json({ message: "Add article content before publishing." }, { status: 400 });
  const now = new Date().toISOString();
  await col.doc(id).update({ status, updatedAt: now, publishedAt: status === "published" ? existing.publishedAt ?? now : existing.publishedAt });
  refresh(existing.slug);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = postsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
  const { id } = await params;
  const existing = await getPostById(id);
  if (!existing) return NextResponse.json({ message: "Post not found." }, { status: 404 });
  await col.doc(id).delete();
  if (existing.coverId) await destroyImage(existing.coverId);
  refresh(existing.slug);
  return NextResponse.json({ ok: true });
}
