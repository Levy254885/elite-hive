import { createHash } from "node:crypto";

function config() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return cloud && key && secret ? { cloud, key, secret } : null;
}

const sign = (params: string, secret: string) => createHash("sha1").update(params + secret).digest("hex");

export async function uploadImage(file: File, folder = "elite-hive/newsroom") {
  const c = config();
  if (!c) throw new Error("Cloudinary is not configured on the server.");
  const timestamp = Math.floor(Date.now() / 1000);
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", c.key);
  fd.append("timestamp", String(timestamp));
  fd.append("folder", folder);
  fd.append("signature", sign(`folder=${folder}&timestamp=${timestamp}`, c.secret));
  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/image/upload`, { method: "POST", body: fd });
  const json = (await res.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };
  if (!res.ok || !json.secure_url || !json.public_id) throw new Error(json.error?.message ?? "Image upload failed.");
  return { url: json.secure_url, publicId: json.public_id };
}

/** Best effort clean up when a post or its cover image is removed. */
export async function destroyImage(publicId: string) {
  const c = config();
  if (!c || !publicId) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const fd = new FormData();
  fd.append("public_id", publicId);
  fd.append("api_key", c.key);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", sign(`public_id=${publicId}&timestamp=${timestamp}`, c.secret));
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/image/destroy`, { method: "POST", body: fd });
  } catch {
    /* ignore */
  }
}
