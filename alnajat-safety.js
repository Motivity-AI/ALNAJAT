/* ALNAJAT — informed content notice, scene-level safety and calm mode.
   Additive layer: never edits story data, choices, effects, or endings. */
(function(){
  "use strict";
  var ACK_KEY="alnajat_content_notice_ack_v1";
  var QUIET_KEY="alnajat_quiet_mode_v1";
  var acknowledged=false;
  try{acknowledged=localStorage.getItem(ACK_KEY)==="1";}catch(_){}

  var style=document.createElement("style");
  style.id="alnajat-safety-style";
  style.textContent=[
    "#alnajat-safety-gate,#alnajat-scene-warning{position:fixed;inset:0;z-index:100100;display:grid;place-items:center;padding:18px;background:rgba(8,10,14,.9)}",
    "#alnajat-safety-gate[hidden],#alnajat-scene-warning[hidden]{display:none!important}",
    "#alnajat-safety-gate .as-card,#alnajat-scene-warning .as-card{width:min(600px,100%);max-height:88vh;overflow:auto;background:#f7f2e9;color:#211d18;border:1px solid #b58a55;border-radius:18px;padding:clamp(20px,5vw,30px);box-shadow:0 24px 90px #0009;font:16px/1.85 system-ui,'Segoe UI',sans-serif}",
    "#alnajat-safety-gate h2,#alnajat-scene-warning h2{margin:0 0 12px;font-size:1.4rem;line-height:1.5}",
    "#alnajat-safety-gate p,#alnajat-scene-warning p{margin:0 0 14px}",
    "#alnajat-safety-gate .as-note,#alnajat-scene-warning .as-note{padding:12px 14px;border-inline-start:4px solid #9b542b;background:#eee4d5;border-radius:8px}",
    "#alnajat-safety-gate .as-actions,#alnajat-scene-warning .as-actions{display:grid;gap:10px;margin-top:20px}",
    "#alnajat-safety-gate button,#alnajat-scene-warning button{min-height:48px;border:1px solid #8b745c;border-radius:10px;padding:11px 15px;font:inherit;font-weight:700;cursor:pointer;background:#fff;color:#211d18}",
    "#alnajat-safety-gate button.as-primary,#alnajat-scene-warning button.as-primary{background:#8f4324;color:#fff;border-color:#8f4324}",
    "#alnajat-safety-gate button:focus-visible,#alnajat-scene-warning button:focus-visible,#alnajat-quiet-toggle:focus-visible{outline:3px solid #1769aa;outline-offset:3px}",
    "#alnajat-quiet-toggle{position:fixed;z-index:100050;inset-inline-start:12px;inset-block-end:calc(14px + env(safe-area-inset-bottom,0px));min-height:44px;padding:8px 12px;border:1px solid #8c765e;border-radius:999px;background:#f7f2e9;color:#211d18;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 3px 16px #0003;cursor:pointer}",
    "body.alnajat-quiet-mode *,body.alnajat-quiet-mode *::before,body.alnajat-quiet-mode *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
    "body.alnajat-quiet-mode #ptc,body.alnajat-quiet-mode #cb{display:none!important}",
    ".alnajat-safe-summary{padding:12px 14px;margin:12px 0;border:1px solid #9b8b73;border-radius:10px;background:#eee9df;color:#211d18;line-height:1.8}",
    "@media(prefers-reduced-motion:reduce){#alnajat-safety-gate *,#alnajat-scene-warning *,#alnajat-quiet-toggle{scroll-behavior:auto!important;transition:none!important;animation:none!important}}"
  ].join("");
  document.head.appendChild(style);

  function isEnglish(){return document.documentElement.lang==="en"||document.documentElement.dir==="ltr";}
  function element(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
  function trap(overlay,buttons){
    overlay.addEventListener("keydown",function(e){
      if(e.key==="Escape"){e.preventDefault();return;}
      if(e.key!=="Tab")return;
      var first=buttons[0],last=buttons[buttons.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
  }
  function makeGate(){
    var en=isEnglish(),overlay=element("div");overlay.id="alnajat-safety-gate";
    overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
    overlay.setAttribute("aria-labelledby","alnajat-safety-title");overlay.setAttribute("aria-describedby","alnajat-safety-description");
    var card=element("section","as-card"),title=element("h2","",en?"A note before you begin":"تنبيه مهم قبل بدء الرحلة");
    title.id="alnajat-safety-title";
    var intro=element("p","",en
      ?"ALNAJAT is an interactive work of fiction inspired by Sudanese history. It includes references to armed conflict, displacement, hunger, detention, injury and death."
      :"النجاة عمل روائي تفاعلي مستوحى من تاريخ السودان. يتضمن إشارات ومشاهد عن النزاع المسلح والنزوح والجوع والاحتجاز والإصابة والموت.");
    intro.id="alnajat-safety-description";
    var note=element("p","as-note",en
      ?"You can pause, choose a calm reading mode, or leave at any time. Stopping is not failure. Characters are fictional; historical claims should be checked against the sources."
      :"يمكنك التوقف أو استخدام الوضع الهادئ أو مغادرة العمل في أي وقت. التوقف ليس فشلاً. الشخصيات خيالية، والوقائع التاريخية تحتاج إلى الرجوع للمصادر.");
    var actions=element("div","as-actions");
    var proceed=element("button","as-primary",en?"I understand — begin":"فهمت التنبيه — ابدأ");
    var leave=element("button","",en?"Return to menu":"العودة إلى القائمة");
    actions.append(proceed,leave);card.append(title,intro,note,actions);overlay.append(card);document.body.append(overlay);
    function close(){overlay.remove();}
    proceed.addEventListener("click",function(){
      acknowledged=true;try{localStorage.setItem(ACK_KEY,"1");}catch(_){}
      close();if(typeof window.__ALNAJAT_originalStartGame==="function")window.__ALNAJAT_originalStartGame.apply(window,[]);
    });
    leave.addEventListener("click",close);trap(overlay,[proceed,leave]);proceed.focus();
  }

  if(typeof window.startGame==="function"){
    window.__ALNAJAT_originalStartGame=window.startGame;
    window.startGame=function(){if(acknowledged)return window.__ALNAJAT_originalStartGame.apply(this,arguments);makeGate();};
  }

  /* Scene notices are editorial metadata only. Summaries never replace the source story. */
  var SCENES={
    sd2013:{level:"متوسط",enLevel:"Moderate",topics:"احتجاجات، قتلى واعتقالات",enTopics:"protests, deaths and arrests",summary:"يتناول المشهد احتجاجات سبتمبر 2013 والضغوط الاقتصادية وما تبعها من عنف واعتقالات، دون عرض تفاصيل إضافية.",enSummary:"This scene covers the September 2013 protests, economic pressure, and the violence and arrests that followed, without further detail.",skipTo:"sd2013b"},
    rev3:{level:"مرتفع",enLevel:"High",topics:"فض اعتصام، إطلاق نار، إصابة وفقد",enTopics:"sit-in dispersal, gunfire, injury and loss",summary:"يتناول المشهد فض اعتصام يونيو 2019 وما خلّفه من إصابات وفقد وخوف بين المشاركين.",enSummary:"This scene addresses the June 2019 sit-in dispersal and the injury, loss and fear experienced by those present.",skipTo:"rev4"},
    rev4:{level:"متوسط",enLevel:"Moderate",topics:"ذكرى الضحايا والحِداد",enTopics:"remembrance and grief",summary:"يتناول المشهد الساعات التالية لفض الاعتصام ومحاولة حفظ أسماء من فقدوا حياتهم.",enSummary:"This scene follows the dispersal and focuses on mourning and preserving the names of those who died.",skipTo:"rev5"},
    rev5:{level:"متوسط",enLevel:"Moderate",topics:"زيارة أسرة فقدت ابنها",enTopics:"visiting a family after the loss of a son",summary:"يتناول المشهد لقاء أسرة فقدت ابنها وحديث الأم عن الفقد والذاكرة.",enSummary:"This scene depicts a visit to a family after the loss of their son, and a mother's reflections on grief and memory.",skipTo:"rev6"},
    sd2021:{level:"متوسط",enLevel:"Moderate",topics:"انقلاب، احتجاجات وقتلى",enTopics:"coup, protests and deaths",summary:"يتناول المشهد إجراءات 25 أكتوبر 2021 والاحتجاجات التي أعقبتها وسقوط ضحايا.",enSummary:"This scene covers the measures of 25 October 2021, the protests that followed and resulting deaths.",skipTo:"sd2022"},
    sd2023:{level:"مرتفع",enLevel:"High",topics:"بداية الحرب، انفجارات ونزوح",enTopics:"outbreak of war, explosions and displacement",summary:"يتناول بداية الحرب في 15 أبريل 2023 واتساع القتال ونزوح الأسر. لا يعرض الملخص تفاصيل ميدانية.",enSummary:"This scene covers the outbreak of war on 15 April 2023, the spread of fighting and family displacement, without graphic detail.",skipTo:"sd2023b"},
    sd2023b:{level:"مرتفع",enLevel:"High",topics:"قتل جماعي ومقابر جماعية",enTopics:"mass killing and mass graves",summary:"يتناول تقارير عن قتل جماعي في الجنينة خلال يونيو 2023، وما أعقبه من نزوح. الملخص يتجنب التفاصيل الوصفية.",enSummary:"This scene addresses reports of mass killing in El Geneina in June 2023 and subsequent displacement, without graphic description.",skipTo:"sd2023c"},
    sd2023c:{level:"متوسط",enLevel:"Moderate",topics:"سقوط مدينة ونزوح متكرر",enTopics:"city capture and repeated displacement",summary:"يتناول سقوط ود مدني في ديسمبر 2023 ونزوح سكانها مرة أخرى.",enSummary:"This scene covers the capture of Wad Madani in December 2023 and another wave of displacement.",skipTo:"sd2024"},
    sd2024:{level:"مرتفع",enLevel:"High",topics:"مجاعة ومرض وانقطاع خدمات",enTopics:"famine, disease and service disruption",summary:"يتناول الحصار والجوع المعلن في مخيم زمزم وتفشي المرض وانقطاع الاتصالات.",enSummary:"This scene addresses the siege, declared famine in Zamzam camp, disease and communications disruption.",skipTo:"sd2024b"},
    sd2025:{level:"مرتفع",enLevel:"High",topics:"حصار ومجازر وتقارير عن فظائع",enTopics:"siege, mass atrocities and reports of abuses",summary:"يتناول تطورات الحرب في 2025 وتقارير عن فظائع في الفاشر، دون تفاصيل تصويرية.",enSummary:"This scene covers developments in 2025 and reports of atrocities in El Fasher, without graphic detail.",skipTo:"sd2026"},
    sd2026:{level:"متوسط",enLevel:"Moderate",topics:"استمرار الحرب والنزوح والجوع",enTopics:"ongoing war, displacement and hunger",summary:"يتناول استمرار الحرب واحتياجات المدنيين، وينتهي بسؤال طفل عن موعد انتهائها.",enSummary:"This scene addresses the continuing war and civilian needs, ending with a child's question about when it will end.",skipTo:"r2"}
  };
  var originalRender=window.renderNode;
  var activeWarning=null;
  var summaryMode=null;
  function showSceneWarning(nid,done){
    var meta=SCENES[nid],en=isEnglish(),overlay=element("div");overlay.id="alnajat-scene-warning";
    overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-labelledby","alnajat-scene-warning-title");
    var card=element("section","as-card");
    var title=element("h2","",en?"Before this scene":"تنبيه قبل هذا المشهد");title.id="alnajat-scene-warning-title";
    var category=element("p","",en?"Content level: "+meta.enLevel+" — "+meta.enTopics:"مستوى الحساسية: "+meta.level+" — "+meta.topics);
    var note=element("p","as-note",en?"You may read the full scene, use a non-graphic summary, or skip it. Skipping does not apply any choice effects.":"يمكنك قراءة المشهد كاملاً، أو الاكتفاء بملخص غير وصفي، أو تخطيه. التخطي لا يطبّق آثار أي اختيار.");
    var actions=element("div","as-actions");
    var full=element("button","as-primary",en?"Read the full scene":"قراءة المشهد كاملاً");
    var summary=element("button","",en?"Read a safe summary":"قراءة ملخص آمن");
    var skip=element("button","",en?"Skip this scene":"تخطي هذا المشهد");
    var cancel=element("button","",en?"Return to menu":"العودة إلى القائمة");
    actions.append(full,summary,skip,cancel);card.append(title,category,note,actions);overlay.append(card);document.body.append(overlay);
    function close(){overlay.remove();activeWarning=null;}
    full.addEventListener("click",function(){close();done("full");});
    summary.addEventListener("click",function(){close();done("summary");});
    skip.addEventListener("click",function(){close();done("skip");});
    cancel.addEventListener("click",function(){close();if(typeof window.showMenu==="function")window.showMenu();});
    trap(overlay,[full,summary,skip,cancel]);full.focus();activeWarning=overlay;
  }
  if(typeof originalRender==="function"){
    window.renderNode=function(nid){
      if(SCENES[nid]&&!window.__ALNAJAT_safetyBypass){
        if(activeWarning)return;
        showSceneWarning(nid,function(mode){
          if(mode==="skip"){
            var target=SCENES[nid].skipTo;
            if(!target||!window.S||!window.S[target]){window.renderNode(nid);return;}
            /* All choices in these tagged scenes share this same next node.
               We advance without calling choose(), so no choice effects are applied. */
            window.__ALNAJAT_safetyBypass=true;
            try{originalRender.call(this,target);}finally{window.__ALNAJAT_safetyBypass=false;}
            return;
          }
          summaryMode=mode==="summary"?nid:null;
          window.__ALNAJAT_safetyBypass=true;
          try{originalRender.call(this,nid);}finally{window.__ALNAJAT_safetyBypass=false;}
          if(mode==="summary"){
            var meta=SCENES[nid],box=document.querySelector("#app .tx");
            if(box){
              box.textContent=isEnglish()?meta.enSummary:meta.summary;
              box.classList.add("alnajat-safe-summary");
              box.setAttribute("aria-label",isEnglish()?"Safe scene summary":"ملخص آمن للمشهد");
            }
          }
          summaryMode=null;
        });
        return;
      }
      return originalRender.apply(this,arguments);
    };
  }

  function applyQuiet(on){
    document.body.classList.toggle("alnajat-quiet-mode",!!on);
    var button=document.getElementById("alnajat-quiet-toggle");
    if(button){button.setAttribute("aria-pressed",on?"true":"false");var en=isEnglish();button.textContent=on?(en?"Quiet mode: on":"الوضع الهادئ: مفعّل"):(en?"Quiet mode":"الوضع الهادئ");}
    try{if(window.ALNAJAT_AUDIO&&window.ALNAJAT_AUDIO.setQuietMode)window.ALNAJAT_AUDIO.setQuietMode(!!on);}catch(_){}
    if(on){try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_){}}
    try{localStorage.setItem(QUIET_KEY,on?"1":"0");}catch(_){}
  }
  var quietButton=element("button");quietButton.id="alnajat-quiet-toggle";quietButton.type="button";
  quietButton.addEventListener("click",function(){applyQuiet(!document.body.classList.contains("alnajat-quiet-mode"));});
  document.body.append(quietButton);
  var quiet=false;try{quiet=localStorage.getItem(QUIET_KEY)==="1";}catch(_){}
  applyQuiet(quiet);
  window.ALNAJAT_SAFETY={
    showNotice:function(){acknowledged=false;try{localStorage.removeItem(ACK_KEY);}catch(_){}makeGate();},
    setQuietMode:applyQuiet,
    getState:function(){return{noticeAcknowledged:acknowledged,quietMode:document.body.classList.contains("alnajat-quiet-mode")};},
    getSensitiveScenes:function(){return Object.keys(SCENES);}
  };
  console.info("ALNAJAT safety layer v2 loaded");
})();