module.exports = async function captureActiveTags(tp, fileLink) {
  // Helper: extract file path or filename from link
  function extractFilePath(link) {
    // Try markdown link format: [text](url)
    let match = link.match(/\[(.*?)\]\((.*?)\)/);
    if (match && match[2]) {
      console.log("Markdown link detected. Text:", match[1], "URL:", match[2]);
      return decodeURIComponent(match[2]).trim();
    }
    // Try double-bracket format: [[filename]]
    match = link.match(/\[\[(.*?)\]\]/);
    if (match && match[1]) {
      console.log("Double bracket format detected. Filename:", match[1]);
      return match[1].trim();
    }
    return link;
  }

  let file;
  if (fileLink) {
    console.log("Received fileLink:", fileLink);
    const extracted = extractFilePath(fileLink);
    new Notice("Extracted file path/name: " + extracted);
    console.log("Extracted file path/name:", extracted);

    // Try to get the file by its direct path.
    file = app.vault.getAbstractFileByPath(extracted);
    if (!file) {
      // If not found by path, try matching by basename.
      const files = app.vault.getMarkdownFiles();
      file = files.find(f => f.basename === extracted);
      if (!file) {
        new Notice("No file found matching (by basename): " + extracted);
        console.log("No file found matching (by basename):", extracted);
      } else {
        new Notice("Found file by basename: " + file.basename);
        console.log("Found file by basename:", file);
      }
    } else {
      new Notice("Found file by path: " + file.basename);
      console.log("Found file by path:", file);
    }
  } else {
    // Use the source file: tp.config.active_file holds the note active when launching the template.
    file = tp.config.active_file || tp.file;
    new Notice("Using source file: " + (file ? file.basename : "none"));
    console.log("Using source file:", file);
  }

  if (!file) {
    new Notice("No file available to capture tags.");
    return "";
  }

  const currentFilePath = file.path;
  new Notice("Using file path: " + currentFilePath);
  console.log("Using file path:", currentFilePath);

  let tagsArray = [];
  
  // Attempt 1: Get tags from metadata cache frontmatter.
  const fileCache = app.metadataCache.getFileCache(currentFilePath);
  if (fileCache && fileCache.frontmatter && fileCache.frontmatter.tags) {
    tagsArray = fileCache.frontmatter.tags;
    new Notice("Method 1: Tags from metadata cache: " + JSON.stringify(tagsArray));
    console.log("Method 1: Tags from metadata cache:", tagsArray);
  }
  
  // Attempt 2: Fallback to tp.frontmatter.
  if ((!tagsArray || tagsArray.length === 0) && tp.frontmatter && tp.frontmatter.tags) {
    tagsArray = tp.frontmatter.tags;
    new Notice("Method 2: Tags from tp.frontmatter: " + JSON.stringify(tagsArray));
    console.log("Method 2: Tags from tp.frontmatter:", tagsArray);
  }
  
  // Attempt 3: Fallback to tp.file.tags.
  if ((!tagsArray || tagsArray.length === 0) && tp.file.tags && tp.file.tags.length > 0) {
    tagsArray = tp.file.tags;
    new Notice("Method 3: Tags from tp.file.tags: " + JSON.stringify(tagsArray));
    console.log("Method 3: Tags from tp.file.tags:", tagsArray);
  }
  
  new Notice("Final captured tags: " + JSON.stringify(tagsArray));
  console.log("Final captured tags:", tagsArray);
  
  // Return as comma-separated string
  return Array.isArray(tagsArray) ? tagsArray.join(", ") : tagsArray;
};
