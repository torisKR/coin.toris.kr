import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert/strict";

const require = createRequire(
  path.join(process.env.PEPEBEAR_QA_TOOLS || "/tmp/pepebear-qa", "package.json"),
);
const { chromium } = require("playwright");
const base = process.env.QA_BASE_URL || "https://coin.toris.kr";
const browser = await chromium.launch({ channel: "chrome" });
const events = [];
const tagRequests = [];
const failures = [];

function record(request, status) {
  const url = new URL(request.url());
  if (!/google-analytics\.com$/.test(url.hostname) || !url.pathname.includes("collect")) return;
  for (const line of (request.postData() || "").split("\n")) {
    const query = new URLSearchParams(url.search);
    for (const [key, value] of new URLSearchParams(line)) query.set(key, value);
    if (!query.get("en")) continue;
    events.push({
      name: query.get("en"),
      measurementId: query.get("tid"),
      page: query.get("dl"),
      coin: query.get("ep.coin_symbol"),
      status,
    });
  }
}

async function waitForEvent(page, name, count = 1) {
  const started = Date.now();
  while (events.filter((event) => event.name === name && event.status >= 200 && event.status < 300).length < count) {
    if (Date.now() - started > 30_000) throw new Error(`No accepted ${name} event`);
    await page.waitForTimeout(200);
  }
}

const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  permissions: ["clipboard-read", "clipboard-write"],
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("request", (request) => {
  if (request.url().startsWith("https://www.googletagmanager.com/gtag/js")) tagRequests.push(request.url());
});
page.on("response", (response) => record(response.request(), response.status()));
page.on("requestfailed", (request) => {
  if (/google-analytics|googletagmanager/.test(request.url())) failures.push(request.failure()?.errorText || "request failed");
});

const result = { base, at: new Date().toISOString(), checks: {}, events: [], failures };
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Allow analytics", exact: true }).waitFor();
  assert.equal(tagRequests.length, 0);
  assert.equal(events.length, 0);
  assert.ok(!(await context.cookies()).some((cookie) => cookie.name.startsWith("_ga")));
  result.checks.noAnalyticsBeforeConsent = true;

  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await waitForEvent(page, "page_view");
  assert.equal(events.filter((event) => event.name === "page_view").length, 1);
  result.checks.initialPageViewExactlyOnce = true;

  await page.getByRole("tab", { name: /\$YETI/ }).click();
  await waitForEvent(page, "coin_selected");
  assert.equal(events.find((event) => event.name === "coin_selected")?.coin, "YETI");
  await page.getByRole("link", { name: "Enter this world: Yeti" }).click();
  await page.waitForURL("**/coin/YETI");
  await waitForEvent(page, "page_view", 2);
  await waitForEvent(page, "coin_viewed");
  await page.getByRole("button", { name: "Copy full YETI mint address" }).click();
  await waitForEvent(page, "mint_copied");

  await page.goto(`${base}/studio?coin=XMASR`, { waitUntil: "networkidle" });
  await waitForEvent(page, "page_view", 3);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Save 1080 PNG/ }).click();
  await downloadPromise;
  await waitForEvent(page, "meme_downloaded");
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: /Open X draft/ }).click();
  const popup = await popupPromise;
  await popup.close();
  await waitForEvent(page, "meme_share_opened");

  for (const name of ["coin_selected", "coin_viewed", "mint_copied", "meme_downloaded", "meme_share_opened"]) {
    const accepted = events.filter((event) => event.name === name && event.status >= 200 && event.status < 300);
    assert.equal(accepted.length, 1, `${name} sent once`);
  }
  assert.ok(events.every((event) => event.measurementId === "G-ZXLWF2WZ3H"));
  assert.equal(events.find((event) => event.name === "meme_downloaded")?.coin, "XMASR");
  assert.equal(events.find((event) => event.name === "meme_share_opened")?.coin, "XMASR");
  result.checks.selectedCoinParametersAndAcceptedTransport = true;

  result.events = events;
  fs.writeFileSync("artifacts/world-analytics-qa.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  result.events = events;
  fs.writeFileSync("artifacts/world-analytics-qa.json", JSON.stringify(result, null, 2));
  await browser.close();
}
