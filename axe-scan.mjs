import { chromium } from "@playwright/test";
import { injectAxe, getViolations } from "axe-playwright";

const BASE = "http://localhost:5174";
let totalViolations = 0;

async function scan(page, label) {
  await injectAxe(page);
  const violations = await getViolations(page);
  if (violations.length === 0) {
    console.log(`✓ ${label}`);
  } else {
    totalViolations += violations.length;
    for (const v of violations) {
      console.log(`\n[${v.impact?.toUpperCase()}] ${label} — ${v.id}: ${v.description}`);
      for (const node of v.nodes) {
        console.log(`  Target: ${node.target.join(", ")}`);
        console.log(`  Fix:    ${node.failureSummary?.split("\n")[0]}`);
      }
    }
  }
}

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 15000 });
}

async function dismissOnboarding(page) {
  try {
    await page.waitForSelector('[role="dialog"]', { timeout: 2000 });
    // Click Save (step 1 for admin) or Skip (step 2 for client)
    const saveBtn = page.locator('button:has-text("Save")').first();
    const skipBtn = page.locator('button:has-text("Skip")').first();
    if (await saveBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await saveBtn.click();
    } else if (await skipBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipBtn.click();
    }
    await page.waitForTimeout(600);
  } catch { /* no onboarding modal */ }
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
  await dismissOnboarding(page);
}

async function tryOpenModal(page, triggerText, label) {
  await dismissOnboarding(page);
  try {
    await page.click(`button:has-text("${triggerText}")`, { timeout: 4000 });
    await page.waitForTimeout(600);
    await scan(page, label);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  } catch {
    console.log(`  (skipped: "${triggerText}" not available)`);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// ── Public pages ──────────────────────────────────────────────────────────────
console.log("\n── Public pages ─────────────────────────────────────");
for (const path of ["/login", "/signup"]) {
  await goto(page, path);
  await scan(page, path);
}

// ── Admin pages ───────────────────────────────────────────────────────────────
console.log("\n── Admin pages ──────────────────────────────────────");
await login(page, "demo-admin@honest.com", "DemoAdmin2026");

// Static pages
for (const path of ["/admin", "/admin/clients", "/admin/questionnaires", "/admin/resources", "/admin/audit-logs", "/admin/scheduler"]) {
  await goto(page, path);
  await scan(page, path);
}

// Admin modals
console.log("\n── Admin modals ─────────────────────────────────────");

await goto(page, "/admin/questionnaires");
await tryOpenModal(page, "+ New check-in", "/admin/questionnaires — new check-in modal");

await goto(page, "/admin");
await tryOpenModal(page, "+ Todo", "/admin — new todo modal");

// ── Client pages ──────────────────────────────────────────────────────────────
console.log("\n── Client pages ─────────────────────────────────────");
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('input[type="email"]', { timeout: 10000 });
await login(page, "demo-client@honest.com", "DemoClient2026");

for (const path of ["/dashboard", "/check-in", "/resources", "/my-sessions", "/settings"]) {
  await goto(page, path);
  await scan(page, path);
}

// Client modals
console.log("\n── Client modals ────────────────────────────────────");

await goto(page, "/resources");
try {
  const card = page.locator('button:has-text("Read"), button:has-text("Watch")').first();
  if (await card.isVisible({ timeout: 2000 })) {
    await card.click();
    await page.waitForTimeout(500);
    await scan(page, "/resources — resource modal");
    await page.keyboard.press("Escape");
  }
} catch { console.log("  (skipped: no resource cards)"); }

await browser.close();

if (totalViolations > 0) {
  console.log(`\n❌ ${totalViolations} accessibility violation(s) found. Fix them before pushing.\n`);
  process.exit(1);
}
console.log("\n✓ No accessibility violations found.\n");
