import {
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  linkWithPopup,
  linkWithRedirect,
  signInWithCredential,
  signOut,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  auth,
  db,
  isFirebaseConfigured,
  validateFirebaseConfig,
  ensureAuthPersistence,
} from "./client";
import { UserProfile } from "../../types";
import { getRankInfo } from "../scoring/scoringEngine";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export interface FormattedAuthError {
  code: string;
  message: string;
  rawMessage: string;
}

/**
 * Checks whether the current runtime environment is a mobile browser
 */
export function isMobileBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isTouch = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return isMobileUA || (isTouch && /Macintosh/.test(ua));
}

/**
 * Maps raw Firebase error objects to readable explanations and error codes
 */
export function formatFirebaseAuthError(error: any): FormattedAuthError {
  const code = error?.code || "auth/unknown-error";
  const rawMessage =
    error?.message || (typeof error === "string" ? error : "An unknown authentication error occurred.");

  let plainMessage = "Sign-in failed. Please try again.";

  switch (code) {
    case "auth/timeout":
      plainMessage =
        "Sign-in did not finish. Try again, or use Chrome.";
      break;
    case "auth/operation-not-supported-in-this-environment":
      plainMessage =
        "Popup sign-in is not supported in this browser environment. Falling back to redirect...";
      break;
    case "auth/unauthorized-domain":
      plainMessage =
        "This domain is not authorized in Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized domains and add this domain (e.g. decode-iota-one.vercel.app).";
      break;
    case "auth/popup-blocked":
      plainMessage =
        "The authentication popup was blocked by your browser. Please allow popups for this site or tap Try again.";
      break;
    case "auth/popup-closed-by-user":
      plainMessage =
        "Sign-in window was closed before completing authentication. Please try again.";
      break;
    case "auth/cancelled-popup-request":
      plainMessage =
        "Sign-in request was cancelled. Please try again.";
      break;
    case "auth/network-request-failed":
      plainMessage =
        "Network connection failed. Please check your internet connection.";
      break;
    case "auth/credential-already-in-use":
      plainMessage =
        "This Google account is already linked to another user dossier.";
      break;
    case "auth/operation-not-allowed":
      plainMessage =
        "Google Sign-In is not enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable Google.";
      break;
    case "auth/invalid-api-key":
      plainMessage =
        "The Firebase API key is invalid. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in Vercel.";
      break;
    case "auth/missing-config":
      plainMessage = rawMessage;
      break;
    default:
      plainMessage = rawMessage.replace(/^Firebase:\s*/, "");
      break;
  }

  return { code, message: plainMessage, rawMessage };
}

function createInitialProfile(
  uid: string,
  displayName: string,
  isAnonymous: boolean,
  email: string | null = null,
  avatarUrl: string | null = null
): UserProfile {
  return {
    uid,
    isAnonymous,
    email,
    displayName,
    avatarUrl,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalXP: 0,
    currentRank: "Rookie",
    streak: {
      current: 1,
      longest: 1,
      lastActiveDate: new Date().toISOString().split("T")[0],
      freezeTokens: 1,
    },
    dailyGoalMinutes: 10,
    dailyMinutesToday: 0,
    activePathId: "reading-people",
    activeLessonId: "reading-people-1",
    completedUnits: [],
    unlockedUnits: ["reading-people-unit-1"],
    earnedBadges: [],
  };
}

/**
 * Fetches existing user profile from Firestore or initializes a new record
 */
export async function fetchOrCreateUserProfile(user: FirebaseUser): Promise<UserProfile> {
  console.log("[auth] fetchOrCreateUserProfile for UID:", user.uid);
  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const profile: UserProfile = {
          uid: user.uid,
          isAnonymous: false,
          email: user.email,
          displayName: user.displayName || data.displayName || "Learner",
          avatarUrl: user.photoURL || data.avatarUrl || null,
          createdAt: data.createdAt || user.metadata.creationTime || new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          totalXP: data.totalXP ?? 0,
          currentRank: data.currentRank || getRankInfo(data.totalXP ?? 0).currentRank,
          streak: data.streak || {
            current: 1,
            longest: 1,
            lastActiveDate: new Date().toISOString().split("T")[0],
            freezeTokens: 1,
          },
          dailyGoalMinutes: data.dailyGoalMinutes || 10,
          dailyMinutesToday: data.dailyMinutesToday || 0,
          activePathId: data.activePathId || "reading-people",
          activeLessonId: data.activeLessonId || "reading-people-1",
          completedUnits: data.completedUnits || [],
          unlockedUnits: data.unlockedUnits || ["reading-people-unit-1"],
          earnedBadges: data.earnedBadges || [],
        };
        await setDoc(userDocRef, { lastActiveAt: new Date().toISOString() }, { merge: true });
        console.log("[auth] Existing profile loaded for UID:", user.uid);
        return profile;
      }
    } catch (err) {
      console.warn("[auth] Failed to read user doc from Firestore:", err);
    }
  }

  const newProfile = createInitialProfile(
    user.uid,
    user.displayName || "Learner",
    false,
    user.email,
    user.photoURL
  );

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, newProfile, { merge: true });
      console.log("[auth] New profile stored in Firestore for UID:", user.uid);
    } catch (err) {
      console.warn("[auth] Failed to write initial user doc to Firestore:", err);
    }
  }

  return newProfile;
}

