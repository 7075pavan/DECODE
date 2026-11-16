import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

export interface ActiveResumeState {
  unitId: string;
  step: "overview" | "learn" | "see" | "try" | "prove" | "apply";
  stepIndex: number;
  scenarioIndex?: number;
  previewLabel: string;
  timestamp: string; // ISO-8601
  deviceId: string;
  deviceName: string;
}

export interface StepSavePayload {
  userId: string;
  unitId: string;
  step: "overview" | "learn" | "see" | "try" | "prove" | "apply";
  stepIndex: number;
  scenarioIndex?: number;
  previewLabel: string;
  xpEarnedDelta?: number;
  totalXP?: number;
  streak?: number;
  answers?: {
    questionId: string;
    subStepType: string;
    selectedOptionId: string;
    isCorrect: boolean;
    confidence: number;
    xpEarned: number;
  };
  confidence?: number;
  missionReflection?: string;
  badgeAwarded?: {
    id: string;
    title: string;
    icon: string;
  };
}

const SYNC_CHANNEL_NAME = "decode_cross_device_sync_channel";
const DEVICE_ID_KEY = "decode_persistent_device_id";
const LAST_SYNC_KEY = "decode_last_sync_timestamp";

/**
 * Returns a persistent device ID and human-friendly device name
 */
export function getDeviceInfo(): { deviceId: string; deviceName: string } {
  if (typeof window === "undefined") {
    return { deviceId: "server", deviceName: "Server Node" };
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = "dev_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  // Detect friendly device name from user-agent
  let deviceName = "Laptop / Desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) {
    deviceName = "iPhone / iPad (iOS)";
  } else if (/Android/.test(ua)) {
    deviceName = "Android Mobile";
  } else if (/Macintosh/.test(ua)) {
    deviceName = "MacBook / Mac";
  } else if (/Windows/.test(ua)) {
    deviceName = "Windows PC";
  }

  return { deviceId, deviceName };
}

/**
 * Saves progress after every step to Firestore and broadcasts to other devices
 */
