---
name: reverse-engineer
description: Reverse-engineer a website using Chrome MCP — crawl it, extract ALL assets (videos, images, SVGs, fonts, favicons), extract exact CSS computed styles for every element, document every component with pixel-perfect precision, and produce a complete build specification. Use this whenever the user wants to clone, replicate, rebuild, or reverse-engineer any website. Provide the target URL as an argument.
argument-hint: "<url> [brief description of what to emulate]"
user-invocable: true
---

# Reverse-Engineer a Website

You are about to reverse-engineer **$ARGUMENTS** into a comprehensive, pixel-perfect build specification.

The goal is to extract EVERYTHING needed to build a perfect clone — not approximations, not summaries, but exact values. Every font size, every padding value, every color, every asset. When agents later build from this spec, they should never have to guess.

## Why Precision Matters

Previous attempts at reverse-engineering produced specs that were "close enough" — documenting "large heading" instead of "48px/500/48px-line-height Geist font", or "some padding" instead of "padding: 64px 40px 32px 0". This led to clones that looked roughly similar but were clearly off in spacing, typography, and positioning. The fix is simple: extract exact computed CSS values for every element, not eyeball approximations.

## Phase 1: Preparation

1. Read `TARGET.md` if it exists — check if scope and fidelity are already defined
2. Read `docs/research/INSPECTION_GUIDE.md` for the inspection checklist
3. If TARGET.md doesn't exist or doesn't match the URL, create/update it
4. Create the output directory structure: `docs/research/`, `docs/design-references/`

## Phase 2: Asset Extraction (Do This FIRST)

Before documenting anything, extract ALL real assets from the target site. This is the single most impactful step — without real assets, the clone will always look fake.

### 2a: Discover All Assets

Use Chrome MCP JavaScript execution to find every asset on the page:

```javascript
// Run this on each page to discover all assets
const assets = {
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc,
    srcset: img.srcset,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    context: img.closest('[class]')?.className?.substring(0, 100)
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted,
    context: v.closest('[class]')?.className?.substring(0, 100)
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName,
    context: el.className?.substring(0, 100)
  })),
  fonts: [...document.querySelectorAll('link[rel*="font"], link[href*="font"]')].map(l => l.href),
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({
    href: l.href,
    type: l.type,
    sizes: l.sizes?.toString()
  })),
  ogImages: [...document.querySelectorAll('meta[property*="image"]')].map(m => m.content)
};
```

### 2b: Download All Assets

Write a Node.js download script (`scripts/download-assets.mjs`) that:
1. Downloads every discovered image, video, SVG, font, favicon, and OG image
2. Preserves the original directory structure under `public/`
3. Uses batched parallel downloads (4 at a time to avoid overwhelming the server)
4. Logs each download's status
5. Handles Next.js `/_next/image` URLs by extracting the original `url` parameter

### 2c: Extract SVG Icons

Many sites use inline SVGs for icons. Extract them individually:
1. Use Chrome MCP to find all `<svg>` elements
2. Extract each unique SVG's markup
3. Save as React components in `src/components/icons.tsx`
4. Name them based on their visual function (e.g., `SearchIcon`, `ArrowRightIcon`)

### 2d: Identify and Download Fonts

1. Check `<link>` tags for Google Fonts or self-hosted fonts
2. Inspect computed `font-family` on key elements
3. Document every font family, weight, and style used
4. For Google Fonts: note the exact import URL with all weights
5. For self-hosted: download the font files

### 2e: Video Configuration

For each video on the site, document:
- Source URL and file format
- Autoplay, loop, muted settings
- Poster image (if any)
- CSS styling (border-radius, max-width, object-fit)
- Which section/component it belongs to
- Lazy loading behavior (eager vs. intersection-observer)

### 2f: Create Asset Manifest

Write `docs/research/ASSET_MANIFEST.md` listing every asset with:
- Original URL
- Local path in `public/`
- Which component uses it
- Dimensions (for images/videos)
- Any special rendering (mix-blend-mode, object-fit, etc.)

## Phase 3: Exact CSS Extraction

This is where precision matters most. For EVERY distinct element on the page, extract exact computed CSS values using Chrome MCP JavaScript execution.

### 3a: Page-Level Layout

Extract the overall page structure with exact measurements:

```javascript
// For each major container element, extract:
const el = document.querySelector('.some-container');
const cs = getComputedStyle(el);
const data = {
  classes: el.className,
  display: cs.display,
  flexDirection: cs.flexDirection,
  position: cs.position,
  width: cs.width,
  maxWidth: cs.maxWidth,
  height: cs.height,
  padding: cs.padding,
  margin: cs.margin,
  gap: cs.gap,
  overflow: cs.overflow,
  zIndex: cs.zIndex,
  // For sticky elements:
  top: cs.top,
  // For backgrounds:
  background: cs.background,
  borderRadius: cs.borderRadius,
  border: cs.border,
  boxShadow: cs.boxShadow,
};
```

### 3b: Component-Level Extraction

For each component, extract a COMPLETE CSS specification. Don't summarize — list every property:

**For text elements:**
- `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing`
- `color`, `textTransform`, `textDecoration`
- `margin`, `padding`

**For container elements:**
- `display`, `flexDirection`, `justifyContent`, `alignItems`, `gap`
- `width`, `height`, `maxWidth`, `minHeight`
- `padding`, `margin`
- `background`, `backgroundColor`
- `borderRadius`, `border`, `boxShadow`
- `overflow`, `position`, `zIndex`

