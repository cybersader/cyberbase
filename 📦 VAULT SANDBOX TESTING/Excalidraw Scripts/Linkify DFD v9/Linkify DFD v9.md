---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 8:01 pm
date modified: Monday, August 4th 2025, 8:02 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD — v0.9  (2025-08-04)
 * ---------------------------------------------------------------
 * Fixes: transfer detection, custom naming, shortest links, 
 * duplicate pages, and element link updates
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const REQUIRE_EXPLICIT_MARKER = false; // false allows fallback type detection

// Storage options
const DB_PLACEMENT = "flat";            // "flat" | "diagram_named" | "db_folder"
const DB_FOLDER_NAME = "DFD Objects Database";
const DB_DB_PARENT_PATH = "";          // if empty, uses drawing's parent folder

// Optional inline Dataview fields
const WRITE_INLINE_FIELDS = false;

// Config folder path
const CFG_DIR = "DFD Object Configuration";

// Filename behavior for custom names
const CUSTOM_NAME_MODE = "replace";     // "replace" | "inject"
/****************************************************************/

/* ---------- helpers ---------- */
const exists = p => !!app.vault.getAbstractFileByPath(p);
const create = (p,c) => app.vault.create(p,c);
const read = (p) => app.vault.read(app.vault.getAbstractFileByPath(p));
const write = (p,c) => app.vault.modify(app.vault.getAbstractFileByPath(p), c);
const bn = p => p.split("/").pop().replace(/\.md$/i,"");
const slug = s => s.replace(/[\\/#^|?%*:<>"]/g," ").trim().replace(/\s+/g,"-").toLowerCase() || "unnamed";
const rnd4 = () => Math.random().toString(36).slice(2,6);
const nowISO = () => new Date().toISOString();
const note = m => DEBUG && new Notice(m, 4000);
const clog = m => DEBUG && console.log(m);

/* shortest wiki link using Obsidian's built-in function */
function shortWiki(path, fromPath) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) return `[[${path}]]`;
  
  const linkText = app.metadataCache.fileToLinktext(file, fromPath);
  return `[[${linkText}]]`;
}

/* ensure folder chain */
async function ensureFolder(path) {
  if (!path) return;
  const parts = path.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) {
      try { await app.vault.createFolder(cur); } catch(e) {}
    }
  }
}

/* frontmatter helpers */
async function setFM(fp, updater) {
  const f = app.vault.getAbstractFileByPath(fp);
  if (f) await app.fileManager.processFrontMatter(f, updater);
}

async function pushArr(fp, key, value) {
  await setFM(fp, fm => {
    const arr = Array.isArray(fm[key]) ? fm[key] : (fm[key] ? [fm[key]] : []);
    if (!arr.includes(value)) arr.push(value);
    fm[key] = arr;
  });
}

async function dvInline(fp, field, val) {
  if (!WRITE_INLINE_FIELDS) return;
  const content = await read(fp);
  const line = `${field}:: ${val}`;
  if (!content.includes(line)) {
    await write(fp, content.endsWith("\n") ? content + line + "\n" : content + "\n" + line + "\n");
  }
}

/* ---------- environment ---------- */
ea.reset();
ea.setView("active");
const view = ea.targetView;
if (!view?.file) {
  new Notice("Open an Excalidraw file first");
  return;
}

const DRAW_DIR = view.file.parent?.path || "";
const ROOT = (() => {
  switch(DB_PLACEMENT) {
    case "flat": return DRAW_DIR;
    case "diagram_named": return `${DRAW_DIR}/${bn(view.file.path)}`;
    case "db_folder": 
      const parentPath = DB_DB_PARENT_PATH || DRAW_DIR;
      return `${parentPath}/${DB_FOLDER_NAME}`;
    default: return DRAW_DIR;
  }
})();

/* ---------- load config notes ---------- */
function allMarkdown(dir) {
  const root = app.vault.getAbstractFileByPath(dir);
  if (!root) return [];
  const out = [];
  const walk = f => {
    if (f.children) f.children.forEach(walk);
    else if (f.extension === "md") out.push(f);
  };
  walk(root);
  return out;
}

const CFG = new Map();
const DEFAULT_SUBFOLDERS = { asset: "Assets", entity: "Entities", transfer: "Transfers" };

// Load config notes
for (const f of allMarkdown(CFG_DIR)) {
  const fc = app.metadataCache.getFileCache(f);
  const fm = fc?.frontmatter || {};
  const kind = (fm["DFD__KIND"] || "").toLowerCase();
  
  if (!["asset", "entity", "transfer"].includes(kind)) continue;
  
  const markers = fm["DFD__MARKER"];
  const markerList = Array.isArray(markers) ? markers : [markers || kind];
  const subfolder = fm["DFD__SUBFOLDER"] || DEFAULT_SUBFOLDERS[kind];
  const defaults = Object.fromEntries(
    Object.entries(fm).filter(([k]) => !k.startsWith("DFD__"))
  );
  
  const pos = fc?.frontmatterPosition;
  const body = pos ? (await app.vault.read(f)).slice(pos.end.offset).trim() : "";
  
  const cfg = { kind, defaults, subfolder, body };
  for (const marker of markerList) {
    CFG.set(marker.toString().toLowerCase(), cfg);
  }
}

