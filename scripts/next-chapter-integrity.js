#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const file=path.resolve(__dirname,"..","alnajat-next-chapter.js");
const source=fs.readFileSync(file,"utf8");
const fail=m=>{console.error("✖ "+m);process.exitCode=1;};
const pass=m=>console.log("✓ "+m);
function extractObject(marker){
  const at=source.indexOf(marker);
  if(at<0)throw new Error("Missing "+marker);
  const start=source.indexOf("{",at);
  let depth=0,quote=null,escape=false;
  for(let i=start;i<source.length;i++){
    const c=source[i];
    if(quote){if(escape){escape=false;continue;}if(c==="\\"){escape=true;continue;}if(c===quote)quote=null;continue;}
    if(c==="'"||c==='"'||c==="\x60"){quote=c;continue;}
    if(c==="{")depth++;
    if(c==="}"&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error("Unclosed object after "+marker);
}
try{
  new Function(source);
  pass("Next Chapter JavaScript syntax is valid");
  const scenes=new Function("return ("+extractObject("const scenes =")+")")();
  const endings=new Function("return ("+extractObject("const endings={")+")")();
  const ids=Object.keys(scenes);
  if(ids.length!==18)fail("Expected 18 authored story scenes, found "+ids.length);
  else pass("All "+ids.length+" authored scenes are present");
  const edges=[];
  for(const [id,scene] of Object.entries(scenes)){
    if(!Array.isArray(scene.title)||scene.title.length!==2||!scene.title.every(x=>typeof x==="string"&&x.length>0))fail("Bilingual title missing: "+id);
    if(!Array.isArray(scene.text)||scene.text.length!==2||!scene.text.every(x=>typeof x==="string"&&x.length>0))fail("Bilingual narrative missing: "+id);
    if(!Array.isArray(scene.choices)||scene.choices.length<2)fail("Insufficient choices: "+id);
    for(const choice of scene.choices||[]){
      if(!Array.isArray(choice.label)||choice.label.length!==2||!choice.label.every(x=>typeof x==="string"&&x.length>0))fail("Arabic/English choice parity failed: "+id);
      if(typeof choice.to!=="string")fail("Choice target is not literal text: "+id);
      else if(choice.to!=="ending"&&!scenes[choice.to])fail("Choice points to missing scene: "+id+" -> "+choice.to);
      else edges.push([id,choice.to]);
    }
  }
  const reached=new Set(["prologue"]),queue=["prologue"];
  while(queue.length){const n=queue.shift();for(const [from,to] of edges)if(from===n&&to!=="ending"&&!reached.has(to)){reached.add(to);queue.push(to);}}
  const unreachable=ids.filter(id=>!reached.has(id));
  if(unreachable.length)fail("Unreachable expansion scenes: "+unreachable.join(", "));
  else pass("Every expansion scene is reachable from its prologue");
  const routeIds=["north","east","south","centre"];
  const followups=["north_record","north_team","east_rules","east_dialogue","south_verify","south_play","centre_record","centre_coop"];
  if(!followups.every(id=>scenes[id]))fail("One or more branch-specific follow-up scenes are missing");
  else pass("All eight choice-specific regional follow-up scenes exist");
  if(!routeIds.every(id=>scenes[id]))fail("One or more regional routes are missing");
  else pass("North, East, South, and Centre/Gezira/Khartoum routes exist");
  if(!Object.keys(endings).join(",").includes("accountable")||Object.keys(endings).length!==4)fail("Expected four distinct additional endings");
  else pass("Four distinct additional endings are defined");
  if(!source.includes('const KEY = "alnajat_next_chapter_v1"')||!source.includes('const archiveKey="alnajat_next_chapter_archive_v1"')||!source.includes('const PREF_KEY="alnajat_next_chapter_prefs_v1"'))fail("Expansion progress is not stored in isolated keys");
  else pass("Expansion save and archive use independent local keys");
  if(/localStorage\.(clear|removeItem)\s*\(/.test(source)||/\bS\s*\[[^\]]+\]\s*=/.test(source))fail("Expansion must not clear saves or mutate canonical story data");
  else pass("No canonical story mutation or broad save deletion found");
  if(!source.includes("collects no player analytics")||!source.includes("لا يجمع الفصل بيانات أو تحليلات عن اللاعبين"))fail("Privacy disclosure is missing");
  const page=fs.readFileSync(path.resolve(__dirname,"..","index.html"),"utf8");
  const sw=fs.readFileSync(path.resolve(__dirname,"..","sw.js"),"utf8");
  if(!page.includes('alnajat-next-chapter.js?v=3')||!sw.includes("'./alnajat-next-chapter.js?v=3'"))fail("Next Chapter runtime and offline shell versions differ");
  const cacheVersion=(sw.match(/const VERSION\\s*=\\s*'([^']+)'/)||[])[1];
  if(cacheVersion!=="najat-v43")fail("Next Chapter accessibility update requires the najat-v43 cache");
  for(const marker of ["aria-labelledby","bindDialogKeys","event.key","Escape","event.shiftKey","dialogReturnFocus"])if(!source.includes(marker))fail("Accessible modal behavior is missing: "+marker);
  else pass("Next Chapter modal includes labelled dialog, Escape, focus trapping and focus restoration");

  else pass("No-player-analytics disclosure is present");
  if(process.exitCode)process.exit(process.exitCode);
  console.log("\nNext Chapter integrity checks passed.");
}catch(e){fail(e.stack||String(e));}
