/* ALNAJAT — THE NEXT CHAPTER: وطن يتّسع للجميع
   Additive, bilingual, locally saved narrative campaign.
   Does not mutate the canonical story graph, Story Lock, endings, or legacy saves. */
(function () {
  "use strict";
  if (window.__ALNAJAT_NEXT_CHAPTER__) return;
  window.__ALNAJAT_NEXT_CHAPTER__ = true;

  const KEY = "alnajat_next_chapter_v1";
  const VERSION = 1;
  const MAX_LOG = 120;
  const $ = (s, root) => (root || document).querySelector(s);
  const lang = () => document.documentElement.lang === "en" ? "en" : "ar";
  const t = (ar, en) => lang() === "en" ? en : ar;
  const panel = () => $("#pn");
  const clamp = n => Math.max(-5, Math.min(20, Number(n) || 0));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);

  const scenes = {
    prologue: {
      chapter: 1, title: ["الفصل الأول: الرسالة التي لم تصل","Chapter One: The Message That Never Arrived"],
      text: [
        "مرّت أعوام على الأيام التي ظننتَ فيها أن النجاة تعني الوصول إلى مكان لا تُسمع فيه أصوات الحرب. تعلّمتَ أن الوصول بداية أخرى: أن تجد عملاً، وأن تحفظ أسماء الغائبين، وأن تشرح لطفليك لماذا لا يزال صوت الرعد يجعلك تصمت.",
        "في صباح هادئ، وصلتك رسالة صوتية قديمة من صديقك عثمان. لم تكن الرسالة كاملة؛ انقطع الصوت عند جملة واحدة: «إذا وجدنا طريقاً يجمعنا، فلا تجعلوا الخوف يرسمه وحده». وضعتَ السبحة الخشبية قرب الهاتف، وقررت أن تبدأ رحلة قصيرة لتبحث عن معنى هذه الجملة."
      ],
      choices: [
        {label:["استمع إلى الرسالة مرة أخرى، واكتب ما تتذكره دون أن تخمّن الباقي.","Listen again and write down what you remember without guessing the missing words."],to:"departure",fx:{truth:2,care:1},tag:"memory"},
        {label:["اطلب من آمنة أن تساعدك في فهم ما تغيّر في حياتكم.","Ask Amina to help you understand what has changed in your family."],to:"departure",fx:{bond:2,care:1},tag:"family"}
      ]
    },
    departure: {
      chapter: 1, title:["الفصل الأول: حقيبة صغيرة وأربعة طرق","Chapter One: One Small Bag, Four Roads"],
      text:[
        "على الطاولة خريطة ورقية قديمة. لا ترسم حدوداً للناس؛ ترسم طرقاً إلى أناس ينتظرون خبراً أو دواءً أو فرصة للتعلّم. اتصلت بك أربع جهات من مناطق مختلفة. لكل مكان حكايته، ولا تستطيع زيارة الجميع في يوم واحد.",
        "قالت مريم: «هل سنذهب لنساعدهم؟» أجبتها: «سنذهب لنسمع أولاً. المساعدة التي لا تسمع قد تتحول إلى عبء». اخترت طريقاً، لكن اختيارك لن يجعل الطرق الأخرى أقل أهمية."
      ],
      choices:[
        {label:["الشمال: قرية تبحث عن ماء ومدرسة تعمل من جديد.","North: a village trying to restore water and a functioning school."],to:"north",fx:{care:1},route:"north"},
        {label:["الشرق: حي يستقبل عائلات جديدة ويعيد بناء الثقة.","East: a neighbourhood welcoming new families and rebuilding trust."],to:"east",fx:{care:1},route:"east"},
        {label:["الجنوب: أصدقاء متفرقون يحاولون فتح مساحة آمنة للأطفال.","South: separated friends trying to create a safe space for children."],to:"south",fx:{care:1},route:"south"},
        {label:["الوسط والجزيرة والخرطوم: سوق يحاول أن يعود مكاناً للرزق.","Centre, Gezira and Khartoum: a market trying to become a place of livelihood again."],to:"centre",fx:{care:1},route:"centre"}
      ]
    },
    north:{
      chapter:2,title:["الفصل الثاني: الشمال — بئر لا يكفي وحده","Chapter Two: The North — A Well Is Not Enough"],
      text:[
        "وصلت إلى قرية على ضفة النيل. البئر يعمل يوماً ويتعطل أياماً، والمدرسة فتحت فصلاً واحداً تحت ظل شجرة. استقبلتك المعلّمة نفيسة وقالت: «لا نريد صورة تُظهرنا عاجزين. نريد أن يعرف الناس ما الذي نحتاجه، وما الذي نستطيع فعله بأنفسنا».",
        "وجدت دفتر صيانة قديماً. أسماء القرى مكتوبة، لكن مواعيد الأعطال غير مسجلة. طفل اسمه مأمون اقترح أن يرسم خريطة للمضخات، بينما أصرّ أحد الكبار أن المشكلة تحتاج إلى تمويل فقط. كان أمامك قرار: كيف تبدأ من دون أن تعد بما لا تملك؟"
      ],
      choices:[
        {label:["ابدأ بسجل علني للأعطال والاحتياجات، مع حماية بيانات الأسر.","Start a public log of faults and needs while protecting household data."],to:"bridge",fx:{truth:2,care:1},tag:"evidence"},
        {label:["نظّم فريقاً محلياً للصيانة والتعلّم، واطلب دعماً محدداً.","Organise a local maintenance and learning team, then request specific support."],to:"bridge",fx:{solidarity:2,agency:1},tag:"organise"}
      ]
    },
    east:{
      chapter:2,title:["الفصل الثاني: الشرق — مقعد إضافي","Chapter Two: The East — One More Seat"],
      text:[
        "في حي قريب من سوق قديم، صارت المدرسة تستقبل أطفالاً من مدن وقرى كثيرة. ضاقت الغرفة، وارتفعت أسعار السكن، وبدأت إشاعات تتهم القادمين بأنهم سبب كل نقص. قالت لك المعلمة هدى: «الضغط حقيقي، لكن تحويل الجار إلى عدو لن يصنع مقعداً إضافياً».",
        "اقترح صاحب المخبز أن يضع قائمة بالأسر التي تحتاج إلى الخبز، بينما خافت أمّ من أن تكشف القائمة أسماء أطفالها. رأيت أن العدالة ليست إعلان كل شيء؛ إنها إعلان القواعد مع صون كرامة الناس."
      ],
      choices:[
        {label:["ضع قواعد توزيع واضحة يراجعها ممثلون من الحي دون نشر أسماء الأسر.","Set transparent distribution rules reviewed by neighbourhood representatives without publishing family names."],to:"bridge",fx:{solidarity:2,truth:1},tag:"fairness"},
        {label:["افتح مساحة حوار بين السكان القدامى والجدد حول الاحتياجات المشتركة.","Create a dialogue space between long-time residents and newcomers about shared needs."],to:"bridge",fx:{bond:2,care:1},tag:"dialogue"}
      ]
    },
    south:{
      chapter:2,title:["الفصل الثاني: الجنوب — مساحة لا تسأل عن الاسم","Chapter Two: The South — A Space That Does Not Ask Your Name"],
      text:[
        "في بلدة جنوبية، يحاول متطوعون إعادة فتح ساحة صغيرة للعب والتعلّم. بعض الأطفال فقدوا أصدقاء، وبعض الأسر لا تريد الحديث عن الماضي. قالت المتطوعة سارة: «لا نطلب من الطفل أن يروي ما يؤلمه كي يستحق الأمان».",
        "وصلت قائمة بأسماء أطفال مفقودين من مجموعات مختلفة. لم تكن القائمة مكتملة، وبعض الأسماء متشابهة. أدركت أن نشرها بلا تحقق قد يؤذي أسراً أخرى. كيف تحمي حق الناس في المعرفة وحقهم في الخصوصية معاً؟"
      ],
      choices:[
        {label:["اعمل مع جهة موثوقة للتحقق ولمّ الشمل، ولا تنشر بيانات حساسة.","Work with a trusted service to verify information and reunite families; do not publish sensitive data."],to:"bridge",fx:{truth:2,care:1},tag:"protection"},
        {label:["ابدأ مساحة لعب وتعلّم يقودها الأطفال بموافقة أسرهم.","Start a play-and-learning space shaped by children with their families' consent."],to:"bridge",fx:{care:2,bond:1},tag:"safe-space"}
      ]
    },
    centre:{
      chapter:2,title:["الفصل الثاني: الوسط والجزيرة والخرطوم — السوق الذي يتذكّر","Chapter Two: Centre, Gezira and Khartoum — The Market Remembers"],
      text:[
        "في سوق تعرّض للنهب والإغلاق، يحاول التجار فتح الأبواب من جديد. صاحب الدكان فقد دفتر الديون، والخباز لا يعرف إن كان سيجد الدقيق غداً. امرأة تبحث عن أخيها، وشاب يريد عملاً لا يضطره إلى المخاطرة.",
        "عرض عليك تاجر أن تنشر صوراً لوجوه أشخاص اتُّهموا بالسرقة. قال إن الناس يستحقون معرفة الحقيقة. لكن الصور غير موثقة، ونشرها قد يعرّض أبرياء للخطر. الحقيقة تحتاج إلى دليل، لا إلى سرعة الغضب."
      ],
      choices:[
        {label:["ساعد في توثيق الخسائر والشهادات بموافقة أصحابها، دون نشر اتهامات غير مثبتة.","Help document losses and testimonies with consent, without publishing unverified accusations."],to:"bridge",fx:{truth:2,care:1},tag:"documentation"},
        {label:["أنشئ تعاونية صغيرة لتبادل العمل والسلع بشروط معلنة.","Create a small cooperative for exchanging work and goods under clear terms."],to:"bridge",fx:{solidarity:2,agency:1},tag:"cooperative"}
      ]
    },
    bridge:{
      chapter:3,title:["الفصل الثالث: الجسر — من يساعد من؟","Chapter Three: The Bridge — Who Helps Whom?"],
      text:[
        "بعد أيام، التقيت بأشخاص من الطرق الأربعة في محطة سفر. لم تكن لديهم قصة واحدة: معلّم يريد العودة إلى فصله، وممرضة تبحث عن سلسلة تبريد للدواء، وتاجر يخشى أن يبدأ من الصفر، وفتاة تريد أن تكمل دراستها.",
        "قال مأمون: «كل واحد جاء ومعه طلب». أجابته نفيسة: «والأهم أن كل واحد جاء ومعه قدرة أيضاً». اقترحت أن تتبادل المجموعات ما تعرفه، لكن الخلاف ظهر سريعاً: من يحدد الأولويات؟ ومن يراقب المال؟"
      ],
      choices:[
        {label:["أنشئ مجلساً مؤقتاً بتمثيل متوازن ومحاضر وقرارات قابلة للمراجعة.","Create a temporary council with balanced representation, minutes and reviewable decisions."],to:"ledger",fx:{solidarity:2,truth:1},tag:"governance"},
        {label:["ابدأ بمهمة صغيرة مشتركة، ثم قيّموا النتائج قبل توسيعها.","Begin with one small shared task, then assess results before expanding."],to:"ledger",fx:{agency:2,care:1},tag:"pilot"}
      ]
    },
    ledger:{
      chapter:3,title:["الفصل الثالث: الدفتر المفتوح — المال والثقة","Chapter Three: The Open Ledger — Money and Trust"],
      text:[
        "وصل دعم محدود لمشروع الماء والتعلّم والإسعاف المجتمعي. لا يكفي لكل شيء. طلب أحدهم أن تُصرف الأموال بسرعة بلا إيصالات، بحجة أن الثقة أهم من الورق. قالت آمنة: «الثقة لا تعني أن نتوقف عن السؤال؛ بل أن نستطيع السؤال دون خوف».",
        "وضعت أمامك ثلاثة احتياجات عاجلة: إصلاح مضخة، شراء مستلزمات إسعاف، وتوفير كتب وأدوات تعلّم. لا يوجد خيار كامل، وأي قرار سيترك حاجة تنتظر. عليك أن تختار قاعدة عادلة، لا أن تدّعي أن الموارد تكفي الجميع."
      ],
      choices:[
        {label:["انشر الميزانية والأولويات والإيصالات، مع قناة اعتراض آمنة.","Publish the budget, priorities and receipts, with a safe channel for objections."],to:"assembly",fx:{truth:2,agency:1},tag:"accountability"},
        {label:["قسّم التمويل إلى دفعات صغيرة مرتبطة بنتائج يمكن التحقق منها.","Release funding in small stages tied to verifiable outcomes."],to:"assembly",fx:{agency:2,truth:1},tag:"stages"},
        {label:["أعطِ الأولوية للأشد إلحاحاً وفق معيار معلن يراجعه المجتمع.","Prioritise the most urgent needs using a published, community-reviewed standard."],to:"assembly",fx:{care:2,solidarity:1},tag:"needs"}
      ]
    },
    assembly:{
      chapter:4,title:["الفصل الرابع: مجلس الناس — الاختلاف ليس عطباً","Chapter Four: The People's Assembly — Difference Is Not a Defect"],
      text:[
        "اجتمع ممثلون من القرى والأحياء. اختلفوا حول اللغة التي تُكتب بها اللوائح، وحول مكان الاجتماع التالي، وحول من يملك حق الاعتراض. كاد النقاش يتحول إلى اتهامات، حتى رفعت فتاة يدها وقالت: «إذا لم نستطع الاختلاف هنا، فكيف سنبني مكاناً يتسع لنا؟».",
        "اتفقتم على قواعد: لا قرار يمس جماعة دون سماعها؛ لا مسؤولية جماعية بسبب الهوية؛ لا سلطة مسلحة فوق القانون؛ ولا منصب بلا مدة ومحاسبة. لكن بقي السؤال الأصعب: كيف تحمون المدنيين حين تتعدد مراكز القوة؟"
      ],
      choices:[
        {label:["اطلب قيادة أمنية وطنية مهنية واحدة، خاضعة للقانون والرقابة المدنية، مع تدقيق فردي ومحاسبة.","Advocate one professional national security command under law and civilian oversight, with individual vetting and accountability."],to:"decision",fx:{truth:1,solidarity:2,agency:1},tag:"institutions"},
        {label:["ابدأ بآلية مدنية محلية لحماية الخدمات وراقب أي قوة وفق قواعد معلنة.","Begin with a local civilian service-protection mechanism and monitor every armed actor under published rules."],to:"decision",fx:{care:1,truth:1,agency:1},tag:"civic-oversight"}
      ]
    },
    decision:{
      chapter:4,title:["الفصل الرابع: لحظة القرار — ماذا تترك وراءك؟","Chapter Four: The Decision — What Will You Leave Behind?"],
      text:[
        "قبل مغادرتك، طلب منك الأطفال أن تكتب جملة على جدار المدرسة. لم يريدوا شعاراً سياسياً ولا وعداً بالنصر. أرادوا قاعدة يعيشون بها عندما يعود الخلاف.",
        "تذكرت الرسالة الناقصة: «إذا وجدنا طريقاً يجمعنا...». صار واضحاً أن الطريق ليس اتفاقاً على كل شيء؛ إنه اتفاق على ألا يتحول اختلافنا إلى إذلال أو خوف، وعلى أن تبقى المؤسسات في خدمة الناس لا العكس."
      ],
      choices:[
        {label:["اكتب: لا كرامة بلا عدالة، ولا دولة بلا مؤسسات تحاسب نفسها.","Write: No dignity without justice; no state without institutions that hold themselves accountable."],to:"ending",fx:{truth:2,solidarity:1},tag:"justice"},
        {label:["اكتب: لا أحد يُترك خارج الحكاية، ولا أحد يملك الحكاية وحده.","Write: No one is left outside the story, and no one owns the story alone."],to:"ending",fx:{care:2,bond:1},tag:"belonging"}
      ]
    }
  };

  const metrics = [
    ["truth","الحقيقة","Truth"],["care","الرعاية","Care"],["solidarity","التضامن","Solidarity"],
    ["agency","المبادرة","Agency"],["bond","الروابط","Bonds"]
  ];
  function fresh(){return {version:VERSION,scene:"prologue",route:null,stats:{truth:0,care:0,solidarity:0,agency:0,bond:0},flags:[],log:[],startedAt:Date.now(),updatedAt:Date.now(),ended:false,ending:null};}
  function validState(v){
    if(!v||v.version!==VERSION||!scenes[v.scene]&&!v.ended)return false;
    if(!v.stats||!metrics.every(m=>Number.isFinite(v.stats[m[0]])))return false;
    if(!Array.isArray(v.log)||!Array.isArray(v.flags))return false;
    if(v.log.length>MAX_LOG||v.flags.length>80)return false;
    return true;
  }
  function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||"null");return validState(v)?v:fresh();}catch(_){return fresh();}}
  let state=load();
  function save(){
    state.updatedAt=Date.now();
    try{localStorage.setItem(KEY,JSON.stringify(state));}
    catch(_){notice(t("تعذّر حفظ هذا الفصل على الجهاز. يمكنك متابعة اللعب، لكن صدّر نسخة احتياطية من غرفة المخرج.","This chapter could not be saved on this device. You can continue, but export a backup from the Director's Room."));}
  }
  function notice(msg){if(typeof window.toast==="function")window.toast(msg);else{const n=$("#tt");if(n){n.textContent=msg;n.classList.add("on");}}}
  function score(){return metrics.reduce((a,m)=>a+state.stats[m[0]],0);}
  function endingKey(){
    const s=state.stats;
    if(s.truth>=5&&s.agency>=4)return "accountable";
    if(s.care>=5&&s.bond>=3)return "care";
    if(s.solidarity>=5)return "together";
    return "unfinished";
  }
  const endings={
    accountable:{
      ar:["دفتر لا يخاف من السؤال","لم تصبح المدينة كاملة، لكن الحسابات صارت مرئية. استطاع الناس أن يسألوا أين ذهب المال، ومن اتخذ القرار، وكيف يمكن تصحيحه. لم تختفِ الخلافات؛ صار لها باب وموعد ومحضر."],
      en:["A Ledger That Welcomes Questions","The town did not become perfect, but its accounts became visible. People could ask where the money went, who made a decision and how it could be corrected. Disagreements did not disappear; they gained a door, a time and a record."]
    },
    care:{
      ar:["المقعد الذي اتّسع","لم يجد الجميع ما فقدوه، ولم تعد كل أسرة إلى بيتها. لكن مساحة التعلّم بقيت مفتوحة، وصار الأطفال يعرفون أسماء أصدقاء جدد دون أن يُطلب منهم نسيان من غاب. كان الأمان عملاً يومياً، لا صورة احتفال."],
      en:["The Seat That Made Room","Not everyone recovered what they had lost, and not every family returned home. But the learning space stayed open. Children learned the names of new friends without being asked to forget those who were missing. Safety became daily work, not a celebration photograph."]
    },
    together:{
      ar:["جسر بأيدٍ كثيرة","لم يحمل شخص واحد المشروع على كتفيه. تقاسمت المجموعات الأدوات والمعرفة، وتعلمت أن اختلاف الطرق لا يمنع الوصول إلى عمل مشترك. بقي الطريق طويلاً، لكنه لم يعد طريقاً يسير فيه أحد وحده."],
      en:["A Bridge Built by Many Hands","No single person carried the project. Groups shared tools and knowledge, learning that different paths need not prevent shared work. The road remained long, but no one had to walk it alone."]
    },
    unfinished:{
      ar:["الباب الذي بقي مفتوحاً","لم تصلوا إلى اتفاق نهائي. تعثرت بعض المبادرات، وتأخر إصلاح المضخة، واختلف المجلس على الأولويات. لكنكم رفضتم إخفاء الخلاف أو تحويله إلى عداوة. تركتم محضراً واضحاً وخطوة تالية قابلة للمراجعة."],
      en:["The Door Left Open","You did not reach a final agreement. Some efforts stalled, the pump repair was delayed and the council disagreed over priorities. But you refused to hide the disagreement or turn it into hostility. You left clear minutes and a next step that could be reviewed."]
    }
  };

  function close(){
    const p=panel();if(p){p.classList.remove("on");p.removeAttribute("role");p.removeAttribute("aria-modal");}
  }
  function show(html){
    const p=panel();if(!p)return;
    p.innerHTML='<div class="anx-panel">'+html+'</div>';
    p.classList.add("on");p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");
    const first=$("button",p);if(first)first.focus();
  }
  const style=document.createElement("style");
  style.textContent=[
    ".anx-panel{color:var(--fg);font:inherit;line-height:1.85}",
    ".anx-panel h3{font-size:1.2rem;line-height:1.5;margin:2px 0 8px;color:var(--ac)}",
    ".anx-panel .anx-kicker{font-size:11px;color:var(--mut);font-weight:700;letter-spacing:.04em}",
    ".anx-panel .anx-copy{white-space:pre-line;margin:12px 0 18px;font-size:var(--fs-body);line-height:1.95}",
    ".anx-panel .anx-choice{display:block;width:100%;text-align:start;white-space:normal;min-height:54px;padding:12px;margin:8px 0;border:1px solid var(--bd);border-radius:12px;background:var(--card);color:var(--fg);font:inherit;cursor:pointer}",
    ".anx-panel .anx-choice:focus-visible{outline:3px solid var(--ac);outline-offset:2px}",
    ".anx-panel .anx-meter{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:12px 0}",
    ".anx-panel .anx-stat{border:1px solid var(--bd);border-radius:10px;padding:8px;background:var(--card);font-size:11px}",
    ".anx-panel .anx-stat b{display:block;font-size:17px;color:var(--ac)}",
    ".anx-panel .anx-note{border-inline-start:3px solid var(--ac);background:var(--card);padding:10px;border-radius:8px;color:var(--mut);font-size:12px;margin:12px 0}",
    ".anx-panel .anx-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}",
    ".anx-panel .anx-actions .btn{flex:1;min-width:125px}",
    "@media(prefers-reduced-motion:reduce){.anx-panel *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}"
  ].join("");
  style.id="alnajat-next-chapter-style";document.head.appendChild(style);

  function renderMenu(){
    const p=panel();if(!p)return;
    const l=lang(),has=state.log.length>0;
    let html='<div class="anx-panel"><div class="anx-kicker">'+t("إضافة قصصية مستقلة — لا تغيّر النهايات الأصلية","INDEPENDENT STORY EXPANSION — ORIGINAL ENDINGS UNCHANGED")+'</div>';
    html+='<h3>✦ '+t("الفصل التالي: وطن يتّسع للجميع","The Next Chapter: A Country with Room for Everyone")+'</h3>';
    html+='<p class="mut">'+t("رحلة جديدة بأربعة طرق إقليمية، وشخصيات تتذكر ما حدث، وقرارات لها عواقب. تقدمها محفوظ في خانة مستقلة عن القصة الأصلية.","A new journey across four regional routes, with remembering characters and consequential choices. Progress is stored separately from the original story.")+'</p>';
    html+='<div class="anx-meter"><div class="anx-stat"><b>'+state.log.length+'</b>'+t("قرار في هذه الرحلة","decisions in this journey")+'</div><div class="anx-stat"><b>'+metrics.reduce((a,m)=>a+Math.max(0,state.stats[m[0]]),0)+'</b>'+t("أثر تراكمي","cumulative impact")+'</div></div>';
    if(!state.ended&&has)html+='<button class="btn pri" type="button" data-action="resume">'+t("متابعة من حيث توقفت","Resume where you left off")+'</button>';
    if(state.ended)html+='<button class="btn pri" type="button" data-action="resume">'+t("إعادة قراءة النهاية","Revisit the ending")+'</button>';
    if(!has)html+='<button class="btn pri" type="button" data-action="start">'+t("ابدأ الفصل الجديد","Begin the new chapter")+'</button>';
    if(has)html+='<button class="btn" type="button" data-action="restart">'+t("ابدأ رحلة جديدة (يحفظ سجل الرحلة السابقة)","Start a new journey (keeps the previous journey log)")+'</button>';
    html+='<button class="btn" type="button" data-action="journal">'+t("دفتر رحلتي","My journey journal")+'</button>';
    html+='<div class="anx-note">'+t("كل الشخصيات والأحداث في هذا الفصل مركّبة وخيالية. لا تمثل شخصية واحدة إقليماً أو جماعة، ولا تُرتّب المعاناة بين الناس. لا يجمع الفصل بيانات أو تحليلات عن اللاعبين.","All characters and events in this chapter are fictional composites. No character represents an entire region or community; suffering is never ranked. This chapter collects no player analytics.")+'</div>';
    html+='<button class="btn" type="button" data-action="close">'+t("إغلاق","Close")+'</button></div>';
    p.innerHTML=html;p.classList.add("on");p.setAttribute("role","dialog");p.setAttribute("aria-modal","true");
    p.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
      const a=b.dataset.action;
      if(a==="close")close();
      else if(a==="start"){state=fresh();save();renderScene();}
      else if(a==="resume"){if(state.ended)renderEnding();else renderScene();}
      else if(a==="restart"){
        if(window.confirm(t("ستبدأ رحلة جديدة. ستظل القصة الأصلية وكل نهاياتها وحفظها كما هي، وسيبقى سجل هذه الإضافة في سجل الرحلات.","A new expansion journey will begin. The original story, its endings and saves remain untouched; this expansion's previous run stays in the journey archive."))){archiveRun();state=fresh();save();renderScene();}
      }else if(a==="journal")renderJournal();
    }));
  }

  const archiveKey="alnajat_next_chapter_archive_v1";
  function archiveRun(){
    try{const old=JSON.parse(localStorage.getItem(archiveKey)||"[]");const list=Array.isArray(old)?old:[];list.unshift({route:state.route,ending:state.ending,log:state.log.slice(-MAX_LOG),stats:state.stats,endedAt:Date.now()});localStorage.setItem(archiveKey,JSON.stringify(list.slice(0,12)));}catch(_){}
  }
  function renderJournal(){
    const l=lang();let html='<h3>📖 '+t("دفتر الرحلة","Journey Journal")+'</h3>';
    if(!state.log.length)html+='<p class="mut">'+t("لم تبدأ الرحلة بعد.","The journey has not begun yet.")+'</p>';
    state.log.slice().reverse().forEach((entry,i)=>{html+='<div class="anx-note"><b>'+(state.log.length-i)+'. '+esc(entry.title[l])+'</b><br>'+esc(entry.choice[l])+'</div>';});
    html+='<div class="anx-actions"><button class="btn" type="button" data-back="1">'+t("عودة","Back")+'</button><button class="btn pri" type="button" data-close="1">'+t("إغلاق","Close")+'</button></div>';
    show(html);const p=panel();$("[data-back]",p)?.addEventListener("click",renderMenu);$("[data-close]",p)?.addEventListener("click",close);
  }
  function renderScene(){
    if(state.ended){renderEnding();return;}
    const scene=scenes[state.scene];if(!scene){state=fresh();save();renderScene();return;}
    const l=lang(),title=scene.title[l==="en"?1:0],copy=scene.text[l==="en"?1:0];
    let html='<div class="anx-kicker">'+t("رحلة إضافية • الفصل ","ADDITIONAL JOURNEY • CHAPTER ")+scene.chapter+'</div><h3>'+esc(title)+'</h3><div class="anx-copy">'+esc(copy)+'</div>';
    scene.choices.forEach((c,i)=>{html+='<button class="anx-choice" type="button" data-choice="'+i+'">'+esc(c.label[l==="en"?1:0])+'</button>';});
    html+='<div class="anx-note">'+t("اختيارك لا يغيّر القصة الأصلية. يمكنك العودة لاحقاً؛ هذا الفصل يحفظ تقدمه في مساحة مستقلة.","Your choice does not alter the original story. You can return later; this chapter saves in a separate space.")+'</div>';
    html+='<button class="btn" type="button" data-menu="1">'+t("قائمة الفصل","Chapter menu")+'</button>';
    show(html);const p=panel();
    p.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>choose(Number(b.dataset.choice))));
    $("[data-menu]",p)?.addEventListener("click",renderMenu);
  }
  function choose(index){
    const scene=scenes[state.scene],c=scene&&scene.choices[index];if(!c)return;
    const from=state.scene;
    Object.keys(c.fx||{}).forEach(k=>{if(Object.prototype.hasOwnProperty.call(state.stats,k))state.stats[k]=clamp(state.stats[k]+c.fx[k]);});
    if(c.route)state.route=c.route;
    if(c.tag&&!state.flags.includes(c.tag))state.flags.push(c.tag);
    state.log.push({from,to:c.to,title:scene.title,choice:c.label,tag:c.tag||"",at:Date.now()});
    state.log=state.log.slice(-MAX_LOG);
    if(c.to==="ending"){state.ended=true;state.ending=endingKey();state.scene="decision";}
    else state.scene=c.to;
    save();renderScene();
  }
  function renderEnding(){
    const l=lang(),e=endings[state.ending]||endings.unfinished,copy=e[l==="en"?1:0];
    let html='<div class="anx-kicker">'+t("الفصل الرابع • خاتمة إضافية","CHAPTER FOUR • ADDITIONAL ENDING")+'</div><h3>✦ '+esc(copy[0])+'</h3><div class="anx-copy">'+esc(copy[1])+'</div>';
    html+='<div class="anx-note">'+t("هذه خاتمة إضافية مستقلة. النهايات التسع الأصلية لم تتغير، ولم تُستبدل أو تُختصر.","This is an independent additional ending. The nine original endings have not been changed, replaced or shortened.")+'</div>';
    html+='<div class="anx-actions"><button class="btn pri" type="button" data-journal="1">'+t("راجع قراراتك","Review your choices")+'</button><button class="btn" type="button" data-menu="1">'+t("قائمة الفصل","Chapter menu")+'</button></div>';
    show(html);const p=panel();$("[data-journal]",p)?.addEventListener("click",renderJournal);$("[data-menu]",p)?.addEventListener("click",renderMenu);
  }
  function open(){
    if(!panel())return;
    renderMenu();
  }
  const previous=window.showMenu;
  if(typeof previous==="function"){
    window.showMenu=function(){
      const result=previous.apply(this,arguments);
      try{
        const app=$("#app");if(!app||app.querySelector("[data-next-chapter]"))return result;
        const buttons=Array.from(app.querySelectorAll("button"));
        const anchor=buttons.find(b=>/الإعدادات|Settings/.test(b.textContent||""))||buttons[buttons.length-1];
        if(anchor){
          const wrap=document.createElement("div");wrap.dataset.nextChapter="1";
          const button=document.createElement("button");button.className="btn";button.type="button";
          button.textContent="✦ "+t("الفصل التالي: وطن يتّسع للجميع","The Next Chapter: A Country with Room for Everyone");
          button.addEventListener("click",open);wrap.appendChild(button);anchor.insertAdjacentElement("afterend",wrap);
        }
      }catch(e){console.error("ALNAJAT next chapter menu:",e);}
      return result;
    };
  }
  window.openAlnajatNextChapter=open;
  console.log("ALNAJAT Next Chapter ready — additive narrative campaign");
})();