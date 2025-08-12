/*****************************************************************
 * Linkify DFD — v1.4  (2025-08-12)
 * ---------------------------------------------------------------
 * Fixed: Only process elements with explicit markers/text
 * Fixed: Smart matching for object=name syntax (reuse existing pages)
 * Fixed: Skip auto-generation if legitimate page already linked
 * Added: Better existing page detection and reuse
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const REQUIRE_EXPLICIT_MARKER = true;  // CHANGED: Now true by default to prevent auto-linking everything

// SMART MATCHING - NEW FEATURE
const SMART_CUSTOM_NAME_MATCHING = true;   // If true, "asset=Customer DB" tries to find existing "Customer DB.md" first
const SEARCH_ALL_SUBFOLDERS = true;       // When smart matching, search all relevant subfolders

// Storage options
const DB_PLACEMENT = "db_folder";
const DB_FOLDER_NAME = "DFD Objects Database";
const DB_DB_PARENT_PATH = "📦 VAULT SANDBOX TESTING/Data Flow Diagram Testing";

// Config folder
const CFG_DIR = "./DFD Object Configuration";

// Optional inline fields
const WRITE_INLINE_FIELDS = false;

// Filename behavior for custom names
const CUSTOM_NAME_MODE = "replace";     // "replace" | "inject"

// ARROW DIRECTION DETERMINATION
const DIRECTION_DETERMINATION = "arrowhead_priority";
const BIDIRECTIONAL_MODE = "single_bidirectional";
const TRANSFER_DIRECTION_WORD = "tnf";
const OBJECT_SEPARATOR = "_";

// TRANSFER PROPERTY BEHAVIOR
const INCLUDE_FROM_TO_PROPERTIES = true;
const BIDIRECTIONAL_FROM_TO_BOTH = false;
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

// Normalize vault paths
function normalizePath(path) {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
}

// NEW: Smart search for existing pages by name
function findExistingPageByName(targetName, kind) {
  clog(`🔍 Smart searching for existing page: "${targetName}" (${kind})`);
  
  const searchName = slug(targetName);
  const exactFileName = `${searchName}.md`;
  
  // Strategy 1: Look in the target folder first
  const targetFolder = getTargetFolder(kind);
  const primaryPath = `${targetFolder}/${exactFileName}`;
  
  clog(`  Checking primary path: ${primaryPath}`);
  if (exists(primaryPath)) {
    clog(`  ✓ Found exact match: ${primaryPath}`);
    return primaryPath;
  }
  
  if (!SEARCH_ALL_SUBFOLDERS) {
    clog(`  ✗ Not found, search limited to primary folder`);
    return null;
  }
  
  // Strategy 2: Search all relevant subfolders
  const searchFolders = [];
  if (kind === "asset") searchFolders.push("Assets", "Entities");
  else if (kind === "entity") searchFolders.push("Entities", "Assets");
  
  for (const folder of searchFolders) {
    const searchPath = `${ROOT}/${folder}/${exactFileName}`;
    clog(`  Checking ${folder}: ${searchPath}`);
    if (exists(searchPath)) {
      clog(`  ✓ Found in ${folder}: ${searchPath}`);
      return searchPath;
    }
  }
  
  // Strategy 3: Search by basename across entire vault (last resort)
  clog(`  Searching vault-wide for basename: ${searchName}`);
  const allFiles = app.vault.getMarkdownFiles();
  const found = allFiles.find(f => f.basename.toLowerCase() === searchName.toLowerCase());
  
  if (found) {
    clog(`  ✓ Found vault-wide: ${found.path}`);
    return found.path;
  }
  
  clog(`  ✗ No existing page found for "${targetName}"`);
  return null;
}

// Detect if arrow is bidirectional
function isBidirectional(arrow) {
  const hasStart = arrow.startArrowhead && arrow.startArrowhead !== null;
  const hasEnd = arrow.endArrowhead && arrow.endArrowhead !== null;
  const result = hasStart && hasEnd;
  clog(`Arrow ${arrow.id}: startArrowhead=${arrow.startArrowhead}, endArrowhead=${arrow.endArrowhead} → bidirectional: ${result}`);
  return result;
}

// Determine arrow direction
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
      fromElementId = hasStartBinding;
      toElementId = hasEndBinding;
      directionSource = "binding";
      clog(`  Using binding_only: ${fromElementId} → ${toElementId}`);
      break;
      
    case "arrowhead_priority":
      if (hasEndArrowhead && !hasStartArrowhead) {
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "end_arrowhead";
        clog(`  End arrowhead detected: ${fromElementId} → ${toElementId}`);
      } else if (hasStartArrowhead && !hasEndArrowhead) {
        fromElementId = hasEndBinding;
        toElementId = hasStartBinding;
        directionSource = "start_arrowhead";
        clog(`  Start arrowhead detected (reversed): ${fromElementId} → ${toElementId}`);
      } else if (hasEndArrowhead && hasStartArrowhead) {
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "bidirectional";
        clog(`  Bidirectional arrows: ${fromElementId} ⟷ ${toElementId}`);
      } else {
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = "binding_fallback";
        clog(`  No arrowheads, using binding: ${fromElementId} → ${toElementId}`);
      }
      break;
      
    case "arrowhead_fallback_binding":
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
        fromElementId = hasStartBinding;
        toElementId = hasEndBinding;
        directionSource = hasStartArrowhead && hasEndArrowhead ? "bidirectional" : "binding_fallback";
        clog(`  Fallback to binding: ${fromElementId} → ${toElementId}`);
      }
      break;
      
    default:
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

// Resolve wikilink to actual file path
function resolveLink(linkText, fromPath) {
  clog(`Resolving link: "${linkText}" from ${fromPath}`);
  
  let cleanLink = linkText;
  if (linkText.startsWith("[[") && linkText.endsWith("]]")) {
    cleanLink = linkText.slice(2, -2);
  }
  
  if (cleanLink.includes("|")) {
    cleanLink = cleanLink.split("|")[0];
  }
  
  let resolved = null;
  
  // Strategy 1: Use Obsidian's built-in resolver
  resolved = app.metadataCache.getFirstLinkpathDest(cleanLink, fromPath);
  
  // Strategy 2: Direct path lookup
  if (!resolved) {
    if (exists(cleanLink)) {
      resolved = app.vault.getAbstractFileByPath(cleanLink);
    } else if (exists(`${cleanLink}.md`)) {
      resolved = app.vault.getAbstractFileByPath(`${cleanLink}.md`);
    }
  }
  
  // Strategy 3: Search by filename
  if (!resolved) {
    const filename = cleanLink.split("/").pop();
    const allFiles = app.vault.getMarkdownFiles();
    resolved = allFiles.find(f => f.basename === filename || f.name === filename);
  }
  
  const result = resolved ? resolved.path : null;
  clog(`  → Resolved to: ${result}`);
  return result;
}

/* shortest wiki link */
function shortWiki(path, fromPath) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) {
    clog(`⚠️  File not found for shortWiki: ${path}`);
    return `[[${path}]]`;
  }
  
  const linkText = app.metadataCache.fileToLinktext(file, fromPath);
  const result = `[[${linkText}]]`;
  
  clog(`shortWiki: ${path} → ${result} (from: ${fromPath})`);
  return result;
}

