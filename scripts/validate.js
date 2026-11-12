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

  // Build the effective story graph from the original scene table, N()/LOOP()
  // declarations, later S.* assignments, and explicit runtime-added choices.
  function balancedEnd(source, start, open, close) {
    let depth = 0, quote = null, escaped = false;
    for (let i = start; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === "\\") { escaped = true; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "\`") { quote = ch; continue; }
      if (ch === open) depth++;
      else if (ch === close && --depth === 0) return i + 1;
    }
    return -1;
  }
  function splitTopLevel(source) {
    const parts = [];
    let start = 0, depth = 0, quote = null, escaped = false;
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      if (quote) {
        if (escaped) { escaped = false; continue; }
        if (ch === "\\") { escaped = true; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === "\`") { quote = ch; continue; }
      if (ch === "(" || ch === "[" || ch === "{") depth++;
      else if (ch === ")" || ch === "]" || ch === "}") depth--;
      else if (ch === "," && depth === 0) {
        parts.push(source.slice(start, i).trim());
        start = i + 1;
      }
    }
    parts.push(source.slice(start).trim());
    return parts;
  }
  function literalString(expression) {
    const match = expression.match(/^\s*(["'])(.*?)\1\s*$/s);
    return match ? match[2] : null;
  }
  const graphNodes = new Set();
  const graphEdges = [];
  const loopNodes = new Set();
  const sceneChoiceCounts = new Map();
  function addSceneArray(id, source) {
    if (!id || !source || source[0] !== "[") return;
    graphNodes.add(id);
    const fields = splitTopLevel(source.slice(1, -1));
    if (fields.length < 3) return;
    sceneChoiceCounts.set(id, fields[2][0] === "[" ? splitTopLevel(fields[2].slice(1, -1)).filter(Boolean).length : 0);
    for (const choice of fields[2].matchAll(/\[\s*(["'])(.*?)\1\s*,\s*(["'])(.*?)\3/g)) {
      const target = choice[4].startsWith("@") ? choice[4].slice(1) : choice[4];
      graphEdges.push([id, target]);
    }
  }
  const baseObjectStart = html.indexOf("const S={");
  if (baseObjectStart < 0) fail("Could not locate the base story object for graph audit");
  else {
    const objectOpen = html.indexOf("{", baseObjectStart);
    const objectEnd = balancedEnd(html, objectOpen, "{", "}");
    if (objectEnd < 0) fail("Could not parse the base story object");
    else {
      for (const entry of splitTopLevel(html.slice(objectOpen + 1, objectEnd - 1))) {
        const key = entry.match(/^([A-Za-z_$][\w$]*)\s*:\s*\[/);
        if (key) addSceneArray(key[1], entry.slice(entry.indexOf("[")));
      }
    }
  }
  for (const pattern of [
    /\bS\.([A-Za-z0-9_]+)\s*=\s*\[/g,
    /\bS\[\s*["']([^"']+)["']\s*\]\s*=\s*\[/g
  ]) {
    for (const match of html.matchAll(pattern)) {
      const start = match.index + match[0].lastIndexOf("[");
      const end = balancedEnd(html, start, "[", "]");
      if (end > 0) addSceneArray(match[1], html.slice(start, end));
    }
  }
  function callArguments(match) {
    const open = html.indexOf("(", match.index);
    const end = balancedEnd(html, open, "(", ")");
    return end < 0 ? [] : splitTopLevel(html.slice(open + 1, end - 1));
  }
  for (const match of html.matchAll(/\bN\s*\(/g)) {
    const args = callArguments(match);
    const id = literalString(args[0] || "");
    const target = literalString(args[2] || "");
    if (id) {
      graphNodes.add(id);
      sceneChoiceCounts.set(id, args[4] && literalString(args[4]) !== null ? 2 : 1);
      if (target) graphEdges.push([id, target]);
    }
  }
  for (const match of html.matchAll(/\bLOOP\s*\(/g)) {
    const args = callArguments(match);
    const id = literalString(args[0] || "");
    const target = literalString(args[1] || "");
    if (id) {
      graphNodes.add(id);
      loopNodes.add(id);
      sceneChoiceCounts.set(id, args[4] && args[4][0] === "[" ? splitTopLevel(args[4].slice(1, -1)).filter(Boolean).length : 0);
      graphEdges.push([id, id]);
      if (target) graphEdges.push([id, target]);
    }
  }
  const pushPattern = /\b(?:S\.([A-Za-z0-9_]+)|([A-Za-z0-9_]+))\s*\[\s*2\s*\]\s*\.push\(\s*\[/g;
  for (const match of html.matchAll(pushPattern)) {
    const owner = match[1] || match[2];
    const start = match.index + match[0].lastIndexOf("[");
    const end = balancedEnd(html, start, "[", "]");
    if (end > 0) {
      const pushed = html.slice(start, end);
      const target = pushed.match(/^\[\s*["'][^"']*["']\s*,\s*["']([^"']+)["']/);
      if (target) {
        graphEdges.push([owner, target[1].startsWith("@") ? target[1].slice(1) : target[1]]);
        sceneChoiceCounts.set(owner, (sceneChoiceCounts.get(owner) || 0) + 1);
      }
    }
  }
  const effectiveTargets = {
    sd2014: ["s5"],
    sd2020: ["r2b"],
    s6: ["sd2021"],
    sd2022: ["s6d"],
    s6d: ["s6b"],
    s6c: ["q1"]
  };
  for (const [owner, targets] of Object.entries(effectiveTargets)) {
    for (let i = graphEdges.length - 1; i >= 0; i--) {
      if (graphEdges[i][0] === owner) graphEdges.splice(i, 1);
    }
    targets.forEach(target => graphEdges.push([owner, target]));
  }
  // Verify the correct EN schema for both [text, choices] and
  // [chapterTitle, text, choices] nodes, including dynamically appended choices.
  const englishChoiceCounts = new Map();
  function addEnglishArray(id, source) {
    if (!id || !source || source[0] !== "[") return;
    const fields = splitTopLevel(source.slice(1, -1));
    const choiceField = fields[2] && fields[2][0] === "[" ? fields[2] : fields[1];
    englishChoiceCounts.set(id, choiceField && choiceField[0] === "["
      ? splitTopLevel(choiceField.slice(1, -1)).filter(Boolean).length : 0);
  }
  const enObjectStart = html.indexOf("const EN={");
  if (enObjectStart < 0) fail("Could not locate the English translation object for choice coverage");
  else {
    const enOpen = html.indexOf("{", enObjectStart);
    const enEnd = balancedEnd(html, enOpen, "{", "}");
    if (enEnd < 0) fail("Could not parse the English translation object");
    else {
      for (const entry of splitTopLevel(html.slice(enOpen + 1, enEnd - 1))) {
        const key = entry.match(/^([A-Za-z_$][\w$]*)\s*:\s*\[/);
        if (key) addEnglishArray(key[1], entry.slice(entry.indexOf("[")));
      }
    }
  }
  for (const match of html.matchAll(/\bEN\.([A-Za-z0-9_]+)\s*=\s*\[/g)) {
    const start = match.index + match[0].lastIndexOf("[");
    const end = balancedEnd(html, start, "[", "]");
    if (end > 0) addEnglishArray(match[1], html.slice(start, end));
  }
  for (const match of html.matchAll(/\bEN\.([A-Za-z0-9_]+)\s*\[\s*\d+\s*\]\s*\.push\(/g)) {
    englishChoiceCounts.set(match[1], (englishChoiceCounts.get(match[1]) || 0) + 1);
  }
  const choiceTranslationMismatches = [...graphNodes].filter(id =>
    (sceneChoiceCounts.get(id) || 0) !== (englishChoiceCounts.get(id) || 0));
  if (choiceTranslationMismatches.length) {
    fail("English choice coverage mismatch: " + choiceTranslationMismatches.map(id =>
      id + " (AR " + (sceneChoiceCounts.get(id) || 0) + ", EN " + (englishChoiceCounts.get(id) || 0) + ")").join(", "));
  } else pass("Arabic/English choice counts match for all " + graphNodes.size + " story nodes");

  const deathBlock = (html.match(/const X=\{([\s\S]*?)\n\};/) || [])[1] || "";
  const deathIds = new Set([...deathBlock.matchAll(/^\s*([A-Za-z0-9_]+):/gm)].map(match => match[1]));
  const invalidTargets = [...new Set(graphEdges
    .filter(([, target]) => target !== "fin" && !graphNodes.has(target) && !deathIds.has(target))
    .map(([, target]) => target))];
  if (invalidTargets.length) fail("Story graph contains unknown targets: " + invalidTargets.join(", "));
  const reachableNodes = new Set(["d0"]);
  const queue = ["d0"];
  while (queue.length) {
    const current = queue.shift();
    for (const [from, to] of graphEdges) {
      if (from === current && graphNodes.has(to) && !reachableNodes.has(to)) {
        reachableNodes.add(to);
        queue.push(to);
      }
    }
  }
  const unreachableNodes = [...graphNodes].filter(id => !reachableNodes.has(id));
  if (unreachableNodes.length) fail("Story nodes unreachable from d0: " + unreachableNodes.join(", "));
  else pass("All " + graphNodes.size + " story nodes are reachable from d0");
  for (const id of loopNodes) {
    const outgoing = graphEdges.filter(([from]) => from === id).map(([, to]) => to);
    if (!outgoing.includes(id) || outgoing.length < 2) fail("Loop node lacks a self-cycle or exit: " + id);
  }
  if (loopNodes.size && [...loopNodes].every(id => {
    const outgoing = graphEdges.filter(([from]) => from === id).map(([, to]) => to);
    return outgoing.includes(id) && outgoing.some(target => target !== id && (target === "fin" || graphNodes.has(target) || deathIds.has(target)));
  })) pass("All " + loopNodes.size + " repeat loops have a valid exit path");
  if (graphNodes.size !== lock.inventory.totalStoryNodes) {
    fail("Story graph node count does not match Story Lock: " + graphNodes.size + " vs " + lock.inventory.totalStoryNodes);
  }
  if (!graphEdges.some(([, target]) => target === "fin")) fail("No route reaches the canonical ending node");
  else pass("At least one valid route reaches the canonical ending node");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("\nALNAJAT static release checks passed.");
} catch (error) {
  fail(error.stack || String(error));
}
