# AI Website Cloner Template

A reusable template for reverse-engineering any website and rebuilding it as a pixel-perfect clone using [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Point it at a URL, run `/clone-website`, and Claude Code will inspect the site via Chrome MCP, extract design tokens and assets, write component specs, and dispatch parallel builder agents to reconstruct every section — all in isolated git worktrees that merge automatically.

## Demo

[![Watch the demo](docs/design-references/comparison.png)](https://youtu.be/O669pVZ_qr0)

> Click the image above to watch the full demo on YouTube.

## Quick Start

1. **Clone this repo**
   ```bash
   git clone https://github.com/JCodesMore/ai-website-cloner-template.git my-clone
   cd my-clone
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start Claude Code** with Chrome MCP enabled:
   ```bash
   claude --chrome
   ```
4. **Run the skill**:
   ```
   /clone-website <target-url>
   ```
5. **Customize** (optional) — after the base clone is built, modify as needed

> **Tip:** You can optionally edit `TARGET.md` before cloning to specify pages, fidelity level, and scope — but it's not required. The `/clone-website` skill will handle everything from just the URL.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

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

## Configuration (Optional)

Edit **`TARGET.md`** before cloning if you want fine-grained control:

- **Pages** — which pages to replicate (default: home page)
- **Fidelity** — pixel-perfect, high fidelity, or structural
- **Scope** — what's in/out of scope
- **Customization plans** — modifications to apply after the base clone

If you skip this, `/clone-website <url>` will default to a pixel-perfect clone of the home page. 

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=JCodesMore/ai-website-cloner-template&type=Date)](https://star-history.com/#JCodesMore/ai-website-cloner-template&Date)

## License

MIT
