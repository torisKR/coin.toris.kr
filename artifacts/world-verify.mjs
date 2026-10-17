import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert/strict";

const require = createRequire(
  path.join(process.env.PEPEBEAR_QA_TOOLS || "/tmp/pepebear-qa", "package.json"),
);
const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const base = process.env.QA_BASE_URL || "http://localhost:3002";
const result = { base, at: new Date().toISOString(), pages: [], checks: {}, errors: [] };
const browser = await chromium.launch({
  channel: "chrome",
  args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => result.errors.push(error.message));
  for (const route of [
    "/",
    "/coin/PEBR",
    "/coin/YETI",
    "/coin/XMASR",
    "/studio?coin=YETI",
    "/coin/PEBR/memes?template=coffee",
    "/coin/PEBR/token",
    "/privacy",
  ]) {
    const response = await page.goto(base + route, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, route);
    const decline = page.getByRole("button", { name: "Decline", exact: true });
    if (await decline.isVisible()) await decline.click();
    assert.equal(await page.locator("h1").count(), 1, `${route} has one H1`);
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `horizontal overflow ${route} at ${width}`,
      );
    }
    await page.evaluate(() =>
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        element.style.transition = "none";
        element.setAttribute("data-reveal", "visible");
      }),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    result.pages.push({
      route,
      status: response.status(),
      title: await page.title(),
      accessibility: axe.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
    });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  for (const symbol of ["PEBR", "YETI", "XMASR"]) {
    await page.getByRole("tab", { name: new RegExp(`\\$${symbol}`) }).click();
    const frame = page.frameLocator(".world-iframe");
    await frame.locator(".coin-world-canvas.is-ready").waitFor();
    assert.equal(await page.locator(".world-iframe").count(), 1, `${symbol} uses one renderer frame`);
    assert.equal(await frame.locator("canvas").count(), 1, `${symbol} uses one renderer`);
    assert.equal(await page.getByRole("tab", { selected: true }).count(), 1);
    assert.equal(
      await page.locator("#coin-gallery-panel a").first().getAttribute("href"),
      `/coin/${symbol}`,
    );
  }
  result.checks.singleSelectedWorldRenderer = true;

  await page.getByRole("tab", { name: /\$PEBR/ }).click();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.getByRole("tab", { name: /\$YETI/ }).getAttribute("aria-selected"), "true");
  await page.keyboard.press("End");
  assert.equal(await page.getByRole("tab", { name: /\$XMASR/ }).getAttribute("aria-selected"), "true");
  result.checks.keyboardWorldSelection = true;

  await page.goto(base + "/coin/YETI", { waitUntil: "networkidle" });
  await page.locator(".coin-world-canvas.is-ready").waitFor();
  const canvas = page.locator("canvas");
  let before = await canvas.evaluate((element) => element.toDataURL());
  await page.getByRole("button", { name: "Take the swing" }).click();
  await page.waitForFunction(
    (prior) => document.querySelector("canvas").toDataURL() !== prior,
    before,
  );
  await page.locator(".coin-world-canvas").focus();
  before = await canvas.evaluate((element) => element.toDataURL());
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(
    (prior) => document.querySelector("canvas").toDataURL() !== prior,
    before,
  );
  result.checks.characterActionAndKeyboardTurn = true;

  for (const [symbol, action] of [["PEBR", "Raise the coffee"], ["YETI", "Take the swing"], ["XMASR", "Start the launch"]]) {
    await page.goto(`${base}/coin/${symbol}`, { waitUntil: "networkidle" });
    await page.locator(".coin-world-canvas.is-ready").waitFor();
    assert.equal(await page.getByRole("button", { name: action }).count(), 1);
  }
  result.checks.allCharacterActions = true;

  await page.goto(base + "/studio?coin=YETI", { waitUntil: "networkidle" });
  assert.equal(await page.getByRole("button", { name: /Yeti\s*\$YETI/ }).getAttribute("aria-pressed"), "true");
  await page.getByRole("button", { name: /XMasRocket\s*\$XMASR/ }).click();
  assert.equal(new URL(page.url()).searchParams.get("coin"), "XMASR");
  await page.getByRole("button", { name: "Action" }).click();
  await page.getByRole("button", { name: "Evergreen" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Save 1080 PNG/ }).click();
  const download = await downloadPromise;
  await download.saveAs("artifacts/world-studio-export.png");
  const png = fs.readFileSync("artifacts/world-studio-export.png");
  assert.equal(png.readUInt32BE(16), 1080);
  assert.equal(png.readUInt32BE(20), 1080);
  assert.ok(decodeURIComponent(await page.getByRole("link", { name: "Open X draft" }).getAttribute("href")).includes("coin=XMASR"));
  result.checks.threeCoinStudioAnd1080Export = true;

  await page.goto(base + "/coin/PEBR/memes?template=coffee", { waitUntil: "networkidle" });
  assert.equal(await page.locator("#studio-top").inputValue(), "BIG PLANS TODAY");
  assert.equal(await page.locator("#studio-bottom").inputValue(), "FIRST, COFFEE.");
  result.checks.legacyTemplateCompatibility = true;

  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.frameLocator(".world-iframe").locator(".coin-world-canvas.is-ready").waitFor();
  await page.evaluate(() =>
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.style.transition = "none";
      element.setAttribute("data-reveal", "visible");
    }),
  );
  await page.screenshot({ path: "artifacts/world-home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator(".world-iframe").count(), 0, "mobile defers the 3D renderer");
  await page.getByRole("button", { name: "Open 3D world" }).click();
  await page.frameLocator(".world-iframe").locator(".coin-world-canvas.is-ready").waitFor();
  result.checks.mobilePosterFirstAndOptIn3D = true;
  await page.evaluate(() =>
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.style.transition = "none";
      element.setAttribute("data-reveal", "visible");
    }),
  );
  await page.screenshot({ path: "artifacts/world-home-mobile.png", fullPage: true });
  await page.goto(base + "/studio?coin=PEBR", { waitUntil: "networkidle" });
  await page.screenshot({ path: "artifacts/world-studio-mobile.png", fullPage: true });

  const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(base + "/coin/XMASR", { waitUntil: "networkidle" });
  assert.equal(await reducedPage.getByRole("button", { name: "Play" }).getAttribute("aria-pressed"), "true");
  await reduced.close();
  result.checks.reducedMotionStartsPaused = true;

  result.errors = [...new Set(result.errors)];
  fs.writeFileSync("artifacts/world-qa.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
