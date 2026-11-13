/** Shrinks large photos in the browser so uploads stay small and fast. */
export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export async function uploadImage(api: (path: string, init?: RequestInit) => Promise<Response>, file: File) {
  const fd = new FormData();
  fd.append("file", await prepareImage(file));
  const res = await api("/api/admin/upload", { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as { url?: string; publicId?: string; message?: string };
  if (!res.ok || !json.url) throw new Error(json.message ?? "Upload failed.");
  return { url: json.url, publicId: json.publicId ?? "" };
}
