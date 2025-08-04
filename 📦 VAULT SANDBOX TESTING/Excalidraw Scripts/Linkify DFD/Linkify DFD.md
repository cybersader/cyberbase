---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 12:48 pm
date modified: Monday, August 4th 2025, 2:29 pm
---

/*
```js*/
// Linkify DFD — v0.5
// - Processes ONLY marked shapes/arrows (markers or customData) by default
// - Asset, Entity, Transfer notes; shortest wikilinks; stable short IDs
// - Endpoint notes get frontmatter arrays dfd_out[] / dfd_in[]
// - Optional inline fields via WRITE_INLINE_FIELDS

// ======= CONFIG =======
const REQUIRE_EXPLICIT_MARKER = true;      // if true, ignore unmarked elements
const INCLUDE_SHAPE_IN_NAME   = true;      // asset-rectangle-abc12 vs asset-abc12
const WRITE_INLINE_FIELDS     = false;     // also add DFD_out:: / DFD_in:: lines

const ASSETS_SUBFOLDER    = "Assets";      // under the drawing’s folder
const ENTITIES_SUBFOLDER  = "Entities";
const TRANSFERS_SUBFOLDER = "Transfers";

// Marker links used on library items or grouped tiny text
const MARKERS = {
  asset:    "[[TPL:Asset]]",
  entity:   "[[TPL:Entity]]",
  transfer: "[[TPL:Transfer]]",
};

// Default frontmatter per kind
const DEFAULTS = {
  asset:   { schema: "dfd-asset-v1",   type: "asset",   classification: "", owner: "", systemType: "", url: "" },
  entity:  { schema: "dfd-entity-v1",  type: "entity",  category: "", contact: "", jurisdiction: "" },
  transfer:{ schema: "dfd-transfer-v1",type: "transfer",method: "", frequency: "", classification: "", risk: "" },
};
// ======================

const nowISO = () => new Date().toISOString();
const exists = (p) => !!app.vault.getAbstractFileByPath(p);
const createFile = async (p,c) => await app.vault.create(p,c);
const readFile   = async (p) => await app.vault.read(app.vault.getAbstractFileByPath(p));
const writeFile  = async (p,c) => await app.vault.modify(app.vault.getAbstractFileByPath(p), c);

async function ensureFolder(folderPath){
  if (!folderPath) return;
  const parts = folderPath.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) { try { await app.vault.createFolder(cur); } catch(_){} }
  }
}

// Short, stable-ish ID (time base36 + 3 random base36)
function shortId() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2,5)).toLowerCase();
}

function fileToWiki(path, sourcePath) {
  const f = app.vault.getAbstractFileByPath(path);
  const linkText = app.metadataCache.fileToLinktext(f, sourcePath);
  return `[[${linkText}]]`;
} // shortest wikilink relative to the drawing :contentReference[oaicite:3]{index=3}

const baseName = (p) => p.split("/").pop().replace(/\.md$/i,"");
const sanitize = (s) => (s||"").toString().replace(/[\\/#^|?%*:<>"]/g," ").replace(/\s+/g," ").trim();
const slug     = (s) => sanitize(s).replace(/\s+/g,"-").toLowerCase() || "unnamed";

ea.setView("active");
const view = ea.targetView;
if (!view || !view.file) { new Notice("Open an Excalidraw file first."); return; }

const DRAW_DIR   = view.file.parent?.path || "";
const ASSETS_DIR = [DRAW_DIR, ASSETS_SUBFOLDER].filter(Boolean).join("/");
const ENTS_DIR   = [DRAW_DIR, ENTITIES_SUBFOLDER].filter(Boolean).join("/");
const XFERS_DIR  = [DRAW_DIR, TRANSFERS_SUBFOLDER].filter(Boolean).join("/");
await ensureFolder(ASSETS_DIR); await ensureFolder(ENTS_DIR); await ensureFolder(XFERS_DIR);

const all  = (ea.getViewElements ? ea.getViewElements() : ea.getElements());
const byId = Object.fromEntries(all.map(e => [e.id, e]));

const getGroupEls = (el) => {
  const gid = (el.groupIds && el.groupIds.length) ? el.groupIds[el.groupIds.length-1] : null;
  return gid ? all.filter(x => x.groupIds && x.groupIds.includes(gid)) : [el];
};
const firstTextIn = (els) => (els.find(e=>e.type==="text" && (e.text||"").trim())?.text||"").trim();
const firstMarkerIn = (els) => {
  const link = els.find(e => typeof e.link==="string" && e.link.trim())?.link?.trim();
  if (link && [MARKERS.asset, MARKERS.entity, MARKERS.transfer].includes(link)) return link;
  const t = firstTextIn(els);
  const m = t.match(/\[\[[^\]]+\]\]/);
  if (!m) return null;
  const v = m[0];
  return [MARKERS.asset, MARKERS.entity, MARKERS.transfer].includes(v) ? v : null;
};

// Decide element kind
function detectKind(el, group) {
  const cd = el.customData?.dfd || el.customData?.DFD;
  if (cd && ["asset","entity","transfer"].includes(cd.kind)) return { kind: cd.kind };

  const marker = firstMarkerIn(group);
  if (marker === MARKERS.asset)    return { kind:"asset" };
  if (marker === MARKERS.entity)   return { kind:"entity" };
  if (marker === MARKERS.transfer) return { kind:"transfer" };

  if (REQUIRE_EXPLICIT_MARKER) return null;

  if (el.type === "arrow") return { kind:"transfer" };
  const nodeTypes = new Set(["rectangle","ellipse","diamond","image","frame"]);
  if (nodeTypes.has(el.type)) return { kind:"asset" };
  return null;
}

// Frontmatter helpers (atomic) :contentReference[oaicite:4]{index=4}
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
  const out = content.endsWith("\n") ? content + line + "\n" : content + "\n" + line + "\n";
  await writeFile(filePath, out);
}

