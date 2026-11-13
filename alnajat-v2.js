/* ALNAJAT 2.0 — accessibility and reading comfort layer.
   Additive only: story scenes, choices, saves and endings remain untouched. */
(function () {
  "use strict";
  if (window.__ALNAJAT_A11Y__) return;
  window.__ALNAJAT_A11Y__ = true;
  const KEY = "alnajat_a11y_v2";
  const defaults = { scale: 100, contrast: false, motion: false, voice: true };
  let prefs = Object.assign({}, defaults);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    prefs = Object.assign(prefs, saved);
    prefs.scale = [100, 112, 125].includes(Number(prefs.scale)) ? Number(prefs.scale) : defaults.scale;
    ["contrast", "motion", "voice"].forEach(function (key) {
      prefs[key] = typeof prefs[key] === "boolean" ? prefs[key] : defaults[key];
    });
  } catch (_) { prefs = Object.assign({}, defaults); }

  const css = [
    "body.alnajat-large-text #app{font-size:calc(1em * var(--alnajat-reader-scale,1))}",
    "body.alnajat-large-text #app button,body.alnajat-large-text #app input,body.alnajat-large-text #app select,body.alnajat-large-text #app textarea{font-size:inherit}",
    "body.alnajat-high-contrast{filter:contrast(1.18)}",
    "body.alnajat-high-contrast #app{outline:2px solid currentColor;outline-offset:-2px}",
    "body.alnajat-reduce-motion *,body.alnajat-reduce-motion *:before,body.alnajat-reduce-motion *:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}",
    "#alnajat-a11y-launch{position:fixed;z-index:99990;inset-inline-start:14px;bottom:calc(70px + env(safe-area-inset-bottom,0px));border:1px solid #ffffff59;border-radius:999px;padding:11px 15px;background:#171923;color:#fff;font:600 14px/1.2 system-ui,sans-serif;box-shadow:0 5px 22px #0006;cursor:pointer}",
    "#alnajat-a11y-launch:focus-visible,#alnajat-a11y-panel button:focus-visible{outline:3px solid #f4c95d;outline-offset:3px}",
    "#alnajat-a11y-backdrop{position:fixed;inset:0;z-index:99991;display:none;align-items:center;justify-content:center;padding:18px;background:#000b}",
    "#alnajat-a11y-backdrop.open{display:flex}",
    "#alnajat-a11y-panel{width:min(440px,100%);max-height:82vh;overflow:auto;background:#171923;color:#fff;border:1px solid #ffffff35;border-radius:18px;padding:20px;box-shadow:0 20px 70px #0009;font:15px/1.6 system-ui,sans-serif}",
    "#alnajat-a11y-panel h2{margin:0 0 8px;font-size:1.25rem}#alnajat-a11y-panel p{margin:0 0 14px;color:#d3d5df}",
    "#alnajat-a11y-panel .a11y-row{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 0;border-top:1px solid #ffffff20}",
    "#alnajat-a11y-panel button{border:1px solid #ffffff40;border-radius:10px;padding:9px 12px;background:#292d3a;color:#fff;font:inherit;cursor:pointer}",
    "#alnajat-a11y-panel button[aria-pressed=true]{background:#8b2635;border-color:#f4c95d}",
    "#alnajat-a11y-panel .a11y-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}#alnajat-a11y-panel .a11y-close{background:#8b2635}",
    ".alnajat-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}"
  ].join("");
  const style = document.createElement("style");
  style.id = "alnajat-a11y-style";
  style.textContent = css;
  document.head.appendChild(style);

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (_) {}
    document.body.style.setProperty("--alnajat-reader-scale", String(prefs.scale / 100));
    document.body.classList.toggle("alnajat-large-text", prefs.scale !== 100);
    document.body.classList.toggle("alnajat-high-contrast", !!prefs.contrast);
    document.body.classList.toggle("alnajat-reduce-motion", !!prefs.motion);
  }
  save();

  const launch = document.createElement("button");
  launch.id = "alnajat-a11y-launch";
  launch.type = "button";
  launch.textContent = "♿ سهولة الوصول";
  launch.setAttribute("aria-haspopup", "dialog");
  launch.setAttribute("aria-controls", "alnajat-a11y-panel");
  document.body.appendChild(launch);

  const backdrop = document.createElement("div");
  backdrop.id = "alnajat-a11y-backdrop";
  backdrop.innerHTML = '<section id="alnajat-a11y-panel" role="dialog" aria-modal="true" aria-labelledby="alnajat-a11y-title" aria-describedby="alnajat-a11y-desc" tabindex="-1"><h2 id="alnajat-a11y-title">إعدادات القراءة والراحة</h2><p id="alnajat-a11y-desc">خيارات تساعدك على قراءة الحكاية والتنقل فيها براحة. لا تغيّر أحداث القصة أو اختياراتك.</p><div class="a11y-row"><strong data-a11y-label="scale">حجم النص</strong><div><button type="button" data-scale="100">عادي</button> <button type="button" data-scale="112">كبير</button> <button type="button" data-scale="125">أكبر</button></div></div><div class="a11y-row"><span data-a11y-label="contrast">تباين أعلى</span><button type="button" data-toggle="contrast">تشغيل</button></div><div class="a11y-row"><span data-a11y-label="motion">تقليل الحركة والمؤثرات</span><button type="button" data-toggle="motion">تشغيل</button></div><div class="a11y-row"><span data-a11y-label="voice">القراءة الصوتية</span><button type="button" data-toggle="voice">تشغيل</button></div><div class="a11y-actions"><button type="button" id="alnajat-a11y-read">🔊 اقرأ المشهد</button><button type="button" id="alnajat-a11y-stop">إيقاف الصوت</button><button type="button" class="a11y-close" id="alnajat-a11y-close">إغلاق</button></div></section>';
  document.body.appendChild(backdrop);
  const panel = backdrop.querySelector("#alnajat-a11y-panel");
  const live = document.createElement("div");
  live.className = "alnajat-sr-only";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  document.body.appendChild(live);

  function applyLanguage() {
    const en = document.documentElement.lang === "en";
    const labels = en ? {
      launch: "♿ Accessibility", title: "Reading & comfort settings",
      desc: "Tools to make the story easier to read and navigate. They do not change story events or choices.",
      scale: "Text size", normal: "Default", large: "Large", larger: "Larger",
      contrast: "Higher contrast", motion: "Reduce motion and effects", voice: "Read aloud",
      read: "🔊 Read scene", stop: "Stop speech", close: "Close",
      on: "On", off: "Off", enabled: "Enabled", disabled: "Disabled",
      unsupported: "Speech reading is not supported in this browser.",
      empty: "There is no visible story text to read right now.",
      activate: "Enable read aloud in settings first."
    } : {
      launch: "♿ سهولة الوصول", title: "إعدادات القراءة والراحة",
      desc: "خيارات تساعدك على قراءة الحكاية والتنقل فيها براحة. لا تغيّر أحداث القصة أو اختياراتك.",
      scale: "حجم النص", normal: "عادي", large: "كبير", larger: "أكبر",
      contrast: "تباين أعلى", motion: "تقليل الحركة والمؤثرات", voice: "القراءة الصوتية",
      read: "🔊 اقرأ المشهد", stop: "إيقاف الصوت", close: "إغلاق",
      on: "مفعّل", off: "متوقف", enabled: "فعّل القراءة الصوتية من الإعدادات أولاً.",
      disabled: "لا يوجد نص ظاهر لقراءته حالياً.",
      unsupported: "القراءة الصوتية غير مدعومة في هذا المتصفح.",
      empty: "لا يوجد نص ظاهر لقراءته حالياً.",
      activate: "فعّل القراءة الصوتية من الإعدادات أولاً."
    };
    launch.textContent = labels.launch;
    backdrop.querySelector("#alnajat-a11y-title").textContent = labels.title;
    backdrop.querySelector("#alnajat-a11y-desc").textContent = labels.desc;
    backdrop.querySelectorAll("[data-a11y-label]").forEach(function (node) { node.textContent = labels[node.dataset.a11yLabel]; });
    backdrop.querySelector('[data-scale="100"]').textContent = labels.normal;
    backdrop.querySelector('[data-scale="112"]').textContent = labels.large;
    backdrop.querySelector('[data-scale="125"]').textContent = labels.larger;
    backdrop.querySelector("#alnajat-a11y-read").textContent = labels.read;
    backdrop.querySelector("#alnajat-a11y-stop").textContent = labels.stop;
    backdrop.querySelector("#alnajat-a11y-close").textContent = labels.close;
    backdrop.dir = en ? "ltr" : "rtl";
    backdrop.lang = en ? "en" : "ar";
    return labels;
  }
  function update() {
    const labels = applyLanguage();
    backdrop.querySelectorAll("[data-toggle]").forEach(function (b) {
      const on = !!prefs[b.dataset.toggle];
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? labels.on : labels.off;
    });
    backdrop.querySelectorAll("[data-scale]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.scale) === prefs.scale));
    });
  }
  function openPanel() { backdrop.classList.add("open"); panel.focus(); update(); }
  function closePanel() { backdrop.classList.remove("open"); launch.focus(); }
  function sceneText() {
    const root = document.querySelector("#app") || document.querySelector("main") || document.body;
    const clone = root.cloneNode(true);
    clone.querySelectorAll("button,input,select,textarea,script,style,nav,[aria-hidden=true]").forEach(function (n) { n.remove(); });
    return (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim().slice(0, 5000);
  }
  function speak() {
    const labels = applyLanguage();
    if (!prefs.voice) { live.textContent = labels.activate; return; }
    if (!("speechSynthesis" in window)) { live.textContent = labels.unsupported; return; }
    const value = sceneText();
    if (!value) { live.textContent = labels.empty; return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = document.documentElement.lang === "en" ? "en-US" : "ar";
    utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  }

  launch.addEventListener("click", openPanel);
  backdrop.querySelector("#alnajat-a11y-close").addEventListener("click", closePanel);
  backdrop.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closePanel(); return; }
    if (e.key !== "Tab") return;
    const items = Array.from(panel.querySelectorAll("button,[href],[tabindex]:not([tabindex='-1'])")).filter(function (x) { return !x.disabled; });
    if (!items.length) return;
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); items[0].focus(); }
  });
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closePanel(); });
  backdrop.querySelectorAll("[data-scale]").forEach(function (b) {
    b.addEventListener("click", function () { prefs.scale = Number(b.dataset.scale); save(); update(); });
  });
  backdrop.querySelectorAll("[data-toggle]").forEach(function (b) {
    b.addEventListener("click", function () { const key = b.dataset.toggle; prefs[key] = !prefs[key]; save(); update(); });
  });
  backdrop.querySelector("#alnajat-a11y-read").addEventListener("click", speak);
  backdrop.querySelector("#alnajat-a11y-stop").addEventListener("click", function () {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  });
  document.addEventListener("keydown", function (e) {
    if (!backdrop.classList.contains("open")) return;
    if (e.key === "Escape") { closePanel(); return; }
    if (e.key === "Tab") {
      const items = Array.from(panel.querySelectorAll("button,[href],[tabindex]:not([tabindex='-1'])")).filter(function (x) { return !x.disabled; });
      if (!items.length) return;
      if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); items[0].focus(); }
    }
  });
  let timer;
  const app = document.querySelector("#app");
  if (app && "MutationObserver" in window) {
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () { const value = sceneText(); if (value) live.textContent = value.slice(0, 280); }, 500);
    });
    observer.observe(app, { childList: true, subtree: true, characterData: true });
  }
  const originalToggleLang = window.toggleLang;
  if (typeof originalToggleLang === "function") {
    window.toggleLang = function () {
      const result = originalToggleLang.apply(this, arguments);
      update();
      return result;
    };
  }
  update();
  console.info("ALNAJAT 2.0 accessibility layer loaded");
})();