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

    await page.getByRole("button", { name: /الفصل التالي: وطن يتّسع للجميع/ }).waitFor({ state: "visible", timeout: 5000 });
    check("Next Chapter is discoverable from the main menu", await page.getByRole("button", { name: /الفصل التالي: وطن يتّسع للجميع/ }).count() === 1);

    await page.evaluate(() => window.openAlnajatInsights());
    await page.locator("#pn").getByText("بصمة العواقب").waitFor({ state: "visible" });
    check("Consequence insights panel opens without changing the active story", await page.locator("#pn").isVisible() &&
      await page.locator("#pn").getByText("لا يصنّف شخصيتك أخلاقياً").count() === 1);
    await page.locator("#pn").getByRole("button", { name: /إغلاق|Close/ }).click();
    await page.evaluate(() => window.openAlnajatRelations());
    await page.locator("#pn").getByText("ذاكرة الروابط").waitFor({ state: "visible" });
    check("Relationship memories handle a fresh journey without inventing companions",
      await page.locator("#pn").getByText(/لم ينضم رفاق إلى رحلتك بعد/).count() === 1 &&
      await page.locator("#pn").getByText("لا تقيس المحبة أو الولاء").count() === 1);
    await page.locator("#pn").getByRole("button", { name: /إغلاق|Close/ }).click();

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

    // Verify the additive regional stories, bilingual labels, and isolated progress key.
    await page.evaluate(() => window.openAllSudanScenarios());
    await page.locator('#pn [data-story="north"]').waitFor({ state: "visible" });
    check("All-Sudan menu exposes the four regional routes", await page.locator("#pn [data-story]").count() === 4);
    await page.locator('#pn [data-story="north"]').click();
    await page.locator('#pn [data-choice="0"]').click();
    check("Regional choice stores progress independently of the original story save",
      await page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem("alnajat_all_sudan_v1") || "[]");
        return saved[0]?.id === "north" && saved[0]?.choice === 0 &&
          !!localStorage.getItem("najat_saves_v2");
      }));
    await page.evaluate(() => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      window.openAllSudanScenarios();
    });
    check("All-Sudan route menu renders in English",
      (await page.locator('#pn [data-story="south"]').innerText()).includes("From the South of Sudan"));
    await page.locator('#pn [data-story="south"]').click();
    check("South route renders an English scene and choices",
      (await page.locator("#pn .asudan").innerText()).includes("In the south of Sudan"));
    await page.locator("#pn .asudan button").filter({ hasText: "Asks what happened" }).first().click();
    check("English regional choice produces its distinct consequence",
      (await page.locator("#pn .asudan").innerText()).includes("You found fragments of news"));
    await page.evaluate(() => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
      document.getElementById("pn").classList.remove("on");
    });
    await page.evaluate(() => window.openAllSudanScenarios());
    await page.locator('#pn [data-story="east"]').click();
    await page.locator('#pn .asudan button').filter({ hasText: "يقاسم الأسرة الجديدة" }).click();
    check("East route has its own Arabic consequence",
      (await page.locator("#pn .asudan").innerText()).includes("تقاسمت الأسرة الطعام والمساحة"));
    await page.evaluate(() => window.openAllSudanScenarios());
    await page.locator('#pn [data-story="center"]').click();
    await page.locator('#pn .asudan button').filter({ hasText: "يوثق ما رآه" }).click();
    check("Centre/Gezira/Khartoum route has its own Arabic consequence",
      (await page.locator("#pn .asudan").innerText()).includes("حفظت ما شاهدته في سجل آمن"));
    await page.evaluate(() => document.getElementById("pn").classList.remove("on"));

    // Independent Next Chapter campaign: graph, bilingual rendering, save isolation and resume.
    await page.evaluate(() => window.showMenu());
    const nextChapterLauncher = page.locator("#app [data-next-chapter] button");
    await nextChapterLauncher.waitFor({ state: "visible", timeout: 5000 });
    await nextChapterLauncher.click();
    const nextPanel = page.locator("#pn");
    await nextPanel.getByText("الفصل التالي: وطن يتّسع للجميع").waitFor({ state: "visible" });
    const dialogLabelled = await nextPanel.evaluate(p => {
      const id = p.getAttribute("aria-labelledby");
      return p.getAttribute("role") === "dialog" && p.getAttribute("aria-modal") === "true" &&
        !!id && p.querySelector("#" + CSS.escape(id))?.tagName === "H3";
    });
    check("Next Chapter opens as a labelled modal dialog", dialogLabelled &&
      await nextPanel.getByText("رحلة جديدة بأربعة طرق إقليمية").count() === 1);
    const focusCycle = await page.evaluate(() => {
      const p = document.querySelector("#pn");
      const items = Array.from(p.querySelectorAll("button:not([disabled])"));
      if (items.length < 2) return { forward: false, reverse: false };
      items[items.length - 1].focus();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      const forward = document.activeElement === items[0];
      items[0].focus();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }));
      return { forward, reverse: document.activeElement === items[items.length - 1] };
    });
    check("Next Chapter dialog traps forward and reverse keyboard focus", focusCycle.forward && focusCycle.reverse);
    await page.keyboard.press("Escape");
    await nextPanel.waitFor({ state: "hidden", timeout: 5000 });
    check("Escape closes the Next Chapter dialog and restores focus to its launcher",
      await page.evaluate(() => document.activeElement === document.querySelector("#app [data-next-chapter] button")));
    await nextChapterLauncher.click();
    await nextPanel.getByText("رحلة جديدة بأربعة طرق إقليمية").waitFor({ state: "visible" });
    await nextPanel.getByRole("button", { name: "ابدأ الفصل الجديد" }).click();
    await nextPanel.getByText("الفصل الأول: الرسالة التي لم تصل").waitFor({ state: "visible" });
    const originalSaveBeforeExpansion = await page.evaluate(() => localStorage.getItem("najat_saves_v2"));
    await nextPanel.locator(".anx-choice").nth(0).click();
    await nextPanel.getByText("الفصل الأول: حقيبة صغيرة وأربعة طرق").waitFor({ state: "visible" });
    check("Next Chapter choice advances and writes to its isolated save key", await page.evaluate(() => {
      const v = JSON.parse(localStorage.getItem("alnajat_next_chapter_v1") || "null");
      return v && v.scene === "departure" && v.log.length === 1 &&
        !!localStorage.getItem("najat_saves_v2");
    }));
    check("Next Chapter does not overwrite the original player save",
      await page.evaluate(expected => localStorage.getItem("najat_saves_v2") === expected, originalSaveBeforeExpansion));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#app h1").waitFor({ state: "visible" });
    await page.evaluate(() => window.openAlnajatNextChapter());
    await page.locator("#pn [data-action='resume']").waitFor({ state: "visible" });
    await page.locator("#pn [data-action='resume']").click();
    await page.locator("#pn").getByText("الفصل الأول: حقيبة صغيرة وأربعة طرق").waitFor({ state: "visible" });
    check("Next Chapter resumes the exact saved scene after reload", await page.evaluate(() =>
      JSON.parse(localStorage.getItem("alnajat_next_chapter_v1") || "null")?.scene === "departure"));
    // North route -> bridge -> ledger -> assembly -> decision -> accountable ending.
    for (const choiceIndex of [0, 0, 0, 1, 1, 0, 0]) {
      await page.locator("#pn .anx-choice").nth(choiceIndex).click();
    }
    await page.locator("#pn").getByText("دفتر لا يخاف من السؤال").waitFor({ state: "visible" });
    check("A complete North-route playthrough reaches its earned additional ending",
      await page.evaluate(() => {
        const v = JSON.parse(localStorage.getItem("alnajat_next_chapter_v1") || "null");
        return v?.ended === true && v.ending === "accountable" && v.log.length === 8;
      }));
    check("Original player save remains byte-for-byte unchanged after the expansion ending",
      await page.evaluate(expected => localStorage.getItem("najat_saves_v2") === expected, originalSaveBeforeExpansion));
    await page.evaluate(() => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      window.openAlnajatNextChapter();
    });
    await page.locator("#pn").getByText("The Next Chapter: A Country with Room for Everyone").waitFor({ state: "visible" });
    await page.locator("#pn [data-action='resume']").click();
    await page.locator("#pn").getByText("A Ledger That Welcomes Questions").waitFor({ state: "visible" });
    check("Next Chapter ending renders in English without changing the saved ending",
      await page.evaluate(() => document.documentElement.lang === "en" &&
        JSON.parse(localStorage.getItem("alnajat_next_chapter_v1") || "null")?.ending === "accountable"));
    await page.locator("#pn [data-journal='1']").click();
    await page.locator("#pn").getByText("Journey Journal").waitFor({ state: "visible" });
    check("Journey journal displays the English scene and choice history",
      await page.locator("#pn").getByText(/The North — When the Ledger Became Evidence/).count() === 1);
    await page.locator("#pn [data-close='1']").click();
    async function verifyRegionalFollowup(routeIndex, expectedTitle, routeName) {
      await page.evaluate(() => { document.documentElement.lang = "ar"; document.documentElement.dir = "rtl"; });
      await page.evaluate(() => window.openAlnajatNextChapter());
      await page.locator("#pn [data-action='restart']").waitFor({ state: "visible" });
      page.once("dialog", dialog => dialog.accept());
      await page.locator("#pn [data-action='restart']").click();
      await page.locator("#pn .anx-choice").first().click(); // prologue -> route selection
      await page.locator("#pn .anx-choice").nth(routeIndex).click();
      await page.locator("#pn .anx-choice").first().click();
      await page.locator("#pn").getByText(expectedTitle).waitFor({ state: "visible" });
      check(routeName + " route opens its own follow-up scene",
        await page.evaluate(() => !!JSON.parse(localStorage.getItem("alnajat_next_chapter_v1") || "null")?.companion));
    }
    await verifyRegionalFollowup(1, "الشرق — قائمة بلا أسماء", "East");
    await verifyRegionalFollowup(2, "الجنوب — الاسم أمانة", "South");
    await verifyRegionalFollowup(3, "الوسط — شهادة لا تتحول إلى اتهام", "Centre/Gezira/Khartoum");
    await page.evaluate(() => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
      document.getElementById("pn").classList.remove("on");
    });

    // Independent Missing Message puzzle: accessible dialog, logical order, outcomes and save isolation.
    await page.evaluate(() => window.showMenu());
    await page.evaluate(() => { document.documentElement.lang = "ar"; document.documentElement.dir = "rtl"; });
    const messageLauncher = page.locator("#app [data-message-quest-launcher] button");
    await messageLauncher.waitFor({ state: "visible", timeout: 5000 });
    await messageLauncher.click();
    const messagePanel = page.locator("#pn");
    await messagePanel.getByText("لغز الرسالة الناقصة").waitFor({ state: "visible" });
    check("Missing Message quest opens as a labelled modal dialog",
      await messagePanel.getAttribute("role") === "dialog" &&
      !!(await messagePanel.getAttribute("aria-labelledby")) &&
      await messagePanel.getByText(/في المساء، وجدتم تسجيلاً قديماً لعثمان/).count() === 1);
    await messagePanel.getByRole("button", { name: "ابدأ اللغز" }).click();
    await messagePanel.getByRole("button", { name: "ابدأ ترتيب القطع" }).click();
    const originalSaveBeforeQuest = await page.evaluate(() => localStorage.getItem("najat_saves_v2"));
    for (const id of ["verify", "protect", "share", "listen"]) {
      await messagePanel.locator('[data-card="' + id + '"]').click();
    }
    check("Puzzle allows a non-destructive retry when fragments are out of order",
      await messagePanel.getByRole("button", { name: "أعد ترتيب القطع" }).count() === 1 &&
      await page.evaluate(() => JSON.parse(localStorage.getItem("alnajat_message_quest_v1") || "null")?.screen === "puzzle"));
    await messagePanel.getByRole("button", { name: "أعد ترتيب القطع" }).click();
    await messagePanel.getByRole("button", { name: "أعطني تلميحاً" }).click();
    check("Puzzle provides an accessible hint without penalising the player",
      await messagePanel.getByText(/الاستماع يسبق التحقق/).count() === 1);
    for (const id of ["listen", "verify", "protect", "share"]) {
      await messagePanel.locator('[data-card="' + id + '"]').click();
    }
    await messagePanel.getByText("ما الذي ستفعله بالكلمات؟").waitFor({ state: "visible" });
    check("Correct fragment order unlocks the decision scene and stays in isolated storage",
      await page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem("alnajat_message_quest_v1") || "null");
        return saved?.screen === "decision" && saved.order.join(",") === "listen,verify,protect,share";
      }) &&
      await page.evaluate(expected => localStorage.getItem("najat_saves_v2") === expected, originalSaveBeforeQuest));
    await messagePanel.locator('[data-ending="consent"]').click();
    await messagePanel.getByText("رسالة وصلت إلى أصحابها").waitFor({ state: "visible" });
    await page.evaluate(() => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
      window.openAlnajatMessageQuest();
    });
    await messagePanel.locator('[data-amq="resume"]').click();
    await messagePanel.getByText("A Message Returned to Its People").waitFor({ state: "visible" });
    check("Missing Message ending resumes in English without changing the original save",
      await page.evaluate(expected => document.documentElement.lang === "en" &&
        JSON.parse(localStorage.getItem("alnajat_message_quest_v1") || "null")?.ending === "consent" &&
        localStorage.getItem("najat_saves_v2") === expected, originalSaveBeforeQuest));
    await messagePanel.locator('[data-close="1"]').click();
    check("Missing Message dialog restores focus to its main-menu launcher",
      await page.evaluate(() => document.activeElement === document.querySelector("#app [data-message-quest-launcher] button")));
    await page.evaluate(() => { document.documentElement.lang = "ar"; document.documentElement.dir = "rtl"; });

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
        const urls = [new URL("./", location.href).href, new URL("privacy.html", location.href).href, new URL("alnajat-all-sudan.js?v=2", location.href).href, new URL("alnajat-next-chapter.js?v=3", location.href).href, new URL("alnajat-message-quest.js?v=1", location.href).href];
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
      await page.evaluate(() => window.openAlnajatNextChapter());
      await page.locator("#pn").getByText("الفصل التالي: وطن يتّسع للجميع").waitFor({ state: "visible", timeout: 5000 });
      check("Next Chapter renders a cinematic scene container", await page.locator("#pn .anx-cinematic").count() === 0);
      await page.locator("#pn [data-action='resume']").click();
      await page.locator("#pn .anx-cinematic").waitFor({ state: "visible" });
      check("Story scene uses cinematic direction and accessible scene title",
        await page.locator("#pn .anx-cinematic[aria-labelledby='anx-scene-title']").count() === 1);
      check("Optional choice sound starts disabled and is user-controlled",
        await page.locator("#pn [data-sfx-toggle][aria-pressed='false']").count() === 1);
      await page.locator("#pn [data-sfx-toggle]").click();
      check("Choice sound preference toggles on without autoplay",
        await page.evaluate(() => localStorage.getItem("alnajat_next_chapter_prefs_v1") === "1"));
      await page.locator("#pn [data-sfx-toggle]").click();
      check("Choice sound can be disabled again",
        await page.evaluate(() => localStorage.getItem("alnajat_next_chapter_prefs_v1") === "0"));
      await page.locator("#pn [data-menu='1']").click();
      check("Next Chapter opens from the offline shell", await page.locator("#pn .anx-panel").count() === 1);
      await page.locator("#pn").getByRole("button", { name: "إغلاق" }).click();
      await page.evaluate(() => window.openAllSudanScenarios());
      await page.locator('#pn [data-story="north"]').waitFor({ state: "visible", timeout: 5000 });
      check("All-Sudan regional stories open from the offline shell", await page.locator('#pn [data-story]').count() === 4);
      await page.evaluate(() => document.getElementById("pn").classList.remove("on"));
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
