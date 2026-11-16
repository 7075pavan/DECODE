# DECODE — System Architecture & Technical Specification

> **DECODE** is a high-stakes, gamified cognitive mastery Progressive Web Application (PWA) designed to teach people-reading, detective thinking, psychology & mindset, tactical negotiation, and money/wealth behavior.
> 
> Built with an uncompromising **Cognitive Noir / Forensic HUD** visual language, DECODE functions seamlessly across mobile and laptop devices with real-time bidirectional progress synchronization.

---

## 1. Design System & Visual Guidelines

Matches the Stitch export (`/design`) and `design/DESIGN.md` specification:

### 1.1 Color Palette
* **Background / Canvas:** `#0B0F1A` (Obsidian canvas floor, light-absorbing)
* **Surface Containers / Resting Cards:** `#121826` (Level 1 structural modules)
* **Active / Elevated Cards:** `#1A2233` (Level 2 interactive containers and floating sheets)
* **Precision Outlines & Dividers:** `#263047` (1px solid hairline borders)
* **Primary Accent (Cyan):** `#22D3EE` (Dedicated to active CTAs, deduction indicators, scan indicators, and interactive highlights)
* **Secondary Accent (Amber):** `#F59E0B` / `#FBBF24` (**STRICTLY RESERVED for XP accrual and streak counters**)
* **Affirmative / Confirmed:** `#34D399` (Pulse green for correct reads, confirmed baseline signals)
* **Critical / Tell:** `#F87171` (Tell coral for deductive misses, deception signals, errors)
* **Typography Neutrals:** Primary text `#F1F5F9`, muted metadata and secondary labels `#94A3B8` / `#9BA6B8`

### 1.2 Typography Hierarchy
* **Headlines (`Sora`):** Geometric, authoritative, architectural.
  * Headline XL: `32px` (mobile) / `40px` (desktop), bold (`700`), letter-spacing `-0.02em`
  * Headline LG: `22px` (mobile) / `28px` (desktop), semi-bold (`600`)
  * Headline MD: `20px`, semi-bold (`600`)
* **Reading & Body (`Inter`):** Neutral legibility with relaxed `1.6` line-height.
  * Body LG: `18px`, regular (`400`), line-height `28px`
  * Body MD: `16px` (Default body text across all scenario cards and descriptions)
  * Body SM: `14px`, regular / medium
* **Telemetry & HUD (`JetBrains Mono`):**
  * Label LG: `13px`, medium (`500`), tracking `0.06em` (**Strict minimum label size: 13px**)
  * All labels, confidence readouts, streak tags, and clue strength badges enforce $\ge 13\text{px}$.

### 1.3 Layout, Navigation & Touch Rules
* **Sentence-case copy:** All buttons, titles, step headers, and labels use natural sentence case (e.g. *"Start lesson"*, *"Check answer"*, *"How sure are you?"*, *"Learning paths"*).
* **Primary Action Button:** Exactly one full-width `56px` height primary button per screen/view (`h-[56px] w-full rounded-xl bg-[#22D3EE] text-[#0B0F1A] font-bold`).
* **Responsive Layout:**
  * **Mobile (`< 768px`):** Single-column stream with `16px` lateral margins. Bottom tab bar (`h-[68px] pb-safe`) fixed at bottom with 4 primary destinations: **Home**, **Paths**, **Review**, **Profile**.
  * **Laptop & Desktop (`>= 768px`):** Fixed left forensic sidebar (`w-[260px]`) containing brand telemetry, navigation items, streak/XP HUD, and profile snapshot; main content rendered in a centered max `1280px` container with 2-column or split-view scenario workbenches.

---

## 2. Technical Stack

* **Framework:** Next.js 15+ (App Router) with React 19 & TypeScript 5+ (Strict mode)
* **Styling:** Tailwind CSS with custom theme extensions mapped to the Cognitive Noir design tokens
* **Authentication:** Firebase Auth v10+
  * Google Sign-In (`GoogleAuthProvider`) via popup/redirect
  * Anonymous Guest Auth (`signInAnonymously`)
  * Frictionless Account Linking (`linkWithCredential`) when a guest decides to sign in with Google
* **Database & Cloud Storage:** Cloud Firestore
  * Local IndexedDB persistence via `persistentLocalCache`
  * Real-time multi-device sync via `onSnapshot`
