---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 12:48 pm
date modified: Monday, August 4th 2025, 4:45 pm
---

/*
```js*/
// Linkify DFD — v0.7.2
// Fixes: transfer via Add-link, filename "replace" default, shortest canvas links.
// Supports: config-driven templates, storage modes, assets/entities/transfers.

const DEBUG     = true;     // 👉 turn off when done
const LOG_LINKS = true;     // 👉 logs to browser console

/*** ====== CONFIG ====== ***/
const REQUIRE_EXPLICIT_MARKER   = true;       // only process marked elements
const FILENAME_MODE             = "replace";  // "replace" | "inject"
const INCLUDE_SHAPE_IN_NAME     = true;       // used only when FILENAME_MODE === "inject"
const INCLUDE_NAME_IN_FILENAME  = true;       // used only when FILENAME_MODE === "inject"
const WRITE_INLINE_FIELDS       = false;      // add DFD_out:: / DFD_in:: in body

// Canvas link display: "none" = plain shortest link, "basename" = [[path|Note]],
// "fm_name" = [[path|<frontmatter name>]] if available, else basename.
const ELEMENT_LINK_ALIAS_MODE   = "none";     // "none" | "basename" | "fm_name"

// Storage placement:
//  - "db_folder":     <DB_PARENT_PATH>/<DB_FOLDER_NAME>/<subfolder>
//  - "flat":          <DB_PARENT_PATH or DRAW_DIR>/<subfolder>
//  - "diagram_named": <DB_PARENT_PATH>/<DiagramBaseName>/<subfolder>
const DB_PLACEMENT    = "db_folder";
const DB_PARENT_PATH  = "";                        // "" => diagram's folder
const DB_FOLDER_NAME  = "DFD Objects Database";    // used only when "db_folder"

// Config folder (vault-relative)
const DFD_CONFIG_DIR  = "DFD Object Configuration";

// Fallbacks if no config file is found
const DEFAULT_SUBFOLDERS = { asset:"Assets", entity:"Entities", transfer:"Transfers" };
const FALLBACK_DEFAULTS  = {
  asset:    { schema:"dfd-asset-v1",    type:"asset",    classification:"", owner:"", systemType:"", url:"" },
  entity:   { schema:"dfd-entity-v1",   type:"entity",   category:"", contact:"", jurisdiction:"" },
  transfer: { schema:"dfd-transfer-v1", type:"transfer", method:"", frequency:"", classification:"", risk:"" },
};
/*** ===================== ***/

const nowISO   = () => new Date().toISOString();
const exists   = (p) => !!app.vault.getAbstractFileByPath(p);
const createFile = async (p,c) => await app.vault.create(p,c);
const readFile   = async (p) => await app.vault.read(app.vault.getAbstractFileByPath(p));
const writeFile  = async (p,c) => await app.vault.modify(app.vault.getAbstractFileByPath(p), c);
const baseName   = (p) => p.split("/").pop().replace(/\.md$/i,"");
const sanitize   = (s) => (s||"").toString().replace(/[\\/#^|?%*:<>"]/g," ").replace(/\s+/g," ").trim();
const slug       = (s) => sanitize(s).replace(/\s+/g,"-").toLowerCase() || "unnamed";
const uniqId     = () => (Date.now().toString(36) + Math.random().toString(36).slice(2,5)).toLowerCase();

function shortestLinktext(path, fromPath) {
  // Obsidian’s MetadataCache.fileToLinktext → shortest relative linktext. :contentReference[oaicite:3]{index=3}
  const f = app.vault.getAbstractFileByPath(path);
  return app.metadataCache.fileToLinktext(f, fromPath);
}
function toWiki(path, fromPath, alias = null) {
  const linkText = shortestLinktext(path, fromPath);
  return alias ? `[[${linkText}|${alias}]]` : `[[${linkText}]]`;
}

async function ensureFolder(p){
  if (!p) return;
  const parts = p.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) { try { await app.vault.createFolder(cur); } catch(_){} }
  }
}

// Atomic frontmatter edits. :contentReference[oaicite:4]{index=4}
async function setFM(filePath, updater){
  const f = app.vault.getAbstractFileByPath(filePath);
  if (!f) return;
  await app.fileManager.processFrontMatter(f, (fm) => { updater(fm); });
}
async function ensureArrayFM(filePath, key, wikilink){
  await setFM(filePath, (fm) => {
    const a = Array.isArray(fm[key]) ? fm[key] : (fm[key] ? [fm[key]] : []);
    if (!a.includes(wikilink)) a.push(wikilink);
    fm[key] = a;
  });
}
async function appendInline(filePath, field, wikilink){
  if (!WRITE_INLINE_FIELDS) return;
  const content = await readFile(filePath);
  const line = `${field}:: ${wikilink}`;
  if (content.includes(line)) return;
  await writeFile(filePath, (content.endsWith("\n") ? content : content+"\n") + line + "\n");
}

