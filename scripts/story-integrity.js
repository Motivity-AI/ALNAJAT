#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const baseline = JSON.parse(fs.readFileSync(path.join(root, "story-lock.json"), "utf8"));
const fail = (message) => { console.error("✖ STORY LOCK: " + message); process.exitCode = 1; };
const pass = (message) => console.log("✓ STORY LOCK: " + message);

function section(start, end) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  if (from < 0 || to < 0 || to <= from) throw new Error("Missing or reordered protected marker: " + start);
  return html.slice(from, to);
}

try {
function assignedArrayBlocks(source, pattern) {
  const blocks = [];
  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    const open = source.indexOf("[", start);
    let depth = 0, quote = null, escaped = false, end = -1;
    for (let i = open; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === "\\") { escaped = true; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "\`") { quote = ch; continue; }
      if (ch === "[") depth++;
      else if (ch === "]" && --depth === 0) { end = i + 1; break; }
    }
    if (end < 0) throw new Error("Unclosed scene/translation assignment: " + match[1]);
    while (end < source.length && /\s/.test(source[end])) end++;
    if (source[end] === ";") end++;
    blocks.push(source.slice(start, end));
  }
  return blocks;
}

function hashFingerprint(source) {
  let hash = 0xcbf29ce484222325n;
  for (let i = 0; i < source.length; i++) {
    hash ^= BigInt(source.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, "0");
}

  const protectedText = baseline.protectedSections
    .map((part) => section(part.start, part.end))
    .join("\n/* ALNAJAT STORY LOCK SECTION */\n");

  // FNV-1a 64-bit over UTF-16 code units. This is a regression guard, not a
  // cryptographic signature. Never refresh it automatically after a mismatch.
  let hash = 0xcbf29ce484222325n;
  for (let i = 0; i < protectedText.length; i++) {
    hash ^= BigInt(protectedText.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  const fingerprint = hash.toString(16).padStart(16, "0");
  if (fingerprint !== baseline.expectedFingerprint) {
    fail("protected story text, choices, effects, translations or endings changed. Expected "
      + baseline.expectedFingerprint + ", got " + fingerprint + ". Review manually; do not auto-update story-lock.json.");
  } else {
    pass("Arabic story, choice logic, death events, translations and ending definitions match the approved baseline");
  }

  const storyStart = html.indexOf("/* ==================== STORY DATA (Arabic) ==================== */");
  const deathStart = html.indexOf("/* ==================== DEATH EVENTS (AR + EN) ==================== */", storyStart);
  const storySource = html.slice(storyStart, deathStart);
  const baseBlock = (storySource.match(/const S=\{([\s\S]*?)\n\};/) || [])[1];
  if (!baseBlock) throw new Error("Could not locate the base story-node object");
  const baseSceneIds = [...baseBlock.matchAll(/^\s*([A-Za-z_$][\w$]*):\s*\[/gm)].length;
  const extraSceneIds = [...storySource.matchAll(/\bN\("[^"]+"/g)].length
    + [...storySource.matchAll(/\bS\["[^"]+"\]\s*=/g)].length;
  const loopIds = [...storySource.matchAll(/\bLOOP\("[^"]+"/g)].length;

  const enStart = html.indexOf("/* ==================== ENGLISH TRANSLATIONS (all ~98 scenes) ==================== */");
  const enEnd = html.indexOf("/* ==================== TRANSLATION HELPERS ==================== */", enStart);
  const enSource = html.slice(enStart, enEnd);
  const enBlock = (enSource.match(/const EN=\{([\s\S]*?)\n\};/) || [])[1];
  if (!enBlock) throw new Error("Could not locate the English translation object");
  const englishTranslationKeys = [...enBlock.matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)].length;

  const endingsStart = html.indexOf("/* ==================== ITEMS / ACHIEVEMENTS / ENDINGS ==================== */");
  const endingsEnd = html.indexOf("/* ==================== UTILS ==================== */", endingsStart);
  const endingsSource = html.slice(endingsStart, endingsEnd);
  const endingObject = (endingsSource.match(/const END(?:INGS|_META)?=\{([\s\S]*?)\n\};/) || [])[1];
  const endingIds = endingObject ? [...endingObject.matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)].length : 0;

  const extendedScenes = assignedArrayBlocks(html, /\bS\.([A-Za-z0-9_]+)\s*=\s*\[/g);
  const extendedTranslations = assignedArrayBlocks(html, /\bEN\.([A-Za-z0-9_]+)\s*=\s*\[/g);
  const sceneFingerprint = hashFingerprint(extendedScenes.join("\n/* SCENE */\n"));
  const translationFingerprint = hashFingerprint(extendedTranslations.join("\n/* TRANSLATION */\n"));
  if (extendedScenes.length !== baseline.extendedAssignments.sceneCount
      || sceneFingerprint !== baseline.extendedAssignments.sceneFingerprint) {
    fail("additional scene assignments changed or are missing; review every scene before updating story-lock.json");
  } else pass("all additional scene texts and choices match the approved Story Lock");
  if (extendedTranslations.length !== baseline.extendedAssignments.translationCount
      || translationFingerprint !== baseline.extendedAssignments.translationFingerprint) {
    fail("additional English translations changed or are missing; review every translation before updating story-lock.json");
  } else pass("all additional English translations match the approved Story Lock");

  const actual = {
    baseSceneIds,
    additionalSceneIds: extraSceneIds,
    loopIds,
    englishTranslationKeys,
    endingIds,
    totalStoryNodes: baseSceneIds + extraSceneIds + loopIds + extendedScenes.length,
    totalEnglishTranslations: englishTranslationKeys + extendedTranslations.length
  };
  for (const [key, expected] of Object.entries(baseline.inventory)) {
    if (actual[key] !== expected) fail(key + " inventory mismatch: expected " + expected + ", got " + actual[key]);
  }
  if (!process.exitCode) pass("inventory verified: " + JSON.stringify(actual));
} catch (error) {
  fail(error.stack || String(error));
}

if (process.exitCode) process.exit(process.exitCode);
console.log("\nALNAJAT story integrity checks passed.");