// Ensure Asset/Entity note for a marked group
async function ensureNodeNote(el, kind){
  if (!["asset","entity"].includes(kind)) return null;

  const group = getGroupEls(el);

  // If any element already links to a real file, normalize and return
  const existingLink = group.find(e => typeof e.link==="string" && e.link.startsWith("[["))?.link;
  if (existingLink) {
    const pathGuess = existingLink.slice(2,-2);
    if (exists(pathGuess)) {
      const target = pathGuess;
      const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
      largest.link = fileToWiki(target, view.file.path);
      ea.copyViewElementsToEAforEditing([largest]);
      return { path: target, link: fileToWiki(target, view.file.path), name: baseName(target), kind };
    }
  }

  // Only create if explicitly marked (or fallback allowed)
  if (REQUIRE_EXPLICIT_MARKER) {
    const hasMarker = !!detectKind(el, group);
    if (!hasMarker) return null;
  }

  const textName = sanitize(firstTextIn(group)) || (kind === "entity" ? "Entity" : "Asset");
  const id = shortId();
  const shapePart = INCLUDE_SHAPE_IN_NAME ? `-${el.type}` : "";
  const fileBase = `${kind}${shapePart}-${id}`;
  const folder = kind === "entity" ? ENTS_DIR : ASSETS_DIR;
  let path = `${folder}/${fileBase}.md`;
  let i=2; while (exists(path)) { path = `${folder}/${fileBase}-${i}.md`; i++; }

  if (!exists(path)) {
    await createFile(path, "---\n---\n");
    await setFM(path, (fm) => Object.assign(fm, DEFAULTS[kind], { name: textName, created: nowISO() }));
  }

  const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
  largest.link = fileToWiki(path, view.file.path);
  ea.copyViewElementsToEAforEditing([largest]);

  return { path, link: fileToWiki(path, view.file.path), name: fileBase, kind };
}

// Transfers for marked arrows
async function ensureTransferForArrow(arr){
  if (arr.type !== "arrow") return;
  const k = detectKind(arr, [arr]);
  if (!k || k.kind !== "transfer") return;

  const fromId = arr.startBinding?.elementId;
  const toId   = arr.endBinding?.elementId;
  if (!fromId || !toId) return; // requires bound endpoints :contentReference[oaicite:5]{index=5}

  const fromEl = byId[fromId], toEl = byId[toId];
  if (!fromEl || !toEl) return;

  const fromKind = (detectKind(fromEl, getGroupEls(fromEl))?.kind) || (REQUIRE_EXPLICIT_MARKER ? null : "asset");
  const toKind   = (detectKind(toEl,   getGroupEls(toEl))?.kind)   || (REQUIRE_EXPLICIT_MARKER ? null : "asset");
  if (!fromKind || !toKind) return;

  const fromNode = await ensureNodeNote(fromEl, fromKind);
  const toNode   = await ensureNodeNote(toEl,   toKind);
  if (!fromNode || !toNode) return;

  // If arrow already points to a transfer note, keep it and ensure endpoint FM
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

  // Build transfer filename from endpoint *file* IDs (not visible text)
  const base = `transfer_${slug(baseName(fromNode.path))}-to-${slug(baseName(toNode.path))}`;
  let tPath = `${XFERS_DIR}/${base}.md`;
  let j=2; while (exists(tPath)) { tPath = `${XFERS_DIR}/${base}-${j}.md`; j++; }

  // Create transfer file & fill FM
  if (!exists(tPath)) { await createFile(tPath, "---\n---\n"); }
  const fromW = fileToWiki(fromNode.path, view.file.path);
  const toW   = fileToWiki(toNode.path,   view.file.path);
  const srcW  = fileToWiki(view.file.path, view.file.path);
  await setFM(tPath, (fm) => {
    Object.assign(fm, DEFAULTS.transfer);
    fm.from = fromW; fm.to = toW;
    fm.source_drawing = srcW;
    fm.created = nowISO();
  });

  // Link the arrow; store small customData; add short label (2-point only)
  const xferW = fileToWiki(tPath, view.file.path);
  arr.link = xferW;
  const short = "TR-" + shortId().slice(0,5).toUpperCase();
  arr.customData = { ...(arr.customData||{}), dfd: { ...(arr.customData?.dfd||{}), kind:"transfer", edgeId: short, transferPath: tPath, from: fromW, to: toW } };
  try { if (Array.isArray(arr.points) && arr.points.length === 2) ea.addLabelToLine(arr.id, short); } catch(_){}
  ea.copyViewElementsToEAforEditing([arr]);

  // Endpoint FM + optional inline
  await ensureArrayFM(fromNode.path, "dfd_out", xferW);
  await ensureArrayFM(toNode.path,   "dfd_in",  xferW);
  await appendInline(fromNode.path, "DFD_out", xferW);
  await appendInline(toNode.path,   "DFD_in",  xferW);
}

// ========== MAIN ==========
const nodes = all.filter(e => e.type!=="arrow");
for (const n of nodes) {
  const k = detectKind(n, getGroupEls(n));
  if (!k || !["asset","entity"].includes(k.kind)) continue;
  await ensureNodeNote(n, k.kind);
}
const arrows = all.filter(e => e.type==="arrow");
for (const a of arrows) { await ensureTransferForArrow(a); }

await ea.addElementsToView(false,true,true,true);
new Notice("Linkify DFD v0.5: done");