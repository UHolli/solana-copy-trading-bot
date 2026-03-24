---
name: clone-website
description: Reverse-engineer and clone a website in one shot — extracts assets, CSS, and content section-by-section and proactively dispatches parallel builder agents in worktrees as it goes. Use this whenever the user wants to clone, replicate, rebuild, reverse-engineer, or copy any website. Also triggers on phrases like "make a copy of this site", "rebuild this page", "pixel-perfect clone". Provide the target URL as an argument.
argument-hint: "<url>"
user-invocable: true
---

# Clone Website

You are about to reverse-engineer and rebuild **$ARGUMENTS** as a pixel-perfect clone.

This is not a two-phase process (inspect then build). You are a **foreman walking the job site** — as you inspect each section of the page, you immediately hand it off to a specialist builder agent with everything they need. Extraction and construction happen in parallel.

## Pre-Flight

1. **Chrome MCP is required.** Test it immediately. If it's not available, stop and tell the user to enable it — this skill cannot work without browser automation.
2. Read `TARGET.md` for URL and scope. If the URL doesn't match `$ARGUMENTS`, update it.
3. Verify the base project builds: `npm run build`. The Next.js + shadcn/ui + Tailwind v4 scaffold should already be in place. If not, tell the user to set it up first.
4. Create the output directories if they don't exist: `docs/research/`, `docs/design-references/`, `scripts/`.

## Guiding Principles

These are the truths that separate a successful clone from a "close enough" mess. Internalize them — they should inform every decision you make.

### 1. Completeness Beats Speed

Every builder agent must receive **everything** it needs to do its job perfectly: screenshot, exact CSS values, downloaded assets with local paths, real text content, component structure. If a builder has to guess anything — a color, a font size, a padding value — you have failed at extraction. Take the extra minute to extract one more property rather than shipping an incomplete brief.

### 2. Small Tasks, Perfect Results

When an agent gets "build the entire features section," it glosses over details — it approximates spacing, guesses font sizes, and produces something "close enough" but clearly wrong. When it gets a single focused component with exact CSS values, it nails it every time.

Look at each section and judge its complexity. A simple banner with a heading and a button? One agent. A complex section with 3 different card variants, each with unique hover states and internal layouts? One agent per card variant plus one for the section wrapper. When in doubt, make it smaller.

### 3. Real Content, Real Assets

Extract the actual text, images, videos, and SVGs from the live site. This is a clone, not a mockup. Use `element.textContent`, download every `<img>` and `<video>`, extract inline `<svg>` elements as React components. The only time you generate content is when something is clearly server-generated and unique per session.

### 4. Foundation First

Nothing can be built until the foundation exists: global CSS with the target site's design tokens (colors, fonts, spacing), TypeScript types for the content structures, and global assets (fonts, favicons). This is sequential and non-negotiable. Everything after this can be parallel.

### 5. Extract Exact CSS — Never Eyeball It

Use `getComputedStyle()` via Chrome MCP JavaScript execution for every element. Not "it looks like 16px" — extract the actual computed value. Every font size, font weight, line height, letter spacing, color, padding, margin, gap, border radius, box shadow, background, display, flex direction, position, z-index, width, height, max-width, overflow, opacity, transform, transition. The precision of your CSS extraction directly determines the quality of the clone.

### 6. Build Must Always Compile

Every builder agent must verify `npx tsc --noEmit` passes before finishing. After merging worktrees, you verify `npm run build` passes. A broken build is never acceptable, even temporarily.

## Phase 1: Reconnaissance

Navigate to the target URL with Chrome MCP.

### Screenshots
- Take **full-page screenshots** at desktop (1440px) and mobile (390px) viewports
- Save to `docs/design-references/` with descriptive names
- These are your master reference — builders will receive section-specific crops/screenshots later

### Global Extraction
Extract these from the page before doing anything else:

**Fonts** — Inspect `<link>` tags for Google Fonts or self-hosted fonts. Check computed `font-family` on key elements (headings, body, code, labels). Document every family, weight, and style actually used. Configure them in `src/app/layout.tsx` using `next/font/google` or `next/font/local`.

**Colors** — Extract the site's color palette from computed styles across the page. Update `src/app/globals.css` with the target's actual colors in the `:root` and `.dark` CSS variable blocks. Map them to shadcn's token names (background, foreground, primary, muted, etc.) where they fit. Add custom properties for colors that don't map to shadcn tokens.

**Favicons & Meta** — Download favicons, apple-touch-icons, OG images, webmanifest to `public/seo/`. Update `layout.tsx` metadata.

**Global UI patterns** — Identify any site-wide CSS: custom scrollbar hiding, scroll-snap on the page container, global keyframe animations, backdrop filters, gradients used as overlays. Add these to `globals.css`.

### Page Topology
Map out every distinct section of the page from top to bottom. Give each a working name. Document:
- Their visual order
- Which are fixed/sticky overlays vs. flow content
- The overall page layout (scroll container, column structure, z-index layers)
- Dependencies between sections (e.g., a floating nav that overlays everything)

Save this as `docs/research/PAGE_TOPOLOGY.md` — it becomes your assembly blueprint.

## Phase 2: Foundation Build

This is sequential. Do it yourself (not delegated to an agent) since it touches many files:

