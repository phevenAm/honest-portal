import { chromium } from "@playwright/test";
import { injectAxe, getViolations } from "axe-playwright";

const BASE = "http://localhost:5174";

async function scan(page, label) {
  await injectAxe(page);
  const violations = await getViolations(page);
  if (violations.length === 0) {
    console.log(`✓ ${label}`);
  } else {
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

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
}

async function scanWithModal(page, path, label, openSelector, closeSelector) {
  await goto(page, path);
  await scan(page, path);
  try {
    await page.click(openSelector, { timeout: 3000 });
    await page.waitForTimeout(400);
    await scan(page, `${label} — modal open`);
    if (closeSelector) await page.click(closeSelector, { timeout: 3000 }).catch(() => {});
  } catch {
    // modal trigger not available (e.g. demo mode blocked it)
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

// Simple page scans
for (const path of ["/admin", "/admin/audit-logs", "/admin/scheduler"]) {
  await goto(page, path);
  await scan(page, path);
}

// Clients page + detail page
await goto(page, "/admin/clients");
await scan(page, "/admin/clients");
const firstClientHref = await page.locator('a[href^="/admin/clients/"]').first().getAttribute("href").catch(() => null);
if (firstClientHref) {
  await goto(page, firstClientHref);
  await scan(page, firstClientHref);
}

// Questionnaires page + modal
await scanWithModal(page, "/admin/questionnaires", "/admin/questionnaires", 'button:has-text("New check-in")', 'button:has-text("Cancel")');

// Resources page + modal
await scanWithModal(page, "/admin/resources", "/admin/resources", 'button:has-text("Add resource")', 'button:has-text("Cancel")');

// Admin dashboard + todo modal
await scanWithModal(page, "/admin", "/admin", 'button:has-text("+ Todo")', 'button:has-text("Cancel")');

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

// Resources page with modal open
await goto(page, "/resources");
const firstCard = page.locator('button:has-text("Read"), button:has-text("Watch")').first();
try {
  await firstCard.click({ timeout: 3000 });
  await page.waitForTimeout(400);
  await scan(page, "/resources — modal open");
  await page.keyboard.press("Escape");
} catch { /* no resource cards */ }

await browser.close();