* **Client State & Cache:** Zustand with `persist` middleware (IndexedDB storage adapter via `idb-keyval`)
* **PWA Engine:** `@ducanh2912/next-pwa` / Serwist Service Worker with Cache-First asset strategy and Stale-While-Revalidate data caching
* **Animation & Motion:** Framer Motion (tactile button presses, radar scans, card flips, scenario reveals)
* **Data Visualization:** Recharts (Cognitive Radar / Skill Polygon, Weekly Calibration Curve, XP Velocity)
* **Deployment:** Vercel with automated CI/CD and edge caching headers

---

## 3. Directory & Folder Structure

```
DECODE/
├── .github/
│   └── workflows/
│       └── ci.yml
├── design/                          # Stitch design files & screen specifications
│   ├── 1._splash_sign_in/
│   ├── 2._onboarding_goal_setup/
│   ├── 3._home_dashboard/
│   ├── 4._paths_overview/
│   ├── 5._quiz_try_step/
│   ├── 6._quiz_feedback/
│   ├── 6._quiz_feedback_wrong_answer/
│   └── DESIGN.md
├── public/
│   ├── icons/                       # PWA icons (192x192, 512x512, maskable)
│   ├── badges/                      # Tier badges (Beginner, Profiler I/II, Detective, etc.)
│   ├── manifest.json                # PWA web app manifest
│   └── favicon.ico
├── src/
│   ├── app/                         # Next.js App Router routes
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx         # Splash & Google/Guest sign in (Screen 1)
│   │   ├── (onboarding)/
│   │   │   └── onboarding/
│   │   │       └── page.tsx         # 6-step loop walkthrough & daily goal setup (Screen 2)
│   │   ├── (main)/
│   │   │   ├── layout.tsx           # Shell with Bottom Tabs (Mobile) & Sidebar (Desktop)
│   │   │   ├── home/
│   │   │   │   └── page.tsx         # Home dashboard (Screen 3)
│   │   │   ├── paths/
│   │   │   │   ├── page.tsx         # Paths overview (Screen 4)
│   │   │   │   └── [pathId]/
│   │   │   │       └── page.tsx     # Units & Lessons syllabus for a specific path
│   │   │   ├── review/
│   │   │   │   └── page.tsx         # Spaced repetition & missed clues forensic review
│   │   │   └── profile/
│   │   │       └── page.tsx         # User stats, cognitive radar chart, streak, settings
│   │   ├── lesson/
│   │   │   └── [lessonId]/
│   │   │       ├── layout.tsx       # Distraction-free full-screen lesson header & exit modal
│   │   │       ├── step/
│   │   │       │   └── [stepNumber]/
│   │   │       │       └── page.tsx # Dynamic loader for Steps 1 through 6
│   │   │       └── complete/
│   │   │           └── page.tsx     # Lesson completion debrief & XP celebration
│   │   ├── layout.tsx               # Root layout: Fonts (Sora, Inter, JetBrains Mono), PWA Meta
│   │   ├── globals.css              # Tailwind base, components, utilities, custom scrollbar
│   │   └── page.tsx                 # Root redirect gatekeeper (Auth & Onboarding check)
│   ├── components/
│   │   ├── ui/                      # Atoms: Button, Card, Badge, Slider, ProgressRing
│   │   │   ├── Button.tsx           # 56px primary CTA, secondary tactical triggers
│   │   │   ├── Card.tsx             # #121826 surface, 1px #263047 hairline border
│   │   │   ├── ConfidenceSlider.tsx # 50% - 100% calibration slider with quick-set buttons
│   │   │   ├── HUDChip.tsx          # Monospace badge for clue strength, telemetry
│   │   │   ├── ProgressRing.tsx     # Circular SVG completion indicators
│   │   │   └── Modal.tsx            # Backdrop blur tactical dialogs
│   │   ├── navigation/
│   │   │   ├── BottomTabBar.tsx     # Mobile bottom bar (Home, Paths, Review, Profile)
│   │   │   ├── DesktopSidebar.tsx   # Laptop sidebar with brand, navigation & user HUD
│   │   │   └── TopNavBar.tsx        # Minimal HUD top bar (streak, XP, back arrow)
│   │   ├── dashboard/
│   │   │   ├── DailyGoalCard.tsx    # Daily minute/lesson progress dial
│   │   │   ├── ActiveLessonCard.tsx # "Continue learning" prominent hero card
│   │   │   ├── DailyChallengeCard.tsx # Daily high-stakes observational puzzle
│   │   │   └── PathProgressList.tsx # 5 path compact overview cards
│   │   ├── lesson/
│   │   │   ├── LessonHeader.tsx     # Step indicator (e.g. "Step 3 of 6"), close button
│   │   │   ├── ScenarioCard.tsx     # Dossier narrative with toggleable clue highlights
│   │   │   ├── OptionSelector.tsx   # Radio selection cards with hover/active cyan rings
│   │   │   ├── FeedbackPanel.tsx    # Bottom sheet feedback (Correct green vs Wrong coral)
│   │   │   └── ClueList.tsx         # Breakdown of identified clues & strength tags
│   │   ├── charts/
│   │   │   ├── CognitiveRadar.tsx   # Recharts radar across the 5 domains
│   │   │   └── CalibrationCurve.tsx # Confidence vs Accuracy calibration plot
│   │   └── pwa/
│   │       ├── InstallPrompt.tsx    # Native-feeling iOS/Android install banner
│   │       └── OfflineIndicator.tsx # Subtle banner indicating offline cached mode
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── client.ts            # Firebase app, auth, db initialization
│   │   │   ├── auth.ts              # Google popup, anonymous auth, link accounts
│   │   │   └── sync.ts              # Firestore sync handlers, conflict resolution
│   │   ├── stores/
│   │   │   ├── useAuthStore.ts      # Current user, auth state, guest status
│   │   │   ├── useProgressStore.ts  # Active lesson, completed steps, XP, streak, cache
│   │   │   └── useReviewStore.ts    # Spaced repetition flashcard queue
│   │   ├── scoring/
│   │   │   ├── calibrationEngine.ts # Confidence calibration math & XP calculations
│   │   │   └── streakEngine.ts      # Streak validation, grace periods, timezone checks
│   │   ├── srs/
│   │   │   └── supermemo2.ts        # Spaced repetition algorithm for Review tab
│   │   └── utils/
│   │       └── sound.ts             # Subtle tactile haptic & audio feedback (optional)
│   ├── content/                     # Offline-ready, type-checked curriculum data
│   │   ├── paths/                   # 5 Path definitions (metadata, units, prerequisites)
│   │   │   ├── reading-people.ts
│   │   │   ├── detective-mind.ts
│   │   │   ├── mind-and-mindset.ts
│   │   │   ├── influence-negotiation.ts
│   │   │   └── money-wealth.ts
│   │   └── lessons/                 # Full structured data for the 75 lessons
│   │       └── ...
│   └── types/
│       ├── curriculum.ts            # Path, Unit, Lesson, Step, Clue interfaces
│       ├── user.ts                  # User profile, settings, streak, stats
│       ├── progress.ts              # Lesson completion records, question attempts
│       └── srs.ts                   # Flashcard & clue review queue items
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 4. Data Model & Firestore Architecture

### 4.1 Firestore Collections Hierarchy

```
firestore/
├── users/{uid}/
│   ├── (document fields: UserProfile)
│   ├── progress/{lessonId}          # Subcollection: status, step progress, scores
│   ├── pathProgress/{pathId}        # Subcollection: path completion stats
│   ├── dailyActivity/{YYYY-MM-DD}   # Subcollection: daily minutes & XP breakdown
│   └── reviewQueue/{clueOrConceptId}# Subcollection: spaced repetition review items
│
├── paths/{pathId}                   # Static/cached paths catalog
├── lessons/{lessonId}               # Static/cached curriculum lessons
└── dailyChallenges/{YYYY-MM-DD}     # Global daily challenge rotation
```

### 4.2 TypeScript Schemas

```typescript
// --- USER PROFILE & HUD METRICS ---
export interface UserProfile {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;                 // ISO-8601
  lastActiveAt: string;              // ISO-8601
  
