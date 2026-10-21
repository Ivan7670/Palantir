---
name: Zenith Obsidian
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#c0c6d6'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#8b91a0'
  outline-variant: '#414754'
  surface-tint: '#aac7ff'
  primary: '#aac7ff'
  on-primary: '#003064'
  primary-container: '#3e90ff'
  on-primary-container: '#002957'
  inverse-primary: '#005db8'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  mono-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.5rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the quiet, focused gravity of native macOS Sequoia and Sonoma desktop interfaces. Built for dedicated focus routines and deep work commitment, it rejects noisy gamification, dopamine loops, streaks, and punitive visual treatments. The interface treats executive attention as sacred: mornings require clarity, calm pacing, and zero cognitive drag.

The aesthetic fuses Apple Human Interface principles with architectural restraint—using layered frosted obsidian glass, delicate translucent materials, hair-line optical borders, and purposeful typography. Surfaces recede cleanly into the background, ensuring the user's three critical intentions for the day dominate the field of vision. Action states carry a single serene electric cobalt glow, cutting through monochromatic dark fields with precision. Every interaction feels tactile, weightless, and anchored in native desktop conventions: keyboard accelerators, system chrome discipline, and micro-interactions that feel like native AppKit/SwiftUI components.

## Colors

The palette is engineered around dark mode depth, utilizing macOS vibrancy and material layers:

- **Primary (`#0A84FF`)**: Serene Electric Cobalt. Reserved strictly for primary commitments, active focus states, and the authoritative primary action ("Commit & Unlock"). It indicates deliberate progress without anxiety.
- **Secondary (`#64748B`)**: Slate Graphite. Deployed for subtle shortcut badges, inactive state indicators, borders, and secondary controls.
- **Tertiary (`#F59E0B`)**: Warm Amber. Used sparingly for quiet system notices, gentle time markers, or warning states before locking. Never used as an alarming red.
- **Neutral Base (`#0D1117`)**: Deep Obsidian Canvas. Paired with layered translucent alpha channels:
  - Base canvas: `#090C10` (true deep graphite)
  - Mica surface: `rgba(22, 27, 34, 0.72)`
  - Elevated panel: `rgba(33, 38, 45, 0.65)`
  - Card stroke / boundary: `rgba(255, 255, 255, 0.08)`
  - Text primary: `#F0F6FC`
  - Text secondary: `#8B949E`
  - Text tertiary: `#484F58`

## Typography

The typography relies on Inter set to strict Apple-standard metrics with alternate tabular figures enabled for counters and keyboard keys. 

- Headings use tight negative tracking (`-0.02em` to `-0.03em`) to mimic the crisp, authoritative look of SF Pro Display.
- Uppercase metadata labels leverage extended letter-spacing (`0.08em`) to provide clear visual zoning for sections without demanding color shifts.
- Numeric counters and shortcut indicators must enable OpenType features `tnum` (tabular numbers) and `cv05` for absolute alignment across stacked priority list cards.

## Layout & Spacing

The layout is grounded in a centered desktop stage philosophy. For a full-screen lock experience:

- **Desktop (1024px and above)**: The main focus sanctuary sits constrained to a maximum width of `760px` centered vertically and horizontally within the viewport. Spacing is generous (`space-xl` between sections), keeping peripheral viewports uncluttered.
- **Window Chrome**: Standard macOS title bar spacing (height `52px`) preserves fixed space for traffic-light controls at top-left (`padding-left: 1.25rem`) and session time indicators at top-right.
- **Card Matrix**: Priority slots stack vertically with consistent `space-md` gaps. Internal card padding is consistently `1.25rem` (20px), balancing density with tactile ease.
- **Sub-Breakpoints (Compact/Mobile viewports)**: Gutters contract to `1.5rem`, margins collapse to `1rem`, and typography steps down automatically while maintaining the centered single-column stack.

## Elevation & Depth

Depth is established strictly through translucent glass layering and low-contrast edge lighting, avoiding muddy, high-spread shadows.

- **Level 0 (Backdrop Canvas)**: Deep tinted obsidian with a background blur: `backdrop-filter: blur(48px) saturate(160%)`.
- **Level 1 (Window & Container Panels)**: `rgba(22, 27, 34, 0.65)` bordered by a razor-thin internal light rim: `1px solid rgba(255, 255, 255, 0.08)`.
- **Level 2 (Priority Cards & Input Blocks)**: `rgba(33, 38, 45, 0.70)` with a top edge reflection: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06), 0 4px 20px rgba(0, 0, 0, 0.35)`.
- **Level 3 (Focused Card / Active State)**: Accent border ring `1px solid rgba(10, 132, 255, 0.5)` with an ambient outer glow `0 0 24px rgba(10, 132, 255, 0.18)`.

## Shapes

The design system standardizes on continuous corner curvature matching macOS squircle conventions:

- Base containers and floating windows use `rounded-xl` (16px to 20px) to echo native macOS window geometry.
- Interactive priority cards, inputs, and popovers use `rounded-lg` (12px to 14px).
- Shortcut pill badges, tag indicators, and system control buttons employ fully circular/pill contours (`rounded-full`).

## Components

### Window Header & Traffic Lights
- Window control dots: 12px circles (`#FF5F56`, `#FFBD2E`, `#27C93F`) with 8px spacing, positioned `18px` from the top-left edge. In lock mode, close and minimize show a muted disabled state with `opacity: 0.4`.
- Center title: Subtle `body-sm` in `text-secondary`, displaying the lock status ("Morning Focus Protocol — 3 Priorities").

### Priority Task Cards
- Layout: Row with an interactive sequence index (`01`, `02`, `03`) on the left in `mono-tabular`, an open-field editable text area in the middle, and an estimated duration badge on the right.
- Borders: `1px solid rgba(255, 255, 255, 0.07)`, shifting to `rgba(10, 132, 255, 0.6)` when selected or focused.
- Background: Translucent frosted glass.

### Keyboard Shortcut Badges (KBD)
- Visuals: Inset pill badge with dark background `rgba(255, 255, 255, 0.06)`, subtle border `rgba(255, 255, 255, 0.12)`, font `mono-tabular`, `font-size: 11px`, `padding: 2px 6px`.
- Common examples: `⌘ Return` (Unlock Focus), `Esc` (Dismiss details), `1 - 3` (Select priority slot).

### Primary Action Button
- Height: `44px` with `padding: 0 24px`.
- Style: Solid `#0A84FF` background with high-contrast `#FFFFFF` typography.
- States: Hover adds slight brightness (`filter: brightness(1.1)`), active scales slightly (`scale(0.98)`). Pairs directly with the inline `⌘↵` accelerator tag.

### Inputs & Focus Fields
- Seamless, unbordered text entry while idle; transitions to a subtle bottom border highlight when typing. Typography is `headline-md` for maximum legibility without visual clutter.