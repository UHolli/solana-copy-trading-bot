---
name: customize
description: Take a built website clone and apply custom features, design changes, or modifications to make it your own. Provide a description of the changes you want as an argument.
argument-hint: "<description of features or changes to apply>"
user-invocable: true
---

# Customize the Clone

You are about to customize this website clone with: **$ARGUMENTS**

This skill takes a faithfully emulated website and applies custom modifications — new features, design changes, branding updates, or functional additions — to make it the user's own product.

## Pre-Flight Checks

1. Verify the project has been built — check that `src/` contains components, pages, and the project builds cleanly with `npm run build`
2. Read `CLAUDE.md` for project context and design principles
3. Read `TARGET.md` to understand what was emulated and any planned customizations
4. Read the user's request carefully — understand exactly what changes they want

## Phase 1: Change Analysis

Before touching any code, analyze the requested changes:

1. **Categorize each change:**
   - **Visual/Design** — color changes, typography, layout tweaks, new theme
   - **Feature Addition** — new functionality not in the original site
   - **Feature Modification** — changing how an existing feature works
   - **Content/Branding** — replacing branding, copy, logos, identity
   - **Structural** — new pages, restructured navigation, new data models

2. **Impact Assessment:**
   - Which files need to change?
   - Do any changes conflict with each other?
   - Are there dependencies between changes (must do A before B)?
   - Do any changes require new dependencies or data models?

3. **Create a change plan** and present it to the user for approval before proceeding. Format:
   ```
   ## Proposed Changes

   ### Change 1: [Name]
   - Type: Visual / Feature / Structural
   - Files affected: [list]
   - Dependencies: [none / depends on Change X]
   - Approach: [brief description]

   ### Change 2: [Name]
   ...
   ```

## Phase 2: Implementation (Parallel Agent Team)

After the user approves the plan, launch agents to implement changes in parallel. Group changes by independence — changes that don't touch the same files can run simultaneously.

### For each independent change group, launch an agent:

**Task:** Implement [Change Name]
- Read the current state of all affected files
- Apply the change while preserving the existing design quality
- Maintain consistency with the design token system (update tokens if the change requires new colors/values)
- If adding a new feature:
  - Create TypeScript interfaces for any new data
  - Add mock data generators if needed
  - Build new components following established patterns
  - Wire into existing pages/routes
- If modifying existing features:
  - Understand the current implementation fully before changing
  - Keep the change minimal — don't refactor surrounding code
  - Preserve all existing states and responsive behavior
- Run `npm run build` after changes to verify nothing broke

### Design Changes — Special Handling

If the changes involve design/visual updates:
- Update `DESIGN_TOKENS.md` if design tokens are changing
- Update the Tailwind config if theme values change
- Propagate color/typography changes consistently across ALL components that use the old values
- Don't just change one component — if the brand color changes, it changes everywhere

### Feature Additions — Special Handling

If adding entirely new features:
- Create new components in `src/components/` following established patterns
- Add new routes in `src/app/` if needed
- Create mock data generators for new data types
- Add navigation links if the feature has its own page
- Consider the feature's responsive behavior from the start

## Phase 3: QA & Verification

After all changes are implemented:

1. **Build check:** `npm run build` must pass cleanly
2. **Visual consistency:** Launch a QA agent to verify:
   - New/changed components match the project's design language
   - No visual regressions in unchanged components
   - Responsive behavior works at all breakpoints
   - Dark/light mode both work (if applicable)
3. **Feature verification:** If new features were added:
   - All states work (default, hover, active, loading, error, empty)
   - Mock data populates correctly
   - Navigation to/from the feature works

## Phase 4: Documentation Update

After changes are verified:

1. Update `CLAUDE.md` if architectural decisions changed
2. Create or update `CUSTOMIZATIONS.md` documenting what was changed and why:
   ```
   # Customizations

   ## [Date] — [Change Description]
   - What: [what was changed]
   - Why: [user's reason]
   - Files: [key files modified]
   - Notes: [anything future-you should know]
   ```
3. If design tokens changed, ensure `DESIGN_TOKENS.md` reflects the new values

## Output

When done, summarize:
- Changes applied
- Files modified
- Any compromises or known issues
- Recommended follow-up actions
