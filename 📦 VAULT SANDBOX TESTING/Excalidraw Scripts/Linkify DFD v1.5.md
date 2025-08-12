Looking at your v1.4 code and requirements, I'll help you build the additional scripts and fixes. Here are the solutions:

## 1. Delete Selected Elements Script

```js
/*****************************************************************
 * Delete Selected DFD Elements — v1.5  (2025-08-12)
 * ---------------------------------------------------------------
 * Deletes pages associated with currently selected elements
 * and clears their links. Option to move to trash instead.
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const DRY_RUN = false;  // Set to true for testing
const MOVE_TO_TRASH = true;  // true = move to trash, false = permanent delete
const TRASH_FOLDER_NAME = "DFD_Trash";  // Name of trash folder

// These should match your main script settings
const DB_PLACEMENT = "db_folder";
const DB_FOLDER_NAME = "DFD Objects Database";  
const DB_DB_PARENT_PATH = "📦 VAULT SANDBOX TESTING/Data Flow Diagram Testing";
/****************************************************************/

const note = m => DEBUG && new Notice(m, 4000);
const clog = m => DEBUG && console.log("🗑️  DELETE SELECTED:", m);

function normalizePath(path) {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
}

async function ensureFolder(path) {
  if (!path) return;
  const normalizedPath = normalizePath(path);
  const parts = normalizedPath.split("/").filter(Boolean);
  let current = "";
  
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      try { 
        await app.vault.createFolder(current);
        clog(`  Created folder: ${current}`);
      } catch(e) {
        clog(`  Failed to create folder ${current}: ${e.message}`);
      }
    }
  }
}

function resolveLink(linkText) {
  let cleanLink = linkText;
  if (linkText.startsWith("[[") && linkText.endsWith("]]")) {
    cleanLink = linkText.slice(2, -2);
  }
  if (cleanLink.includes("|")) {
    cleanLink = cleanLink.split("|")[0];
  }
  
  // Try multiple resolution strategies
  let resolved = app.metadataCache.getFirstLinkpathDest(cleanLink, "");
  if (!resolved && app.vault.getAbstractFileByPath(cleanLink)) {
    resolved = app.vault.getAbstractFileByPath(cleanLink);
  }
  if (!resolved && app.vault.getAbstractFileByPath(`${cleanLink}.md`)) {
    resolved = app.vault.getAbstractFileByPath(`${cleanLink}.md`);
  }
  
  return resolved ? resolved.path : null;
}

ea.reset();
ea.setView("active");
const view = ea.targetView;
if (!view?.file) {
  new Notice("Open an Excalidraw file first");
  return;
}

const DRAW_DIR = view.file.parent?.path || "";
const bn = p => p.split("/").pop().replace(/\.md$/i,"");

// Calculate database root
const ROOT = (() => {
  switch(DB_PLACEMENT) {
    case "flat": return DRAW_DIR;
    case "diagram_named": return `${DRAW_DIR}/${bn(view.file.path)}`;
    case "db_folder": 
      if (DB_DB_PARENT_PATH) {
        const normalizedParent = normalizePath(DB_DB_PARENT_PATH);
        return `${normalizedParent}/${DB_FOLDER_NAME}`;
      } else {
        return `${DRAW_DIR}/${DB_FOLDER_NAME}`;
      }
    default: return DRAW_DIR;
  }
})();

const TRASH_FOLDER = MOVE_TO_TRASH ? `${ROOT}/${TRASH_FOLDER_NAME}` : null;

// Get selected elements
function getSelectedElements() {
  const els = ea.getViewElements ? ea.getViewElements() : ea.getElements();
  const selected = els.filter(el => el.isSelected);
  clog(`Found ${selected.length} selected elements`);
  return selected;
}

// Find linked pages for elements
async function findLinkedPages(elements) {
  const linkedPages = new Map(); // elementId -> { path, type }
  
  for (const el of elements) {
    if (typeof el.link === "string" && el.link.includes("[[")) {
      const resolvedPath = resolveLink(el.link);
      if (resolvedPath && app.vault.getAbstractFileByPath(resolvedPath)) {
        linkedPages.set(el.id, { 
          path: resolvedPath, 
          type: el.type,
          elementId: el.id,
          linkText: el.link
        });
        clog(`Element ${el.id} (${el.type}) → ${resolvedPath}`);
      }
    }
  }
  
  return linkedPages;
}

// Clean references from related pages (for transfers)
async function cleanupRelatedReferences(deletedPages) {
  for (const pageInfo of deletedPages.values()) {
    const file = app.vault.getAbstractFileByPath(pageInfo.path);
    if (!file) continue;
    
    try {
      const cache = app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      
      if (fm && (fm.from || fm.to || fm.object_a || fm.object_b)) {
        // This is likely a transfer - clean up endpoint references
        const endpointLinks = [fm.from, fm.to, fm.object_a, fm.object_b].filter(Boolean);
        const transferWikilink = `[[${pageInfo.path.replace(/\.md$/, "")}]]`;
        
        for (const endpointLink of endpointLinks) {
          if (typeof endpointLink === "string" && endpointLink.includes("[[")) {
            const endpointPath = resolveLink(endpointLink);
            const endpointFile = endpointPath ? app.vault.getAbstractFileByPath(endpointPath) : null;
            
            if (endpointFile && !DRY_RUN) {
              clog(`Cleaning transfer reference from ${endpointFile.path}`);
              
              // Remove from arrays
              await app.fileManager.processFrontMatter(endpointFile, fm => {
                if (Array.isArray(fm.dfd_out)) {
                  fm.dfd_out = fm.dfd_out.filter(link => link !== transferWikilink);
                  if (fm.dfd_out.length === 0) delete fm.dfd_out;
                }
                if (Array.isArray(fm.dfd_in)) {
                  fm.dfd_in = fm.dfd_in.filter(link => link !== transferWikilink);
                  if (fm.dfd_in.length === 0) delete fm.dfd_in;
                }
              });
              
              // Remove inline references
              const content = await app.vault.read(endpointFile);
              const lines = content.split("\n");
              const cleanedLines = lines.filter(line => 
                !line.includes(`DFD_out:: ${transferWikilink}`) &&
                !line.includes(`DFD_in:: ${transferWikilink}`)
              );
              
              if (cleanedLines.length !== lines.length) {
                await app.vault.modify(endpointFile, cleanedLines.join("\n"));
              }
            }
          }
        }
      }
    } catch (error) {
      clog(`Error cleaning references for ${pageInfo.path}: ${error.message}`);
    }
  }
}

// Move or delete pages
async function handlePageDeletion(linkedPages) {
  if (MOVE_TO_TRASH && TRASH_FOLDER) {
    await ensureFolder(TRASH_FOLDER);
  }
  
  let processedCount = 0;
  
  for (const pageInfo of linkedPages.values()) {
    const file = app.vault.getAbstractFileByPath(pageInfo.path);
    if (!file) continue;
    
    try {
      if (!DRY_RUN) {
        if (MOVE_TO_TRASH && TRASH_FOLDER) {
          // Move to trash
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const trashName = `${file.basename}_${timestamp}.md`;
          const trashPath = `${TRASH_FOLDER}/${trashName}`;
          
          clog(`Moving ${pageInfo.path} → ${trashPath}`);
          await app.vault.rename(file, trashPath);
        } else {
          // Permanent delete
          clog(`Deleting ${pageInfo.path}`);
          await app.vault.delete(file);
        }
      } else {
        clog(`[DRY RUN] Would ${MOVE_TO_TRASH ? 'move to trash' : 'delete'}: ${pageInfo.path}`);
      }
      processedCount++;
    } catch (error) {
      clog(`Failed to process ${pageInfo.path}: ${error.message}`);
    }
  }
  
  return processedCount;
}

// Clear links from selected elements
async function clearElementLinks(elements, linkedPages) {
  let clearedCount = 0;
  
  for (const el of elements) {
    if (linkedPages.has(el.id)) {
      clog(`Clearing link from element ${el.id}: ${el.link}`);
      if (!DRY_RUN) {
        el.link = "";
        if (el.customData?.dfd) {
          delete el.customData.dfd;
        }
        ea.copyViewElementsToEAforEditing([el]);
      }
      clearedCount++;
    }
  }
  
  if (!DRY_RUN && clearedCount > 0) {
    await ea.addElementsToView(false, true, true, true);
  }
  
  return clearedCount;
}

// Main execution
(async () => {
  clog("\n🗑️  Starting Delete Selected DFD Elements");
  clog(`Mode: ${MOVE_TO_TRASH ? 'MOVE TO TRASH' : 'PERMANENT DELETE'}`);
  clog(`DRY RUN: ${DRY_RUN ? "YES" : "NO"}`);

  if (DRY_RUN) {
    note("DRY RUN MODE - No changes will be made");
  } else {
    const action = MOVE_TO_TRASH ? "moved to trash" : "permanently deleted";
    note(`⚠️  Selected element pages will be ${action}!`);
  }

  const selectedElements = getSelectedElements();
  if (selectedElements.length === 0) {
    note("No elements selected. Select elements first, then run this script.");
    return;
  }

  const linkedPages = await findLinkedPages(selectedElements);
  clog(`Found ${linkedPages.size} linked pages to process`);

  if (linkedPages.size === 0) {
    note("Selected elements have no linked pages to delete.");
    
    // Still clear any marker links
    let clearedMarkers = 0;
    for (const el of selectedElements) {
      if (typeof el.link === "string" && el.link.trim() && !el.link.includes("[[")) {
        // This might be a marker like "asset" or "transfer"
        if (!DRY_RUN) {
          el.link = "";
          ea.copyViewElementsToEAforEditing([el]);
        }
        clearedMarkers++;
      }
    }
    
    if (clearedMarkers > 0 && !DRY_RUN) {
      await ea.addElementsToView(false, true, true, true);
    }
    
    if (clearedMarkers > 0) {
      note(`Cleared ${clearedMarkers} marker links from selected elements`);
    }
    return;
  }

  // Clean up references first (important for transfers)
  await cleanupRelatedReferences(linkedPages);

  // Handle page deletion/moving
  const pagesProcessed = await handlePageDeletion(linkedPages);

  // Clear element links
  const linksCleared = await clearElementLinks(selectedElements, linkedPages);

  const action = MOVE_TO_TRASH ? "moved to trash" : "deleted";
  const summary = `${pagesProcessed} pages ${action}, ${linksCleared} element links cleared`;
  clog(`\n✅ Delete Selected Elements completed: ${summary}`);
  note(DRY_RUN ? `DRY RUN: Would process ${summary}` : `Completed: ${summary}`);
})();
```

