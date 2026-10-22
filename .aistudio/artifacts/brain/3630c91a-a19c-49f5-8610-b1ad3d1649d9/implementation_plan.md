# OneFocus UI Overhaul: Ultra-Minimal Huge Bold Text Design

A major visual and architectural redesign of **OneFocus**, transitioning from a dark multi-card interface into an ultra-clean, stark white, editorial typography experience matching the user mockups. Every unnecessary border, pill badge, and status indicator is eliminated so the single crucial priority commands the entire viewport.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All core capabilities (Brave-compatible background notifications, custom reminder times, window minimization, sound design, auto-shelving $\le 15$m tasks, and keyboard shortcuts) are preserved, while streamlining navigation and interface layout:

- **Work / Life Switcher Removed**: Streamlined into a single unified daily focus stream as requested.
- **Top Bar Elimination**: Replaced with clean corner anchors: `"One Focus"` on the top-left and live date/time (`"October 21 - 4:00AM"`) on the top-right.
- **Progressive Disclosure Flow**:
  1. *Empty state*: Shows giant muted placeholder `"One thing to satisfy your day."`.
  2. *Typing feedback*: Displays live word count in soft coral (`Minimum 6 words | Current #`) below the priority until at least 6 words are entered.
  3. *Duration selector*: The duration options (`5m`, `10m`, `15m`, `30m`, `1hr`, `+`) appear only once the priority text is typed.
  4. *Secondary tasks*: Lines `2.` and `3.` remain subtle underlines and only expand for input after the primary task is specified.
- **Bottom Navigation Anchor**:
  - Bottom-Left: Settings gear (housing New Day, Emergency Unlock, Reminders, and Audio).
  - Bottom-Center: Subtle caret tab (`^`) to toggle the Shelf drawer.
  - Bottom-Right: Contextual action (`"Commit →"`, `"I am committed →"`, `"One Focus →"`).
- **Completion & Reveal Gate**: Marking the main priority as done is the only trigger that unlocks the **Day Won** state, revealing the optional secondary tasks.

---

## 1. Overview & Core Experience

OneFocus strips away distraction by enforcing the "One Thing" philosophy. The user is greeted by a clean white canvas dominated by a single giant headline. There are no competing panels, sidebars, or complex menus.

```
┌────────────────────────────────────────────────────────────────────────┐
│ One Focus                                          October 22 - 8:05AM │
│                                                                        │
│                                                                        │
│   One thing to satisfy your day.                                       │
│                                                                        │
│   5m   10m   15m   30m   1hr   +                                       │
│                                                                        │
│   2 . Some other task that needs to be done                            │
│   3 . Some other task that needs to be done                            │
│                                                                        │
│                                                                        │
│                                                                        │
│   ⚙                                   ^                       Commit → │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visual Identity & Design System

### A. Typographic Hierarchy & Layout
- **Display Priority Font**: `Plus Jakarta Sans` / `Outfit` / `Inter`, bold weight 800, `clamp(2.75rem, 6vw, 5.25rem)` with `-0.035em` letter tracking and tight `1.08` line height.
- **Canvas Atmosphere**: Stark, clean minimalist white canvas (`#ffffff`), with `#000000` text for maximum legibility and zero visual noise.
- **Muted Placeholders**: Muted warm gray (`#c4c8d0` / `#949aa8`) for empty prompts and subtle underlines.
- **Live Word Count Feedback**: Soft coral/salmon text (`#e05252`) showing `Minimum 6 words | Current #` directly underneath the giant text input while the character count is below the 6-word threshold.
- **Secondary Lines**: Minimalist numbered list (`2.` and `3.`) in subdued `#6b7280` text, aligned with the primary headline.

### B. Screen States & Progression

#### 1. Setup Screen (Screen 1)
- Giant auto-growing text area with inline editing.
- Live word count validation until 6 words are reached.
- Once valid, duration presets appear (`5m`, `10m`, `15m`, `30m`, `1hr`, `+`). Tasks set to $\le 15$m automatically trigger an animated transfer to the Shelf.
- Secondary tasks (`2.` and `3.`) reveal themselves below the duration row.
- Action button at bottom right transitions from subdued to high-contrast `"Commit →"` / `"I am committed →"`.

#### 2. Locked Focus Screen (Screen 2)
- Replaces everything else with the giant priority title and duration.
- Clicking the text immediately navigates back to Screen 1 for inline editing (`"edit should go back to the original screen"`).
- Optional secondary tasks are hidden during active focus.
- Hovering/clicking the priority reveals the serene green completion hint.
- Bottom actions: Settings gear on bottom-left, caret drawer on bottom-center.

