# DECODE — Cognitive Forensics & Human Behavior Mastery

DECODE is a modern, gamified cognitive training platform engineered with a **Cognitive Noir** aesthetic. It teaches deep human behavioral profiling, rational decision-making, persuasion dynamics, and behavioral finance through interactive scenarios, calibrated metacognition scoring (Brier score), spaced repetition (Leitner queue), and offline-first cloud synchronization.

---

## 🎨 Cognitive Noir Design System

The application adheres strictly to the **Cognitive Noir** design philosophy:
- **Base Canvas:** `#0B0F1A` (deep slate-black void)
- **Surfaces & Cards:** `#121826` and `#1A2233` with `#263047` hairline borders
- **Primary Accent:** `#22D3EE` (cyan neon for intelligence, active paths, and interactive highlights)
- **Reward Accent:** `#F59E0B` (amber reserved exclusively for XP, streaks, and flame badges)
- **Success / Mastered:** `#34D399` (emerald green)
- **Alert / Friction:** `#F87171` (crimson red)
- **Typography & Accessibility:** Strict minimum 13px font size across all screens, zero truncated labels, full keyboard focus rings (`focus-visible:ring-2`), and complete `prefers-reduced-motion` compliance.

---

## ⚡ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS + Lucide Icons + Google Material Symbols
- **State Management:** Zustand with LocalStorage fallback & offline queue
- **Cloud & Sync:** Firebase Auth (Google OAuth & Anonymous Guest mode) + Cloud Firestore with offline persistence
- **Visualization:** Recharts (Skill Radar, Metacognitive Calibration curves, Net Worth wealth simulators)
- **Testing:** Vitest + Testing Library

---

## 🚀 Getting Started & Local Setup

### 1. Prerequisites
- Node.js 18.18+ or Node.js 20+
- npm or yarn / pnpm

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/7075pavan/DECODE.git
cd DECODE
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```
Fill in your Firebase project configuration credentials in `.env.local` (see [Environment Variables](#environment-variables) below).

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests & Builds
```bash
# Run unit and integration tests
npm test

# Build for production
npm run build
```

---

## 🔐 Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | `project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Google Cloud / Firebase project ID | `decode-app-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Cloud Storage bucket | `project-id.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:...` |

> ⚠️ **Security Warning:** Never commit `.env.local` to GitHub. The `.gitignore` file is pre-configured to exclude all `.env*.local` files.

---

## 🔥 Firebase Setup Guide

### 1. Enable Authentication Providers & Add Authorized Domains
In the [Firebase Console](https://console.firebase.google.com/):
1. Navigate to **Build > Authentication > Sign-in method**.
2. Enable **Anonymous** (allows instant guest onboarding without friction).
3. Enable **Google** (allows seamless cross-device account continuation).
4. **Authorize your deployment domain:** Navigate to **Authentication > Settings > Authorized domains** and click **Add domain**. Add your Vercel deployment domain (e.g. `decode-iota-one.vercel.app`) as well as `localhost`. Without this, Firebase will block Google sign-in with `auth/unauthorized-domain`.

### 2. Initialize Cloud Firestore
1. Navigate to **Build > Firestore Database** and click **Create database**.
2. Select your preferred region (e.g., `us-central1`).
3. Start in **Production mode**.

### 3. Deploy Firestore Security Rules
Deploy the following rules (also available in `firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Offline Persistence & Multi-Device Sync
DECODE initializes Firestore with client-side offline persistence enabled (`initializeFirestore` with `persistentLocalCache`). Users can solve missions, submit calibrated answers, and view lessons offline. When network connectivity restores, mutations automatically reconcile using union-merge for XP and earned steps.

---

## 📚 Adding New Curriculum & Units

All educational content is completely modular and driven by JSON schemas located in `src/content/units/`.

### 1. Create the Unit JSON
Create a new file `src/content/units/<path-slug>-unit-<number>.json`:
```json
{
  "id": "detective-mind-unit-4",
  "pathId": "detective-mind",
  "order": 4,
  "title": "Chain of Custody & Evidence Analysis",
  "shortDescription": "Preventing cognitive contamination in deduction",
  "estimatedMinutes": 8,
  "learn": {
    "cards": [
      {
        "id": "c1",
        "title": "Evidence Contamination",
        "concept": "Cognitive Bias Interference",
        "explanation": "Forming a narrative before collecting all observations.",
        "example": "Assuming theft before confirming a missing object wasn't misplaced."
      }
    ]
  },
  "see": {
    "title": "Worked Forensic Case",
    "caseContext": "A founder reviews suspicious accounting variances...",
    "steps": [
      {
        "subStepType": "observation",
        "stepLabel": "Step 1: Raw Signals",
        "forensicExplanation": "Differentiate hard ledger entries from verbal claims."
      }
    ]
  },
  "try": {
    "scenarios": [
      {
        "id": "s1",
        "scenarioText": "A vendor demands immediate invoice settlement...",
        "steps": [
          {
            "subStepType": "intent",
            "stepLabel": "Detect True Intent",
            "options": [
              { "id": "o1", "text": "Manufactured urgency", "isCorrect": true, "xp": 10 }
            ]
          }
        ]
      }
    ]
  },
  "prove": {
    "masteryQuestions": [
      {
        "id": "q1",
        "prompt": "What constitutes confirmation bias in behavioral profiling?",
        "options": [
          { "id": "a", "text": "Seeking only signals matching your hypothesis", "isCorrect": true }
        ],
        "conceptId": "bias-confirmation"
      }
    ]
  },
  "apply": {
    "mission": {
      "id": "m1",
      "title": "Audit Urgency Signals",
      "description": "Examine the next 3 urgent emails you receive for artificial pressure."
    }
  }
}
```

### 2. Register the Unit in the Registry
Import and export the unit in `src/content/registry.ts`:
```typescript
import dm4 from "./units/detective-mind-unit-4.json";

export const ALL_UNITS: UnitData[] = [
  // ...existing units
  dm4 as unknown as UnitData,
];
```
The winding path tree, node icons, progress tracking, and mastery checks will automatically generate the node dynamically!

---

## 🚢 Deploying to Vercel

### Option 1: Automatic Deployment via GitHub (Recommended)
1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New... > Project"**.
3. Import your GitHub repository (`DECODE`).
4. Under **Environment Variables**, paste the keys from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. Click **Deploy**. Vercel will build and assign a global production URL (e.g. `decode.vercel.app`).

### Option 2: Deploying via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 📱 Progressive Web App (PWA) Installation

DECODE includes a complete web app manifest (`manifest.json`) and service worker configuration:
- **iOS (iPhone/iPad):** Open the production URL in Safari, tap the **Share** button, and select **"Add to Home Screen"**.
- **Android / Desktop Chrome:** Click the **Install** prompt in the address bar or select **"Install DECODE"** from the browser menu.

---

## 🛡️ License
MIT License. Built for rigorous cognitive and behavioral development.
