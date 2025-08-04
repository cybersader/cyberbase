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
// Linkify DFD — v0.7
// - Config-driven templates (DFD Object Configuration/*)
// - Markers accepted via element.link ("asset", "entity", "transfer") with optional "=Name",
//   grouped text markers (e.g., [[TPL:Asset]]), or element.customData.dfd.kind
// - Storage placement: db_folder | flat | diagram_named
// - Shortest wikilinks via fileToLinktext; atomic YAML via processFrontMatter

/*** ====== CONFIG ====== ***/
// Process only explicitly marked elements
const REQUIRE_EXPLICIT_MARKER = true;
// Include the shape type in generated filenames (asset-rectangle-abc12)
const INCLUDE_SHAPE_IN_NAME   = true;
// Include the inline name in filenames (asset-customer-db-abc12)
const INCLUDE_NAME_IN_FILENAME = true;
// Also add inline Dataview fields in the body
const WRITE_INLINE_FIELDS     = false;

// Storage placement:
//  - "db_folder":   <DB_PARENT_PATH>/<DB_FOLDER_NAME>/<subfolder>
//  - "flat":        <DB_PARENT_PATH or DRAW_DIR>/<subfolder>   (no parent folder)
//  - "diagram_named": <DB_PARENT_PATH>/<DiagramBaseName>/<subfolder>
const DB_PLACEMENT    = "db_folder";              // "db_folder" | "flat" | "diagram_named"
const DB_PARENT_PATH  = "";                       // vault-relative; "" => use the diagram's folder
const DB_FOLDER_NAME  = "DFD Objects Database";   // only used when DB_PLACEMENT==="db_folder"

// Where configuration (templates) live
const DFD_CONFIG_DIR  = "DFD Object Configuration"; // vault-relative folder of config notes

// Fallback defaults if a config note is missing
const DEFAULT_SUBFOLDERS = { asset: "Assets", entity: "Entities", transfer: "Transfers" };
const FALLBACK_DEFAULTS = {
  asset:    { schema: "dfd-asset-v1",    type: "asset",    classification: "", owner: "", systemType: "", url: "" },
  entity:   { schema: "dfd-entity-v1",   type: "entity",   category: "", contact: "", jurisdiction: "" },
  transfer: { schema: "dfd-transfer-v1", type: "transfer", method: "", frequency: "", classification: "", risk: "" },
};
/*** ===================== ***/

// ---------- utilities ----------
const nowISO = () => new Date().toISOString();
const exists = (p) => !!app.vault.getAbstractFileByPath(p);
const createFile = async (p,c) => await app.vault.create(p,c);
const readFile   = async (p) => await app.vault.read(app.vault.getAbstractFileByPath(p));
const writeFile  = async (p,c) => await app.vault.modify(app.vault.getAbstractFileByPath(p), c);
const baseName   = (p) => p.split("/").pop().replace(/\.md$/i,"");
const sanitize   = (s) => (s||"").toString().replace(/[\\/#^|?%*:<>"]/g," ").replace(/\s+/g," ").trim();
const slug       = (s) => sanitize(s).replace(/\s+/g,"-").toLowerCase() || "unnamed";
const uniqId     = () => (Date.now().toString(36) + Math.random().toString(36).slice(2,5)).toLowerCase();

function fileToWiki(path, fromPath) {
  const f = app.vault.getAbstractFileByPath(path);
  const linkText = app.metadataCache.fileToLinktext(f, fromPath); // shortest relative link text
  return `[[${linkText}]]`;
} // docs: MetadataCache.fileToLinktext :contentReference[oaicite:4]{index=4}

async function ensureFolder(folderPath){
  if (!folderPath) return;
  const parts = folderPath.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) { try { await app.vault.createFolder(cur); } catch(_){} }
  }
}

// atomic FM helpers (processFrontMatter) :contentReference[oaicite:5]{index=5}
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

// ---------- load configuration notes ----------
function getMdUnder(dirPath){
  const folder = app.vault.getAbstractFileByPath(dirPath);
  if (!folder || !folder.children) return [];
  const out = [];
  const walk = (f) => {
    if (f.children) f.children.forEach(walk);
    else if (f.extension === "md") out.push(f);
  };
  folder.children.forEach(walk);
  return out;
}

// markerKey => { kind, subfolder, defaults, body }
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

    let markers = fm["DFD__MARKER"];
    if (!markers) markers = [kind];
    if (!Array.isArray(markers)) markers = [markers];

    const subfolder = fm["DFD__SUBFOLDER"] || DEFAULT_SUBFOLDERS[kind];
    const defaults = {};
    for (const [k,v] of Object.entries(fm)) {
      if (!k.startsWith("DFD__")) defaults[k] = v;
    }
    const cfg = { kind, subfolder, defaults, body };

    for (const m of markers) {
      const key = String(m).toLowerCase();
      if (!map.has(key)) map.set(key, cfg);
    }
    // also key by canonical kind
    if (!map.has(kind)) map.set(kind, cfg);
  }
  return map;
}

// ---------- detection ----------
const MARKER_RE = /^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;

