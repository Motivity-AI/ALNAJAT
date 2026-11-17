#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"alnajat-all-sudan.js"),"utf8");
const lock=JSON.parse(fs.readFileSync(path.join(root,"all-sudan-story-lock.json"),"utf8"));
const fail=m=>{console.error("✖ ALL-SUDAN STORY LOCK: "+m);process.exitCode=1;};
const pass=m=>console.log("✓ ALL-SUDAN STORY LOCK: "+m);
function fingerprint(value){let h=0xcbf29ce484222325n;for(let i=0;i<value.length;i++){h^=BigInt(value.charCodeAt(i));h=BigInt.asUintN(64,h*0x100000001b3n);}return h.toString(16).padStart(16,"0");}
try{
 if(lock.schema!=="alnajat-all-sudan-lock-v1")throw new Error("Unknown lock schema");
 if(fingerprint(source)!==lock.expectedFingerprint)fail("Regional story, choices, outcomes or translations changed. Review manually; never auto-refresh the lock.");else pass("All-Sudan source matches its separate approved fingerprint");
 const ids=[...source.matchAll(/\{id:"(north|east|south|center)"/g)].map(m=>m[1]);
 if(ids.join(",")!==lock.routeIds.join(","))fail("Regional route IDs/order do not match the lock");else pass("Four regional route IDs are present and stable");
 for(const id of lock.routeIds){const start=source.indexOf('{id:"'+id+'"');const next=source.indexOf('{id:"',start+5);const block=source.slice(start,next<0?source.indexOf("];",start):next);for(const field of ["ar:","en:","leadAr:","leadEn:","choices:"])if(!block.includes(field))fail(id+" is missing "+field);}
 for(const id of lock.routeIds)if(!source.includes(id+":"))fail("Missing independent consequence for "+id);
 if(!source.includes('const KEY="alnajat_all_sudan_v1"'))fail("Independent regional save key changed");
 if(!source.includes('en:"From the South of Sudan: The Road Home"')||source.includes("From Southern Sudan"))fail("English South route label is ambiguous or incorrect");
 const page=fs.readFileSync(path.join(root,"index.html"),"utf8");const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
 if(!page.includes('alnajat-all-sudan.js?v=2')||!sw.includes("'./alnajat-all-sudan.js?v=2'"))fail("All-Sudan script version differs between page and offline shell");
 const version=(sw.match(/const VERSION\s*=\s*'([^']+)'/)||[])[1];if(version!=="najat-v38")fail("Expected cache version najat-v38");
 if(!sw.includes("e.waitUntil(networkPromise.then(() => undefined))"))fail("Background cache refresh is not protected by waitUntil");
 const sources=fs.readFileSync(path.join(root,"SOURCES.md"),"utf8");for(const marker of ["SRC-014","SRC-015","SRC-016","SRC-017","مشاهد روائية مركبة"])if(!sources.includes(marker))fail("SOURCES.md missing "+marker);
 if(!process.exitCode)pass("Bilingual routes, outcomes, independent saves, source register and offline shell are consistent");
}catch(error){fail(error.stack||String(error));}
if(process.exitCode)process.exit(process.exitCode);
console.log("\nALNAJAT All-Sudan integrity checks passed.");
