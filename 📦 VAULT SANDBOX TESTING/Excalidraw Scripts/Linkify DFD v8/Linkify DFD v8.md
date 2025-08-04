---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 5:29 pm
date modified: Monday, August 4th 2025, 5:45 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD — v0.8.1  (2025-08-04)
 ******************************************************************/

const DEBUG  = true;        // true ⇒ popup + console traces
const LOG_LINKS = true;     // console.log every wikilink

const REQUIRE_EXPLICIT_MARKER = false;
const DB_PLACEMENT    = "flat";     // "db_folder" | "flat" | "diagram_named"
const DB_FOLDER_NAME  = "DFD Objects Database";
const DB_PARENT_PATH  = "";
const ELEMENT_LINK_ALIAS_MODE = "basename";   // "none" | "basename" | "fm_name"
const WRITE_INLINE_FIELDS     = false;

/* fallback sub-folders if no DFD__SUBFOLDER override in config notes */
const DEFAULT_SUBFOLDERS = { asset:"Assets", entity:"Entities", transfer:"Transfers" };

/* ---------- tiny helpers ---------- */
const nowISO=()=>new Date().toISOString();
const exists=p=>!!app.vault.getAbstractFileByPath(p);
const createFile=(p,c)=>app.vault.create(p,c);
const readFile =p=>app.vault.read(app.vault.getAbstractFileByPath(p));
const writeFile=(p,c)=>app.vault.modify(app.vault.getAbstractFileByPath(p),c);
const bn=p=>p.split("/").pop().replace(/\.md$/i,"");
const slug=s=>s.replace(/[\\/#^|?%*:<>"]/g," ").trim().replace(/\s+/g,"-").toLowerCase()||"unnamed";
const rnd4=()=>Math.random().toString(36).slice(2,6);
const dbg=m=>DEBUG && new Notice(m,4e3);
const log=m=>LOG_LINKS&&console.log(m);

/* shortest wikilink + alias */
const shortest=(p,from)=>app.metadataCache.fileToLinktext(app.vault.getAbstractFileByPath(p),from);
const alias=p=>{
  if(ELEMENT_LINK_ALIAS_MODE==="basename") return bn(p);
  if(ELEMENT_LINK_ALIAS_MODE==="fm_name"){
    const n=app.metadataCache.getCache(p)?.frontmatter?.name;
    return n||bn(p);
  }
  return null;
};
const wiki=(p,from)=>{const w=alias(p)?`[[${shortest(p,from)}|${alias(p)}]]`:`[[${shortest(p,from)}]]`; log(w); return w;};

/* ensure folder */
async function ensureFolder(fp){
  if(!fp) return;
  const parts=fp.split("/").filter(Boolean); let cur="";
  for(const part of parts){ cur=cur?`${cur}/${part}`:part;
    if(!exists(cur)) try{await app.vault.createFolder(cur);}catch{}
  }
}

/* front-matter helpers */
async function updFM(fp,fn){ const f=app.vault.getAbstractFileByPath(fp); if(f) await app.fileManager.processFrontMatter(f,fn); }
async function pushArr(fp,k,v){await updFM(fp,fm=>{const a=Array.isArray(fm[k])?fm[k]:(fm[k]?[fm[k]]:[]); if(!a.includes(v))a.push(v); fm[k]=a;});}
async function dvInline(fp,field,v){
  if(!WRITE_INLINE_FIELDS) return;
  const txt=await readFile(fp); const ln=`${field}:: ${v}`;
  if(!txt.includes(ln)) await writeFile(fp,(txt.endsWith("\n")?txt:txt+"\n")+ln+"\n");
}

/* -------- environment -------- */
ea.setView("active"); const view=ea.targetView;
if(!view?.file){ new Notice("Open an Excalidraw file first."); return; }

const DRAW_DIR=view.file.parent.path;
const ROOT=(DB_PLACEMENT==="flat")?DRAW_DIR
          :(DB_PLACEMENT==="diagram_named")?`${DRAW_DIR}/${bn(view.file.path)}`
          :`${DRAW_DIR}/${DB_FOLDER_NAME}`;
const folder=k=>`${ROOT}/${DEFAULT_SUBFOLDERS[k]}`;

/* -------- load “DFD Object Configuration” notes -------- */
const CFG_DIR="DFD Object Configuration";
function mdTree(dir){const r=app.vault.getAbstractFileByPath(dir); if(!r) return []; const o=[];(function w(f){f.children?f.children.forEach(w):f.extension==="md"&&o.push(f);} )(r);return o;}
const CFG=new Map();
for(const f of mdTree(CFG_DIR)){
  const c=app.metadataCache.getFileCache(f), fm=c?.frontmatter||{};
  const kind=(fm["DFD__KIND"]||"").toLowerCase(); if(!["asset","entity","transfer"].includes(kind)) continue;
  const marker=(fm["DFD__MARKER"]||kind).toLowerCase();
  const sub= fm["DFD__SUBFOLDER"]||DEFAULT_SUBFOLDERS[kind];
  const defs={}; for(const[k,v]of Object.entries(fm)) if(!k.startsWith("DFD__")) defs[k]=v;
  const bodyPos=c?.frontmatterPosition;
  const body=bodyPos?(await app.vault.read(f)).slice(bodyPos.end.offset).trim():"";
  CFG.set(marker,{kind,defaults:defs,subfolder:sub,body});
}
function cfg(kind){return CFG.get(kind)||{kind,defaults:{},subfolder:DEFAULT_SUBFOLDERS[kind],body:""};}

/* -------- parse helpers -------- */
const MARK=/^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
function parseMark(s){const m=s?.trim().match(MARK); return m?{k:m[1].toLowerCase(),n:(m[2]||"").trim()||null}:null;}
const els=ea.getViewElements?ea.getViewElements():ea.getElements();
const byId=Object.fromEntries(els.map(e=>[e.id,e]));
const grp=e=>{const g=e.groupIds?.at(-1); return g?els.filter(x=>x.groupIds?.includes(g)):[e];};
const firstTxt=g=>g.find(e=>e.type==="text"&&(e.text||"").trim())?.text.trim()||"";
const arrowish=e=>e.type==="arrow"||(e.type==="line"&&(e.endArrowhead||e.startArrowhead));
const nodeShapes=new Set(["rectangle","ellipse","diamond","image","frame"]);

function classify(el){
  const cd=el.customData?.dfd||el.customData?.DFD; if(cd?.kind) return {k:cd.kind,n:null};
  const m=parseMark(el.link)||parseMark(firstTxt(grp(el))); if(m) return m;
  if(REQUIRE_EXPLICIT_MARKER) return null;
  if(arrowish(el)) return {k:"transfer",n:null};
  if(nodeShapes.has(el.type)) return {k:"asset",n:null};
  return null;
}

/* -------- create / ensure node -------- */
async function makeNode(kind,name,shape){
  const c=cfg(kind); await ensureFolder(folder(kind));
  let base = REQUIRE_EXPLICIT_MARKER||!name ? `${kind}-${shape}-${rnd4()}` : slug(name);
  let path=`${folder(kind)}/${base}.md`; for(let i=2; exists(path); i++) path=`${folder(kind)}/${base}-${i}.md`;
  const fm=Object.assign({},c.defaults,{name:name||c.defaults.name||kind,created:nowISO()});
  const hdr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${JSON.stringify(v)}`),"---"].join("\n");
  await createFile(path,c.body?`${hdr}\n\n${c.body}`:`${hdr}\n\n`);
  return path;
}
async function ensureNode(el,kind,name){
  if(!["asset","entity"].includes(kind)) return null;
  const g=grp(el);
  const pre=g.find(e=>typeof e.link==="string"&&e.link.startsWith("[["))?.link;
  if(pre){const p=pre.slice(2,-2); if(exists(p)){const w=wiki(p,view.file.path); g.forEach(e=>e.link=w); ea.copyViewElementsToEAforEditing(g); return p;}}
  const p=await makeNode(kind,name,el.type); const w=wiki(p,view.file.path);
  g.forEach(e=>{ e.link=w; if(typeof e.text==="string") e.text=e.text.replace(MARK,"").trim(); });
  ea.copyViewElementsToEAforEditing(g); dbg(`✓ node (${kind}) → ${w}`); return p;
}

/* -------- ensure transfer -------- */
async function ensureTransfer(arr){
  const cl=classify(arr); if(cl?.k!=="transfer") return;
  const s=byId[arr.startBinding?.elementId], t=byId[arr.endBinding?.elementId];
  if(!s||!t){dbg("↯ arrow not bound"); return;}
  const sP=await ensureNode(s,classify(s)?.k||"asset",classify(s)?.n);
  const tP=await ensureNode(t,classify(t)?.k||"asset",classify(t)?.n);
  if(!sP||!tP){dbg("↯ endpoints unresolved"); return;}

  if(typeof arr.link==="string"&&arr.link.startsWith("[[")){const p=arr.link.slice(2,-2);
    if(exists(p)){const w=wiki(p,view.file.path); await pushArr(sP,"dfd_out",w); await pushArr(tP,"dfd_in",w); return;}
  }

  await ensureFolder(folder("transfer"));
  let base=`transfer_${slug(bn(sP))}-to-${slug(bn(tP))}`, tPath=`${folder("transfer")}/${base}.md`;
  if(exists(tPath)) tPath=`${folder("transfer")}/${base}-${rnd4()}.md`;

  const fm={schema:"dfd-transfer-v1",type:"transfer",name:cl.n||"transfer",created:nowISO()};
  const hdr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${JSON.stringify(v)}`),"---"].join("\n");
  await createFile(tPath,`${hdr}\n\n`);

  const sW=wiki(sP,view.file.path), tW=wiki(tP,view.file.path);
  await updFM(tPath,f=>{f.from=sW;f.to=tW;f.source_drawing=wiki(view.file.path,view.file.path);});
  const xW=wiki(tPath,view.file.path);
  arr.link=xW; arr.customData={dfd:{kind:"transfer",from:sW,to:tW,transferPath:tPath}};
  try{ if(arr.points?.length===2) ea.addLabelToLine(arr.id,"TR-"+rnd4().toUpperCase()); }catch{}
  ea.copyViewElementsToEAforEditing([arr]);
  await pushArr(sP,"dfd_out",xW); await pushArr(tP,"dfd_in",xW);
  dbg(`✓ transfer → ${xW}`);
}

/* -------- EXECUTE -------- */
await (async()=>{
  for(const n of els.filter(e=>!arrowish(e))){const c=classify(n); if(c) await ensureNode(n,c.k,c.n);}
  for(const a of els.filter(arrowish)) await ensureTransfer(a);
  await ea.addElementsToView(false,true,true,true);
})();
if(DEBUG) new Notice("Linkify DFD v0.8.1 finished");