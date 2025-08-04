---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 4:52 pm
date modified: Monday, August 4th 2025, 5:13 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD – v0.7.2-D-fix-2
 * ---------------------------------------------------------------
 * DEBUG build:  set DEBUG / LOG_LINKS at top.
 ******************************************************************/

const DEBUG     = true;    // pop-up Notice per element
const LOG_LINKS = true;    // console.log every link

/* ========= USER CONFIG ========= */
const REQUIRE_EXPLICIT_MARKER   = false;
const FILENAME_MODE             = "replace";      // "replace" | "inject"
const INCLUDE_SHAPE_IN_NAME     = true;           // only for "inject"
const INCLUDE_NAME_IN_FILENAME  = true;           // only for "inject"
const WRITE_INLINE_FIELDS       = false;

const ELEMENT_LINK_ALIAS_MODE   = "fm_name";         // "none" | "basename" | "fm_name"

const DB_PLACEMENT    = "db_folder";              // "db_folder" | "flat" | "diagram_named"
const DB_PARENT_PATH  = "";                       // "" ⇒ diagram’s folder
const DB_FOLDER_NAME  = "DFD Objects Database";

const DFD_CONFIG_DIR  = "DFD Object Configuration";
/* ================================= */

const DEFAULT_SUBFOLDERS = { asset:"Assets", entity:"Entities", transfer:"Transfers" };
const FALLBACK_DEFAULTS  = {
  asset:    { schema:"dfd-asset-v1",    type:"asset",    classification:"", owner:"", systemType:"", url:"" },
  entity:   { schema:"dfd-entity-v1",   type:"entity",   category:"", contact:"", jurisdiction:"" },
  transfer: { schema:"dfd-transfer-v1", type:"transfer", method:"", frequency:"", classification:"", risk:"" },
};

