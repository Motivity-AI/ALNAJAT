/* ALNAJAT — لغز الرسالة الناقصة / THE MISSING MESSAGE
   Optional fictional puzzle quest. Independent local save; no analytics or player tracking.
   Does not alter the canonical story, Next Chapter, endings, or legacy saves. */
(function () {
  "use strict";
  if (window.__ALNAJAT_MESSAGE_QUEST__) return;
  window.__ALNAJAT_MESSAGE_QUEST__ = true;

  const KEY = "alnajat_message_quest_v1";
  const ARCHIVE_KEY = "alnajat_message_quest_archive_v1";
  const VERSION = 1;
  const EXPECTED_ORDER = ["listen", "verify", "protect", "share"];
  const CARD_ORDER = ["protect", "share", "verify", "listen"];
  const $ = (selector, root) => (root || document).querySelector(selector);
  const panel = () => $("#pn");
  const lang = () => document.documentElement.lang === "en" ? "en" : "ar";
  const t = (ar, en) => lang() === "en" ? en : ar;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[ch]);

  const cards = {
    listen: {
      title:["القطعة الأولى: أذن قبل الحكم","Fragment One: Listen Before Judging"],
      text:["جلسوا معاً، وتركوا لكل شخص وقتاً ليقول ما يعرفه وما لا يعرفه. لم تبدأ الحكاية باتهام، بل بسؤال هادئ.","They sat together and gave each person time to say what they knew and what they did not. The story began not with an accusation, but with a quiet question."],
      clue:["ابدأ بالاستماع؛ لا يمكنك التحقق من رواية لم تسمعها.","Begin by listening; you cannot verify an account you have not heard."]
    },
    verify: {
      title:["القطعة الثانية: ما نعرفه وما نظنه","Fragment Two: What We Know and What We Assume"],
      text:["كتبوا الوقائع في عمود، والاحتمالات في عمود آخر. لم يملأوا الفراغات بالتخمين، ووضعوا تاريخاً ومصدراً لكل معلومة.","They wrote facts in one column and possibilities in another. They did not fill gaps with guesses; every item received a date and a source."],
      clue:["بعد الاستماع، افصل المعلومة المؤكدة عن الاستنتاج.","After listening, separate confirmed information from inference."]
    },
    protect: {
      title:["القطعة الثالثة: أسماء ليست للنشر","Fragment Three: Names Are Not for Display"],
      text:["راجعوا ما قد يكشف هوية طفل أو أسرة. حذفوا التفاصيل الحساسة، وتركوا لأصحاب الحكاية حق الموافقة أو الرفض.","They reviewed what could identify a child or family. They removed sensitive details and left each person free to consent or decline."],
      clue:["بعد التحقق، صون الأسماء والتفاصيل الخاصة قبل مشاركة الرسالة.","After verification, protect names and private details before sharing the message."]
    },
    share: {
      title:["القطعة الرابعة: طريق لا يملكه شخص واحد","Fragment Four: A Road No One Owns Alone"],
      text:["حين اكتملت الصورة، عادوا إلى أصحاب الحكاية ليسألوهم كيف يريدون استخدام ما جُمع. لم يعد القرار ملكاً لمن يحمل الدفتر وحده.","When the picture was complete, they returned to the people in the story and asked how they wanted the material used. The decision no longer belonged only to whoever held the notebook."],
      clue:["لا تشارك الرسالة إلا بعد الاستماع والتحقق وصون الخصوصية.","Share the message only after listening, verifying and protecting privacy."]
    }
  };

  const endings = {
    consent: {
      title:["رسالة وصلت إلى أصحابها","A Message Returned to Its People"],
      text:["أعددتم نسخة مختصرة لا تكشف أحداً، وقرأها أصحاب الحكاية قبل مشاركتها. اختار بعضهم أن يضيفوا كلمة، واختار آخرون ألا يظهروا. لم تصبح الرسالة ملكاً للجميع؛ بقيت أمانة عند من وثقوا بكم.","You prepared a short version that identified no one, and the people in the story reviewed it before it was shared. Some added a line; others chose to remain unseen. The message did not become everyone's property. It remained a responsibility entrusted to you."]
    },
    private: {
      title:["رسالة محفوظة في الدفتر","A Message Kept in the Journal"],
      text:["قررت الأسرة أن تبقي الرسالة في دفترها. لم يكن الصمت إنكاراً لما حدث، بل اختياراً لحدود ما يُروى ومتى يُروى. بقيت الكلمات قريبة، دون أن تتحول إلى مادة يتداولها الآخرون.","The family chose to keep the message in its journal. Silence was not denial; it was a choice about what to tell and when. The words remained close without becoming material for others to circulate."]
    },
    repair: {
      title:["رسالة احتاجت إلى إصلاح","A Message That Needed Repair"],
      text:["نُشرت النسخة بسرعة، ثم اكتشفتم أن تفصيلاً قد يعرّف شخصاً لم يوافق على الظهور. أوقفتم تداولها، واعتذرتم، وصححتم النسخة. لم يكن الاعتذار نهاية العمل؛ كان بداية تحمّل المسؤولية.","The message was shared too quickly. Then you noticed a detail that could identify someone who had not agreed to be seen. You stopped its circulation, apologised and corrected the copy. The apology was not the end of the work; it was the start of taking responsibility."]
    }
  };

  function fresh() {
    return {version:VERSION,screen:"intro",order:[],hint:false,ending:null,updatedAt:Date.now()};
  }
  function validState(value) {
    if (!value || value.version !== VERSION) return false;
    if (!["intro","puzzle","decision","ending"].includes(value.screen)) return false;
    if (!Array.isArray(value.order) || value.order.length > 4 ||
        !value.order.every((id,i,a) => EXPECTED_ORDER.includes(id) && a.indexOf(id) === i)) return false;
    if (typeof value.hint !== "boolean") return false;
    if (value.screen === "decision" && value.order.join(",") !== EXPECTED_ORDER.join(",")) return false;
    if (value.screen === "ending" && (!endings[value.ending] || value.order.join(",") !== EXPECTED_ORDER.join(","))) return false;
    if (value.screen !== "ending" && value.ending !== null) return false;
    return true;
  }
  function load() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      return validState(value) ? value : fresh();
    } catch (_) { return fresh(); }
  }
  let state = load();

  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (_) { notify(t("تعذر حفظ اللغز على هذا الجهاز. يمكنك متابعة المحاولة، لكن لا تغلق الصفحة قبل تصدير نسخة احتياطية من غرفة المخرج.","This puzzle could not be saved on this device. You can continue, but avoid closing the page before exporting a backup from the Director's Room.")); }
  }
  function notify(message) {
    if (typeof window.toast === "function") window.toast(message);
    else {
      const node = $("#tt");
      if (node) { node.textContent = message; node.classList.add("on"); }
    }
  }

  let returnFocus = null;
  let keysBound = false;
  function bindDialogKeys() {
    if (keysBound) return;
    keysBound = true;
    document.addEventListener("keydown", event => {
      const p = panel();
      if (!p || !p.classList.contains("on") || p.dataset.amqDialog !== "1") return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const items = Array.from(p.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])'))
        .filter(item => !item.hidden && item.getClientRects().length > 0);
      if (!items.length) { event.preventDefault(); p.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !p.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !p.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    });
  }
  function close() {
    const p = panel();
    if (p) {
      p.classList.remove("on");
      p.removeAttribute("role");
      p.removeAttribute("aria-modal");
      p.removeAttribute("aria-labelledby");
      delete p.dataset.amqDialog;
    }
    const restore = returnFocus && returnFocus.isConnected ? returnFocus : null;
    returnFocus = null;
    if (restore) restore.focus();
  }
  function show(html) {
    const p = panel();
    if (!p) return;
    if (!p.classList.contains("on")) returnFocus = document.activeElement;
    p.innerHTML = '<div class="amq-panel">' + html + '</div>';
    p.classList.add("on");
    p.setAttribute("role","dialog");
    p.setAttribute("aria-modal","true");
    p.dataset.amqDialog = "1";
    p.setAttribute("tabindex","-1");
    const heading = $("h3",p);
    if (heading) {
      if (!heading.id) heading.id = "amq-dialog-title";
      p.setAttribute("aria-labelledby",heading.id);
    }
    bindDialogKeys();
    const first = $("button",p);
    if (first) first.focus(); else p.focus();
  }

  const style = document.createElement("style");
  style.id = "alnajat-message-quest-style";
  style.textContent = [
    ".amq-panel{color:var(--fg);font:inherit;line-height:1.85}",
    ".amq-panel h3{font-size:1.2rem;line-height:1.5;margin:2px 0 10px;color:var(--ac)}",
    ".amq-panel .amq-kicker{font-size:11px;color:var(--mut);font-weight:700;letter-spacing:.06em}",
    ".amq-panel .amq-copy{font-size:var(--fs-body);line-height:2;white-space:pre-line;margin:12px 0 18px}",
    ".amq-panel .amq-card{display:block;width:100%;text-align:start;padding:13px;margin:9px 0;border:1px solid var(--bd);border-radius:12px;background:var(--card);color:var(--fg);font:inherit;cursor:pointer;min-height:58px}",
    ".amq-panel .amq-card b{display:block;color:var(--ac);margin-bottom:4px}",
    ".amq-panel .amq-card:focus-visible,.amq-panel .btn:focus-visible{outline:3px solid var(--ac);outline-offset:3px}",
    ".amq-panel .amq-order{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}",
    ".amq-panel .amq-order span{padding:6px 9px;border:1px solid var(--bd);border-radius:999px;background:var(--card);font-size:12px}",
    ".amq-panel .amq-hint{padding:12px;border-inline-start:3px solid var(--ac);background:var(--card);border-radius:8px;margin:12px 0;font-size:13px}",
    ".amq-panel .amq-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}",
    ".amq-panel .amq-actions .btn{flex:1;min-width:130px}",
    "@media(prefers-reduced-motion:reduce){.amq-panel *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}"
  ].join("");
  document.head.appendChild(style);

  function renderMenu() {
    const has = state.order.length > 0 || state.screen !== "intro";
    let html = '<div class="amq-kicker">' + t("مهمة جانبية مستقلة • لغز سردي","INDEPENDENT SIDE QUEST • STORY PUZZLE") + '</div>';
    html += '<h3>✉️ ' + t("الرسالة الناقصة","The Missing Message") + '</h3>';
    html += '<p class="amq-copy">' + t("رسالة صوتية قديمة وصلت ناقصة. أمامك أربع قطع من الذاكرة، وعليك ترتيبها قبل أن تقرر كيف تُحفظ الحكاية.","An old voice message arrived incomplete. Four fragments of memory remain. Put them in order before deciding how the story should be kept.") + '</p>';
    html += '<div class="amq-hint">' + t("كل الشخصيات والمواقف في هذا اللغز خيالية ومركّبة. لا توجد بيانات لاعبين أو تحليلات؛ التقدم محفوظ محلياً فقط.","All characters and situations in this puzzle are fictional composites. No player data or analytics are collected; progress is stored locally only.") + '</div>';
    if (has) html += '<button class="btn pri" type="button" data-amq="resume">' + t("متابعة اللغز","Resume puzzle") + '</button>';
    else html += '<button class="btn pri" type="button" data-amq="start">' + t("ابدأ اللغز","Begin puzzle") + '</button>';
    if (has) html += '<button class="btn" type="button" data-amq="restart">' + t("إعادة اللغز من البداية","Restart the puzzle") + '</button>';
    html += '<button class="btn" type="button" data-amq="close">' + t("إغلاق","Close") + '</button>';
    show(html);
    const p = panel();
    p.querySelectorAll("[data-amq]").forEach(button => button.addEventListener("click", () => {
      const action = button.dataset.amq;
      if (action === "close") close();
      else if (action === "start") { state = fresh(); state.screen = "intro"; save(); renderScreen(); }
      else if (action === "resume") renderScreen();
      else if (action === "restart") {
        if (window.confirm(t("ستبدأ من جديد، وسيُحفظ ملخص المحاولة السابقة في أرشيف هذا اللغز فقط.","You will start again. A short summary of the previous attempt will be kept in this puzzle's archive only."))) {
          archiveAttempt(); state = fresh(); save(); renderScreen();
        }
      }
    }));
  }

  function archiveAttempt() {
    try {
      const old = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
      const list = Array.isArray(old) ? old : [];
      list.unshift({ending:state.ending,order:state.order.slice(),endedAt:Date.now()});
      localStorage.setItem(ARCHIVE_KEY,JSON.stringify(list.slice(0,8)));
    } catch (_) {}
  }

  function renderScreen() {
    if (state.screen === "intro") renderIntro();
    else if (state.screen === "puzzle") renderPuzzle();
    else if (state.screen === "decision") renderDecision();
    else renderEnding();
  }
  function renderIntro() {
    let html = '<div class="amq-kicker">' + t("المشهد الأول • بيت هادئ","SCENE ONE • A QUIET HOME") + '</div>';
    html += '<h3>' + t("صوت انقطع في منتصف الطريق","A Voice Cut Off Midway") + '</h3>';
    html += '<div class="amq-copy">' + t("في المساء، وجدتم تسجيلاً قديماً لعثمان. يبدأ بصوت ضحكة قصيرة، ثم صمت، ثم أربع جمل مسجلة في أوقات مختلفة. لم يكن عثمان يريد منكم نشرها؛ تركها لتذكّركم بطريقة العمل معاً. قالت آمنة: «لا نملأ الجزء المفقود من عندنا. نرتب ما نعرفه أولاً».","That evening, you found an old recording from Osman. It begins with a short laugh, then silence, then four sentences recorded at different moments. Osman did not ask you to publish them; he left them as a reminder of how to work together. Amina said: “We do not invent the missing part. First, we put what we know in order.”") + '</div>';
    html += '<div class="amq-hint">' + t("المطلوب ليس تخمين الكلمات المفقودة، بل ترتيب أربع قواعد: الاستماع، والتحقق، وصون الخصوصية، ثم المشاركة.","The task is not to guess the missing words, but to order four principles: listening, verification, privacy, then sharing.") + '</div>';
    html += '<div class="amq-actions"><button class="btn pri" type="button" data-next="1">' + t("ابدأ ترتيب القطع","Start arranging the fragments") + '</button><button class="btn" type="button" data-menu="1">' + t("القائمة","Menu") + '</button></div>';
    show(html);
    const p = panel();
    $("[data-next]",p)?.addEventListener("click",() => { state.screen = "puzzle"; state.order = []; state.hint = false; save(); renderPuzzle(); });
    $("[data-menu]",p)?.addEventListener("click",renderMenu);
  }

  function renderPuzzle() {
    let html = '<div class="amq-kicker">' + t("المشهد الثاني • طاولة الرسائل","SCENE TWO • THE MESSAGE TABLE") + '</div>';
    html += '<h3>' + t("رتّب القطع الأربع","Arrange the Four Fragments") + '</h3>';
    html += '<div class="amq-copy">' + t("اختر القطعة التي ينبغي أن تأتي تالية. اقرأ وصفها، ثم ضعها في مكانها. يمكنك التراجع وإعادة المحاولة بلا عقوبة.","Choose which fragment should come next. Read its description, then place it. You can undo and try again without penalty.") + '</div>';
    html += '<div class="amq-order" aria-live="polite">' + (state.order.length ? state.order.map((id,i) => '<span>'+(i+1)+'. '+esc(cards[id].title[lang()==="en"?1:0])+'</span>').join("") : '<span>'+t("لم ترتب أي قطعة بعد","No fragments placed yet")+'</span>') + '</div>';
    if (state.order.length < 4) {
      CARD_ORDER.filter(id => !state.order.includes(id)).forEach(id => {
        const card = cards[id];
        html += '<button class="amq-card" type="button" data-card="'+id+'"><b>'+esc(card.title[lang()==="en"?1:0])+'</b><span>'+esc(card.text[lang()==="en"?1:0])+'</span></button>';
      });
    }
    if (state.hint) html += '<div class="amq-hint" role="status">'+t("تلميح: الاستماع يسبق التحقق؛ والتحقق يسبق صون الأسماء؛ وصون الأسماء يسبق المشاركة.","Hint: listening comes before verification; verification comes before protecting identities; protecting identities comes before sharing.")+'</div>';
    if (state.order.length === 4) {
      html += '<div class="amq-hint" role="status">'+t("لم يكتمل الترتيب بعد. اقرأ التلميح أو أعد ترتيب القطع؛ لا توجد خسارة أو عقوبة.","The order is not complete yet. Read the hint or rearrange the fragments; there is no penalty or loss.")+'</div>';
      html += '<button class="btn pri" type="button" data-reset="1">'+t("أعد ترتيب القطع","Rearrange fragments")+'</button>';
    } else {
      html += '<div class="amq-actions"><button class="btn" type="button" data-undo="1" '+(state.order.length?"":"disabled")+'>'+t("تراجع خطوة","Undo one step")+'</button><button class="btn" type="button" data-hint="1">'+t("أعطني تلميحاً","Give me a hint")+'</button><button class="btn" type="button" data-menu="1">'+t("القائمة","Menu")+'</button></div>';
    }
    show(html);
    const p = panel();
    p.querySelectorAll("[data-card]").forEach(button => button.addEventListener("click",() => {
      state.order.push(button.dataset.card);
      if (state.order.length === 4 && state.order.join(",") === EXPECTED_ORDER.join(",")) {
        state.screen = "decision";
        state.hint = false;
        save();
        renderDecision();
      } else { save(); renderPuzzle(); }
    }));
    $("[data-undo]",p)?.addEventListener("click",() => { state.order.pop(); save(); renderPuzzle(); });
    $("[data-hint]",p)?.addEventListener("click",() => { state.hint = true; save(); renderPuzzle(); });
    $("[data-reset]",p)?.addEventListener("click",() => { state.order = []; state.hint = false; save(); renderPuzzle(); });
    $("[data-menu]",p)?.addEventListener("click",renderMenu);
  }

  function renderDecision() {
    let html = '<div class="amq-kicker">' + t("المشهد الثالث • اكتملت الرسالة","SCENE THREE • THE MESSAGE IS RECONSTRUCTED") + '</div>';
    html += '<h3>' + t("ما الذي ستفعله بالكلمات؟","What Will You Do With the Words?") + '</h3>';
    html += '<div class="amq-copy">' + t("استعدتم ترتيب الفكرة، لا الكلمات التي لم تُسجل. صارت الرسالة: «نسمع أولاً، نتحقق مما نعرف، نصون الأسماء، ثم نتشارك القرار». بقي سؤال أخير: من يملك حق استخدام هذه الحكاية؟","You recovered the order of the idea, not the words that were never recorded. The message became: “Listen first, verify what we know, protect identities, then share the decision.” One question remained: who has the right to use this story?") + '</div>';
    html += '<button class="amq-card" type="button" data-ending="consent"><b>'+t("شارك نسخة منقحة بعد موافقة أصحاب الحكاية","Share an edited version after the people involved consent")+'</b><span>'+t("تعود الرسالة إلى أصحابها، ويختار كل شخص ما يريد مشاركته.","Return the message to the people involved; each person chooses what to share.")+'</span></button>';
    html += '<button class="amq-card" type="button" data-ending="private"><b>'+t("احتفظ بها في دفتر العائلة","Keep it in the family journal")+'</b><span>'+t("لا تحتاج كل ذكرى إلى جمهور كي تبقى ذات معنى.","Not every memory needs an audience to remain meaningful.")+'</span></button>';
    html += '<button class="amq-card" type="button" data-ending="repair"><b>'+t("انشر التسجيل كاملاً الآن","Publish the full recording now")+'</b><span>'+t("قد يكشف التسجيل تفاصيل لم يوافق أصحابها على نشرها.","The recording may reveal details the people involved did not agree to publish.")+'</span></button>';
    html += '<button class="btn" type="button" data-menu="1">'+t("القائمة","Menu")+'</button>';
    show(html);
    const p = panel();
    p.querySelectorAll("[data-ending]").forEach(button => button.addEventListener("click",() => {
      state.ending = button.dataset.ending;
      state.screen = "ending";
      save();
      renderEnding();
    }));
    $("[data-menu]",p)?.addEventListener("click",renderMenu);
  }

  function renderEnding() {
    const ending = endings[state.ending] || endings.private;
    let html = '<div class="amq-kicker">' + t("الخاتمة • أثر الرسالة","ENDING • THE MESSAGE'S AFTERMATH") + '</div>';
    html += '<h3>'+esc(ending.title[lang()==="en"?1:0])+'</h3>';
    html += '<div class="amq-copy">'+esc(ending.text[lang()==="en"?1:0])+'</div>';
    html += '<div class="amq-hint">'+t("هذه مهمة خيالية مستقلة. لم تتغير القصة الأصلية أو نهاياتها أو ملفات حفظها.","This is an independent fictional quest. The original story, its endings and its saves remain unchanged.")+'</div>';
    html += '<div class="amq-actions"><button class="btn pri" type="button" data-menu="1">'+t("قائمة اللغز","Puzzle menu")+'</button><button class="btn" type="button" data-close="1">'+t("إغلاق","Close")+'</button></div>';
    show(html);
    const p = panel();
    $("[data-menu]",p)?.addEventListener("click",renderMenu);
    $("[data-close]",p)?.addEventListener("click",close);
  }

  function open() { renderMenu(); }
  const previousMenu = window.showMenu;
  if (typeof previousMenu === "function") {
    window.showMenu = function () {
      const result = previousMenu.apply(this,arguments);
      try {
        const app = $("#app");
        if (!app || app.querySelector("[data-message-quest-launcher]")) return result;
        const buttons = Array.from(app.querySelectorAll("button"));
        const anchor = buttons.find(button => /الفصل التالي|Next Chapter/.test(button.textContent || "")) ||
          buttons.find(button => /الإعدادات|Settings/.test(button.textContent || "")) || buttons[buttons.length-1];
        if (anchor) {
          const wrap = document.createElement("div");
          wrap.dataset.messageQuestLauncher = "1";
          const button = document.createElement("button");
          button.className = "btn";
          button.type = "button";
          button.textContent = "✉️ " + t("لغز الرسالة الناقصة","The Missing Message");
          button.addEventListener("click",open);
          wrap.appendChild(button);
          anchor.insertAdjacentElement("afterend",wrap);
        }
      } catch (error) { console.error("ALNAJAT message quest menu:",error); }
      return result;
    };
  }
  window.openAlnajatMessageQuest = open;
  console.info("ALNAJAT Missing Message Quest loaded — independent fictional puzzle");
})();