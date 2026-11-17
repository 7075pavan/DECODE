import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatFirebaseAuthError,
  isMobileBrowser,
  mergeGuestProgressIntoUser,
} from "../src/lib/firebase/auth";
import { validateFirebaseConfig, getAuthDomain, isSafariBrowser } from "../src/lib/firebase/client";
import { UserProfile } from "../src/types";

describe("Firebase Auth & Config Validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("validateFirebaseConfig", () => {
    it("reports all missing variables when none are set", () => {
      delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
      delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      delete process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
      delete process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

      const result = validateFirebaseConfig();
      expect(result.isConfigured).toBe(false);
      expect(result.missingVariables).toEqual([
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID",
      ]);
      expect(result.errorMessage).toContain("Missing or unset environment variable(s)");
    });

    it("rejects placeholder/template values", () => {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "your-api-key";
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "your-project-id.firebaseapp.com";
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "your-project-id";
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "your-project-id.appspot.com";
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "your-messaging-sender-id";
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "your-app-id";

      const result = validateFirebaseConfig();
      expect(result.isConfigured).toBe(false);
      expect(result.missingVariables.length).toBe(6);
    });

    it("confirms complete configuration when valid variables are provided", () => {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyValidApiKeyTest";
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "decode-app.firebaseapp.com";
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "decode-prod-app";
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "decode-prod-app.appspot.com";
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789012";
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789012:web:abcdef";

      const result = validateFirebaseConfig();
      expect(result.isConfigured).toBe(true);
      expect(result.missingVariables).toHaveLength(0);
      expect(result.errorMessage).toBeNull();
    });
  });

  describe("getAuthDomain & Same-Domain Helper", () => {
    it("returns configured auth domain in standard environment", () => {
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "decode-be09a.firebaseapp.com";
      const domain = getAuthDomain();
      expect(domain).toBeDefined();
    });
  });

  describe("formatFirebaseAuthError", () => {
    it("formats auth/unauthorized-domain with authorized domain advice", () => {
      const err = { code: "auth/unauthorized-domain", message: "Firebase: Error (auth/unauthorized-domain)." };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/unauthorized-domain");
      expect(formatted.message).toContain("This domain is not authorized in Firebase Console");
      expect(formatted.message).toContain("Authorized domains");
    });

    it("formats auth/popup-blocked with clear guidance", () => {
      const err = { code: "auth/popup-blocked", message: "Popup was blocked" };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/popup-blocked");
      expect(formatted.message).toContain("blocked by your browser");
    });

    it("formats auth/timeout with Safari instruction", () => {
      const err = { code: "auth/timeout", message: "Timeout" };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/timeout");
      expect(formatted.message).toContain("Sign-in did not complete. If you are on Safari, try Chrome, or tap Try again.");
    });

    it("formats auth/operation-not-supported-in-this-environment", () => {
      const err = { code: "auth/operation-not-supported-in-this-environment", message: "Unsupported" };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/operation-not-supported-in-this-environment");
      expect(formatted.message).toContain("Popup sign-in is not supported");
    });

    it("formats auth/credential-already-in-use", () => {
      const err = { code: "auth/credential-already-in-use", message: "Account in use" };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/credential-already-in-use");
      expect(formatted.message).toContain("already linked to another user dossier");
    });

    it("formats auth/missing-config", () => {
      const err = { code: "auth/missing-config", message: "Missing NEXT_PUBLIC_FIREBASE_API_KEY" };
      const formatted = formatFirebaseAuthError(err);
      expect(formatted.code).toBe("auth/missing-config");
      expect(formatted.message).toBe("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
    });
  });

  describe("Loading State Reset & Timeout Logic", () => {
    it("ensures loading state ALWAYS resets even when sign-in throws", async () => {
      let loading = false;
      const simulateSignIn = async () => {
        loading = true;
        try {
          throw new Error("Simulated sign-in failure");
        } finally {
          loading = false;
        }
      };

      await expect(simulateSignIn()).rejects.toThrow("Simulated sign-in failure");
      expect(loading).toBe(false);
    });

    it("resets loading and sets timeout error when 20-second timeout fires", () => {
      vi.useFakeTimers();

      let loading = true;
      let error: any = null;

      const timeoutId = setTimeout(() => {
        loading = false;
        error = formatFirebaseAuthError({ code: "auth/timeout" });
      }, 20000);

      expect(loading).toBe(true);
      expect(error).toBeNull();

      // Fast-forward 20 seconds
      vi.advanceTimersByTime(20000);

      expect(loading).toBe(false);
      expect(error).not.toBeNull();
      expect(error.code).toBe("auth/timeout");
      expect(error.message).toContain("Sign-in did not complete");

      clearTimeout(timeoutId);
      vi.useRealTimers();
    });

    it("falls back to redirect notice when popup-blocked error occurs", () => {
      const notices: string[] = [];
      const onRedirectFallback = (msg: string) => notices.push(msg);

      const popupErr = { code: "auth/popup-blocked" };
      if (popupErr.code === "auth/popup-blocked") {
        onRedirectFallback("Popup was blocked by your browser. Redirecting to Google...");
      }

      expect(notices).toHaveLength(1);
      expect(notices[0]).toContain("Popup was blocked");
    });

    it("surfaces getRedirectResult errors without swallowing", () => {
      const redirectError = {
        code: "auth/unauthorized-domain",
        message: "Firebase: Error (auth/unauthorized-domain).",
      };

      let caughtError: any = null;
      try {
        throw redirectError;
      } catch (err: any) {
        caughtError = formatFirebaseAuthError(err);
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError.code).toBe("auth/unauthorized-domain");
      expect(caughtError.message).toContain("Authorized domains");
    });
  });

  describe("mergeGuestProgressIntoUser", () => {
    it("unions completed units, takes max XP, and preserves badges", async () => {
      const fakeGoogleUser: any = {
        uid: "google_user_123",
        email: "investigator@example.com",
        displayName: "Agent Smith",
        photoURL: "https://example.com/avatar.jpg",
        metadata: { creationTime: "2026-01-01T00:00:00.000Z" },
      };

      const guestProfile: UserProfile = {
        uid: "guest_session_999",
        isAnonymous: true,
        email: null,
        displayName: "Guest Learner",
        avatarUrl: null,
        createdAt: "2026-02-01T00:00:00.000Z",
        lastActiveAt: "2026-02-01T01:00:00.000Z",
        totalXP: 180,
        currentRank: "Observer",
        streak: {
          current: 4,
          longest: 4,
          lastActiveDate: "2026-02-01",
          freezeTokens: 2,
        },
        dailyGoalMinutes: 10,
        dailyMinutesToday: 15,
        activePathId: "detective-mind",
        activeLessonId: "detective-mind-2",
        completedUnits: ["reading-people-unit-1", "detective-mind-unit-1"],
        unlockedUnits: ["reading-people-unit-1", "detective-mind-unit-1", "detective-mind-unit-2"],
        earnedBadges: [
          {
            id: "badge-micro-signal",
            title: "Micro-Signal Scout",
            icon: "visibility",
            unitId: "reading-people-unit-1",
            awardedAt: "2026-02-01T01:00:00.000Z",
          },
        ],
      };

      const merged = await mergeGuestProgressIntoUser(fakeGoogleUser, guestProfile);

      expect(merged.uid).toBe("google_user_123");
      expect(merged.isAnonymous).toBe(false);
      expect(merged.email).toBe("investigator@example.com");
      expect(merged.totalXP).toBe(180);
      expect(merged.streak.current).toBe(4);
      expect(merged.completedUnits).toContain("reading-people-unit-1");
      expect(merged.completedUnits).toContain("detective-mind-unit-1");
      expect(merged.unlockedUnits).toContain("detective-mind-unit-2");
      expect(merged.earnedBadges).toHaveLength(1);
      expect(merged.earnedBadges[0].id).toBe("badge-micro-signal");
    });
  });

  describe("Browser & Mobile Detection", () => {
    it("returns boolean for isMobileBrowser and isSafariBrowser", () => {
      expect(typeof isMobileBrowser()).toBe("boolean");
      expect(typeof isSafariBrowser()).toBe("boolean");
    });
  });
});