  // Gamification & Telemetry (Amber items)
  totalXP: number;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;          // YYYY-MM-DD
    freezeTokensAvailable: number;
  };
  currentTier: 'Beginner' | 'Profiler I' | 'Profiler II' | 'Detective' | 'Senior Analyst' | 'Master Decoder';

  // Preferences & Targets
  dailyGoalMinutes: 5 | 10 | 15;
  activePathId: string;              // default: 'reading-people'
  activeLessonId: string;            // currently active resume target
}

// --- CURRICULUM DEFINITIONS ---
export type PathId = 
  | 'reading-people'
  | 'detective-mind'
  | 'mind-and-mindset'
  | 'influence-negotiation'
  | 'money-wealth';

export interface Path {
  id: PathId;
  title: string;                     // e.g. "Reading People"
  shortDescription: string;          // "Body language, baseline signals, and tone of voice."
  icon: string;                      // Material symbol name (e.g. "visibility")
  order: number;                     // 1 to 5
  totalLessons: number;              // 15 lessons per path (75 total)
  units: Unit[];
  unlockRequirement?: {
    lessonsCompletedTotal: number;   // e.g. Path 4/5 or Advanced Scenarios unlock at 40
  };
}

export interface Unit {
  id: string;
  pathId: PathId;
  title: string;                     // e.g. "Unit 1: Baseline Calibration"
  order: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  pathId: PathId;
  unitId: string;
  order: number;
  title: string;                     // e.g. "Spotting Baselines"
  estimatedMinutes: number;          // e.g. 3
}