function getConfig(key) {
  return CFG.get(key.toLowerCase()) || {
    kind: key,
    defaults: { schema: `dfd-${key}-v1`, type: key },
    subfolder: DEFAULT_SUBFOLDERS[key] || key,
    body: ""
  };
}

function targetFolder(kind) {
  const config = getConfig(kind);
  return `${ROOT}/${config.subfolder}`;
}

await ensureFolder(targetFolder("asset"));
await ensureFolder(targetFolder("entity"));
await ensureFolder(targetFolder("transfer"));

/* ---------- scene parsing ---------- */
const MARK = /^(?:\[\[)?(?:tpl:)?\s*(asset|entity|transfer)\s*(?:=\s*([^\]]+))?(?:\]\])?$/i;
const els = ea.getViewElements ? ea.getViewElements() : ea.getElements();
const byId = Object.fromEntries(els.map(e => [e.id, e]));

function getGroupEls(el) {
  const gid = el.groupIds?.at(-1);
  return gid ? els.filter(x => x.groupIds?.includes(gid)) : [el];
}

function firstText(group) {
  return group.find(e => e.type === "text" && (e.text || "").trim())?.text.trim() || "";
}

function parseMarker(s) {
  if (!s) return null;
  const m = s.trim().match(MARK);
  return m ? { kind: m[1].toLowerCase(), customName: (m[2] || "").trim() || null } : null;
}

function classifyElement(el) {
  const group = getGroupEls(el);
  
  // Check customData first
  const cd = el.customData?.dfd || el.customData?.DFD;
  if (cd?.kind && ["asset", "entity", "transfer"].includes(cd.kind)) {
    return { kind: cd.kind, customName: null };
  }
  
  // Check element.link (what "Add link" sets)
  if (typeof el.link === "string" && el.link.trim()) {
    const linkMarker = parseMarker(el.link);
    if (linkMarker) return linkMarker;
  }
  
  // Check grouped text
  const textMarker = parseMarker(firstText(group));
  if (textMarker) return textMarker;
  
  // Fallback if not requiring explicit markers
  if (!REQUIRE_EXPLICIT_MARKER) {
    if (el.type === "arrow") return { kind: "transfer", customName: null };
    if (["rectangle", "ellipse", "diamond", "image", "frame"].includes(el.type)) {
      return { kind: "asset", customName: null };
    }
  }
  
  return null;
}

/* ---------- create/ensure nodes ---------- */
async function createNodeNote(kind, customName, shapeType) {
  const config = getConfig(kind);
  const folder = targetFolder(kind);
  await ensureFolder(folder);
  
  let fileName;
  if (customName && CUSTOM_NAME_MODE === "replace") {
    fileName = slug(customName);
  } else if (customName && CUSTOM_NAME_MODE === "inject") {
    fileName = `${kind}-${shapeType}-${slug(customName)}-${rnd4()}`;
  } else {
    fileName = `${kind}-${shapeType}-${rnd4()}`;
  }
  
  let path = `${folder}/${fileName}.md`;
  let counter = 2;
  while (exists(path)) {
    path = `${folder}/${fileName}-${counter}.md`;
    counter++;
  }
  
  const fm = Object.assign({}, config.defaults, {
    name: customName || config.defaults.name || kind,
    created: nowISO()
  });
  
  const fmLines = ["---"];
  for (const [key, value] of Object.entries(fm)) {
    fmLines.push(`${key}: ${typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : JSON.stringify(value)}`);
  }
  fmLines.push("---");
  
  const content = config.body ? 
    fmLines.join("\n") + "\n\n" + config.body : 
    fmLines.join("\n") + "\n\n";
  
  await create(path, content);
  return path;
}

async function ensureNodeLinked(el, kind, customName) {
  if (!["asset", "entity"].includes(kind)) return null;
  
  const group = getGroupEls(el);
  
  // Check if already linked to existing file
  const existingLink = group.find(e => 
    typeof e.link === "string" && 
    e.link.startsWith("[[") && 
    e.link.endsWith("]]")
  )?.link;
  
  if (existingLink) {
    const pathGuess = existingLink.slice(2, -2);
    if (exists(pathGuess)) {
      const wikiLink = shortWiki(pathGuess, view.file.path);
      const largest = group.reduce((a, b) => 
        (a.width * a.height >= b.width * b.height ? a : b), group[0]
      );
      largest.link = wikiLink;
      ea.copyViewElementsToEAforEditing([largest]);
      return pathGuess;
    }
  }
  
  // Create new note
  const path = await createNodeNote(kind, customName, el.type);
  const wikiLink = shortWiki(path, view.file.path);
  
  // Update all elements in group
  group.forEach(e => {
    e.link = wikiLink;
    // Remove marker text to prevent duplicates
    if (typeof e.text === "string") {
      e.text = e.text.replace(MARK, "").trim();
    }
  });
  
  ea.copyViewElementsToEAforEditing(group);
  note(`✓ ${kind} → ${wikiLink}`);
  
  return path;
}

