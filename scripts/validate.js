#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const fail = (message) => { console.error("✖ " + message); process.exitCode = 1; };
const pass = (message) => console.log("✓ " + message);

try {
  const html = read("index.html");
  const sw = read("sw.js");
  execFileSync(process.execPath, [path.join(__dirname, "story-integrity.js")], { stdio: "inherit" });
  const manifest = JSON.parse(read("manifest.json"));
  if (!html.includes("</body>") || !html.includes("</html>")) fail("index.html is missing closing document tags");
  else pass("HTML document has closing tags");

  const markup = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, "");
  const tags = [...markup.matchAll(/<script\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>/gi)].map(m => m[1]);
  const unique = new Set(tags);
  if (tags.length !== unique.size) fail("Duplicate external script tags found");
  else pass("External script tags are unique");

  for (const src of tags) {
    const file = src.split("?")[0];
    if (!fs.existsSync(path.join(root, file))) { fail("Missing script file: " + file); continue; }
    try {
      execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "pipe" });
      pass("Syntax OK: " + file);
    } catch (e) {
      fail("JavaScript syntax error in " + file + "\n" + (e.stderr ? e.stderr.toString() : e.message));
    }
    if (!sw.includes("'./" + src + "'")) fail("Service worker shell does not cache " + src);
  }

  if (!manifest.name || !manifest.start_url || !manifest.scope) fail("Web app manifest is missing required fields");
  else pass("Web app manifest parses and has required fields");

  const version = (sw.match(/const VERSION\s*=\s*'([^']+)'/) || [])[1];
  if (!version) fail("Service worker cache version is missing");
  else pass("Service worker cache version: " + version);

  if (!html.includes('id="app"') || !html.includes('id="pn"')) fail("Core app or panel mount point is missing");
  else pass("Core application mount points are present");

  // Chronology regression guards: historical branches must never jump backwards.
  const rev6Start = html.indexOf("S.rev6 =");
  const sd2013Start = html.indexOf("S.sd2013 =");
  const sd2026Start = html.indexOf("S.sd2026 =");
  const translationsStart = html.indexOf("/* ═══", sd2026Start);
  if (rev6Start < 0 || sd2013Start <= rev6Start) fail("Could not locate the post-2019 chronology branch");
  else {
    const rev6Block = html.slice(rev6Start, sd2013Start);
    if (!rev6Block.includes('"sd2020"') || rev6Block.includes('"sd2013"')) fail("The post-June-2019 branch must continue to 2020, not return to 2013");
    else pass("Post-2019 revolution branch continues forward to 2020");
  }
  if (sd2026Start < 0) fail("Could not locate the 2026 chronology endpoint");
  else {
    const sd2026Block = html.slice(sd2026Start, translationsStart > sd2026Start ? translationsStart : sd2026Start + 12000);
    if (!sd2026Block.includes('"fin"') || sd2026Block.includes('"r2"')) fail("The 2026 endpoint must finish the journey, not return to the 2019 General Command scene");
    else pass("2026 chronology endpoint finishes without a backward jump to 2019");
  }

  const audio = read("alnajat-audio-engine.js");
  for (const marker of [
    'musicOn: false',
    'Number.isFinite(value) ? Math.max(0, Math.min(1, value))',
    'if (settings.musicOn) startMusic();',
    'if (settings.ambienceOn) refreshAmbience();',
    'let resumeAfterVisibility = false;',
    'else if (!document.hidden && resumeAfterVisibility)'
  ]) if (!audio.includes(marker)) fail("Audio engine regression guard missing: " + marker);
  if (!html.includes('alnajat-audio-engine.js?v=2') || !sw.includes("'./alnajat-audio-engine.js?v=2'")) {
    fail("Audio engine v2 is not loaded by both the page and offline shell");
  } else pass("Audio settings persistence, unlock, visibility resume and offline version are wired");

  const editorial = read("alnajat-editorial.js");
  if (!html.includes('alnajat-editorial.js?v=7') || !sw.includes("'./alnajat-editorial.js?v=7'")) {
    fail("Updated chronology migration is not loaded by both the page and offline shell");
  } else if (!editorial.includes('nid==="r2"&&last&&last.n==="sd2026"') || !editorial.includes('nid==="__ALNAJAT_FINISH__"')) {
    fail("Legacy 2026-to-2019 save migration is missing");
  } else pass("Legacy saves at the 2026-to-2019 loop are migrated to the ending");

  const sourcesPage = read("sources.html");
  if (!sw.includes("'./sources.html'")) fail("Offline shell does not cache the historical sources page");
  else pass("Historical sources page is cached for offline use");
  for (const sourceId of ["SRC-001","SRC-002","SRC-003","SRC-004","SRC-005","SRC-006","SRC-007","SRC-008","SRC-009","SRC-010","SRC-011","SRC-012","SRC-013"]) {
    if (!sourcesPage.includes('id="' + sourceId + '"')) fail("Missing source card: " + sourceId);
  }
  const safety = read("alnajat-safety.js");
  if (!html.includes('alnajat-safety.js?v=8') || !sw.includes("'./alnajat-safety.js?v=8'")) {
    fail("Scene safety layer v7 is not referenced by both the page and offline shell");
  } else pass("Scene safety layer v7 is loaded and included in the offline shell");
  for (const marker of ["function sharedContinuation", "function showSceneWarning", "Read a safe summary", "Skip this scene", "choice[4]||choice[5]", "choice[5]", 'target.charAt(0)==="@', 'if(target!=="fin"&&!S[target])return null;', 'makeGate(function(){window.renderNode(nid);});', 'if(typeof onProceed==="function")onProceed();']) {
    if (!safety.includes(marker)) fail("Safety layer is missing expected feature marker: " + marker);
  }
  if (!safety.includes('aria-modal","true"') || !safety.includes("aria-labelledby")) {
    fail("Scene safety dialog is missing basic accessible dialog semantics");
  } else pass("Scene safety dialog has accessible labeling and modal semantics");
  const storyNodeIds = new Set();
  const baseStory = html.match(/const S=\{([\s\S]*?)\n\};/);
  if (!baseStory) fail("Could not locate the base story node table");
  else for (const match of baseStory[1].matchAll(/^\s*([A-Za-z0-9_]+):\[/gm)) storyNodeIds.add(match[1]);
  const nodePatterns = [
    /\bS\.([A-Za-z0-9_]+)\s*=\s*\[/g,
    /\bS\[\s*["']([^"']+)["']\s*\]\s*=\s*\[/g,
    /\bN\(\s*["']([^"']+)["']/g,
    /\bLOOP\(\s*["']([^"']+)["']/g
  ];
  for (const pattern of nodePatterns) for (const match of html.matchAll(pattern)) storyNodeIds.add(match[1]);
  const sceneSafetyIds = [...safety.matchAll(/^\s{4}([A-Za-z0-9_]+):\{level:/gm)].map(match => match[1]);
  for (const id of sceneSafetyIds) if (!storyNodeIds.has(id)) fail("Safety metadata points to an unknown story node: " + id);
  if (sceneSafetyIds.length < 53) fail("Expected at least 53 scene safety entries, found " + sceneSafetyIds.length);
  if (!process.exitCode) pass("All " + sceneSafetyIds.length + " scene safety entries map to real story nodes");
  if (!safety.includes("var SCENE_SOURCES=") || !safety.includes("sources.html#")) fail("Scene-to-source links are missing");
  const sourceMapBlock = (safety.match(/var SCENE_SOURCES=\{([\s\S]*?)\n  \};/) || [])[1] || "";
  const mappedSceneIds = [...sourceMapBlock.matchAll(/([A-Za-z][A-Za-z0-9_]*):\[/g)].map(match => match[1]);
  for (const id of mappedSceneIds) if (!storyNodeIds.has(id)) fail("Source map points to an unknown story node: " + id);
  if (!safety.includes("injectSourcesButton")) fail("Main-menu source navigation is missing");
  if (!safety.includes("SCENES[key]=value")) fail("Extended safety metadata is not merged into the live scene registry");
  else pass("Extended safety metadata is merged into the live scene registry");
  if (/user-scalable\s*=\s*no/i.test(html)) fail("Viewport still disables user zoom");
  else pass("User zoom is not disabled by the viewport meta tag");

  // Every story node must have an English counterpart, including nodes
  // declared after the original S/EN object literals.
  const translationIds = new Set();
  const baseTranslations = html.match(/const EN=\{([\s\S]*?)\n\};/);
  if (!baseTranslations) fail("Could not locate the English translation table");
  else for (const match of baseTranslations[1].matchAll(/^\s*([A-Za-z0-9_]+):/gm)) translationIds.add(match[1]);
  for (const match of html.matchAll(/\bEN\.([A-Za-z0-9_]+)\s*=/g)) translationIds.add(match[1]);
  const missingTranslations = [...storyNodeIds].filter(id => !translationIds.has(id));
  if (missingTranslations.length) fail("Missing English translations for: " + missingTranslations.join(", "));
  else pass("All " + storyNodeIds.size + " story nodes have English translations");

  const lock = JSON.parse(read("story-lock.json"));
  if (lock.inventory && lock.inventory.totalStoryNodes !== storyNodeIds.size) {
    fail("Story-lock totalStoryNodes mismatch: expected " + lock.inventory.totalStoryNodes + ", found " + storyNodeIds.size);
  } else if (lock.inventory && lock.inventory.totalStoryNodes === storyNodeIds.size) {
    pass("Complete story-node inventory matches story-lock.json");
  }

  if (process.exitCode) process.exit(process.exitCode);
  console.log("\nALNAJAT static release checks passed.");
} catch (error) {
  fail(error.stack || String(error));
}
