/* ALNAJAT CINEMATIC PRO — v1
   Additive visual direction. The story engine and narrative data remain untouched. */
(function () {
  "use strict";
  if (window.__ALNAJAT_CINEMA_PRO__) return;
  window.__ALNAJAT_CINEMA_PRO__ = true;

  const style = document.createElement("style");
  style.id = "alnajat-cinema-pro-style";
  style.textContent = [
    "#alnajat-film-bars{position:fixed;inset:0;z-index:99970;pointer-events:none;opacity:0;transition:opacity .55s ease}",
    "#alnajat-film-bars:before,#alnajat-film-bars:after{content:'';position:absolute;inset-inline:0;height:3.2vh;min-height:16px;background:#050505;box-shadow:0 0 24px #0008}",
    "#alnajat-film-bars:before{top:0}#alnajat-film-bars:after{bottom:0}",
    "body.alnajat-film-mode #alnajat-film-bars{opacity:1}",
    "#app .art{display:block;width:100%;height:auto;max-height:34vh;object-fit:cover;transform-origin:center;animation:alnajat-shot-drift 18s ease-in-out infinite alternate;filter:saturate(.88) contrast(1.04);box-shadow:0 12px 35px #0005}",
    "#app .tx{position:relative;animation:alnajat-copy-reveal .7s cubic-bezier(.2,.7,.2,1) both;text-wrap:pretty}",
    "#app .ch{letter-spacing:.02em;text-shadow:0 3px 22px #0008;animation:alnajat-title-reveal .65s ease-out both}",
    "#app .btn{transition:transform .22s ease,border-color .22s ease,filter .22s ease}",
    "#app .btn:active{transform:scale(.985)}",
    "#app .btn:nth-of-type(1){animation:alnajat-choice-in .45s .06s both}",
    "#app .btn:nth-of-type(2){animation:alnajat-choice-in .45s .12s both}",
    "#app .btn:nth-of-type(3){animation:alnajat-choice-in .45s .18s both}",
    "#app .btn:nth-of-type(4){animation:alnajat-choice-in .45s .24s both}",
    "body[data-alnajat-mood='war'] #app .art{filter:saturate(.55) contrast(1.12) sepia(.14)}",
    "body[data-alnajat-mood='prison'] #app .art,body[data-alnajat-mood='dark'] #app .art{filter:saturate(.45) brightness(.78) contrast(1.12)}",
    "body[data-alnajat-mood='peace'] #app .art,body[data-alnajat-mood='river'] #app .art{filter:saturate(1.04) brightness(1.04)}",
    "body[data-alnajat-mood='desert'] #app .art,body[data-alnajat-mood='road'] #app .art{filter:saturate(.94) sepia(.1) contrast(1.04)}",
    "#alnajat-transition{backdrop-filter:blur(3px);background:radial-gradient(ellipse at center,#17131bdc 0%,#050608f5 78%)!important}",
    "#alnajat-transition .at-card{border-top:1px solid #d5b36b99;border-bottom:1px solid #d5b36b99;box-shadow:0 18px 70px #0008}",
    "#alnajat-transition .at-kicker{font-size:10px;letter-spacing:.28em}",
    "#alnajat-transition .at-title{font-family:Georgia,serif;letter-spacing:.015em}",
    "@keyframes alnajat-shot-drift{from{transform:scale(1)}to{transform:scale(1.055)}}",
    "@keyframes alnajat-copy-reveal{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}",
    "@keyframes alnajat-title-reveal{from{opacity:0;filter:blur(5px);transform:translateY(7px)}to{opacity:1;filter:blur(0);transform:translateY(0)}}",
    "@keyframes alnajat-choice-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}",
    "@media(max-width:600px){#app .art{max-height:27vh}#alnajat-film-bars:before,#alnajat-film-bars:after{height:2.4vh;min-height:12px}}",
    "@media(prefers-reduced-motion:reduce){#alnajat-film-bars{transition:none}#app .art,#app .tx,#app .ch,#app .btn{animation:none!important;transition:none!important}}"
  ].join("");
  document.head.appendChild(style);

  const bars = document.createElement("div");
  bars.id = "alnajat-film-bars";
  bars.setAttribute("aria-hidden", "true");
  document.body.appendChild(bars);

  function applyScene(nid) {
    const kind = (function () { try { return typeof K === "function" ? K(nid) : "desert"; } catch (_) { return "desert"; } })();
    document.body.dataset.alnajatScene = nid || "";
    document.body.dataset.alnajatMood = kind;
    document.body.classList.add("alnajat-film-mode");
    if (document.body.classList.contains("alnajat-reduce-motion")) {
      document.body.classList.remove("alnajat-film-mode");
    }
    const art = document.querySelector("#app .art");
    if (art) {
      art.setAttribute("role", "img");
      if (!art.getAttribute("aria-label")) art.setAttribute("aria-label", document.documentElement.lang === "en" ? "Illustration for the current story scene" : "رسم توضيحي للمشهد الحالي");
    }
  }

  const previousRender = window.renderNode;
  if (typeof previousRender === "function") {
    window.renderNode = function (nid) {
      const result = previousRender.apply(this, arguments);
      applyScene(nid);
      return result;
    };
  }

  const previousToggleLang = window.toggleLang;
  if (typeof previousToggleLang === "function") {
    window.toggleLang = function () {
      const result = previousToggleLang.apply(this, arguments);
      if (document.body.dataset.alnajatScene) applyScene(document.body.dataset.alnajatScene);
      return result;
    };
  }

  console.info("ALNAJAT cinematic direction layer loaded");
})();
