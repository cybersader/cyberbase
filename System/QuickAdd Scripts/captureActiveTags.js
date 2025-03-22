module.exports = async function captureActiveTags(tp) {
  const currentFilePath = tp.file.path(true);
  let tagsArray = [];

  // Attempt 1: Use metadata cache's frontmatter tags.
  const fileCache = app.metadataCache.getFileCache(currentFilePath);
  if (fileCache && fileCache.frontmatter && fileCache.frontmatter.tags) {
    tagsArray = fileCache.frontmatter.tags;
    new Notice("Method 1: Captured tags from metadata cache.");
  }
  
  // Attempt 2: Fallback to tp.frontmatter (if not found above)
  if (!tagsArray || tagsArray.length === 0) {
    const fm = tp.frontmatter || {};
    if (fm.tags) {
      tagsArray = fm.tags;
      new Notice("Method 2: Captured tags from tp.frontmatter.");
    }
  }
  
  // Attempt 3: Fallback to tp.file.tags
  if (!tagsArray || tagsArray.length === 0) {
    if (tp.file.tags && tp.file.tags.length > 0) {
      tagsArray = tp.file.tags;
      new Notice("Method 3: Captured tags from tp.file.tags.");
    }
  }
  
  // Attempt 4: Use active file variable (redundant but for extra safety)
  if (!tagsArray || tagsArray.length === 0) {
    const activeFile = app.workspace.getActiveFile();
    if (activeFile) {
      const fileCache2 = app.metadataCache.getFileCache(activeFile.path);
      if (fileCache2 && fileCache2.frontmatter && fileCache2.frontmatter.tags) {
        tagsArray = fileCache2.frontmatter.tags;
        new Notice("Method 4: Captured tags from active file metadata cache.");
      }
    }
  }
  
  new Notice("Final captured tags: " + JSON.stringify(tagsArray));
  
  // Ensure the result is a comma-separated string.
  return Array.isArray(tagsArray) ? tagsArray.join(", ") : tagsArray;
};
