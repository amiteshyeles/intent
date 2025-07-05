# 🧘‍♂️ Intentional App Launcher — Product Spec (MVP)

## Overview

This is a mobile app (iOS-first, built with Expo) designed to help users pause before opening distracting apps. By introducing a 60-second delay and reflective questions, the app encourages mindful usage and breaks habitual dopamine-seeking behavior.

## Goals

- Interrupt mindless app launches with intentional friction
- Help users reflect on their usage purpose
- Offer a graceful, configurable bypass mechanism
- Focus on simplicity and iOS compatibility

---

## Target Platform

- **iOS** (initial focus, via Shortcuts workaround)
- **Built with:** Expo (React Native)

---

## Core Features

### 1. App Dashboard (Main Screen)
- View list of apps configured for intentional launching
- Toggle reflection on/off per app
- View/edit delay time per app
- Open app-specific settings

#### Example Entry:
```
[✓] Instagram         Delay: 60s      [⚙️ Settings]
[ ] TikTok            Delay: —        [⚙️]
[+] Add App
```

---

### 2. Add App Flow
- Choose from list of popular apps (Instagram, TikTok, YouTube, etc.)
- Optionally add custom app with:
  - App name
  - App icon (optional)
  - Deep link (e.g., `instagram://`)
- Save configuration and show how to install Shortcut

---

### 3. Reflection Flow (Triggered from Shortcut)
- 60-second delay screen:
  - Shows question: “Why are you opening this app?”
  - Countdown timer
  - Optional bypass: “Proceed With Intention”

#### Bypass Flow:
1. “Do you have a specific purpose?”
   - If no: return to home screen
   - If yes:
2. “Say your purpose out loud” (UI hint). "Type it here (we don't store it)"
3. “How long will it take?” → user picks time
4. Launch target app
5. (Optional) local timer to remind user when time is up

---

### 4. Global Settings
- Set global default delay time
- Batch toggle intentional mode for all apps
- Global toggle: "Disable for 1 hour"

---

### 5. Shortcut Generation (iOS-only)
- Preconfigured iCloud Shortcut for each added app
- Setup instructions:
  - “Tap to install Shortcut”
  - “Add to Home Screen”
  - Optional: hide original app icon

---

## Data Model

```ts
AppConfig {
  id: string
  name: string
  icon: string
  deepLink: string
  isEnabled: boolean
  delaySeconds: number
  allowBypass: boolean
  questionsType: 'default' | 'gratitude' | 'custom'
}
GlobalSettings {
  defaultDelay: number
  enableAll: boolean
}
```

Stored via `AsyncStorage` or `MMKV`.

---

## Not in MVP (But Planned Later)
- Android foreground app detection (requires ejection)
- Cloud backup or account login
- Usage stats and streak tracking
- Push/local notifications when timebox ends
- Siri suggestions for reflective flows
- AI-generated custom question packs

---

## Visual Design

**Tone:** Calm, intentional, friendly  
**Colors:** Soft neutrals, no harsh alerts  
**Fonts:** Rounded, legible, non-corporate  
**Animation:** Subtle countdown or wave during 60s delay

---

## Monetization

- MVP: free, no monetization
- Future ideas:
  - One-time purchase to unlock advanced features
  - Premium tier: analytics, question packs, more customizations

---

## Dependencies / Tools

- React Native (Expo)
- AsyncStorage / MMKV
- `Linking.openURL()` for app deep links
- iCloud Shortcuts (user-installed)
- (Optional later: Expo Push Notifications or Background Tasks)

---

## Success Metrics

- % of launches that complete the 60-second pause
- % of users who complete bypass instead of quitting
- Retention over 7/30 days
- Qualitative feedback on mindfulness + control

---

## Timeline Estimate

| Week | Milestone                                  |
|------|--------------------------------------------|
| 1    | Core UI for dashboard, app config          |
| 2    | Reflection + bypass flow                   |
| 3    | Shortcut creation and linking (iOS)        |
| 4    | Polish + onboarding + testflight launch    |

---

## Notes

- This product avoids the "parental control" stigma and instead offers **self-directed behavioral change**.
- Success depends heavily on:
  - Simple onboarding
  - Frictionless setup for Shortcuts
  - Strong UX and tone

---