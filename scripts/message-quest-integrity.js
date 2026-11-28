#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"alnajat-message-quest.js"),"utf8");
const fail=m=>{console.error("✖ MESSAGE QUEST LOCK: "+m);process.exitCode=1;};
const pass=m=>console.log("✓ MESSAGE QUEST LOCK: "+m);
function extractObject(marker){
 const at=source.indexOf(marker);
 if(at<0)throw new Error("Missing marker: "+marker);
 const start=source.indexOf("{",at);
 let depth=0,quote=null,escaped=false;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(quote){if(escaped){escaped=false;continue;}if(ch==="\\"){escaped=true;continue;}if(ch===quote)quote=null;continue;}
  if(ch==="'"||ch==='"'||ch==="\x60"){quote=ch;continue;}
  if(ch==="{")depth++;
  else if(ch==="}"&&--depth===0)return source.slice(start,i+1);
 }
 throw new Error("Unclosed object after "+marker);
}
function fingerprint(value){
 let hash=2166136261;
 for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
 return (hash>>>0).toString(16).padStart(8,"0");
}
try{
 new Function(source);
 pass("Puzzle module parses as JavaScript");
 const cardsSource=extractObject("const cards =");
 const endingsSource=extractObject("const endings =");
 const orderSource=(source.match(/const EXPECTED_ORDER = \\[[^\\]]+\\];/)||[])[0];
 if(!orderSource)fail("Expected puzzle order is missing");
 const actual=fingerprint(cardsSource+"\\n"+endingsSource+"\\n"+orderSource);
 if(actual!=="0155623f")fail("Puzzle story lock mismatch: expected 0155623f, got "+actual);
 else pass("All bilingual clue cards, outcomes and puzzle order match the reviewed Story Lock");
 const cards=new Function("return ("+cardsSource+")")();
 const endings=new Function("return ("+endingsSource+")")();
 if(Object.keys(cards).sort().join(",")!=="listen,protect,share,verify")fail("Expected four message fragments");
 if(Object.keys(endings).sort().join(",")!=="consent,private,repair")fail("Expected three distinct outcomes");
 for(const [id,card] of Object.entries(cards)){
  for(const field of ["title","text","clue"]){
   if(!Array.isArray(card[field])||card[field].length!==2||!card[field].every(x=>typeof x==="string"&&x.trim()))fail(id+" has incomplete bilingual "+field);
  }
 }
 for(const [id,ending] of Object.entries(endings)){
  for(const field of ["title","text"]){
   if(!Array.isArray(ending[field])||ending[field].length!==2||!ending[field].every(x=>typeof x==="string"&&x.trim()))fail(id+" has incomplete bilingual "+field);
  }
 }
 if(!source.includes('const KEY = "alnajat_message_quest_v1"')||!source.includes('const ARCHIVE_KEY = "alnajat_message_quest_archive_v1"'))fail("Independent local save/archive keys changed");
 if(/localStorage\\.(clear|removeItem)\\s*\\(/.test(source))fail("Quest must not clear or delete existing player saves");
 if(!source.includes("No player data or analytics are collected")||!source.includes("لا توجد بيانات لاعبين أو تحليلات"))fail("No-analytics disclosure is missing");
 const page=fs.readFileSync(path.join(root,"index.html"),"utf8");
 const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
 if(!page.includes('alnajat-message-quest.js?v=1')||!sw.includes("'./alnajat-message-quest.js?v=1'"))fail("Puzzle script and offline shell versions differ");
 if(!sw.includes("const VERSION = 'najat-v44'"))fail("Puzzle release requires Service Worker cache najat-v44");
 for(const marker of ["aria-labelledby","bindDialogKeys","event.key","Escape","event.shiftKey","returnFocus"])if(!source.includes(marker))fail("Accessible dialog behavior missing: "+marker);
 if(!process.exitCode)pass("Bilingual puzzle, isolated storage, privacy disclosure, accessible dialog and offline cache are consistent");
}catch(error){fail(error.stack||String(error));}
if(process.exitCode)process.exit(process.exitCode);
console.log("\\nALNAJAT message quest integrity checks passed.");
