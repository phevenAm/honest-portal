/** biome-ignore-all lint/suspicious/noConsole: intentional console output for CLI tool */
// sync-tokens.js
// Reads $variables from SCSS token files and syncs them as CSS custom
// properties into the :root and .dark blocks in src/index.scss

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SCSS_FILES = ["src/styles/_colors.scss", "src/styles/_spacing.scss", "src/styles/_typography.scss"];

const INDEX_SCSS = "src/index.scss";

// ── 1. Parse all $variable: value pairs from SCSS files ───
function parseScssVars(filePath) {
  const content = readFileSync(filePath, "utf8");
  const vars = {};
  const regex = /^\$([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm;
  let match;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop pattern
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    const value = match[2].trim();
    // Skip variables that reference other variables (e.g. $color-accent: $teal-600)
    // we only want leaf values
    if (!value.startsWith("$")) {
      vars[name] = value;
    }
  }
  return vars;
}

// ── 2. Convert $variable-name to --variable-name ──────────
function toCssVar(name) {
  return `--${name}`;
}

// ── 3. Build the new var block lines ──────────────────────
function buildVarLines(vars, indent = "  ") {
  return Object.entries(vars)
    .map(([name, value]) => `${indent}${toCssVar(name)}: ${value};`)
    .join("\n");
}

// ── 4. Replace or insert a block in index.scss ────────────
function replaceBlock(content, selector, newVars) {
  // Match :root { ... } or .dark { ... }
  const escapedSelector = selector.replace(".", "\\.");
  const blockRegex = new RegExp(`(${escapedSelector}\\s*\\{)([^}]*)(\\})`, "s");

  const newLines = buildVarLines(newVars);

  if (blockRegex.test(content)) {
    // Replace existing block contents
    return content.replace(blockRegex, (_, open, _existing, close) => {
      return `${open}\n${newLines}\n${close}`;
    });
  }
  // Append new block at end
  return `${content}\n\n${selector} {\n${newLines}\n}\n`;
}

// ── 5. Main ───────────────────────────────────────────────
function main() {
  // Collect all vars
  const allVars = {};
  for (const file of SCSS_FILES) {
    const fullPath = join(process.cwd(), file);
    if (!existsSync(fullPath)) {
      console.warn(`⚠️  Not found, skipping: ${file}`);
      continue;
    }
    const vars = parseScssVars(fullPath);
    Object.assign(allVars, vars);
    console.log(`✓ Parsed ${Object.keys(vars).length} variables from ${file}`);
  }

  // Separate dark vars from the rest
  const darkVars = {};
  const rootVars = {};

  for (const [name, value] of Object.entries(allVars)) {
    if (name.startsWith("dark-")) {
      darkVars[name] = value;
    } else {
      rootVars[name] = value;
    }
  }

  // Read index.scss
  const indexPath = join(process.cwd(), INDEX_SCSS);
  if (!existsSync(indexPath)) {
    console.error(`❌ Could not find ${INDEX_SCSS}`);
    process.exit(1);
  }

  let content = readFileSync(indexPath, "utf8");

  // Sync :root
  content = replaceBlock(content, ":root", rootVars);
  console.log(`✓ Synced ${Object.keys(rootVars).length} variables to :root`);

  // Sync .dark
  content = replaceBlock(content, ".dark", darkVars);
  console.log(`✓ Synced ${Object.keys(darkVars).length} variables to .dark`);

  // Write back
  writeFileSync(indexPath, content, "utf8");
  console.log(`✅ Done — ${INDEX_SCSS} updated`);
}

main();
