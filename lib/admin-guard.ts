import { NextResponse } from "next/server";
import { adminAuth } from "./firebase-admin";

/**
 * Verifies the Firebase ID token sent by the dashboard and checks the email
 * against ADMIN_EMAILS. Returns the admin email, or a ready made error response.
 */
export async function requireAdmin(req: Request): Promise<{ email: string } | NextResponse> {
  const auth = adminAuth();
  if (!auth) return NextResponse.json({ message: "Firebase is not configured on the server." }, { status: 503 });
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  try {
    const decoded = await auth.verifyIdToken(token);
    const email = (decoded.email ?? "").toLowerCase();
    const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (!email || !allowed.includes(email)) return NextResponse.json({ message: "This account is not allowed to manage the newsroom." }, { status: 403 });
    return { email };
  } catch {
    return NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
  }
}
