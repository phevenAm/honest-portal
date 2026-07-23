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

async function setDarkMode(page, enabled) {
  await page.evaluate((dark) => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, enabled);
}

async function scanBothModes(page, label, scanFn) {
  await setDarkMode(page, false);
  await scanFn(`${label} [light]`);
  await setDarkMode(page, true);
  await scanFn(`${label} [dark]`);
  await setDarkMode(page, false);
}

async function dismissOnboarding(page) {
  try {
    await page.waitForSelector('[role="dialog"]', { timeout: 2000 });
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

async function scanWithModal(page, path, label, openSelector, closeSelector) {
  await goto(page, path);
  await scan(page, label);
  try {
    await page.click(openSelector, { timeout: 3000 });
    await page.waitForTimeout(400);
    await scan(page, `${label} — modal open`);
    if (closeSelector) await page.click(closeSelector, { timeout: 3000 }).catch(() => {});
  } catch {
    // modal trigger not available
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

// ── Public pages ──────────────────────────────────────────────────────────────
console.log("\n── Public pages ─────────────────────────────────────");
for (const path of ["/login", "/signup"]) {
  await scanBothModes(page, path, async (label) => {
    await goto(page, path);
    await scan(page, label);
  });
}

// ── Admin pages ───────────────────────────────────────────────────────────────
console.log("\n── Admin pages ──────────────────────────────────────");
await login(page, "demo-admin@honest.com", "DemoAdmin2026");

const adminPaths = ["/admin", "/admin/clients", "/admin/audit-logs", "/admin/scheduler"];
for (const path of adminPaths) {
  await scanBothModes(page, path, async (label) => {
    await goto(page, path);
    await scan(page, label);
  });
}

// First client detail page
const firstClientHref = await page.locator('a[href^="/admin/clients/"]').first().getAttribute("href").catch(() => null);
if (firstClientHref) {
  await scanBothModes(page, firstClientHref, async (label) => {
    await goto(page, firstClientHref);
    await scan(page, label);
  });
}

// ── Admin modals ──────────────────────────────────────────────────────────────
console.log("\n── Admin modals ─────────────────────────────────────");
const adminModals = [
  { path: "/admin/questionnaires", open: 'button:has-text("New check-in")', close: 'button:has-text("Cancel")' },
  { path: "/admin/resources", open: 'button:has-text("Add resource")', close: 'button:has-text("Cancel")' },
  { path: "/admin", open: 'button:has-text("+ Todo")', close: 'button:has-text("Cancel")' },
];
for (const { path, open, close } of adminModals) {
  await scanBothModes(page, path, async (label) => {
    await scanWithModal(page, path, label, open, close);
  });
}

// ── Client pages ──────────────────────────────────────────────────────────────
console.log("\n── Client pages ─────────────────────────────────────");
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('input[type="email"]', { timeout: 10000 });
await login(page, "demo-client@honest.com", "DemoClient2026");

const clientPaths = ["/dashboard", "/check-in", "/resources", "/my-sessions", "/settings"];
for (const path of clientPaths) {
  await scanBothModes(page, path, async (label) => {
    await goto(page, path);
    await scan(page, label);
  });
}

// ── Client modals ─────────────────────────────────────────────────────────────
console.log("\n── Client modals ────────────────────────────────────");
const firstCard = page.locator('button:has-text("Read"), button:has-text("Watch")').first();
await scanBothModes(page, "/resources — modal", async (label) => {
  await goto(page, "/resources");
  try {
    await firstCard.click({ timeout: 3000 });
    await page.waitForTimeout(400);
    await scan(page, label);
    await page.keyboard.press("Escape");
  } catch { /* no resource cards */ }
});

await browser.close();

if (totalViolations > 0) {
  console.log(`\n❌ ${totalViolations} accessibility violation(s) found. Fix them before pushing.\n`);
  process.exit(1);
}
console.log("\n✓ No accessibility violations found.\n");
