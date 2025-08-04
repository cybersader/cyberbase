---
aliases: 
tags: 
publish: true
permalink:
title:
date created: Monday, August 4th 2025, 12:48 pm
date modified: Monday, August 4th 2025, 12:49 pm
---

<%*
/*
```js
// Linkify DFD — v0.2 (no onPaste/onDrop)
// - Detect Asset vs Transfer via (A) library markers (customData/link) or (B) hardcoded patterns
// - Create/link Asset notes for node shapes
// - Create/link Transfer notes for arrows, with YAML {from,to,...}
// - Append inline refs on endpoint Asset notes: DFD_out:: / DFD_in::
// - Name transfers: transfer_<from>-to-<to>.md (sanitized)

// --------- CONFIG YOU MAY EDIT ----------
const ASSUME_ALL_ELEMENTS_ARE_DFD = true;   // if true, unmarked nodes => Asset; unmarked arrows => Transfer
const ASSETS_SUBFOLDER    = "Assets";       // created under the current drawing's folder
const TRANSFERS_SUBFOLDER = "Transfers";

// Hardcoded marker -> behavior (Option B)
const HARDCODED_TEMPLATES = {
  "[[TPL:Asset]]": {
    kind: "asset",
    defaults: { schema: "dfd-asset-v1", type: "asset", classification: "", owner: "", systemType: "", url: "" }
  },
  "[[TPL:Transfer]]": {
    kind: "transfer",
    defaults: { schema: "dfd-transfer-v1", type: "transfer", method: "", frequency: "", classification: "", risk: "" }
  },
  // You can add more template markers here...
};

// Reserved keys we use inside element.customData.dfd
const RESERVED_DFD_KEYS = ["kind","template","edgeId","transferPath","from","to"];
// ----------------------------------------

const ea = ExcalidrawAutomate;
ea.reset();

const nowISO = () => new Date().toISOString();
const sanitize = (s) => (s||"").toString().replace(/[\\/#^|?%*:<>"]/g," ").replace(/\s+/g," ").trim();
const slug = (s) => sanitize(s).replace(/\s+/g,"-").toLowerCase() || "unnamed";
const exists = (p) => !!app.vault.getAbstractFileByPath(p);
const readFile = async (p) => await app.vault.read(app.vault.getAbstractFileByPath(p));
const writeFile = async (p,c) => await app.vault.modify(app.vault.getAbstractFileByPath(p), c);
const createFile = async (p,c) => await app.vault.create(p,c);
const ensureFolder = async (folderPath) => {
  if (!folderPath) return;
  const parts = folderPath.split("/").filter(Boolean);
  let cur = "";
  for (const part of parts) {
    cur = cur ? `${cur}/${part}` : part;
    if (!exists(cur)) { try { await app.vault.createFolder(cur); } catch(_){} }
  }
};

ea.setView("active");
const view = ea.targetView;
if(!view || !view.file){ new Notice("No active Excalidraw view."); return; }

const DRAWING_DIR = view.file.parent?.path || "";
const ASSETS_DIR = [DRAWING_DIR, ASSETS_SUBFOLDER].filter(Boolean).join("/");
const TRANSFERS_DIR = [DRAWING_DIR, TRANSFERS_SUBFOLDER].filter(Boolean).join("/");

await ensureFolder(ASSETS_DIR);
await ensureFolder(TRANSFERS_DIR);

// Helper: group elements (by topmost groupId if present)
const all = (ea.getViewElements ? ea.getViewElements() : ea.getElements());
const byId = Object.fromEntries(all.map(e => [e.id, e]));
const getGroupEls = (el) => {
  const gid = (el.groupIds && el.groupIds.length) ? el.groupIds[el.groupIds.length-1] : null;
  return gid ? all.filter(x => x.groupIds && x.groupIds.includes(gid)) : [el];
};
const firstTextIn = (els) => (els.find(e=>e.type==="text" && (e.text||"").trim())?.text||"").trim();
const firstLinkIn = (els) => {
  // Prefer element.link, else scan text for first [[WikiLink]]
  const withLink = els.find(e => typeof e.link==="string" && e.link.trim());
  if (withLink) return withLink.link.trim();
  const t = firstTextIn(els);
  const m = t.match(/\[\[[^\]]+\]\]/); // first [[...]]
  return m ? m[0] : null;
};

// Detect kind template for a node/arrow
function detectKind(el, group) {
  // A) library markers via customData
  const cd = el.customData?.dfd || el.customData?.DFD || null;
  if (cd && (cd.kind==="asset" || cd.kind==="transfer")) {
    return { kind: cd.kind, template: cd.template||null, defaults: cd.defaults||{} };
  }
  // A) library markers via template link in link/text
  const linkOrMarker = firstLinkIn(group);
  if (linkOrMarker && HARDCODED_TEMPLATES[linkOrMarker]) {
    const def = HARDCODED_TEMPLATES[linkOrMarker];
    return { kind: def.kind, template: linkOrMarker, defaults: def.defaults||{} };
  }
  // B) fallback by element.type
  if (ASSUME_ALL_ELEMENTS_ARE_DFD) {
    if (el.type === "arrow") return { kind:"transfer", template:"[[TPL:Transfer]]", defaults: HARDCODED_TEMPLATES["[[TPL:Transfer]]"].defaults };
    const nodeTypes = new Set(["rectangle","ellipse","diamond","image","frame"]);
    if (nodeTypes.has(el.type)) return { kind:"asset", template:"[[TPL:Asset]]", defaults: HARDCODED_TEMPLATES["[[TPL:Asset]]"].defaults };
  }
  return null;
}

// Ensure a group (node) has a linked Asset note; return {path, link, name}
async function ensureAssetForGroup(el) {
  const group = getGroupEls(el);
  const kindInfo = detectKind(el, group);
  if (!kindInfo || kindInfo.kind !== "asset") return null;

  // If already linked -> normalize & return
  const existing = firstLinkIn(group);
  if (existing && existing.startsWith("[[")) {
    // Reuse existing target if it's a real file link
    const target = existing.slice(2,-2);
    if (exists(target)) {
      // also set element.link on the largest in group for click open
      const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
      largest.link = `[[${target}]]`;
      ea.copyViewElementsToEAforEditing([largest]);
      return { path: target, link: `[[${target}]]`, name: sanitize(target.split("/").pop().replace(/\.md$/,"")) };
    }
  }

  // Derive a name from group text or element id
  const raw = firstTextIn(group) || `${el.type}-${el.id.slice(0,6)}`;
  const name = sanitize(raw) || "Asset";
  let path = `${ASSETS_DIR}/${name}.md`;
  let i=2;
  while (exists(path)) { path = `${ASSETS_DIR}/${name}-${i}.md`; i++; }

  const fm = Object.assign({}, kindInfo.defaults, { name, created: nowISO() });
  const yaml = [
    "---",
    ...Object.entries(fm).map(([k,v])=> `${k}: ${typeof v==="string" ? `"${(v||"").replace(/"/g,'\\"')}"` : JSON.stringify(v)}`),
    "---",""
  ].join("\n");
  await createFile(path, yaml);

  // set link on the largest element in the group
  const largest = group.reduce((a,b)=> (a.width*a.height >= b.width*b.height ? a : b), group[0]);
  largest.link = `[[${path}]]`;
  ea.copyViewElementsToEAforEditing([largest]);

  return { path, link: `[[${path}]]`, name };
}

// Append a Dataview inline field if not already present
async function appendInlineField(filePath, field, wikilink) {
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file) return;
  const content = await readFile(filePath);
  const line = `${field}:: ${wikilink}`;
  if (content.includes(line)) return;
  const updated = content.endsWith("\n") ? content + line + "\n" : content + "\n" + line + "\n";
  await writeFile(filePath, updated);
}

// Create/link Transfer for an arrow; also write DFD_out/in on endpoint Assets
async function ensureTransferForArrow(arr) {
  if (arr.type !== "arrow") return;
  const kindInfo = detectKind(arr, [arr]);
  if (!kindInfo || kindInfo.kind !== "transfer") return;

  const fromId = arr.startBinding?.elementId;
  const toId   = arr.endBinding?.elementId;
  if (!fromId || !toId) return; // needs bound endpoints

  const fromEl = byId[fromId], toEl = byId[toId];
  if (!fromEl || !toEl) return;

  const fromAsset = await ensureAssetForGroup(fromEl);
  const toAsset   = await ensureAssetForGroup(toEl);
  if (!fromAsset || !toAsset) return;

  // If arrow already linked to a transfer note, keep it
  const hasLink = typeof arr.link==="string" && arr.link.startsWith("[[");
  if (hasLink) {
    // Still ensure inline DFD refs exist on asset pages
    await appendInlineField(fromAsset.path, "DFD_out", arr.link);
    await appendInlineField(toAsset.path,   "DFD_in",  arr.link);
    return;
  }

  // Create a new Transfer note, named transfer_<from>-to-<to>
  const base = `transfer_${slug(fromAsset.name)}-to-${slug(toAsset.name)}`;
  let transferPath = `${TRANSFERS_DIR}/${base}.md`;
  let j=2;
  while (exists(transferPath)) { transferPath = `${TRANSFERS_DIR}/${base}-${j}.md`; j++; }

  const fm = Object.assign({}, kindInfo.defaults, {
    from: fromAsset.link,
    to:   toAsset.link,
    created: nowISO(),
    source_drawing: `[[${view.file.path}]]`
  });
  const yaml = [
    "---",
    ...Object.entries(fm).map(([k,v])=> `${k}: ${typeof v==="string" ? v : JSON.stringify(v)}`),
    "---",""
  ].join("\n");
  await createFile(transferPath, yaml);

  // Set arrow.link and store some customData
  arr.link = `[[${transferPath}]]`;
  arr.customData = {
    ...(arr.customData||{}),
    dfd: {
      ...(arr.customData?.dfd||{}),
      kind: "transfer",
      transferPath,
      from: fromAsset.link,
      to:   toAsset.link
    }
  };
  ea.copyViewElementsToEAforEditing([arr]);

  // Append DFD_out/DFD_in on endpoint assets
  await appendInlineField(fromAsset.path, "DFD_out", `[[${transferPath}]]`);
  await appendInlineField(toAsset.path,   "DFD_in",  `[[${transferPath}]]`);
}

// --------- MAIN PASS ----------
const nodes = all.filter(e => e.type!=="arrow");
for (const n of nodes) { await ensureAssetForGroup(n); }

const arrows = all.filter(e => e.type==="arrow");
for (const a of arrows) { await ensureTransferForArrow(a); }

// commit element changes
await ea.addElementsToView(false,true,true);
new Notice("Linkify DFD: done");
```
*/
*>