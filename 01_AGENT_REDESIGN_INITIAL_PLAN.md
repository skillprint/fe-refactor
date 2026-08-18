# Phase 1: Foundational Token & Asset Integration

Set up the core design system tokens, fonts, SVG assets, and icon components from [Skillprint Design System · 10 August 2026.html](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/public/Skillprint%20Design%20System%20%C2%B7%2010%20August%202026.html) and [skillprint.css](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/public/Skillprint%20Design%20System%20%C2%B7%2010%20August%202026_files/skillprint.css) into Next.js + Tailwind CSS v4.

## Proposed Changes

---

### 1. Asset & SVG Icon Reorganization

Organize raw design system assets from `public/Skillprint Design System · 10 August 2026_files/` into clean, public asset directories:

#### [NEW] `public/assets/design-system/icons/sprite.svg`
- Extract the 79 `ti-*` SVG icons (`ti-adjust`, `ti-alert`, `ti-cognition-*`, `ti-mood-*`, `ti-personality-*`, `ti-check`, `ti-close`, etc.) from [Skillprint Design System · 10 August 2026.html](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/public/Skillprint%20Design%20System%20%C2%B7%2010%20August%202026.html#L11-L96) into a standalone SVG sprite sheet.

#### [NEW] `public/assets/design-system/` subdirectories
- Copy and categorize:
  - `badges/` (`badge-*.svg` - 9 badge icons)
  - `patterns/` (`bg-*.svg` - 128 background pattern SVGs)
  - `game-art/` (`game-*.svg` - 12 animated and static game illustrations)
  - `logos/` (`skillprint-logo-*.svg`, `skillprint-mark-*.svg`, `skillprint-favicon-*.svg`)

#### [NEW] [Icon.tsx](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/components/ui/Icon.tsx)
- Create a strongly typed React icon helper component supporting icon sizes (`xs` | `sm` | `md` | `lg` | `xl` | `2xl`), stroke widths, and symbol names (`ti-*`).

---

### 2. Design Tokens & Tailwind CSS v4 Integration

#### [MODIFY] [globals.css](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/app/globals.css)
- Add CSS Custom Properties extracted from `skillprint.css` (Layer 01 & 02):
  - **Palette Ramps**: Deep Navy (`50-950`), Panel Navy (`50-950`), Geistface Grey (`50-950`), Core Lime (`50-950`), Core Green (`50-950`), Personality Mint (`50-950`), Personality Blue (`50-950`), Mindset Violet (`50-950`), Mindset Magenta (`50-950`), Skills Pink (`50-950`), Skills Orange (`50-950`).
  - **Surface & Semantic Tokens**: Dark & Light surface themes (`data-surface="dark"`, `data-surface="light"`), `--surface-bg`, `--surface-panel`, `--surface-box`, `--surface-border`, `--text-default`, `--text-muted`, `--text-inverse`.
  - **Typography & Font Tokens**: Sizes (`--text-xxs` to `--display-2xl`), font families (`--font-geist`, `--font-geist-mono`, `--font-recoleta`).
  - **Spacing & Radius Primitives**: `--space-0` to `--space-1920`, `--radius-none` to `--radius-full`.
  - **Shadows, Backdrop Blur & Motion**: `--shadow-xs`..`xl`, `--backdrop-blur-*`, `--transition-interactive`.
- Add `@theme` directives for Tailwind v4 integration to enable utility classes like `bg-deep-navy-900`, `text-core-green-500`, `font-display`, `rounded-panel`, `shadow-xl`.

#### [MODIFY] [layout.tsx](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/app/layout.tsx)
- Configure font variable definitions (`Geist`, `Geist_Mono`, `Inter`, `Outfit`) to supply `--font-geist`, `--font-geist-mono`, `--font-inter`, `--font-outfit` at the HTML root.

---

### 3. Agentic Verification Page

#### [NEW] `app/design-system/tokens/page.tsx`
- Create a visual verification showcase page that displays:
  1. Interactive palette color swatches with token names & HEX values
  2. Font typography scale preview (UI, Mono, Display)
  3. Icon library grid rendering all 79 `ti-*` icons via `Icon.tsx`
  4. Surface panel cards & border tokens validation

---

## Verification Plan

### Automated Tests
- Run `npm run build` or `next build` to verify there are no CSS syntax errors, missing variables, or TypeScript type issues.

### Manual / Visual Verification
- Visit `/design-system/tokens` in dev mode (`npm run dev`) to visually confirm pixel-perfect accuracy against the tokens in [Skillprint Design System · 10 August 2026.html](file:///Users/jeremy/Documents/dubchuck/skillprint/skillprint-rewrite/public/Skillprint%20Design%20System%20%C2%B7%2010%20August%202026.html).
    