import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function app(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;
  return getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

/** Returns null when Firebase is not configured, so the public site still works. */
export function adminDb() {
  const a = app();
  return a ? getFirestore(a) : null;
}

export function adminAuth() {
  const a = app();
  return a ? getAuth(a) : null;
}