1. **Update fonts** in `layout.tsx` to match the target site's actual fonts
2. **Update globals.css** with the target's color tokens, spacing values, keyframe animations, and utility classes
3. **Create TypeScript interfaces** in `src/types/` for the content structures you've observed
4. **Extract SVG icons** — find all inline `<svg>` elements on the page, deduplicate them, and save as named React components in `src/components/icons.tsx`. Name them by visual function (e.g., `SearchIcon`, `ArrowRightIcon`, `LogoIcon`).
5. **Download global assets** — write and run a Node.js script (`scripts/download-assets.mjs`) that downloads all images, videos, and other binary assets from the page to `public/`. Preserve meaningful directory structure.
6. Verify: `npm run build` passes

### Asset Discovery Script Pattern

Use Chrome MCP to enumerate all assets on the page:

```javascript
// Run this via Chrome MCP to discover all assets
JSON.stringify({
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName + '.' + el.className?.split(' ')[0]
  })),
  svgCount: document.querySelectorAll('svg').length,
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).fontFamily))],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }))
});
```

Then write a download script that fetches everything to `public/`. Use batched parallel downloads (4 at a time) with proper error handling.

## Phase 3: Section-by-Section Extract & Dispatch

This is the core loop. For each section in your page topology (top to bottom):

### Extract

1. **Screenshot** the section in isolation (scroll to it, screenshot the viewport). Save to `docs/design-references/`.

2. **Extract CSS** for every element in the section using `getComputedStyle()`. Be exhaustive:
   - Text elements: fontSize, fontWeight, fontFamily, lineHeight, letterSpacing, color, textTransform
   - Containers: display, flexDirection, justifyContent, alignItems, gap, padding, margin, width, height, maxWidth, minHeight, background, borderRadius, border, boxShadow, overflow, position, zIndex
   - Interactive elements: all the above + hover/active/focus state changes, cursor, transition, transform
   - Images/videos: objectFit, borderRadius, width, height, any mix-blend-mode or filter

3. **Extract real content** — all text, alt attributes, aria labels, placeholder text. Use `element.textContent` for each text node.

4. **Identify assets** this section uses — which downloaded images/videos from `public/`, which icon components from `icons.tsx`.

5. **Assess complexity** — how many distinct sub-components does this section contain? A distinct sub-component is an element with its own unique styling, structure, and behavior (e.g., a card, a nav item, a search panel).

### Dispatch

Based on complexity, dispatch builder agent(s) in worktree(s):

**Simple section** (1-2 sub-components): One builder agent gets the entire section.

**Complex section** (3+ distinct sub-components): Break it up. One agent per sub-component, plus one agent for the section wrapper that imports them. Sub-component builders go first since the wrapper depends on them.

**What every builder agent receives:**
- Path to the section screenshot in `docs/design-references/`
- The complete CSS spec for every element (exact values, not approximations)
- Which assets to use (local paths in `public/`)
- The actual text content (not descriptions of text)
- Which shared components to import (`icons.tsx`, `cn()`, shadcn primitives)
- TypeScript interface for props (if applicable)
- The target file path (e.g., `src/components/HeroSection.tsx`)
- Instruction to verify with `npx tsc --noEmit` before finishing

**Don't wait.** As soon as you've dispatched the builder(s) for one section, move to extracting the next section. Builders work in parallel in their worktrees while you continue extraction.

### Merge

As builder agents complete their work:
- Merge their worktree branches into main
- You have full context on what each agent built, so resolve any conflicts intelligently
- After each merge, verify the build still passes: `npm run build`
- If a merge introduces type errors, fix them immediately

The extract → dispatch → merge cycle continues until all sections are built.

## Phase 4: Page Assembly

After all sections are built and merged, wire everything together in `src/app/page.tsx`:

- Import all section components
- Implement the page-level layout from your topology doc (scroll containers, column structures, sticky positioning, z-index layering)
- Connect real content to component props
- Implement page-level behaviors: scroll snap, scroll-driven animations, dark-to-light transitions, intersection observers
- Verify: `npm run build` passes clean

## What NOT to Do

These are lessons from previous failed attempts:

- **Don't build mockup components for content that's actually videos/animations.** Check if a section uses `<video>`, Lottie, or canvas before building elaborate HTML mockups of what the video shows.
- **Don't approximate CSS classes.** "It looks like `text-lg`" is wrong if the computed value is `18px` and `text-lg` is `18px/28px` but the actual line-height is `24px`. Extract exact values.
- **Don't build everything in one monolithic commit.** The whole point of this pipeline is incremental progress with verified builds at each step.
- **Don't reference docs from builder prompts.** Each builder gets the CSS spec inline in its prompt — never "see DESIGN_TOKENS.md for colors." The builder should have zero need to read external docs.
- **Don't skip asset extraction.** Without real images, videos, and fonts, the clone will always look fake regardless of how perfect the CSS is.
- **Don't give a builder agent too much scope.** If you're writing a builder prompt and it's getting long because the section is complex, that's a signal to break it into smaller tasks.

## Completion

When done, report:
- Total sections built
- Total components created
- Total assets downloaded (images, videos, SVGs, fonts)
- Build status (`npm run build` result)
- Any known gaps or limitations
