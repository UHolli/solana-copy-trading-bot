---
name: build-from-spec
description: Read the reverse-engineering documentation and launch an agent team to build the full website clone from the spec. Scaffolds the project, creates mock data, builds components in parallel worktrees, assembles pages, and runs QA. Each agent gets ONE atomic component with its exact CSS spec — no guessing, no generalizing.
user-invocable: true
---

# Build From Spec

You are about to build a full website clone from the reverse-engineering documentation in `docs/research/`.

The key principle: **each agent gets ONE small, atomic task with ALL the exact CSS values it needs**. Agents should never need to guess or approximate. If a spec says "padding: 64px 40px 32px 0", that's what gets implemented — not "some padding".

## Why Small Tasks Matter

When agents get large tasks like "build the entire features section", they gloss over details — they approximate spacing, guess at font sizes, and produce layouts that are "close enough" but clearly wrong. When they get a single, atomic component with exact CSS values, they nail it every time. More agents doing smaller tasks = higher fidelity.

## Pre-Flight Checks

1. Read ALL files in `docs/research/`:
   - `DESIGN_TOKENS.md` — exact colors, typography, spacing values
   - `COMPONENT_INVENTORY.md` — every component with exact CSS specs
   - `LAYOUT_ARCHITECTURE.md` — page layouts with exact measurements
   - `INTERACTION_PATTERNS.md` — animations, transitions, hover states
   - `TECH_STACK_ANALYSIS.md` — their stack mapped to our equivalents
   - `BUILD_PLAN.md` — atomic task list in dependency order
   - `ASSET_MANIFEST.md` — all downloaded assets and where they go

2. If any of these are missing, STOP and tell the user to run `/reverse-engineer` first.

3. Read `CLAUDE.md` and `TARGET.md` for project context.

4. Verify that assets have been downloaded to `public/` — if the asset directories are empty, the assets need to be downloaded first (run the download script from the reverse-engineer phase).

## Phase 1: Foundation (Sequential — Must Complete First)

Launch a single agent to scaffold the project:

**Task: Project Scaffold**
- Initialize Next.js with App Router, TypeScript strict, Tailwind CSS
- Configure fonts (match exact fonts from DESIGN_TOKENS.md)
- Set up global CSS with:
  - CSS custom properties from the design tokens
  - Utility classes used by the original site (hide-scrollbar, frost effects, etc.)
  - All keyframe animations documented in INTERACTION_PATTERNS.md
- Create TypeScript interfaces in `src/types/` matching every data shape
- Install dependencies (Radix UI, Lucide, etc. per TECH_STACK_ANALYSIS.md)
- Verify: `npm run build` must pass

WAIT for this to complete before Phase 2.

## Phase 2: Mock Data + Icon Components (Parallel)

Launch 2-3 agents:

### Agent: Mock Data
- Create `src/lib/mock/index.ts` with all mock data
- Match the data shapes from the original site
- Include realistic content (names, messages, timestamps)
- Export clean typed API

### Agent: Icon Components
- Create `src/components/icons.tsx` with all SVG icons extracted during reverse-engineering
- Each icon is a typed React component accepting `className` prop
- Include: logos, UI icons, brand icons for integrations

### Agent: Shared UI Primitives
- Build the smallest shared components first: buttons, badges, tags
- Each with EXACT CSS from the component spec
- Example task for a button:
  ```
  Build FrostBorderButton:
  - Classes: inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-dm-sans text-sm font-medium text-[#161616]
  - Background: linear-gradient(#EEEEEE, #EEEEEE)
  - Border: 1px solid white
  - Backdrop-filter: blur(4px)
  - Hover: background changes to linear-gradient(#FFFFFF, #FFFFFF)
  - Props: children, className, onClick, href, showArrow (boolean)
  - When showArrow=true, render ArrowRightIcon after children
  ```

## Phase 3: Atomic Component Build (Parallel — Max Parallelism)

This is where the magic happens. Launch ONE agent per component, each in its own worktree. Each agent gets:

1. The exact component spec from COMPONENT_INVENTORY.md
2. The exact CSS values (not approximations)
3. The list of assets it needs (images, videos, icons)
4. The list of child components it depends on (which should already be built in Phase 2)

### Agent Task Template

For each component, the agent prompt should include:

```
Build the [ComponentName] component.

**File:** src/components/[ComponentName].tsx

**Exact CSS Spec:**
[Paste the COMPLETE CSS spec from COMPONENT_INVENTORY.md]

**Props:**
[List every prop with its TypeScript type]

**Assets:**
[List every image, video, or icon this component uses, with local paths]

**Children:**
[List child components to import]

**States:**
[List every interactive state with exact CSS changes]

**Responsive:**
[List breakpoint-specific changes]

Read the existing codebase first to understand imports, design tokens, and patterns.
Then build this ONE component to EXACTLY match the spec.
Run `npx tsc --noEmit` after to verify it compiles.
```

