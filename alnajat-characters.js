/* ALNAJAT CHARACTER ATLAS — additive companion profiles; story logic untouched. */
(function () {
  "use strict";
  if (window.__ALNAJAT_CHARACTERS__) return;
  window.__ALNAJAT_CHARACTERS__ = true;

  const style = document.createElement("style");
  style.textContent = [
    "#alnajat-characters-launch{display:inline-block;margin:6px 4px;padding:10px 14px;border:1px solid #c6a86a88;border-radius:11px;background:linear-gradient(135deg,#29221b,#171923);color:#f3dfad;font:600 13px system-ui;cursor:pointer}",
    "#alnajat-character-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}",
    ".alnajat-character{display:flex;align-items:center;gap:9px;text-align:start;padding:11px;border:1px solid var(--bd,#d9cdbb);border-radius:12px;background:var(--card,#fff);color:var(--fg,#2a2118);font:inherit;min-height:68px;cursor:pointer}",
    ".alnajat-character.locked{opacity:.56;cursor:default}",
    ".alnajat-character .ac-icon{font-size:25px;flex:0 0 30px;text-align:center}",
    ".alnajat-character strong{display:block;font-size:13px}.alnajat-character small{display:block;font-size:11px;color:var(--mut,#7a6a58);margin-top:3px}",
    ".alnajat-profile{padding:13px;border:1px solid var(--bd,#d9cdbb);border-radius:13px;background:var(--card,#fff);margin:10px 0;line-height:1.8}",
    ".alnajat-profile .hero{font-size:36px}.alnajat-profile h4{margin:5px 0;font-size:18px}.alnajat-profile p{margin:8px 0;font-size:13px;line-height:1.9}",
    ".alnajat-profile .quote{border-inline-start:3px solid var(--ac,#b5541c);padding:8px 12px;margin:10px 0;color:var(--mut,#7a6a58);font-size:13px}",
    "@media(max-width:360px){#alnajat-character-grid{grid-template-columns:1fr}}"
  ].join("");
  document.head.appendChild(style);

  const labels = {
    h:{ar:"الصحة",en:"Health"}, f:{ar:"الغذاء",en:"Food"},
    p:{ar:"الثقة",en:"Trust"}, m:{ar:"المال",en:"Money"}, c:{ar:"الطاقة",en:"Energy"}
  };
  function isEn(){return document.documentElement.lang==="en";}
  function tr(ar,en){return isEn()?en:ar;}
  function el(tag, cls, txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
  function panel(){return document.getElementById("pn");}
  function closeButton(){const b=el("button","btn pri",tr("إغلاق","Close"));b.addEventListener("click",()=>panel().classList.remove("on"));return b;}
  function openAtlas(){
    if(typeof COMP==="undefined"||typeof companionsOf!=="function"){return;}
    const p=panel();if(!p)return;
    const owned=companionsOf();
    const wrap=el("div");
    wrap.appendChild(el("h3","",tr("👥 أطلس الشخصيات والرفاق","👥 Character & Companion Atlas")));
    wrap.appendChild(el("p","mut",tr("تعرّف إلى الشخصيات التي التقيت بها في رحلتك. تظل بقية البطاقات ظاهرة كأسماء لم تلتقِ بها بعد.","Meet the people who have crossed your path. Others remain hidden until your journey brings you together.")));
    const grid=el("div","alnajat-character-grid");
    Object.keys(COMP).forEach(k=>{
      const c=COMP[k],unlocked=owned.includes(k);
      const b=el("button","alnajat-character"+(unlocked?"":" locked"));
      b.type="button";b.disabled=!unlocked;
      b.appendChild(el("span","ac-icon",unlocked?c.icon:"🔒"));
      const meta=el("span");
      meta.appendChild(el("strong","",unlocked?(isEn()?c.en:c.ar):tr("لم تلتقِ به بعد","Not met yet")));
      meta.appendChild(el("small","",unlocked?(isEn()?c.enRole:c.arRole):tr("اكتشف الشخصية خلال اللعب","Discover this person in the story")));
      b.appendChild(meta);
      if(unlocked)b.addEventListener("click",()=>openProfile(k));
      grid.appendChild(b);
    });
    wrap.appendChild(grid);
    wrap.appendChild(el("p","mut",tr("الشخصيات والروابط تُعرض وفق بيانات اللعبة الحالية؛ لا تُضاف أحداث جديدة إلى القصة.","Profiles reflect existing game data; no new story events are added.")));
    wrap.appendChild(closeButton());
    p.replaceChildren(wrap);p.classList.add("on");
  }
  function openProfile(k){
    const c=COMP[k],p=panel();if(!c||!p)return;
    const wrap=el("div");
    const back=el("button","btn",tr("← العودة إلى الأطلس","← Back to atlas"));
    back.addEventListener("click",openAtlas);wrap.appendChild(back);
    const card=el("section","alnajat-profile");
    card.appendChild(el("div","hero",c.icon));
    card.appendChild(el("h4","",isEn()?c.en:c.ar));
    card.appendChild(el("div","mut",isEn()?c.enRole:c.arRole));
    const beats=(typeof COMPANION_BEATS!=="undefined"&&COMPANION_BEATS[k])?COMPANION_BEATS[k]:{};
    const beatKeys=Object.keys(beats);
    if(beatKeys.length){
      beatKeys.forEach(key=>{const beat=beats[key];if(beat&&beat[isEn()?"en":"ar"])card.appendChild(el("p","quote","“"+beat[isEn()?"en":"ar"]+"”"));});
    }else{
      card.appendChild(el("p","",tr("لك حضور في هذه الرحلة من خلال دورك ومساعدتك في محطات محددة.","Your role and support shape specific moments along this journey.")));
    }
    const gains=Object.keys(c.buff||{}).filter(x=>c.buff[x]);
    if(gains.length){
      card.appendChild(el("h4","",tr("أثر الرفيق","Companion contribution")));
      const list=el("p");
      list.textContent=gains.map(x=>(isEn()?labels[x].en:labels[x].ar)+" +"+c.buff[x]).join(" · ");
      card.appendChild(list);
    }
    wrap.appendChild(card);wrap.appendChild(closeButton());
    p.replaceChildren(wrap);p.classList.add("on");
  }
  function addMenuButton(){
    const app=document.getElementById("app");if(!app||app.querySelector("#alnajat-characters-launch"))return;
    const b=el("button","btn","👥 "+tr("أطلس الشخصيات","Character atlas"));
    b.id="alnajat-characters-launch";b.addEventListener("click",openAtlas);
    const settings=Array.from(app.querySelectorAll("button")).find(x=>/الإعدادات|Settings/.test(x.textContent||""));
    if(settings)settings.insertAdjacentElement("afterend",b);else app.appendChild(b);
  }
  function addGameButton(){
    const bar=document.querySelector("#app .bt");if(!bar||bar.querySelector("#alnajat-characters-launch"))return;
    const b=el("button","", "👥 "+tr("الرفاق","Companions"));
    b.id="alnajat-characters-launch";b.addEventListener("click",openAtlas);bar.appendChild(b);
  }
  const oldMenu=window.showMenu;
  if(typeof oldMenu==="function")window.showMenu=function(){const r=oldMenu.apply(this,arguments);addMenuButton();return r;};
  const oldRender=window.renderNode;
  if(typeof oldRender==="function")window.renderNode=function(){const r=oldRender.apply(this,arguments);addGameButton();return r;};
  if(document.getElementById("app")){if(document.querySelector("#app .bt"))addGameButton();else addMenuButton();}
  console.info("ALNAJAT character atlas loaded");
})();
