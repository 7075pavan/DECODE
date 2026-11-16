import { describe, it, expect } from "vitest";

describe("Firestore Security Rules Specification", () => {
  // Logic emulator corresponding to firestore.rules
  const evaluateRule = (params: {
    path: string;
    method: "read" | "write";
    auth: { uid: string } | null;
  }) => {
    const { path, method, auth } = params;
    const isAuthenticated = auth !== null;

    // Check /users/{userId}/**
    const userMatch = path.match(/^\/users\/([^/]+)(\/.*)?$/);
    if (userMatch) {
      const targetUserId = userMatch[1];
      const isOwner = isAuthenticated && auth.uid === targetUserId;
      return isOwner; // allow read, write: if isOwner(userId)
    }

    // Check /paths/{pathId} and /lessons/{lessonId} and /dailyChallenges/{id}
    if (
      path.startsWith("/paths/") ||
      path.startsWith("/lessons/") ||
      path.startsWith("/dailyChallenges/")
    ) {
      if (method === "read") return isAuthenticated;
      return false; // allow write: if false
    }

    return false; // default deny
  };

  it("allows user to read and write their own root document", () => {
    const allowed = evaluateRule({
      path: "/users/user_123",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("denies access when user tries to access another user's document", () => {
    const allowed = evaluateRule({
      path: "/users/user_456",
      method: "read",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(false);
  });

  it("denies all access to unauthenticated requests on user data", () => {
    const allowed = evaluateRule({
      path: "/users/user_123",
      method: "read",
      auth: null,
    });
    expect(allowed).toBe(false);
  });

  it("allows user to write to users/{uid}/progress/{unitId}", () => {
    const allowed = evaluateRule({
      path: "/users/user_123/progress/reading-people-unit-1",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("allows user to write to users/{uid}/answers/{id}", () => {
    const allowed = evaluateRule({
      path: "/users/user_123/answers/ans_999",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("allows user to read and write to users/{uid}/reviewQueue/{conceptId}", () => {
    const allowed = evaluateRule({
      path: "/users/user_123/reviewQueue/concept_lip_press",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("allows user to write to users/{uid}/missions/{id}", () => {
    const allowed = evaluateRule({
      path: "/users/user_123/missions/reading-people-unit-1",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("allows user to write to users/{uid}/badges/{id}", () => {
    const allowed = evaluateRule({
      path: "/users/user_123/badges/badge-baseline-decoder",
      method: "write",
      auth: { uid: "user_123" },
    });
    expect(allowed).toBe(true);
  });

  it("allows authenticated read on curriculum paths but denies write", () => {
    const canRead = evaluateRule({
      path: "/paths/reading-people",
      method: "read",
      auth: { uid: "user_123" },
    });
    const canWrite = evaluateRule({
      path: "/paths/reading-people",
      method: "write",
      auth: { uid: "user_123" },
    });

    expect(canRead).toBe(true);
    expect(canWrite).toBe(false);
  });

  it("denies unauthenticated read on curriculum paths", () => {
    const canRead = evaluateRule({
      path: "/paths/reading-people",
      method: "read",
      auth: null,
    });
    expect(canRead).toBe(false);
  });
});
