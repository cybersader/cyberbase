/*****************************************************************
 * Delete DFD Transfers — v1.4 Companion  (2025-08-12)
 * ---------------------------------------------------------------
 * Deletes all transfer notes associated with current diagram
 * and clears transfer links from arrows. Use with caution!
 ******************************************************************/

/************* USER SETTINGS ************************************/
const DEBUG = true;
const DRY_RUN = true;  // Set to false to actually delete files

// These should match your main script settings
const DB_PLACEMENT = "db_folder";
const DB_FOLDER_NAME = "DFD Objects Database";  
const DB_DB_PARENT_PATH = "📦 VAULT SANDBOX TESTING/Data Flow Diagram Testing";
/****************************************************************/

const note = m => DEBUG && new Notice(m, 4000);
const clog = m => DEBUG && console.log("🗑️  DELETE:", m);

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

// Clear arrow links on the current diagram
async function clearArrowLinks() {
  const els = ea.getViewElements ? ea.getViewElements() : ea.getElements();
  const arrows = els.filter(e => e.type === "arrow");
  let clearedCount = 0;
  
  for (const arrow of arrows) {
    if (typeof arrow.link === "string" && arrow.link.includes("[[") && arrow.link.includes("]]")) {
      clog(`Clearing link from arrow ${arrow.id}: ${arrow.link}`);
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
  clog("\n🗑️  Starting Delete DFD Transfers");
  clog(`DRY RUN: ${DRY_RUN ? "YES (no files will be deleted)" : "NO (files WILL be deleted)"}`);
  
  if (DRY_RUN) {
    note("DRY RUN MODE - No files will be deleted");
  } else {
    note("⚠️  DANGER: Files WILL be permanently deleted!");
  }
  
  // Find associated transfers
  const transfers = await findAssociatedTransfers();
  clog(`Found ${transfers.length} transfer files to delete`);
  
  if (transfers.length === 0) {
    note("No transfer files found for this diagram");
    return;
  }
  
  // Clean up object references first
  const objectsProcessed = await cleanupObjectReferences(transfers);
  clog(`Cleaned references in ${objectsProcessed} object files`);
  
  // Clear arrow links
  const arrowsCleared = await clearArrowLinks();
  clog(`Cleared ${arrowsCleared} arrow links`);
  
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