---
name: Cognitive Noir
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353945'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b27'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a36'
  surface-container-highest: '#313441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#61f6b9'
  on-tertiary: '#003825'
  tertiary-container: '#3dd99e'
  on-tertiary-container: '#005a3e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#313441'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Sora
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: 0em
  headline-md:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.06em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system merges the deductive atmosphere of psychological neo-noir with the kinetic, habit-forming clarity of high-stakes mastery platforms. Tailored for analytical professionals, negotiators, and behavioral tacticians, the interface evokes the quiet tension of an observation suite or a forensic lab: composed, hyper-focused, and deliberate.

The visual direction pairs **Minimalism** with subtle **Tactile / HUD Sleekness**. Rich, light-absorbing obsidian backdrops eliminate visual noise, while razor-thin luminous borders and pinpoint chromatic accents guide the eye toward micro-expressions, behavioral signals, and decision branch points. Surfaces feel engineered rather than merely digital—calibrated, measured, and tactically empowering.

## Colors

The palette operates on high-contrast nocturnal mechanics (meeting strict WCAG AA+ thresholds against deep bases):

- **Neutral Foundations:** Canvas background is anchored at `#0B0F1A`, layered under resting card surfaces `#121826`, elevated modal/interactive containers `#1A2233`, and structured grid outlines `#263047`.
- **Primary Accent (`#22D3EE` Electric Cyan):** Dedicated to primary calls to action, scan focus indicators, tactical active states, and deduction targets.
- **Secondary Accent (`#F59E0B` Master Amber):** Reserved for XP accrual, streak metrics, prestige tokens, and high-value psychological rewards.
- **Tertiary Accent (`#34D399` Pulse Green):** Used for affirmative reads, confirmed deductions, and correct behavioral assessments.
- **Critical Feedback (`#F87171` Tell Coral):** Marks deception tells, deductive misses, time run-outs, and diagnostic warnings.
- **Typography Neutrals:** Primary text is `#F1F5F9` for high-acuity legibility; secondary descriptors, metadata, and timestamps sit at `#94A3B8`.

## Typography

The typographic hierarchy divides cognitive roles sharply:
- **Headlines (Sora):** Architectural, geometric, and authoritative. Carries case headers, dossier profiles, and milestone totals with decisive optical presence.
- **Reading / Body (Inter):** Highly neutral and tuned for sustained focus. The generous line-height (1.6) prevents eye fatigue during comprehensive scenario descriptions and transcript analyses.
- **HUD & Telemetry (JetBrains Mono):** Reserved for confidence metrics, odds calculations, calibration values, timestamp markers, and tactical tags to sustain the forensic, calculated tone.

## Layout & Spacing

Layouts follow an uncompromising 8px baseline rhythm across an adaptive fluid grid:
- **Mobile (`<768px`):** Single-column stack with 16px lateral canvas margins (`margin`). Crucial interactive triggers sit within the bottom 40% thumb zone, sized for touch clearance (48–56px height).
- **Tablet / Desktop (`>=768px`):** 12-column grid constrained to a maximum content width of 1280px with 24px gutters (`gutter-desktop`) and 40px outer margins (`margin-desktop`). Split-view layouts divide scenario observation feeds (6-7 columns) from live deduction dossiers and prompt selectors (5-6 columns).

Internal component flow enforces strict spacing steps: micro-distances between labels and numeric readouts utilize `space-xs` (4px) or `space-sm` (8px); related input controls cluster at `space-md` (16px); distinct dossier modules distance via `space-xl` (32px).

## Elevation & Depth

Spatial depth avoids soft, blurry skeuomorphic drops, relying instead on **Tonal Layers** bounded by **Low-Contrast Precision Outlines**:

- **Ground (Canvas):** Tone `#0B0F1A`. The ultimate dark floor for scenario backdrop video, transcript feeds, and observational stages.
- **Level 1 (Structural Modules & Dossiers):** Tone `#121826` edged by a uniform 1px solid border of `#263047`.
- **Level 2 (Active Cards & Floating Sheets):** Tone `#1A2233` with 1px `#263047` outline. In interactive states, cards exhibit a directional top highlight border of `rgba(34, 211, 238, 0.4)` and a localized, sharp 8px ambient cyan glow (`0 0 16px -4px rgba(34, 211, 238, 0.15)`).
- **Level 3 (Diagnostic Overlays & HUD HUD Dialogs):** `#1A2233` backed by a 12px backdrop-filter blur (`blur(12px)` at 85% surface opacity) to visually suspend deductions over the investigation canvas.

## Shapes

The shape hierarchy combines high-ergonomic softness with crisp technical discipline:
- **Dossiers, Cards, and Case Scenarios:** Standardized at 16px corner radius (`rounded-lg`), providing a contained, modern surface feel.
- **Action Triggers & Selection Options:** Scaled to 12px (`rounded`), offering distinctive visual contrast against the larger parent containers while fitting naturally under touch points.
- **System Tags, Badges, and HUD Indicators:** Clipped cleanly or pill-shaped (full radius) for instant classification of biometric metrics, confidence ratings, and streak counters.

## Components

### Buttons & Interactive Deduction Triggers
- **Primary (Execute / Decode):** Height 52px (thumb-safe). Fill `#22D3EE`, text `#0B0F1A` (Sora Bold). Hover shifts toward cyan brightness; active state reveals an interior inset ring.
- **Secondary / Scenario Choices:** Height 52px. Surface `#1A2233`, 1px border `#263047`, text `#F1F5F9`. Selected option ignites with a 1px border of `#22D3EE` and light-reactive cyan tint (`rgba(34, 211, 238, 0.08)`).

### Dossier & Investigation Cards
- Built with 16px rounded corners, `#121826` fill, and `#263047` hairline framing.
- Headers integrate metadata breadcrumbs set in monospace (`label-md`) coupled with clear Sora titles.

### Calibration Sliders (Negotiation & Pressure Gauges)
- Track thickness: 6px, `#1A2233` with `#263047` container outline.
- Active Range: Dynamic electric cyan or amber fill based on domain (logic vs. leverage).
- Thumb Target: 24px circular indicator encased in a 48px invisible touch hit-box, displaying dynamic numeric confidence readouts floating above.

### Confidence Tags & Biometric Chips
- Compact HUD chips with 1px border, filled with 10% opacity semantic color (e.g., `#34D399` for Baseline Congruence, `#F87171` for Micro-tension).
- Monospaced text with letter-spacing tracking (`label-md`), paired with an inline 6px glowing status dot.

### Progress & Mastery Rings
- Circular SVG progress tracks with an unobtrusive track stroke of `#263047` (4px width).
- Active arc features `#22D3EE` or `#F59E0B` with rounded caps and a centered tabular percentage readout.

### Input Fields & Search Dossiers
- Height 48px. Background `#0B0F1A`, border 1px `#263047`, font Inter 16px `#F1F5F9`.
- Focus state activates an instantaneous `#22D3EE` border transition with no offset spread, matching the precision-instrument aesthetic.
