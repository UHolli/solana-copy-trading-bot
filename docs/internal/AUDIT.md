# Repository Audit — ai-website-cloner-template

> Internal engineering summary. Generated during production-readiness fork work.

## Current Architecture

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16 (App Router) | Standalone output for Docker |
| UI | React 19, shadcn/ui, Tailwind v4 | Minimal scaffold (Button only) |
| Language | TypeScript (strict) | One Node script still in `.mjs` |
| Agent tooling | Multi-platform skill sync | Source: `.claude/skills/clone-website/SKILL.md` |
| CI | GitHub Actions | lint → typecheck → build |
| Container | Docker multi-stage + compose | Dev bind-mount, prod standalone |

The application is intentionally a **starter shell**. Core value lives in agent skills and documentation that drive the `/clone-website` pipeline (reconnaissance → foundation → specs → parallel build → QA).

## Major Weaknesses

1. **No automated tests** — quality gates rely solely on lint, typecheck, and build.
2. **No persistence layer** — clone job metadata and cache state are ephemeral.
3. **Mixed module formats** — `scripts/sync-skills.mjs` is plain ESM while app code is TypeScript.
4. **`package-lock.json` tracked** — conflicts with reproducibility goals when lockfiles should be local-only.
5. **Loose TypeScript options** — `allowJs: true` without JS files in app code; missing `noUnusedLocals` / `noUnusedParameters`.
6. **No structured logging or config** — env vars undocumented beyond README prose.
7. **Docker healthcheck** — uses `wget` which may be absent in slim images.
8. **Placeholder directories missing** — `src/types`, `src/hooks`, `public/` referenced but not scaffolded.

## Recommended Improvements

1. Add Vitest with unit tests for cache and config modules.
2. Integrate optional Redis persistence for clone-session metadata.
3. Convert build scripts to TypeScript with dedicated `tsconfig.scripts.json`.
4. Tighten compiler options; remove `allowJs`.
5. Centralize configuration (`src/lib/config`) and logging (`src/lib/logger`).
6. Add typed error hierarchy for API and cache operations.
7. Ignore `package-lock.json`; document `npm install` workflow.
8. Redesign README with architecture/workflow Mermaid diagrams.
9. Add `.env.example` and Redis service to docker-compose.
10. Extend CI to run tests.