/* ---------- helpers ---------- */
const nowISO    = ()=>new Date().toISOString();
const exists    = p=>!!app.vault.getAbstractFileByPath(p);
const createFile= (p,c)=>app.vault.create(p,c);          // ← helper used everywhere
const read      = p=>app.vault.read(app.vault.getAbstractFileByPath(p));
const write     = (p,c)=>app.vault.modify(app.vault.getAbstractFileByPath(p),c);
const bn        = p=>p.split("/").pop().replace(/\.md$/i,"");
const slug      = s=>s.replace(/[\\/#^|?%*:<>"]/g," ").trim().replace(/\s+/g,"-").toLowerCase()||"unnamed";
const uniqId    = ()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5).toLowerCase();
function debugNot(msg){ if(DEBUG) new Notice(msg,4000); }
function log(txt){ if(LOG_LINKS) console.log(txt); }

/* ensureFolder BEFORE first use */
async function ensureFolder(fp){
  if(!fp) return;
  const parts=fp.split("/").filter(Boolean);
  let cur="";
  for(const part of parts){
    cur=cur?`${cur}/${part}`:part;
    if(!exists(cur)) try{ await app.vault.createFolder(cur);}catch{}
  }
}

/* shortest-link + alias helper */
function shortText(path,from){
  const f=app.vault.getAbstractFileByPath(path);
  return app.metadataCache.fileToLinktext(f,from);
}
function aliasFor(path){
  if(ELEMENT_LINK_ALIAS_MODE==="basename") return bn(path);
  if(ELEMENT_LINK_ALIAS_MODE==="fm_name"){
    const n=app.metadataCache.getCache(path)?.frontmatter?.name;
    return n?String(n):bn(path);
  }
  return null;
}
function toWiki(path,from){
  const lt=shortText(path,from), al=aliasFor(path);
  const wl=al?`[[${lt}|${al}]]`:`[[${lt}]]`;
  log(`link → ${wl}`);
  return wl;
}

/* front-matter utils */
async function setFM(fp,fn){
  const f=app.vault.getAbstractFileByPath(fp);
  if(f) await app.fileManager.processFrontMatter(f,fn);
}
async function pushArr(fp,key,val){
  await setFM(fp,fm=>{
    const a=Array.isArray(fm[key])?fm[key]:(fm[key]?[fm[key]]:[]);
    if(!a.includes(val)) a.push(val);
    fm[key]=a;
  });
}
async function dvAppend(fp,field,link){
  if(!WRITE_INLINE_FIELDS) return;
  const c=await read(fp), ln=`${field}:: ${link}`;
  if(!c.includes(ln)) await write(fp,(c.endsWith("\n")?c:c+"\n")+ln+"\n");
}

/* environment */
ea.setView("active");
const view=ea.targetView;
if(!view?.file){ new Notice("Open an Excalidraw file first."); return; }
const DRAW_DIR = view.file.parent.path;
const DIAG     = bn(view.file.path);
const PARENT   = DB_PARENT_PATH||DRAW_DIR;
const ROOT     = DB_PLACEMENT==="db_folder"
                   ?`${PARENT}/${DB_FOLDER_NAME}`.replace(/^\/|\/\/+/g,"/")
                 :DB_PLACEMENT==="diagram_named"
                   ?`${PARENT}/${DIAG}`.replace(/^\/|\/\/+/g,"/")
                 :PARENT;

/* load config notes */
function mdUnder(dir){
  const root=app.vault.getAbstractFileByPath(dir); if(!root) return [];
  const out=[]; (function walk(f){ if(f.children)f.children.forEach(walk); else if(f.extension==="md")out.push(f);} )(root);
  return out;
}
async function loadCfg(){
  const map=new Map();
  for(const f of mdUnder(DFD_CONFIG_DIR)){
    const cache=app.metadataCache.getFileCache(f), fm=cache?.frontmatter||{};
    const pos=cache?.frontmatterPosition;
    const body=pos?(await app.vault.read(f)).slice(pos.end.offset).trim():"";
    const kind=(fm["DFD__KIND"]||"").toLowerCase();
    if(!["asset","entity","transfer"].includes(kind)) continue;
    let marks=fm["DFD__MARKER"]; if(!marks) marks=[kind];
    if(!Array.isArray(marks)) marks=[marks];
    const sub=fm["DFD__SUBFOLDER"]||DEFAULT_SUBFOLDERS[kind];
    const defs={}; for(const[k,v]of Object.entries(fm)) if(!k.startsWith("DFD__")) defs[k]=v;
    const cfg={kind,subfolder:sub,defaults:defs,body};
    marks.forEach(m=>map.set(String(m).toLowerCase(),cfg));
    if(!map.has(kind)) map.set(kind,cfg);
  }
  return map;
}
const CFGS=await loadCfg();
function cfgFor(key){
  const k=(key||"").toLowerCase();
  if(CFGS.has(k)) return CFGS.get(k);
  if(["asset","entity","transfer"].includes(k)&&CFGS.has(k)) return CFGS.get(k);
  return {kind:k||"asset",subfolder:DEFAULT_SUBFOLDERS[k]||"Assets",defaults:FALLBACK_DEFAULTS[k]||{},body:""};
}
const folder=k=>`${ROOT}/${cfgFor(k).subfolder}`.replace(/^\/|\/\/+/g,"/");
await ensureFolder(folder("asset")); await ensureFolder(folder("entity")); await ensureFolder(folder("transfer"));

/* scene snapshot */
const all=ea.getViewElements?ea.getViewElements():ea.getElements();
const byId=Object.fromEntries(all.map(e=>[e.id,e]));
const arrowish = el=>el.type==="arrow"||(el.type==="line"&&(el.endArrowhead||el.startArrowhead));

/* detect kind & inline */
const MARKER_RE=/^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
function parseMark(s){ const m=s?.trim().match(MARKER_RE); return m?{k:m[1].toLowerCase(),n:(m[2]||"").trim()||null}:null; }
function grp(el){ const gid=el.groupIds?.at(-1); return gid?all.filter(x=>x.groupIds?.includes(gid)):[el]; }
const nodeTypes=new Set(["rectangle","ellipse","diamond","image","frame"]);
function firstTxt(g){ return (g.find(e=>e.type==="text"&&(e.text||"").trim())?.text||"").trim(); }
function kindName(el){
  const cd=el.customData?.dfd||el.customData?.DFD; if(cd?.kind) return {k:cd.kind,n:null};
  const lm=parseMark(el.link); if(lm) return {k:lm.k,n:lm.n};
  const tm=parseMark(firstTxt(grp(el))); if(tm) return {k:tm.k,n:tm.n};
  if(REQUIRE_EXPLICIT_MARKER) return null;
  if(arrowish(el)) return {k:"transfer",n:null};
  if(nodeTypes.has(el.type)) return {k:"asset",n:null};
  return null;
}

/* make note */
async function makeNote(kind,name,shape){
  const cf=cfgFor(kind); let base,path;
  if(name&&FILENAME_MODE==="replace"){
    base=slug(name)||kind; path=`${folder(kind)}/${base}.md`;
    for(let i=2; exists(path); i++) path=`${folder(kind)}/${base}-${i}.md`;
  }else{
    const id=uniqId(); const np=name&&INCLUDE_NAME_IN_FILENAME?`-${slug(name)}`:"";
    const sp=shape&&INCLUDE_SHAPE_IN_NAME?`-${shape}`:"";
    base=`${kind}${sp}${np}-${id}`; path=`${folder(kind)}/${base}.md`;
  }
  const fm=Object.assign({},cf.defaults,{name:name||cf.defaults.name||kind,created:nowISO()});
  const fmStr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${typeof v==="string"?`"${v.replace(/"/g,'\\"')}"`:JSON.stringify(v)}`),"---"].join("\n");
  await createFile(path,cf.body?`${fmStr}\n\n${cf.body}`:`${fmStr}\n\n`);
  return {path,link:toWiki(path,view.file.path)};
}

/* ensure node */
async function ensureNode(el,kind,name){
  if(!["asset","entity"].includes(kind)) return null;
  const g=grp(el);
  const pre=g.find(e=>typeof e.link==="string"&&e.link.startsWith("[["))?.link;
  if(pre){ const p=pre.slice(2,-2); if(exists(p)){ const l=toWiki(p,view.file.path); g.forEach(e=>e.link=l); ea.copyViewElementsToEAforEditing(g); debugNot(`✓ node (pre) → ${l}`); return {path:p,link:l}; } }
  if(REQUIRE_EXPLICIT_MARKER&&!kindName(el)){ debugNot("↯ node unmarked"); return null; }
  const {path,link}=await makeNote(kind,name,el.type); g.forEach(e=>e.link=link); ea.copyViewElementsToEAforEditing(g);
  debugNot(`✓ node (${kind}) → ${link}`); return {path,link};
}

/* ensure transfer */
async function ensureTransfer(arr){
  if(!arrowish(arr)) return;
  const d=kindName(arr); if(!d||d.k!=="transfer") return;
  const fromId=arr.startBinding?.elementId,toId=arr.endBinding?.elementId;
  if(!fromId||!toId) return debugNot("↯ arrow not bound");

  const fnn=kindName(byId[fromId])||(!REQUIRE_EXPLICIT_MARKER?{k:"asset"}:null);
  const tnn=kindName(byId[toId])  ||(!REQUIRE_EXPLICIT_MARKER?{k:"asset"}:null);
  if(!fnn||!tnn) return debugNot("↯ endpoints unmarked");

  const fn=await ensureNode(byId[fromId],fnn.k,fnn.n);
  const tn=await ensureNode(byId[toId]  ,tnn.k,tnn.n);
  if(!fn||!tn) return;

  if(typeof arr.link==="string"&&arr.link.startsWith("[[")){
    const p=arr.link.slice(2,-2); if(exists(p)){
      const wl=toWiki(p,view.file.path);
      await pushArr(fn.path,"dfd_out",wl); await pushArr(tn.path,"dfd_in",wl);
      await dvAppend(fn.path,"DFD_out",wl); await dvAppend(tn.path,"DFD_in",wl);
      debugNot(`↻ transfer kept → ${wl}`); return;
    }
  }

  const tc=cfgFor("transfer"); const id=uniqId();
  let base=`transfer_${slug(bn(fn.path))}-to-${slug(bn(tn.path))}-${id}`, pth=`${folder("transfer")}/${base}.md`;
  for(let i=2; exists(pth); i++) pth=`${folder("transfer")}/${base}-${i}.md`;

  const fm=Object.assign({},tc.defaults,{name:d.n||tc.defaults.name||"transfer",created:nowISO()});
  const fmStr=["---",...Object.entries(fm).map(([k,v])=>`${k}: ${typeof v==="string"?`"${v.replace(/"/g,'\\"')}"`:JSON.stringify(v)}`),"---"].join("\n");
  await createFile(pth,tc.body?`${fmStr}\n\n${tc.body}`:`${fmStr}\n\n`);

  const fW=toWiki(fn.path,view.file.path), tW=toWiki(tn.path,view.file.path), src=toWiki(view.file.path,view.file.path);
  await setFM(pth,fm=>{ fm.schema=fm.schema; fm.type=fm.type; fm.from=fW; fm.to=tW; fm.source_drawing=src; });

  const xW=toWiki(pth,view.file.path); arr.link=xW;
  const short="TR-"+uniqId().slice(0,5).toUpperCase();
  arr.customData={...(arr.customData||{}),dfd:{kind:"transfer",edgeId:short,transferPath:pth,from:fW,to:tW}};
  try{ if(arr.points?.length===2) ea.addLabelToLine(arr.id,short);}catch{}
  ea.copyViewElementsToEAforEditing([arr]);

  await pushArr(fn.path,"dfd_out",xW); await pushArr(tn.path,"dfd_in",xW);
  await dvAppend(fn.path,"DFD_out",xW); await dvAppend(tn.path,"DFD_in",xW);
  debugNot(`✓ transfer → ${xW}`);
}

/* -------- RUN -------- */
await (async()=>{
  for(const n of all.filter(e=>!arrowish(e))){ const d=kindName(n); if(d&&(d.k==="asset"||d.k==="entity")) await ensureNode(n,d.k,d.n); }
  for(const a of all.filter(arrowish)) await ensureTransfer(a);
  await ea.addElementsToView(false,true,true,true);
})();
new Notice("Linkify DFD debug build loaded.");