## 2. Fixed Delete Transfers Script

```js
/*****************************************************************
 * Delete DFD Transfers — v1.5 Fixed  (2025-08-12)
 * ---------------------------------------------------------------
 * Deletes all transfer notes associated with current diagram
 * and clears transfer links from arrows. Always clears links even if no pages found.
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const DRY_RUN = false;  // Set to false to actually delete files

// These should match your main script settings
const DB_PLACEMENT = "db_folder";
const DB_FOLDER_NAME = "DFD Objects Database";  
const DB_DB_PARENT_PATH = "📦 VAULT SANDBOX TESTING/Data Flow Diagram Testing";
/****************************************************************/

const note = m => DEBUG && new Notice(m, 4000);
const clog = m => DEBUG && console.log("🗑️  DELETE TRANSFERS:", m);

function normalizePath(path) {
  if (!path) return "";
  return path.replace(/^\/+|\/+$/g, "");
}

ea.reset();
ea.setView("active");
const view = ea.targetView;
if (!view?.file) {
  new Notice("Open an Excalidraw file first");
  return;
}

const DRAW_DIR = view.file.parent?.path || "";
const bn = p => p.split("/").pop().replace(/\.md$/i,"");

// Calculate same database root as main script
const ROOT = (() => {
  switch(DB_PLACEMENT) {
    case "flat": 
      return DRAW_DIR;
    case "diagram_named": 
      return `${DRAW_DIR}/${bn(view.file.path)}`;
    case "db_folder": 
      if (DB_DB_PARENT_PATH) {
        const normalizedParent = normalizePath(DB_DB_PARENT_PATH);
        return `${normalizedParent}/${DB_FOLDER_NAME}`;
      } else {
        return `${DRAW_DIR}/${DB_FOLDER_NAME}`;
      }
    default: 
      return DRAW_DIR;
  }
})();

const TRANSFERS_FOLDER = `${ROOT}/Transfers`;
clog(`Transfers folder: ${TRANSFERS_FOLDER}`);

// FIXED: Always clear arrow links regardless of whether transfer files are found
async function clearAllTransferLinks() {
  const els = ea.getViewElements ? ea.getViewElements() : ea.getElements();
  const arrows = els.filter(e => e.type === "arrow");
  let clearedCount = 0;

  for (const arrow of arrows) {
    let shouldClear = false;
    
    // Check if arrow has transfer-related link or customData
    if (typeof arrow.link === "string") {
      if (arrow.link.includes("[[") && arrow.link.includes("]]")) {
        // Check if it's a transfer link (contains "transfer" or points to transfers folder)
        if (arrow.link.toLowerCase().includes("transfer") || 
            arrow.link.includes("/Transfers/") || 
            arrow.link.includes("\\Transfers\\")) {
          shouldClear = true;
        }
      } else if (arrow.link.toLowerCase().includes("transfer")) {
        // Marker link like "transfer" or "transfer=something"
        shouldClear = true;
      }
    }
    
    // Check customData for transfer classification
    if (arrow.customData?.dfd?.kind === "transfer") {
      shouldClear = true;
    }
    
    if (shouldClear) {
      clog(`Clearing link from arrow ${arrow.id}: ${arrow.link || '(customData only)'}`);
      if (!DRY_RUN) {
        arrow.link = "";
        // Clear DFD customData if present
        if (arrow.customData?.dfd) {
          delete arrow.customData.dfd;
        }
        ea.copyViewElementsToEAforEditing([arrow]);
      }
      clearedCount++;
    }
  }

  if (!DRY_RUN && clearedCount > 0) {
    await ea.addElementsToView(false, true, true, true);
  }

  return clearedCount;
}

// Get all transfers that reference this diagram
async function findAssociatedTransfers() {
  const transferFolder = app.vault.getAbstractFileByPath(TRANSFERS_FOLDER);
  if (!transferFolder) {
    clog(`Transfers folder not found: ${TRANSFERS_FOLDER}`);
    return [];
  }

  const diagramPath = view.file.path;
  const diagramName = bn(diagramPath);
  const associated = [];

  // Walk through all files in transfers folder
  const walkFolder = (folder) => {
    if (!folder.children) return;
    for (const child of folder.children) {
      if (child.children) {
        walkFolder(child);
      } else if (child.extension === "md") {
        associated.push(child);
      }
    }
  };

  walkFolder(transferFolder);

  // Filter to only transfers that reference this diagram
  const relevantTransfers = [];
  for (const file of associated) {
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter;

    if (fm && fm.source_drawing) {
      const sourceDrawing = fm.source_drawing.toString();
      // Check if source_drawing references this diagram
      if (sourceDrawing.includes(diagramName) || sourceDrawing.includes(diagramPath)) {
        relevantTransfers.push(file);
        clog(`Found associated transfer: ${file.path}`);
      }
    }
  }

  return relevantTransfers;
}

// Remove transfer references from asset/entity pages
async function cleanupObjectReferences(transferFiles) {
  const processedObjects = new Set();

  for (const transferFile of transferFiles) {
    const cache = app.metadataCache.getFileCache(transferFile);
    const fm = cache?.frontmatter;

    if (fm) {
      const objectLinks = [fm.from, fm.to, fm.object_a, fm.object_b].filter(Boolean);

      for (const objLink of objectLinks) {
        if (typeof objLink === "string" && objLink.includes("[[")) {
          const cleanLink = objLink.replace(/^\[\[|\]\]$/g, "");
          const objFile = app.metadataCache.getFirstLinkpathDest(cleanLink, transferFile.path);

          if (objFile && !processedObjects.has(objFile.path)) {
            processedObjects.add(objFile.path);
            clog(`Cleaning references in object: ${objFile.path}`);

            if (!DRY_RUN) {
              const transferWikilink = `[[${transferFile.path.replace(/\.md$/, "")}]]`;

              // Remove from dfd_out and dfd_in arrays
              await app.fileManager.processFrontMatter(objFile, fm => {
                if (Array.isArray(fm.dfd_out)) {
                  fm.dfd_out = fm.dfd_out.filter(link => link !== transferWikilink);
                  if (fm.dfd_out.length === 0) delete fm.dfd_out;
                }
                if (Array.isArray(fm.dfd_in)) {
                  fm.dfd_in = fm.dfd_in.filter(link => link !== transferWikilink);
                  if (fm.dfd_in.length === 0) delete fm.dfd_in;
                }
              });

              // Remove inline DFD_out:: and DFD_in:: lines if present
              const content = await app.vault.read(objFile);
              const lines = content.split("\n");
              const cleanedLines = lines.filter(line => 
                !line.includes(`DFD_out:: ${transferWikilink}`) &&
                !line.includes(`DFD_in:: ${transferWikilink}`)
              );

              if (cleanedLines.length !== lines.length) {
                await app.vault.modify(objFile, cleanedLines.join("\n"));
              }
            }
          }
        }
      }
    }
  }

  return processedObjects.size;
}

// Main execution
(async () => {
  clog("\n🗑️  Starting Delete DFD Transfers v1.5");
  clog(`DRY RUN: ${DRY_RUN ? "YES (no files will be deleted)" : "NO (files WILL be deleted)"}`);

  if (DRY_RUN) {
    note("DRY RUN MODE - No files will be deleted");
  } else {
    note("⚠️  DANGER: Transfer files WILL be permanently deleted!");
  }

  // FIXED: Always clear arrow links first, regardless of whether transfer files exist
  const arrowsCleared = await clearAllTransferLinks();
  clog(`Cleared ${arrowsCleared} transfer-related arrow links`);

  // Find associated transfers
  const transfers = await findAssociatedTransfers();
  clog(`Found ${transfers.length} transfer files to delete`);

  if (transfers.length === 0) {
    const message = arrowsCleared > 0 
      ? `No transfer files found, but cleared ${arrowsCleared} arrow links`
      : "No transfer files or arrow links found for this diagram";
    note(message);
    return;
  }

  // Clean up object references
  const objectsProcessed = await cleanupObjectReferences(transfers);
  clog(`Cleaned references in ${objectsProcessed} object files`);

  // Delete transfer files
  let deletedCount = 0;
  for (const transferFile of transfers) {
    clog(`Deleting transfer file: ${transferFile.path}`);
    if (!DRY_RUN) {
      try {
        await app.vault.delete(transferFile);
        deletedCount++;
      } catch (error) {
        clog(`Failed to delete ${transferFile.path}: ${error.message}`);
      }
    } else {
      deletedCount++;
    }
  }

  const summary = `Processed: ${transfers.length} transfers, ${objectsProcessed} objects, ${arrowsCleared} arrows`;
  clog(`\n✅ Delete DFD Transfers completed: ${summary}`);
  note(DRY_RUN ? `DRY RUN completed: ${summary}` : `Deleted ${deletedCount} transfer files: ${summary}`);
})();
```

