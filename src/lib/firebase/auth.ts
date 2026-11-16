import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./client";
import { UserProfile } from "@/types";

export const googleProvider = new GoogleAuthProvider();

export async function loginAsGuest(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInAnonymously(auth);
    return mapFirebaseUserToProfile(cred.user, "Guest Learner");
  }

  // Graceful local mode when Firebase keys are not yet configured in .env.local
  const mockUid = "guest_" + Math.random().toString(36).substring(2, 9);
  const guestProfile: UserProfile = {
    uid: mockUid,
    isAnonymous: true,
    email: null,
    displayName: "Guest Learner",
    avatarUrl: null,
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
  return guestProfile;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUserToProfile(cred.user, cred.user.displayName || "Learner");
  }

  // Graceful local mode
  const mockUid = "google_" + Math.random().toString(36).substring(2, 9);
  const googleProfile: UserProfile = {
    uid: mockUid,
    isAnonymous: false,
    email: "learner@example.com",
    displayName: "Pavan",
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    totalXP: 140,
    currentRank: "Rookie",
    streak: {
      current: 3,
      longest: 3,
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
  return googleProfile;
}

export async function linkGuestWithGoogle(currentUserProfile: UserProfile): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    const cred = await linkWithPopup(auth.currentUser, googleProvider);
    return {
      ...currentUserProfile,
      uid: cred.user.uid,
      isAnonymous: false,
      email: cred.user.email,
      displayName: cred.user.displayName || currentUserProfile.displayName,
      avatarUrl: cred.user.photoURL || currentUserProfile.avatarUrl,
    };
  }

  // Local mode simulation: retains progress while upgrading identity
  return {
    ...currentUserProfile,
    isAnonymous: false,
    email: "linked.learner@example.com",
    displayName: currentUserProfile.displayName === "Guest Learner" ? "Pavan (Linked)" : currentUserProfile.displayName,
  };
}

export async function logout(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

function mapFirebaseUserToProfile(user: FirebaseUser, defaultName: string): UserProfile {
  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    email: user.email,
    displayName: user.displayName || defaultName,
    avatarUrl: user.photoURL,
    createdAt: user.metadata.creationTime || new Date().toISOString(),
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
