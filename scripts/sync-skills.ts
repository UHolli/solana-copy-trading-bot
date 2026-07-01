#!/usr/bin/env node

/**
 * Generates clone-website command/skill files for all supported AI coding platforms.
 * Source of truth: .claude/skills/clone-website/SKILL.md
 *
 * Usage: npx tsx scripts/sync-skills.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, ".claude", "skills", "clone-website", "SKILL.md");

const AUTO_GENERATED_HEADER =
  "<!-- AUTO-GENERATED from .claude/skills/clone-website/SKILL.md — do not edit directly.\n" +
  "     Run `npm run sync:skills` to regenerate. -->\n\n";

const SHORT_DESCRIPTION =
  "Reverse-engineer and clone any website as a pixel-perfect replica";

interface SkillDocument {
  body: string;
}

function parseSkillDocument(raw: string): SkillDocument {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Could not parse SKILL.md frontmatter");
  }
  return { body: match[2] };
}

function readSourceSkill(): string {
  try {
    return readFileSync(SOURCE, "utf8").replace(/\r\n/g, "\n");
  } catch {
    throw new Error(
      "Source skill not found at .claude/skills/clone-website/SKILL.md",
    );
  }
}

function writeGeneratedFile(relativePath: string, content: string): void {
  const fullPath = join(ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, "utf8");
  console.log(`  ✓ ${relativePath}`);
}

function withoutArguments(text: string): string {
  return text.replace(/\$ARGUMENTS/g, "the target URL provided by the user");
}

function main(): void {
  console.log("Syncing clone-website skill to all platforms...");
  console.log("  Source: .claude/skills/clone-website/SKILL.md\n");

  const raw = readSourceSkill();
  const { body } = parseSkillDocument(raw);

  writeGeneratedFile(".codex/skills/clone-website/SKILL.md", raw);
  writeGeneratedFile(".github/skills/clone-website/SKILL.md", raw);
  writeGeneratedFile(
    ".cursor/commands/clone-website.md",
    AUTO_GENERATED_HEADER + withoutArguments(body),
  );
  writeGeneratedFile(
    ".windsurf/workflows/clone-website.md",
    AUTO_GENERATED_HEADER + withoutArguments(body),
  );

  const geminiBody = body.replace(/\$ARGUMENTS/g, "{{args}}");
  writeGeneratedFile(
    ".gemini/commands/clone-website.toml",
    `# AUTO-GENERATED from .claude/skills/clone-website/SKILL.md\n` +
      `# Run \`npm run sync:skills\` to regenerate.\n\n` +
      `description = "${SHORT_DESCRIPTION}"\n` +
      `name = "clone-website"\n\n` +
      `prompt = '''\n${geminiBody}\n'''\n`,
  );

  writeGeneratedFile(
    ".opencode/commands/clone-website.md",
    `---\ndescription: "${SHORT_DESCRIPTION}"\n---\n${AUTO_GENERATED_HEADER}${body}`,
  );

  writeGeneratedFile(
    ".augment/commands/clone-website.md",
    `---\ndescription: "${SHORT_DESCRIPTION}"\nargument-hint: "<url>"\n---\n${AUTO_GENERATED_HEADER}${body}`,
  );

  writeGeneratedFile(
    ".continue/commands/clone-website.md",
    `---\nname: clone-website\ndescription: "${SHORT_DESCRIPTION}"\ninvokable: true\n---\n${AUTO_GENERATED_HEADER}${body}`,
  );

  writeGeneratedFile(
    ".amazonq/cli-agents/clone-website.json",
    JSON.stringify(
      {
        name: "clone-website",
        description: SHORT_DESCRIPTION,
        prompt: withoutArguments(body),
        fileContext: ["AGENTS.md", "docs/research/**"],
      },
      null,
      2,
    ) + "\n",
  );

  console.log("\nDone! 9 platform command files generated from source skill.");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
