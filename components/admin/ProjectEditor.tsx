"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "./AdminShell";
import { uploadImage } from "./image";
import { ALL_CATEGORIES, type ProjectRecord } from "@/lib/projects";

type Img = { url: string; id: string };
type Form = { title: string; slug: string; category: string; client: string; youtube: string; description: string; coverUrl: string; coverId: string; gallery: Img[] };
const EMPTY: Form = { title: "", slug: "", category: ALL_CATEGORIES[0], client: "", youtube: "", description: "", coverUrl: "", coverId: "", gallery: [] };

export default function ProjectEditor({ id }: { id?: string }) {
  const { api } = useAdmin();
  const router = useRouter();
  const [f, setF] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await api(`/api/admin/projects/${id}`);
      const json = (await res.json()) as { project?: ProjectRecord; message?: string };
      if (!res.ok || !json.project) setMsg(json.message ?? "Could not load this project.");
      else {
        const p = json.project;
        setStatus(p.status);
        setF({
          title: p.title, slug: p.slug, category: p.category, client: p.client ?? "",
          youtube: p.youtubeId ? `https://youtu.be/${p.youtubeId}` : "",
          description: p.description, coverUrl: p.coverUrl ?? "", coverId: p.coverId,
          gallery: (p.gallery ?? []).map((url, i) => ({ url, id: p.galleryIds[i] ?? "" })),
        });
      }
      setLoading(false);
    })();
  }, [id, api]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function onCover(file?: File) {
    if (!file) return;
    setBusy("Uploading cover image...");
    setMsg("");
    try {
      const r = await uploadImage(api, file);
      setF((x) => ({ ...x, coverUrl: r.url, coverId: r.publicId }));
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    }
    setBusy("");
  }

  async function onGallery(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, Math.max(0, 12 - f.gallery.length));
    setMsg("");
    for (let i = 0; i < list.length; i++) {
      setBusy(`Uploading image ${i + 1} of ${list.length}...`);
      try {
        const r = await uploadImage(api, list[i]);
        setF((x) => ({ ...x, gallery: [...x.gallery, { url: r.url, id: r.publicId }] }));
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Upload failed.");
        break;
      }
    }
    setBusy("");
  }

  async function save(next: "draft" | "published") {
    setBusy("Saving...");
    setMsg("");
    const res = await api(id ? `/api/admin/projects/${id}` : "/api/admin/projects", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, status: next }),
    });
    const json = (await res.json().catch(() => ({}))) as { message?: string };
    setBusy("");
    if (!res.ok) return setMsg(json.message ?? "Could not save.");
    router.push("/admin/projects");
  }

  if (loading) return <p>Loading project...</p>;

  return (
    <>
      <div className="adm-head">
        <h1>{id ? "Edit project" : "New project"}</h1>
        <Link className="adm-link" href="/admin/projects">Back to projects</Link>
      </div>
      <div className="adm-form">
        <label>Project title<input value={f.title} maxLength={160} onChange={(e) => set("title", e.target.value)} /></label>
        <div className="adm-row">
          <label>Category<select value={f.category} onChange={(e) => set("category", e.target.value)}>{ALL_CATEGORIES.map((c) => (<option key={c}>{c}</option>))}</select></label>
          <label>Client (optional)<input value={f.client} maxLength={100} onChange={(e) => set("client", e.target.value)} /></label>
        </div>
        <label>YouTube link (optional, for video projects)<input value={f.youtube} placeholder="https://youtu.be/..." onChange={(e) => set("youtube", e.target.value)} /></label>
        <label>Description<textarea rows={5} maxLength={3000} value={f.description} onChange={(e) => set("description", e.target.value)} /></label>
        <label>Web address ending (optional, made from the title if empty)<input value={f.slug} maxLength={80} onChange={(e) => set("slug", e.target.value)} /></label>

        <div className="adm-cover">
          <span>Cover image (shown on cards; a video project uses its YouTube thumbnail if empty)</span>
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

        <div className="adm-cover">
          <span>Gallery images (up to 12)</span>
          {f.gallery.length > 0 && (
            <div className="adm-gal">
              {f.gallery.map((g, i) => (
                <figure key={g.url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.url} alt={`Gallery image ${i + 1}`} />
                  <button type="button" onClick={() => setF((x) => ({ ...x, gallery: x.gallery.filter((_, j) => j !== i) }))}>Remove</button>
                </figure>
              ))}
            </div>
          )}
          <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => { void onGallery(e.target.files); e.target.value = ""; }} />
          <button type="button" className="adm-btn alt" disabled={f.gallery.length >= 12} onClick={() => galleryInput.current?.click()}>Add gallery images</button>
        </div>

        {busy && <p className="adm-hint">{busy}</p>}
        {msg && <p className="adm-err" role="alert">{msg}</p>}
        <div className="adm-actions">
          <button type="button" className="adm-btn alt" disabled={Boolean(busy)} onClick={() => save("draft")}>Save as draft</button>
          <button type="button" className="adm-btn" disabled={Boolean(busy)} onClick={() => save("published")}>{status === "published" ? "Update and keep published" : "Publish"}</button>
        </div>
      </div>
    </>
  );
}
