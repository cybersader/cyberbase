module.exports = async function captureActiveTags(tp) {
  // Get the current file path
  const filePath = tp.file.path(true);
  
  // Try to get the file cache from Obsidian's metadataCache.
  let fileCache = app.metadataCache.getFileCache(filePath);
  
  // If fileCache or its frontmatter isn't available yet, wait a bit.
  let attempts = 0;
  while ((!fileCache || !fileCache.frontmatter) && attempts < 10) {
    fileCache = app.metadataCache.getFileCache(filePath);
    attempts++;
  }
  
  // Attempt 1: Use the frontmatter tags from fileCache.
  let tagsArray = [];
  if (fileCache && fileCache.frontmatter && fileCache.frontmatter.tags) {
    tagsArray = fileCache.frontmatter.tags;
    new Notice("Method 1 (metadataCache): " + JSON.stringify(tagsArray));
  }
  
  // Attempt 2: If no tags were found, use tp.file.tags.
  if (!tagsArray || tagsArray.length === 0) {
    tagsArray = tp.file.tags || [];
    new Notice("Method 2 (tp.file.tags): " + JSON.stringify(tagsArray));
  }
  
  // Final debug notice
  new Notice("Final captured tags: " + JSON.stringify(tagsArray));
  
  // Return a comma-separated string of tags (without hashtags)
  return Array.isArray(tagsArray) ? tagsArray.join(", ") : tagsArray;
};
