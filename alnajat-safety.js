/* ALNAJAT — informed content notice and calm visual mode.
   Additive layer: does not modify story nodes, choices, effects, or endings. */
(function(){
  "use strict";
  var ACK_KEY = "alnajat_content_notice_ack_v1";
  var QUIET_KEY = "alnajat_quiet_mode_v1";
  var acknowledged = false;
  try { acknowledged = localStorage.getItem(ACK_KEY) === "1"; } catch (_) {}

  var style = document.createElement("style");
  style.id = "alnajat-safety-style";
  style.textContent = [
    "#alnajat-safety-gate{position:fixed;inset:0;z-index:100100;display:grid;place-items:center;padding:18px;background:rgba(8,10,14,.88);}",
    "#alnajat-safety-gate[hidden]{display:none!important}",
    "#alnajat-safety-gate .as-card{width:min(560px,100%);max-height:88vh;overflow:auto;background:#f7f2e9;color:#211d18;border:1px solid #b58a55;border-radius:18px;padding:clamp(20px,5vw,30px);box-shadow:0 24px 90px #0009;font:16px/1.85 system-ui,'Segoe UI',sans-serif;}",
    "#alnajat-safety-gate h2{margin:0 0 12px;font-size:1.45rem;line-height:1.5}",
    "#alnajat-safety-gate p{margin:0 0 14px}",
    "#alnajat-safety-gate .as-note{padding:12px 14px;border-inline-start:4px solid #9b542b;background:#eee4d5;border-radius:8px}",
    "#alnajat-safety-gate .as-actions{display:grid;gap:10px;margin-top:20px}",
    "#alnajat-safety-gate button{min-height:48px;border:1px solid #8b745c;border-radius:10px;padding:11px 15px;font:inherit;font-weight:700;cursor:pointer;background:#fff;color:#211d18}",
    "#alnajat-safety-gate button.as-primary{background:#8f4324;color:#fff;border-color:#8f4324}",
    "#alnajat-safety-gate button:focus-visible,#alnajat-quiet-toggle:focus-visible{outline:3px solid #1769aa;outline-offset:3px}",
    "#alnajat-quiet-toggle{position:fixed;z-index:100050;inset-inline-start:12px;inset-block-end:calc(14px + env(safe-area-inset-bottom,0px));min-height:44px;padding:8px 12px;border:1px solid #8c765e;border-radius:999px;background:#f7f2e9;color:#211d18;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 3px 16px #0003;cursor:pointer}",
    "body.alnajat-quiet-mode *,body.alnajat-quiet-mode *::before,body.alnajat-quiet-mode *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
    "body.alnajat-quiet-mode #ptc,body.alnajat-quiet-mode #cb{display:none!important}",
    "@media(prefers-reduced-motion:reduce){#alnajat-safety-gate *,#alnajat-quiet-toggle{scroll-behavior:auto!important;transition:none!important;animation:none!important}}"
  ].join("");
  document.head.appendChild(style);

  function labels(){
    return document.documentElement.lang === "en" || document.documentElement.dir === "ltr";
  }
  function makeGate(){
    var en = labels();
    var overlay = document.createElement("div");
    overlay.id = "alnajat-safety-gate";
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    overlay.setAttribute("aria-labelledby","alnajat-safety-title");
    overlay.setAttribute("aria-describedby","alnajat-safety-description");
    var card = document.createElement("section");
    card.className = "as-card";
    var title = document.createElement("h2");
    title.id = "alnajat-safety-title";
    title.textContent = en ? "A note before you begin" : "تنبيه مهم قبل بدء الرحلة";
    var intro = document.createElement("p");
    intro.id = "alnajat-safety-description";
    intro.textContent = en
      ? "ALNAJAT is an interactive work of fiction inspired by Sudanese history. It includes references to armed conflict, displacement, hunger, detention, injury and death."
      : "النجاة عمل روائي تفاعلي مستوحى من تاريخ السودان. يتضمن إشارات ومشاهد عن النزاع المسلح والنزوح والجوع والاحتجاز والإصابة والموت.";
    var note = document.createElement("p");
    note.className = "as-note";
    note.textContent = en
      ? "You may pause or leave at any time. You are not required to make any choice, and stopping does not mean failure. The characters are fictional; the story is not a substitute for historical sources or personal testimony."
      : "يمكنك التوقف أو الخروج في أي وقت. لست مضطراً لاتخاذ أي اختيار، والتوقف ليس فشلاً. الشخصيات خيالية، والعمل ليس بديلاً عن المصادر التاريخية أو الشهادات الشخصية.";
    var actions = document.createElement("div");
    actions.className = "as-actions";
    var proceed = document.createElement("button");
    proceed.type = "button";
    proceed.className = "as-primary";
    proceed.textContent = en ? "I understand — begin the story" : "فهمت التنبيه — ابدأ الرحلة";
    var leave = document.createElement("button");
    leave.type = "button";
    leave.textContent = en ? "Return to the main menu" : "العودة إلى القائمة الرئيسية";
    actions.append(proceed,leave);
    card.append(title,intro,note,actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    function close(){overlay.remove();}
    proceed.addEventListener("click",function(){
      acknowledged = true;
      try { localStorage.setItem(ACK_KEY,"1"); } catch (_) {}
      close();
      if(typeof window.__ALNAJAT_originalStartGame === "function"){
        window.__ALNAJAT_originalStartGame.apply(window,[]);
      }
    });
    leave.addEventListener("click",close);
    overlay.addEventListener("keydown",function(e){
      if(e.key === "Escape"){ e.preventDefault(); close(); return; }
      if(e.key !== "Tab") return;
      var focusables = [proceed,leave];
      var first = focusables[0], last = focusables[focusables.length-1];
      if(e.shiftKey && document.activeElement === first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement === last){e.preventDefault();first.focus();}
    });
    proceed.focus();
  }

  if(typeof window.startGame === "function"){
    window.__ALNAJAT_originalStartGame = window.startGame;
    window.startGame = function(){
      if(acknowledged){ return window.__ALNAJAT_originalStartGame.apply(this,arguments); }
      makeGate();
    };
  }

  function applyQuiet(on){
    document.body.classList.toggle("alnajat-quiet-mode",!!on);
    var button = document.getElementById("alnajat-quiet-toggle");
    if(button){
      button.setAttribute("aria-pressed",on?"true":"false");
      var en = labels();
      button.textContent = on ? (en?"Quiet mode: on":"الوضع الهادئ: مفعّل") : (en?"Quiet mode":"الوضع الهادئ");
    }
    try { if(window.ALNAJAT_AUDIO && window.ALNAJAT_AUDIO.setQuietMode) window.ALNAJAT_AUDIO.setQuietMode(!!on); } catch (_) {}
    if(on){
      try {
      try { if(window.speechSynthesis) window.speechSynthesis.cancel(); } catch (_) {}
    }
    try { localStorage.setItem(QUIET_KEY,on?"1":"0"); } catch (_) {}
  }
  var quietButton = document.createElement("button");
  quietButton.id = "alnajat-quiet-toggle";
  quietButton.type = "button";
  quietButton.addEventListener("click",function(){
    applyQuiet(!document.body.classList.contains("alnajat-quiet-mode"));
  });
  document.body.appendChild(quietButton);
  var quiet = false;
  try { quiet = localStorage.getItem(QUIET_KEY) === "1"; } catch (_) {}
  applyQuiet(quiet);
  window.ALNAJAT_SAFETY = {
    showNotice:function(){acknowledged=false;try{localStorage.removeItem(ACK_KEY);}catch(_){}makeGate();},
    setQuietMode:applyQuiet,
    getState:function(){return {noticeAcknowledged:acknowledged,quietMode:document.body.classList.contains("alnajat-quiet-mode")};}
  };
})();
