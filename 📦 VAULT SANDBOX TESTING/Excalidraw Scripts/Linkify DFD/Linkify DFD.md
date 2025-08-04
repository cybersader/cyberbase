---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 12:48 pm
date modified: Monday, August 4th 2025, 1:57 pm
---

/*
```js*/
// Linkify DFD — v0.4
// - Shortest wikilinks everywhere (and quoted in YAML)
// - Assets + Entities + Transfers
// - Endpoint notes get frontmatter arrays: dfd_out / dfd_in
// - Optional inline fields via WRITE_INLINE_FIELDS
// - Detects types by [[TPL:*]] marker or customData.dfd.kind
// - Names transfers: transfer_<from>-to-<to>.md

// --------- CONFIG ----------
const ASSUME_ALL_ELEMENTS_ARE_DFD = true;   // Unmarked nodes => asset; unmarked arrows => transfer
const WRITE_INLINE_FIELDS = false;          // Also add "DFD_out::"/"DFD_in::" inline fields
const ASSETS_SUBFOLDER    = "Assets";       // All are relative to the drawing’s folder
const ENTITIES_SUBFOLDER  = "Entities";
const TRANSFERS_SUBFOLDER = "Transfers";

const HARDCODED_TEMPLATES = {
  "[[TPL:Asset]]": {
    kind: "asset",
    defaults: { schema: "dfd-asset-v1", type: "asset", classification: "", owner: "", systemType: "", url: "" }
  },
  "[[TPL:Entity]]": {
    kind: "entity",
    defaults: { schema: "dfd-entity-v1", type: "entity", category: "", contact: "", jurisdiction: "" }
  },
  "[[TPL:Transfer]]": {
    kind: "transfer",
    defaults: { schema: "dfd-transfer-v1", type: "transfer", method: "", frequency: "", classification: "", risk: "" }
  },
};
// --------------------------------