**For interactive elements:**
- All of the above, plus hover/active/focus states
- `cursor`, `transition`, `transform`

### 3c: Document in Atomic Detail

For each component, create a spec that looks like this:

```markdown
## ComponentName

### Container
- Classes: `relative flex flex-col pl-5 snap-start scroll-mt-[68px] h-screen`
- CSS: display:flex, flex-direction:column, padding-left:20px, scroll-snap-align:start, height:100vh

### Title (h3)
- Classes: `font-geist text-4xl font-medium`
- CSS: font-family:Geist, font-size:36px, font-weight:500, line-height:40px, color:#EDEDED
- Margin: 0

### Description (p)
- Classes: `pr-10 font-geist text-base`
- CSS: font-size:16px, font-weight:400, line-height:24px, padding-right:40px, color:#EDEDED

### Video Container
- Classes: `relative flex-1 overflow-hidden`
- Video element: border-radius:19px 19px 0 0, object-fit:contain, max-width:100%
```

This level of detail is what makes the difference between a "close enough" clone and a pixel-perfect one.

## Phase 4: Component Inventory (Atomic Breakdown)

Break the site into the SMALLEST possible components. Don't lump things together. Each component should be independently buildable and verifiable.

### Component Decomposition Rules:
1. If an element has distinct styling, it's a separate component
2. If an element repeats with variations, document each variation
3. If an element has interactive states, document every state
4. If an element behaves differently at breakpoints, document each breakpoint
5. Navigation, headers, footers, cards, buttons, inputs — each is its own spec

### For each atomic component, document:

```markdown
## ComponentName

**File path:** `src/components/ComponentName.tsx`
**Props:** list every prop with type

### Exact CSS Spec (Desktop)
[Exhaustive list of every CSS property, extracted via getComputedStyle]

### Exact CSS Spec (Tablet — if different)
[Only properties that change]

### Exact CSS Spec (Mobile — if different)
[Only properties that change]

### States
- Default: [exact CSS]
- Hover: [exact CSS changes]
- Active: [exact CSS changes]
- Disabled: [exact CSS changes]

### Assets Used
- Image: `/images/some-image.png` (downloaded to public/)
- Icon: `SearchIcon` from icons.tsx
- Video: `/videos/some-video.mp4`

### Children
- Lists child components this component contains

### Animation/Transitions
- Transition properties, duration, easing
- Any keyframe animations with exact values
```

## Phase 5: Layout Architecture

Document the page layout with exact measurements, not descriptions:

```markdown
## Page: Home

### Scroll Container
- ID: `new-landing-scroll-root`
- Classes: `light h-screen overflow-y-auto overflow-x-hidden snap-y snap-mandatory`

### Two-Column Layout
- Container: max-width:1600px, display:flex, flex-direction:row (desktop)
- Left column: width:512px, position:sticky, top:0, max-height:100vh
- Right column: flex-grow:1, background:rgba(0,0,0,0.1)

### Section Heights
- First section: height:100vh
- Other sections: height:calc(100vh - 68px)
- Sticky header: height:69px, position:sticky, top:0

### Z-Index Map
1. z-50: Floating nav bar, sticky headers
2. z-40: Left column (hero sidebar)
3. z-20: Fade gradients
4. z-10: Right column, white section
5. z-0: Background gradients
```

## Phase 6: Build Plan (Atomic Tasks)

Create `docs/research/BUILD_PLAN.md` with tasks broken into the SMALLEST possible units. Each task should take a single agent no more than a few minutes.

```markdown
## Build Order

### Foundation (Sequential)
1. Project scaffold (Next.js, Tailwind, fonts, global CSS)
2. Design tokens (CSS variables, theme config)
3. TypeScript interfaces

### Asset Integration
4. Download all binary assets (images, videos, favicons)
5. Extract all SVG icons as React components
6. Configure favicon and OG image metadata

### Atomic Components (Parallel — one agent per component)
7. DimensionLogo icon component
8. ArrowRightIcon component
9. FrostBorderButton component
10. FloatingNavBar component
11. BackgroundGradient component (with real hero images)
12. HeroSection (text + bullets + CTA)
13. UseCaseNavList (vertical list in hero sidebar)
14. UseCaseContextHeader (sticky gradient header)
15. UseCaseSection (section wrapper with title + description + video area)
16. UseCaseVideo (lazy-loaded video player)
17. SearchTabPanel (search feature card content)
18. FeatureCard (individual feature card)
... (continue for every component)

### Page Assembly (After components)
19. Wire Home page layout (page.tsx)
20. Connect mock data to components
21. Configure scroll snap behavior
22. Wire up scroll spy + section tracking

### QA (After assembly)
23. Side-by-side screenshot comparison per section
24. CSS value verification per component
25. Responsive behavior check at 3 breakpoints
26. Animation/interaction verification
```

## Phase 7: Verification Protocol

After documenting everything, do a completeness check:

1. **Asset completeness:** Every image, video, SVG, and font from the original is downloaded locally
2. **CSS completeness:** Every element has exact computed styles, not approximations
3. **Component completeness:** Every UI element is documented as an atomic component
4. **Layout completeness:** Page structure has exact measurements at every breakpoint
5. **Interaction completeness:** Every hover, click, scroll, and transition is documented

## Output

When done, summarize:
- Total assets downloaded (images, videos, SVGs, fonts, favicons)
- Components inventoried (with exact CSS specs)
- Design tokens extracted
- Pages documented
- Recommended next step: run `/build-from-spec`
