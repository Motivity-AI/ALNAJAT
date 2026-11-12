/* ALNAJAT AUDIO ENGINE — v1
   Independent music, ambience, SFX and voice buses.
   Procedural original score is a fallback layer; licensed/commissioned stems can
   be connected later without changing story data or choice logic. */
(function () {
  "use strict";
  if (window.ALNAJAT_AUDIO) return;

  const KEY = "alnajat_audio_settings_v1";
  const defaults = { music: 0.72, ambience: 0.34, sfx: 0.62, voice: 0.9, musicOn: false, ambienceOn: false, sfxOn: true };
  let settings = Object.assign({}, defaults);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    settings = Object.assign(settings, saved);
    ["music", "ambience", "sfx", "voice"].forEach(function (key) {
      const value = Number(settings[key]);
      settings[key] = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : defaults[key];
    });
    ["musicOn", "ambienceOn", "sfxOn"].forEach(function (key) {
      settings[key] = typeof settings[key] === "boolean" ? settings[key] : defaults[key];
    });
  } catch (_) {}

  let ctx = null, master = null, compressor = null;
  let buses = null, ambienceNodes = [], musicNodes = [], musicTimer = null;
  let unlocked = false, currentScene = "desert", currentMood = "desert";
  let noteIndex = 0, lastCueAt = 0, settingsDialog = null, previousSettingsFocus = null, quietMode = false;

  const patterns = {
    desert: [220, 261.63, 293.66, 349.23, 293.66, 261.63, 196, 220],
    road: [196, 220, 261.63, 293.66, 261.63, 220, 174.61, 196],
    market: [293.66, 349.23, 392, 440, 392, 349.23, 293.66, 261.63],
    city: [261.63, 293.66, 349.23, 392, 349.23, 293.66, 220, 261.63],
    war: [174.61, 196, 220, 261.63, 220, 196, 164.81, 174.61],
    prison: [146.83, 174.61, 196, 220, 196, 174.61, 146.83, 130.81],
    peace: [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 261.63],
    river: [220, 261.63, 329.63, 392, 329.63, 261.63, 220, 196],
    hospital: [196, 220, 261.63, 293.66, 261.63, 220, 196, 174.61]
  };
  const profile = {
    desert: { filter: 520, type: "lowpass", level: 0.025 },
    road: { filter: 700, type: "lowpass", level: 0.022 },
    market: { filter: 1450, type: "bandpass", level: 0.018 },
    city: { filter: 950, type: "bandpass", level: 0.018 },
    street: { filter: 1100, type: "bandpass", level: 0.018 },
    war: { filter: 260, type: "lowpass", level: 0.042 },
    night: { filter: 310, type: "lowpass", level: 0.026 },
    prison: { filter: 240, type: "lowpass", level: 0.034 },
    ruin: { filter: 360, type: "lowpass", level: 0.025 },
    peace: { filter: 1750, type: "lowpass", level: 0.014 },
    dark: { filter: 190, type: "lowpass", level: 0.032 },
    shelter: { filter: 500, type: "lowpass", level: 0.021 },
    checkpoint: { filter: 420, type: "bandpass", level: 0.024 },
    hospital: { filter: 340, type: "lowpass", level: 0.021 },
    river: { filter: 850, type: "lowpass", level: 0.016 }
  };

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (_) {}
  }
  function ramp(param, value, seconds) {
    if (!ctx || !param) return;
    const now = ctx.currentTime;
    try {
      param.cancelScheduledValues(now);
      param.setTargetAtTime(value, now, Math.max(0.025, seconds || 0.18));
    } catch (_) { try { param.value = value; } catch (__) {} }
  }
  function ensureContext() {
    if (ctx && ctx.state !== "closed") return true;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    ctx = new Audio();
    master = ctx.createGain();
    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 16;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.24;
    buses = {
      music: ctx.createGain(),
      ambience: ctx.createGain(),
      sfx: ctx.createGain(),
      voice: ctx.createGain()
    };
    Object.keys(buses).forEach(function (name) { buses[name].connect(master); });
    master.connect(compressor);
    compressor.connect(ctx.destination);
    master.gain.value = 0.92;
    applyVolumes();
    return true;
  }
  function applyVolumes() {
    if (!buses) return;
    if (quietMode) {
      ramp(buses.music.gain, 0, 0.08);
      ramp(buses.ambience.gain, 0, 0.08);
      ramp(buses.sfx.gain, 0, 0.04);
      ramp(buses.voice.gain, 0, 0.08);
      return;
    }
    ramp(buses.music.gain, settings.music, 0.12);
    ramp(buses.ambience.gain, settings.ambienceOn ? settings.ambience : 0, 0.2);
    ramp(buses.sfx.gain, settings.sfxOn ? settings.sfx : 0, 0.06);
    ramp(buses.voice.gain, settings.voice, 0.12);
  }
  async function unlock() {
    try {
      if (!ensureContext()) return false;
      if (ctx.state !== "running") await ctx.resume();
      unlocked = ctx.state === "running";
      if (unlocked) {
        applyVolumes();
        if (settings.musicOn) startMusic();
        if (settings.ambienceOn) refreshAmbience();
      }
      return unlocked;
    } catch (error) {
      unlocked = false;
      console.warn("ALNAJAT audio unlock:", error);
      return false;
    }
  }
  function stopNodes(nodes) {
    nodes.forEach(function (node) {
      try { if (node.stop) node.stop(); } catch (_) {}
      try { node.disconnect(); } catch (_) {}
    });
    nodes.length = 0;
  }
  function startAmbience() {
    if (!ctx || ctx.state !== "running" || !settings.ambienceOn || ambienceNodes.length) return;
    const p = profile[currentMood] || profile.desert;
    try {
      const length = Math.max(1, Math.floor(ctx.sampleRate * 3));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        brown = (brown + 0.018 * white) / 1.018;
        data[i] = brown * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = p.type;
      filter.frequency.value = p.filter;
      filter.Q.value = 0.65;
      const gain = ctx.createGain();
      gain.gain.value = p.level;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(buses.ambience);
      source.start();
      ambienceNodes.push(source, filter, gain);
    } catch (error) {
      console.warn("ALNAJAT ambience:", error);
    }
  }
  function refreshAmbience() {
    stopNodes(ambienceNodes);
    if (!quietMode && settings.ambienceOn && unlocked && ctx && ctx.state === "running") startAmbience();
  }
  function pluck(frequency, velocity) {
    if (!ctx || ctx.state !== "running" || !buses) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const tone = ctx.createBiquadFilter();
    const env = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, now);
    osc.detune.setValueAtTime(-3, now);
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(2600, frequency * 7), now);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity || 0.045), now + 0.018);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
    osc.connect(tone);
    tone.connect(env);
    env.connect(buses.music);
    osc.start(now);
    osc.stop(now + 1.4);
    musicNodes.push(osc, tone, env);
    if (musicNodes.length > 90) musicNodes.splice(0, 30);
  }
  function startMusic() {
    if (quietMode || !ctx || ctx.state !== "running" || musicTimer) return;
    const drone = ctx.createOscillator();
    const drone2 = ctx.createOscillator();
    const lowpass = ctx.createBiquadFilter();
    const pad = ctx.createGain();
    drone.type = "sine";
    drone.frequency.value = currentMood === "war" || currentMood === "prison" ? 55 : 73.42;
    drone2.type = "triangle";
    drone2.frequency.value = drone.frequency.value * 2.01;
    drone2.detune.value = -7;
    lowpass.type = "lowpass";
    lowpass.frequency.value = 240;
    pad.gain.value = 0.0001;
    drone.connect(lowpass);
    drone2.connect(lowpass);
    lowpass.connect(pad);
    pad.connect(buses.music);
    const now = ctx.currentTime;
    pad.gain.setTargetAtTime(0.035, now, 2.4);
    drone.start();
    drone2.start();
    musicNodes.push(drone, drone2, lowpass, pad);
    noteIndex = 0;
    const pattern = patterns[currentMood] || patterns.desert;
    const tick = function () {
      if (!ctx || ctx.state !== "running" || !settings.musicOn) return;
      const seq = patterns[currentMood] || patterns.desert;
      const f = seq[noteIndex % seq.length];
      pluck(f, 0.035);
      if (noteIndex % 4 === 0) pluck(f / 2, 0.018);
      noteIndex++;
    };
    tick();
    musicTimer = window.setInterval(tick, 1750);
  }
  function stopMusic() {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = null;
    if (ctx && buses) ramp(buses.music.gain, 0, 0.22);
    window.setTimeout(function () {
      stopNodes(musicNodes);
      if (buses && ctx) ramp(buses.music.gain, quietMode ? 0 : settings.music, 0.08);
    }, 320);
  }
  function setQuietMode(on) {
    quietMode = !!on;
    if (quietMode) {
      stopMusic();
      stopNodes(ambienceNodes);
      applyVolumes();
    } else {
      applyVolumes();
      if (settings.musicOn && unlocked && ctx && ctx.state === "running") startMusic();
      if (settings.ambienceOn && unlocked && ctx && ctx.state === "running") refreshAmbience();
    }
  }
  function setMusic(on) {
    settings.musicOn = !!on;
    if (settings.musicOn) {
      if (unlocked && ctx && ctx.state === "running") {
        applyVolumes();
        startMusic();
      }
    } else stopMusic();
    persist();
    updateButton();
  }
  function updateButton() {
    const button = document.getElementById("mb");
    if (!button) return;
    button.textContent = settings.musicOn ? "🔊" : "🔇";
    button.setAttribute("aria-pressed", settings.musicOn ? "true" : "false");
    button.setAttribute("aria-label", document.documentElement.lang === "en" ? "Toggle soundtrack" : "تشغيل أو إيقاف الموسيقى");
  }
  function setScene(nid, mood) {
    currentScene = nid || currentScene;
    currentMood = mood || currentMood || "desert";
    if (settings.ambienceOn) refreshAmbience();
    if (settings.musicOn && ctx && ctx.state === "running") {
      if (musicTimer) {
        stopMusic();
        window.setTimeout(startMusic, 360);
      }
    }
  }
  function playSfx(kind, value) {
    if (quietMode || !settings.sfxOn || !unlocked || !ctx || ctx.state !== "running" || !buses) return;
    const now = ctx.currentTime;
    const tones = {
      choice: [392, 523.25], open: [523.25, 659.25],
      warning: [220, 174.61], save: [587.33, 783.99],
      back: [349.23, 261.63], achievement: [523.25, 659.25, 783.99]
    };
    const list = tones[kind] || [Math.max(80, Math.min(1200, Number(value) || 440))];
    list.forEach(function (frequency, i) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      const start = now + i * 0.075;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "warning" ? 0.035 : 0.025, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);
      osc.connect(gain);
      gain.connect(buses.sfx);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }
  function buildSettings() {
    if (settingsDialog) return settingsDialog;
    const overlay = document.createElement("div");
    overlay.id = "alnajat-audio-settings";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "alnajat-audio-title");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="aa-panel"><button class="aa-close" type="button" aria-label="Close">×</button>' +
      '<p class="aa-kicker">ALNAJAT · SOUND DESIGN</p><h2 id="alnajat-audio-title">إعدادات الصوت</h2>' +
      '<label class="aa-toggle"><input id="aa-music-on" type="checkbox"> <span data-audio-label="music">الموسيقى التصويرية</span></label>' +
      '<label class="aa-range"><span data-audio-label="musicLevel">مستوى الموسيقى</span><input id="aa-music" type="range" min="0" max="1" step="0.01" aria-label="مستوى الموسيقى"></label>' +
      '<label class="aa-toggle"><input id="aa-ambience-on" type="checkbox"> <span data-audio-label="ambience">أصوات البيئة والمكان</span></label>' +
      '<label class="aa-range"><span data-audio-label="ambienceLevel">مستوى الأجواء</span><input id="aa-ambience" type="range" min="0" max="1" step="0.01" aria-label="مستوى الأجواء"></label>' +
      '<label class="aa-toggle"><input id="aa-sfx-on" type="checkbox"> <span data-audio-label="sfx">المؤثرات الصوتية</span></label>' +
      '<label class="aa-range"><span data-audio-label="sfxLevel">مستوى المؤثرات</span><input id="aa-sfx" type="range" min="0" max="1" step="0.01" aria-label="مستوى المؤثرات"></label>' +
      '<button class="aa-done" type="button">تم</button></div>';
    document.body.appendChild(overlay);
    overlay.querySelector(".aa-close").addEventListener("click", closeSettings);
    overlay.querySelector(".aa-done").addEventListener("click", closeSettings);
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); closeSettings(); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(overlay.querySelectorAll("button,input")).filter(function (item) { return !item.disabled && !item.closest("[hidden]"); });
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    });
    overlay.addEventListener("click", function (event) { if (event.target === overlay) closeSettings(); });
    const bindRange = function (id, key) {
      overlay.querySelector("#" + id).addEventListener("input", function (event) {
        settings[key] = Number(event.target.value);
        applyVolumes();
        persist();
      });
    };
    bindRange("aa-music", "music");
    bindRange("aa-ambience", "ambience");
    bindRange("aa-sfx", "sfx");
    overlay.querySelector("#aa-music-on").addEventListener("change", function (event) { setMusic(event.target.checked); });
    overlay.querySelector("#aa-ambience-on").addEventListener("change", async function (event) {
      settings.ambienceOn = event.target.checked;
      if (settings.ambienceOn && !unlocked) await unlock();
      refreshAmbience(); applyVolumes(); persist();
    });
    overlay.querySelector("#aa-sfx-on").addEventListener("change", function (event) {
      settings.sfxOn = event.target.checked; applyVolumes(); persist();
    });
    settingsDialog = overlay;
    return overlay;
  }
  function syncSettingsLanguage(overlay) {
    const en = document.documentElement.lang === "en";
    const labels = en ? {
      title: "Sound settings", music: "Cinematic soundtrack", musicLevel: "Music level",
      ambience: "Environmental ambience", ambienceLevel: "Ambience level",
      sfx: "Sound effects", sfxLevel: "Effects level", done: "Done", close: "Close"
    } : {
      title: "إعدادات الصوت", music: "الموسيقى التصويرية", musicLevel: "مستوى الموسيقى",
      ambience: "أصوات البيئة والمكان", ambienceLevel: "مستوى الأجواء",
      sfx: "المؤثرات الصوتية", sfxLevel: "مستوى المؤثرات", done: "تم", close: "إغلاق"
    };
    overlay.querySelector("#alnajat-audio-title").textContent = labels.title;
    overlay.querySelectorAll("[data-audio-label]").forEach(function (node) { node.textContent = labels[node.dataset.audioLabel]; });
    overlay.querySelector(".aa-done").textContent = labels.done;
    overlay.querySelector(".aa-close").setAttribute("aria-label", labels.close);
    [["aa-music", "musicLevel"], ["aa-ambience", "ambienceLevel"], ["aa-sfx", "sfxLevel"]].forEach(function (pair) {
      overlay.querySelector("#" + pair[0]).setAttribute("aria-label", labels[pair[1]]);
    });
    overlay.dir = en ? "ltr" : "rtl";
    overlay.lang = en ? "en" : "ar";
  }
  function openSettings() {
    const overlay = buildSettings();
    previousSettingsFocus = document.activeElement;
    syncSettingsLanguage(overlay);
    overlay.hidden = false;
    overlay.querySelector("#aa-music-on").checked = !!settings.musicOn;
    overlay.querySelector("#aa-ambience-on").checked = !!settings.ambienceOn;
    overlay.querySelector("#aa-sfx-on").checked = !!settings.sfxOn;
    overlay.querySelector("#aa-music").value = settings.music;
    overlay.querySelector("#aa-ambience").value = settings.ambience;
    overlay.querySelector("#aa-sfx").value = settings.sfx;
    const close = overlay.querySelector(".aa-close");
    if (close) close.focus();
  }
  function closeSettings() {
    if (!settingsDialog) return;
    settingsDialog.hidden = true;
    const trigger = document.querySelector("[data-alnajat-audio-settings]");
    const restore = previousSettingsFocus && previousSettingsFocus.isConnected ? previousSettingsFocus : trigger;
    previousSettingsFocus = null;
    if (restore) restore.focus();
  }
  function addSettingsButton() {
    const app = document.getElementById("app");
    if (!app || app.querySelector("[data-alnajat-audio-settings]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.dataset.alnajatAudioSettings = "1";
    button.textContent = document.documentElement.lang === "en" ? "🎚️ Sound" : "🎚️ الصوت";
    button.addEventListener("click", openSettings);
    const timeline = app.querySelector('button[onclick="openTimeline()"]');
    if (timeline) timeline.insertAdjacentElement("afterend", button);
    else app.appendChild(button);
  }

  const style = document.createElement("style");
  style.id = "alnajat-audio-style";
  style.textContent = [
    "#alnajat-audio-settings[hidden]{display:none!important}",
    "#alnajat-audio-settings{position:fixed;inset:0;z-index:100020;display:grid;place-items:center;padding:18px;background:#05070bdc;backdrop-filter:blur(12px)}",
    "#alnajat-audio-settings .aa-panel{width:min(440px,100%);max-height:88vh;overflow:auto;position:relative;padding:28px 22px 22px;border:1px solid #d5b36b66;border-radius:18px;background:linear-gradient(145deg,#17191f,#090b10);color:#f4f0e8;box-shadow:0 24px 80px #000a}",
    "#alnajat-audio-settings .aa-close{position:absolute;inset-block-start:10px;inset-inline-end:12px;border:0;background:transparent;color:#fff;font-size:28px;cursor:pointer}",
    "#alnajat-audio-settings .aa-kicker{font-size:10px;letter-spacing:.22em;color:#d5b36b}",
    "#alnajat-audio-settings h2{font-size:22px;margin:8px 0 22px}",
    "#alnajat-audio-settings .aa-toggle,#alnajat-audio-settings .aa-range{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:16px 0;padding:12px;border:1px solid #ffffff18;border-radius:10px;background:#ffffff08;font-size:14px}",
    "#alnajat-audio-settings input[type=range]{width:46%;accent-color:#d5b36b}",
    "#alnajat-audio-settings input[type=checkbox]{width:19px;height:19px;accent-color:#d5b36b}",
    "#alnajat-audio-settings .aa-done{width:100%;padding:12px;border:0;border-radius:10px;background:#d5b36b;color:#17130c;font-weight:700;margin-top:10px;cursor:pointer}",
    "@media(prefers-reduced-motion:reduce){#alnajat-audio-settings *{scroll-behavior:auto!important}}"
  ].join("");
  document.head.appendChild(style);

  window.ALNAJAT_AUDIO = {
    unlock: unlock,
    setScene: setScene,
    playSfx: playSfx,
    setMusic: setMusic,
    setQuietMode: setQuietMode,
    openSettings: openSettings,
    getState: function () { return { unlocked: unlocked, musicOn: !!settings.musicOn, ambienceOn: !!settings.ambienceOn, sfxOn: !!settings.sfxOn, contextState: ctx ? ctx.state : "not-created" }; }
  };

  // Keep the original inline controls and scene engine API compatible.
  window.unlockAudio = unlock;
  window.snd = function () { if (!unlocked) return unlock().then(function (ok) { if (ok) setMusic(!settings.musicOn); }); setMusic(!settings.musicOn); };
  window.mood = function (kind) { setScene(currentScene, kind); };
  window.sfx = function (frequency) { playSfx("choice", frequency); };
  window.updateMusicBtn = updateButton;

  const originalRender = window.renderNode;
  if (typeof originalRender === "function") {
    window.renderNode = function (nid) {
      const result = originalRender.apply(this, arguments);
      let kind = "desert";
      try { kind = typeof K === "function" ? K(nid) : kind; } catch (_) {}
      setScene(nid, kind);
      addSettingsButton();
      return result;
    };
  }
  const originalMenu = window.showMenu;
  if (typeof originalMenu === "function") {
    window.showMenu = function () {
      const result = originalMenu.apply(this, arguments);
      addSettingsButton();
      return result;
    };
  }
  document.addEventListener("pointerdown", function () { unlock(); }, { passive: true });
  document.addEventListener("keydown", function () { unlock(); });
  let resumeAfterVisibility = false;
  document.addEventListener("visibilitychange", function () {
    if (!ctx) return;
    if (document.hidden && ctx.state === "running") {
      resumeAfterVisibility = true;
      ctx.suspend().catch(function () {});
    } else if (!document.hidden && resumeAfterVisibility) {
      resumeAfterVisibility = false;
      unlock();
    }
  });
  window.addEventListener("pagehide", function () {
    if (ctx && ctx.state === "running") ctx.suspend().catch(function () {});
  });
  window.addEventListener("pageshow", updateButton);
  updateButton();
  console.info("ALNAJAT independent audio engine loaded");
})();
