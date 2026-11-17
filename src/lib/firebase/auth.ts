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
import { auth, db, isFirebaseConfigured, validateFirebaseConfig } from "./client";
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
    case "auth/unauthorized-domain":
      plainMessage =
        "This domain is not authorized in Firebase Console. Go to Firebase Console > Authentication > Settings > Authorized domains and add this domain (e.g. decode-iota-one.vercel.app).";
      break;
    case "auth/popup-blocked":
      plainMessage =
        "The authentication popup was blocked by your browser. Please allow popups or use redirect sign-in.";
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
        return profile;
      }
    } catch (err) {
      console.warn("[Auth] Failed to read user doc from Firestore:", err);
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
    } catch (err) {
      console.warn("[Auth] Failed to write initial user doc to Firestore:", err);
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
  let existingGoogleData: any = null;

  if (isFirebaseConfigured && db) {
    try {
      const userDocRef = doc(db, "users", googleUid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        existingGoogleData = userDocSnap.data();
      }
    } catch (err) {
      console.warn("[Auth] Failed to fetch Google user data for merge:", err);
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
    } catch (err) {
      console.warn("[Auth] Failed to persist merged profile to Firestore:", err);
    }
  }

  return mergedProfile;
}

/**
 * Initiates guest mode ONLY when the user explicitly taps "Continue as Guest"
 */
export async function loginAsGuest(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInAnonymously(auth);
    const profile = createInitialProfile(cred.user.uid, "Guest Learner", true, null);
    if (db) {
      try {
        await setDoc(doc(db, "users", cred.user.uid), profile, { merge: true });
      } catch (err) {
        console.warn("[Auth] Failed to store guest profile in Firestore:", err);
      }
    }
    return profile;
  }

  // Local fallback if running in offline dev mode without Firebase
  const mockUid = "guest_" + Math.random().toString(36).substring(2, 9);
  return createInitialProfile(mockUid, "Guest Learner", true, null);
}

export type GoogleLoginResult = {
  profile?: UserProfile;
  redirectStarted?: boolean;
};

/**
 * Authenticates with Google.
 * On mobile: uses signInWithRedirect / linkWithRedirect.
 * On desktop: uses signInWithPopup and falls back to redirect if popup is blocked.
 * If user is already a guest, links the account or merges progress if Google account already exists.
 * NEVER silently falls back to guest mode.
 */
export async function loginWithGoogle(guestProfile?: UserProfile | null): Promise<GoogleLoginResult> {
  const envCheck = validateFirebaseConfig();
  if (!envCheck.isConfigured || !auth) {
    const error: any = new Error(envCheck.errorMessage || "Firebase configuration missing.");
    error.code = "auth/missing-config";
    console.error("[DECODE Auth Error] Firebase is not properly configured:", error);
    throw error;
  }

  const isCurrentGuest = Boolean(auth.currentUser && auth.currentUser.isAnonymous);
  const isMobile = isMobileBrowser();

  // Scenario 1: User is already an anonymous Firebase guest
  if (isCurrentGuest && auth.currentUser) {
    if (isMobile) {
      console.log("[Auth] Mobile browser detected. Linking guest account via linkWithRedirect...");
      await linkWithRedirect(auth.currentUser, googleProvider);
      return { redirectStarted: true };
    }

    try {
      console.log("[Auth] Desktop detected. Linking guest account via linkWithPopup...");
      const cred = await linkWithPopup(auth.currentUser, googleProvider);
      const profile = await fetchOrCreateUserProfile(cred.user);
      return { profile };
    } catch (popupErr: any) {
      console.warn("[Auth] linkWithPopup encountered an error:", popupErr);

      if (popupErr?.code === "auth/popup-blocked") {
        console.log("[Auth] Popup blocked on desktop, falling back to linkWithRedirect...");
        await linkWithRedirect(auth.currentUser, googleProvider);
        return { redirectStarted: true };
      }

      if (popupErr?.code === "auth/credential-already-in-use") {
        console.log("[Auth] Google account already exists. Signing in and merging guest progress...");
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

      console.error("[DECODE Auth Error] linkWithPopup failed:", popupErr);
      throw popupErr;
    }
  }

  // Scenario 2: Standard Google sign-in (not currently an anonymous Firebase user)
  if (isMobile) {
    console.log("[Auth] Mobile browser detected. Signing in via signInWithRedirect...");
    await signInWithRedirect(auth, googleProvider);
    return { redirectStarted: true };
  }

  try {
    console.log("[Auth] Desktop detected. Signing in via signInWithPopup...");
    const cred = await signInWithPopup(auth, googleProvider);
    if (guestProfile) {
      console.log("[Auth] Merging local guest progress into signed-in Google account...");
      const profile = await mergeGuestProgressIntoUser(cred.user, guestProfile);
      return { profile };
    }
    const profile = await fetchOrCreateUserProfile(cred.user);
    return { profile };
  } catch (popupErr: any) {
    console.warn("[Auth] signInWithPopup encountered an error:", popupErr);

    if (popupErr?.code === "auth/popup-blocked") {
      console.log("[Auth] Popup blocked on desktop, falling back to signInWithRedirect...");
      await signInWithRedirect(auth, googleProvider);
      return { redirectStarted: true };
    }

    console.error("[DECODE Auth Error] signInWithPopup failed:", popupErr);
    throw popupErr;
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

  try {
    const result = await getRedirectResult(auth);
    if (!result || !result.user) {
      return null;
    }

    console.log("[Auth] getRedirectResult completed successfully for UID:", result.user.uid);
    if (guestProfile) {
      return await mergeGuestProgressIntoUser(result.user, guestProfile);
    }
    return await fetchOrCreateUserProfile(result.user);
  } catch (err: any) {
    console.error("[DECODE Auth Error] Redirect authentication failed:", err);

    if (err?.code === "auth/credential-already-in-use") {
      const credential = GoogleAuthProvider.credentialFromError(err);
      if (credential) {
        console.log("[Auth] Credential already in use from redirect. Signing in with credential...");
        const userCred = await signInWithCredential(auth, credential);
        return await mergeGuestProgressIntoUser(userCred.user, guestProfile || null);
      }
    }

    throw err;
  }
}

/**
 * Links an active guest session to Google from Settings
 */
export async function linkGuestWithGoogle(
  currentUserProfile: UserProfile
): Promise<GoogleLoginResult> {
  const envCheck = validateFirebaseConfig();
  if (!envCheck.isConfigured || !auth) {
    const error: any = new Error(envCheck.errorMessage || "Firebase configuration missing.");
    error.code = "auth/missing-config";
    console.error("[DECODE Auth Error] Cannot link account:", error);
    throw error;
  }

  const isMobile = isMobileBrowser();

  if (auth.currentUser) {
    if (isMobile) {
      await linkWithRedirect(auth.currentUser, googleProvider);
      return { redirectStarted: true };
    }

    try {
      const cred = await linkWithPopup(auth.currentUser, googleProvider);
      const profile = await mergeGuestProgressIntoUser(cred.user, currentUserProfile);
      return { profile };
    } catch (popupErr: any) {
      if (popupErr?.code === "auth/popup-blocked") {
        await linkWithRedirect(auth.currentUser, googleProvider);
        return { redirectStarted: true };
      }

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

      console.error("[DECODE Auth Error] linkGuestWithGoogle failed:", popupErr);
      throw popupErr;
    }
  }

  const err: any = new Error("No active Firebase session found to link.");
  err.code = "auth/no-current-user";
  throw err;
}

export async function logout(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
