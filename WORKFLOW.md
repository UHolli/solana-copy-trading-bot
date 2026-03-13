# Reverse-Engineering Workflow

## The Complete Process

This documents the proven workflow for reverse-engineering a website, based on the `claude-code-users-globe` project where we successfully reverse-engineered DataFast's realtime globe visualization.

---

## Step 1: Set Your Target
1. Fill out `TARGET.md` with the URL, pages to replicate, and fidelity level
2. Decide scope — which pages, which interactions, what level of polish

## Step 2: Inspect the Site
1. Open the target site in Chrome
2. Use Chrome MCP (or manual DevTools inspection) to crawl every page
3. Launch the `site-inspector` agent to systematically document findings
4. Capture screenshots for `docs/design-references/`

**Agent command:**
```
Use the site-inspector agent to inspect [URL] and document all design tokens, components, layout patterns, and technical details.
```

## Step 3: Extract Design Tokens
1. Review `docs/research/DESIGN_TOKENS.md`
2. Verify color values, typography, spacing against the live site
3. Note any patterns (e.g., 4px spacing grid, consistent border-radius)
4. This file becomes the single source of truth for all styling

## Step 4: Scaffold the Project
1. Initialize Next.js: `npx create-next-app@latest . --typescript --tailwind --app --src-dir`
2. Configure Tailwind with extracted design tokens
3. Set up the project structure per CLAUDE.md
4. Install dependencies (icon library, font, etc.)
5. Create the base layout (sidebar, main, right panel)

## Step 5: Build Components (Parallel)
1. Prioritize core components (navigation, main content cards, user elements)
2. Launch `component-builder` agents in parallel worktrees — one per component
3. Each component should be self-contained with mock data
4. Review and merge completed components

**Agent command:**
```
Use the component-builder agent to build the [ComponentName] component matching the specs in docs/research/COMPONENT_INVENTORY.md
```

## Step 6: Build Mock Data
1. Launch `mock-data-generator` agent to create typed generators
2. Study real data shapes from inspection
3. Generators should produce realistic, seeded, deterministic data

## Step 7: Assemble Pages
1. Launch `page-assembler` agents — one per page
2. Wire components into full page layouts
3. Connect mock data generators
4. Implement page-level interactions (scroll, sticky, transitions)

## Step 8: QA & Polish
1. Launch `design-qa` agent against each page
2. Fix all reported discrepancies
3. Do manual side-by-side screenshot comparison
4. Polish animations, transitions, loading states
5. Test responsive behavior at all breakpoints

## Step 9: Customize (Optional)
1. Base emulation is complete — the clone should be visually faithful
2. Now add your own features, branding, or modifications
3. Keep the base components intact, extend rather than modify
4. Document your changes in a `CUSTOMIZATIONS.md`

---

## Tips from Prior Projects

- **Document BEFORE you code.** The inspection phase is critical. A thorough inspection doc saves 10x the time during implementation.
- **One component at a time.** Fully polish each component before moving on. Half-done components accumulate into an ugly whole.
- **Use worktree agents.** Parallel development with isolated worktrees prevents merge conflicts and lets you build faster.
- **Seeded mock data is magic.** Deterministic data (same seed = same output) makes debugging and screenshot comparison trivial.
- **Side-by-side comparison is your QA tool.** Open the real site and your clone side by side at every milestone.
- **Don't over-engineer the architecture.** For a demo clone, keep it simple. No need for elaborate state management or server-side data fetching.
- **The fog effect (atmosphere) matters.** In the globe project, the Mapbox fog configuration was the single biggest contributor to visual quality. Find your equivalent — the one CSS/config detail that makes everything feel real.
