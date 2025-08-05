---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 8:01 pm
date modified: Monday, August 4th 2025, 9:16 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD — v0.10-DEBUG  (2025-08-04)
 * ---------------------------------------------------------------
 * Fixed: arrow binding check, idempotency, transfer detection
 * Added: extensive console logging for debugging
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const REQUIRE_EXPLICIT_MARKER = false;

// Storage options
const DB_PLACEMENT = "flat";            // "flat" | "diagram_named" | "db_folder"
const DB_FOLDER_NAME = "DFD Objects Database";
const DB_DB_PARENT_PATH = "";

// Config folder - can use relative paths like "./DFD Object Configuration"
const CFG_DIR = "./DFD Object Configuration";  // relative to drawing's folder

// Optional inline fields
const WRITE_INLINE_FIELDS = false;

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
const clog = m => DEBUG && console.log("🔧 DFD:", m);

// Resolve a wikilink to actual file path
function resolveLink(linkText, fromPath) {
  clog(`Resolving link: "${linkText}" from ${fromPath}`);
  
  // Handle [[Link]] format
  let cleanLink = linkText;
  if (linkText.startsWith("[[") && linkText.endsWith("]]")) {
    cleanLink = linkText.slice(2, -2);
  }
  
  // Handle [[Link|Alias]] format
  if (cleanLink.includes("|")) {
    cleanLink = cleanLink.split("|")[0];
  }
  
  const resolved = app.metadataCache.getFirstLinkpathDest(cleanLink, fromPath);
  const result = resolved ? resolved.path : null;
  clog(`  → Resolved to: ${result}`);
  return result;
}

/* shortest wiki link using Obsidian's built-in function */
function shortWiki(path, fromPath) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) {
    clog(`⚠️  File not found for shortWiki: ${path}`);
    return `[[${path}]]`;
  }
  
  const linkText = app.metadataCache.fileToLinktext(file, fromPath);
  const result = `[[${linkText}]]`;
  clog(`shortWiki: ${path} → ${result}`);
  return result;
}

/* ensure folder chain */
async function ensureFolder(path) {
  if (!path) return;
  clog(`Ensuring folder: ${path}`);
  const parts = path.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) {
      try { 
        await app.vault.createFolder(cur);
        clog(`  Created folder: ${cur}`);
      } catch(e) {
        clog(`  Failed to create folder ${cur}: ${e.message}`);
      }
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
clog(`Drawing directory: ${DRAW_DIR}`);

// Resolve CFG_DIR relative to drawing
const RESOLVED_CFG_DIR = CFG_DIR.startsWith("./") ? 
  `${DRAW_DIR}/${CFG_DIR.slice(2)}` : 
  CFG_DIR;
clog(`Config directory: ${RESOLVED_CFG_DIR}`);

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
clog(`Storage root: ${ROOT}`);

/* ---------- load config notes ---------- */
function allMarkdown(dir) {
  clog(`Looking for markdown files in: ${dir}`);
  const root = app.vault.getAbstractFileByPath(dir);
  if (!root) {
    clog(`  Directory not found: ${dir}`);
    return [];
  }
  const out = [];
  const walk = f => {
    if (f.children) f.children.forEach(walk);
    else if (f.extension === "md") out.push(f);
  };
  walk(root);
  clog(`  Found ${out.length} markdown files`);
  return out;
}

const CFG = new Map();
const DEFAULT_SUBFOLDERS = { asset: "Assets", entity: "Entities", transfer: "Transfers" };

// Load config notes
for (const f of allMarkdown(RESOLVED_CFG_DIR)) {
  clog(`Processing config file: ${f.path}`);
  const fc = app.metadataCache.getFileCache(f);
  const fm = fc?.frontmatter || {};
  const kind = (fm["DFD__KIND"] || "").toLowerCase();
  
  if (!["asset", "entity", "transfer"].includes(kind)) {
    clog(`  Skipping - invalid kind: ${kind}`);
    continue;
  }
  
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
    const key = marker.toString().toLowerCase();
    CFG.set(key, cfg);
    clog(`  Registered marker "${key}" → ${kind}`);
  }
}