const nowISO = () => new Date().toISOString();
const sanitize = (s) => (s||"").toString().replace(/[\\/#^|?%*:<>"]/g," ").replace(/\s+/g," ").trim();
const slug = (s) => sanitize(s).replace(/\s+/g,"-").toLowerCase() || "unnamed";
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

ea.setView("active");
const view = ea.targetView;
if(!view || !view.file){ new Notice("No active Excalidraw view."); return; }

const DRAWING_DIR   = view.file.parent?.path || "";
const ASSETS_DIR    = [DRAWING_DIR, ASSETS_SUBFOLDER].filter(Boolean).join("/");
const ENTITIES_DIR  = [DRAWING_DIR, ENTITIES_SUBFOLDER].filter(Boolean).join("/");
const TRANSFERS_DIR = [DRAWING_DIR, TRANSFERS_SUBFOLDER].filter(Boolean).join("/");
await ensureFolder(ASSETS_DIR); await ensureFolder(ENTITIES_DIR); await ensureFolder(TRANSFERS_DIR);

const all  = (ea.getViewElements ? ea.getViewElements() : ea.getElements());
const byId = Object.fromEntries(all.map(e => [e.id, e]));

// --- shortest wikilink helpers ---
function tfileByPath(p){ return app.vault.getAbstractFileByPath(p); }
function toWikiFrom(p, sourcePath){
  const f = tfileByPath(p);
  if (!f) return `[[${p.replace(/\.md$/,"")}]]`;
  // Shortest linktext relative to the drawing file; wrap to a wikilink
  // (fileToLinktext returns the shortest path text; add [[...]] ourselves)
  const linkText = app.metadataCache.fileToLinktext(f, sourcePath);
  return `[[${linkText}]]`;
}
// Quote wikilink for safe YAML
const q = (wikilink) => `"${wikilink.replace(/"/g,'\\"')}"`;

// --- group & detection helpers ---
const getGroupEls = (el) => {
  const gid = (el.groupIds && el.groupIds.length) ? el.groupIds[el.groupIds.length-1] : null;
  return gid ? all.filter(x => x.groupIds && x.groupIds.includes(gid)) : [el];
};
const firstTextIn = (els) => (els.find(e=>e.type==="text" && (e.text||"").trim())?.text||"").trim();
const firstLinkIn = (els) => {
  const withLink = els.find(e => typeof e.link==="string" && e.link.trim());
  if (withLink) return withLink.link.trim();
  const t = firstTextIn(els);
  const m = t.match(/\[\[[^\]]+\]\]/);
  return m ? m[0] : null;
};

function detectKind(el, group) {
  // A) explicit customData marker
  const cd = el.customData?.dfd || el.customData?.DFD || null;
  if (cd && ["asset","entity","transfer"].includes(cd.kind)) {
    return { kind: cd.kind, template: cd.template||null, defaults: cd.defaults||{} };
  }
  // B) marker link
  const marker = firstLinkIn(group);
  if (marker && HARDCODED_TEMPLATES[marker]) {
    const def = HARDCODED_TEMPLATES[marker];
    return { kind: def.kind, template: marker, defaults: def.defaults||{} };
  }
  // C) fallback (assume DFD)
  if (ASSUME_ALL_ELEMENTS_ARE_DFD) {
    if (el.type === "arrow") return { kind:"transfer", template:"[[TPL:Transfer]]", defaults: HARDCODED_TEMPLATES["[[TPL:Transfer]]"].defaults };
    const nodeTypes = new Set(["rectangle","ellipse","diamond","image","frame"]);
    if (nodeTypes.has(el.type)) return { kind:"asset", template:"[[TPL:Asset]]", defaults: HARDCODED_TEMPLATES["[[TPL:Asset]]"].defaults };
  }
  return null;
}

// --- frontmatter helpers (robust & atomic) ---
async function setFrontmatter(filePath, updater){
  const f = tfileByPath(filePath);
  if (!f) return;
  await app.fileManager.processFrontMatter(f, (fm) => { updater(fm); }); // atomic FM update
}

async function ensureArrayFM(filePath, key, item){
  const f = tfileByPath(filePath);
  if (!f) return;
  await app.fileManager.processFrontMatter(f, (fm) => {
    const a = Array.isArray(fm[key]) ? fm[key] : (fm[key] ? [fm[key]] : []);
    if (!a.includes(item)) a.push(item);
    fm[key] = a;
  });
}

// optional inline (Dataview) fields
async function appendInlineField(filePath, field, wikilink) {
  if (!WRITE_INLINE_FIELDS) return;
  const content = await readFile(filePath);
  const line = `${field}:: ${wikilink}`;
  if (content.includes(line)) return;
  const updated = content.endsWith("\n") ? content + line + "\n" : content + "\n" + line + "\n";
  await writeFile(filePath, updated);
}

// --- create/open helpers ---
async function ensureNote(path, defaults){
  if (!exists(path)) {
    await createFile(path, "---\n---\n");
    await setFrontmatter(path, (fm) => Object.assign(fm, defaults));
  }
  return path;
}

// Ensure note for an Asset/Entity group; return {path, link, name, kind}
async function ensureNodeNote(el, kindInfo) {
  if (!kindInfo || !["asset","entity"].includes(kindInfo.kind)) return null;
  const group = getGroupEls(el);

  // If already links to a real file, normalize and return
  const existing = firstLinkIn(group);
  if (existing?.startsWith("[[")) {
    const target = existing.slice(2,-2);
    if (exists(target)) {
      const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
      largest.link = toWikiFrom(target, view.file.path);  // shortest wikilink
      ea.copyViewElementsToEAforEditing([largest]);
      return { path: target, link: toWikiFrom(target, view.file.path), name: sanitize(target.split("/").pop().replace(/\.md$/,"")), kind: kindInfo.kind };
    }
  }

  const rawName = firstTextIn(group) || `${el.type}-${el.id.slice(0,6)}`;
  const name = sanitize(rawName) || (kindInfo.kind === "entity" ? "Entity" : "Asset");
  const folder = (kindInfo.kind === "entity") ? ENTITIES_DIR : ASSETS_DIR;
  let path = `${folder}/${name}.md`;
  let i=2; while (exists(path)) { path = `${folder}/${name}-${i}.md`; i++; }

  await ensureNote(path, Object.assign({}, kindInfo.defaults, { name, created: nowISO() }));
  const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
  largest.link = toWikiFrom(path, view.file.path);
  ea.copyViewElementsToEAforEditing([largest]);

  return { path, link: toWikiFrom(path, view.file.path), name, kind: kindInfo.kind };
}

async function ensureTransferForArrow(arr) {
  if (arr.type !== "arrow") return;

  const fromId = arr.startBinding?.elementId;
  const toId   = arr.endBinding?.elementId;
  if (!fromId || !toId) return; // must be bound at both ends

  const fromEl = byId[fromId], toEl = byId[toId];
  if (!fromEl || !toEl) return;

  const fromKind = detectKind(fromEl, getGroupEls(fromEl)) || {kind:"asset",defaults:{}};
  const toKind   = detectKind(toEl,   getGroupEls(toEl))   || {kind:"asset",defaults:{}};

  const fromNode = await ensureNodeNote(fromEl, fromKind);
  const toNode   = await ensureNodeNote(toEl,   toKind);
  if (!fromNode || !toNode) return;

  // Keep existing transfer link if present: still ensure FM arrays on endpoints
  if (typeof arr.link==="string" && arr.link.startsWith("[[")) {
    const existingXfer = arr.link.slice(2,-2);
    const xferPath = exists(existingXfer) ? existingXfer : null;
    if (xferPath) {
      const w = toWikiFrom(xferPath, view.file.path);
      await ensureArrayFM(fromNode.path, "dfd_out", w);
      await ensureArrayFM(toNode.path,   "dfd_in",  w);
      await appendInlineField(fromNode.path, "DFD_out", w);
      await appendInlineField(toNode.path,   "DFD_in",  w);
    }
    return;
  }

  // Create transfer file: transfer_<from>-to-<to>.md
  const base = `transfer_${slug(fromNode.name)}-to-${slug(toNode.name)}`;
  let transferPath = `${TRANSFERS_DIR}/${base}.md`;
  let j=2; while (exists(transferPath)) { transferPath = `${TRANSFERS_DIR}/${base}-${j}.md`; j++; }
  await ensureNote(transferPath, { ...(HARDCODED_TEMPLATES["[[TPL:Transfer]]"]?.defaults||{}), created: nowISO() });

  // Fill FM with quoted wikilinks (atomic)
  const fromW = toWikiFrom(fromNode.path, view.file.path);
  const toW   = toWikiFrom(toNode.path,   view.file.path);
  const srcW  = toWikiFrom(view.file.path, view.file.path);
  await setFrontmatter(transferPath, (fm) => {
    fm.schema = "dfd-transfer-v1";
    fm.type = "transfer";
    fm.from = fromW;   // Obsidian will keep as string; quoting not required via processFrontMatter
    fm.to   = toW;
    fm.source_drawing = srcW;
  });

  // Link arrow & label
  const xferWiki = toWikiFrom(transferPath, view.file.path);
  arr.link = xferWiki;
  const shortId = "TR-" + Math.random().toString(36).slice(2,7).toUpperCase();
  arr.customData = {
    ...(arr.customData||{}),
    dfd: { ...(arr.customData?.dfd||{}), kind:"transfer", edgeId: shortId, transferPath, from: fromW, to: toW }
  };
  try { if (Array.isArray(arr.points) && arr.points.length === 2) ea.addLabelToLine(arr.id, shortId); } catch(_) {}
  ea.copyViewElementsToEAforEditing([arr]);

  // Endpoint properties & optional inline fields
  await ensureArrayFM(fromNode.path, "dfd_out", xferWiki);
  await ensureArrayFM(toNode.path,   "dfd_in",  xferWiki);
  await appendInlineField(fromNode.path, "DFD_out", xferWiki);
  await appendInlineField(toNode.path,   "DFD_in",  xferWiki);
}

// ---------- MAIN ----------
const nodes  = all.filter(e => e.type!=="arrow");
for (const n of nodes) {
  const k = detectKind(n, getGroupEls(n));
  if (k && (k.kind==="asset" || k.kind==="entity")) {
    await ensureNodeNote(n, k);
  } else if (ASSUME_ALL_ELEMENTS_ARE_DFD && n.type!=="arrow") {
    await ensureNodeNote(n, {kind:"asset",defaults:HARDCODED_TEMPLATES["[[TPL:Asset]]"].defaults});
  }
}
const arrows = all.filter(e => e.type==="arrow");
for (const a of arrows) { await ensureTransferForArrow(a); }

await ea.addElementsToView(false,true,true,true);
new Notice("Linkify DFD: done");

