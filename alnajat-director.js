/* ALNAJAT DIRECTOR'S CUT — 2026
   Persistent journey chronicle, decision trace, ending gallery, backup/restore,
   install guidance, and resilient offline status. Additive layer only:
   never rewrites story nodes, choices, effects, or ending rules. */
(function () {
  "use strict";
  if (window.__ALNAJAT_DIRECTORS_CUT__) return;
  window.__ALNAJAT_DIRECTORS_CUT__ = true;

  const STORE = "alnajat_directors_cut_v1";
  const MAX_EVENTS = 400;
  const state = { events: [], visited: [], installPrompt: null };
  const $ = (s, r) => (r || document).querySelector(s);
  const lang = () => document.documentElement.lang === "en" ? "en" : "ar";
  const t = (ar, en) => lang() === "en" ? en : ar;
  const panel = () => $("#pn");
  const safe = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
  function read() {
    try {
      const v = JSON.parse(localStorage.getItem(STORE) || "{}");
      state.events = Array.isArray(v.events) ? v.events.slice(-MAX_EVENTS) : [];
      state.visited = Array.isArray(v.visited) ? [...new Set(v.visited)] : [];
    } catch (_) { state.events = []; state.visited = []; }
  }
  function write() {
    try { localStorage.setItem(STORE, JSON.stringify({version:1,events:state.events.slice(-MAX_EVENTS),visited:state.visited})); }
    catch (_) { toast(t("تعذّر حفظ سجل الرحلة على هذا الجهاز.","Could not save the journey log on this device.")); }
  }
  function toast(message) {
    if (typeof window.toast === "function") window.toast(message);
    else { const n=$("#tt"); if(n){n.textContent=message;n.classList.add("on");setTimeout(()=>n.classList.remove("on"),2200);} }
  }
  function sceneTitle(id) {
    try {
      if (typeof S !== "undefined" && S[id]) return S[id][0] || (typeof chapterLabel === "function" ? chapterLabel(id) : id);
    } catch (_) {}
    return id || "—";
  }
  function closePanel() {
    const p=panel(); if(p) p.classList.remove("on");
  }
  function show(html) {
    const p=panel(); if(!p)return;
    p.innerHTML='<div class="alnajat-dc-panel">'+html+'</div>';
    p.classList.add("on");
    const first=$("button",p); if(first) first.focus();
  }
  function closeHtml() {
    return '<button class="btn pri" type="button" onclick="document.getElementById(\'pn\').classList.remove(\'on\')">'+t("إغلاق","Close")+'</button>';
  }
  function card(title, desc, icon, action) {
    return '<button class="alnajat-dc-card" type="button" onclick="'+action+'"><span class="dc-icon">'+icon+'</span><span><b>'+title+'</b><small>'+desc+'</small></span><span class="dc-arrow">‹</span></button>';
  }

  const style=document.createElement("style");
  style.id="alnajat-directors-cut-style";
  style.textContent=[
    ".alnajat-dc-panel{color:var(--fg);font:inherit;line-height:1.75}",
    ".alnajat-dc-panel h3{margin:2px 0 8px;font-size:1.2rem}",
    ".alnajat-dc-panel .dc-lead{color:var(--mut);font-size:var(--fs-small);margin:0 0 14px}",
    ".alnajat-dc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0}",
    ".alnajat-dc-metric{border:1px solid var(--bd);background:var(--card);border-radius:12px;padding:12px;min-width:0}",
    ".alnajat-dc-metric strong{display:block;font-size:1.35rem;color:var(--ac);font-variant-numeric:tabular-nums}",
    ".alnajat-dc-metric small{display:block;color:var(--mut);font-size:11px}",
    ".alnajat-dc-card{width:100%;display:flex;align-items:center;gap:10px;text-align:start;padding:12px;border:1px solid var(--bd);border-radius:12px;background:var(--card);color:var(--fg);font:inherit;margin:8px 0;min-height:62px;cursor:pointer}",
    ".alnajat-dc-card .dc-icon{font-size:24px;flex:0 0 30px;text-align:center}",
    ".alnajat-dc-card b{display:block;font-size:14px}.alnajat-dc-card small{display:block;color:var(--mut);font-size:11px;line-height:1.5}",
    ".alnajat-dc-card .dc-arrow{margin-inline-start:auto;color:var(--ac);font-size:24px}",
    ".alnajat-dc-row{padding:11px 2px;border-bottom:1px solid var(--bd);font-size:13px;line-height:1.75}",
    ".alnajat-dc-row small{display:block;color:var(--mut);font-size:11px}",
    ".alnajat-dc-row .dc-tag{display:inline-block;border:1px solid var(--bd);border-radius:20px;padding:1px 8px;font-size:10px;color:var(--mut);margin-inline-start:5px}",
    ".alnajat-dc-progress{height:7px;background:var(--bd);border-radius:9px;overflow:hidden;margin:6px 0 2px}.alnajat-dc-progress i{display:block;height:100%;background:linear-gradient(90deg,var(--ac),#d7ad5a);border-radius:9px}",
    ".alnajat-dc-ending{display:flex;align-items:center;gap:10px;border:1px solid var(--bd);border-radius:12px;padding:10px;margin:7px 0;background:var(--card)}.alnajat-dc-ending .ei{font-size:25px}.alnajat-dc-ending b{display:block}.alnajat-dc-ending small{color:var(--mut)}",
    "#alnajat-dc-network{position:fixed;z-index:99960;inset-block-start:calc(7px + env(safe-area-inset-top,0px));inset-inline-start:50%;transform:translateX(-50%);padding:5px 11px;border-radius:30px;background:#176b48;color:#fff;font:600 11px system-ui;opacity:0;pointer-events:none;transition:opacity .2s}",
    "#alnajat-dc-network.off{opacity:1;background:#8d3030}",
    "#alnajat-dc-install{display:block;width:100%;border:1px solid #c8a75f;border-radius:11px;background:#211d18;color:#f3dfad;padding:11px;margin:9px 0;font:600 13px system-ui;cursor:pointer}",
    ".alnajat-dc-note{border-inline-start:3px solid var(--ac);padding:8px 11px;background:var(--card);border-radius:7px;color:var(--mut);font-size:12px;margin:10px 0}",
    ".alnajat-dc-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.alnajat-dc-actions .btn{flex:1;min-width:120px}",
    "@media(max-width:350px){.alnajat-dc-grid{grid-template-columns:1fr}}",
    "@media print{#mb,#ptc,#tt,#cb,#alnajat-a11y-launch,#alnajat-dc-network{display:none!important}body{background:#fff!important;color:#111!important}#pn{position:static!important;display:block!important;background:#fff!important;padding:0!important}#pn>div{max-height:none!important;overflow:visible!important;border:0!important;box-shadow:none!important;background:#fff!important;color:#111!important}}"
  ].join("");
  document.head.appendChild(style);

  const network=document.createElement("div");
  network.id="alnajat-dc-network";network.setAttribute("role","status");network.setAttribute("aria-live","polite");
  document.body.appendChild(network);
  function networkState(){
    const offline=!navigator.onLine;
    network.textContent=offline?t("أنت تلعب دون اتصال — تقدمك محفوظ محلياً","Offline mode — your progress is saved locally"):t("عاد الاتصال بالإنترنت","Connection restored");
    network.classList.toggle("off",offline);
    if(!offline){clearTimeout(networkState.timer);networkState.timer=setTimeout(()=>network.classList.remove("off"),2200);}
  }
  window.addEventListener("online",networkState);window.addEventListener("offline",networkState);networkState();

  function recordVisit(nid) {
    if(!nid)return;
    if(!state.visited.includes(nid)){state.visited.push(nid);write();}
  }
  function recordChoice(scene,choice,next) {
    state.events.push({at:Date.now(),scene,sceneTitle:sceneTitle(scene),choice:String(choice||""),next:next||"",nextTitle:sceneTitle(next)});
    if(state.events.length>MAX_EVENTS)state.events=state.events.slice(-MAX_EVENTS);
    write();
  }

  const originalChoose=window.choose;
  if(typeof originalChoose==="function"){
    window.choose=function(index){
      let from="",choice="";
      try{
        from=typeof id!=="undefined"?id:"";
        choice=typeof choiceLabel==="function"?choiceLabel(from,index):(typeof curChoices!=="undefined"&&curChoices[index]?curChoices[index][0]:"");
      }catch(_){}
      const result=originalChoose.apply(this,arguments);
      let to="";try{to=typeof id!=="undefined"?id:"";}catch(_){}
      if(from&&choice)recordChoice(from,choice,to);
      return result;
    };
  }

  const originalRender=window.renderNode;
  if(typeof originalRender==="function"){
    window.renderNode=function(nid){
      const result=originalRender.apply(this,arguments);
      recordVisit(nid);
      const app=$("#app");
      if(app){
        const story=$(".tx",app);if(story){story.setAttribute("aria-live","polite");story.setAttribute("aria-atomic","true");}
        app.querySelectorAll(".btn").forEach(b=>{if(!b.hasAttribute("aria-label"))b.setAttribute("aria-label",(b.textContent||"").trim());});
      }
      return result;
    };
  }

  function openDirector(){
    const events=state.events.length,visits=state.visited.length;
    show('<h3>✦ '+t("غرفة المخرج","Director’s Room")+'</h3><p class="dc-lead">'+t("مساحة تحفظ أثر رحلتك وتمنحك أدوات إضافية، دون تغيير مسار القصة أو نتائجها.","A companion space for your journey, with extra tools that never alter the story or its outcomes.")+'</p>'+
      '<div class="alnajat-dc-grid">'+
      '<div class="alnajat-dc-metric"><strong>'+visits+'</strong><small>'+t("محطات زرتها","Scenes visited")+'</small></div>'+
      '<div class="alnajat-dc-metric"><strong>'+events+'</strong><small>'+t("قرارات موثقة","Choices recorded")+'</small></div></div>'+
      card(t("أثر قراراتي","My decision trail"),t("شاهد تسلسل اختياراتك وما قادت إليه.","Review choices and where they led."),"📜","openAlnajatChronicle()")+
      card(t("أرشيف النهايات","Ending gallery"),t("اكتشف النهايات التي وصلت إليها.","See the endings you have unlocked."),"🏁","openAlnajatEndings()")+
      card(t("تقرير الرحلة","Journey report"),t("مؤشراتك ورفاقك ومحطاتك في ملخص واحد.","Your traits, companions and visited places."),"🧭","openAlnajatReport()")+
      card(t("بطاقة رحلتي","My journey card"),t("صمّم بطاقة فنية تلخّص أثر رحلتك واحفظها كصورة.","Create a visual keepsake of your journey and save it as an image."),"🎴","downloadAlnajatCard()")+
      card(t("نسخة احتياطية","Backup & restore"),t("احفظ تقدمك أو استعده على هذا الجهاز.","Export or restore your local progress."),"💾","openAlnajatBackup()")+
      card(t("تثبيت اللعبة","Install the game"),t("أضف النجاة إلى الشاشة الرئيسية.","Add Survival to your home screen."),"📲","installAlnajat()")+
      '<div class="alnajat-dc-note">'+t("تنبيه: السجل الجديد يبدأ من لحظة تثبيت هذه الإضافة؛ لا يمكنه استعادة قرارات لم تكن مسجلة سابقاً.","Note: the new decision trail starts now; it cannot reconstruct choices made before this add-on.")+'</div>'+closeHtml());
  }

  window.downloadAlnajatCard=function(){
    try{
      const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1600;
      const ctx=canvas.getContext("2d");if(!ctx)throw new Error("canvas");
      const en=lang()==="en";
      let unlocked=0;try{unlocked=JSON.parse(localStorage.getItem("najat_eg")||"[]").length}catch(_){}
      let scene="";try{if(typeof id!=="undefined"&&id)scene=sceneTitle(id)}catch(_){}
      const gradient=ctx.createLinearGradient(0,0,1200,1600);
      gradient.addColorStop(0,"#10151d");gradient.addColorStop(.55,"#20232b");gradient.addColorStop(1,"#3b211c");
      ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,1600);
      ctx.strokeStyle="rgba(225,177,105,.24)";ctx.lineWidth=2;
      for(let r=120;r<700;r+=90){ctx.beginPath();ctx.arc(1050,180,r,0,Math.PI*2);ctx.stroke();}
      ctx.strokeStyle="rgba(255,255,255,.12)";ctx.lineWidth=3;ctx.strokeRect(54,54,1092,1492);
      ctx.strokeStyle="#d8ad70";ctx.lineWidth=4;ctx.strokeRect(78,78,1044,1444);
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction=en?"ltr":"rtl";
      ctx.fillStyle="#e7c18a";ctx.font="600 30px system-ui,sans-serif";
      ctx.fillText(en?"A PERSONAL JOURNEY":"حكاية شخصية",600,250);
      ctx.fillStyle="#fff4e4";ctx.font="bold 112px system-ui,sans-serif";
      ctx.fillText(en?"SURVIVAL":"النجاة",600,430);
      ctx.fillStyle="#e7c18a";ctx.font="36px system-ui,sans-serif";
      ctx.fillText(en?"My choices. My journey. My trace.":"اختياراتي • رحلتي • أثري",600,535);
      if(scene){
        ctx.fillStyle="rgba(255,255,255,.72)";ctx.font="30px system-ui,sans-serif";
        ctx.fillText(en?"CURRENT CHAPTER":"محطتي الحالية",600,700);
        ctx.fillStyle="#fff4e4";ctx.font="38px system-ui,sans-serif";
        ctx.fillText(scene.length>38?scene.slice(0,37)+"…":scene,600,765);
      }
      const metrics=[[String(state.visited.length),en?"SCENES VISITED":"مشهد زرته"],[String(state.events.length),en?"CHOICES RECORDED":"قرار موثّق"],[String(unlocked),en?"ENDINGS UNLOCKED":"نهاية اكتشفتها"]];
      metrics.forEach((m,i)=>{
        const y=930+i*145;ctx.fillStyle="rgba(255,255,255,.07)";ctx.fillRect(170,y-48,860,112);
        ctx.fillStyle="#e7c18a";ctx.font="bold 48px system-ui,sans-serif";ctx.fillText(m[0],en?320:880,y+7);
        ctx.fillStyle="#fff4e4";ctx.font="30px system-ui,sans-serif";ctx.fillText(m[1],en?720:470,y+7);
      });
      ctx.fillStyle="rgba(255,255,255,.65)";ctx.font="25px system-ui,sans-serif";
      ctx.fillText(new Date().toLocaleDateString(en?"en-US":"ar"),600,1430);
      ctx.fillStyle="#e7c18a";ctx.font="24px system-ui,sans-serif";
      ctx.fillText(en?"AN INTERACTIVE STORY":"قصة تفاعلية",600,1490);
      canvas.toBlob(function(blob){
        if(!blob){toast(t("تعذّر إنشاء الصورة على هذا الجهاز.","Could not create the image on this device."));return;}
        const url=URL.createObjectURL(blob),a=document.createElement("a");
        a.href=url;a.download="alnajat-journey-card.png";document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),2000);
        toast(t("تم إنشاء بطاقة رحلتك وحفظها كصورة.","Your journey card has been created and downloaded."));
      },"image/png");
    }catch(_){toast(t("تعذّر إنشاء البطاقة في هذا المتصفح.","Card creation is not supported in this browser."));}
  };

  window.openAlnajatChronicle=function(){
    const events=state.events.slice().reverse();
    let html='<h3>📜 '+t("أثر قراراتي","My decision trail")+'</h3><p class="dc-lead">'+t("كل اختيار موثّق هنا هو جزء من نسختك الخاصة من الحكاية.","Every recorded choice is part of your personal version of the story.")+'</p>';
    if(!events.length)html+='<div class="alnajat-dc-note">'+t("لم تُسجّل قرارات بعد. ابدأ اللعب واختر طريقك، وسيظهر تاريخك هنا.","No decisions recorded yet. Play and make choices; your history will appear here.")+'</div>';
    events.forEach((e,i)=>{const date=new Date(e.at).toLocaleString(lang()==="en"?"en-US":"ar");html+='<div class="alnajat-dc-row"><b>'+(events.length-i)+'. '+safe(e.sceneTitle||sceneTitle(e.scene))+'</b><small>'+safe(date)+'</small><div>↳ '+safe(e.choice)+'</div><small>'+t("المشهد التالي: ","Next scene: ")+safe(e.nextTitle||sceneTitle(e.next))+'</small></div>';});
    if(events.length)html+='<div class="alnajat-dc-note">'+t("يعرض السجل آخر ","Showing the latest ")+events.length+t(" قراراً بحد أقصى."," recorded choices.")+'</div>';
    show(html+closeHtml());
  };

  window.openAlnajatEndings=function(){
    let unlocked=[];try{unlocked=JSON.parse(localStorage.getItem("najat_eg")||"[]");}catch(_){}
    const names=(typeof END_META!=="undefined"?END_META:{});
    let html='<h3>🏁 '+t("أرشيف النهايات","Ending gallery")+'</h3><p class="dc-lead">'+t("لكل رحلة خاتمة مختلفة. لا تُفتح النهايات إلا عندما تصل إليها في اللعب.","Every journey has its own ending. Endings unlock only when reached in play.")+'</p>';
    Object.keys(names).forEach(k=>{
      const m=names[k],yes=unlocked.includes(k);
      html+='<div class="alnajat-dc-ending"><span class="ei">'+(yes?safe(m.icon):"🔒")+'</span><span><b>'+(yes?safe(lang()==="en"?m.en:m.ar):t("نهاية لم تُكتشف بعد","Undiscovered ending"))+'</b><small>'+(yes?t("تم الوصول إليها","Unlocked"):t("واصل اللعب لاكتشافها","Keep playing to discover it"))+'</small></span></div>';
    });
    html+='<div class="alnajat-dc-metric"><strong>'+unlocked.length+' / '+Object.keys(names).length+'</strong><small>'+t("نهايات مكتشفة","Endings discovered")+'</small><div class="alnajat-dc-progress"><i style="width:'+(Object.keys(names).length?Math.min(100,unlocked.length/Object.keys(names).length*100):0)+'%"></i></div></div>';
    show(html+closeHtml());
  };

  window.openAlnajatReport=function(){
    const current=(typeof s!=="undefined"&&s)?s:null;
    const keys=["h","f","p","e","c","m"];
    const labels={h:["الصحة","Health"],f:["الشبع","Food"],p:["الأمل","Hope"],e:["الطاقة","Energy"],c:["الضمير","Conscience"],m:["المال","Money"]};
    let html='<h3>🧭 '+t("تقرير الرحلة","Journey report")+'</h3><p class="dc-lead">'+t("ملخص شخصي لحالتك الحالية ومحطاتك ورفاقك. لا يؤثر في آلية اللعب.","A personal snapshot of your current state, visits and companions. It does not affect gameplay.")+'</p>';
    if(current){
      html+='<div class="alnajat-dc-grid">';
      keys.forEach(k=>{const value=Number(current[k]||0);html+='<div class="alnajat-dc-metric"><strong>'+value+(k==="m"?"":"%")+'</strong><small>'+(lang()==="en"?labels[k][1]:labels[k][0])+'</small>'+(k!=="m"?'<div class="alnajat-dc-progress"><i style="width:'+Math.max(0,Math.min(100,value))+'%"></i></div>':"")+'</div>';});
      html+='</div>';
      const companions=typeof companionsOf==="function"?companionsOf():[];
      html+='<h4>'+t("رفاق الرحلة","Journey companions")+'</h4>';
      html+=companions.length?companions.map(k=>'<div class="alnajat-dc-row">'+safe(COMP[k].icon)+' '+safe(lang()==="en"?COMP[k].en:COMP[k].ar)+' <small>'+safe(lang()==="en"?COMP[k].enRole:COMP[k].arRole)+'</small></div>').join(""):'<p class="dc-lead">'+t("لم تلتقِ برفاق بعد.","No companions met yet.")+'</p>';
    }else html+='<div class="alnajat-dc-note">'+t("ابدأ رحلة أو تابع حفظاً لعرض تقرير حالتك.","Start or continue a journey to see your status report.")+'</div>';
    html+='<h4>'+t("محطات زرتها","Visited scenes")+'</h4><p class="dc-lead">'+state.visited.length+' / '+(typeof S!=="undefined"?Object.keys(S).length:0)+'</p>';
    show(html+closeHtml());
  };

  function download(name,data,type){
    const blob=new Blob([data],{type:type||"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  window.exportAlnajatData=function(){
    const data={app:"ALNAJAT",format:1,exportedAt:new Date().toISOString(),storage:{}};
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&(k.startsWith("najat_")||k.startsWith("alnajat_")))data.storage[k]=localStorage.getItem(k);
    }
    download("alnajat-backup-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(data,null,2));
    toast(t("تم تجهيز النسخة الاحتياطية","Backup file prepared"));
  };
  window.openAlnajatBackup=function(){
    show('<h3>💾 '+t("النسخ الاحتياطي","Backup & restore")+'</h3><p class="dc-lead">'+t("تُحفظ اللعبة محلياً في متصفحك. صدّر نسخة احتياطية قبل تغيير الجهاز أو مسح بيانات المتصفح.","Your game is stored locally in this browser. Export a backup before changing devices or clearing browser data.")+'</p>'+
      '<button class="btn pri" type="button" onclick="exportAlnajatData()">⬇️ '+t("تنزيل نسخة احتياطية","Download backup")+'</button>'+
      '<label class="alnajat-dc-note" style="display:block"> '+t("استعادة نسخة JSON سابقة","Restore a previous JSON backup")+'<input id="alnajat-dc-import" type="file" accept=".json,application/json" style="display:block;margin-top:9px;max-width:100%"></label>'+
      '<div class="alnajat-dc-note">'+t("الاستعادة تستبدل مفاتيح تقدم النجاة الموجودة على هذا المتصفح بالمفاتيح الموجودة في النسخة. احتفظ بنسخة حديثة أولاً.","Restore replaces matching Survival progress keys on this browser. Keep a fresh backup first.")+'</div>'+closeHtml());
    const input=$("#alnajat-dc-import");
    if(input)input.addEventListener("change",async function(){
      const file=input.files&&input.files[0];if(!file)return;
      try{
        const parsed=JSON.parse(await file.text());
        if(parsed.app!=="ALNAJAT"||parsed.format!==1||!parsed.storage||typeof parsed.storage!=="object")throw new Error("format");
        const entries=Object.entries(parsed.storage);
        if(!entries.length||entries.some(([k,v])=>(!k.startsWith("najat_")&&!k.startsWith("alnajat_"))||typeof v!=="string"))throw new Error("keys");
        if(!confirm(t("سيتم استبدال بيانات تقدم اللعبة المطابقة على هذا الجهاز. هل تريد المتابعة؟","Matching game progress on this device will be replaced. Continue?")))return;
        entries.forEach(([k,v])=>localStorage.setItem(k,v));
        toast(t("اكتملت الاستعادة. ستُعاد الصفحة الآن.","Restore complete. Reloading now."));
        setTimeout(()=>location.reload(),650);
      }catch(_){toast(t("الملف غير صالح أو غير متوافق.","Invalid or incompatible backup file."));}
    });
  };

  window.installAlnajat=async function(){
    if(state.installPrompt){
      state.installPrompt.prompt();
      try{await state.installPrompt.userChoice;}catch(_){}
      state.installPrompt=null;return;
    }
    show('<h3>📲 '+t("تثبيت النجاة","Install Survival")+'</h3><p>'+t("على iPhone: افتح الموقع في Safari، اضغط زر المشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية». على Android: افتح قائمة المتصفح واختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» إذا ظهر الخيار.","On iPhone: open this site in Safari, tap Share, then Add to Home Screen. On Android: open the browser menu and choose Install app or Add to Home screen when available.")+'</p>'+closeHtml());
  };
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.installPrompt=e;});

  function addMenuTools(){
    const app=$("#app");if(!app||$("#alnajat-dc-menu",app))return;
    const box=document.createElement("section");box.id="alnajat-dc-menu";
    box.innerHTML='<div class="alnajat-dc-note">'+t("عِش الحكاية بطريقتك، واحتفظ بأثر كل قرار.","Live the story your way, and keep the trace of every choice.")+'</div>'+
      '<button class="btn" type="button" onclick="openAlnajatDirector()">✦ '+t("غرفة المخرج","Director’s Room")+'</button>'+
      '<button id="alnajat-dc-install" type="button" onclick="installAlnajat()">📲 '+t("تثبيت اللعبة على جهازي","Install on this device")+'</button>';
    const about=Array.from(app.querySelectorAll("button")).find(b=>/عن اللعبة|About/.test(b.textContent||""));
    if(about)about.insertAdjacentElement("afterend",box);else app.appendChild(box);
  }
  window.openAlnajatDirector=openDirector;

  const originalMenu=window.showMenu;
  if(typeof originalMenu==="function")window.showMenu=function(){const r=originalMenu.apply(this,arguments);addMenuTools();return r;};

  const originalTop=window.topBar;
  if(typeof originalTop==="function")window.topBar=function(){
    let html=originalTop.apply(this,arguments)||"";
    const additions='<button type="button" onclick="openAlnajatDirector()" aria-label="Director room">✦ '+t("رحلتي","My journey")+'</button>';
    return html.replace("</div>",additions+"</div>");
  };

  read();
  // Record the current scene on a reload/continue without duplicating old visits.
  try{if(typeof id!=="undefined"&&id)recordVisit(id);}catch(_){}
  console.info("ALNAJAT Director's Cut loaded");
})();