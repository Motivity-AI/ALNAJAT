/* ALNAJAT — informed content notice, scene-level safety and calm mode.
   Additive layer: never edits story data, choices, effects, or endings. */
(function(){
  "use strict";
  var ACK_KEY="alnajat_content_notice_ack_v1";
  var QUIET_KEY="alnajat_quiet_mode_v1";
  var acknowledged=false;
  var activeGate=null;
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
    "#alnajat-safety-gate button:focus-visible,#alnajat-scene-warning button:focus-visible,#alnajat-quiet-toggle:focus-visible,#alnajat-scene-warning a:focus-visible{outline:3px solid #1769aa;outline-offset:3px}",
    "#alnajat-scene-warning .as-source-links{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;padding:10px 12px;border:1px solid #b7a48a;border-radius:10px;background:#eee9df}",
    "#alnajat-scene-warning .as-source-links a{color:#174f7b;font-weight:700;text-underline-offset:3px}",
    "#alnajat-quiet-toggle{position:fixed;z-index:100050;inset-inline-start:12px;inset-block-end:calc(14px + env(safe-area-inset-bottom,0px));min-height:44px;padding:8px 12px;border:1px solid #8c765e;border-radius:999px;background:#f7f2e9;color:#211d18;font:600 13px/1.3 system-ui,sans-serif;box-shadow:0 3px 16px #0003;cursor:pointer}",
    "body.alnajat-quiet-mode *,body.alnajat-quiet-mode *::before,body.alnajat-quiet-mode *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}",
    "body.alnajat-quiet-mode #ptc,body.alnajat-quiet-mode #cb{display:none!important}",
    ".alnajat-safe-summary{padding:12px 14px;margin:12px 0;border:1px solid #9b8b73;border-radius:10px;background:#eee9df;color:#211d18;line-height:1.8}",
    "@media(prefers-reduced-motion:reduce){#alnajat-safety-gate *,#alnajat-scene-warning *,#alnajat-quiet-toggle{scroll-behavior:auto!important;transition:none!important;animation:none!important}}"
  ].join("");
  document.head.appendChild(style);

  function isEnglish(){return (typeof LG!=="undefined"&&LG==="en")||document.documentElement.lang==="en"||document.documentElement.dir==="ltr";}
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
  function makeGate(onProceed){
    if(activeGate)return;
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
    function close(){overlay.remove();activeGate=null;}
    proceed.addEventListener("click",function(){
      acknowledged=true;try{localStorage.setItem(ACK_KEY,"1");}catch(_){}
      close();
      if(typeof onProceed==="function")onProceed();
      else if(typeof window.__ALNAJAT_originalStartGame==="function")window.__ALNAJAT_originalStartGame.apply(window,[]);
    });
    leave.addEventListener("click",close);trap(overlay,[proceed,leave]);activeGate=overlay;proceed.focus();
  }

  if(typeof window.startGame==="function"){
    window.__ALNAJAT_originalStartGame=window.startGame;
    window.startGame=function(){var self=this,args=arguments;if(acknowledged)return window.__ALNAJAT_originalStartGame.apply(self,args);makeGate(function(){window.__ALNAJAT_originalStartGame.apply(self,args);});};
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
    sd2026:{level:"متوسط",enLevel:"Moderate",topics:"استمرار الحرب والنزوح والجوع",enTopics:"ongoing war, displacement and hunger",summary:"يتناول استمرار الحرب واحتياجات المدنيين، وينتهي بسؤال طفل عن موعد انتهائها.",enSummary:"This scene addresses the continuing war and civilian needs, ending with a child's question about when it will end.",skipTo:"r2"},

    d1:{level:"مرتفع",enLevel:"High",topics:"رصاص وانفجارات وحريق ونزوح",enTopics:"gunfire, explosions, fire and displacement",summary:"يتناول المشهد تهديد العنف في دارفور واضطرار الأسرة إلى مغادرة منزلها. لا يعرض الملخص تفاصيل الإصابة أو الدمار.",enSummary:"This scene addresses violence in Darfur and a family's need to flee home, without describing injury or destruction."},
    d2:{level:"متوسط",enLevel:"Moderate",topics:"مسلحون وتهديد أثناء النزوح",enTopics:"armed men and threats during displacement",summary:"يتناول المشهد مواجهة مسلحين على طريق النزوح وما يصاحبها من خوف.",enSummary:"This scene addresses an encounter with armed men during displacement and the fear it creates."},
    d3:{level:"مرتفع",enLevel:"High",topics:"فقد الأسرة والوحدة",enTopics:"family loss and isolation",summary:"يتناول المشهد فقدان الأسرة وبقاء الطفل وحيدًا، دون وصف تفاصيل العنف.",enSummary:"This scene addresses a child losing their family and being left alone, without graphic detail."},
    d4:{level:"متوسط",enLevel:"Moderate",topics:"ميليشيا مسلحة وتهديد",enTopics:"armed militia and intimidation",summary:"يتناول المشهد رؤية جماعة مسلحة والتعرض لموقف ينطوي على تهديد واستغلال.",enSummary:"This scene depicts an encounter with an armed group and a threatening, exploitative situation."},
    d5b:{level:"متوسط",enLevel:"Moderate",topics:"تهديد بالقتل وعطش وخوف",enTopics:"threats of death, thirst and fear",summary:"يتناول المشهد اختباء طفل مع طفل آخر تحت تهديد المسلحين والعطش.",enSummary:"This scene addresses two children hiding under threat from armed men while facing thirst."},
    r2:{level:"مرتفع",enLevel:"High",topics:"مجزرة فض الاعتصام، قتلى وإصابات وفقد",enTopics:"sit-in massacre, deaths, injuries and missing people",summary:"يتناول المشهد فض اعتصام القيادة العامة في 3 يونيو 2019 وما تلاه من فقد وحداد. يتجنب الملخص التفاصيل الوصفية.",enSummary:"This scene addresses the 3 June 2019 General Command sit-in dispersal and its aftermath of loss and mourning, without graphic detail."},
    w1:{level:"مرتفع",enLevel:"High",topics:"اندلاع الحرب وانفجارات وخطر على الأسرة",enTopics:"outbreak of war, explosions and family danger",summary:"يتناول المشهد بداية الحرب في الخرطوم وعودة الخوف إلى حياة الأسرة.",enSummary:"This scene addresses the outbreak of war in Khartoum and fear returning to family life."},
    v1:{level:"متوسط",enLevel:"Moderate",topics:"بداية القتال وخوف الأطفال",enTopics:"fighting begins and children are frightened",summary:"يتناول المشهد بداية القتال واضطراب الأسرة وخوف الأطفال.",enSummary:"This scene addresses the start of fighting and the fear experienced by a family and its children."},
    v2:{level:"مرتفع",enLevel:"High",topics:"اقتحام منزل بواسطة مسلحين",enTopics:"armed men entering a home",summary:"يتناول المشهد اقتحام رجال مسلحين للحي واقتراب الخطر من منزل الأسرة.",enSummary:"This scene addresses armed men entering a neighborhood and danger reaching a family's home."},
    w2:{level:"مرتفع",enLevel:"High",topics:"فقد الأسرة والتهجير القسري",enTopics:"family loss and forced displacement",summary:"يتناول المشهد اقتحام الحي وفقدان الممتلكات والمنزل والأسرة، دون وصف تصويري.",enSummary:"This scene addresses a neighborhood raid, loss of home and possessions, and family separation, without graphic description."},
    v3:{level:"مرتفع",enLevel:"High",topics:"احتجاز قسري ونقل في شاحنة",enTopics:"forced detention and transport in a truck",summary:"يتناول المشهد الاحتجاز القسري ونقل أشخاص في ظروف قاسية.",enSummary:"This scene addresses forced detention and the transport of people in harsh conditions."},
    q3:{level:"مرتفع",enLevel:"High",topics:"اعتداء جسدي على فتى قاصر",enTopics:"physical abuse of a minor",summary:"يتناول المشهد تعرض فتى قاصر للضرب بعد طلبه الماء.",enSummary:"This scene addresses a minor being beaten after asking for water."},
    q4:{level:"متوسط",enLevel:"Moderate",topics:"ترهيب واستجواب وتهديد بالعنف",enTopics:"intimidation, interrogation and threat of violence",summary:"يتناول المشهد استجوابًا ينطوي على ترهيب وتهديد بالعنف.",enSummary:"This scene addresses an intimidating interrogation and threats of violence."},
    p1:{level:"مرتفع",enLevel:"High",topics:"سجن واكتظاظ وجوع وإصابة",enTopics:"imprisonment, overcrowding, hunger and injury",summary:"يتناول المشهد ظروف الاحتجاز القاسية ونقص الطعام ووجود سجين مصاب.",enSummary:"This scene addresses harsh detention conditions, food scarcity and an injured prisoner."},
    p2:{level:"مرتفع",enLevel:"High",topics:"تهديد بالضرب والعمل القسري",enTopics:"threats of beating and forced labor",summary:"يتناول المشهد التهديد بالعقاب الجسدي وإجبار السجناء على العمل.",enSummary:"This scene addresses threats of physical punishment and forced labor in detention."},
    p4:{level:"مرتفع",enLevel:"High",topics:"قصف السجن وخطر الهروب",enTopics:"prison bombardment and danger during escape",summary:"يتناول المشهد إصابة جدار السجن بالقصف وظهور فرصة هروب محفوفة بالخطر.",enSummary:"This scene addresses a prison wall being hit by bombardment and a dangerous chance to escape."},
    e1:{level:"مرتفع",enLevel:"High",topics:"حصار وقنّاصة وعطش",enTopics:"siege, snipers and thirst",summary:"يتناول المشهد النزوح إلى مدرسة وانقطاع الخدمات والخطر أثناء البحث عن الماء.",enSummary:"This scene addresses displacement to a school, loss of basic services and danger while seeking water."},
    e2:{level:"متوسط",enLevel:"Moderate",topics:"حاجز مسلح وتوقيف وتمييز",enTopics:"armed checkpoint, questioning and discrimination",summary:"يتناول المشهد المرور عبر حاجز مسلح والتعرض للاستجواب والتمييز.",enSummary:"This scene addresses an armed checkpoint and the risk of questioning and discrimination."},
    fs1:{level:"مرتفع",enLevel:"High",topics:"حصار الفاشر ونقص الغذاء والخطر",enTopics:"El Fasher siege, food scarcity and danger",summary:"يتناول المشهد العودة إلى الفاشر في ظل الحصار ونقص الإمدادات والخطر على المدنيين.",enSummary:"This scene addresses returning to El Fasher amid siege, shortages and danger to civilians."},
    fs3:{level:"مرتفع",enLevel:"High",topics:"قصف واقتحام وتقارير عن مجازر ونزوح",enTopics:"shelling, armed incursion, reports of atrocities and displacement",summary:"يتناول المشهد القصف ودخول القوات إلى أطراف المدينة وتقارير الانتهاكات والنزوح الجماعي، دون تفاصيل تصويرية.",enSummary:"This scene addresses shelling, forces entering the city's outskirts, reports of abuses and mass displacement, without graphic detail."},
    je:{level:"مرتفع",enLevel:"High",topics:"نزوح ومأوى وانقطاع الماء وخطر القنّاصة",enTopics:"displacement, shelter, water disruption and sniper danger",summary:"يتناول هذا المقطع المتكرر الحياة في مدرسة إيواء مع انقطاع الماء والخطر أثناء الوصول إلى البئر.",enSummary:"This repeating segment addresses life in a shelter school, water disruption and danger while seeking a well."},
    jp:{level:"مرتفع",enLevel:"High",topics:"احتجاز واكتظاظ وإهانة",enTopics:"detention, overcrowding and humiliation",summary:"يتناول هذا المقطع المتكرر ظروف الزنزانة والحرمان من الاحتياجات الأساسية.",enSummary:"This repeating segment addresses prison-cell conditions and deprivation of basic needs."},
    jf:{level:"مرتفع",enLevel:"High",topics:"حصار الفاشر وقصف ونقص الغذاء",enTopics:"El Fasher siege, shelling and food scarcity",summary:"يتناول هذا المقطع المتكرر الحياة تحت الحصار مع القصف ونقص الطعام.",enSummary:"This repeating segment addresses life under siege amid shelling and food shortages."},
    jw:{level:"مرتفع",enLevel:"High",topics:"قصف الخرطوم ونقص الماء والغذاء",enTopics:"Khartoum bombardment and shortages of water and food",summary:"يتناول هذا المقطع المتكرر القصف ونقص الاحتياجات الأساسية ومحاولة حماية الأسرة.",enSummary:"This repeating segment addresses bombardment, shortages of essentials and efforts to protect a family."}
  };
  var SCENE_SOURCES={
    sd2013:["SRC-001"],
    rev2:["SRC-002"],rev3:["SRC-002"],rev4:["SRC-002"],rev5:["SRC-002"],r2:["SRC-002"],sd2019:["SRC-002"],sd2019b:["SRC-002"],
    sd2021:["SRC-003"],
    sd2023:["SRC-004"],w1:["SRC-004"],v1:["SRC-004"],v2:["SRC-004"],w2:["SRC-004"],o1:["SRC-004"],o2:["SRC-004"],gd:["SRC-004"],
    sd2023b:["SRC-005","SRC-012"],d1:["SRC-011"],d2:["SRC-011"],d3:["SRC-011"],d4:["SRC-011"],d5b:["SRC-011"],
    sd2024:["SRC-006"],fs1:["SRC-006"],jf:["SRC-006"],
    fs3:["SRC-007","SRC-008","SRC-009","SRC-010"],sd2025:["SRC-007","SRC-008","SRC-009","SRC-010"]
  };
  var SCENE_SOURCE_LABELS={
    "SRC-001":"Amnesty International — 2013","SRC-002":"Human Rights Watch — 2019",
    "SRC-003":"FCDO — 2021","SRC-004":"OHCHR / UN — 2023","SRC-005":"Human Rights Watch — El Geneina",
    "SRC-006":"IPC — Zamzam 2024","SRC-007":"UN — April 2025","SRC-008":"OHCHR — Zamzam 2025",
    "SRC-009":"IPC — October 2025","SRC-010":"UN Fact-Finding Mission",
    "SRC-011":"Human Rights Watch — Darfur 2003–04","SRC-012":"OHCHR — Mass grave, July 2023"
  };
  var originalRender=window.renderNode;
  var activeWarning=null;
  var summaryMode=null;
  function sharedContinuation(nid){
    try{
      if(typeof S==="undefined"||!S[nid]||!Array.isArray(S[nid][2])||!S[nid][2].length)return null;
      var choices=S[nid][2],target=choices[0][1];
      if(typeof target!=="string"||!target||target.charAt(0)==="@")return null;
      if(choices.some(function(choice){return !Array.isArray(choice)||choice[1]!==target||choice[4]||choice[5];}))return null;
      if(target!=="fin"&&!S[target])return null;
      return target;
    }catch(_){return null;}
  }
  function showSceneWarning(nid,done){
    var meta=SCENES[nid],en=isEnglish(),skipTarget=sharedContinuation(nid),overlay=element("div");overlay.id="alnajat-scene-warning";
    overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-labelledby","alnajat-scene-warning-title");
    var card=element("section","as-card");
    var title=element("h2","",en?"Before this scene":"تنبيه قبل هذا المشهد");title.id="alnajat-scene-warning-title";
    var category=element("p","",en?"Content level: "+meta.enLevel+" — "+meta.enTopics:"مستوى الحساسية: "+meta.level+" — "+meta.topics);
    var note=element("p","as-note",en?"You may read the full scene, use a non-graphic summary, or skip it. Skipping does not apply any choice effects.":"يمكنك قراءة المشهد كاملاً، أو الاكتفاء بملخص غير وصفي، أو تخطيه. التخطي لا يطبّق آثار أي اختيار.");
    var actions=element("div","as-actions");
    var sourceIds=SCENE_SOURCES[nid]||[],sourceBox=null;
    if(sourceIds.length){sourceBox=element("div","as-source-links");sourceIds.forEach(function(sourceId){var link=element("a","",sourceId+" · "+SCENE_SOURCE_LABELS[sourceId]);link.href="sources.html#"+sourceId;link.target="_blank";link.rel="noopener noreferrer";sourceBox.appendChild(link);});}
    var full=element("button","as-primary",en?"Read the full scene":"قراءة المشهد كاملاً");
    var summary=element("button","",en?"Read a safe summary":"قراءة ملخص آمن");
    var skip=element("button","",en?"Skip this scene":"تخطي هذا المشهد");
    var cancel=element("button","",en?"Return to menu":"العودة إلى القائمة");
    if(skipTarget)actions.append(full,summary,skip,cancel);else actions.append(full,summary,cancel);
    card.append(title,category,note);if(sourceBox)card.append(sourceBox);card.append(actions);overlay.append(card);document.body.append(overlay);
    function close(){overlay.remove();activeWarning=null;}
    full.addEventListener("click",function(){close();done("full");});
    summary.addEventListener("click",function(){close();done("summary");});
    skip.addEventListener("click",function(){close();done("skip");});
    cancel.addEventListener("click",function(){close();if(typeof window.showMenu==="function")window.showMenu();});
    trap(overlay,skipTarget?[full,summary,skip,cancel]:[full,summary,cancel]);full.focus();activeWarning=overlay;
  }
  if(typeof originalRender==="function"){
    window.renderNode=function(nid){
      if(!acknowledged&&!window.__ALNAJAT_safetyBypass){
        makeGate(function(){window.renderNode(nid);});
        return;
      }
      if(SCENES[nid]&&!window.__ALNAJAT_safetyBypass){
        if(activeWarning)return;
        showSceneWarning(nid,function(mode){
          if(mode==="skip"){
            var target=sharedContinuation(nid);
            if(!target){window.renderNode(nid);return;}
            /* All choices in these tagged scenes share this same next node.
               We advance without calling choose(), so no choice effects are applied. */
            window.__ALNAJAT_safetyBypass=true;
            try{if(target==="fin"&&typeof window.finish==="function")window.finish();else originalRender.call(this,target);}finally{window.__ALNAJAT_safetyBypass=false;}
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

  function injectSourcesButton(){
    var app=document.getElementById("app");
    if(!app||!app.querySelector("button.pri")||app.querySelector("[data-alnajat-sources]"))return;
    var settings=Array.prototype.slice.call(app.querySelectorAll("button")).find(function(button){var label=button.textContent||"";return label.indexOf("الإعدادات")!==-1||label.indexOf("Settings")!==-1;});
    if(!settings)return;
    var link=element("a","btn",isEnglish()?"📚 Historical sources":"📚 المصادر التاريخية");
    link.href="sources.html";link.setAttribute("data-alnajat-sources","1");
    settings.insertAdjacentElement("afterend",link);
  }
  var priorShowMenu=window.showMenu;
  if(typeof priorShowMenu==="function"){
    window.showMenu=function(){var result=priorShowMenu.apply(this,arguments);injectSourcesButton();return result;};
  }
  injectSourcesButton();

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
    getSensitiveScenes:function(){return Object.keys(SCENES);},

    r1:{level:"متوسط",enLevel:"Moderate",topics:"إصابات خلال احتجاجات ديسمبر 2018",enTopics:"injuries during the December 2018 protests",summary:"يتناول المشهد احتجاجات ديسمبر ووجود مصابين قرب الميدان، مع إمكانية مساعدة الجرحى أو متابعة الطريق.",enSummary:"This scene addresses the December protests and injured people near the square, including the choice to help or continue."},
    q1:{level:"متوسط",enLevel:"Moderate",topics:"توتر عسكري ومخاوف قبيل الحرب",enTopics:"military tension and fears before the war",summary:"يتناول المشهد الشائعات والتحركات العسكرية في الأحياء وقلق السكان قبيل اندلاع القتال.",enSummary:"This scene addresses rumors, military movements in neighborhoods and residents' anxiety before fighting begins."},
    g1:{level:"متوسط",enLevel:"Moderate",topics:"أسر فقدت معيلين واحتياجات إنسانية",enTopics:"families who lost providers and humanitarian needs",summary:"يتناول المشهد عمل غرفة طوارئ الحي لحصر الأسر التي فقدت أفراداً وتحتاج إلى الدواء والماء.",enSummary:"This scene addresses a neighborhood emergency room identifying families who have lost members and need medicine and water."},
    gd:{level:"متوسط",enLevel:"Moderate",topics:"نزوح ومأوى وعدم يقين",enTopics:"displacement, shelter and uncertainty",summary:"يتناول المشهد الوصول إلى مدرسة تحولت إلى مأوى للنازحين وسط أخبار غير مؤكدة عن الهدنة والمفاوضات.",enSummary:"This scene addresses reaching a school shelter amid uncertain news about ceasefires and negotiations."},
    fs2:{level:"متوسط",enLevel:"Moderate",topics:"مصاب والتبرع بالدم ونقص الغذاء",enTopics:"injured person, blood donation and food scarcity",summary:"يتناول المشهد مطبخاً جماعياً وغرفة طوارئ تحتاج إلى متبرعين بالدم ومساعدة المنتظرين.",enSummary:"This scene addresses a community kitchen and emergency room seeking blood donors and support for people waiting."},
    s5b:{level:"مرتفع",enLevel:"High",topics:"تهديد مسلح للحافلة وركابها",enTopics:"armed threat to a bus and its passengers",summary:"يتناول المشهد إيقاف حافلة ليلاً بواسطة شبان ملثمين ووجود امرأة حامل وطفلين بين الركاب.",enSummary:"This scene addresses a bus being stopped at night by masked men while a pregnant woman and two children are aboard."},
    z1:{level:"متوسط",enLevel:"Moderate",topics:"آثار الرصاص وفقدان الأسرة",enTopics:"bullet damage and family loss",summary:"يتناول المشهد العودة إلى حي قديم متضرر والعثور على حقيبة مدرسية مرتبطة بذكرى أحد أفراد الأسرة.",enSummary:"This scene addresses returning to a damaged former neighborhood and finding a schoolbag tied to a family memory."},
    w3:{level:"مرتفع",enLevel:"High",topics:"اختطاف واحتجاز في معسكر",enTopics:"abduction and detention in a camp",summary:"يتناول المشهد اقتياد الشخصية إلى معسكر واحتجازها بعيداً عن أهلها.",enSummary:"This scene addresses the protagonist being taken to a camp and detained away from family."},
    p3:{level:"متوسط",enLevel:"Moderate",topics:"سجن ومحاولة التعامل مع حارس",enTopics:"prison and an encounter with a guard",summary:"يتناول المشهد التفاعل مع حارس سجين في سياق محاولة النجاة أو الهروب من الاحتجاز.",enSummary:"This scene addresses an encounter with a prison guard in the context of surviving or escaping detention."},
    o1:{level:"مرتفع",enLevel:"High",topics:"مدينة مدمرة وجوع وفقد الأسرة",enTopics:"destroyed city, hunger and family loss",summary:"يتناول المشهد الوصول إلى مدينة متضررة بعد فقدان البيت والأسرة والبحث عن الطعام والمساعدة.",enSummary:"This scene addresses arriving in a damaged city after losing home and family, while seeking food and help."},
    o2:{level:"مرتفع",enLevel:"High",topics:"حصار ونقص الغذاء وخيارات النزوح",enTopics:"siege, food shortages and displacement choices",summary:"يتناول المشهد اشتداد الحصار ونقص الغذاء والاختيار بين مساعدة الآخرين أو الانتظار أو عبور الحدود أو العودة إلى الفاشر.",enSummary:"This scene addresses a tightening siege, food shortages and choices between helping others, waiting, crossing a border or returning to El Fasher."},
    rev1:{level:"متوسط",enLevel:"Moderate",topics:"ذكرى ضحية احتجاج وفقد أخ",enTopics:"remembrance of a protest victim and loss of a brother",summary:"يتناول المشهد لقاء ناشطين في يناير 2019، ومن بينهم شاب فقد أخاه خلال احتجاج.",enSummary:"This scene addresses meeting activists in January 2019, including a young man who lost his brother during a protest."},
    rev2:{level:"مرتفع",enLevel:"High",topics:"إطلاق نار خلال اعتصام أبريل 2019",enTopics:"gunfire during the April 2019 sit-in",summary:"يتناول المشهد الاعتصام أمام القيادة العامة في أبريل 2019 وبدء إطلاق النار ليلاً.",enSummary:"This scene addresses the April 2019 sit-in outside General Command and gunfire beginning at night."},
    sd2014:{level:"متوسط",enLevel:"Moderate",topics:"استمرار النزاعات المسلحة في مناطق سودانية",enTopics:"ongoing armed conflicts in Sudanese regions",summary:"يتناول المشهد الحوار الوطني والوثيقة الوطنية مع استمرار النزاعات في دارفور والنيل الأزرق وجنوب كردفان.",enSummary:"This scene addresses the national dialogue and National Document alongside continuing conflicts in Darfur, Blue Nile and South Kordofan."},
    sd2019:{level:"مرتفع",enLevel:"High",topics:"قتلى واعتداء على مستشفى وإطلاق نار",enTopics:"deaths, hospital raid and gunfire",summary:"يتناول المشهد سقوط قتلى خلال الاحتجاجات واقتحام مستشفى في أم درمان وإطلاق النار بحثاً عن مصابين.",enSummary:"This scene addresses deaths during protests and a hospital raid in Omdurman involving gunfire in pursuit of injured people."},
    sd2019b:{level:"مرتفع",enLevel:"High",topics:"فض اعتصام القيادة العامة وقتلى ومفقودون",enTopics:"General Command sit-in dispersal, deaths and missing people",summary:"يتناول المشهد فض اعتصام القيادة العامة في 3 يونيو 2019، مع الإشارة إلى اختلاف الحصائل المنشورة وشهادات الفقد.",enSummary:"This scene addresses the 3 June 2019 General Command sit-in dispersal, noting differing published casualty estimates and accounts of missing people."},
    sd2020:{level:"متوسط",enLevel:"Moderate",topics:"جائحة كورونا وأزمة اقتصادية",enTopics:"COVID-19 pandemic and economic crisis",summary:"يتناول المشهد توقيع اتفاق جوبا للسلام ثم انتشار جائحة كورونا وتفاقم الأزمة الاقتصادية.",enSummary:"This scene addresses the Juba Peace Agreement followed by the spread of COVID-19 and a worsening economic crisis."},
    sd2022:{level:"مرتفع",enLevel:"High",topics:"تصاعد التوتر بين الجيش والدعم السريع وبداية الحرب",enTopics:"escalating tensions between the army and RSF and the outbreak of war",summary:"يتناول المشهد تصاعد الخلافات العسكرية والسياسية وصولاً إلى اندلاع الحرب في 15 أبريل 2023.",enSummary:"This scene addresses escalating military and political tensions leading to the outbreak of war on 15 April 2023."}
  };
  /* Promote the additional exported scene metadata into the live lookup table.
     Without this merge, these entries exist in the public API but never trigger scene warnings. */
  Object.keys(window.ALNAJAT_SAFETY).forEach(function(key){
    var value=window.ALNAJAT_SAFETY[key];
    if(value&&typeof value==="object"&&value.level&&value.summary)SCENES[key]=value;
  });

  console.info("ALNAJAT safety layer v8 loaded");
})();