/* ensure folder chain */
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

// Database root path resolution
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

function getTargetFolder(kind) {
  const config = getConfig(kind);
  const result = `${ROOT}/${config.subfolder}`;
  clog(`getTargetFolder(${kind}) → ${result}`);
  return result;
}

await ensureFolder(getTargetFolder("asset"));
await ensureFolder(getTargetFolder("entity"));
await ensureFolder(getTargetFolder("transfer"));

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

// IMPROVED: More strict classification - only processes explicit markers
function classifyElement(el) {
  clog(`\n--- Classifying element ${el.id} (${el.type}) ---`);
  const group = getGroupEls(el);
  
  // Check customData first
  const cd = el.customData?.dfd || el.customData?.DFD;
  if (cd?.kind && ["asset", "entity", "transfer"].includes(cd.kind)) {
    clog(`  ✓ Found in customData: ${cd.kind}`);
    return { kind: cd.kind, customName: null };
  }
  
  // Check element.link (what "Add link" sets) - MUST have marker text
  if (typeof el.link === "string" && el.link.trim()) {
    clog(`  Checking element.link: "${el.link}"`);
    const linkMarker = parseMarker(el.link);
    if (linkMarker) {
      clog(`  ✓ Found valid marker in element.link: ${linkMarker.kind}`);
      return linkMarker;
    }
    
    // NEW: Check if element.link is already a legitimate wikilink to existing file
    if (el.link.includes("[[") && el.link.includes("]]")) {
      const resolvedPath = resolveLink(el.link, view.file.path);
      if (resolvedPath && exists(resolvedPath)) {
        clog(`  ✓ Element already links to legitimate file: ${resolvedPath}`);
        return { kind: "existing", customName: null, existingPath: resolvedPath };
      }
    }
  }
  
  // Check grouped text - MUST have marker text
  const groupText = firstText(group);
  if (groupText) {
    clog(`  Checking group text: "${groupText}"`);
    const textMarker = parseMarker(groupText);
    if (textMarker) {
      clog(`  ✓ Found valid marker in group text: ${textMarker.kind}`);
      return textMarker;
    }
  }
  
  // REMOVED: No more fallback by element type when REQUIRE_EXPLICIT_MARKER = true
  // This prevents every rectangle from getting auto-processed
  
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
  
  clog(`  ✗ No valid classification found`);
  return null;
}

