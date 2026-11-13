"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "./AdminShell";
import { renderMarkdown } from "@/lib/markdown";
import type { Post } from "@/lib/posts";

type Form = { title: string; slug: string; type: "news" | "blog"; excerpt: string; content: string; coverUrl: string; coverId: string; tags: string; author: string; status: "draft" | "published" };
const EMPTY: Form = { title: "", slug: "", type: "news", excerpt: "", content: "", coverUrl: "", coverId: "", tags: "", author: "Elite Hive Kenya", status: "draft" };

/** Shrinks large photos in the browser so uploads stay small and fast. */
async function prepare(file: File): Promise<File> {
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

export default function Editor({ id }: { id?: string }) {
  const { api } = useAdmin();
  const router = useRouter();
  const [f, setF] = useState<Form>(EMPTY);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null);
  const [preview, setPreview] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const bodyInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await api(`/api/admin/posts/${id}`);
      const json = (await res.json()) as { post?: Post; message?: string };
      if (!res.ok || !json.post) setMsg({ text: json.message ?? "Could not load this post." });
      else {
        const p = json.post;
        setF({ title: p.title, slug: p.slug, type: p.type, excerpt: p.excerpt, content: p.content, coverUrl: p.coverUrl, coverId: p.coverId, tags: p.tags.join(", "), author: p.author, status: p.status });
      }
      setLoading(false);
    })();
  }, [id, api]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", await prepare(file));
    const res = await api("/api/admin/upload", { method: "POST", body: fd });
    const json = (await res.json()) as { url?: string; publicId?: string; message?: string };
    if (!res.ok || !json.url) throw new Error(json.message ?? "Upload failed.");
    return { url: json.url, publicId: json.publicId ?? "" };
  }

  async function onCover(file?: File) {
    if (!file) return;
    setBusy("Uploading cover image...");
    setMsg(null);
    try {
      const r = await upload(file);
      setF((x) => ({ ...x, coverUrl: r.url, coverId: r.publicId }));
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Upload failed." });
    }
    setBusy("");
  }

  async function onBodyImage(file?: File) {
    if (!file) return;
    setBusy("Uploading image...");
    setMsg(null);
    try {
      const r = await upload(file);
      insert(`\n\n![${file.name.replace(/\.\w+$/, "")}](${r.url})\n\n`);
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Upload failed." });
    }
    setBusy("");
  }

  function insert(text: string, wrap?: [string, string]) {
    const el = area.current;
    const start = el?.selectionStart ?? f.content.length;
    const end = el?.selectionEnd ?? f.content.length;
    const sel = f.content.slice(start, end);
    const out = wrap ? wrap[0] + (sel || "text") + wrap[1] : text;
    set("content", f.content.slice(0, start) + out + f.content.slice(end));
    requestAnimationFrame(() => el?.focus());
  }

  async function save(status: "draft" | "published") {
    setBusy("Saving...");
    setMsg(null);
    const body = { ...f, status, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    const res = await api(id ? `/api/admin/posts/${id}` : "/api/admin/posts", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    setBusy("");
    if (!res.ok) return setMsg({ text: json.message ?? "Could not save." });
    router.push("/admin");
  }

  if (loading) return <p>Loading post...</p>;

  return (
    <>
      <div className="adm-head">
        <h1>{id ? "Edit post" : "New post"}</h1>
        <Link className="adm-link" href="/admin">Back to posts</Link>
      </div>
      <div className="adm-form">
        <label>Title<input value={f.title} maxLength={160} onChange={(e) => set("title", e.target.value)} /></label>
        <div className="adm-row">
          <label>Type<select value={f.type} onChange={(e) => set("type", e.target.value as Form["type"])}><option value="news">News</option><option value="blog">Blog</option></select></label>
          <label>Author<input value={f.author} maxLength={80} onChange={(e) => set("author", e.target.value)} /></label>
        </div>
        <label>Short summary (shown on cards and in Google)<textarea rows={2} maxLength={300} value={f.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></label>
        <label>Tags (separate with commas)<input value={f.tags} onChange={(e) => set("tags", e.target.value)} /></label>
        <label>Web address ending (optional, made from the title if empty)<input value={f.slug} maxLength={80} onChange={(e) => set("slug", e.target.value)} /></label>

        <div className="adm-cover">
          <span>Cover image</span>
          {f.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.coverUrl} alt="Cover preview" />
          ) : (
            <p className="adm-hint">No cover image yet.</p>
          )}
          <input ref={coverInput} type="file" accept="image/*" hidden onChange={(e) => { void onCover(e.target.files?.[0]); e.target.value = ""; }} />
          <button type="button" className="adm-btn alt" onClick={() => coverInput.current?.click()}>{f.coverUrl ? "Replace cover" : "Upload cover"}</button>
          {f.coverUrl && <button type="button" className="adm-link" onClick={() => setF((x) => ({ ...x, coverUrl: "", coverId: "" }))}>Remove</button>}
        </div>

        <div className="adm-tools" role="toolbar" aria-label="Formatting">
          <button type="button" onClick={() => insert("", ["## ", ""])}>Heading</button>
          <button type="button" onClick={() => insert("", ["**", "**"])}>Bold</button>
          <button type="button" onClick={() => insert("", ["*", "*"])}>Italic</button>
          <button type="button" onClick={() => insert("\n- item one\n- item two\n")}>List</button>
          <button type="button" onClick={() => insert("", ["[", "](https://)"])}>Link</button>
          <input ref={bodyInput} type="file" accept="image/*" hidden onChange={(e) => { void onBodyImage(e.target.files?.[0]); e.target.value = ""; }} />
          <button type="button" onClick={() => bodyInput.current?.click()}>Add image</button>
          <button type="button" className={preview ? "on" : ""} onClick={() => setPreview((v) => !v)}>{preview ? "Edit" : "Preview"}</button>
        </div>
        {preview ? (
          <div className="prose adm-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(f.content) || "<p>Nothing to preview yet.</p>" }} />
        ) : (
          <textarea ref={area} className="adm-body" rows={18} value={f.content} onChange={(e) => set("content", e.target.value)} placeholder="Write your article. Leave a blank line between paragraphs." />
        )}

        {busy && <p className="adm-hint">{busy}</p>}
        {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="alert">{msg.text}</p>}
        <div className="adm-actions">
          <button type="button" className="adm-btn alt" disabled={Boolean(busy)} onClick={() => save("draft")}>Save as draft</button>
          <button type="button" className="adm-btn" disabled={Boolean(busy)} onClick={() => save("published")}>{f.status === "published" ? "Update and keep published" : "Publish"}</button>
        </div>
      </div>
    </>
  );
}
