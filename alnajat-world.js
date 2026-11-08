/* ALNAJAT 3.0 — interactive Sudan story map. Additive only; story data is untouched. */
(function(){
"use strict";
if(window.__ALNAJAT_WORLD__)return;window.__ALNAJAT_WORLD__=true;
const cities=[
{id:"alfashir",ar:"الفاشر",en:"El Fasher",lat:13.6279,lng:25.3494,scenes:["d0","fs1","fs2","fs2b","fs3","sd2025","sd2026"],noteAr:"دارفور — موطن البدايات ومحطة من محطات الذاكرة",noteEn:"Darfur — birthplace and a chapter of memory"},
{id:"geneina",ar:"الجنينة",en:"El Geneina",lat:13.4526,lng:22.4473,scenes:["sd2023b"],noteAr:"غرب دارفور — فصل من فصول النزوح",noteEn:"West Darfur — a chapter of displacement"},
{id:"atbara",ar:"عطبرة",en:"Atbara",lat:17.7022,lng:33.9864,scenes:["sd2018"],noteAr:"انطلقت منها احتجاجات ديسمبر 2018",noteEn:"The December 2018 protests began here"},
{id:"khartoum",ar:"الخرطوم",en:"Khartoum",lat:15.5007,lng:32.5599,scenes:["m1","r1","r1b","r2","q1","q1b","w1","v1","sd2013","sd2019","sd2021","sd2022","sd2023","sd2026"],noteAr:"العاصمة — الحياة والثورة والحرب",noteEn:"The capital — life, revolution and war"},
{id:"omdurman",ar:"أم درمان",en:"Omdurman",lat:15.6445,lng:32.4777,scenes:["u1","sd2019"],noteAr:"مدينة على الضفة الغربية للنيل",noteEn:"A city on the western bank of the Nile"},
{id:"wadmadani",ar:"ود مدني",en:"Wad Madani",lat:14.4012,lng:33.5199,scenes:["k1","sd2023c","sd2025"],noteAr:"الجزيرة — محطة استقبال ونزوح",noteEn:"Al Jazirah — refuge and displacement"},
{id:"gedaref",ar:"القضارف",en:"Gedaref",lat:14.0349,lng:35.3834,scenes:["jb","sd2024"],noteAr:"شرق السودان — محطة في البحث عن الأمان",noteEn:"Eastern Sudan — a stop in the search for safety"},
{id:"portsudan",ar:"بورتسودان",en:"Port Sudan",lat:19.6158,lng:37.2164,scenes:[],noteAr:"ساحل البحر الأحمر",noteEn:"Red Sea coast"}
];
let visited=new Set();try{visited=new Set(JSON.parse(localStorage.getItem("alnajat_world_visited")||"[]"));}catch(e){}
const css=[
"#alnajat-world-launch{display:inline-block;margin:8px 4px;padding:11px 15px;border:1px solid #c9a86a88;border-radius:12px;background:linear-gradient(135deg,#29221b,#171923);color:#f3dfad;font:600 14px system-ui;cursor:pointer}",
"#alnajat-world-overlay{position:fixed;inset:0;z-index:99970;display:none;align-items:center;justify-content:center;background:#080b10ed;backdrop-filter:blur(12px);padding:12px}",
"#alnajat-world-overlay.open{display:flex}",
"#alnajat-world-card{width:min(100%,980px);max-height:96vh;display:flex;flex-direction:column;background:#111722;color:#f4f0e8;border:1px solid #c6a86a55;border-radius:18px;overflow:hidden}",
"#alnajat-world-head{display:flex;align-items:center;justify-content:space-between;padding:14px 17px;background:linear-gradient(110deg,#251d18,#111722);border-bottom:1px solid #c6a86a44}",
"#alnajat-world-head h2{margin:0;font:700 18px system-ui;color:#ead5a4}#alnajat-world-head p{margin:3px 0 0;font:12px system-ui;color:#aeb7c3}",
"#alnajat-world-close{border:1px solid #ffffff33;background:#ffffff0c;color:#fff;border-radius:9px;padding:8px 12px;font:inherit}",
"#alnajat-world-map{height:min(62vh,560px);min-height:310px;background:#17212b}",
"#alnajat-world-foot{padding:10px 15px;font:12px/1.8 system-ui;color:#aeb7c3;border-top:1px solid #ffffff17}",
"#alnajat-world-map .leaflet-popup-content-wrapper,#alnajat-world-map .leaflet-popup-tip{background:#17202b;color:#f5f0e7}",
"#alnajat-world-map .leaflet-popup-content{font:13px/1.7 system-ui;min-width:145px}#alnajat-world-map .leaflet-popup-content strong{color:#e6c987}",
"#alnajat-world-map .leaflet-tile{filter:saturate(.72) brightness(.82) sepia(.12)}",
"#alnajat-world-map .alnajat-pin{width:15px;height:15px;border:2px solid #f3dfad;border-radius:50%;background:#a33c39;box-shadow:0 0 0 5px #a33c3940,0 0 18px #d6ad63aa}",
"#alnajat-world-map .alnajat-pin.unseen{background:#586474;border-color:#b8c2cf;box-shadow:0 0 0 4px #58647444}",
"#app .art{filter:saturate(.9) contrast(1.06);border-radius:14px;box-shadow:0 12px 34px #0004}",
"@media(max-width:600px){#alnajat-world-card{max-height:98vh}#alnajat-world-map{height:58vh;min-height:290px}}",
"@media(prefers-reduced-motion:reduce){#app .art{transition:none!important}}"
].join("");
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
const overlay=document.createElement("div");overlay.id="alnajat-world-overlay";
overlay.innerHTML='<section id="alnajat-world-card" role="dialog" aria-modal="true" aria-labelledby="alnajat-world-title"><header id="alnajat-world-head"><div><h2 id="alnajat-world-title">خريطة محطات الحكاية</h2><p id="alnajat-world-sub">السودان — ذاكرة المكان والإنسان</p></div><button id="alnajat-world-close" type="button">إغلاق ✕</button></header><div id="alnajat-world-map" aria-label="خريطة تفاعلية للمدن السودانية"></div><footer id="alnajat-world-foot">الخريطة توثيق سردي للمدن، وليست خريطة ميدانية أو بياناً عن السيطرة أو السلامة الحالية. بيانات الخرائط © OpenStreetMap.</footer></section>';
document.body.appendChild(overlay);
let map=null,leafletLoading=null,markers=[];
function en(){return document.documentElement.lang==="en"||localStorage.getItem("najat_lang")==="en";}
function syncLang(){const x=en();document.getElementById("alnajat-world-title").textContent=x?"The Story's Places":"خريطة محطات الحكاية";document.getElementById("alnajat-world-sub").textContent=x?"Sudan — memory of place and people":"السودان — ذاكرة المكان والإنسان";document.getElementById("alnajat-world-close").textContent=x?"Close ✕":"إغلاق ✕";document.getElementById("alnajat-world-foot").textContent=x?"A narrative map of cities, not a field map or a statement about current control or safety. Map data © OpenStreetMap.":"الخريطة توثيق سردي للمدن، وليست خريطة ميدانية أو بياناً عن السيطرة أو السلامة الحالية. بيانات الخرائط © OpenStreetMap.";}
function loadMapLib(){if(window.L)return Promise.resolve();if(leafletLoading)return leafletLoading;leafletLoading=new Promise((resolve,reject)=>{if(!document.getElementById("alnajat-leaflet-css")){const l=document.createElement("link");l.id="alnajat-leaflet-css";l.rel="stylesheet";l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(l);}const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=resolve;s.onerror=()=>reject(Error("Leaflet unavailable"));document.head.appendChild(s);});return leafletLoading;}
function icon(reached){return L.divIcon({className:"",html:'<div class="alnajat-pin '+(reached?"":"unseen")+'"></div>',iconSize:[20,20],iconAnchor:[10,10]});}
function draw(){if(!map){map=L.map("alnajat-world-map",{scrollWheelZoom:false}).setView([15.4,30.8],5);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:12,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);}markers.forEach(m=>m.remove());markers=[];cities.forEach(c=>{const reached=visited.has(c.id),name=en()?c.en:c.ar,desc=en()?c.noteEn:c.noteAr;const m=L.marker([c.lat,c.lng],{icon:icon(reached)}).addTo(map);m.bindPopup("<strong>"+name+"</strong><br>"+desc+"<br><small>"+(reached?(en()?"Reached in your journey":"ظهرت في رحلتك"):(en()?"Story location":"موقع ضمن الحكاية"))+"</small>");markers.push(m);});setTimeout(()=>map.invalidateSize(),120);}
function open(){syncLang();overlay.classList.add("open");document.body.style.overflow="hidden";loadMapLib().then(draw).catch(()=>{document.getElementById("alnajat-world-map").innerHTML='<div style="padding:24px;color:white;text-align:center;line-height:2">تعذر تحميل الخريطة. تحقق من اتصال الإنترنت ثم أعد فتحها.</div>';});document.getElementById("alnajat-world-close").focus();}
function close(){overlay.classList.remove("open");document.body.style.overflow="";}
document.getElementById("alnajat-world-close").addEventListener("click",close);overlay.addEventListener("click",e=>{if(e.target===overlay)close();});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&overlay.classList.contains("open"))close();});
function addButton(){const app=document.getElementById("app");if(!app||app.querySelector("#alnajat-world-launch"))return;const b=document.createElement("button");b.id="alnajat-world-launch";b.type="button";b.textContent=en()?"🗺️ Sudan story map":"🗺️ خريطة السودان";b.onclick=open;const setting=Array.from(app.querySelectorAll("button")).find(x=>/الإعدادات|Settings/.test(x.textContent||""));if(setting)setting.insertAdjacentElement("afterend",b);else app.appendChild(b);}
const oldMenu=window.showMenu;if(typeof oldMenu==="function")window.showMenu=function(){const r=oldMenu.apply(this,arguments);setTimeout(addButton,0);return r;};
const oldRender=window.renderNode;if(typeof oldRender==="function")window.renderNode=function(nid){const r=oldRender.apply(this,arguments);const c=cities.find(x=>x.scenes.includes(nid));if(c){visited.add(c.id);try{localStorage.setItem("alnajat_world_visited",JSON.stringify(Array.from(visited)));}catch(e){}}return r;};
setTimeout(addButton,350);window.openAlnajatSudanMap=open;console.info("ALNAJAT 3.0 geographic story map loaded");
})();