// --- THE 6-STEP LESSON STRUCTURE ---
export interface Lesson {
  id: string;
  pathId: PathId;
  unitId: string;
  title: string;
  estimatedMinutes: number;
  
  steps: {
    step1Learn: StepLearn;
    step2See: StepSee;
    step3Try: StepTry;
    step4Review: StepReview;
    step5Prove: StepProve;
    step6Apply: StepApply;
  };
}

export interface StepLearn {
  conceptTitle: string;
  summary: string;                   // Concise forensic principle
  rules: {
    title: string;
    description: string;
  }[];
  keySignal: string;                 // e.g. "Congruence between voice tone and physical posture"
}

export interface ClueItem {
  id: string;
  text: string;                      // e.g. "Glanced at watch twice"
  strength: 'Weak' | 'Medium' | 'Strong';
  explanation: string;               // e.g. "Signals impatience or wanting to end the discussion"
}

export interface StepSee {
  scenarioTitle: string;
  story: string;                     // Case narrative
  annotatedClues: ClueItem[];        // Clickable / highlighted cues showing theory in action
  forensicBreakdown: string;
}

export interface StepTry {
  question: string;                  // e.g. "What is Sarah feeling?"
  scenarioContext: string;
  imageUrl?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  cluesInStory: ClueItem[];
  forensicTakeaway: string;          // "Body language shows feelings, not proof. Check with a question."
}

export interface StepReview {
  // Step 4 acts as the detailed cognitive breakdown following Step 3
  detailedAnalysis: string;
  keyRule: string;
  cluesMissedOrSpotted: ClueItem[];
}

export interface StepProve {
  challengeScenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  timeLimitSeconds?: number;         // Optional pressure clock (e.g. 30s)
  clues: ClueItem[];
  explanation: string;
}

export interface StepApply {
  missionTitle: string;              // e.g. "Daily Calibration Assignment"
  missionPrompt: string;             // Actionable behavioral test to try in the real world
  reflectionQuestion: string;
  actionChecklist: string[];
}

// --- USER PROGRESS RECORD ---
export interface UserLessonProgress {
  lessonId: string;
  pathId: PathId;
  status: 'not_started' | 'in_progress' | 'completed';
  completedSteps: number[];          // e.g. [1, 2, 3, 4, 5, 6]
  currentStep: number;               // 1 to 6
  
  // Calibration & Performance Metrics
  tryConfidence: number;             // 50 to 100
  trySelectedOptionId: string | null;
  tryIsCorrect: boolean | null;
  
  proveConfidence: number;
  proveSelectedOptionId: string | null;
  proveIsCorrect: boolean | null;
  
  xpEarned: number;
  attemptsCount: number;
  completedAt: string | null;        // ISO-8601
  updatedAt: string;
}

// --- SPACED REPETITION (REVIEW QUEUE) ---
export interface SRSReviewItem {
  id: string;                        // Unique identifier (clueId or conceptId)
  userId: string;
  pathId: PathId;
  lessonId: string;
  prompt: string;                    // What was Sarah's cue?
  targetAnswer: string;
  clueStrength: 'Weak' | 'Medium' | 'Strong';
  intervalDays: number;              // SuperMemo-2 interval
  easeFactor: number;                // Default 2.5
  repetitions: number;
  dueDate: string;                   // YYYY-MM-DD
  lastReviewedAt: string;
}
```

---

## 5. The 6-Step Lesson Loop Engine

Every lesson strictly adheres to the cognitive noir pedagogical loop showcased in Onboarding (`2._onboarding_goal_setup`):

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        6-STEP LESSON WORKBENCH                          │
│                                                                         │
│  [1. LEARN]  ──▶  [2. SEE]   ──▶  [3. TRY]   ──▶  [4. REVIEW]          │
│  The Concept      Real World      Interactive     Forensic Breakdown   │
│  & Rules          Worked Example  Try + Conf      & Clue Signals       │
│                                                          │              │
│                                                          ▼              │
│  [6. APPLY]  ◀────────────────────────────────────  [5. PROVE]          │
│  Real-World                                         Mastery Challenge  │
│  Field Mission                                      Under Pressure     │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Step 1: Learn (Observation Dossier)**
   * **Purpose:** Introduce the fundamental rule or psychological concept in under 60-90 seconds.
   * **Components:** 
     * Core Principle Card (`#121826`, 1px `#263047` border) with an icon header.
     * 2-3 essential behavioral rules formatted in high-contrast bullet points.
     * One primary full-width `56px` cyan button: `"Continue to example"`.
