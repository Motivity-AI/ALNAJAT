/* ALNAJAT MEMORY BOOK — personal bookmarks and reflections.
   Additive only: stores player-authored notes locally; never changes story logic. */
(function () {
  "use strict";
  if (window.__ALNAJAT_MEMORY_BOOK__) return;
  window.__ALNAJAT_MEMORY_BOOK__ = true;

  const KEY = "alnajat_memory_book_v1";
  const MAX_ITEMS = 200;
  const $ = (s, root) => (root || document).querySelector(s);
  const isEn = () => {
    try { return document.documentElement.lang === "en" || localStorage.getItem("najat_lang") === "en" || (typeof LG !== "undefined" && LG === "en"); }
    catch (_) { return document.documentElement.lang === "en"; }
  };
  const tr = (ar, en) => isEn() ? en : ar;
  const clean = (v, max) => String(v == null ? "" : v).slice(0, max || 1200);
  const escapeHTML = (v) => clean(v, 5000).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  const panel = () => $("#pn");
  let items = [];

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      items = Array.isArray(value) ? value.filter(x => x && typeof x === "object" && typeof x.sceneId === "string").slice(-MAX_ITEMS) : [];
    } catch (_) { items = []; }
  }
  function write() {
    try { localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX_ITEMS))); return true; }
    catch (_) { notify(tr("تعذّر حفظ دفتر الذكريات. قد تكون مساحة التخزين ممتلئة.","Could not save the memory book. Device storage may be full.")); return false; }
  }
  function notify(message) {
    if (typeof window.toast === "function") window.toast(message);
    else { const n=$("#tt"); if(n){n.textContent=message;n.classList.add("on");setTimeout(()=>n.classList.remove("on"),2200);} }
  }
  function currentMoment() {
    let sceneId = "";
    try { if (typeof id !== "undefined" && id != null) sceneId = String(id); } catch (_) {}
    const titleNode = $("#app .ch"), textNode = $("#app .tx");
    if (!sceneId || !textNode) {
      notify(tr("افتح مشهداً من رحلتك أولاً لحفظه.","Open a story scene first to save it."));
      return null;
    }
    return {
      sceneId,
      title: clean(titleNode ? titleNode.textContent.trim() : sceneId, 180),
      excerpt: clean(textNode.innerText || textNode.textContent || "", 900).trim(),
      language: isEn() ? "en" : "ar",
      savedAt: new Date().toISOString(),
      note: ""
    };
  }
  function close() { const p=panel(); if(p)p.classList.remove("on"); }
  function make(tag, cls, value) {
    const n=document.createElement(tag);
    if(cls)n.className=cls;
    if(value!==undefined)n.textContent=value;
    return n;
  }
  function button(label, cls, fn) {
    const b=make("button",cls || "btn",label); b.type="button"; b.addEventListener("click",fn); return b;
  }
  function openBook() {
    read();
    const p=panel(); if(!p)return;
    const wrap=make("div","alnajat-book");
    const heading=make("h3","",tr("📖 دفتر الذكريات","📖 Memory Book"));
    const intro=make("p","mut",tr("احفظ اللحظات التي تعني لك شيئاً، وأضف تأملك الشخصي. هذا الدفتر خاص بهذا المتصفح ولا يغيّر أحداث القصة.","Keep the moments that matter and add your own reflections. This book stays in this browser and never changes the story."));
    const search=make("input","alnajat-book-search");
    search.type="search"; search.placeholder=tr("ابحث في العناوين والذكريات والملاحظات…","Search titles, memories and notes…");
    search.setAttribute("aria-label",search.placeholder);
    const count=make("div","alnajat-book-count");
    const list=make("div","alnajat-book-list");
    function renderList() {
      const q=search.value.trim().toLocaleLowerCase();
      const filtered=items.filter(x=>(x.title+" "+x.excerpt+" "+(x.note||"")).toLocaleLowerCase().includes(q));
      count.textContent=tr("المحفوظ: "+items.length+" من "+MAX_ITEMS,"Saved: "+items.length+" of "+MAX_ITEMS);
      list.replaceChildren();
      if(!filtered.length){list.appendChild(make("p","mut",tr("لا توجد ذكريات مطابقة بعد. احفظ مشهداً من زر «احفظ هذه اللحظة».","No matching memories yet. Save a scene using “Save this moment.”")));return;}
      filtered.slice().reverse().forEach(item=>{
        const card=make("article","alnajat-book-card");
        const meta=make("div","alnajat-book-meta",new Date(item.savedAt).toLocaleString(item.language==="en"?"en":"ar"));
        const title=make("h4","",item.title || item.sceneId);
        const excerpt=make("p","alnajat-book-excerpt",item.excerpt || "");
        const note=make("textarea","alnajat-book-note");
        note.rows=3;note.maxLength=1200;note.placeholder=tr("اكتب تأملك أو ملاحظتك الخاصة…","Write your personal reflection or note…");note.value=item.note||"";
        note.addEventListener("change",()=>{item.note=clean(note.value,1200);write();notify(tr("حُفظ تأملك.","Your reflection was saved."));});
        const actions=make("div","alnajat-book-actions");
        const copy=button(tr("نسخ الذكرى","Copy memory"),"btn",()=>{const txt=[item.title,item.excerpt,item.note].filter(Boolean).join("\n\n");if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>notify(tr("تم النسخ.","Copied."))).catch(()=>notify(tr("تعذّر النسخ من المتصفح.","Clipboard unavailable.")));else notify(tr("النسخ غير مدعوم في هذا المتصفح.","Copy is not supported in this browser."));});
        const remove=button(tr("حذف","Delete"),"btn",()=>{if(!confirm(tr("حذف هذه الذكرى من هذا الجهاز؟","Delete this memory from this device?")))return;items=items.filter(x=>x!==item);write();renderList();});
        actions.append(copy,remove);card.append(meta,title,excerpt,note,actions);list.appendChild(card);
      });
    }
    const current=button("✦ "+tr("احفظ هذه اللحظة","Save this moment"),"btn pri",()=>{
      const moment=currentMoment();if(!moment)return;
      if(items.length>=MAX_ITEMS){notify(tr("وصل دفتر الذكريات إلى الحد الأقصى. احذف بعض الذكريات أولاً.","The memory book is full. Delete some memories first."));return;}
      items.push(moment);if(write()){notify(tr("أُضيفت اللحظة إلى دفتر ذكرياتك.","Moment added to your memory book."));renderList();}
    });
    const exportBtn=button("⬇ "+tr("تصدير الدفتر","Export book"),"btn",exportBook);
    const closeBtn=button(tr("إغلاق","Close"),"btn",close);
    wrap.append(heading,intro,current,search,count,list,exportBtn,closeBtn);
    p.replaceChildren(wrap);p.classList.add("on");
    search.addEventListener("input",renderList);
    renderList();
    current.focus();
  }
  function exportBook() {
    read();
    if(!items.length){notify(tr("دفتر الذكريات فارغ.","Your memory book is empty."));return;}
    const en=isEn();
    const lines=[en?"# Survival — My Memory Book":"# النجاة — دفتر ذكرياتي","",en?"Personal bookmarks and reflections":"لحظات محفوظة وتأملات شخصية",""];
    items.forEach((x,i)=>{
      lines.push("## "+(i+1)+". "+(x.title||x.sceneId),"",x.excerpt||"", "");
      if(x.note)lines.push(en?"**My reflection**":"**تأملي الشخصي**","",x.note,"");
      lines.push(en?"Saved: ":"تاريخ الحفظ: ",new Date(x.savedAt).toLocaleString(x.language==="en"?"en":"ar"),"","---","");
    });
    const blob=new Blob(["\uFEFF"+lines.join("\n")],{type:"text/markdown;charset=utf-8"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="alnajat-memory-book-"+new Date().toISOString().slice(0,10)+".md";
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify(tr("تم تصدير دفتر الذكريات.","Memory book exported."));
  }

  const style=document.createElement("style");
  style.textContent=[
    ".alnajat-book{color:var(--fg);font:inherit;line-height:1.75}",
    ".alnajat-book h3{margin:0 0 6px;font-size:1.2rem}",
    ".alnajat-book-search{display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:12px;border:1px solid var(--bd);border-radius:10px;background:var(--card);color:var(--fg);font:inherit;min-height:44px}",
    ".alnajat-book-count,.alnajat-book-meta{font-size:11px;color:var(--mut);margin:8px 0}",
    ".alnajat-book-card{padding:12px;margin:9px 0;border:1px solid var(--bd);border-radius:12px;background:var(--card)}",
    ".alnajat-book-card h4{font-size:14px;margin:4px 0}.alnajat-book-excerpt{font-size:13px;line-height:1.9;white-space:pre-wrap;margin:8px 0}",
    ".alnajat-book-note{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--bd);border-radius:9px;background:var(--bg);color:var(--fg);font:inherit;resize:vertical}",
    ".alnajat-book-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.alnajat-book-actions .btn{width:auto;flex:1;margin:0;min-height:40px}",
    ".alnajat-book>button{margin:7px 0}",
    "@media(prefers-reduced-motion:reduce){.alnajat-book *{scroll-behavior:auto!important}}"
  ].join("");
  document.head.appendChild(style);

  const originalTop=window.topBar;
  if(typeof originalTop==="function")window.topBar=function(){
    const html=originalTop.apply(this,arguments)||"";
    const label=tr("📖 دفتر الذكريات","📖 Memory book");
    return html.replace("</div>",'<button type="button" onclick="window.openAlnajatMemoryBook()">'+label+'</button></div>');
  };
  const originalMenu=window.showMenu;
  if(typeof originalMenu==="function")window.showMenu=function(){
    const result=originalMenu.apply(this,arguments);
    const app=$("#app");
    if(app&&!$("#alnajat-memory-menu",app)){
      const b=make("button","btn","📖 "+tr("دفتر الذكريات","Memory book"));
      b.id="alnajat-memory-menu";b.addEventListener("click",openBook);
      const settings=Array.from(app.querySelectorAll("button")).find(x=>/الإعدادات|Settings/.test(x.textContent||""));
      if(settings)settings.insertAdjacentElement("afterend",b);else app.appendChild(b);
    }
    return result;
  };
  window.openAlnajatMemoryBook=openBook;
  read();
  console.info("ALNAJAT Memory Book loaded");
})();