### Grouping Rules

- Components with NO dependencies on other custom components → launch first
- Components that depend on shared primitives → launch after Phase 2 completes
- Page-level components → launch after all their children are built

### Example Atomic Tasks

Instead of "Build the hero section", break it into:
1. `BackgroundGradient` — absolute-positioned gradient + hero background images
2. `HeroSection` — sticky sidebar with text, bullets, CTA, and use-case nav
3. `UseCaseContextHeader` — sticky gradient header for right column
4. `UseCaseSection` — section wrapper with title, description, video slot
5. `UseCaseVideo` — lazy-loaded video player with IntersectionObserver

Instead of "Build the features section", break it into:
1. `SearchTabPanel` — search results mockup with tab navigation
2. `FeatureCard` — individual feature card (search/everywhere/integrations variants)
3. `FeaturesSection` — horizontal scroll layout with left sidebar and card row

Each of these is a 2-3 minute task for an agent. Small tasks = perfect results.

## Phase 4: Page Assembly (After All Components)

Launch one agent per page to wire everything together:

**Task: Assemble [PageName]**
- The agent gets the EXACT page layout from LAYOUT_ARCHITECTURE.md
- It imports all the components built in Phase 3
- It wires up mock data from the data layer
- It implements page-level behaviors:
  - Scroll snap configuration
  - Scroll spy hooks
  - Section tracking
  - Dark-to-light transitions
- The agent gets the exact container classes and structure

Example for a home page:
```
Wire the Home page (src/app/page.tsx):

Scroll container: id="new-landing-scroll-root", classes="light h-screen overflow-y-auto overflow-x-hidden overscroll-none hide-scrollbar snap-y snap-mandatory"

Structure:
1. Fixed overlays: FloatingNavBar, TopFadeGradient, ScrollDimOverlay
2. Dark section wrapper: classes="relative isolate min-h-screen overscroll-none"
   - BackgroundGradient (absolute)
   - Flex container: classes="relative z-0 mx-auto flex min-h-screen w-full max-w-[100rem] flex-col overflow-clip lg:flex-row"
     - Left: HeroSection (sticky, 512px max-width)
     - Right: div.relative.z-10.grow.bg-black/10
       - UseCaseContextHeader (sticky)
       - 7x UseCaseSection with UseCaseVideo children
3. White section: classes="relative z-10 snap-start rounded-t-[40px] bg-white divide-y divide-black/10"
   - CTASection
   - FeaturesSection
   - Footer rounded bottom
   - FooterSection
```

## Phase 5: Visual QA (Critical — Don't Skip)

After assembly, launch QA agents that use Chrome MCP to do SIDE-BY-SIDE comparison:

### For each section of the page:

**Task: QA [SectionName]**
1. Open the ORIGINAL site in one tab
2. Open localhost clone in another tab
3. Screenshot both at the same viewport size
4. Compare element by element:
   - Font sizes match?
   - Spacing/padding match?
   - Colors match?
   - Border radius match?
   - Layout proportions match?
   - Images/videos present and correctly positioned?
5. Use Chrome MCP JavaScript to extract computed styles from BOTH sites and compare numerically
6. Report every discrepancy with:
   - Element identifier
   - Original value
   - Clone value
   - Fix needed (exact CSS change)

### Automated CSS Comparison Script

For critical elements, run this on both sites:
```javascript
const el = document.querySelector('.some-selector');
const cs = getComputedStyle(el);
JSON.stringify({
  fontSize: cs.fontSize,
  fontWeight: cs.fontWeight,
  lineHeight: cs.lineHeight,
  padding: cs.padding,
  margin: cs.margin,
  color: cs.color,
  backgroundColor: cs.backgroundColor,
  borderRadius: cs.borderRadius,
  width: cs.width,
  height: cs.height,
  gap: cs.gap,
  display: cs.display,
  flexDirection: cs.flexDirection
});
```

Compare the JSON outputs — any mismatch is a fix task.

## Phase 6: Fix Discrepancies

For each discrepancy found in QA:
1. Create a targeted fix task for an agent
2. The fix task includes: which file, which element, current value, target value
3. Agent makes the fix and verifies with `npx tsc --noEmit`
4. Re-run the comparison for that element to confirm the fix

## Agent Team Coordination

- Each agent gets COMPLETE information — never assume they'll figure it out
- Paste exact CSS values into every agent prompt — don't reference "see DESIGN_TOKENS.md"
- Each agent should verify its work compiles before finishing
- Merge worktree branches after each phase completes
- Resolve any merge conflicts with full context of what each agent built
- Build passes cleanly before moving to the next phase