## 3. v1.5 Transfer Naming Fix

Add this function to your main Linkify DFD v1.4 script and replace the transfer creation logic:

```js
// ADD THIS NEW FUNCTION after your existing helper functions:

/* Find next available transfer filename with incrementing numbers */
function findAvailableTransferName(baseName, folder) {
  let fileName = baseName;
  let path = `${folder}/${fileName}.md`;
  
  if (!exists(path)) {
    return { fileName, path, increment: 1 };
  }
  
  // Find the highest existing number
  let maxIncrement = 1;
  let foundPattern = false;
  
  // Check for existing numbered versions
  for (let i = 2; i <= 100; i++) { // reasonable upper limit
    const numberedName = baseName.replace(/^transfer/, `transfer_${i}`);
    const numberedPath = `${folder}/${numberedName}.md`;
    if (exists(numberedPath)) {
      maxIncrement = i;
      foundPattern = true;
    } else if (foundPattern) {
      // Found the gap, use this number
      break;
    }
  }
  
  // Use next available number
  const nextIncrement = foundPattern ? maxIncrement + 1 : 2;
  const finalName = baseName.replace(/^transfer/, `transfer_${nextIncrement}`);
  const finalPath = `${folder}/${finalName}.md`;
  
  clog(`Transfer naming: ${baseName} → ${finalName} (increment: ${nextIncrement})`);
  return { fileName: finalName, path: finalPath, increment: nextIncrement };
}

// REPLACE the createTransferNote function with this improved version:

async function createTransferNote(objectAPath, objectBPath, classification, isBidirectional = false, suffix = "") {
  const config = getConfig("transfer");
  const folder = getTargetFolder("transfer");

  const direction = isBidirectional ? TRANSFER_DIRECTION_WORD : "to";
  const objA = slug(bn(objectAPath));
  const objB = slug(bn(objectBPath));

  const baseName = `transfer${OBJECT_SEPARATOR}${objA}${OBJECT_SEPARATOR}${direction}${OBJECT_SEPARATOR}${objB}${suffix}`;
  
  // FIXED: Use the new incremental naming function
  const { fileName, path, increment } = findAvailableTransferName(baseName, folder);
  
  clog(`Creating transfer note: ${path}${increment > 1 ? ` (version ${increment})` : ''}`);

  const fm = Object.assign({}, config.defaults, {
    name: classification.customName || config.defaults.name || "transfer",
    created: nowISO()
  });

  if (isBidirectional) {
    fm.direction = "bidirectional";
    fm.note = "This transfer represents bidirectional data flow";
  }
  
  // Add version info if incremented
  if (increment > 1) {
    fm.version = increment;
    fm.series_note = `This is version ${increment} of transfers between these objects`;
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
```

## Summary of Changes:

1. **Delete Selected Elements Script** - Handles selected elements, can move to trash or permanently delete, cleans up references
2. **Fixed Delete Transfers Script** - Always clears arrow links even when no transfer files found
3. **v1.5 Transfer Naming** - Automatically increments transfer names (`transfer_2_obj1_to_obj2`, etc.) when duplicates exist

All scripts include comprehensive logging and dry-run modes for safe testing. Set `DRY_RUN = false` when you're ready to execute the actual operations.