2. **Step 2: See (Interactive Worked Example)**
   * **Purpose:** Expose the user to a real-world case scenario with active clue annotations.
   * **Components:**
     * Scenario narrative transcript or conversation excerpt.
     * Interactive HUD clues: users tap highlighted phrases to reveal the psychological signal behind them (e.g. *Eye block $\to$ Cognitive overload*).
     * One primary full-width `56px` cyan button: `"Try it yourself"`.
3. **Step 3: Try (Scenario Question & Confidence Calibration)**
   * **Purpose:** Guided active recall with risk calibration (matches design `5._quiz_try_step`).
   * **Components:**
     * Scenario box with *"Hide story / Show story"* toggle and optional thumbnail image.
     * Question title (e.g. *"What is Sarah feeling?"*).
     * 3-4 distinct multi-choice cards with radio indicators (`#1A2233` surface, `#22D3EE` selected border).
     * **Confidence Calibration Slider:** Range `50%` to `100%` (Step `5%`, Default `80%`) with quick-tap pills (*Guessing 50%*, *Fairly sure 75%*, *Certain 100%*).
     * Explanatory prompt: *"More confident = more XP if right, fewer points if wrong."*
     * One primary full-width `56px` cyan button: `"Check answer"`.
4. **Step 4: Review (Tactical Forensic Feedback)**
   * **Purpose:** Immediate cognitive feedback detailing the clues in the story (matches design `6._quiz_feedback` and `6._quiz_feedback_wrong_answer`).
   * **Components:**
     * Status indicator: Correct check (`#34D399`) or *"Not quite"* coral alert (`#F87171`).
     * Calibrated result readout: e.g. *"You were 80% sure and right"* or *"You were 80% sure but wrong. Try a lower number when signals are mixed."*
     * **Amber XP pill:** `+12 XP` (or calculated calibrated amount).
     * Wrong answer correction: Selected wrong answer clearly struck with coral badge; correct answer highlighted with emerald check.
     * Forensic reasoning paragraph explaining the psychological dynamic.
     * **Clues in the story:** Itemized cards showing the exact textual clues, annotated with strength chips (`Weak`, `Medium`, `Strong`) and their psychological meaning.
     * Forensic safety rule: e.g. *"Body language shows feelings, not proof. Check with a question."*
     * One primary full-width `56px` cyan button: `"Next question" / "Proceed to challenge"`.
5. **Step 5: Prove (Mastery Diagnostic)**
   * **Purpose:** Test unguided retention on an unfamiliar scenario under simulated real-world ambiguity or a timer.
   * **Components:**
     * Fresh observation scenario without hints.
     * Single deduction question + confidence calibration slider.
     * Evaluates whether the user can spot deception, tension, or leverage without scaffolding.
     * One primary full-width `56px` cyan button: `"Verify deduction"`.
6. **Step 6: Apply (Field Mission & Real-World Integration)**
   * **Purpose:** Bridge digital learning into everyday life (meetings, salary negotiations, personal relationships).
   * **Components:**
     * Concrete field assignment (e.g. *"In your next meeting today, observe the speaker's baseline blink rate during pleasantries vs when asked for a hard deadline"*).
     * Reflection prompt where the user logs their real-world observation or checks off completed field tasks.
     * Lesson completion celebration: Total XP earned displayed in Master Amber, streak progression updated, and progress synced.
     * One primary full-width `56px` cyan button: `"Complete lesson"`.

---

## 6. Scoring Rules & Calibration Engine

DECODE does not treat learning as binary multiple choice; it trains **calibrated judgement** using a modified Brier scoring model translated into gamified XP.

### 6.1 Confidence Calibration Formula
Let:
* $C \in [0.50, 1.00]$ be the confidence level selected by the user.
* $R \in \{1, 0\}$ be the outcome ($1$ for correct, $0$ for incorrect).
* $\text{BaseXP} = 10\text{ XP}$.

