"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { clientAuth } from "@/lib/firebase-client";

type Api = (path: string, init?: RequestInit) => Promise<Response>;
const Ctx = createContext<{ api: Api; email: string } | null>(null);
export const useAdmin = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin must be used inside AdminShell");
  return v;
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => clientAuth(), []);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, [auth]);

  const api = useCallback<Api>(
    async (path, init) => {
      const token = user ? await user.getIdToken() : "";
      return fetch(path, { ...init, headers: { ...(init?.headers ?? {}), Authorization: `Bearer ${token}` } });
    },
    [user],
  );

  if (!auth) {
    return (
      <div className="adm-card">
        <h1>Admin</h1>
        <p className="adm-err">Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables (see README) and redeploy.</p>
      </div>
    );
  }
  if (user === undefined) return <div className="adm-card"><p>Loading...</p></div>;
  if (!user) return <Login />;

  const title = pathname === "/admin" ? "Overview" : pathname.startsWith("/admin/projects/new") ? "New project" : pathname.startsWith("/admin/projects/edit") ? "Edit project" : pathname.startsWith("/admin/projects") ? "Projects" : pathname.startsWith("/admin/new") ? "New post" : pathname.startsWith("/admin/edit") ? "Edit post" : "Posts";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const initials = (user.email ?? "A").slice(0, 2).toUpperCase();
  const icon = { fill: "none", viewBox: "0 0 24 24", "aria-hidden": true } as const;

  return (
    <Ctx.Provider value={{ api, email: user.email ?? "" }}>
      <div className="adm-shell">
        <aside className="adm-side">
          <Link href="/admin" className="adm-brand" aria-label="Elite Hive admin home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" width={334} height={303} alt="" />
            <span><b>Elite Hive</b><small>Admin</small></span>
          </Link>
          <nav className="adm-nav" aria-label="Admin">
            <Link href="/admin" className={pathname === "/admin" ? "on" : ""}>
              <svg {...icon}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>Overview
            </Link>
            <Link href="/admin/posts" className={pathname === "/admin/posts" || pathname.startsWith("/admin/new") || pathname.startsWith("/admin/edit") ? "on" : ""}>
              <svg {...icon}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>Posts
            </Link>
            <Link href="/admin/projects" className={pathname.startsWith("/admin/projects") ? "on" : ""}>
              <svg {...icon}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>Projects
            </Link>
          </nav>
          <p className="adm-label">Shortcuts</p>
          <nav className="adm-nav sm" aria-label="Shortcuts">
            <Link href="/admin/new"><svg {...icon}><path d="M12 5v14M5 12h14" /></svg>Write a post</Link>
            <Link href="/admin/projects/new"><svg {...icon}><path d="M12 5v14M5 12h14" /></svg>Add a project</Link>
          </nav>
        </aside>
        <div className="adm-main">
          <header className="adm-top">
            <div><div className="adm-title">{title}</div><p>{today}</p></div>
            <div className="adm-user">
              <Link href="/" target="_blank">View website</Link>
              <span className="av" aria-hidden>{initials}</span>
              <span className="em">{user.email}</span>
              <button onClick={() => signOut(auth)}>Sign out</button>
            </div>
          </header>
          <div className="adm-wrap">{children}</div>
        </div>
      </div>
    </Ctx.Provider>
  );
}

function Login() {
  const auth = clientAuth()!;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setMsg({ text: "Incorrect email or password." });
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!email) return setMsg({ text: "Enter your email first, then press Forgot password." });
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg({ text: "Password reset email sent.", ok: true });
    } catch {
      setMsg({ text: "Could not send the reset email." });
    }
  }

  return (
    <form className="adm-card" onSubmit={submit}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" width={334} height={303} alt="Elite Hive" />
      <h1>Sign in</h1>
      <p>Manage news, blogs, projects and see how the website performs.</p>
      <label>Email<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="alert">{msg.text}</p>}
      <button className="adm-btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      <button type="button" className="adm-link" onClick={reset}>Forgot password</button>
    </form>
  );
}