// ---- load configs (marker → cfg) ----
function mdUnder(dirPath){
  const folder = app.vault.getAbstractFileByPath(dirPath);
  if (!folder || !folder.children) return [];
  const out = [];
  const walk = (f) => { if (f.children) f.children.forEach(walk); else if (f.extension==="md") out.push(f); };
  folder.children.forEach(walk);
  return out;
}
async function loadConfigs(){
  const map = new Map();
  const files = mdUnder(DFD_CONFIG_DIR);
  for (const tf of files) {
    const cache = app.metadataCache.getFileCache(tf);
    const fm = cache?.frontmatter || {};
    const pos = cache?.frontmatterPosition;
    const full = await app.vault.read(tf);
    const body = pos ? full.slice(pos.end.offset).replace(/^\s+/, "") : "";

    const kind = String(fm["DFD__KIND"] || "").toLowerCase();
    if (!["asset","entity","transfer"].includes(kind)) continue;

    let markers = fm["DFD__MARKER"]; if (!markers) markers = [kind];
    if (!Array.isArray(markers)) markers = [markers];

    const subfolder = fm["DFD__SUBFOLDER"] || DEFAULT_SUBFOLDERS[kind];
    const defaults = {};
    for (const [k,v] of Object.entries(fm)) if (!k.startsWith("DFD__")) defaults[k] = v;

    const cfg = { kind, subfolder, defaults, body };
    for (const m of markers) map.set(String(m).toLowerCase(), cfg);
    if (!map.has(kind)) map.set(kind, cfg);
  }
  return map;
}

// ---- markers & inline names ----
const MARKER_RE = /^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
function parseMarker(s){
  if (!s) return null;
  const m = s.trim().match(MARKER_RE);
  if (!m) return null;
  return { kind: m[1].toLowerCase(), inlineName: (m[2]||"").trim() || null };
}
const groupOf = (all, el) => {
  const gid = (el.groupIds && el.groupIds.length) ? el.groupIds[el.groupIds.length-1] : null;
  return gid ? all.filter(x => x.groupIds && x.groupIds.includes(gid)) : [el];
};
const firstText = (els) => (els.find(e=>e.type==="text" && (e.text||"").trim())?.text||"").trim();

function detectKindAndName(el, group){
  const cd = el.customData?.dfd || el.customData?.DFD;
  if (cd?.kind && ["asset","entity","transfer"].includes(cd.kind)) return { kind: cd.kind, inlineName: null };

  const lm = parseMarker(typeof el.link==="string" ? el.link : "");
  if (lm) return lm;

  const tm = parseMarker(firstText(group));
  if (tm) return tm;

  if (REQUIRE_EXPLICIT_MARKER) return null;
  if (isArrowish(el)) return { kind:"transfer", inlineName:null };
  const nodeTypes = new Set(["rectangle","ellipse","diamond","image","frame"]);
  if (nodeTypes.has(el.type)) return { kind:"asset", inlineName:null };
  return null;
}

// Treat 'arrow' or 'line' with arrowheads as transfer-capable. :contentReference[oaicite:5]{index=5}
function isArrowish(el){
  if (el.type === "arrow") return true;
  if (el.type === "line" && (el.endArrowhead || el.startArrowhead)) return true;
  return false;
}

// ---- placement ----
ea.setView("active");
const view = ea.targetView;
if (!view || !view.file) { new Notice("Open an Excalidraw file first."); return; }

const DRAW_DIR = view.file.parent?.path || "";
const DIAGRAM_BASENAME = baseName(view.file.path);
const PARENT = DB_PARENT_PATH || DRAW_DIR;

function rootFor(){
  if (DB_PLACEMENT === "db_folder")     return [PARENT, DB_FOLDER_NAME].filter(Boolean).join("/");
  if (DB_PLACEMENT === "diagram_named") return [PARENT, DIAGRAM_BASENAME].filter(Boolean).join("/");
  return PARENT; // flat
}

