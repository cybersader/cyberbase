---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 5:29 pm
date modified: Monday, August 4th 2025, 7:14 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD — v0.8.3  (2025-08-04)
 * ---------------------------------------------------------------
 * One-click helper that turns an Excalidraw canvas into an
 * Obsidian-backed data-flow diagram (DFD).
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG  = true;            // true → pop-ups + console.logs
const REQUIRE_EXPLICIT_MARKER = false; // true → every node needs a marker

// Where generated notes live  (all paths are relative to the drawing)
const DB_PLACEMENT    = "flat";            // "flat" | "diagram_named" | "db_folder"
const DB_FOLDER_NAME  = "DFD Objects Database"; // only for "db_folder"

// Inline Dataview fields on endpoints
const WRITE_INLINE_FIELDS = false;

// Fallback sub-folders (config notes can override)
const DEFAULT_SUBFOLDERS = {
  asset   : "Assets",
  entity  : "Entities",
  transfer: "Transfers"
};
const CFG_DIR="DFD Object Configuration";
/****************************************************************/

/* ---------- helpers ---------- */
const exists=p=>!!app.vault.getAbstractFileByPath(p);
const create=(p,c)=>app.vault.create(p,c);
const read  =(p)=>app.vault.read(app.vault.getAbstractFileByPath(p));
const write =(p,c)=>app.vault.modify(app.vault.getAbstractFileByPath(p),c);
const bn    =p=>p.split("/").pop().replace(/\.md$/i,"");
const slug  =s=>s.replace(/[\\/#^|?%*:<>"]/g," ").trim().replace(/\s+/g,"-").toLowerCase()||"unnamed";
const rnd4  =()=>Math.random().toString(36).slice(2,6);
const nowISO=()=>new Date().toISOString();
const note  =m=>DEBUG && new Notice(m,4e3);
const clog  =m=>DEBUG && console.log(m);

/* shortest wiki link – NO alias */
const short  =(p,from)=>app.metadataCache.fileToLinktext(app.vault.getAbstractFileByPath(p),from);
const wiki   =(p,from)=>`[[${short(p,from)}]]`;

/* ensure folder chain */
async function ensureFolder(path){
  if(!path) return;
  const parts=path.split("/").filter(Boolean); let cur="";
  for(const part of parts){ cur=cur?`${cur}/${part}`:part;
    if(!exists(cur)) try{ await app.vault.createFolder(cur);}catch{} }
}

/* small FM helpers */
async function fm(fp,fn){ const f=app.vault.getAbstractFileByPath(fp); if(f) await app.fileManager.processFrontMatter(f,fn); }
async function pushArr(fp,k,v){await fm(fp,f=>{const a=Array.isArray(f[k])?f[k]:(f[k]?[f[k]]:[]); if(!a.includes(v)) a.push(v); f[k]=a;});}
async function dvInline(fp,field,val){
  if(!WRITE_INLINE_FIELDS) return;
  const t=await read(fp); const ln=`${field}:: ${val}`;
  if(!t.includes(ln)) await write(fp,(t.endsWith("\n")?t:t+"\n")+ln+"\n");
}

/* ---------- environment ---------- */
ea.setView("active"); const view=ea.targetView;
if(!view?.file){ new Notice("Open an Excalidraw file first"); return; }

const DRAW_DIR=view.file.parent.path;
const ROOT   =(DB_PLACEMENT==="flat")?DRAW_DIR
             :(DB_PLACEMENT==="diagram_named")?`${DRAW_DIR}/${bn(view.file.path)}`
             :`${DRAW_DIR}/${DB_FOLDER_NAME}`;
const folder =k=>`${ROOT}/${DEFAULT_SUBFOLDERS[k]}`;

/* ---------- load optional “DFD Object Configuration” notes --- */
function allMarkdown(dir){
  const root=app.vault.getAbstractFileByPath(dir); if(!root) return [];
  const out=[];(function walk(f){f.children?f.children.forEach(walk):f.extension==="md"&&out.push(f);})(root); return out;
}
const CFG=new Map();
for(const f of allMarkdown(CFG_DIR)){
  const fc=app.metadataCache.getFileCache(f), fm=fc?.frontmatter||{};
  const kind=(fm["DFD__KIND"]||"").toLowerCase(); if(!["asset","entity","transfer"].includes(kind)) continue;
  const marker=(fm["DFD__MARKER"]||kind).toLowerCase();
  const sub   =fm["DFD__SUBFOLDER"]||DEFAULT_SUBFOLDERS[kind];
  const defs  =Object.fromEntries(Object.entries(fm).filter(([k])=>!k.startsWith("DFD__")));
  const pos   =fc?.frontmatterPosition;
  const body  =pos ? (await app.vault.read(f)).slice(pos.end.offset).trim() : "";
  CFG.set(marker,{kind,defaults:defs,subfolder:sub,body});
}
const cfg=k=>CFG.get(k)||{kind:k,defaults:{},subfolder:DEFAULT_SUBFOLDERS[k],body:""};

/* ---------- scene + parse ---------- */
const MARK=/^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
const els   =ea.getViewElements?ea.getViewElements():ea.getElements();
const byId  =Object.fromEntries(els.map(e=>[e.id,e]));
const grp   =e=>{const g=e.groupIds?.at(-1);return g?els.filter(x=>x.groupIds?.includes(g)):[e];};
const firstTxt=g=>g.find(e=>e.type==="text"&&(e.text||"").trim())?.text.trim()||"";
const arrowish=e=>e.type==="arrow"||(e.type==="line"&&(e.endArrowhead||e.startArrowhead));
const isNodeShape=e=>new Set(["rectangle","ellipse","diamond","image","frame"]).has(e.type);

function parseMark(s){ const m=s?.trim().match(MARK); return m?{k:m[1].toLowerCase(),n:(m[2]||"").trim()||null}:null; }
function classify(el){
  const cd=el.customData?.dfd||el.customData?.DFD; if(cd?.kind) return {k:cd.kind,n:null};
  const hit=parseMark(el.link)||parseMark(firstTxt(grp(el))); if(hit) return hit;
  if(REQUIRE_EXPLICIT_MARKER) return null;
  if(arrowish(el))     return {k:"transfer",n:null};
  if(isNodeShape(el))  return {k:"asset",n:null};
  return null;
}

/* ---------- create / ensure node ---------- */
async function makeNode(kind,name,shape){
  const c=cfg(kind); await ensureFolder(folder(kind));
  let base=!name||REQUIRE_EXPLICIT_MARKER?`${kind}-${shape}-${rnd4()}`:slug(name);
  let path=`${folder(kind)}/${base}.md`; for(let i=2; exists(path); i++) path=`${folder(kind)}/${base}-${i}.md`;
  const fm=Object.assign({},c.defaults,{name:name||c.defaults.name||kind,created:nowISO()});
  const hdr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${JSON.stringify(v)}`),"---"].join("\n");
  await create(path,c.body?`${hdr}\n\n${c.body}`:`${hdr}\n\n`);
  return path;
}
async function ensureNode(el,kind,name){
  if(!["asset","entity"].includes(kind)) return null;
  const g=grp(el);
  const pre=g.find(e=>typeof e.link==="string"&&e.link.startsWith("[["))?.link;
  if(pre){ const p=pre.slice(2,-2); if(exists(p)){ const w=wiki(p,view.file.path); g.forEach(e=>e.link=w); ea.copyViewElementsToEAforEditing(g); return p; }}
  const path=await makeNode(kind,name,el.type); const w=wiki(path,view.file.path);
  g.forEach(e=>{ e.link=w; if(typeof e.text==="string") e.text=e.text.replace(MARK,"").trim(); });
  ea.copyViewElementsToEAforEditing(g); note(`✓ node (${kind}) → ${w}`); return path;
}

/* ---------- ensure transfer ---------- */
async function ensureTransfer(arr){
  const det=classify(arr); if(det?.k!=="transfer") return;
  const s=byId[arr.startBinding?.elementId], t=byId[arr.endBinding?.elementId];
  if(!s||!t){ note("↯ arrow not bound"); return; }

  const sp=await ensureNode(s,classify(s)?.k||"asset",classify(s)?.n);
  const tp=await ensureNode(t,classify(t)?.k||"asset",classify(t)?.n);
  if(!sp||!tp){ note("↯ endpoints unresolved"); return; }

  if(typeof arr.link==="string"&&arr.link.startsWith("[[")){
    const p=arr.link.slice(2,-2); if(exists(p)){
      const w=wiki(p,view.file.path);
      await pushArr(sp,"dfd_out",w); await pushArr(tp,"dfd_in",w); return;
    }
  }

  await ensureFolder(folder("transfer"));
  let base=`transfer_${slug(bn(sp))}-to-${slug(bn(tp))}`, path=`${folder("transfer")}/${base}.md`;
  if(exists(path)) path=`${folder("transfer")}/${base}-${rnd4()}.md`;

  const fm={schema:"dfd-transfer-v1",type:"transfer",name:det.n||"transfer",created:nowISO()};
  const hdr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${JSON.stringify(v)}`),"---"].join("\n");
  await create(path,`${hdr}\n\n`);

  const sW=wiki(sp,view.file.path), tW=wiki(tp,view.file.path);
  await fm(path,f=>{f.from=sW; f.to=tW; f.source_drawing=wiki(view.file.path,view.file.path);});

  const link=wiki(path,view.file.path);
  arr.link=link; arr.customData={dfd:{kind:"transfer",from:sW,to:tW,transferPath:path}};
  try{ if(arr.points?.length===2) ea.addLabelToLine(arr.id,"TR-"+rnd4().toUpperCase()); }catch{}
  ea.copyViewElementsToEAforEditing([arr]);

  await pushArr(sp,"dfd_out",link); await pushArr(tp,"dfd_in",link);
  if(WRITE_INLINE_FIELDS){ await dvInline(sp,"DFD_out",link); await dvInline(tp,"DFD_in",link); }
  note(`✓ transfer → ${link}`);
}

/* ---------- RUN ---------- */
await (async()=>{
  for(const n of els.filter(e=>!arrowish(e))){
    const d=classify(n); if(d) await ensureNode(n,d.k,d.n);
  }
  for(const a of els.filter(arrowish)) await ensureTransfer(a);
  await ea.addElementsToView(false,true,true,true);
})();
if(DEBUG) new Notice("Linkify DFD v0.8.3 finished");