export async function saveStepProgress(payload: StepSavePayload): Promise<void> {
  const { deviceId, deviceName } = getDeviceInfo();
  const now = new Date().toISOString();

  const resumeState: ActiveResumeState = {
    unitId: payload.unitId,
    step: payload.step,
    stepIndex: payload.stepIndex,
    scenarioIndex: payload.scenarioIndex,
    previewLabel: payload.previewLabel,
    timestamp: now,
    deviceId,
    deviceName,
  };

  // 1. Local Cache Update
  if (typeof window !== "undefined") {
    localStorage.setItem(LAST_SYNC_KEY, now);
    localStorage.setItem("decode_active_resume_state", JSON.stringify(resumeState));

    // Broadcast across browser tabs and local windows immediately
    try {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({
        type: "STEP_PROGRESS_UPDATED",
        userId: payload.userId,
        resumeState,
        payload,
      });
      channel.close();
    } catch {
      // BroadcastChannel unsupported fallback
    }
  }

  // 2. Cloud Firestore Multi-Device Persistence
  if (isFirebaseConfigured && db && payload.userId) {
    try {
      // 2a. Update root user doc with latest active resume state and sync timestamp
      const userRef = doc(db, "users", payload.userId);
      await setDoc(
        userRef,
        {
          activeResumeState: resumeState,
          lastSyncAt: now,
          lastActiveAt: now,
          ...(payload.totalXP !== undefined && { totalXP: payload.totalXP }),
          ...(payload.streak !== undefined && { "streak.current": payload.streak }),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2b. Update users/{uid}/progress/{unitId}
      const progressRef = doc(db, "users", payload.userId, "progress", payload.unitId);
      await setDoc(
        progressRef,
        {
          unitId: payload.unitId,
          currentStep: payload.step,
          currentStepIndex: payload.stepIndex,
          currentScenarioIndex: payload.scenarioIndex ?? 0,
          completedSteps: arrayUnion(payload.stepIndex),
          lastConfidence: payload.confidence ?? 80,
          updatedAt: now,
          deviceId,
        },
        { merge: true }
      );

      // 2c. If an answer was submitted, save to users/{uid}/answers/{id}
      if (payload.answers) {
        const answerId = `${payload.unitId}_${payload.answers.questionId}_${payload.answers.subStepType}_${Date.now()}`;
        const answerRef = doc(db, "users", payload.userId, "answers", answerId);
        await setDoc(answerRef, {
          id: answerId,
          unitId: payload.unitId,
          questionId: payload.answers.questionId,
          subStepType: payload.answers.subStepType,
          selectedOptionId: payload.answers.selectedOptionId,
          isCorrect: payload.answers.isCorrect,
          confidence: payload.answers.confidence,
          xpEarned: payload.answers.xpEarned,
          timestamp: now,
          deviceId,
        });
      }

      // 2d. If a mission was logged, save to users/{uid}/missions/{id}
      if (payload.missionReflection) {
        const missionRef = doc(db, "users", payload.userId, "missions", payload.unitId);
        await setDoc(missionRef, {
          id: payload.unitId,
          unitId: payload.unitId,
          reflectionText: payload.missionReflection,
          completedAt: now,
          deviceId,
        });
      }

      // 2e. If a badge was awarded, save to users/{uid}/badges/{id}
      if (payload.badgeAwarded) {
        const badgeRef = doc(db, "users", payload.userId, "badges", payload.badgeAwarded.id);
        await setDoc(badgeRef, {
          id: payload.badgeAwarded.id,
          title: payload.badgeAwarded.title,
          icon: payload.badgeAwarded.icon,
          unitId: payload.unitId,
          awardedAt: now,
        });
      }
    } catch (err) {
      console.warn("[SyncEngine] Failed to write to remote Firestore (offline mode active):", err);
    }
  }
}

/**
 * Subscribes to real-time updates from other devices
 */
export function subscribeToCrossDeviceSync(
  userId: string | null,
  onRemoteUpdate: (state: ActiveResumeState) => void
): Unsubscribe {
  // 1. Listen via Firestore onSnapshot for multi-device sync
  let firestoreUnsub: Unsubscribe | null = null;

  if (isFirebaseConfigured && db && userId) {
    const userRef = doc(db, "users", userId);
    firestoreUnsub = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.activeResumeState) {
            const remoteState = data.activeResumeState as ActiveResumeState;
            const { deviceId } = getDeviceInfo();
            // Conflict rule: if state from another device or newer timestamp
            if (remoteState.deviceId !== deviceId) {
              onRemoteUpdate(remoteState);
            }
          }
        }
      },
      (err) => {
        console.warn("[SyncEngine] Firestore snapshot listener error:", err);
      }
    );
  }

  // 2. Listen via BroadcastChannel for multi-tab / local window sync
  let channel: BroadcastChannel | null = null;
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "STEP_PROGRESS_UPDATED" && event.data.resumeState) {
      const remoteState = event.data.resumeState as ActiveResumeState;
      const { deviceId } = getDeviceInfo();
      if (remoteState.deviceId !== deviceId) {
        onRemoteUpdate(remoteState);
      }
    }
  };

  try {
    channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    channel.addEventListener("message", handleMessage);
  } catch {
    // fallback
  }

  return () => {
    if (firestoreUnsub) firestoreUnsub();
    if (channel) {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    }
  };
}

/**
 * Returns the latest active resume state from local storage
 */
export function getStoredResumeState(): ActiveResumeState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("decode_active_resume_state");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Returns formatted last sync timestamp
 */
export function getLastSyncTime(): string {
  if (typeof window === "undefined") return "Just now";
  const raw = localStorage.getItem(LAST_SYNC_KEY);
  if (!raw) return "Just now";
  try {
    const date = new Date(raw);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Just now";
  }
}