function parseMarkerString(s){
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
  if (cd?.kind && ["asset","entity","transfer"].includes(cd.kind)) {
    return { kind: cd.kind, inlineName: null };
  }
  const linkStr = typeof el.link==="string" ? el.link.trim() : "";
  const linkMarker = parseMarkerString(linkStr);
  if (linkMarker) return linkMarker;

  const t = firstText(group);
  const textMarker = parseMarkerString(t);
  if (textMarker) return textMarker;

  if (REQUIRE_EXPLICIT_MARKER) return null;

  if (el.type === "arrow") return { kind: "transfer", inlineName: null };
  const nodeTypes = new Set(["rectangle","ellipse","diamond","image","frame"]);
  if (nodeTypes.has(el.type)) return { kind: "asset", inlineName: null };
  return null;
}

// ---------- placement ----------
ea.setView("active");
const view = ea.targetView;
if (!view || !view.file) { new Notice("Open an Excalidraw file first."); return; }

const DRAW_DIR = view.file.parent?.path || "";
const DIAGRAM_BASENAME = baseName(view.file.path);
const PARENT = DB_PARENT_PATH || DRAW_DIR;

function rootFor(kind){
  if (DB_PLACEMENT === "db_folder")    return [PARENT, DB_FOLDER_NAME].filter(Boolean).join("/");
  if (DB_PLACEMENT === "diagram_named")return [PARENT, DIAGRAM_BASENAME].filter(Boolean).join("/");
  return PARENT; // flat
}

const CONFIGS = await loadConfigs();
function cfgFor(keyOrKind){
  const k = String(keyOrKind||"").toLowerCase();
  if (CONFIGS.has(k)) return CONFIGS.get(k);
  // if marker not found, fall back by kind
  if (["asset","entity","transfer"].includes(k) && CONFIGS.has(k)) return CONFIGS.get(k);
  // ultimate fallback
  const kind = ["asset","entity","transfer"].includes(k) ? k : "asset";
  return { kind, subfolder: DEFAULT_SUBFOLDERS[kind], defaults: FALLBACK_DEFAULTS[kind], body: "" };
}

async function ensureRoots(){
  for (const kind of ["asset","entity","transfer"]) {
    const cfg = cfgFor(kind);
    const dir = [rootFor(kind), (cfg.subfolder || DEFAULT_SUBFOLDERS[kind])].filter(Boolean).join("/");
    await ensureFolder(dir);
  }
}
await ensureRoots();
function folderFor(kind){
  const cfg = cfgFor(kind);
  return [rootFor(kind), (cfg.subfolder || DEFAULT_SUBFOLDERS[kind])].filter(Boolean).join("/");
}

// ---------- creation ----------
async function createFromConfig(kind, inlineName, shapeType){
  const cfg = cfgFor(kind);
  const id  = uniqId();

  const namePart  = (inlineName && INCLUDE_NAME_IN_FILENAME) ? `-${slug(inlineName)}` : "";
  const shapePart = (INCLUDE_SHAPE_IN_NAME && shapeType) ? `-${shapeType}` : "";
  const fileBase  = `${kind}${shapePart}${namePart}-${id}`;

  const folder = folderFor(kind);
  let path = `${folder}/${fileBase}.md`;
  let i=2; while (exists(path)) { path = `${folder}/${fileBase}-${i}.md`; i++; }

  // initial FM
  const fm = Object.assign({}, cfg.defaults, { name: inlineName || cfg.defaults?.name || kind, created: nowISO() });
  const fmLines = ["---", ...Object.entries(fm).map(([k,v]) => `${k}: ${typeof v==="string" ? `"${String(v).replace(/"/g,'\\"')}"` : JSON.stringify(v)}`), "---"];
  const content = cfg.body ? fmLines.join("\n") + "\n\n" + cfg.body : fmLines.join("\n") + "\n\n";
  await createFile(path, content);
  return { path, link: fileToWiki(path, view.file.path), name: fileBase };
}

const all  = (ea.getViewElements ? ea.getViewElements() : ea.getElements());
const byId = Object.fromEntries(all.map(e => [e.id, e]));

async function ensureNode(el, kind, inlineName){
  if (!["asset","entity"].includes(kind)) return null;
  const group = groupOf(all, el);

  // respect existing real link
  const existing = group.find(e => typeof e.link==="string" && e.link.startsWith("[["))?.link;
  if (existing) {
    const p = existing.slice(2,-2);
    if (exists(p)) {
      const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
      largest.link = fileToWiki(p, view.file.path);
      ea.copyViewElementsToEAforEditing([largest]);
      return { path: p, link: fileToWiki(p, view.file.path), name: baseName(p) };
    }
  }

  if (REQUIRE_EXPLICIT_MARKER) {
    const d = detectKindAndName(el, group);
    if (!d) return null;
  }

  const node = await createFromConfig(kind, inlineName, el.type);
  const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
  largest.link = node.link; // shortest wikilink on the element itself
  ea.copyViewElementsToEAforEditing([largest]);
  return node;
}

