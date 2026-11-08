import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { listAllPosts, parsePostInput, postsCollection, uniqueSlug } from "@/lib/posts";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  try {
    const posts = (await listAllPosts()).map(({ content: _content, ...rest }) => rest);
    return NextResponse.json({ posts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not load posts." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  const col = postsCollection();
  if (!col) return NextResponse.json({ message: "Firestore is not configured." }, { status: 503 });
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
    const slug = await uniqueSlug(parsed.data.slug);
    const ref = col.doc();
    await ref.set({ ...parsed.data, slug, createdAt: now, updatedAt: now, publishedAt: parsed.data.status === "published" ? now : null });
    revalidatePath("/newsroom");
    revalidatePath("/");
    return NextResponse.json({ id: ref.id, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Could not save the post." }, { status: 500 });
  }
}