The question XP payout is calibrated as:
$$\text{XP}_{\text{awarded}} = \begin{cases} 
\text{round}(10 + 10 \times (C - 0.50) \times 1.25) & \text{if } R = 1 \text{ (Correct)} \\
\max\left(2, \text{round}(10 - 16 \times (C - 0.50))\right) & \text{if } R = 0 \text{ (Incorrect)}
\end{cases}$$

#### Sample Payout Table:
| Confidence Level | Meaning | Correct Payout ($R=1$) | Incorrect Payout ($R=0$) | Calibration Feedback Message |
| :--- | :--- | :--- | :--- | :--- |
| **50%** | Pure Guess | **+10 XP** | **+10 XP** | Honest humility rewarded; no overconfidence penalty. |
| **75%** | Fairly Sure | **+13 XP** | **+6 XP** | Good calibrated estimate. |
| **80%** | Default Confident | **+14 XP** (Design: +12) | **+5 XP** | Standard deduction wager. |
| **90%** | High Confidence | **+15 XP** | **+4 XP** | Bold claim; rewarded if accurate. |
| **100%** | Absolute Certainty | **+16 XP** | **+2 XP** | Maximum penalty for false certainty. |

*Key Principle:* A user who is uncertain and honestly chooses 50% receives 10 XP regardless of whether they guessed correctly or not, teaching students never to pretend certainty in critical behavioral deductions.

### 6.2 Lesson & Gamification Multipliers
* **Step 3 (Try) XP:** $+10$ to $+16$ XP based on calibration.
* **Step 5 (Prove) XP:** $+10$ to $+16$ XP based on calibration.
* **Full 6-Step Lesson Completion Bonus:** $+25$ XP upon finishing Step 6.
* **Daily Challenge Completion:** $+20$ XP fixed reward.
* **Streak Multiplier (Amber Flame):**
  * Maintaining an active streak of $7+$ days adds a $+10\%$ bonus to all lesson completion XP.
  * Streak increments by $+1$ whenever at least 1 lesson or daily challenge is completed within the user's local calendar day.
  * Streak Freeze: 1 free freeze token granted every 14 days of continuous streak (maximum 2 stored).

### 6.3 Profiler Mastery Ranks
* **Beginner:** $0 - 249$ XP (Starting baseline)
* **Profiler I:** $250 - 749$ XP
* **Profiler II:** $750 - 1,499$ XP (Design Screen 4 baseline)
* **Detective:** $1,500 - 2,999$ XP
* **Senior Analyst:** $3,000 - 5,999$ XP
* **Master Decoder:** $6,000+$ XP

---

## 7. Multi-Device Synchronization Strategy

DECODE must work seamlessly across phones (PWA) and laptops with 100% progress parity.

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│           PHONE PWA             │           │          LAPTOP BROWSER         │
│  [Zustand Store + IndexedDB]    │           │  [Zustand Store + IndexedDB]    │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 │ Optimistic Local-First                      │ Optimistic Local-First
                 │ Update (< 16ms)                             │ Update (< 16ms)
                 ▼                                             ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                CLOUD FIRESTORE PERSISTENCE                  │
       │   - Offline IndexedDB Engine (persistentLocalCache)         │
       │   - Bidirectional real-time listener (onSnapshot)           │
       │   - ServerTimestamp validation & monotonic progress union   │
       └─────────────────────────────────────────────────────────────┘