async function ensureTransfer(arr){
  if (arr.type !== "arrow") return;

  // If arrow already linked to a note, don't clobber; just maintain endpoints
  if (typeof arr.link === "string" && arr.link.startsWith("[[")) {
    // handled below after resolving endpoints
  }

  const detected = detectKindAndName(arr, [arr]);
  if (!detected || detected.kind!=="transfer") return;

  const fromId = arr.startBinding?.elementId;
  const toId   = arr.endBinding?.elementId;
  if (!fromId || !toId) return; // must be bound at both ends

  const fromEl = byId[fromId], toEl = byId[toId];
  if (!fromEl || !toEl) return;

  const fromDet = detectKindAndName(fromEl, groupOf(all, fromEl)) || (REQUIRE_EXPLICIT_MARKER ? null : {kind:"asset"});
  const toDet   = detectKindAndName(toEl,   groupOf(all, toEl))   || (REQUIRE_EXPLICIT_MARKER ? null : {kind:"asset"});
  if (!fromDet || !toDet) return;

  const fromNode = await ensureNode(fromEl, fromDet.kind, fromDet.inlineName);
  const toNode   = await ensureNode(toEl,   toDet.kind,   toDet.inlineName);
  if (!fromNode || !toNode) return;

  // Use existing transfer link if present
  if (typeof arr.link==="string" && arr.link.startsWith("[[")) {
    const p = arr.link.slice(2,-2);
    if (exists(p)) {
      const w = fileToWiki(p, view.file.path);
      await ensureArrayFM(fromNode.path, "dfd_out", w);
      await ensureArrayFM(toNode.path,   "dfd_in",  w);
      await appendInline(fromNode.path, "DFD_out", w);
      await appendInline(toNode.path,   "DFD_in",  w);
    }
    return;
  }

  // Create transfer file (filename from endpoint file basenames + id)
  const id  = uniqId();
  const base = `transfer_${slug(baseName(fromNode.path))}-to-${slug(baseName(toNode.path))}-${id}`;
  let tPath = `${folderFor("transfer")}/${base}.md`;
  let j=2; while (exists(tPath)) { tPath = `${folderFor("transfer")}/${base}-${j}.md`; j++; }

  // initial FM and optional body from transfer config
  const tcfg = cfgFor("transfer");
  const fm0 = Object.assign({}, tcfg.defaults, { name: detected.inlineName || tcfg.defaults?.name || "transfer", created: nowISO() });
  const fm0Lines = ["---", ...Object.entries(fm0).map(([k,v]) => `${k}: ${typeof v==="string" ? `"${String(v).replace(/"/g,'\\"')}"` : JSON.stringify(v)}`), "---"];
  const content0 = tcfg.body ? fm0Lines.join("\n") + "\n\n" + tcfg.body : fm0Lines.join("\n") + "\n\n";
  await createFile(tPath, content0);

  const fromW = fileToWiki(fromNode.path, view.file.path);
  const toW   = fileToWiki(toNode.path,   view.file.path);
  const srcW  = fileToWiki(view.file.path, view.file.path);
  await setFM(tPath, (fm) => {
    fm.schema = tcfg.defaults?.schema || FALLBACK_DEFAULTS.transfer.schema;
    fm.type   = tcfg.defaults?.type   || FALLBACK_DEFAULTS.transfer.type;
    fm.from = fromW; fm.to = toW; fm.source_drawing = srcW;
  });

  const xferW = fileToWiki(tPath, view.file.path);
  arr.link = xferW;                 // shortest wikilink on the arrow itself
  const short = "TR-" + uniqId().slice(0,5).toUpperCase();
  arr.customData = { ...(arr.customData||{}), dfd: { ...(arr.customData?.dfd||{}), kind:"transfer", edgeId: short, transferPath: tPath, from: fromW, to: toW } };
  try { if (Array.isArray(arr.points) && arr.points.length === 2) ea.addLabelToLine(arr.id, short); } catch(_){}
  ea.copyViewElementsToEAforEditing([arr]);

  await ensureArrayFM(fromNode.path, "dfd_out", xferW);
  await ensureArrayFM(toNode.path,   "dfd_in",  xferW);
  await appendInline(fromNode.path, "DFD_out", xferW);
  await appendInline(toNode.path,   "DFD_in",  xferW);
}

// ---------- run ----------
const nodes = (ea.getViewElements ? ea.getViewElements() : ea.getElements()).filter(e => e.type!=="arrow");
for (const n of nodes) {
  const d = detectKindAndName(n, groupOf(nodes.concat([]), n) /* safe */) || null;
  if (d && (d.kind==="asset" || d.kind==="entity")) await ensureNode(n, d.kind, d.inlineName);
}
const allEls = ea.getViewElements ? ea.getViewElements() : ea.getElements();
const byId = Object.fromEntries(allEls.map(e => [e.id, e]));
const arrows = allEls.filter(e => e.type==="arrow");
for (const a of arrows) await ensureTransfer(a);

await ea.addElementsToView(false,true,true,true);
new Notice("Linkify DFD v0.7: done");