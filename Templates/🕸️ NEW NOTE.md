---
tags: 
aliases: []
publish: true
permalink:
date created:
date modified:
---

<%*
  const modalForm = app.plugins.plugins.modalforms.api;
  const result = await modalForm.openForm('tag-picker');
  
  if(result) {
    const data = result.getData(); // Returns: { "Tags": ["test"] }
    new Notice("Modal result: " + JSON.stringify(data)); // Debug: should show {"Tags":["test"]}
    
    // Extract the tag from the "Tags" field.
    // Adjust for array value:
    const tagValue = Array.isArray(data.Tags) ? data.Tags[0] : data.Tags;
    
    await app.fileManager.processFrontMatter(tp.config.target_file, frontmatter => {
      // Ensure there is a tags array in the frontmatter.
      frontmatter.tags = frontmatter.tags || [];
      // Prepend the '#' symbol if you need it.
      const newTag = `#${tagValue}`;
      if (tagValue && !frontmatter.tags.includes(newTag)) {
        frontmatter.tags.push(newTag);
      }
    });
  } else {
    new Notice("No tag selected");
  }
_%>