```

### 7.1 Guest to Google Seamless Account Migration
1. When a user first opens DECODE and chooses **"Continue as Guest"**:
   * Firebase invokes `signInAnonymously(auth)`.
   * A persistent anonymous user document is provisioned at `users/{anonUid}` in Firestore.
   * Progress, streak, and daily targets operate normally without any login prompts.
2. When the user later clicks **"Continue with Google"** (or connects their Google account in Profile):
   * Firebase utilizes `linkWithCredential(currentUser, googleCredential)`.
   * The anonymous UID is smoothly upgraded to a permanent Google user account.
   * Zero progress loss, zero data duplication, and immediate multi-device unlock.

### 7.2 Optimistic Local-First UI + Firestore Sync
1. **Immediate Local Mutation:**
   * When an action occurs (e.g. Step 3 answered, lesson completed, streak bumped), the Zustand store mutates immediately and writes to `idb-keyval`.
   * UI updates instantaneously ($\le 16\text{ms}$), providing 60fps native responsiveness even on slow mobile networks.
2. **Asynchronous Background Firestore Sync:**
   * A unified sync queue pushes updates to Firestore using batch writes (`commit()`).
   * Firestore's built-in `persistentLocalCache` automatically buffers operations while offline and dispatches them on reconnect.
3. **Conflict Resolution (Monotonic Max Progress):**
   * If a user completes Lesson 3 on their laptop while offline, and completes Lesson 4 on their phone:
   * Progress union is strictly additive: `completedSteps` and `completedLessons` are merged via set union (`arrayUnion`).
   * For XP: Increments use `increment(xpDelta)` so simultaneous updates cannot overwrite each other.
   * For Streak: The timestamp of latest activity determines streak validity using server timestamps (`serverTimestamp()`).
4. **Real-Time Cross-Device Parity:**
   * Active app sessions maintain an `onSnapshot` listener on `users/{uid}/progress` and `users/{uid}`.
   * If the user finishes a lesson on their phone, the laptop dashboard automatically updates without a manual page refresh.

---

## 8. Screen-to-Page Mapping

Every single file in `/design` maps directly to application routes and UI components:

| Design File / Screen | App Route | Page / Component | Key UI Responsibilities |
| :--- | :--- | :--- | :--- |
| `1._splash_sign_in` | `/login` (and `/` when unauthenticated) | `app/(auth)/login/page.tsx` | • Ambient cyan radar blur backdrop.<br>• Central circular aperture fingerprint graphic.<br>• DECODE title & tagline.<br>• **"Continue with Google"** button.<br>• **"Continue as Guest"** button.<br>• 13px footer: *"Your progress syncs across your phone and laptop."* |
| `2._onboarding_goal_setup` | `/onboarding` | `app/(onboarding)/onboarding/page.tsx` | • Header with **"Skip"** tactical button.<br>• 6-step loop card walkthrough with icons (`Learn`, `See`, `Try`, `Review`, `Prove`, `Apply`).<br>• Daily pace selector (5, 10 [Recommended], 15 min a day).<br>• Full-width 56px primary button: **"Continue"** with arrow icon. |
| `3._home_dashboard` | `/home` | `app/(main)/home/page.tsx` | • Top telemetry HUD: Streak flame (Amber), XP bolt (Amber), user tier badge.<br>• Hero card: **"Continue learning"** (e.g. *Step 1 of 6: Spotting Baselines*).<br>• Primary 56px button: **"Start lesson (3 min)"**.<br>• Daily goal circular SVG ring & minutes target.<br>• 5 Learning Path progress items.<br>• Daily Challenge preview card (+20 XP).<br>• Bottom tab bar (Mobile) & Sidebar (Desktop). |
| `4._paths_overview` | `/paths` | `app/(main)/paths/page.tsx` | • Overall progress card (e.g. *0% completed, 0 of 75 lessons*).<br>• Active focus card: **Path 1 · Recommended: Reading People** with 56px **"Continue path"** CTA.<br>• Distinct path cards for Paths 2-5 (Detective Mind, Mind & Mindset, Influence & Negotiation, Money & Wealth).<br>• Locked indicator for *Advanced Scenarios* (unlocks at 40 lessons). |
| `5._quiz_try_step` | `/lesson/[lessonId]/step/3` | `components/lesson/Step3Try.tsx` in `app/lesson/[lessonId]/step/3/page.tsx` | • Distraction-free top bar: Close button, question counter (`Question 1 of 3`), progress bar.<br>• Scenario card with image and **"Hide story / Show story"** toggle.<br>• Question headline (e.g. *"What is Sarah feeling?"*).<br>• Multi-choice radio cards with active cyan glow.<br>• **"How sure are you?"** slider ($50\% - 100\%$) with quick presets.<br>• Full-width 56px primary CTA: **"Check answer"**. |
| `6._quiz_feedback` (Correct) | `/lesson/[lessonId]/step/4` (State: Correct) | `components/lesson/Step4Review.tsx` | • Checkmark badge in emerald green (`#34D399`).<br>• Header: *"Correct!"* and *"You were 80% sure and right"*.<br>• Amber XP reward pill: `+12 XP`.<br>• Right answer card + explanatory psychological analysis.<br>• Clues in the story itemized breakdown with strength tags (`Weak`, `Medium`, `Strong`).<br>• Forensic tip banner.<br>• Full-width 56px CTA: **"Next question" / "Continue"**. |
| `6._quiz_feedback_wrong_answer` (Wrong) | `/lesson/[lessonId]/step/4` (State: Incorrect) | `components/lesson/Step4Review.tsx` | • Coral close badge (`#F87171`).<br>• Header: *"Not quite"* + calibration tip: *"You were 80% sure but wrong. Try a lower number when signals are mixed."*<br>• Amber XP pill: `+12 XP` (or calibrated penalty amount).<br>• Coral-bordered **"Your answer"** card displaying the wrong choice.<br>• Emerald-bordered **"The right answer"** card.<br>• *"Clues you may have missed"* breakdown.<br>• Full-width 56px CTA: **"Next question" / "Continue"**. |

