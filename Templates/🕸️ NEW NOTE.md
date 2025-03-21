---
aliases: []
<%*
  // Get Modal Forms API
  const modalForm = app.plugins.plugins.modalforms.api;
  
  // Open your tag-picker form (ensure the form is named exactly 'tag-picker')
  const result = await modalForm.openForm('tag-picker');
  
  // If the form returns a result, get the tag value (assuming your field is named "tag")
  if(result) {
    const data = result.getData(); // e.g., { tag: "work" }
    
    // Update the file's frontmatter by merging in the new tag.
    await app.fileManager.processFrontMatter(tp.config.target_file, frontmatter => {
      // Ensure there is a tags array
      frontmatter.tags = frontmatter.tags || [];
      // If you want to add your tag (with a '#' prefix) if it's not already there:
      const newTag = `#${data.tag}`;
      if (!frontmatter.tags.includes(newTag)) {
        frontmatter.tags.push(newTag);
      }
    });
  } else {
    // Optionally, handle the case when no tag is returned.
    new Notice("No tag selected");
  }
_%>
publish: true
permalink:
date created:
date modified: 
---
