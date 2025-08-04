---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 12:48 pm
date modified: Monday, August 4th 2025, 4:04 pm
---

/*
```js*/
// Linkify DFD — v0.7.1
// Fix: build allEls/byId once; remove duplicate byId declaration.
// Storage modes + config-driven templates carried over from v0.7.

/*** ====== CONFIG ====== ***/
const REQUIRE_EXPLICIT_MARKER   = true;
const INCLUDE_SHAPE_IN_NAME     = true;
const INCLUDE_NAME_IN_FILENAME  = true;
const WRITE_INLINE_FIELDS       = false;

const DB_PLACEMENT    = "db_folder";            // "db_folder" | "flat" | "diagram_named"
const DB_PARENT_PATH  = "";                     // "" => diagram's folder
const DB_FOLDER_NAME  = "DFD Objects Database"; // used only when db_folder

const DFD_CONFIG_DIR  = "DFD Object Configuration";

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

function fileToWiki(path, fromPath) {
  const f = app.vault.getAbstractFileByPath(path);
  const linkText = app.metadataCache.fileToLinktext(f, fromPath);
  return `[[${linkText}]]`;
} // shortest relative wikilink. :contentReference[oaicite:1]{index=1}

async function ensureFolder(p){
  if (!p) return;
  const parts = p.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) { try { await app.vault.createFolder(cur); } catch(_){} }
  }
}

// atomic FM helpers. :contentReference[oaicite:2]{index=2}
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

// load config notes (marker → {kind,subfolder,defaults,body})
function getMdUnder(dirPath){
  const folder = app.vault.getAbstractFileByPath(dirPath);
  if (!folder || !folder.children) return [];
  const out = [];
  const walk = (f) => { if (f.children) f.children.forEach(walk); else if (f.extension==="md") out.push(f); };
  folder.children.forEach(walk);
  return out;
}
async function loadConfigs(){
  const map = new Map();
  const files = getMdUnder(DFD_CONFIG_DIR);
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

// markers: element.link or grouped text like [[TPL:Asset]], and inline naming with =Name
const MARKER_RE = /^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
function parseMarkerString(s){
  if (!s) return null;
  const m = s.trim().match(MARKER_RE);
  if (!m) return null;
  return { kind: m[1].toLowerCase(), inlineName: (m[2]||"").trim() || null };
}

const groupOf = (all, el) => {
  const gid = (el.groupIds && el.groupIds.length) ? el.groupIds[el.groupIds.length-1] : null;
  return gid ? all.filter(x