"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./AdminShell";
import type { Post } from "@/lib/posts";

type Row = Omit<Post, "content">;

export default function Dashboard() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "news" | "blog" | "draft">("all");

  const load = useCallback(async () => {
    try {
      const res = await api("/api/admin/posts");
      const json = (await res.json()) as { posts?: Row[]; message?: string };
      if (!res.ok) throw new Error(json.message ?? "Could not load posts.");
      setRows(json.posts ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load posts.");
    }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  async function toggle(r: Row) {
    const res = await api(`/api/admin/posts/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: r.status === "published" ? "draft" : "published" }) });
    if (!res.ok) setError(((await res.json().catch(() => ({}))) as { message?: string }).message ?? "Update failed.");
    await load();
  }
  async function remove(r: Row) {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    const res = await api(`/api/admin/posts/${r.id}`, { method: "DELETE" });
    if (!res.ok) setError("Delete failed.");
    await load();
  }

  const shown = (rows ?? []).filter((r) => filter === "all" || (filter === "draft" ? r.status === "draft" : r.type === filter));

  return (
    <>
      <div className="adm-head">
        <h1>Posts</h1>
        <Link className="adm-btn" href="/admin/new">New post</Link>
      </div>
      <div className="adm-tabs">
        {(["all", "news", "blog", "draft"] as const).map((f) => (
          <button key={f} className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>{f === "draft" ? "Drafts" : f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      {error && <p className="adm-err" role="alert">{error}</p>}
      {rows === null && !error && <p>Loading posts...</p>}
      {rows && shown.length === 0 && <p>No posts here yet. Press New post to write your first one.</p>}
      {shown.length > 0 && (
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/edit/${r.id}`}>{r.title}</Link></td>
                  <td>{r.type}</td>
                  <td><span className={`adm-pill ${r.status}`}>{r.status}</span></td>
                  <td>{r.updatedAt.slice(0, 10)}</td>
                  <td className="adm-act">
                    <Link href={`/admin/edit/${r.id}`}>Edit</Link>
                    <button onClick={() => toggle(r)}>{r.status === "published" ? "Unpublish" : "Publish"}</button>
                    {r.status === "published" && <Link href={`/newsroom/${r.slug}`} target="_blank">View</Link>}
                    <button className="del" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
