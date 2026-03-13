---
name: build-from-spec
description: Read the reverse-engineering documentation and launch an agent team to build the full website clone from the spec. Scaffolds the project, creates mock data, builds components in parallel worktrees, assembles pages, and runs QA.
user-invocable: true
---

# Build From Spec

You are about to build a full website clone from the reverse-engineering documentation in `docs/research/`.

This skill emulates the proven build workflow from `claude-code-users-globe`, where a globe visualization was built from a reverse-engineering spec using parallel worktree agents.

## Pre-Flight Checks

1. Read ALL files in `docs/research/` — you need the full picture before launching anything:
   - `DESIGN_TOKENS.md` — colors, typography, spacing, borders, shadows, breakpoints
   - `COMPONENT_INVENTORY.md` — every component with structure and states
   - `LAYOUT_ARCHITECTURE.md` — page layouts, grid system, responsive behavior
   - `INTERACTION_PATTERNS.md` — animations, transitions, hover states
   - `TECH_STACK_ANALYSIS.md` — their stack mapped to our chosen equivalents
   - `BUILD_PLAN.md` — component order, parallel tracks, build sequence

2. If any of these files are missing, STOP and tell the user to run `/reverse-engineer` first.

3. Read `CLAUDE.md` and `TARGET.md` for project-level context and scope.

## Phase 1: Foundation (Sequential — Must Complete First)

Launch a single agent to scaffold the project foundation:

**Task: Project Scaffold**
- Initialize Next.js 15 with App Router, TypeScript strict, Tailwind CSS v4
- Configure Tailwind theme with extracted design tokens from `DESIGN_TOKENS.md`:
  - Custom colors matching the target site
  - Typography scale (font families, sizes, weights)
  - Spacing scale
  - Border radius values
  - Shadow definitions
  - Breakpoint values
- Create the base layout component (`src/app/layout.tsx`) with:
  - Font loading (match target site's fonts)
  - Global styles
  - Dark/light mode setup if applicable
- Create TypeScript interfaces in `src/types/` for all data entities
- Install necessary dependencies (icon library, UI components, etc.)
- Verify: `npm run build` should pass with zero errors

IMPORTANT: Wait for this to complete before launching Phase 2. Everything else depends on the foundation.

## Phase 2: Data Layer + Core Components (Parallel Agent Team)

Launch these agents simultaneously as an agent team:

### Agent 1: Mock Data Generator
**Task:** Create seeded mock data generators in `src/lib/mock/`
- Read `COMPONENT_INVENTORY.md` and `TECH_STACK_ANALYSIS.md` to understand data shapes
- Create TypeScript interfaces for every data entity
- Build deterministic generators (same seed = same output) using a seeded PRNG
- Data should be realistic: real-sounding names, varied content lengths, power-law distributions for engagement metrics
- Export clean API from `src/lib/mock/index.ts`
- Include edge cases: very long text, empty fields, missing optional data

### Agent 2: Navigation Component
**Task:** Build the primary navigation component
- Read `COMPONENT_INVENTORY.md` for the navigation spec
- Build with exact design token values from `DESIGN_TOKENS.md`
- Include all nav items, icons, active states
- Responsive behavior: sidebar on desktop, bottom bar or drawer on mobile
- Sticky positioning per `LAYOUT_ARCHITECTURE.md`

### Agent 3: Primary Content Card
**Task:** Build the main content card component (tweet card, post card, list item — whatever the primary repeating unit is)
- This is usually the most important component — the one that appears dozens of times
- Match every detail: layout, spacing, typography, hover states, interaction buttons
- Include all variants documented in `COMPONENT_INVENTORY.md`
- Support mock data props

### Agent 4: User/Profile Elements
**Task:** Build user-related components (avatar, username display, user card, badges)
- Avatar component with all sizes documented
- Username/display name with verification badges if applicable
- User card (hover card, profile snippet)
- Any badge or indicator components

### Agent 5: Secondary UI Components
**Task:** Build remaining shared components
- Buttons (all variants: primary, secondary, ghost, icon-only)
- Input fields and forms
- Tabs and segmented controls
- Dropdown menus
- Tooltips and popovers
- Loading skeletons
- Toast notifications
- Modal/dialog wrapper
- Any other components from the inventory not covered above

## Phase 3: Page Assembly (Parallel — After Phase 2)

Wait for ALL Phase 2 agents to complete. Then launch page assembler agents:

### For each page in the target scope:

**Task:** Assemble the [PageName] page
- Create the route at `src/app/[route]/page.tsx`
- Wire up the layout grid per `LAYOUT_ARCHITECTURE.md`
- Import and compose all relevant components
- Connect mock data generators
- Implement page-level interactions:
  - Scroll behavior (infinite scroll, pagination)
  - Sticky elements
  - Page transitions
  - Loading states
- Responsive behavior at all documented breakpoints

Launch one agent per page, all in parallel.

## Phase 4: Polish & QA (Parallel — After Phase 3)

Launch QA agents against every completed page:

### For each page:

**Task:** QA the [PageName] page against reference documentation
- Compare every design token against `DESIGN_TOKENS.md`
- Verify all component states are implemented
- Check responsive behavior at each breakpoint from `LAYOUT_ARCHITECTURE.md`
- Verify interaction patterns match `INTERACTION_PATTERNS.md`
- Check animation timing and easing
- Report all discrepancies with specific fix suggestions

### Also launch:

**Task:** Full build verification
- Run `npm run build` — must pass with zero errors
- Run `npm run lint` — fix any issues
- Check TypeScript strict compliance — no `any` types
- Verify all imports resolve
- Check for unused code

## Phase 5: Integration & Final Review

After QA fixes are applied:
1. Do a final `npm run build` to verify everything compiles
2. Start the dev server and manually review each page
3. Create a summary of what was built:
   - Pages completed
   - Components built
   - Any known gaps or compromises
   - Recommended next steps (run `/customize` to add personal features)

## Agent Team Coordination Notes

- Each agent should read the shared documentation before starting
- Agents building components should check what other components already exist to maintain consistency
- Use the design tokens from `DESIGN_TOKENS.md` as the single source of truth — never hardcode colors/spacing
- If a component depends on another that isn't built yet, use a simple placeholder and note the dependency
- All agents should follow the code style defined in `CLAUDE.md`