const CONFIGS = await loadConfigs();
function cfgFor(keyOrKind){
  const k = String(keyOrKind||"").toLowerCase();
  if (CONFIGS.has(k)) return CONFIGS.get(k);
  if (["asset","entity","transfer"].includes(k) && CONFIGS.has(k)) return CONFIGS.get(k);
  const kind = ["asset","entity","transfer"].includes(k) ? k : "asset";
  return { kind, subfolder: DEFAULT_SUBFOLDERS[kind], defaults: FALLBACK_DEFAULTS[kind], body: "" };
}
function folderFor(kind){
  const cfg = cfgFor(kind);
  return [rootFor(), (cfg.subfolder || DEFAULT_SUBFOLDERS[kind])].filter(Boolean).join("/");
}
await ensureFolder(folderFor("asset"));
await ensureFolder(folderFor("entity"));
await ensureFolder(folderFor("transfer"));

// ---- scene snapshot ----
const allEls = ea.getViewElements ? ea.getViewElements() : ea.getElements();
const byId   = Object.fromEntries(allEls.map(e => [e.id, e]));

// ---- creation ----
async function createFromConfig(kind, inlineName, shapeType){
  const cfg = cfgFor(kind);
  let fileBase, path;

  if (inlineName && FILENAME_MODE === "replace") {
    // Just the provided name, keep unique via suffix
    fileBase = slug(inlineName);
    if (!fileBase) fileBase = kind;
    path = `${folderFor(kind)}/${fileBase}.md`;
    let i=2; while (exists(path)) { path = `${folderFor(kind)}/${fileBase}-${i}.md`; i++; }
  } else {
    // Inject mode (old behavior)
    const id  = uniqId();
    const namePart  = (inlineName && INCLUDE_NAME_IN_FILENAME) ? `-${slug(inlineName)}` : "";
    const shapePart = (INCLUDE_SHAPE_IN_NAME && shapeType) ? `-${shapeType}` : "";
    fileBase = `${kind}${shapePart}${namePart}-${id}`;
    path = `${folderFor(kind)}/${fileBase}.md`;
    let i=2; while (exists(path)) { path = `${folderFor(kind)}/${fileBase}-${i}.md`; i++; }
  }

  const fm = Object.assign({}, cfg.defaults, { name: inlineName || cfg.defaults?.name || kind, created: nowISO() });
  const fmLines = ["---", ...Object.entries(fm).map(([k,v]) => `${k}: ${typeof v==="string" ? `"${String(v).replace(/"/g,'\\"')}"` : JSON.stringify(v)}`), "---"];
  const content = cfg.body ? fmLines.join("\n") + "\n\n" + cfg.body : fmLines.join("\n") + "\n\n";
  await createFile(path, content);
  return { path, link: toWiki(path, view.file.path, computeAlias(path)), name: fileBase };
}

function computeAlias(path){
  if (ELEMENT_LINK_ALIAS_MODE === "basename") return baseName(path);
  if (ELEMENT_LINK_ALIAS_MODE === "fm_name") {
    const cache = app.metadataCache.getCache(path);
    const n = cache?.frontmatter?.name;
    return n ? String(n) : baseName(path);
  }
  return null; // "none": no alias in the canvas link
}

async function ensureNode(el, kind, inlineName){
  if (!["asset","entity"].includes(kind)) return null;
  const group = groupOf(allEls, el);

  // Respect existing wikilink
  const existing = group.find(e => typeof e.link==="string" && e.link.startsWith("[["))?.link;
  if (existing) {
    const p = existing.slice(2,-2);
    if (exists(p)) {
      const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
      largest.link = toWiki(p, view.file.path, computeAlias(p));
      ea.copyViewElementsToEAforEditing([largest]);
      return { path: p, link: largest.link, name: baseName(p) };
    }
  }

  if (REQUIRE_EXPLICIT_MARKER && !detectKindAndName(el, group)) return null;

  const node = await createFromConfig(kind, inlineName, el.type);
  debugNot(`✓ Node (${kind}) → ${node.link}`);
  const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
  largest.link = node.link; // shortest (with optional alias)
  ea.copyViewElementsToEAforEditing([largest]);
  return node;
}