/* ---------- transfers ---------- */
async function ensureTransfer(arr) {
  const classification = classifyElement(arr);
  if (!classification || classification.kind !== "transfer") return;
  
  const startId = arr.startBinding?.elementId;
  const endId = arr.endBinding?.elementId;
  
  if (!startId || endId) {
    note("↯ arrow not bound to both endpoints");
    return;
  }
  
  const startEl = byId[startId];
  const endEl = byId[endId];
  if (!startEl || !endEl) {
    note("↯ endpoints not found");
    return;
  }
  
  // Ensure both endpoints are linked
  const startClass = classifyElement(startEl) || { kind: "asset", customName: null };
  const endClass = classifyElement(endEl) || { kind: "asset", customName: null };
  
  const startPath = await ensureNodeLinked(startEl, startClass.kind, startClass.customName);
  const endPath = await ensureNodeLinked(endEl, endClass.kind, endClass.customName);
  
  if (!startPath || !endPath) {
    note("↯ could not ensure endpoint notes");
    return;
  }
  
  // Check if arrow already has a transfer link
  if (typeof arr.link === "string" && arr.link.startsWith("[[") && arr.link.endsWith("]]")) {
    const existingPath = arr.link.slice(2, -2);
    if (exists(existingPath)) {
      const wikiLink = shortWiki(existingPath, view.file.path);
      await pushArr(startPath, "dfd_out", wikiLink);
      await pushArr(endPath, "dfd_in", wikiLink);
      await dvInline(startPath, "DFD_out", wikiLink);
      await dvInline(endPath, "DFD_in", wikiLink);
      return;
    }
  }
  
  // Create transfer note
  const config = getConfig("transfer");
  const folder = targetFolder("transfer");
  
  const fileName = `transfer_${slug(bn(startPath))}-to-${slug(bn(endPath))}`;
  let path = `${folder}/${fileName}.md`;
  
  // Don't add suffix for transfers - keep names clean
  if (exists(path)) {
    path = `${folder}/${fileName}-${rnd4()}.md`;
  }
  
  const fm = Object.assign({}, config.defaults, {
    name: classification.customName || config.defaults.name || "transfer",
    created: nowISO()
  });
  
  const fmLines = ["---"];
  for (const [key, value] of Object.entries(fm)) {
    fmLines.push(`${key}: ${typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : JSON.stringify(value)}`);
  }
  fmLines.push("---");
  
  const content = config.body ? 
    fmLines.join("\n") + "\n\n" + config.body : 
    fmLines.join("\n") + "\n\n";
  
  await create(path, content);
  
  // Update frontmatter with from/to links
  const startWiki = shortWiki(startPath, view.file.path);
  const endWiki = shortWiki(endPath, view.file.path);
  const sourceWiki = shortWiki(view.file.path, view.file.path);
  
  await setFM(path, fm => {
    fm.from = startWiki;
    fm.to = endWiki;
    fm.source_drawing = sourceWiki;
  });
  
  // Update arrow
  const transferWiki = shortWiki(path, view.file.path);
  arr.link = transferWiki;
  
  const edgeId = "TR-" + rnd4().toUpperCase();
  arr.customData = {
    ...(arr.customData || {}),
    dfd: {
      kind: "transfer",
      edgeId,
      transferPath: path,
      from: startWiki,
      to: endWiki
    }
  };
  
  // Add label to straight arrows
  try {
    if (Array.isArray(arr.points) && arr.points.length === 2) {
      ea.addLabelToLine(arr.id, edgeId);
    }
  } catch(e) {}
  
  ea.copyViewElementsToEAforEditing([arr]);
  
  // Update endpoint arrays
  await pushArr(startPath, "dfd_out", transferWiki);
  await pushArr(endPath, "dfd_in", transferWiki);
  await dvInline(startPath, "DFD_out", transferWiki);
  await dvInline(endPath, "DFD_in", transferWiki);
  
  note(`✓ transfer → ${transferWiki}`);
}

/* ---------- main execution ---------- */
(async () => {
  // Process nodes first
  for (const el of els.filter(e => e.type !== "arrow")) {
    const classification = classifyElement(el);
    if (classification && ["asset", "entity"].includes(classification.kind)) {
      await ensureNodeLinked(el, classification.kind, classification.customName);
    }
  }
  
  // Process arrows
  for (const el of els.filter(e => e.type === "arrow")) {
    await ensureTransfer(el);
  }
  
  await ea.addElementsToView(false, true, true, true);
  note("Linkify DFD v0.9: finished");
})();