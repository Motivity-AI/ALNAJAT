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

  const safety = read("alnajat-safety.js");
  if (!html.includes('alnajat-safety.js?v=2') || !sw.includes("'./alnajat-safety.js?v=2'")) {
    fail("Scene safety layer v2 is not referenced by both the page and offline shell");
  } else pass("Scene safety layer v2 is loaded and included in the offline shell");
  for (const marker of ["function sharedContinuation", "function showSceneWarning", "Read a safe summary", "Skip this scene"]) {
    if (!safety.includes(marker)) fail("Safety layer is missing expected feature marker: " + marker);
  }
  if (!safety.includes('aria-modal","true"') || !safety.includes("aria-labelledby")) {
    fail("Scene safety dialog is missing basic accessible dialog semantics");
  } else pass("Scene safety dialog has accessible labeling and modal semantics");
  if (/user-scalable\s*=\s*no/i.test(html)) fail("Viewport still disables user zoom");
  else pass("User zoom is not disabled by the viewport meta tag");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("\nALNAJAT static release checks passed.");
} catch (error) {
  fail(error.stack || String(error));
}