function getConfig(key) {
  const config = CFG.get(key.toLowerCase()) || {
    kind: key,
    defaults: { schema: `dfd-${key}-v1`, type: key },
    subfolder: DEFAULT_SUBFOLDERS[key] || key,
    body: ""
  };
  clog(`getConfig("${key}") → kind: ${config.kind}, subfolder: ${config.subfolder}`);
  return config;
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

clog(`Found ${els.length} elements on canvas`);

function getGroupEls(el) {
  const gid = el.groupIds?.at(-1);
  const group = gid ? els.filter(x => x.groupIds?.includes(gid)) : [el];
  clog(`Element ${el.id} (${el.type}) has group of ${group.length} elements`);
  return group;
}

function firstText(group) {
  const textEl = group.find(e => e.type === "text" && (e.text || "").trim());
  const result = textEl?.text.trim() || "";
  if (result) clog(`  Found text in group: "${result}"`);
  return result;
}

function parseMarker(s) {
  if (!s) return null;
  const m = s.trim().match(MARK);
  const result = m ? { kind: m[1].toLowerCase(), customName: (m[2] || "").trim() || null } : null;
  if (result) clog(`  Parsed marker "${s}" → kind: ${result.kind}, customName: ${result.customName}`);
  return result;
}

function classifyElement(el) {
  clog(`\n--- Classifying element ${el.id} (${el.type}) ---`);
  const group = getGroupEls(el);
  
  // Check customData first
  const cd = el.customData?.dfd || el.customData?.DFD;
  if (cd?.kind && ["asset", "entity", "transfer"].includes(cd.kind)) {
    clog(`  ✓ Found in customData: ${cd.kind}`);
    return { kind: cd.kind, customName: null };
  }
  
  // Check element.link (what "Add link" sets)
  if (typeof el.link === "string" && el.link.trim()) {
    clog(`  Checking element.link: "${el.link}"`);
    const linkMarker = parseMarker(el.link);
    if (linkMarker) {
      clog(`  ✓ Found in element.link: ${linkMarker.kind}`);
      return linkMarker;
    }
  }
  
  // Check grouped text
  const groupText = firstText(group);
  if (groupText) {
    clog(`  Checking group text: "${groupText}"`);
    const textMarker = parseMarker(groupText);
    if (textMarker) {
      clog(`  ✓ Found in group text: ${textMarker.kind}`);
      return textMarker;
    }
  }
  
  // Fallback if not requiring explicit markers
  if (!REQUIRE_EXPLICIT_MARKER) {
    if (el.type === "arrow") {
      clog(`  ✓ Fallback: arrow → transfer`);
      return { kind: "transfer", customName: null };
    }
    if (["rectangle", "ellipse", "diamond", "image", "frame"].includes(el.type)) {
      clog(`  ✓ Fallback: ${el.type} → asset`);
      return { kind: "asset", customName: null };
    }
  }
  
  clog(`  ✗ No classification found`);
  return null;
}

/* ---------- create/ensure nodes ---------- */
async function createNodeNote(kind, customName, shapeType) {
  clog(`\n--- Creating ${kind} note ---`);
  const config = getConfig(kind);
  const folder = targetFolder(kind);
  await ensureFolder(folder);
  
  let fileName;
  if (customName && CUSTOM_NAME_MODE === "replace") {
    fileName = slug(customName);
    clog(`  Using custom name (replace): ${fileName}`);
  } else if (customName && CUSTOM_NAME_MODE === "inject") {
    fileName = `${kind}-${shapeType}-${slug(customName)}-${rnd4()}`;
    clog(`  Using custom name (inject): ${fileName}`);
  } else {
    fileName = `${kind}-${shapeType}-${rnd4()}`;
    clog(`  Using generated name: ${fileName}`);
  }
  
  let path = `${folder}/${fileName}.md`;
  let counter = 2;
  while (exists(path)) {
    path = `${folder}/${fileName}-${counter}.md`;
    counter++;
  }
  
  clog(`  Final path: ${path}`);
  
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
  clog(`  ✓ Created note: ${path}`);
  return path;
}

async function ensureNodeLinked(el, kind, customName) {
  if (!["asset", "entity"].includes(kind)) return null;
  
  clog(`\n--- Ensuring ${kind} node linked ---`);
  const group = getGroupEls(el);
  
  // Check if already linked to existing file
  const existingLinkEl = group.find(e => 
    typeof e.link === "string" && 
    e.link.startsWith("[[") && 
    e.link.endsWith("]]")
  );
  
  if (existingLinkEl) {
    clog(`  Found existing link: ${existingLinkEl.link}`);
    const actualPath = resolveLink(existingLinkEl.link, view.file.path);
    if (actualPath && exists(actualPath)) {
      clog(`  ✓ Existing file found, reusing: ${actualPath}`);
      const wikiLink = shortWiki(actualPath, view.file.path);
      const largest = group.reduce((a, b) => 
        (a.width * a.height >= b.width * b.height ? a : b), group[0]
      );
      largest.link = wikiLink;
      ea.copyViewElementsToEAforEditing([largest]);
      return actualPath;
    } else {
      clog(`  ✗ Existing link points to non-existent file: ${actualPath}`);
    }
  }
  
  // Create new note
  const path = await createNodeNote(kind, customName, el.type);
  const wikiLink = shortWiki(path, view.file.path);
  
  // Update all elements in group
  group.forEach(e => {
    e.link = wikiLink;
    // Remove marker text to prevent duplicates
    if (typeof e.text === "string" && e.text.match(MARK)) {
      const oldText = e.text;
      e.text = e.text.replace(MARK, "").trim();
      clog(`  Cleaned marker text: "${oldText}" → "${e.text}"`);
    }
  });
  
  ea.copyViewElementsToEAforEditing(group);
  note(`✓ ${kind} → ${wikiLink}`);
  clog(`  ✓ Linked ${kind} → ${wikiLink}`);
  
  return path;
}

/* ---------- transfers ---------- */
async function ensureTransfer(arr) {
  clog(`\n--- Processing arrow ${arr.id} ---`);
  const classification = classifyElement(arr);
  if (!classification || classification.kind !== "transfer") {
    clog(`  ✗ Not classified as transfer`);
    return;
  }
  
  clog(`  ✓ Classified as transfer, customName: ${classification.customName}`);
  
  const startId = arr.startBinding?.elementId;
  const endId = arr.endBinding?.elementId;
  
  clog(`  Bindings: start=${startId}, end=${endId}`);
  
  // FIXED: was "!startId || endId" should be "!startId || !endId"
  if (!startId || !endId) {
    clog(`  ✗ Arrow not bound to both endpoints`);
    note("↯ arrow not bound to both endpoints");
    return;
  }
  
  const startEl = byId[startId];
  const endEl = byId[endId];
  if (!startEl || !endEl) {
    clog(`  ✗ Endpoints not found in element map`);
    note("↯ endpoints not found");
    return;
  }
  
  clog(`  ✓ Found endpoints: ${startEl.type} → ${endEl.type}`);
  
  // Ensure both endpoints are linked
  const startClass = classifyElement(startEl) || { kind: "asset", customName: null };
  const endClass = classifyElement(endEl) || { kind: "asset", customName: null };
  
  const startPath = await ensureNodeLinked(startEl, startClass.kind, startClass.customName);
  const endPath = await ensureNodeLinked(endEl, endClass.kind, endClass.customName);
  
  if (!startPath || !endPath) {
    clog(`  ✗ Could not ensure endpoint notes`);
    note("↯ could not ensure endpoint notes");
    return;
  }
  
  clog(`  ✓ Endpoints: ${startPath} → ${endPath}`);
  
  // Check if arrow already has a valid transfer link
  if (typeof arr.link === "string" && arr.link.startsWith("[[") && arr.link.endsWith("]]")) {
    clog(`  Found existing arrow link: ${arr.link}`);
    const existingPath = resolveLink(arr.link, view.file.path);
    if (existingPath && exists(existingPath)) {
      clog(`  ✓ Reusing existing transfer: ${existingPath}`);
      const wikiLink = shortWiki(existingPath, view.file.path);
      await pushArr(startPath, "dfd_out", wikiLink);
      await pushArr(endPath, "dfd_in", wikiLink);
      await dvInline(startPath, "DFD_out", wikiLink);
      await dvInline(endPath, "DFD_in", wikiLink);
      return;
    } else {
      clog(`  ✗ Existing arrow link points to non-existent file: ${existingPath}`);
    }
  }
  
  // Create transfer note
  const config = getConfig("transfer");
  const folder = targetFolder("transfer");
  
  const fileName = `transfer_${slug(bn(startPath))}-to-${slug(bn(endPath))}`;
  let path = `${folder}/${fileName}.md`;
  
  // Don't add suffix for transfers unless collision
  if (exists(path)) {
    path = `${folder}/${fileName}-${rnd4()}.md`;
    clog(`  File exists, using: ${path}`);
  } else {
    clog(`  Using: ${path}`);
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
  clog(`  ✓ Created transfer note: ${path}`);
  
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
  clog(`  Setting arrow link to: ${transferWiki}`);
  
  // IMPORTANT: Clear the marker from arrow.link if it was there
  if (typeof arr.link === "string" && parseMarker(arr.link)) {
    clog(`  Clearing marker from arrow.link: "${arr.link}"`);
  }
  
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
      clog(`  ✓ Added label: ${edgeId}`);
    }
  } catch(e) {
    clog(`  ✗ Failed to add label: ${e.message}`);
  }
  
  ea.copyViewElementsToEAforEditing([arr]);
  
  // Update endpoint arrays
  await pushArr(startPath, "dfd_out", transferWiki);
  await pushArr(endPath, "dfd_in", transferWiki);
  await dvInline(startPath, "DFD_out", transferWiki);
  await dvInline(endPath, "DFD_in", transferWiki);
  
  note(`✓ transfer → ${transferWiki}`);
  clog(`  ✓ Transfer complete: ${transferWiki}`);
}

/* ---------- main execution ---------- */
(async () => {
  clog("\n🚀 Starting Linkify DFD v0.10-DEBUG");
  
  // Process nodes first
  const nodeElements = els.filter(e => e.type !== "arrow");
  clog(`\n📦 Processing ${nodeElements.length} node elements`);
  
  for (const el of nodeElements) {
    const classification = classifyElement(el);
    if (classification && ["asset", "entity"].includes(classification.kind)) {
      await ensureNodeLinked(el, classification.kind, classification.customName);
    }
  }
  
  // Process arrows
  const arrowElements = els.filter(e => e.type === "arrow");
  clog(`\n🏹 Processing ${arrowElements.length} arrow elements`);
  
  for (const el of arrowElements) {
    await ensureTransfer(el);
  }
  
  await ea.addElementsToView(false, true, true, true);
  clog("\n✅ Linkify DFD v0.10-DEBUG: finished");
  note("Linkify DFD v0.10-DEBUG: finished");
})();