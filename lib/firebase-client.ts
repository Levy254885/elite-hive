import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/** Browser side Firebase (Authentication only). Returns null when not configured. */
export function clientAuth() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
        projectId,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
  return getAuth(app);
}
