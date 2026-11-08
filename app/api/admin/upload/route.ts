import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const g = await requireAdmin(req);
  if (g instanceof NextResponse) return g;
  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ message: "No file received." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ message: "Only image files are allowed." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ message: "Image is too large. Use an image under 4 MB." }, { status: 413 });
  try {
    return NextResponse.json(await uploadImage(file));
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Upload failed." }, { status: 502 });
  }
}
