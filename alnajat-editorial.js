/* ALNAJAT EDITORIAL EXPERIENCE — v1
   Mature visual system and ordered historical chronology.
   Additive presentation only: does not change story nodes, choices, effects, saves or endings. */
(function () {
  "use strict";
  if (window.__ALNAJAT_EDITORIAL__) return;
  window.__ALNAJAT_EDITORIAL__ = true;

  const events = [
    { date:"2003", sort:"2003-01-01", placeAr:"دارفور", placeEn:"Darfur", ar:"اندلاع نزاع دارفور، وارتباط ميليشيات الجنجويد بعمليات قتل وتهجير واسعة.", en:"The Darfur conflict escalates, with Janjaweed militias linked to widespread killings and displacement.", id:"d1" },
    { date:"سبتمبر 2013", sort:"2013-09-01", placeAr:"مدن السودان", placeEn:"Sudanese cities", ar:"احتجاجات سبتمبر بعد رفع الدعم عن الوقود وارتفاع الأسعار، وسقوط قتلى واعتقالات.", en:"September protests follow fuel-subsidy cuts and rising prices; deaths and arrests are reported.", id:"sd2013" },
    { date:"2014 – 2016", sort:"2014-01-01", placeAr:"الخرطوم", placeEn:"Khartoum", ar:"إعلان الحوار الوطني ثم إجازة الوثيقة الوطنية، بينما استمرت الحروب والنزوح.", en:"The national dialogue is announced and the National Document is adopted, while conflict and displacement continue.", id:"sd2014" },
    { date:"19 ديسمبر 2018", sort:"2018-12-19", placeAr:"عطبرة", placeEn:"Atbara", ar:"اندلاع احتجاجات عطبرة على الخبز والوقود، ثم امتداد الاحتجاجات إلى مدن السودان.", en:"Protests begin in Atbara over bread and fuel, then spread across Sudan.", id:"sd2018" },
    { date:"يناير – 11 أبريل 2019", sort:"2019-01-01", placeAr:"السودان", placeEn:"Sudan", ar:"تصاعد الاحتجاجات وإعلان الطوارئ، ثم الاعتصام أمام القيادة العامة وسقوط حكم البشير.", en:"Protests intensify; emergency rule is declared; a sit-in forms at Army Headquarters and Omar al-Bashir is removed.", id:"sd2019" },
    { date:"6 أبريل 2019", sort:"2019-04-06", placeAr:"القيادة العامة – الخرطوم", placeEn:"General Command, Khartoum", ar:"وصول الحشود إلى محيط القيادة العامة وبدء الاعتصام.", en:"Crowds gather at Army Headquarters and the sit-in begins.", id:"rev2" },
    { date:"3 يونيو 2019", sort:"2019-06-03", placeAr:"القيادة العامة – الخرطوم", placeEn:"General Command, Khartoum", ar:"مجزرة فض اعتصام القيادة العامة. تشير تقديرات وشهادات إلى مقتل 150 شخصًا على الأقل؛ وتختلف الحصائل المنشورة.", en:"The General Command sit-in massacre. Estimates and testimonies put the death toll at at least 150; published tolls differ.", id:"r2", emphasis:true },
    { date:"3 أكتوبر 2020", sort:"2020-10-03", placeAr:"جوبا", placeEn:"Juba", ar:"توقيع اتفاق جوبا للسلام، بالتزامن مع تفشي جائحة كورونا وتفاقم الأزمة الاقتصادية.", en:"The Juba Peace Agreement is signed amid the COVID-19 pandemic and worsening economic conditions.", id:"sd2020" },
    { date:"25 أكتوبر 2021", sort:"2021-10-25", placeAr:"الخرطوم", placeEn:"Khartoum", ar:"انقلاب عسكري وحل الحكومة واعتقال رئيس الوزراء وعدد من الوزراء.", en:"A military coup dissolves the transitional government and detains the prime minister and ministers.", id:"sd2021" },
    { date:"2022", sort:"2022-01-01", placeAr:"السودان", placeEn:"Sudan", ar:"تصاعد الخلافات حول الانتقال المدني وترتيبات دمج القوات، قبل اندلاع الحرب.", en:"Disputes deepen over the civilian transition and security-sector integration before war breaks out.", id:"sd2022" },
    { date:"15 أبريل 2023", sort:"2023-04-15", placeAr:"الخرطوم", placeEn:"Khartoum", ar:"اندلاع الحرب بين القوات المسلحة وقوات الدعم السريع في الخرطوم.", en:"War erupts in Khartoum between the Sudanese Armed Forces and the Rapid Support Forces.", id:"sd2023" },
    { date:"13 – 21 يونيو 2023", sort:"2023-06-13", placeAr:"الجنينة – غرب دارفور", placeEn:"El Geneina, West Darfur", ar:"أحداث الجنينة؛ يورد المشهد تقديرات وشهادات عن القتل والدفن الجماعي.", en:"Events in El Geneina; the story scene cites estimates and testimony about killings and mass burial.", id:"sd2023b" },
    { date:"18 ديسمبر 2023", sort:"2023-12-18", placeAr:"ود مدني – الجزيرة", placeEn:"Wad Madani, Al Jazirah", ar:"سقوط ود مدني ونزوح أعداد كبيرة من السكان.", en:"Wad Madani falls and large numbers of residents are displaced.", id:"sd2023c" },
    { date:"مايو – يوليو 2024", sort:"2024-05-01", placeAr:"الفاشر ومخيم زمزم", placeEn:"El Fasher and Zamzam camp", ar:"حصار الفاشر وإعلان المجاعة في مخيم زمزم، مع اتساع الاحتياجات الإنسانية.", en:"The siege of El Fasher and the famine declaration in Zamzam camp deepen humanitarian needs.", id:"sd2024" },
    { date:"يناير – أكتوبر 2025", sort:"2025-01-01", placeAr:"ود مدني والخرطوم والفاشر", placeEn:"Wad Madani, Khartoum and El Fasher", ar:"تغيرات ميدانية في ود مدني والخرطوم، ثم سقوط الفاشر في أكتوبر وفق سرد اللعبة.", en:"The story records shifts in Wad Madani and Khartoum, followed by El Fasher's fall in October.", id:"sd2025" },
    { date:"26 أكتوبر 2026", sort:"2026-10-26", placeAr:"وسط وشرق السودان", placeEn:"Central and eastern Sudan", ar:"مشهد تطورات الحرب والهجمات على البنية التحتية كما يوردها النص الروائي.", en:"A story scene on later war developments and attacks on infrastructure.", id:"sd2026" }
  ].sort((a,b)=>a.sort.localeCompare(b.sort));

  const sceneMeta = {
    d1:["2003","دارفور","Darfur"], sd2013:["سبتمبر 2013","مدن السودان","Sudanese cities","استرجاع تاريخي","Historical flashback"],
    sd2014:["2014 – 2016","الخرطوم","Khartoum","استرجاع تاريخي","Historical flashback"], sd2018:["19 ديسمبر 2018","عطبرة","Atbara"],
    sd2019:["يناير – أبريل 2019","السودان","Sudan"], rev1:["يناير 2019","الخرطوم","Khartoum"],
    rev2:["6 أبريل 2019","القيادة العامة","General Command"], rev3:["3 يونيو 2019","القيادة العامة","General Command"],
    rev4:["4 يونيو 2019","الخرطوم","Khartoum"], rev5:["يونيو 2019","الخرطوم","Khartoum"],
    sd2019b:["أبريل – يونيو 2019","الخرطوم","Khartoum"], r2:["أبريل – 3 يونيو 2019","القيادة العامة","General Command"],
    sd2020:["3 أكتوبر 2020","جوبا","Juba"], sd2021:["25 أكتوبر 2021","الخرطوم","Khartoum"],
    sd2022:["2022 – 15 أبريل 2023","السودان","Sudan"], sd2023:["15 أبريل 2023","الخرطوم","Khartoum"],
    sd2023b:["يونيو 2023","الجنينة","El Geneina"], sd2023c:["18 ديسمبر 2023","ود مدني","Wad Madani"],
    k2:["ديسمبر 2023","الجزيرة","Al Jazirah"], sd2024:["2024","الفاشر ومخيم زمزم","El Fasher and Zamzam"],
    fs1:["2024","الفاشر","El Fasher"], sd2025:["2025","السودان","Sudan"],
    fs3:["أكتوبر 2025","الفاشر","El Fasher"], sd2026:["26 أكتوبر 2026","وسط وشرق السودان","Central and eastern Sudan"]
  };

  const style = document.createElement("style");
  style.id = "alnajat-editorial-style";
  style.textContent = `
    :root{
      --bg:#0b1016;--fg:#e9e5dc;--card:#151c24;--mut:#9ba7b4;--ac:#c4a66b;--bd:#303b47;
      --fs-body:clamp(16px,1.5vw,18px);--fs-title:clamp(1.8rem,4vw,2.6rem);--r:5px;color-scheme:dark
    }
    html,body{background:var(--bg)!important;color:var(--fg)!important}
    body{background-image:radial-gradient(ellipse at 50% -20%,#24303d 0,transparent 55%)!important}
    #ptc{display:none!important}
    #app{width:min(100% - 32px,940px)!important;max-width:940px!important;margin:0 auto!important;padding:22px 0 64px!important}
    #app h1{font-family:Georgia,"Noto Naskh Arabic",serif!important;font-size:clamp(1.7rem,4vw,2.25rem)!important;letter-spacing:.02em;color:#e4d3ae!important;margin:20px 0 8px!important}
    #app .bt{position:sticky;top:0;z-index:20;display:flex;gap:7px;flex-wrap:wrap;padding:10px 0 12px!important;margin:0 0 18px!important;background:#0b1016eF;border-bottom:1px solid #ffffff1c;backdrop-filter:blur(14px)}
    #app .bt button{border:1px solid #ffffff24!important;border-radius:3px!important;background:#151c24!important;color:#d9dce0!important;padding:8px 12px!important;min-height:38px!important;font-size:12px!important;letter-spacing:.01em}
    #app .bt button:hover{border-color:#c4a66b!important;color:#f4dfad!important}
    #app .ch{display:flex;align-items:center;gap:12px;color:#d5bd8b!important;font-size:12px!important;font-weight:600;letter-spacing:.06em;margin:10px 0 16px!important;padding-bottom:12px;border-bottom:1px solid #ffffff20}
    #app .st{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:9px!important;background:#111820!important;border:1px solid #ffffff1c!important;border-radius:3px!important;padding:12px!important;color:#c6cbd1}
    #app .bar{background:#303b47!important}
    #app .art{aspect-ratio:16/9!important;max-height:48vh!important;object-fit:cover!important;border:1px solid #ffffff20!important;border-radius:3px!important;box-shadow:0 18px 55px #0008!important;filter:saturate(.72) contrast(1.06)!important}
    #app .fact{background:#171f28!important;border:1px solid #ffffff1b!important;border-inline-start:3px solid #c4a66b!important;border-radius:2px!important;color:#b9c2cb!important;font-size:13px!important;padding:14px 17px!important;margin:14px 0!important}
    #app .tx{max-width:78ch!important;margin:18px auto 24px!important;padding:clamp(18px,3vw,30px)!important;background:linear-gradient(145deg,#151d26,#111820)!important;border:1px solid #ffffff17!important;border-inline-start:2px solid #a98d58!important;border-radius:2px!important;color:#e6e2d9!important;font-family:"Noto Naskh Arabic","Geeza Pro",serif!important;font-size:clamp(17px,1.65vw,19px)!important;line-height:2.15!important;letter-spacing:0!important;box-shadow:0 18px 50px #0003!important}
    #app .btn{border:1px solid #ffffff25!important;border-radius:3px!important;background:#151d26!important;color:#e4e6e8!important;padding:15px 18px!important;min-height:54px!important;font-size:15px!important;line-height:1.8!important;text-align:start!important}
    #app .btn:hover{border-color:#c4a66b!important;background:#1c2631!important}
    #app .btn.pri{background:#b2935c!important;color:#111820!important;border:1px solid #d4bb8a!important;font-weight:700}
    #app .tx~.btn{position:relative;padding-inline-start:52px!important}
    #app .tx~.btn:before{content:counter(alnajat-choice);counter-increment:alnajat-choice;position:absolute;inset-inline-start:17px;top:50%;transform:translateY(-50%);font:600 12px/1 Georgia,serif;color:#c4a66b}
    #app{counter-reset:alnajat-choice}
    #app .ccard{background:#202b36!important;color:#cbd3dc!important;border:1px solid #ffffff1b;border-radius:2px!important}
    #app .risk{background:#7e3333!important}
    #app .mut{color:#9ba7b4!important}
    #app #alnajat-editorial-timeline{border-color:#c4a66b!important;color:#f0dfbd!important}
    #pn{background:#03070bdc!important;backdrop-filter:blur(12px)!important}
    #pn>div{background:#111820!important;color:#e9e5dc!important;border:1px solid #c4a66b66!important;border-radius:3px!important;max-width:min(760px,100%)!important}
    #pn h3{font-family:Georgia,"Noto Naskh Arabic",serif;color:#e4d3ae;font-size:22px}
    #pn .it2{border-color:#ffffff20!important}
    #alnajat-chronology{max-height:min(72vh,760px);overflow:auto;padding:4px 2px 12px}
    #alnajat-chronology .intro{font-size:13px;line-height:1.9;color:#aeb8c3;border-bottom:1px solid #ffffff20;padding:0 0 14px;margin:0 0 16px}
    #alnajat-chronology .event{display:grid;grid-template-columns:116px 1fr;gap:16px;padding:15px 10px;border-bottom:1px solid #ffffff16;position:relative}
    #alnajat-chronology .event:before{content:"";position:absolute;inset-inline-start:106px;top:23px;bottom:-23px;width:1px;background:#6e6046}
    #alnajat-chronology .date{font:600 12px/1.8 system-ui,sans-serif;color:#d0b477;text-align:start}
    #alnajat-chronology .event h4{margin:0 0 4px;font:600 15px/1.6 system-ui,sans-serif;color:#eee9df}
    #alnajat-chronology .event p{margin:0;font:13px/1.9 system-ui,sans-serif;color:#aeb8c3}
    #alnajat-chronology .place{display:block;margin-top:5px;font-size:11px;color:#788797}
    #alnajat-chronology .event.key{background:linear-gradient(90deg,#c4a66b12,transparent);border-inline-start:2px solid #c4a66b}
    #alnajat-chronology .event.key h4{color:#ead4a8}
    #alnajat-chronology .footnote{margin:14px 0;color:#8f9aa6;font-size:11px;line-height:1.8}
    @media(max-width:640px){
      #app{width:min(100% - 22px,940px)!important;padding-top:12px!important}
      #app .bt{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}
      #app .bt button{flex:0 0 auto}
      #app .st{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      #app .tx{line-height:2!important;padding:18px!important}
      #alnajat-chronology .event{grid-template-columns:88px 1fr;gap:10px;padding:13px 6px}
      #alnajat-chronology .event:before{inset-inline-start:82px}
      #alnajat-chronology .event h4{font-size:14px}
    }
    @media(prefers-reduced-motion:reduce){#app *,#pn *{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);

  function isEn(){return document.documentElement.lang==="en" || localStorage.getItem("najat_lang")==="en";}
  function safe(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function openChronology(){
    const panel=document.getElementById("pn");
    if(!panel)return;
    const en=isEn();
    const rows=events.map(function(e){
      return '<article class="event '+(e.emphasis?"key":"")+'"><div class="date">'+safe(e.date)+'</div><div><h4>'+(en?safe(e.placeEn):safe(e.placeAr))+'</h4><p>'+(en?safe(e.en):safe(e.ar))+'</p></div></article>';
    }).join("");
    panel.innerHTML='<div><h3>'+(en?"Historical chronology":"التسلسل الزمني للأحداث")+'</h3><p class="intro">'+(en?"A chronological reference for the historical context of the story. Branching scenes may revisit earlier periods; this chronology remains in calendar order.":"مرجع زمني مرتب للأحداث التاريخية الواردة في الحكاية. قد تعود بعض المسارات السردية إلى فترات سابقة؛ أما هذا السجل فيبقى مرتبًا حسب التاريخ.")+'</p><section id="alnajat-chronology">'+rows+'</section><p class="footnote">'+(en?"Historical references are presented as context for an interactive fictional narrative. Estimates and disputed figures are attributed in the relevant entries; this is not a complete historical record.":"تُعرض الوقائع بوصفها سياقًا تاريخيًا لحكاية تفاعلية خيالية. تُنسب التقديرات والأرقام المختلف عليها إلى مصادرها في مواضعها؛ وهذا السجل ليس تأريخًا شاملًا لكل أحداث السودان.")+'</p><button class="btn pri" onclick="document.getElementById(\'pn\').classList.remove(\'on\')">'+(en?"Close":"إغلاق")+'</button></div>';
    panel.classList.add("on");
  }
  window.openAlnajatChronology=openChronology;
  if(typeof window.openTimeline==="function")window.openTimeline=openChronology;

  function addTimelineButton(){
    const app=document.getElementById("app");
    if(!app)return;
    const nav=app.querySelector(".bt");
    if(nav&&!nav.querySelector("[data-editorial-timeline]")){
      const b=document.createElement("button");
      b.type="button";b.dataset.editorialTimeline="1";
      b.textContent=isEn()?"Chronology":"التسلسل الزمني";
      b.addEventListener("click",openChronology);
      nav.insertBefore(b,nav.querySelector("button[onclick*='sv()']")||null);
    }
    if(!nav&&!app.querySelector("[data-editorial-menu]")){
      const b=document.createElement("button");
      b.className="btn";b.type="button";b.dataset.editorialMenu="1";
      b.textContent=isEn()?"Historical chronology":"التسلسل الزمني للأحداث";
      b.addEventListener("click",openChronology);
      const about=Array.from(app.querySelectorAll("button")).find(x=>/عن اللعبة|About/.test(x.textContent||""));
      if(about)about.insertAdjacentElement("afterend",b);else app.appendChild(b);
    }
  }
  function decorateScene(nid){
    const app=document.getElementById("app");
    if(!app)return;
    const old=app.querySelector(".alnajat-scene-meta");
    if(old)old.remove();
    const meta=sceneMeta[nid];
    if(!meta)return;
    const en=isEn();
    const el=document.createElement("div");
    el.className="alnajat-scene-meta";
    el.textContent=(en?meta[0]+"  /  "+meta[2]:meta[0]+"  /  "+meta[1])+(meta[3]?"  ·  "+(en?meta[4]:meta[3]):"");
    const chapter=app.querySelector(".ch");
    if(chapter)chapter.insertAdjacentElement("afterend",el);
  }
  const metaStyle=document.createElement("style");
  metaStyle.textContent=".alnajat-scene-meta{font:600 11px/1.7 system-ui,sans-serif;letter-spacing:.04em;color:#b9a276;margin:-8px 0 14px;padding-inline-start:2px;text-transform:none}";
  document.head.appendChild(metaStyle);

  const oldRender=window.renderNode;
  if(typeof oldRender==="function"){
    window.renderNode=function(nid){const result=oldRender.apply(this,arguments);decorateScene(nid);return result;};
  }
  const oldMenu=window.showMenu;
  if(typeof oldMenu==="function"){
    window.showMenu=function(){const result=oldMenu.apply(this,arguments);addTimelineButton();return result;};
  }
  const oldTop=window.topBar;
  if(typeof oldTop==="function"){
    window.topBar=function(){
      let html=oldTop.apply(this,arguments)||"";
      if(html.indexOf("data-editorial-timeline")===-1){
        const button='<button type="button" data-editorial-timeline="1" onclick="window.openAlnajatChronology()">'+(isEn()?"Chronology":"التسلسل الزمني")+'</button>';
        const anchor='onclick="openTimeline()"';
        const pos=html.indexOf("</button>",html.indexOf(anchor));
        if(pos!==-1)html=html.slice(0,pos+9)+button+html.slice(pos+9);
      }
      return html;
    };
  }
  console.info("ALNAJAT Editorial Experience v1 loaded");
})();