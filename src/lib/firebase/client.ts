import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from "firebase/firestore";

export const REQUIRED_FIREBASE_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingVariables: string[];
  errorMessage: string | null;
}

/**
 * Determines the authDomain to use.
 * In the browser, uses window.location.host so requests route to the same domain (bypassing Safari ITP storage partitioning).
 * Falls back to NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN on the server and on localhost.
 */
export function getAuthDomain(): string {
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (!isLocalhost && window.location.host) {
      return window.location.host;
    }
  }

  return (
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "decode-be09a.firebaseapp.com"
  );
}

/**
 * Checks whether the current browser is Safari (macOS or iOS)
 */
export function isSafariBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|CriOS|Chromium|Edg|OPR|Opera|FxiOS/i.test(ua);
}

export function validateFirebaseConfig(): FirebaseConfigStatus {
  const missingVariables: string[] = [];

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || apiKey === "your-api-key" || apiKey.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  }
  if (!authDomain || authDomain.includes("your-project-id") || authDomain.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  }
  if (!projectId || projectId === "your-project-id" || projectId.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  }
  if (!storageBucket || storageBucket.includes("your-project-id") || storageBucket.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  }
  if (!messagingSenderId || messagingSenderId === "your-messaging-sender-id" || messagingSenderId.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  }
  if (!appId || appId === "your-app-id" || appId.trim() === "") {
    missingVariables.push("NEXT_PUBLIC_FIREBASE_APP_ID");
  }

  const isConfigured = missingVariables.length === 0;
  const errorMessage = isConfigured
    ? null
    : `Firebase configuration is incomplete. Missing or unset environment variable(s): ${missingVariables.join(", ")}. Please configure them in Vercel Project Settings > Environment Variables.`;

  return { isConfigured, missingVariables, errorMessage };
}

export const firebaseConfigStatus = validateFirebaseConfig();
export const isFirebaseConfigured = firebaseConfigStatus.isConfigured;

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export async function ensureAuthPersistence(authInstance?: Auth | null): Promise<void> {
  const targetAuth = authInstance || auth;
  if (targetAuth) {
    try {
      await setPersistence(targetAuth, browserLocalPersistence);
      console.log("[auth] browserLocalPersistence established successfully");
    } catch (err) {
      console.warn("[auth] setPersistence warning:", err);
    }
  }
}

if (typeof window !== "undefined") {
  if (!firebaseConfigStatus.isConfigured) {
    console.error(
      `[auth] Firebase Configuration Error: ${firebaseConfigStatus.errorMessage}`
    );
  } else {
    try {
      console.log("[auth] Initializing Firebase app with authDomain:", firebaseConfig.authDomain);
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);

      // Pre-configure local persistence immediately upon client load
      ensureAuthPersistence(auth);

      // Initialize Firestore with Offline Persistence & Multi-Tab Synchronization
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        // Fallback if already initialized
        db = getFirestore(app);
      }
    } catch (error) {
      console.error("[auth] Failed to initialize Firebase app:", error);
    }
  }
}

export { app, auth, db };
