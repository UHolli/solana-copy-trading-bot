# AI Website Clone Template

A reusable template for reverse-engineering any website and rebuilding it as a pixel-perfect clone using [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Point it at a URL, run `/clone-website`, and Claude Code will inspect the site via Chrome MCP, extract design tokens and assets, write component specs, and dispatch parallel builder agents to reconstruct every section — all in isolated git worktrees that merge automatically.

## Quick Start

1. **Use this template** — click "Use this template" on GitHub (or clone it)
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Edit `TARGET.md`** — set the URL, scope, and fidelity level for the site you want to clone
4. **Run the skill** in Claude Code:
   ```
   /clone-website <url>
   ```
5. **Customize** (optional) — after the base clone is built, modify as needed

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with Chrome MCP enabled (required for site inspection)

## Tech Stack

- **Next.js 16** — App Router, React 19, TypeScript strict
- **shadcn/ui** — Radix primitives + Tailwind CSS v4
- **Tailwind CSS v4** — oklch design tokens
- **Lucide React** — default icons (replaced by extracted SVGs during cloning)

## How It Works

The `/clone-website` skill runs a multi-phase pipeline:

1. **Reconnaissance** — screenshots, design token extraction, interaction sweep (scroll, click, hover, responsive)
2. **Foundation** — updates fonts, colors, globals, downloads all assets
3. **Component Specs** — writes detailed spec files (`docs/research/components/`) with exact computed CSS values, states, behaviors, and content
4. **Parallel Build** — dispatches builder agents in git worktrees, one per section/component
5. **Assembly & QA** — merges worktrees, wires up the page, runs visual diff against the original

Each builder agent receives the full component specification inline — exact `getComputedStyle()` values, interaction models, multi-state content, responsive breakpoints, and asset paths. No guessing.

## Project Structure

```
src/
  app/              # Next.js routes
  components/       # React components
    ui/             # shadcn/ui primitives
    icons.tsx       # Extracted SVG icons
  lib/utils.ts      # cn() utility
  types/            # TypeScript interfaces
  hooks/            # Custom React hooks
public/
  images/           # Downloaded images from target
  videos/           # Downloaded videos from target
  seo/              # Favicons, OG images
docs/
  research/         # Extraction output & component specs
  design-references/ # Screenshots
scripts/            # Asset download scripts
TARGET.md           # Clone target configuration
AGENTS.md           # Agent instructions & code style
```

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint check
```

## Configuration

Edit **`TARGET.md`** before cloning:

- **URL** — the site to reverse-engineer
- **Pages** — which pages to replicate
- **Fidelity** — pixel-perfect, high fidelity, or structural
- **Scope** — what's in/out of scope
- **Customization plans** — modifications to apply after the base clone

## License

MIT
