module.exports = async function captureActiveTags(tp, fileLink) {
  // Helper: extract file path/filename from a link.
  function extractFilePath(link) {
    // Try markdown link format: [text](url)
    let match = link.match(/\[(.*?)\]\((.*?)\)/);
    if (match && match[2]) {
      return decodeURIComponent(match[2]).trim();
    }
    // Try double bracket format: [[filename]]
    match = link.match(/\[\[(.*?)\]\]/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return link;
  }

  let file;
  if (fileLink) {
    const extracted = extractFilePath(fileLink);
    file = app.vault.getAbstractFileByPath(extracted);
    if (!file) {
      const files = app.vault.getMarkdownFiles();
      file = files.find(f => f.basename === extracted);
      if (!file) {
        new Notice("No file found matching: " + extracted);
      }
    }
  } else {
    file = tp.config.active_file || tp.file;
    if (!file) {
      new Notice("No source file available.");
    }
  }
  
  if (!file) return "";
  
  // Retrieve tags from the file's metadata cache.
  let tagsArray = [];
  const fileCache = app.metadataCache.getFileCache(file);
  if (fileCache && fileCache.frontmatter && fileCache.frontmatter.tags) {
    tagsArray = fileCache.frontmatter.tags;
  } else if (tp.frontmatter && tp.frontmatter.tags) {
    tagsArray = tp.frontmatter.tags;
  } else if (tp.file.tags && tp.file.tags.length > 0) {
    tagsArray = tp.file.tags;
  }
  
  // if (!tagsArray || tagsArray.length === 0) {
  //   new Notice("No tags captured from " + file.basename);
  // }
  
  return Array.isArray(tagsArray) ? tagsArray.join(", ") : tagsArray;
};
