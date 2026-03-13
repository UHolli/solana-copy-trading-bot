# Website Reverse-Engineer Template

## What This Is
A reusable template for reverse-engineering any website and rebuilding it as a faithful clone using Claude Code. Fork this template, fill in the target website details, and follow the workflow.

## Quick Start
1. Copy this template to a new project folder
2. Update `TARGET.md` with your target website URL and scope
3. Run the inspection workflow with the `site-inspector` agent
4. Review and refine the captured design tokens and component inventory
5. Scaffold the project with `npm create next-app`
6. Build component-by-component using the `component-builder` agent
7. Assemble pages using the `page-assembler` agent
8. QA with the `design-qa` agent

## Tech Stack (Default — Adjust Per Project)
- **Framework:** Next.js 15 (App Router, React 19, TypeScript strict)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React (or match target site's icon set)
- **Mock Data:** Seeded generators in `src/lib/mock/`
- **Deployment:** Vercel

IMPORTANT: Inspect the target site first. If they use a different paradigm (e.g., Vue, Angular), consider whether to match their stack or use React anyway. For demo purposes, React/Next.js is almost always the right call.

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes, no inline styles
- 2-space indentation
- Responsive: mobile-first

## Design Principles
- **Pixel-perfect emulation** — match the target's spacing, colors, typography exactly
- **No personal aesthetic changes during emulation phase** — match 1:1 first, customize later
- **Demo-quality** — must look real but uses mock data throughout
- **Beauty-first** — every pixel matters

## Workflow Phases

### Phase 1: Inspection & Documentation
Use the `site-inspector` agent + Chrome MCP to crawl the target site. Output goes to `docs/research/`.

### Phase 2: Design System Extraction
Extract design tokens into `docs/research/DESIGN_TOKENS.md`. This becomes the source of truth for all component styling.

### Phase 3: Component Development
Build components one at a time in isolation. Use `component-builder` agent with worktree isolation. Each component gets fully polished before moving on.

### Phase 4: Page Assembly
Wire components into full pages. Use `page-assembler` agent. Connect mock data.

### Phase 5: QA & Polish
Run `design-qa` agent against every page. Fix discrepancies. Side-by-side screenshot comparison.

### Phase 6: Customization (Optional)
After the base emulation is complete, add your own features or design tweaks.

## Project Structure
```
src/
  app/              # Next.js routes (one folder per page)
  components/       # React components (organized by feature)
  lib/
    mock/           # Mock data generators
    utils/          # Shared utilities
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
docs/
  research/         # Inspection output (design tokens, components, layout, etc.)
  design-references/ # Screenshots and visual references
```

@docs/research/INSPECTION_GUIDE.md
@TARGET.md