#### 3. Day Won Screen (Screen 3)
- Triggered exclusively by completing the main priority.
- Displays celebratory minimalist completion headline.
- **Reveals optional secondary tasks** (`2.` and `3.`) so the user can continue their day without pressure. Tasks with only default placeholders are excluded.
- Options to undo completion (`Cmd+Z`), start a `"New Day"`, or pull up the Shelf.

#### 4. Shelf Drawer (Screen 4)
- Accessible by clicking the bottom center caret (`^`) or pressing `s`.
- Slides up from the bottom as a full-viewport white modal:
  - Header: `"Shelf"` (bold) on left, date & time on right.
  - Interactive checklist with clean circular radios (`○`), item titles, and duration pills (`10m`, `15m`).
  - Inline input to quickly drop new parked tasks into the shelf.
  - Bottom-right button updates to `"One Focus →"` to slide the drawer back down.

#### 5. Consolidated Settings Modal
- Opened via the gear icon (`⚙`) in the bottom-left or `Cmd+,`.
- House all secondary functions that previously crowded the header:
  - **New Day**: Fresh reset of daily tasks.
  - **Emergency Unlock**: Return from Locked mode to Setup mode.
  - **Desktop Push Notifications**: Custom schedule times, recurring intervals, and Brave Browser diagnostic helper.
  - **Sound & Chime**: Harmonic audio chimes toggle.

---

## 3. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                              AppState                                  │
│  - priority: { title, durationMinutes, completed }                     │
│  - secondaryTasks: [ { id, title, completed } ]                        │
│  - shelf: [ { id, title, durationMinutes, completed } ]                │
│  - screenMode: 'setup' | 'locked' | 'day_won'                          │
│  - shelfOpen: boolean                                                  │
│  - reminders: ReminderSettings                                         │
│  - isMinimized: boolean                                                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────────────┐               ┌───────────────────────┐
│     OneFocus Core Views       │               │      Overlay/Modals   │
│  - Top Corner Anchors         │               │  - Shelf Drawer (^)   │
│  - SetupView (Giant Title)    │               │  - SettingsModal (⚙)  │
│  - LockedView (One Thing)     │               │  - Minimized Dock     │
│  - DayWonView (Reveals 2 & 3) │               │  - Notification Toast │
│  - Bottom Controls Bar        │               │                       │
└───────────────────────────────┘               └───────────────────────┘
```

---

## 4. Key Execution Steps

1. **State Simplification**:
   - Refactor `AppState` in `src/types.ts` to retire the dual `work` / `life` context split and use a single consolidated focus stream.
2. **Main Layout & Top Bar Redesign**:
   - Remove legacy navigation bar in `src/App.tsx`.
   - Implement fixed corner headers: `"One Focus"` (top-left) and live date/time `"October 21 - 4:00AM"` (top-right).
   - Implement bottom control dock: Gear icon (bottom-left), Caret toggle button (bottom-center), and action button (bottom-right).
3. **Setup Screen Overhaul**:
   - Full-bleed giant auto-resizing text input with soft placeholder `"One thing to satisfy your day."`.
   - Live word count tracker (`Minimum 6 words | Current #`) in soft red.
   - Dynamic duration selector (`5m`, `10m`, `15m`, `30m`, `1hr`, `+`) visible only after the priority is entered.
   - Subdued numbered lines for optional secondary tasks `2.` and `3.`.
4. **Locked Screen Overhaul**:
   - Huge bold text taking center stage; clicking anywhere on the text returns directly to the setup screen.
   - Green hover hint for completion.
   - Optional tasks remain hidden until priority completion.
5. **Day Won Screen Overhaul**:
   - Clean celebratory typography.
   - Displays and activates the secondary optional tasks (`2.` and `3.`).
6. **Shelf Drawer Component**:
   - Slide-up bottom sheet with circular radio toggles, durations, and quick-add row.
7. **Consolidated Settings**:
   - Update `SettingsModal.tsx` to include New Day, Emergency Unlock, Brave notification settings, and sound toggles.
8. **Verification & Testing**:
   - Verify word count live feedback, auto-shelving $\le 15$m, keyboard shortcuts (`Cmd+Enter`, `Cmd+M`, `s`, `Esc`), and compile verification.
