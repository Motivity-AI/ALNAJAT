#!/usr/bin/env node
"use strict";

/*
 * ALNAJAT Next Chapter release gate.
 * Pins the authored bilingual scenes + endings and exhaustively explores the
 * finite choice graph. Updating the fingerprint requires deliberate editorial
 * review; never regenerate it automatically during validation.
 */
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.resolve(__dirname, "..", "alnajat-next-chapter.js"), "utf8");
const EXPECTED_DATA_FINGERPRINT = "39b44094";
const fail = message => { console.error("✖ " + message); process.exitCode = 1; };
const pass = message => console.log("✓ " + message);

function extractObject(marker) {
  const at = source.indexOf(marker);
  if (at < 0) throw new Error("Missing marker: " + marker);
  const start = source.indexOf("{", at);
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error("Unclosed object after " + marker);
}

function fingerprint(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

try {
  new Function(source);
  pass("Next Chapter source parses as JavaScript");

  const sceneSource = extractObject("const scenes =");
  const endingSource = extractObject("const endings=");
  const actualFingerprint = fingerprint(sceneSource + "\n" + endingSource);
  if (actualFingerprint !== EXPECTED_DATA_FINGERPRINT) {
    fail("Story Lock mismatch: expected " + EXPECTED_DATA_FINGERPRINT + ", found " + actualFingerprint +
      ". Review the complete bilingual story diff before intentionally updating the lock.");
  } else pass("Bilingual scene text, choices, effects and endings match the reviewed Story Lock");

  const scenes = new Function("return (" + sceneSource + ")")();
  const endings = new Function("return (" + endingSource + ")")();
  const ids = Object.keys(scenes);
  if (ids.length !== 18) fail("Expected 18 locked scenes, found " + ids.length);
  else pass("All 18 authored scenes remain present");

  const requiredRoutes = ["north", "east", "south", "centre"];
  const requiredFollowups = [
    "north_record", "north_team", "east_rules", "east_dialogue",
    "south_verify", "south_play", "centre_record", "centre_coop"
  ];
  if (!requiredRoutes.every(id => scenes[id])) fail("A regional route is missing");
  else pass("North, East, South and Centre/Gezira/Khartoum routes are present");
  if (!requiredFollowups.every(id => scenes[id])) fail("A route-specific follow-up scene is missing");
  else pass("All eight route-specific follow-up scenes are present");
  if (Object.keys(endings).sort().join(",") !== ["accountable", "care", "together", "unfinished"].sort().join(",")) {
    fail("The four reviewed additional endings changed");
  } else pass("All four reviewed additional endings remain present");

  const validStats = new Set(["truth", "care", "solidarity", "agency", "bond"]);
  const edges = [];
  for (const [id, scene] of Object.entries(scenes)) {
    if (!Array.isArray(scene.title) || scene.title.length !== 2 || !scene.title.every(x => typeof x === "string" && x.trim())) {
      fail("Bilingual title missing or incomplete: " + id);
    }
    if (!Array.isArray(scene.text) || scene.text.length !== 2 || !scene.text.every(x => typeof x === "string" && x.trim())) {
      fail("Bilingual scene text missing or incomplete: " + id);
    }
    if (!Array.isArray(scene.choices) || scene.choices.length < 2) fail("Scene has fewer than two choices: " + id);
    for (const choice of scene.choices || []) {
      if (!Array.isArray(choice.label) || choice.label.length !== 2 ||
          !choice.label.every(x => typeof x === "string" && x.trim())) fail("Bilingual choice missing: " + id);
      if (typeof choice.to !== "string" || (choice.to !== "ending" && !scenes[choice.to])) {
        fail("Invalid scene target: " + id + " -> " + choice.to);
        continue;
      }
      for (const [metric, effect] of Object.entries(choice.fx || {})) {
        if (!validStats.has(metric) || !Number.isFinite(effect)) fail("Invalid choice effect in " + id + ": " + metric);
      }
      edges.push({ from: id, to: choice.to, choice });
    }
  }

  const pathCounts = { north: 0, east: 0, south: 0, centre: 0 };
  const endingCounts = { accountable: 0, care: 0, together: 0, unfinished: 0 };
  const reached = new Set();
  let completePaths = 0, cycleCount = 0, maxDepth = 0;
  const initial = { truth: 0, care: 0, solidarity: 0, agency: 0, bond: 0 };

  function visit(id, stats, route, stack, depth) {
    if (stack.includes(id)) { cycleCount++; return; }
    const scene = scenes[id];
    if (!scene) return;
    reached.add(id);
    maxDepth = Math.max(maxDepth, depth);
    for (const edge of edges.filter(item => item.from === id)) {
      const nextStats = Object.assign({}, stats);
      for (const [key, amount] of Object.entries(edge.choice.fx || {})) {
        nextStats[key] = Math.max(-5, Math.min(20, (nextStats[key] || 0) + amount));
      }
      const nextRoute = edge.choice.route || route;
      if (edge.to === "ending") {
        completePaths++;
        if (nextRoute) pathCounts[nextRoute]++;
        const ending = nextStats.truth >= 5 && nextStats.agency >= 4 ? "accountable" :
          nextStats.care >= 5 && nextStats.bond >= 3 ? "care" :
          nextStats.solidarity >= 5 ? "together" : "unfinished";
        endingCounts[ending]++;
      } else {
        visit(edge.to, nextStats, nextRoute, stack.concat(id), depth + 1);
      }
    }
  }

  visit("prologue", initial, null, [], 1);
  const unreachable = ids.filter(id => !reached.has(id));
  if (unreachable.length) fail("Unreachable scenes: " + unreachable.join(", "));
  else pass("All scenes are reachable from the prologue");
  if (cycleCount) fail("Choice graph contains " + cycleCount + " cyclic path(s)");
  else pass("No accidental cycles in the expansion graph");
  if (completePaths !== 768) fail("Expected 768 complete choice paths, found " + completePaths);
  else pass("All 768 possible choice paths terminate at an ending");
  for (const route of requiredRoutes) {
    if (pathCounts[route] !== 192) fail("Expected 192 complete paths for " + route + ", found " + pathCounts[route]);
  }
  if (requiredRoutes.every(route => pathCounts[route] === 192)) pass("Each of the four regional routes has 192 complete paths");
  const missingEndings = Object.keys(endingCounts).filter(key => endingCounts[key] === 0);
  if (missingEndings.length) fail("Ending(s) cannot be earned: " + missingEndings.join(", "));
  else pass("Every ending is earned by at least one valid decision path");
  if (Object.keys(endingCounts).every(key => endingCounts[key] > 0)) {
    pass("Ending reachability: " + Object.entries(endingCounts).map(([key, count]) => key + "=" + count).join(", "));
  }

  if (!source.includes('const KEY = "alnajat_next_chapter_v1"') ||
      !source.includes('const archiveKey="alnajat_next_chapter_archive_v1"') ||
      !source.includes('const PREF_KEY="alnajat_next_chapter_prefs_v1"')) {
    fail("Expansion save, archive and preference keys must remain isolated");
  } else pass("Expansion saves, archive and audio preferences remain isolated");
  if (/localStorage\.(clear|removeItem)\s*\(/.test(source) || /\bS\s*\[[^\]]+\]\s*=/.test(source)) {
    fail("Expansion must not clear saves or mutate the canonical story graph");
  } else pass("No broad save deletion or canonical story graph mutation found");
  if (!source.includes("collects no player analytics") || !source.includes("لا يجمع الفصل بيانات أو تحليلات عن اللاعبين")) {
    fail("No-player-analytics disclosure is missing");
  } else pass("No player analytics collection is disclosed or introduced");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("\nALNAJAT Next Chapter release gate passed. Maximum path depth: " + maxDepth + ".");
} catch (error) {
  fail(error.stack || String(error));
}
