---
aliases: []
publish: true
permalink:
date created:
date modified:
tags: <%*
  // Get Modal Forms API
  const modalForm = app.plugins.plugins.modalforms.api;
  
  // Open your tag-picker form
  const result = await modalForm.openForm('tag-picker');
  
  // Initialize tagString as empty
  let tagString = "";
  
  if(result) {
    const data = result.getData(); // e.g., {"Tags": ["test"]}
    // Extract the value from "Tags" (using the first element if it's an array)
    const tagValue = Array.isArray(data.Tags) ? data.Tags[0] : data.Tags;
    // Build a comma-separated string; in this simple example, we only have one tag.
    if(tagValue) {
      tagString = `#${tagValue}`;
    }
  }
  tR += tagString;
-%>
---