### Additional Pages Specified by App Architecture:
* `/paths/[pathId]`: Unit & Lesson tree syllabus detailing all 15 lessons per path.
* `/lesson/[lessonId]/step/1`: Step 1 (Learn) — concept theory and rules card.
* `/lesson/[lessonId]/step/2`: Step 2 (See) — interactive worked scenario with annotated clues.
* `/lesson/[lessonId]/step/5`: Step 5 (Prove) — mastery assessment challenge.
* `/lesson/[lessonId]/step/6`: Step 6 (Apply) — real-world field mission & reflection log.
* `/review`: Spaced repetition flashcards and missed clues dossier (tab 3).
* `/profile`: Recharts cognitive radar, streak calendar, tier progression, guest-to-Google account linking (tab 4).

---

## 9. Implementation Milestones

### Milestone 1: Foundation, Design Tokens & Auth Engine
* Initialize Next.js 15 App Router with TypeScript & Tailwind CSS.
* Configure custom Tailwind theme: `#0B0F1A` canvas, `#121826` surfaces, `#22D3EE` cyan accent, `#F59E0B` amber XP/streak, fonts (Sora, Inter, JetBrains Mono).
* Setup Firebase Auth with Google Sign-in and Anonymous Guest sign-in.
* Implement `linkWithCredential` account migration logic.
* Build Splash / Sign-In screen (`1._splash_sign_in`).
* Setup PWA configuration (`manifest.json`, service worker, icons, safe-area insets).

### Milestone 2: Navigation Shell, Onboarding & Dashboard
* Build responsive navigation shell: Mobile Bottom Tab Bar (Home, Paths, Review, Profile) & Laptop Forensic Sidebar.
* Implement Onboarding flow (`2._onboarding_goal_setup`) with 6-step loop presentation and daily target selection.
* Implement Home Dashboard (`3._home_dashboard`):
  * Top HUD telemetry (Amber streak, Amber XP, Profiler tier).
  * "Continue learning" active hero card.
  * Daily goal progress dial.
  * 5 Path summary cards.
  * Daily challenge card.

### Milestone 3: Curriculum Schema & 6-Step Lesson Engine
* Define static curriculum content for the 5 Paths (15 lessons each, starting with Path 1: Reading People).
* Build full-screen lesson layout with exit confirmation modal.
* Implement the 6 step templates:
  * **Step 1 (Learn):** Theory dossier and behavioral rules.
  * **Step 2 (See):** Interactive worked scenario with clickable clue popovers.
  * **Step 3 (Try):** Scenario viewer, options selector, and Confidence Calibration Slider (50%-100%) (`5._quiz_try_step`).
  * **Step 4 (Review):** Dynamic feedback sheet handling both Correct (`6._quiz_feedback`) and Incorrect (`6._quiz_feedback_wrong_answer`) states with clue strength tags.
  * **Step 5 (Prove):** High-stakes mastery scenario.
  * **Step 6 (Apply):** Everyday field mission log.
* Connect the Confidence Calibration XP scoring engine.

### Milestone 4: Paths Overview & Path Syllabus
* Implement Paths Overview (`4._paths_overview`) with active focus card, overall completion rate, and locked advanced tiers.
* Build Path Syllabus detail page (`/paths/[pathId]`) showing units and lesson unlock sequence.

### Milestone 5: Spaced Repetition (Review) & Profiler Dossier (Profile)
* Implement Review tab (`/review`) powered by SuperMemo-2 spaced repetition for missed clues and core psychological rules.
* Implement Profile tab (`/profile`):
  * Recharts Cognitive Radar chart displaying skill balance across the 5 domains.
  * Streak flame calendar and freeze token status.
  * Profiler Tier badge progression.
  * Account linking modal (Guest $\to$ Google).

### Milestone 6: Offline PWA Optimization, Sync Hardening & Vercel Deployment
* Verify offline functionality and service worker cache policies.
* Test bidirectional real-time synchronization between mobile phone and laptop.
* Implement conflict resolution and optimistic state updates.
* Configure Vercel production deployment with edge caching headers and PWA headers.
