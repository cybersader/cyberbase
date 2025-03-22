module.exports = async function captureActiveTags(params) {
    // Use Templater's tp.frontmatter to access the active file's metadata
    const fm = tp.frontmatter || {};
    // Assume tags are stored as an array
    const tags = fm.tags ? fm.tags.join(", ") : "";
    // Return the string (no hashtags added, plain text)
    return tags;
  };
  