async function ensureTransfer(arr){
  if (!isArrowish(arr)) return;

  // Accept element.link = "transfer" or grouped [[TPL:Transfer]] or customData
  const detected = detectKindAndName(arr, [arr]);
  if (!detected || detected.kind!=="transfer") return;

  // Must be bound on both ends. Excalidraw exposes start/end bindings on arrow/line. :contentReference[oaicite:6]{index=6}
  const fromId = arr.startBinding?.elementId;
  const toId   = arr.endBinding?.elementId;
  if (!fromId || !toId) return;

  const fromEl = byId[fromId], toEl = byId[toId];
  if (!fromEl || !toEl) return;

  const fromDet = detectKindAndName(fromEl, groupOf(allEls, fromEl)) || (REQUIRE_EXPLICIT_MARKER ? null : {kind:"asset"});
  const toDet   = detectKindAndName(toEl,   groupOf(allEls, toEl))   || (REQUIRE_EXPLICIT_MARKER ? null : {kind:"asset"});
  if (!fromDet || !toDet) return;

  const fromNode = await ensureNode(fromEl, fromDet.kind, fromDet.inlineName);
  const toNode   = await ensureNode(toEl,   toDet.kind,   toDet.inlineName);
  if (!fromNode || !toNode) return;

  // Respect existing transfer link
  if (typeof arr.link==="string" && arr.link.startsWith("[[")) {
    const p = arr.link.slice(2,-2);
    if (exists(p)) {
      const w = toWiki(p, view.file.path, computeAlias(p));
      await ensureArrayFM(fromNode.path, "dfd_out", w);
      await ensureArrayFM(toNode.path,   "dfd_in",  w);
      await appendInline(fromNode.path, "DFD_out", w);
      await appendInline(toNode.path,   "DFD_in",  w);
    }
    
    return;
  }

  // Create transfer file (base from endpoints; add id for uniqueness)
  const tcfg = cfgFor("transfer");
  const id   = uniqId();
  const base = `transfer_${slug(baseName(fromNode.path))}-to-${slug(baseName(toNode.path))}-${id}`;
  let tPath  = `${folderFor("transfer")}/${base}.md`;
  let j=2; while (exists(tPath)) { tPath = `${folderFor("transfer")}/${base}-${j}.md`; j++; }

  const fm0 = Object.assign({}, tcfg.defaults, { name: detected.inlineName || tcfg.defaults?.name || "transfer", created: nowISO() });
  const fm0Lines = ["---", ...Object.entries(fm0).map(([k,v]) => `${k}: ${typeof v==="string" ? `"${String(v).replace(/"/g,'\\"')}"` : JSON.stringify(v)}`), "---"];
  const content0 = tcfg.body ? fm0Lines.join("\n") + "\n\n" + tcfg.body : fm0Lines.join("\n") + "\n\n";
  await createFile(tPath, content0);

  const fromW = toWiki(fromNode.path, view.file.path);
  const toW   = toWiki(toNode.path,   view.file.path);
  const srcW  = toWiki(view.file.path, view.file.path);
  await setFM(tPath, (fm) => {
    fm.schema = tcfg.defaults?.schema || FALLBACK_DEFAULTS.transfer.schema;
    fm.type   = tcfg.defaults?.type   || FALLBACK_DEFAULTS.transfer.type;
    fm.from = fromW; fm.to = toW; fm.source_drawing = srcW;
  });

  const xferW = toWiki(tPath, view.file.path, computeAlias(tPath));
  arr.link = xferW; // shortest (with optional alias) on the canvas
  const short = "TR-" + uniqId().slice(0,5).toUpperCase();
  arr.customData = { ...(arr.customData||{}), dfd: { ...(arr.customData?.dfd||{}), kind:"transfer", edgeId: short, transferPath: tPath, from: fromW, to: toW } };
  try { if (Array.isArray(arr.points) && arr.points.length === 2) ea.addLabelToLine(arr.id, short); } catch(_){}
  ea.copyViewElementsToEAforEditing([arr]);

  await ensureArrayFM(fromNode.path, "dfd_out", xferW);
  await ensureArrayFM(toNode.path,   "dfd_in",  xferW);
  await appendInline(fromNode.path, "DFD_out", xferW);
  await appendInline(toNode.path,   "DFD_in",  xferW);
  
  debugNot(`✓ Transfer arrow → ${xferW}`);Fx
}

// helper for debug notices
function debugNot(msg){ if (DEBUG) new Notice(msg, 4000); }

// override toWiki so we can debug link text
function toWiki(path, fromPath, alias = null) {
  const linkText = shortestLinktext(path, fromPath);
  const wl = alias ? `[[${linkText}|${alias}]]` : `[[${linkText}]]`;
  if (LOG_LINKS) console.log(`link for ${baseName(path)} = ${wl}`);
  return wl;
}

// ---- run ----
await (async () => {
  // ensure roots exist
  await ensureFolder(folderFor("asset"));
  await ensureFolder(folderFor("entity"));
  await ensureFolder(folderFor("transfer"));

  // nodes
  for (const n of allEls.filter(e => !isArrowish(e))) {
    const d = detectKindAndName(n, groupOf(allEls, n));
    if (d && (d.kind==="asset" || d.kind==="entity")) await ensureNode(n, d.kind, d.inlineName);
  }
  // arrows + "arrowish" lines
  for (const a of allEls.filter(isArrowish)) {
    await ensureTransfer(a);
  }
  await ea.addElementsToView(false,true,true,true);
})();
new Notice("Linkify DFD v0.7.2: done");