---
name: reverse-engineer
description: Full reverse-engineering workflow for the target website. Inspects, documents, and scaffolds the project.
---

Reverse-engineer the target website defined in TARGET.md:

1. Read TARGET.md to understand scope and fidelity requirements
2. Use the site-inspector agent to inspect the target URL via Chrome MCP
3. Review and organize all findings in docs/research/
4. Extract design tokens into DESIGN_TOKENS.md
5. Create component inventory in COMPONENT_INVENTORY.md
6. Document layout architecture in LAYOUT_ARCHITECTURE.md
7. Scaffold the Next.js project if not already done
8. Configure Tailwind with extracted design tokens
9. Report summary of findings and recommended build order
