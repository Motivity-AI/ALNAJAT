#!/usr/bin/env node
"use strict";

/*
 * ALNAJAT browser smoke/functional QA.
 * Starts an isolated local server under the same project path used by GitHub Pages.
 * Tests only a fresh browser context; it never touches a player's real save data.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium, firefox, webkit } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PREFIX = "/ALNAJAT";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname); }
    catch (_) { res.writeHead(400).end("Bad request"); return; }

    if (pathname === PREFIX) {
      res.writeHead(308, { Location: PREFIX + "/" }).end();
      return;
    }
    if (!pathname.startsWith(PREFIX + "/")) {
      res.writeHead(404).end("Not found");
      return;
    }

    const relative = pathname.slice(PREFIX.length + 1) || "index.html";
    const target = path.resolve(ROOT, relative);
    if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    let stat;
    try { stat = fs.statSync(target); } catch (_) { res.writeHead(404).end("Not found"); return; }
    if (!stat.isFile()) { res.writeHead(404).end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => {
    resolve({ server, baseURL: "http://127.0.0.1:" + server.address().port + PREFIX + "/" });
  }));
}

async function main() {
  const { server, baseURL } = await startServer();
  let browser;
  const failures = [];
  const checks = [];
  const check = (name, ok, detail) => {
    if (ok) {
      checks.push(name);
      console.log("✓ " + name);
    } else {
      failures.push(name + (detail ? ": " + detail : ""));
      console.error("✗ " + name + (detail ? " — " + detail : ""));
    }
  };

  try {
    const engines = { chromium, firefox, webkit };
    const engineName = process.env.PLAYWRIGHT_BROWSER || "chromium";
    const engine = engines[engineName];
    if (!engine) throw new Error("Unsupported PLAYWRIGHT_BROWSER: " + engineName);
    browser = await engine.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
      acceptDownloads: true
    });
    const page = await context.newPage();
    const pageErrors = [];
    const localHttpErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("response", response => {
      if (response.url().startsWith(baseURL) && response.status() >= 400) {
        localHttpErrors.push(response.status() + " " + response.url());
      }
    });

    await page.goto(baseURL, { waitUntil: "domcontentloaded" });
    await page.locator("#app h1").waitFor({ state: "visible", timeout: 15000 });
    await page.waitForTimeout(500);
    check("Initial Arabic menu and page metadata render", (await page.locator("#app h1").innerText()).includes("النجاة") &&
      await page.evaluate(() => document.title.includes("النجاة") &&
        document.querySelector('meta[property="og:locale"]')?.content === "ar_SD"));

    const allSudanButton = page.getByRole("button", { name: /حكايات من كل السودان/ });
    await allSudanButton.waitFor({ state: "visible", timeout: 5000 });
    await allSudanButton.click();
    const allSudanPanel = page.locator("#pn");
    await allSudanPanel.getByText("كل السودان… حكايات متعددة وكرامة واحدة").waitFor({ state: "visible" });
    check("All-Sudan story hub is reachable from the main menu", await allSudanPanel.isVisible());

    for (const label of ["من الشمال:", "من الشرق:", "من جنوب البلاد:", "من الوسط والجزيرة والخرطوم:"]) {
      check("Regional route is listed: " + label, await allSudanPanel.getByRole("button", { name: new RegExp(label) }).count() === 1);
    }

    await allSudanPanel.getByRole("button", { name: /من الشمال:/ }).click();
    await allSudanPanel.getByText("في قرية شمالية").waitFor({ state: "visible" });
    await allSudanPanel.getByRole("button").filter({ hasText: "يساعد أسرته في جلب الماء" }).click();
    await allSudanPanel.getByText("خطوة صغيرة في حكاية أكبر").waitFor({ state: "visible" });
    const regionalChoiceSaved = await page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem("alnajat_all_sudan_v1") || "[]");
      return saved.length === 1 && saved[0].id === "north" && saved[0].choice === 0;
    });
    check("Regional choice is saved separately from the original story", regionalChoiceSaved);

    await page.evaluate(() => window.openAllSudanScenarios());
    await allSudanPanel.getByRole("button", { name: /جيش واحد أم جيوش متوازية/ }).click();
    await allSudanPanel.getByText("اتفاق جوبا للسلام").waitFor({ state: "visible" });
    check("Civic reflection opens with its cited source links",
      await allSudanPanel.getByRole("link", { name: /Juba Peace Agreement/ }).count() === 1 &&
      await allSudanPanel.getByRole("link", { name: /US Treasury/ }).count() === 1);
    await allSudanPanel.getByRole("button", { name: "إغلاق" }).click();
    await allSudanPanel.waitFor({ state: "hidden" });

    await page.getByRole("button", { name: "English", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("#app h1")?.textContent?.trim() === "Survival");
    check("Menu switches to English and LTR", await page.evaluate(() =>
      document.documentElement.lang === "en" && document.documentElement.dir === "ltr" &&
      document.title.includes("A Sudanese Journey") &&
      document.querySelector('meta[property="og:locale"]')?.content === "en_US"
    ));

    await page.getByRole("button", { name: "العربية", exact: true }).click();
    check("Menu switches back to Arabic and RTL", await page.evaluate(() =>
      document.documentElement.lang === "ar" && document.documentElement.dir === "rtl"
    ));

    const privacyLink = page.locator("#alnajat-privacy-link");
    await privacyLink.waitFor({ state: "visible", timeout: 5000 });
    await privacyLink.click();
    await page.locator("#ar h1").waitFor({ state: "visible" });
    check("Privacy policy opens from the game menu", (await page.locator("#ar h1").innerText()).includes("الخصوصية"));
    await page.locator("#lang").click();
    check("Privacy policy switches to English and LTR", await page.evaluate(() =>
      document.documentElement.lang === "en" && document.documentElement.dir === "ltr" &&
      !document.querySelector("#en").hidden && document.querySelector("#en h1")?.textContent === "Privacy & Data"
    ));
    await page.getByRole("link", { name: /Back to game/ }).click();
    await page.locator("#app h1").waitFor({ state: "visible" });

    await page.getByRole("button", { name: "بدء جديدة", exact: true }).click();
    const gate = page.locator("#alnajat-safety-gate");
    await gate.waitFor({ state: "visible", timeout: 10000 });
    await gate.getByRole("button", { name: /فهمت التنبيه/ }).click();
    await page.locator("#app .tx").waitFor({ state: "visible" });
    const tutorialPanel = page.locator("#pn");
    await tutorialPanel.waitFor({ state: "visible", timeout: 3000 });
    check("First-run tutorial opens as a labelled modal dialog",
      await tutorialPanel.getAttribute("role") === "dialog" &&
      await tutorialPanel.getAttribute("aria-modal") === "true" &&
      (await tutorialPanel.getAttribute("aria-label")) === "كيف تلعب");
    await page.keyboard.press("Escape");
    await tutorialPanel.waitFor({ state: "hidden", timeout: 5000 });
    check("Tutorial closes with Escape and restores focus to the first story choice",
      await page.evaluate(() => !!document.activeElement?.matches("#app .btn")));
    const firstSceneText = await page.locator("#app .tx").innerText();
    check("Informed-content gate opens and starts the first scene", firstSceneText.length > 40);

    await page.locator("#app > button.btn").first().click();
    await page.waitForFunction(previous => {
      const node = document.querySelector("#app .tx");
      return !!node && node.innerText !== previous;
    }, firstSceneText, { timeout: 10000 });
    const nextSceneText = await page.locator("#app .tx").innerText();
    check("A story choice advances to another scene", nextSceneText !== firstSceneText);

    await page.locator("#app .bt button").filter({ hasText: "↩️" }).first().click();
    await page.waitForFunction(previous => {
      const node = document.querySelector("#app .tx");
      return !!node && node.innerText === previous;
    }, firstSceneText, { timeout: 10000 });
    check("Undo restores the previous scene", (await page.locator("#app .tx").innerText()) === firstSceneText);
    await page.waitForFunction(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("najat_saves_v2") || "{}");
        return saved.auto && saved.auto.id === "d0";
      } catch (_) { return false; }
    }, null, { timeout: 5000 });
    check("Autosave writes the current scene to localStorage", true);

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#app h1").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "متابعة", exact: true }).click();
    await page.locator("#app .tx").waitFor({ state: "visible" });
    await page.waitForFunction(expected => document.querySelector("#app .tx")?.innerText === expected,
      firstSceneText, { timeout: 10000 });
    check("Autosaved progress survives a page reload", (await page.locator("#app .tx").innerText()) === firstSceneText);

    await page.evaluate(() => window.toggleLang());
    await page.waitForFunction(() => document.documentElement.lang === "en");
    check("In-game language switch updates the document to English", await page.evaluate(() =>
      document.documentElement.dir === "ltr" && document.querySelector("#app h1")?.textContent?.trim() === "Survival"
    ));
    await page.evaluate(() => window.toggleLang());
    await page.waitForFunction(() => document.documentElement.lang === "ar");
    check("In-game language switch returns to Arabic", await page.evaluate(() =>
      document.documentElement.dir === "rtl" && document.querySelector("#app h1")?.textContent?.trim() === "النجاة"
    ));

    const audioTrigger = page.locator("[data-alnajat-audio-settings]");
    await audioTrigger.waitFor({ state: "visible", timeout: 10000 });
    await audioTrigger.click();
    const audioDialog = page.locator("#alnajat-audio-settings");
    await audioDialog.waitFor({ state: "visible", timeout: 5000 });
    check("Audio settings dialog opens", await audioDialog.isVisible());
    await page.keyboard.press("Escape");
    await audioDialog.waitFor({ state: "hidden", timeout: 5000 });
    check("Audio settings dialog closes with Escape", !(await audioDialog.isVisible()));

    const a11yTrigger = page.locator("#alnajat-a11y-launch");
    await a11yTrigger.waitFor({ state: "visible", timeout: 10000 });
    await a11yTrigger.click();
    const a11yDialog = page.locator("#alnajat-a11y-panel");
    await a11yDialog.waitFor({ state: "visible", timeout: 5000 });
    check("Accessibility dialog opens with an accessible dialog role",
      await a11yDialog.getAttribute("role") === "dialog");
    await page.keyboard.press("Escape");
    await page.locator("#alnajat-a11y-backdrop").waitFor({ state: "hidden", timeout: 5000 });
    check("Accessibility dialog closes with Escape", !(await a11yDialog.isVisible()));

    // Exercise backup import and rollback using only this disposable browser context.
    await page.evaluate(() => window.openAlnajatBackup());
    const importInput = page.locator("#alnajat-dc-import");
    await importInput.waitFor({ state: "visible", timeout: 5000 });
    await page.evaluate(() => {
      localStorage.setItem("najat_qa_first", "before");
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "najat_qa_fail") throw new DOMException("Quota exceeded", "QuotaExceededError");
        return originalSet.call(this, key, value);
      };
    });
    const backup = {
      app: "ALNAJAT",
      format: 1,
      exportedAt: new Date().toISOString(),
      storage: { najat_qa_first: "after", najat_qa_fail: "trigger" }
    };
    await importInput.setInputFiles({
      name: "rollback-test.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup))
    });
    await page.waitForFunction(() => {
      return localStorage.getItem("najat_qa_first") === "before" &&
        localStorage.getItem("najat_qa_fail") === null;
    }, null, { timeout: 5000 });
    check("Failed backup restore rolls back earlier writes", true);

    await page.setViewportSize({ width: 320, height: 640 });
    const narrow = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }));
    check("320px mobile layout has no horizontal page overflow", narrow.scroll <= narrow.width,
      "scrollWidth=" + narrow.scroll + ", clientWidth=" + narrow.width);

    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }));
    check("Desktop layout has no horizontal page overflow", wide.scroll <= wide.width);

    await page.evaluate(async () => {
      if ("serviceWorker" in navigator) await navigator.serviceWorker.ready;
    });
    check("Service Worker registers and becomes ready", await page.evaluate(() =>
      "serviceWorker" in navigator && !!navigator.serviceWorker.controller
    ));

    check("No uncaught browser JavaScript errors", pageErrors.length === 0, pageErrors.join(" | "));
    check("No failed local app assets", localHttpErrors.length === 0, localHttpErrors.join(" | "));

    if (engineName === "webkit") {
      const cachedShell = await page.evaluate(async () => {
        const names = await caches.keys();
        const urls = [new URL("./", location.href).href, new URL("privacy.html", location.href).href];
        const results = await Promise.all(names.map(async name => {
          const cache = await caches.open(name);
          return Promise.all(urls.map(url => cache.match(url)));
        }));
        return urls.every((_, index) => results.some(items => !!items[index]));
      });
      check("WebKit precaches both game shell and privacy page for offline use", cachedShell);
    } else {
      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.locator("#app h1").waitFor({ state: "visible", timeout: 10000 });
      check("Game shell reloads and renders while offline", (await page.locator("#app h1").innerText()).includes("النجاة"));
      await page.locator("#alnajat-privacy-link").click();
      await page.locator("#ar h1").waitFor({ state: "visible", timeout: 5000 });
      check("Privacy policy is available from the offline cache", (await page.locator("#ar h1").innerText()).includes("الخصوصية"));
      await context.setOffline(false);
    }

    await context.close();
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  console.log("\nBrowser QA: " + checks.length + " passed, " + failures.length + " failed.");
  if (failures.length) {
    failures.forEach(item => console.error(" - " + item));
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