/**
 * Merges guest progress (XP, streak, completed units, badges) into a Google account
 */
export async function mergeGuestProgressIntoUser(
  googleUser: FirebaseUser,
  guestProfile: UserProfile | null
): Promise<UserProfile> {
  const googleUid = googleUser.uid;
  console.log("[auth] Merging guest progress into Google user UID:", googleUid);
  let existingGoogleData: any = null;

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "users", googleUid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        existingGoogleData = userDocSnap.data();
      }
    } catch (err) {
      console.warn("[auth] Failed to fetch Google user data for merge:", err);
    }
  }

  // 1. XP: union or highest total
  const googleXP = existingGoogleData?.totalXP ?? 0;
  const guestXP = guestProfile?.totalXP ?? 0;
  const mergedXP = Math.max(googleXP, guestXP);

  // 2. Completed units: union
  const googleCompleted = (existingGoogleData?.completedUnits || []) as string[];
  const guestCompleted = (guestProfile?.completedUnits || []) as string[];
  const mergedCompleted = Array.from(new Set([...googleCompleted, ...guestCompleted]));

  // 3. Unlocked units: union
  const googleUnlocked = (existingGoogleData?.unlockedUnits || ["reading-people-unit-1"]) as string[];
  const guestUnlocked = (guestProfile?.unlockedUnits || ["reading-people-unit-1"]) as string[];
  const mergedUnlocked = Array.from(new Set([...googleUnlocked, ...guestUnlocked]));

  // 4. Badges: union by badge id
  const googleBadges = existingGoogleData?.earnedBadges || [];
  const guestBadges = guestProfile?.earnedBadges || [];
  const badgeMap = new Map<string, any>();
  for (const b of [...googleBadges, ...guestBadges]) {
    if (b && b.id) badgeMap.set(b.id, b);
  }
  const mergedBadges = Array.from(badgeMap.values());

  // 5. Streak: best of both
  const googleStreakCurrent = existingGoogleData?.streak?.current ?? 1;
  const guestStreakCurrent = guestProfile?.streak?.current ?? 1;
  const googleStreakLongest = existingGoogleData?.streak?.longest ?? 1;
  const guestStreakLongest = guestProfile?.streak?.longest ?? 1;
  const googleFreeze = existingGoogleData?.streak?.freezeTokens ?? 1;
  const guestFreeze = guestProfile?.streak?.freezeTokens ?? 1;

  const mergedProfile: UserProfile = {
    uid: googleUid,
    isAnonymous: false,
    email: googleUser.email,
    displayName: googleUser.displayName || existingGoogleData?.displayName || guestProfile?.displayName || "Learner",
    avatarUrl: googleUser.photoURL || existingGoogleData?.avatarUrl || guestProfile?.avatarUrl || null,
    createdAt: existingGoogleData?.createdAt || googleUser.metadata.creationTime || new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalXP: mergedXP,
    currentRank: getRankInfo(mergedXP).currentRank,
    streak: {
      current: Math.max(googleStreakCurrent, guestStreakCurrent),
      longest: Math.max(googleStreakLongest, guestStreakLongest),
      lastActiveDate: new Date().toISOString().split("T")[0],
      freezeTokens: Math.max(googleFreeze, guestFreeze),
    },
    dailyGoalMinutes: existingGoogleData?.dailyGoalMinutes || guestProfile?.dailyGoalMinutes || 10,
    dailyMinutesToday: Math.max(existingGoogleData?.dailyMinutesToday || 0, guestProfile?.dailyMinutesToday || 0),
    activePathId: existingGoogleData?.activePathId || guestProfile?.activePathId || "reading-people",
    activeLessonId: existingGoogleData?.activeLessonId || guestProfile?.activeLessonId || "reading-people-1",
    completedUnits: mergedCompleted,
    unlockedUnits: mergedUnlocked,
    earnedBadges: mergedBadges,
  };

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "users", googleUid);
      await setDoc(userDocRef, mergedProfile, { merge: true });
      console.log("[auth] Merged profile persisted to Firestore for UID:", googleUid);
    } catch (err) {
      console.warn("[auth] Failed to persist merged profile to Firestore:", err);
    }
  }

  return mergedProfile;
}

