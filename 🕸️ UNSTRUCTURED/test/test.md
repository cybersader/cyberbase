---
aliases: []
publish: true
permalink:
date created:
date modified:
tags: []  <!-- This will be updated -->
---

<%*
  // Get the Modal Forms API
  const modalForm = app.plugins.plugins.modalforms.api;
  
  // Open your tag-picker form
  const result = await modalForm.openForm('tag-picker');
  
  if (result) {
    // Our form returns { "Tags": ["test"] }
    const data = result.getData();
    // Use the correct key (capital T)
    const tagValue = Array.isArray(data.Tags) ? data.Tags[0] : data.Tags;
    
    // Debug: show what tagValue is
    new Notice("Selected tag: " + tagValue);
    
    // Update the frontmatter tags
    await app.fileManager.processFrontMatter(tp.config.target_file, frontmatter => {
      // Ensure tags is an array
      frontmatter.tags = frontmatter.tags || [];
      const newTag = `#${tagValue}`;
      if (tagValue && !frontmatter.tags.includes(newTag)) {
        frontmatter.tags.push(newTag);
      }
    });
  } else {
    new Notice("No tag selected");
  }
_%>

# New Note Title

Your note content goes here...