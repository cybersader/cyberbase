---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Monday, August 11th 2025, 2:50 pm
date modified: Monday, August 11th 2025, 2:59 pm
---

/*
```js*/
/*****************************************************************
 * Linkify DFD — v1.3.1  (2025-08-05)
 * ---------------------------------------------------------------
 * Added: Configurable arrow direction determination logic
 * Fixed: Direction priority between arrowhead vs binding
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const REQUIRE_EXPLICIT_MARKER = false;

// Storage options
const DB_PLACEMENT = "db_folder";       // "flat" | "diagram_named" | "db_folder"
const DB_FOLDER_NAME = "DFD Objects Database";
const DB_DB_PARENT_PATH = "📦 VAULT SANDBOX TESTING/Data Flow Diagram Testing";

// Config folder - can use relative paths like "./DFD Object Configuration"
const CFG_DIR = "./DFD Object Configuration";

// Optional inline fields
const WRITE_INLINE_FIELDS = false;

// Filename behavior for custom names
const CUSTOM_NAME_MODE = "replace";     // "replace" | "inject"

// ARROW DIRECTION DETERMINATION
const DIRECTION_DETERMINATION = "arrowhead_priority";  // Options:
// "binding_only" = Use binding data (startBinding → endBinding) - legacy behavior
// "arrowhead_priority" = Prioritize arrowhead position over binding (recommended)  
// "arrowhead_fallback_binding" = Try arrowhead first, fall back to binding if unclear

// BIDIRECTIONAL ARROW BEHAVIOR
const BIDIRECTIONAL_MODE = "single_bidirectional";  // Options:
// "single_bidirectional" = One transfer note marked as bidirectional
// "dual_transfers" = Two separate transfer notes (A→B and B→A)  
// "ignore_bidirectional" = Treat as normal unidirectional (based on direction determination)

// TRANSFER NAMING CUSTOMIZATION
const TRANSFER_DIRECTION_WORD = "tnf";          // Word used in bidirectional names: "to", "bidirectional", "toandfrom", "tnf"
const OBJECT_SEPARATOR = "_";                   // Separator between objects: "_" or "-"

// TRANSFER PROPERTY BEHAVIOR
const INCLUDE_FROM_TO_PROPERTIES = true;       // Include from:/to: fields for compatibility
const BIDIRECTIONAL_FROM_TO_BOTH = false;     // For bidirectional: put both objects in both from: and to: fields
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

// Normalize vault paths - ensure no leading/trailing slashes
function normalizePath(path) {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
}

// Detect if arrow is bidirectional (arrowheads on both ends)
function isBidirectional(arrow) {
  const hasStart = arrow.startArrowhead && arrow.startArrowhead !== null;
  const hasEnd = arrow.endArrowhead && arrow.endArrowhead !== null;
  const result = hasStart && hasEnd;
  clog(`Arrow ${arrow.id}: startArrowhead=${arrow.startArrowhead}, endArrowhead=${arrow.endArrowhead} → bidirectional: ${result}`);
  return result;
}

// NEW: Determine arrow direction based on configured priority
function determineArrowDirection(arrow) {
  clog(`\n--- Determining direction for arrow ${arrow.id} ---`);
  clog(`  Direction method: ${DIRECTION_DETERMINATION}`);
  
  const hasStartArrowhead = arrow.startArrowhead && arrow.startArrowhead !== null;
  const hasEndArrowhead = arrow.endArrowhead && arrow.endArrowhead !== null;
  const hasStartBinding = arrow.startBinding?.elementId;
  const hasEndBinding = arrow.endBinding?.elementId;
  
  clog(`  Arrowheads: start=${arrow.startArrowhead}, end=${arrow.endArrowhead}`);
  clog(`  Bindings: start=${hasStartBinding}, end=${hasEndBinding}`);
  
  let fromElementId = null;
  let toElementId = null;
  let directionSource = "unknown";
  
  switch (DIRECTION_DETERMINATION) {
    case "binding_only":
      // Legacy behavior: always use binding
      fromElementId = hasStartBinding;
      toElementId = hasEndBinding;
      directionSource = "binding";
      clog(`  Using binding_only: ${fromElementId} → ${toElementId}`);
      break;
      
    case "arrowhead_priority":
      // Prioritize arrowhead position
      if (hasEndArrowhead && !hasStartArrowhead) {
        // Arrow points to end, so start → end
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "end_arrowhead";
        clog(`  End arrowhead detected: ${fromElementId} → ${toElementId}`);
      } else if (hasStartArrowhead && !hasEndArrowhead) {
        // Arrow points to start, so end → start (reverse)
        fromElementId = hasEndBinding;
        toElementId = hasStartBinding;
        directionSource = "start_arrowhead";
        clog(`  Start arrowhead detected (reversed): ${fromElementId} → ${toElementId}`);
      } else if (hasEndArrowhead && hasStartArrowhead) {
        // Bidirectional - will be handled elsewhere
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "bidirectional";
        clog(`  Bidirectional arrows: ${fromElementId} ⟷ ${toElementId}`);
      } else {
        // No arrowheads - fall back to binding
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "binding_fallback";
        clog(`  No arrowheads, using binding: ${fromElementId} → ${toElementId}`);
      }
      break;
      
    case "arrowhead_fallback_binding":
      // Try arrowhead first, comprehensive fallback to binding
      if (hasEndArrowhead && !hasStartArrowhead) {
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "end_arrowhead";
        clog(`  End arrowhead: ${fromElementId} → ${toElementId}`);
      } else if (hasStartArrowhead && !hasEndArrowhead) {
        fromElementId = hasEndBinding;
        toElementId = hasStartBinding;
        directionSource = "start_arrowhead";
        clog(`  Start arrowhead (reversed): ${fromElementId} → ${toElementId}`);
      } else {
        // Fall back to binding for unclear cases
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = hasStartArrowhead && hasEndArrowhead ? "bidirectional" : "binding_fallback";
        clog(`  Fallback to binding: ${fromElementId} → ${toElementId}`);
      }
      break;
      
    default:
      // Default to binding
      fromElementId = hasStartBinding;
      toElementId = hasEndBinding;
      directionSource = "binding_default";
      clog(`  Default binding: ${fromElementId} → ${toElementId}`);
  }
  
  const result = {
    fromElementId,
    toElementId,
    directionSource,
    isBidirectional: hasStartArrowhead && hasEndArrowhead
  };
  
  clog(`  Final direction: ${result.fromElementId} → ${result.toElementId} (source: ${result.directionSource})`);
  return result;
}

// Resolve a wikilink to actual file path - improved for cross-folder resolution
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
  
  // Try multiple resolution strategies
  let resolved = null;
  
  // Strategy 1: Use Obsidian's built-in resolver
  resolved = app.metadataCache.getFirstLinkpathDest(cleanLink, fromPath);
  
  // Strategy 2: If that fails, try direct path lookup (for cross-folder links)
  if (!resolved) {
    // Try as direct path
    if (exists(cleanLink)) {
      resolved = app.vault.getAbstractFileByPath(cleanLink);
    }
    // Try with .md extension
    else if (exists(`${cleanLink}.md`)) {
      resolved = app.vault.getAbstractFileByPath(`${cleanLink}.md`);
    }
  }
  
  // Strategy 3: Search by filename across vault (last resort)
  if (!resolved) {
    const filename = cleanLink.split("/").pop();
    const allFiles = app.vault.getMarkdownFiles();
    resolved = allFiles.find(f => f.basename === filename || f.name === filename);
  }
  
  const result = resolved ? resolved.path : null;
  clog(`  → Resolved to: ${result}`);
  return result;
}

/* shortest wiki link - improved for cross-folder scenarios */
function shortWiki(path, fromPath) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) {
    clog(`⚠️  File not found for shortWiki: ${path}`);
    return `[[${path}]]`;
  }
  
  // For files in different major folder trees, sometimes shorter to use basename
  const linkText = app.metadataCache.fileToLinktext(file, fromPath);
  const result = `[[${linkText}]]`;
  
  clog(`shortWiki: ${path} → ${result} (from: ${fromPath})`);
  return result;
}

