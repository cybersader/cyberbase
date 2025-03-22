---
aliases: []
publish: true
permalink:
date created:
date modified:
tags: []
---

<%*
  // Get the Modal Forms API and open your "tag-picker" form
  const modalForm = app.plugins.plugins.modalforms.api;
  const result = await modalForm.openForm('tag-picker');
  
  if (result) {
    const data = result.getData();  // Expected: {"Tags": ["test"]}
    // Extract tag value (if multiple, here we use the first)
    const tagValue = Array.isArray(data.Tags) ? data.Tags[0] : data.Tags;
    
    new Notice("Selected tag: " + tagValue); // Debug output

    // Get the current active file (note)
    const currentFile = app.workspace.getActiveFile();
    
    // Update the frontmatter to merge in the new tag
    await app.fileManager.processFrontMatter(currentFile, frontmatter => {
      // Ensure a tags array exists in frontmatter
      frontmatter.tags = frontmatter.tags || [];
      // Merge the new tag (as plain text, without any '#' symbol)
      if (tagValue && !frontmatter.tags.includes(tagValue)) {
        frontmatter.tags.push(tagValue);
      }
    });
  } else {
    new Notice("No tag selected");
  }
_%>