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

  return (
    <Ctx.Provider value={{ api, email: user.email ?? "" }}>
      <div className="adm-bar">
        <strong>Elite Hive admin</strong>
        <nav className="adm-nav" aria-label="Admin">
          <Link href="/admin" className={pathname.startsWith("/admin/projects") ? "" : "on"}>Posts</Link>
          <Link href="/admin/projects" className={pathname.startsWith("/admin/projects") ? "on" : ""}>Projects</Link>
        </nav>
        <span>
          <Link href="/" target="_blank">View site</Link>
          <span className="adm-email">{user.email}</span>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </span>
      </div>
      <div className="adm-wrap">{children}</div>
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
      <h1>Newsroom admin</h1>
      <p>Sign in to manage news and blog posts.</p>
      <label>Email<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="alert">{msg.text}</p>}
      <button className="adm-btn" disabled={busy}>{busy ? "Signing in..." : "Sign in"}</button>
      <button type="button" className="adm-link" onClick={reset}>Forgot password</button>
    </form>
  );
}