/* ensure folder chain - improved vault-wide path handling */
async function ensureFolder(path) {
  if (!path) return;
  const normalizedPath = normalizePath(path);
  clog(`Ensuring folder: ${normalizedPath}`);
  
  const parts = normalizedPath.split("/").filter(Boolean);
  let current = "";
  
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!exists(current)) {
      try { 
        await app.vault.createFolder(current);
        clog(`  Created folder: ${current}`);
      } catch(e) {
        clog(`  Failed to create folder ${current}: ${e.message}`);
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

// Better database root path resolution
const ROOT = (() => {
  switch(DB_PLACEMENT) {
    case "flat": 
      return DRAW_DIR;
    case "diagram_named": 
      return `${DRAW_DIR}/${bn(view.file.path)}`;
    case "db_folder": 
      if (DB_DB_PARENT_PATH) {
        const normalizedParent = normalizePath(DB_DB_PARENT_PATH);
        const result = `${normalizedParent}/${DB_FOLDER_NAME}`;
        clog(`Database path: ${normalizedParent} + ${DB_FOLDER_NAME} = ${result}`);
        return result;
      } else {
        return `${DRAW_DIR}/${DB_FOLDER_NAME}`;
      }
    default: 
      return DRAW_DIR;
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
  const result = `${ROOT}/${config.subfolder}`;
  clog(`targetFolder(${kind}) → ${result}`);
  return result;
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
  
  // Better existing link detection for cross-folder scenarios
  const existingLinkEl = group.find(e => 
    typeof e.link === "string" && 
    e.link.includes("[[") && 
    e.link.includes("]]")
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

/* ---------- Create transfer note helper - IMPROVED with configurable naming ---------- */
async function createTransferNote(objectAPath, objectBPath, classification, isBidirectional = false, suffix = "") {
  const config = getConfig("transfer");
  const folder = targetFolder("transfer");
  
  // Use configurable direction word and object separator
  const direction = isBidirectional ? TRANSFER_DIRECTION_WORD : "to";
  const objA = slug(bn(objectAPath));
  const objB = slug(bn(objectBPath));
  
  const fileName = `transfer${OBJECT_SEPARATOR}${objA}${OBJECT_SEPARATOR}${direction}${OBJECT_SEPARATOR}${objB}${suffix}`;
  let path = `${folder}/${fileName}.md`;
  
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
  
  if (isBidirectional) {
    fm.direction = "bidirectional";
    fm.note = "This transfer represents bidirectional data flow";
  }
  
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
  
  return path;
}

/* ---------- transfers with improved direction detection and bidirectional support ---------- */
async function ensureTransfer(arr) {
  clog(`\n--- Processing arrow ${arr.id} ---`);
  const classification = classifyElement(arr);
  if (!classification || classification.kind !== "transfer") {
    clog(`  ✗ Not classified as transfer`);
    return;
  }
  
  clog(`  ✓ Classified as transfer, customName: ${classification.customName}`);
  
  // NEW: Use improved direction determination
  const direction = determineArrowDirection(arr);
  if (!direction.fromElementId || !direction.toElementId) {
    clog(`  ✗ Could not determine arrow direction`);
    note("↯ could not determine arrow direction");
    return;
  }
  
  const startEl = byId[direction.fromElementId];
  const endEl = byId[direction.toElementId];
  if (!startEl || !endEl) {
    clog(`  ✗ Direction objects not found in element map`);
    note("↯ direction objects not found");
    return;
  }
  
  clog(`  ✓ Found objects: ${startEl.type} → ${endEl.type} (via ${direction.directionSource})`);
  
  // Check if arrow is bidirectional
  const bidirectional = direction.isBidirectional;
  if (bidirectional) {
    clog(`  🔄 Detected bidirectional arrow (mode: ${BIDIRECTIONAL_MODE})`);
  }
  
  // Ensure both objects are linked
  const startClass = classifyElement(startEl) || { kind: "asset", customName: null };
  const endClass = classifyElement(endEl) || { kind: "asset", customName: null };
  
  const startPath = await ensureNodeLinked(startEl, startClass.kind, startClass.customName);
  const endPath = await ensureNodeLinked(endEl, endClass.kind, endClass.customName);
  
  if (!startPath || !endPath) {
    clog(`  ✗ Could not ensure object notes`);
    note("↯ could not ensure object notes");
    return;
  }
  
  clog(`  ✓ Objects: ${startPath} → ${endPath}`);
  
  // Check for existing arrow link
  if (typeof arr.link === "string" && arr.link.includes("[[") && arr.link.includes("]]")) {
    clog(`  Found existing arrow link: ${arr.link}`);
    const existingPath = resolveLink(arr.link, view.file.path);
    if (existingPath && exists(existingPath)) {
      clog(`  ✓ Reusing existing transfer: ${existingPath}`);
      const wikiLink = shortWiki(existingPath, view.file.path);
      // Update object arrays based on bidirectional mode
      if (bidirectional && BIDIRECTIONAL_MODE === "single_bidirectional") {
        await pushArr(startPath, "dfd_out", wikiLink);
        await pushArr(startPath, "dfd_in", wikiLink);
        await pushArr(endPath, "dfd_out", wikiLink);
        await pushArr(endPath, "dfd_in", wikiLink);
      } else {
        await pushArr(startPath, "dfd_out", wikiLink);
        await pushArr(endPath, "dfd_in", wikiLink);
      }
      return;
    }
  }
  
  // Handle different bidirectional modes
  if (bidirectional && BIDIRECTIONAL_MODE === "dual_transfers") {
    clog(`  Creating dual transfers for bidirectional arrow`);
    
    // Create two transfer notes with configurable naming
    const path1 = await createTransferNote(startPath, endPath, classification, false, `${OBJECT_SEPARATOR}forward`);
    const path2 = await createTransferNote(endPath, startPath, classification, false, `${OBJECT_SEPARATOR}reverse`);
    
    // Set frontmatter for both transfers
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path1, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.paired_transfer = shortWiki(path2, view.file.path);
      fm.direction_source = direction.directionSource;
      
      // Optional from/to properties
      if (INCLUDE_FROM_TO_PROPERTIES) {
        fm.from = startWiki;
        fm.to = endWiki;
      }
    });
    
    await setFM(path2, fm => {
      fm.object_a = endWiki;
      fm.object_b = startWiki;
      fm.source_drawing = sourceWiki;
      fm.paired_transfer = shortWiki(path1, view.file.path);
      fm.direction_source = direction.directionSource;
      
      // Optional from/to properties
      if (INCLUDE_FROM_TO_PROPERTIES) {
        fm.from = endWiki;
        fm.to = startWiki;
      }
    });
    
    // Link arrow to primary transfer
    const transferWiki = shortWiki(path1, view.file.path);
    arr.link = transferWiki;
    
    // Update object arrays
    const transfer1Wiki = shortWiki(path1, view.file.path);
    const transfer2Wiki = shortWiki(path2, view.file.path);
    
    await pushArr(startPath, "dfd_out", transfer1Wiki);
    await pushArr(startPath, "dfd_in", transfer2Wiki);
    await pushArr(endPath, "dfd_in", transfer1Wiki);
    await pushArr(endPath, "dfd_out", transfer2Wiki);
    
    note(`✓ bidirectional transfers → ${transfer1Wiki} ⟷ ${transfer2Wiki}`);
    clog(`  ✓ Created dual transfers: ${transfer1Wiki} ⟷ ${transfer2Wiki}`);
    
  } else if (bidirectional && BIDIRECTIONAL_MODE === "single_bidirectional") {
    clog(`  Creating single bidirectional transfer`);
    
    // Create one transfer note marked as bidirectional
    const path = await createTransferNote(startPath, endPath, classification, true);
    
    // Set frontmatter with configurable properties
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.direction_source = direction.directionSource;
      
      // Optional from/to properties with configurable behavior
      if (INCLUDE_FROM_TO_PROPERTIES) {
        if (BIDIRECTIONAL_FROM_TO_BOTH) {
          // Both objects in both fields
          fm.from = [startWiki, endWiki];
          fm.to = [startWiki, endWiki];
        } else {
          // Traditional directional for compatibility
          fm.from = startWiki;
          fm.to = endWiki;
        }
      }
    });
    
    // Link arrow to transfer
    const transferWiki = shortWiki(path, view.file.path);
    arr.link = transferWiki;
    
    // Both objects get both in and out references
    await pushArr(startPath, "dfd_out", transferWiki);
    await pushArr(startPath, "dfd_in", transferWiki);
    await pushArr(endPath, "dfd_out", transferWiki);
    await pushArr(endPath, "dfd_in", transferWiki);
    
    note(`✓ bidirectional transfer → ${transferWiki}`);
    clog(`  ✓ Created bidirectional transfer: ${transferWiki}`);
    
  } else {
    // Normal unidirectional transfer (or ignoring bidirectional)
    clog(`  Creating unidirectional transfer`);
    
    const path = await createTransferNote(startPath, endPath, classification, false);
    
    // Set frontmatter
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.direction_source = direction.directionSource;
      
      // Optional from/to properties
      if (INCLUDE_FROM_TO_PROPERTIES) {
        fm.from = startWiki;
        fm.to = endWiki;
      }
    });
    
    // Link arrow to transfer
    const transferWiki = shortWiki(path, view.file.path);
    arr.link = transferWiki;
    
    // Standard object arrays
    await pushArr(startPath, "dfd_out", transferWiki);
    await pushArr(endPath, "dfd_in", transferWiki);
    
    note(`✓ transfer → ${transferWiki}`);
    clog(`  ✓ Created unidirectional transfer: ${transferWiki}`);
  }
  
  // Clear any existing marker from arrow.link
  if (typeof arr.link === "string" && parseMarker(arr.link)) {
    clog(`  Clearing marker from arrow.link: "${arr.link}"`);
  }
  
  const edgeId = "TR-" + rnd4().toUpperCase();
  if (bidirectional && BIDIRECTIONAL_MODE !== "ignore_bidirectional") {
    arr.customData = {
      ...(arr.customData || {}),
      dfd: {
        kind: "transfer",
        edgeId,
        bidirectional: true,
        mode: BIDIRECTIONAL_MODE,
        directionSource: direction.directionSource
      }
    };
  } else {
    arr.customData = {
      ...(arr.customData || {}),
      dfd: {
        kind: "transfer",
        edgeId,
        bidirectional: false,
        directionSource: direction.directionSource
      }
    };
  }
  
  // Add label to straight arrows
  try {
    if (Array.isArray(arr.points) && arr.points.length === 2) {
      const label = bidirectional && BIDIRECTIONAL_MODE !== "ignore_bidirectional" ? `${edgeId}⟷` : edgeId;
      ea.addLabelToLine(arr.id, label);
      clog(`  ✓ Added label: ${label}`);
    }
  } catch(e) {
    clog(`  ✗ Failed to add label: ${e.message}`);
  }
  
  ea.copyViewElementsToEAforEditing([arr]);
}

/* ---------- main execution ---------- */
(async () => {
  clog("\n🚀 Starting Linkify DFD v1.3.1");
  clog(`📋 Direction determination: ${DIRECTION_DETERMINATION}`);
  clog(`📋 Bidirectional mode: ${BIDIRECTIONAL_MODE}`);
  clog(`📋 Transfer direction word: "${TRANSFER_DIRECTION_WORD}"`);
  clog(`📋 Object separator: "${OBJECT_SEPARATOR}"`);
  clog(`📋 Include from/to properties: ${INCLUDE_FROM_TO_PROPERTIES}`);
  clog(`📋 Bidirectional from/to both: ${BIDIRECTIONAL_FROM_TO_BOTH}`);
  
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
  clog("\n✅ Linkify DFD v1.3.1: finished");
  note("Linkify DFD v1.3.1: finished");
})();