/* ALNAJAT privacy-first, opt-in analytics. No story text or selected answer is collected. */
(function () {
  "use strict";
  const CONSENT_KEY = "alnajat_analytics_consent_v1";
  const PLAYER_KEY = "alnajat_anon_player_v1";
  const SESSION_KEY = "alnajat_anon_session_v1";
  const cfg = window.ALNAJAT_ANALYTICS_CONFIG || {};
  const firebaseCfg = window.ALNAJAT_FIREBASE_CONFIG || {};
  const configured = !!(cfg.enabled && firebaseCfg.apiKey &&
    !String(firebaseCfg.apiKey).startsWith("REPLACE_") &&
    firebaseCfg.projectId && !String(firebaseCfg.projectId).startsWith("REPLACE_"));
  const makeId = () => {
    try { return crypto.randomUUID(); }
    catch (_) { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c==="x"?r:(r&3|8)).toString(16); }); }
  };
  const getId = (key) => {
    try { let v=localStorage.getItem(key); if(!v){v=makeId();localStorage.setItem(key,v);} return v; }
    catch (_) { return makeId(); }
  };
  const playerId=getId(PLAYER_KEY), sessionId=getId(SESSION_KEY);
  const startedAt=Date.now();
  let db=null, initialized=false, completed=false;
  function consent(){ try{return localStorage.getItem(CONSENT_KEY)||"unset";}catch(_){return "unset";} }
  function firebaseReady(){
    if(initialized)return !!db;
    initialized=true;
    if(!configured || !window.firebase || !firebaseCfg.projectId)return false;
    try{
      if(!firebase.apps.length)firebase.initializeApp(firebaseCfg);
      db=firebase.firestore();
      return true;
    }catch(e){console.warn("ALNAJAT analytics unavailable",e);return false;}
  }
  function log(eventType, extra){
    if(consent()!=="accepted" || !firebaseReady())return;
    const payload={
      eventType,
      playerId,
      sessionId,
      language: document.documentElement.lang==="en"?"en":"ar",
      sceneId: extra && typeof extra.sceneId==="string" ? extra.sceneId.slice(0,32) : "",
      appVersion: String(cfg.appVersion||"1").slice(0,24),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    db.collection(cfg.collection||"analyticsEvents").add(payload).catch(e=>console.warn("ALNAJAT event not sent",e));
  }
  function setConsent(value){
    try{localStorage.setItem(CONSENT_KEY,value);}catch(_){}
    const banner=document.getElementById("alnajat-consent");
    if(banner)banner.remove();
    if(value==="accepted") log("session_start",{});
  }
  function showConsent(){
    if(consent()!=="unset" || document.getElementById("alnajat-consent"))return;
    const el=document.createElement("section");
    el.id="alnajat-consent";
    el.setAttribute("role","dialog");el.setAttribute("aria-live","polite");
    el.innerHTML='<div class="an-consent-card"><strong>خصوصيتك مهمة — Your privacy matters</strong><p>بموافقتك فقط، نرسل إحصاءات استخدام مجهولة مثل المشاهد التي فُتحت واللغة. لا نجمع الاسم أو الهاتف أو نص الاختيارات أو المذكرات أو الموقع الدقيق. يمكنك الرفض ومواصلة اللعب.</p><div class="an-consent-actions"><button type="button" id="an-yes">أوافق على الإحصاءات</button><button type="button" id="an-no">لا أوافق</button><a href="privacy.html">سياسة الخصوصية</a></div></div>';
    document.body.appendChild(el);
    document.getElementById("an-yes").addEventListener("click",()=>setConsent("accepted"));
    document.getElementById("an-no").addEventListener("click",()=>setConsent("declined"));
  }
  function settings(){
    const current=consent();
    const accepted=current==="accepted";
    const msg=accepted?"إيقاف مشاركة إحصاءات الاستخدام؟":"السماح بإحصاءات استخدام مجهولة؟";
    if(!window.confirm(msg))return;
    setConsent(accepted?"declined":"accepted");
    if(accepted) { try{localStorage.removeItem(SESSION_KEY);}catch(_){} }
  }
  function attach(){
    const style=document.createElement("style");
    style.textContent='#alnajat-consent{position:fixed;z-index:99999;inset:auto 12px 12px;display:flex;justify-content:center;font:14px/1.7 system-ui,sans-serif;color:#241d16}.an-consent-card{max-width:620px;width:100%;background:#fffaf2;border:1px solid #b5541c;border-radius:14px;padding:14px;box-shadow:0 8px 32px #0004}.an-consent-card p{margin:7px 0 12px}.an-consent-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.an-consent-actions button{border:1px solid #b5541c;border-radius:8px;padding:9px 12px;background:#b5541c;color:white;font:inherit}.an-consent-actions button+button{background:transparent;color:#241d16}.an-consent-actions a{color:#8d3f14}#an-privacy-settings{position:fixed;z-index:9998;bottom:8px;left:8px;border:1px solid #b5541c;border-radius:20px;background:#fffaf2;color:#241d16;padding:6px 10px;font:12px system-ui;opacity:.8}';
    document.head.appendChild(style);
    const b=document.createElement("button");b.id="an-privacy-settings";b.type="button";b.textContent="الخصوصية";
    b.addEventListener("click",settings);document.body.appendChild(b);
    showConsent();
    if(consent()==="accepted")log("session_start",{});
    const originalRender=window.renderNode;
    if(typeof originalRender==="function"&&!originalRender.__anWrapped){
      const wrapped=function(nid){const result=originalRender.apply(this,arguments);log("scene_view",{sceneId:String(nid||"")});return result;};
      wrapped.__anWrapped=true;window.renderNode=wrapped;
    }
    const originalChoose=window.choose;
    if(typeof originalChoose==="function"&&!originalChoose.__anWrapped){
      const wrapped=function(){log("choice_made",{sceneId:String(window.id||"")});return originalChoose.apply(this,arguments);};
      wrapped.__anWrapped=true;window.choose=wrapped;
    }
    const originalEnding=window.renderEnding;
    if(typeof originalEnding==="function"&&!originalEnding.__anWrapped){
      const wrapped=function(){if(!completed){completed=true;log("game_completed",{sceneId:"ending"});}return originalEnding.apply(this,arguments);};
      wrapped.__anWrapped=true;window.renderEnding=wrapped;
    }
    const originalDeath=window.renderDeath;
    if(typeof originalDeath==="function"&&!originalDeath.__anWrapped){
      const wrapped=function(){log("run_ended",{sceneId:"death"});return originalDeath.apply(this,arguments);};
      wrapped.__anWrapped=true;window.renderDeath=wrapped;
    }
  }
  window.ALNAJATAnalytics={setConsent,settings,log,status:()=>({configured,consent:consent()})};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach,{once:true});else attach();
})();