/**
 * Initiates guest mode ONLY when the user explicitly taps "Continue as Guest"
 */
export async function loginAsGuest(): Promise<UserProfile> {
  console.log("[auth] loginAsGuest invoked");
  if (isFirebaseConfigured && auth) {
    await ensureAuthPersistence(auth);
    const cred = await signInAnonymously(auth);
    console.log("[auth] Anonymous user signed in with UID:", cred.user.uid);
    const profile = createInitialProfile(cred.user.uid, "Guest Learner", true, null);
    if (db) {
      try {
        await setDoc(doc(db, "users", cred.user.uid), profile, { merge: true });
      } catch (err) {
        console.warn("[auth] Failed to store guest profile in Firestore:", err);
      }
    }
    return profile;
  }

  // Local fallback if running in offline dev mode without Firebase
  console.log("[auth] Offline local mock guest profile created");
  const mockUid = "guest_" + Math.random().toString(36).substring(2, 9);
  return createInitialProfile(mockUid, "Guest Learner", true, null);
}

export type GoogleLoginResult = {
  profile?: UserProfile;
  redirectStarted?: boolean;
};

/**
 * Authenticates with Google.
 * PRIMARY: Uses signInWithRedirect + getRedirectResult on all browsers (desktop and mobile).
 * This works reliably across browsers with same-domain proxying (/__/auth/*) and eliminates
 * Safari ITP cross-domain storage partitioning hangs.
 * Falls back to signInWithPopup only if signInWithRedirect throws.
 */
export async function loginWithGoogle(
  guestProfile?: UserProfile | null,
  onPopupFallback?: (reason: string) => void
): Promise<GoogleLoginResult> {
  const envCheck = validateFirebaseConfig();
  if (!envCheck.isConfigured || !auth) {
    const error: any = new Error(envCheck.errorMessage || "Firebase configuration missing.");
    error.code = "auth/missing-config";
    console.error("[auth] Firebase configuration missing:", error);
    throw error;
  }

  // Ensure local persistence before any sign-in
  await ensureAuthPersistence(auth);

  const isCurrentGuest = Boolean(auth.currentUser && auth.currentUser.isAnonymous);

  // Scenario 1: User is already an anonymous Firebase guest -> linkWithRedirect as PRIMARY
  if (isCurrentGuest && auth.currentUser) {
    console.log("[auth] Active guest user detected. PRIMARY: calling linkWithRedirect...");
    try {
      await linkWithRedirect(auth.currentUser, googleProvider);
      console.log("[auth] linkWithRedirect initiated, browser redirecting...");
      return { redirectStarted: true };
    } catch (redirectErr: any) {
      console.warn("[auth] linkWithRedirect threw, attempting linkWithPopup fallback:", redirectErr);
      if (onPopupFallback) {
        onPopupFallback("Redirect failed. Falling back to popup window...");
      }

      try {
        const cred = await linkWithPopup(auth.currentUser, googleProvider);
        console.log("[auth] linkWithPopup succeeded for UID:", cred.user.uid);
        const profile = await fetchOrCreateUserProfile(cred.user);
        return { profile };
      } catch (popupErr: any) {
        if (popupErr?.code === "auth/credential-already-in-use") {
          console.log("[auth] Credential in use. Signing in and merging guest progress...");
          const credential = GoogleAuthProvider.credentialFromError(popupErr);
          let googleCred: UserCredential;
          if (credential) {
            googleCred = await signInWithCredential(auth, credential);
          } else {
            googleCred = await signInWithPopup(auth, googleProvider);
          }
          const profile = await mergeGuestProgressIntoUser(googleCred.user, guestProfile || null);
          return { profile };
        }
        console.error("[auth] Fallback linkWithPopup also failed:", popupErr);
        throw popupErr;
      }
    }
  }

  // Scenario 2: Standard Google sign-in -> signInWithRedirect as PRIMARY on all browsers
  console.log("[auth] PRIMARY: calling signInWithRedirect on all browsers...");
  try {
    await signInWithRedirect(auth, googleProvider);
    console.log("[auth] signInWithRedirect initiated, browser redirecting...");
    return { redirectStarted: true };
  } catch (redirectErr: any) {
    console.warn("[auth] signInWithRedirect threw, falling back to signInWithPopup:", redirectErr);
    if (onPopupFallback) {
      onPopupFallback("Redirect failed. Falling back to popup window...");
    }

    try {
      console.log("[auth] Fallback: calling signInWithPopup...");
      const cred = await signInWithPopup(auth, googleProvider);
      console.log("[auth] signInWithPopup succeeded for UID:", cred.user.uid);
      if (guestProfile) {
        const profile = await mergeGuestProgressIntoUser(cred.user, guestProfile);
        return { profile };
      }
      const profile = await fetchOrCreateUserProfile(cred.user);
      return { profile };
    } catch (popupErr: any) {
      console.error("[auth] Fallback signInWithPopup also failed:", popupErr);
      throw popupErr;
    }
  }
}

