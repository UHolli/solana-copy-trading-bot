---
name: reverse-engineer
description: Reverse-engineer a website using Chrome MCP — crawl it, extract design tokens, document every component, capture the full tech stack, and produce a complete build specification. Provide the target URL as an argument.
argument-hint: "<url> [brief description of what to emulate]"
user-invocable: true
---

# Reverse-Engineer a Website

You are about to reverse-engineer **$ARGUMENTS** into a comprehensive build specification.

This skill emulates the proven workflow from the `claude-code-users-globe` project, where Marc Lou's DataFast realtime globe was reverse-engineered into a 20KB technical blueprint that became the foundation for a pixel-perfect rebuild.

## Phase 1: Preparation

1. Read `TARGET.md` if it exists — check if scope and fidelity are already defined
2. Read `docs/research/INSPECTION_GUIDE.md` for the inspection checklist
3. If TARGET.md doesn't exist or doesn't match the URL provided, create/update it with:
   - The target URL
   - Initial scope assumptions (list all visible pages)
   - Default to pixel-perfect fidelity

## Phase 2: Site Crawl via Chrome MCP

Use the Chrome MCP browser tools to systematically inspect the target website. Work through each area methodically:

### 2a: Visual Audit
- Navigate to every distinct page/route on the site
- For each page, observe and document:
  - Overall layout structure (columns, sidebars, headers, footers)
  - Key UI components visible
  - Color scheme and visual tone
  - Typography choices
  - Spacing patterns

### 2b: Design Token Extraction
Inspect elements to extract exact values:
- **Colors:** Background (primary, secondary), text (primary, secondary, muted, link), accent/brand, border, hover states, error/success/warning. Get exact hex/rgb values.
- **Typography:** Font family (check `<link>` tags and computed styles), font sizes (every distinct size used), font weights, line heights, letter spacing
- **Spacing:** Identify the spacing scale (e.g., 4/8/12/16/24/32/48/64px). Check padding and margins on key elements.
- **Borders:** Border radius values (buttons, cards, avatars, inputs), border colors and widths
- **Shadows:** Box-shadow values on cards, dropdowns, modals
- **Breakpoints:** Resize the viewport to find where layout shifts occur

### 2c: Component Inventory
For each distinct UI component:
- Name it descriptively
- Document its HTML structure (what elements, nesting)
- List all variants (sizes, colors, states)
- Note interactive states (hover, active, focus, disabled)
- Identify child components it contains
- Note responsive behavior (how it changes at breakpoints)

### 2d: Layout Architecture
- Identify the grid system (CSS Grid, Flexbox, fixed widths)
- Document column layout at each breakpoint
- Find max-width constraints on content areas
- Identify sticky/fixed elements and their z-index
- Document scroll behavior (infinite scroll, pagination, virtual)

### 2e: Technical Stack Analysis
Inspect the page source and network tab:
- Check for framework indicators: `__NEXT_DATA__` (Next.js), `__NUXT__` (Nuxt), `ng-version` (Angular), React DevTools
- Inspect class names for CSS methodology: utility classes (Tailwind), BEM, CSS Modules, styled-components
- Check network tab for API patterns: REST endpoints, GraphQL queries
- Identify font loading: Google Fonts links, self-hosted, system fonts
- Check for state management: Redux DevTools, React Query, etc.
- Inspect image optimization: CDN patterns, lazy loading, srcset

### 2f: Interaction Patterns
- Hover effects on interactive elements
- Click/tap animations
- Page transition animations
- Loading states (skeletons, spinners, shimmer)
- Modal/dialog enter/exit animations
- Scroll-triggered effects
- Micro-interactions (like button animation, follow button state change)

## Phase 3: Document Everything

Write structured documentation files in `docs/research/`:

### `DESIGN_TOKENS.md`
```
# Design Tokens
## Colors
### Light Mode
- Background Primary: #___
- Background Secondary: #___
- Text Primary: #___
...
### Dark Mode (if applicable)
...
## Typography
- Font Family: ___
- Headings: ___px / weight ___
...
## Spacing Scale
- xs: ___px, sm: ___px, md: ___px, lg: ___px, xl: ___px
## Border Radius
...
## Shadows
...
## Breakpoints
...
```

### `COMPONENT_INVENTORY.md`
For each component:
```
## ComponentName
**Purpose:** What it does
**Structure:** HTML hierarchy
**Variants:** List all variants
**States:** default, hover, active, disabled, loading, error, empty
**Responsive:** How it changes at breakpoints
**Interactions:** Click, hover, focus behaviors
**Design Tokens Used:** Which colors, fonts, spacing it references
```

### `LAYOUT_ARCHITECTURE.md`
```
## Page: [Name]
**Desktop Layout:** [columns, widths, sticky elements]
**Tablet Layout:** [what changes]
**Mobile Layout:** [what changes]
**Sticky Elements:** [what sticks and at what scroll position]
**Z-Index Map:** [layering of overlapping elements]
```

### `INTERACTION_PATTERNS.md`
```
## [Pattern Name]
**Trigger:** What initiates it
**Animation:** Duration, easing, properties animated
**CSS/JS:** How it's likely implemented
```

### `TECH_STACK_ANALYSIS.md`
```
## Observed Stack
- Framework: ___
- CSS: ___
- State Management: ___
- API Pattern: ___
...

## Our Chosen Stack
- Framework: Next.js 15 (App Router)
- CSS: Tailwind CSS v4
- (fill in based on what makes sense)
...

## Mapping
| Their Approach | Our Equivalent |
|---|---|
```

## Phase 4: Build Plan

After all documentation is complete, create `docs/research/BUILD_PLAN.md`:

1. List components in dependency order (foundations first, composites last)
2. Group into parallel build tracks (what can be built simultaneously)
3. Identify the "secret sauce" — the one config/style detail that makes everything feel real (like Mapbox fog in the globe project)
4. Estimate mock data needs
5. Recommend build order for pages

## Output

When done, summarize:
- How many pages documented
- How many components inventoried
- Key design tokens extracted
- Tech stack identified vs. our chosen equivalents
- Recommended next step: run `/build-from-spec` to start implementation
