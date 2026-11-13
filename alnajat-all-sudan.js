/* ALNAJAT — All Sudan, Shared Dignity / كل السودان، كرامة واحدة
   Additive narrative scenarios. Does not edit original story nodes, choices or endings. */
(function(){
"use strict";
if(window.__ALNAJAT_ALL_SUDAN__) return;
window.__ALNAJAT_ALL_SUDAN__=true;
const KEY="alnajat_all_sudan_v1";
const $=s=>document.querySelector(s);
const lang=()=>document.documentElement.lang==="en"?"en":"ar";
const t=(ar,en)=>lang()==="en"?en:ar;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const stories=[
{id:"north",icon:"🌾",ar:"من الشمال: الماء الذي طال انتظاره",en:"From the North: The Water We Waited For",
leadAr:"في قرية شمالية، لا يسمع الطفل صفارات القصف كل يوم. لكنه يعرف معنى أن يفتح الصنبور فلا يجد ماءً، وأن تتعطل المدرسة والعيادة، وأن يهاجر من بقي من الجيران بحثاً عن العمل.",
leadEn:"In a northern village, a child may not hear shelling every day. But they know what it means to turn a tap and find no water, to see the school and clinic stall, and to watch neighbours leave in search of work.",
choices:[["يساعد أسرته في جلب الماء، ثم يسأل لماذا أصبحت الخدمة حلماً.","Helps the family fetch water, then asks why a basic service became a dream."],["يتمسك بالتعليم ويبحث مع معلمه عن مساحة تعلم آمنة.","Holds on to learning and works with a teacher to find a safe place to study."]]},
{id:"east",icon:"🌊",ar:"من الشرق: مدينة تستقبل القادمين",en:"From the East: A City Receiving Newcomers",
leadAr:"في الشرق، تستقبل الأسرة نازحين من ولاية أخرى. الخبز والعمل والسكن لم تعد سهلة، والطفل يسمع لهجات كثيرة في الصف نفسه. يتعلم أن ضغط الموارد لا يجعل القادم عدواً.",
leadEn:"In the East, a family welcomes people displaced from another state. Bread, work and housing are harder to find, and many accents now share one classroom. The child learns that pressure on resources does not make newcomers enemies.",
choices:[["يقاسم الأسرة الجديدة ما يستطيع، ويطلب من المدرسة ألا تترك أحداً خارج الصف.","Shares what the family can and asks the school not to leave anyone outside the classroom."],["ينضم إلى مبادرة محلية لتوثيق الاحتياجات وتوزيع المساعدة بعدل.","Joins a local effort to document needs and distribute aid fairly."]]},
{id:"south",icon:"🌳",ar:"من الجنوب: طريق العودة إلى البيت",en:"From the South: The Road Home",
leadAr:"في جنوب السودان، تتداخل مخاوف الأسرة من العنف والنزوح وتعطل الخدمات مع ذكريات قديمة عن الحرب. لا يريد الطفل أن يرث خوف الكبار ولا أن يُطلب منه أن يكره جماعة كاملة.",
leadEn:"In southern Sudan, fears of violence, displacement and broken services mingle with older memories of war. The child does not want to inherit adults' fear or be taught to hate an entire community.",
choices:[["يسأل عن مصير أصدقائه من خلفيات مختلفة، ويرفض التعميم.","Asks what happened to friends from different backgrounds and refuses to generalise."],["يبحث عن مكان آمن للتعلم واللعب، ويطلب حماية كل الأطفال.","Looks for a safe place to learn and play, asking that every child be protected."]]},
{id:"center",icon:"🏙️",ar:"من الوسط والجزيرة والخرطوم: بيت بلا سقف",en:"From the Centre, Gezira and Khartoum: A Home Lost",
leadAr:"نزح الطفل من حيّه. اختفت المدرسة والسوق والعيادة، وصار الهاتف وسيلة للبحث عن الأقارب. يسمع اتهامات جماعية، لكنه يعرف أن الجار لا يصبح مذنباً بسبب اسمه أو منطقته.",
leadEn:"The child fled their neighbourhood. School, market and clinic disappeared; a phone became the way to search for relatives. They hear collective accusations, but know a neighbour is not guilty because of a name or place of origin.",
choices:[["يوثق ما رآه دون نشر أسماء أو تعريض أحد للخطر.","Records what was witnessed without publishing names or putting anyone at risk."],["يساعد في لمّ شمل الأسر ويبحث عن طريق آمن للمساعدة.","Helps reunite families and finds safe ways to seek assistance."]]}
];
const civics={
ar:{title:"سؤال الدولة: جيش واحد أم جيوش متوازية؟",body:"يسأل الطفل: إذا حملت كل جماعة سلاحها واحتفظت بقيادتها وقرارها، فمن يحمي المواطن عندما تختلف تلك القيادات؟ وهل نعيد إنتاج أسباب الحرب نفسها؟

اتفاق جوبا للسلام نصّ على هدف جيش وطني مهني واحد، وعلى ترتيبات للدمج والتسريح وإعادة الإدماج. لكن التنفيذ تعثر، كما وثّقت تقارير أممية. هذا لا يعني أن كل مقاتل أو حركة واحدة؛ بل يعني أن وجود سلاسل قيادة مسلحة متنافسة يخلق خطراً على المدنيين وعلى وحدة الدولة.

الحل الذي تناقشه الحكاية ليس إقصاء مناطق أو حركات، ولا دمجاً شكلياً بلا تدقيق: وقف نار قابل للمراقبة، حصر السلاح، تدقيق فردي مهني وحقوقي، تدريب موحد، قيادة وطنية واحدة خاضعة للقانون والرقابة المدنية، ومسارات DDR للذين لا تنطبق عليهم شروط الخدمة. العدالة والمحاسبة لا تسقطان بالاندماج.

يسأل الطفل أيضاً عن جماعات تقاتل إلى جانب الجيش أو تعمل في تشكيلات ذات ولاءات خاصة. تذكر التقارير الأممية كتيبة البراء بن مالك ضمن جماعات مسلحة موالية للجيش، وتوثق اتهامات وانتهاكات منسوبة إلى أفراد وتشكيلات. وفي 2026 أدرجتها الولايات المتحدة ضمن تصنيفاتها الإرهابية؛ وهذا تصنيف صادر عن حكومة بعينها، وليس حكماً قضائياً عالمياً. لا يجوز تعميم مسؤولية أي تشكيل على سكان منطقة أو دين أو تيار بأكمله. أما أسماء مثل «الدراعون» فتحتاج تحديداً موثقاً قبل نسبة أفعال أو تصنيفات إليها.",en:{title:"The State Question: One Army or Parallel Armies?",body:"The child asks: if every group keeps its own weapons, command and decisions, who protects civilians when those commanders disagree? Would we reproduce the very conditions that helped bring another war?

The Juba Peace Agreement set out the goal of one professional national army and security arrangements for integration, disarmament, demobilisation and reintegration. UN reporting documented delays and fragmentation in implementation. This does not make every fighter or movement identical; it means competing armed chains of command create risks for civilians and the state.

The path explored here is neither exclusion of regions and movements nor a paper merger without vetting: a monitored ceasefire, weapons registration, individual professional and human-rights vetting, common training, one national chain of command under law and civilian oversight, and DDR pathways for those who do not qualify for service. Integration must not erase justice or accountability.

The child also asks about armed formations fighting alongside the army or retaining distinct loyalties. UN reporting identifies the Al-Baraa Bin Malik Battalion among SAF-aligned armed groups and documents allegations and abuses attributed to members and formations. In 2026, the United States designated it under its terrorism framework. That is a designation by one government, not a universal court judgment. Responsibility must never be generalised to an entire region, religion or political current. Names such as “Al-Dira'oon” require a clearly identified, reliable source before claims or designations are attached to them."}
};
function close(){const p=$("#pn");if(p)p.classList.remove("on");}
function openHome(){
const l=lang(),p=$("#pn");if(!p)return;
let h='<div class="asudan"><h3>🇸🇩 '+t("كل السودان… حكايات متعددة وكرامة واحدة","All Sudan… Many Stories, One Dignity")+'</h3><p>'+t("اختر بداية جديدة من إقليم مختلف. هذه حكايات إضافية مستقلة، ولا تستبدل رحلة دارفور الأصلية.","Choose a new beginning from another region. These are additional, independent stories; they do not replace the original Darfur journey.")+'</p>';
stories.forEach((s,i)=>{h+='<button class="btn" type="button" data-story="'+s.id+'">'+s.icon+' '+(l==="en"?s.en:s.ar)+'</button>';});
h+='<button class="btn" type="button" data-civics="1">⚖️ '+(l==="en"?civics.en.title:civics.ar.title)+'</button><p class="as-note">'+t("لا توجد معاناة واحدة تمثل السودان كله. الاختلاف في التجربة لا ينتقص من كرامة أي إنسان.","No single experience represents all of Sudan. Different experiences never diminish anyone's dignity.")+'</p><button class="btn pri" type="button" onclick="document.getElementById(\'pn\').classList.remove(\'on\')">'+t("إغلاق","Close")+'</button></div>';
p.innerHTML=h;p.classList.add("on");
p.querySelectorAll("[data-story]").forEach(b=>b.addEventListener("click",()=>openStory(b.dataset.story)));
const c=p.querySelector("[data-civics]");if(c)c.addEventListener("click",openCivics);
}
function openStory(id){
const s=stories.find(x=>x.id===id);if(!s)return;
const l=lang(),p=$("#pn");let h='<div class="asudan"><h3>'+s.icon+' '+(l==="en"?s.en:s.ar)+'</h3><p>'+ (l==="en"?s.leadEn:s.leadAr)+'</p><h4>'+t("ماذا تختار؟","What do you choose?")+'</h4>';
s.choices.forEach((c,i)=>h+='<button class="btn" type="button" data-choice="'+i+'">'+(l==="en"?c[1]:c[0])+'</button>');
h+='<div class="as-note">'+t("لا يوجد اختيار يحل أزمة بلد وحده. الاختيارات تفتح أسئلة عن التضامن والحق في الخدمات والكرامة.","No single choice can solve a country's crisis. These choices open questions about solidarity, services and dignity.")+'</div><button class="btn" type="button" onclick="window.openAllSudanScenarios()">'+t("عودة إلى المسارات","Back to stories")+'</button></div>';
p.innerHTML=h;p.classList.add("on");
p.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>finish(id,Number(b.dataset.choice))));
}
function finish(id,n){
const s=stories.find(x=>x.id===id),l=lang();let saved=[];
try{saved=JSON.parse(localStorage.getItem(KEY)||"[]");if(!Array.isArray(saved))saved=[];}catch(_){}
saved.unshift({id,choice:n,at:new Date().toISOString()});saved=saved.slice(0,30);
try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(_){}
const p=$("#pn");p.innerHTML='<div class="asudan"><h3>'+t("خطوة صغيرة في حكاية أكبر","A Small Step in a Larger Story")+'</h3><p>'+t("اخترتَ: ","You chose: ")+(l==="en"?s.choices[n][1]:s.choices[n][0])+'</p><p>'+t("السودان لا يُبنى بإلغاء اختلاف الناس، بل بضمان حقوقهم المتساوية، ومؤسسات تخدمهم جميعاً.","Sudan is not built by erasing differences, but by guaranteeing equal rights and institutions that serve everyone.")+'</p><button class="btn" onclick="window.openAllSudanScenarios()">'+t("استكشف مساراً آخر","Explore another story")+'</button><button class="btn pri" onclick="document.getElementById(\'pn\').classList.remove(\'on\')">'+t("إغلاق","Close")+'</button></div>';
}
function openCivics(){
const l=lang(),d=civics[l],p=$("#pn");
p.innerHTML='<div class="asudan"><h3>⚖️ '+d.title+'</h3><p style="white-space:pre-line">'+d.body+'</p><h4>'+t("مصادر للقراءة والتحقق","Sources for further reading")+'</h4><ul><li><a target="_blank" rel="noopener" href="https://peacemaker.un.org/sites/default/files/document/files/2024/05/juba20agreement20for20peace20in20sudan.pdf">Juba Peace Agreement — UN Peacemaker</a></li><li><a target="_blank" rel="noopener" href="https://www.un.org/sexualviolenceinconflict/wp-content/uploads/2025/02/report/auto-draft/A-HRC-57-CRP-6-en.pdf">UN Fact-Finding Mission — A/HRC/57/CRP.6</a></li><li><a target="_blank" rel="noopener" href="https://ofac.treasury.gov/recent-actions/20260309">US Treasury / OFAC designation notice, 9 March 2026</a></li><li><a target="_blank" rel="noopener" href="https://www.hrw.org/news/2026/04/07/sudan-arbitrary-detention-by-army-security-forces">Human Rights Watch — arbitrary detention, 7 April 2026</a></li></ul><p class="as-note">'+t("هذه مادة توعوية داخل عمل خيالي؛ تميّز بين النص القانوني والتقارير والاتهامات والتصنيفات الصادرة عن حكومات.","This is educational material within fiction; it distinguishes legal texts, reporting, allegations and government designations.")+'</p><button class="btn" onclick="window.openAllSudanScenarios()">'+t("عودة","Back")+'</button><button class="btn pri" onclick="document.getElementById(\'pn\').classList.remove(\'on\')">'+t("إغلاق","Close")+'</button></div>';
p.classList.add("on");
}
const style=document.createElement("style");style.textContent=".asudan{line-height:1.85;color:var(--fg)}.asudan h3{font-size:1.18rem;margin:0 0 12px}.asudan h4{margin:14px 0 6px}.asudan p{white-space:normal;margin:10px 0}.asudan .as-note{padding:12px;border-inline-start:4px solid var(--ac);background:var(--card);border-radius:8px;color:var(--mut);font-size:.88em}.asudan a{color:var(--ac);text-decoration:underline;overflow-wrap:anywhere}.asudan li{margin:8px 0}";document.head.appendChild(style);
const previous=window.showMenu;
if(typeof previous==="function"){window.showMenu=function(){const r=previous.apply(this,arguments);try{const app=$("#app");if(app&&!app.querySelector("[data-all-sudan]")){const btn=Array.from(app.querySelectorAll("button")).find(b=>/الإعدادات|Settings/.test(b.textContent||""));if(btn){const wrap=document.createElement("div");wrap.dataset.allSudan="1";const b=document.createElement("button");b.className="btn";b.type="button";b.textContent="🇸🇩 "+t("حكايات من كل السودان","Stories from All Sudan");b.addEventListener("click",openHome);wrap.appendChild(b);btn.insertAdjacentElement("afterend",wrap);}}}catch(e){console.error("All Sudan menu:",e)}return r;};}
window.openAllSudanScenarios=openHome;
console.log("ALNAJAT All Sudan scenarios ready — additive layer");
})();