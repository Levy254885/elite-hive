"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./AdminShell";
import type { ProjectRecord } from "@/lib/projects";

export default function ProjectsDashboard() {
  const { api } = useAdmin();
  const [rows, setRows] = useState<ProjectRecord[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api("/api/admin/projects");
      const json = (await res.json()) as { projects?: ProjectRecord[]; message?: string };
      if (!res.ok) throw new Error(json.message ?? "Could not load projects.");
      setRows(json.projects ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load projects.");
    }
  }, [api]);

  useEffect(() => { void load(); }, [load]);

  async function toggle(r: ProjectRecord) {
    const res = await api(`/api/admin/projects/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: r.status === "published" ? "draft" : "published" }) });
    if (!res.ok) setError(((await res.json().catch(() => ({}))) as { message?: string }).message ?? "Update failed.");
    await load();
  }
  async function remove(r: ProjectRecord) {
    if (!window.confirm(`Delete "${r.title}" and its images? This cannot be undone.`)) return;
    const res = await api(`/api/admin/projects/${r.id}`, { method: "DELETE" });
    if (!res.ok) setError("Delete failed.");
    await load();
  }

  return (
    <>
      <div className="adm-head">
        <h1>Projects</h1>
        <Link className="adm-btn" href="/admin/projects/new">New project</Link>
      </div>
      <p className="adm-hint">Projects you publish here appear on the Portfolio page and on the home page. The built in Tirus and Esther Foundation project is part of the website code and is not listed here.</p>
      {error && <p className="adm-err" role="alert">{error}</p>}
      {rows === null && !error && <p>Loading projects...</p>}
      {rows && rows.length === 0 && <p>No projects yet. Press New project to add your first one.</p>}
      {rows && rows.length > 0 && (
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Updated</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><Link href={`/admin/projects/edit/${r.id}`}>{r.title}</Link></td>
                  <td>{r.category}</td>
                  <td><span className={`adm-pill ${r.status}`}>{r.status}</span></td>
                  <td>{r.updatedAt.slice(0, 10)}</td>
                  <td className="adm-act">
                    <Link href={`/admin/projects/edit/${r.id}`}>Edit</Link>
                    <button onClick={() => toggle(r)}>{r.status === "published" ? "Unpublish" : "Publish"}</button>
                    {r.status === "published" && <Link href={`/portfolio/${r.slug}`} target="_blank">View</Link>}
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