/**
 * Handles redirect result on page mount.
 * Returns the authenticated/merged UserProfile if a redirect operation completed, or null.
 */
export async function handleRedirectResult(guestProfile?: UserProfile | null): Promise<UserProfile | null> {
  const envCheck = validateFirebaseConfig();
  if (!envCheck.isConfigured || !auth) {
    return null;
  }

  console.log("[auth] Awaiting getRedirectResult(auth)...");
  try {
    const result = await getRedirectResult(auth);
    console.log("[auth] getRedirectResult returned:", result ? `UID: ${result.user?.uid}` : "null");

    if (!result || !result.user) {
      return null;
    }

    if (guestProfile) {
      console.log("[auth] Redirect result: merging guest profile...");
      return await mergeGuestProgressIntoUser(result.user, guestProfile);
    }
    return await fetchOrCreateUserProfile(result.user);
  } catch (err: any) {
    console.error("[auth] getRedirectResult error encountered:", err);

    if (err?.code === "auth/credential-already-in-use") {
      const credential = GoogleAuthProvider.credentialFromError(err);
      if (credential) {
        console.log("[auth] Redirect credential already in use. Signing in with credential...");
        const userCred = await signInWithCredential(auth, credential);
        return await mergeGuestProgressIntoUser(userCred.user, guestProfile || null);
      }
    }

    throw err;
  }
}

/**
 * Links an active guest session to Google from Settings (PRIMARY: linkWithRedirect)
 */
export async function linkGuestWithGoogle(
  currentUserProfile: UserProfile,
  onPopupFallback?: (reason: string) => void
): Promise<GoogleLoginResult> {
  const envCheck = validateFirebaseConfig();
  if (!envCheck.isConfigured || !auth) {
    const error: any = new Error(envCheck.errorMessage || "Firebase configuration missing.");
    error.code = "auth/missing-config";
    console.error("[auth] Cannot link account:", error);
    throw error;
  }

  await ensureAuthPersistence(auth);

  if (auth.currentUser) {
    console.log("[auth] Settings: PRIMARY linkWithRedirect...");
    try {
      await linkWithRedirect(auth.currentUser, googleProvider);
      return { redirectStarted: true };
    } catch (redirectErr: any) {
      console.warn("[auth] Settings linkWithRedirect failed, falling back to popup:", redirectErr);
      if (onPopupFallback) {
        onPopupFallback("Redirect failed. Falling back to popup window...");
      }

      try {
        const cred = await linkWithPopup(auth.currentUser, googleProvider);
        const profile = await mergeGuestProgressIntoUser(cred.user, currentUserProfile);
        return { profile };
      } catch (popupErr: any) {
        if (popupErr?.code === "auth/credential-already-in-use") {
          const credential = GoogleAuthProvider.credentialFromError(popupErr);
          let googleCred: UserCredential;
          if (credential) {
            googleCred = await signInWithCredential(auth, credential);
          } else {
            googleCred = await signInWithPopup(auth, googleProvider);
          }
          const profile = await mergeGuestProgressIntoUser(googleCred.user, currentUserProfile);
          return { profile };
        }

        console.error("[auth] Settings link fallback also failed:", popupErr);
        throw popupErr;
      }
    }
  }

  const err: any = new Error("No active Firebase session found to link.");
  err.code = "auth/no-current-user";
  throw err;
}

export async function logout(): Promise<void> {
  console.log("[auth] Signing out user...");
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