/* ---------- create/ensure nodes ---------- */
async function createNodeNote(kind, customName, shapeType) {
  clog(`\n--- Creating ${kind} note ---`);
  const config = getConfig(kind);
  const folder = getTargetFolder(kind);
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

// IMPROVED: Better existing link detection and smart custom name matching
async function ensureNodeLinked(el, kind, customName, existingPath = null) {
  if (!["asset", "entity"].includes(kind) && kind !== "existing") return null;
  
  clog(`\n--- Ensuring ${kind} node linked ---`);
  const group = getGroupEls(el);
  
  // NEW: If classified as "existing", just normalize the link and return
  if (kind === "existing" && existingPath) {
    clog(`  ✓ Element already has legitimate link, normalizing: ${existingPath}`);
    const wikiLink = shortWiki(existingPath, view.file.path);
    const largest = group.reduce((a, b) => 
      (a.width * a.height >= b.width * b.height ? a : b), group[0]
    );
    largest.link = wikiLink;
    ea.copyViewElementsToEAforEditing([largest]);
    return existingPath;
  }
  
  // Check for existing legitimate wikilinks
  const existingLinkEl = group.find(e => 
    typeof e.link === "string" && 
    e.link.includes("[[") && 
    e.link.includes("]]") &&
    !parseMarker(e.link) // Exclude marker links like "asset=name"
  );
  
  if (existingLinkEl) {
    clog(`  Found existing wikilink: ${existingLinkEl.link}`);
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
  
  // NEW: Smart custom name matching - check if page with exact name already exists
  if (customName && SMART_CUSTOM_NAME_MATCHING) {
    const existingByName = findExistingPageByName(customName, kind);
    if (existingByName) {
      clog(`  ✓ Found existing page for custom name "${customName}": ${existingByName}`);
      const wikiLink = shortWiki(existingByName, view.file.path);
      
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
      note(`✓ ${kind} (reused) → ${wikiLink}`);
      clog(`  ✓ Linked to existing ${kind} → ${wikiLink}`);
      
      return existingByName;
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
  note(`✓ ${kind} (new) → ${wikiLink}`);
  clog(`  ✓ Linked ${kind} → ${wikiLink}`);
  
  return path;
}

/* ---------- Transfer creation helper ---------- */
async function createTransferNote(objectAPath, objectBPath, classification, isBidirectional = false, suffix = "") {
  const config = getConfig("transfer");
  const folder = getTargetFolder("transfer");
  
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

/* ---------- transfers with improved direction detection ---------- */
async function ensureTransfer(arr) {
  clog(`\n--- Processing arrow ${arr.id} ---`);
  const classification = classifyElement(arr);
  if (!classification || classification.kind !== "transfer") {
    clog(`  ✗ Not classified as transfer`);
    return;
  }
  
  clog(`  ✓ Classified as transfer, customName: ${classification.customName}`);
  
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
  
  const bidirectional = direction.isBidirectional;
  if (bidirectional) {
    clog(`  🔄 Detected bidirectional arrow (mode: ${BIDIRECTIONAL_MODE})`);
  }
  
  // Ensure both objects are linked - handle existing links properly
  const startClass = classifyElement(startEl) || { kind: "asset", customName: null };
  const endClass = classifyElement(endEl) || { kind: "asset", customName: null };
  
  const startPath = await ensureNodeLinked(
    startEl, 
    startClass.kind === "existing" ? "existing" : startClass.kind, 
    startClass.customName, 
    startClass.existingPath
  );
  const endPath = await ensureNodeLinked(
    endEl, 
    endClass.kind === "existing" ? "existing" : endClass.kind, 
    endClass.customName, 
    endClass.existingPath
  );
  
  if (!startPath || !endPath) {
    clog(`  ✗ Could not ensure object notes`);
    note("↯ could not ensure object notes");
    return;
  }
  
  clog(`  ✓ Objects: ${startPath} → ${endPath}`);
  
  // Check for existing arrow link (exclude marker links)
  if (typeof arr.link === "string" && arr.link.includes("[[") && arr.link.includes("]]") && !parseMarker(arr.link)) {
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
  
  // Create transfer based on bidirectional mode (rest of transfer logic remains the same)
  if (bidirectional && BIDIRECTIONAL_MODE === "dual_transfers") {
    // Dual transfer logic...
    const path1 = await createTransferNote(startPath, endPath, classification, false, `${OBJECT_SEPARATOR}forward`);
    const path2 = await createTransferNote(endPath, startPath, classification, false, `${OBJECT_SEPARATOR}reverse`);
    
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path1, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.paired_transfer = shortWiki(path2, view.file.path);
      fm.direction_source = direction.directionSource;
      
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
      
      if (INCLUDE_FROM_TO_PROPERTIES) {
        fm.from = endWiki;
        fm.to = startWiki;
      }
    });
    
    const transferWiki = shortWiki(path1, view.file.path);
    arr.link = transferWiki;
    
    const transfer1Wiki = shortWiki(path1, view.file.path);
    const transfer2Wiki = shortWiki(path2, view.file.path);
    
    await pushArr(startPath, "dfd_out", transfer1Wiki);
    await pushArr(startPath, "dfd_in", transfer2Wiki);
    await pushArr(endPath, "dfd_in", transfer1Wiki);
    await pushArr(endPath, "dfd_out", transfer2Wiki);
    
    note(`✓ bidirectional transfers → ${transfer1Wiki} ⟷ ${transfer2Wiki}`);
    clog(`  ✓ Created dual transfers: ${transfer1Wiki} ⟷ ${transfer2Wiki}`);
    
  } else if (bidirectional && BIDIRECTIONAL_MODE === "single_bidirectional") {
    // Single bidirectional logic...
    const path = await createTransferNote(startPath, endPath, classification, true);
    
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.direction_source = direction.directionSource;
      
      if (INCLUDE_FROM_TO_PROPERTIES) {
        if (BIDIRECTIONAL_FROM_TO_BOTH) {
          fm.from = [startWiki, endWiki];
          fm.to = [startWiki, endWiki];
        } else {
          fm.from = startWiki;
          fm.to = endWiki;
        }
      }
    });
    
    const transferWiki = shortWiki(path, view.file.path);
    arr.link = transferWiki;
    
    await pushArr(startPath, "dfd_out", transferWiki);
    await pushArr(startPath, "dfd_in", transferWiki);
    await pushArr(endPath, "dfd_out", transferWiki);
    await pushArr(endPath, "dfd_in", transferWiki);
    
    note(`✓ bidirectional transfer → ${transferWiki}`);
    clog(`  ✓ Created bidirectional transfer: ${transferWiki}`);
    
  } else {
    // Normal unidirectional transfer
    const path = await createTransferNote(startPath, endPath, classification, false);
    
    const startWiki = shortWiki(startPath, view.file.path);
    const endWiki = shortWiki(endPath, view.file.path);
    const sourceWiki = shortWiki(view.file.path, view.file.path);
    
    await setFM(path, fm => {
      fm.object_a = startWiki;
      fm.object_b = endWiki;
      fm.source_drawing = sourceWiki;
      fm.direction_source = direction.directionSource;
      
      if (INCLUDE_FROM_TO_PROPERTIES) {
        fm.from = startWiki;
        fm.to = endWiki;
      }
    });
    
    const transferWiki = shortWiki(path, view.file.path);
    arr.link = transferWiki;
    
    await pushArr(startPath, "dfd_out", transferWiki);
    await pushArr(endPath, "dfd_in", transferWiki);
    
    note(`✓ transfer → ${transferWiki}`);
    clog(`  ✓ Created unidirectional transfer: ${transferWiki}`);
  }
  
  // Clear marker and add metadata
  const edgeId = "TR-" + rnd4().toUpperCase();
  arr.customData = {
    ...(arr.customData || {}),
    dfd: {
      kind: "transfer",
      edgeId,
      bidirectional: bidirectional && BIDIRECTIONAL_MODE !== "ignore_bidirectional",
      mode: BIDIRECTIONAL_MODE,
      directionSource: direction.directionSource
    }
  };
  
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
  clog("\n🚀 Starting Linkify DFD v1.4");
  clog(`📋 Explicit markers required: ${REQUIRE_EXPLICIT_MARKER}`);
  clog(`📋 Smart custom name matching: ${SMART_CUSTOM_NAME_MATCHING}`);
  clog(`📋 Search all subfolders: ${SEARCH_ALL_SUBFOLDERS}`);
  clog(`📋 Direction determination: ${DIRECTION_DETERMINATION}`);
  clog(`📋 Bidirectional mode: ${BIDIRECTIONAL_MODE}`);
  
  // Process nodes first
  const nodeElements = els.filter(e => e.type !== "arrow");
  clog(`\n📦 Processing ${nodeElements.length} node elements`);
  
  for (const el of nodeElements) {
    const classification = classifyElement(el);
    if (classification && (["asset", "entity"].includes(classification.kind) || classification.kind === "existing")) {
      await ensureNodeLinked(el, classification.kind, classification.customName, classification.existingPath);
    }
  }
  
  // Process arrows
  const arrowElements = els.filter(e => e.type === "arrow");
  clog(`\n🏹 Processing ${arrowElements.length} arrow elements`);
  
  for (const el of arrowElements) {
    await ensureTransfer(el);
  }
  
  await ea.addElementsToView(false, true, true, true);
  clog("\n✅ Linkify DFD v1.4: finished");
  note("Linkify DFD v1.4: finished");
})();