/* ALNAJAT CINEMATIC JOURNEY — v1
   Additive presentation layer. Does not alter story nodes, choices, outcomes or saves. */
(function () {
  "use strict";
  if (window.__ALNAJAT_CINEMA__) return;
  window.__ALNAJAT_CINEMA__ = true;

  const style = document.createElement("style");
  style.id = "alnajat-cinema-style";
  style.textContent = [
    "#alnajat-transition{position:fixed;inset:0;z-index:99980;display:grid;place-items:center;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,#241b1b88 0%,#08090deF 75%);transition:opacity .38s ease}",
    "#alnajat-transition.show{opacity:1}",
    "#alnajat-transition .at-card{width:min(560px,88vw);text-align:center;color:#fff;padding:30px 20px;border-top:1px solid #d5b36b88;border-bottom:1px solid #d5b36b88;transform:translateY(12px);transition:transform .55s ease}",
    "#alnajat-transition.show .at-card{transform:translateY(0)}",
    "#alnajat-transition .at-kicker{font:600 11px/1.8 system-ui,sans-serif;letter-spacing:.24em;color:#d9bd7b}",
    "#alnajat-transition .at-title{font:700 clamp(25px,6vw,42px)/1.35 system-ui,sans-serif;margin:8px 0;text-shadow:0 3px 25px #000}",
    "#alnajat-transition .at-sub{font:14px/1.8 system-ui,sans-serif;color:#d4d0c8}",
    "#alnajat-map .map-note{font-size:12px;line-height:1.7;color:#aaa;margin:6px 0 16px}",
    "#alnajat-map .journey{position:relative;display:grid;gap:10px;margin:12px 0 18px}",
    "#alnajat-map .journey:before{content:'';position:absolute;inset-block:15px 15px;inset-inline-start:22px;width:2px;background:linear-gradient(#d6b66e,#8d3434,#d6b66e);opacity:.75}",
    "#alnajat-map .stop{position:relative;display:flex;align-items:center;gap:12px;text-align:start;padding:11px 12px;border:1px solid #ffffff20;border-radius:12px;background:#ffffff08;color:#eee}",
    "#alnajat-map .stop .dot{z-index:1;display:grid;place-items:center;flex:0 0 22px;height:22px;border-radius:50%;background:#34343b;border:2px solid #777;color:#fff;font-size:11px}",
    "#alnajat-map .stop.unlocked .dot{background:#8d3434;border-color:#e2c27b}",
    "#alnajat-map .stop.current{border-color:#e2c27b;background:#d5b36b18}",
    "#alnajat-map .stop strong{display:block;font-size:14px}#alnajat-map .stop small{display:block;color:#aaa;font-size:11px;margin-top:2px}",
    "#alnajat-map .map-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#bbb;margin:10px 0}",
    "#alnajat-map .legend-dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#8d3434;border:1px solid #e2c27b;margin-inline-end:5px}",
    "#alnajat-map .legend-lock{display:inline-block;width:9px;height:9px;border-radius:50%;background:#34343b;border:1px solid #777;margin-inline-end:5px}",
    "@media(prefers-reduced-motion:reduce){#alnajat-transition,#alnajat-transition .at-card{transition:none!important}}"
  ].join("");
  document.head.appendChild(style);

  const transition = document.createElement("div");
  transition.id = "alnajat-transition";
  transition.setAttribute("aria-hidden", "true");
  transition.innerHTML = '<div class="at-card"><div class="at-kicker">ALNAJAT · THE JOURNEY</div><div class="at-title"></div><div class="at-sub"></div></div>';
  document.body.appendChild(transition);
  let previousNode = null, activeNode = null, transitionTimer = 0;

  function cinematic(nid) {
    activeNode = nid || activeNode;
    if (!nid || !previousNode || previousNode === nid) { previousNode = nid; return; }
    previousNode = nid;
    const title = document.querySelector("#app .ch");
    const titleText = title ? title.textContent.trim() : "";
    const isEn = document.documentElement.lang === "en";
    transition.querySelector(".at-title").textContent = titleText || (isEn ? "A new chapter" : "فصل جديد");
    transition.querySelector(".at-sub").textContent = isEn ? "Every choice leaves a trace." : "كل اختيار يترك أثراً.";
    if (document.body.classList.contains("alnajat-reduce-motion")) return;
    clearTimeout(transitionTimer);
    transition.classList.add("show");
    transitionTimer = setTimeout(function () {
      transition.classList.remove("show");
    }, 720);
  }

  const originalRender = window.renderNode;
  if (typeof originalRender === "function") {
    window.renderNode = function (nid) {
      const result = originalRender.apply(this, arguments);
      cinematic(nid);
      return result;
    };
  }

  const chapters = [
    { id: "d0", ar: "دارفور", en: "Darfur", arDesc: "البداية والجذور والرحلة الأولى", enDesc: "Origins and the first journey" },
    { id: "m1", ar: "الخرطوم", en: "Khartoum", arDesc: "الوصول إلى العاصمة وتفاصيل الحياة", enDesc: "Arrival in the capital and daily life" },
    { id: "r1", ar: "ديسمبر", en: "December", arDesc: "لحظة التحول وصوت الشارع", enDesc: "A turning point and the voice of the streets" },
    { id: "w1", ar: "الحرب", en: "War", arDesc: "الحرب والنزوح والبحث عن الأمان", enDesc: "War, displacement and the search for safety" },
    { id: "p1", ar: "السجن", en: "Prison", arDesc: "الفصل المرتبط بالاحتجاز والنجاة", enDesc: "The chapter of detention and survival" },
    { id: "o1", ar: "الخرطوم الجريحة", en: "Wounded Khartoum", arDesc: "آثار الحرب وما بعدها", enDesc: "The aftermath and its human cost" }
  ];

  function mapHTML() {
    const isEn = document.documentElement.lang === "en";
    let unlocked = [];
    try { unlocked = JSON.parse(localStorage.getItem("najat_chapters") || "[]"); } catch (_) {}
    const current = activeNode;
    const rows = chapters.map(function (c, i) {
      const open = unlocked.indexOf(c.id) !== -1 || current === c.id;
      const active = current === c.id;
      const name = isEn ? c.en : c.ar;
      const desc = isEn ? c.enDesc : c.arDesc;
      return '<div class="stop ' + (open ? "unlocked " : "") + (active ? "current" : "") + '"><span class="dot">' + (open ? (active ? "●" : "✓") : "·") + '</span><span><strong>' + (i + 1) + ". " + name + '</strong><small>' + desc + '</small></span></div>';
    }).join("");
    return '<div id="alnajat-map"><h3>' + (isEn ? "🧭 Journey map" : "🧭 خريطة الرحلة") + '</h3>' +
      '<p class="map-note">' + (isEn ? "A narrative route through the story chapters — an illustrative guide, not a geographic or navigation map." : "مسار سردي يربط فصول الحكاية — دليل توضيحي وليس خريطة جغرافية أو أداة ملاحة.") + '</p>' +
      '<div class="map-legend"><span><i class="legend-dot"></i>' + (isEn ? "Reached" : "تم الوصول") + '</span><span><i class="legend-lock"></i>' + (isEn ? "Not reached yet" : "لم يُفتح بعد") + '</span></div>' +
      '<div class="journey">' + rows + '</div>' +
      '<button class="btn pri" onclick="document.getElementById(\\'pn\\').classList.remove(\\'on\\')">' + (isEn ? "Close" : "إغلاق") + '</button></div>';
  }

  window.openAlnajatJourneyMap = function () {
    const panel = document.getElementById("pn");
    if (!panel) return;
    panel.innerHTML = '<div>' + mapHTML() + '</div>';
    panel.classList.add("on");
  };

  function addMapButton() {
    const app = document.getElementById("app");
    if (!app || app.querySelector("[data-alnajat-map]")) return;
    const isEn = document.documentElement.lang === "en";
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.dataset.alnajatMap = "1";
    btn.textContent = isEn ? "🧭 Journey map" : "🧭 خريطة الرحلة";
    btn.addEventListener("click", window.openAlnajatJourneyMap);
    const primary = app.querySelector("button.pri");
    if (primary) primary.insertAdjacentElement("afterend", btn);
    else app.appendChild(btn);
  }
  const originalMenu = window.showMenu;
  if (typeof originalMenu === "function") {
    window.showMenu = function () {
      const result = originalMenu.apply(this, arguments);
      addMapButton();
      return result;
    };
  }
  const originalTop = window.topBar;
  if (typeof originalTop === "function") {
    window.topBar = function () {
      let html = originalTop.apply(this, arguments) || "";
      const marker = 'onclick="openTimeline()"';
      if (html.indexOf(marker) !== -1 && html.indexOf("openAlnajatJourneyMap") === -1) {
        const button = '<button onclick="openAlnajatJourneyMap()">' + (document.documentElement.lang === "en" ? "🧭 Map" : "🧭 الخريطة") + '</button>';
        const pos = html.indexOf("</button>", html.indexOf(marker));
        if (pos !== -1) html = html.slice(0, pos + 9) + button + html.slice(pos + 9);
      }
      return html;
    };
  }

  console.info("ALNAJAT cinematic journey layer loaded");
})();