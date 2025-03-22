---
aliases: []
publish: true
permalink:
date created:
date modified:
tags: <%*
  // Get Modal Forms API
  const modalForm = app.plugins.plugins.modalforms.api;
  const result = await modalForm.openForm('tag-picker');
  
  let tagString = "";
  if(result) {
    const data = result.getData(); // e.g., {"Tags": ["test"]}
    // Check if "Tags" exists and is an array; if not, trim it.
    if (data.Tags && Array.isArray(data.Tags) && data.Tags.length > 0) {
      // Join the tag values with a comma and a space
      tagString = data.Tags.map(t => t.trim()).join(", ");
    } else if(data.Tags) {
      tagString = data.Tags.trim();
    }
  }
  // Output the result in bracket notation.
  tR += `[${tagString}]`;
%>
---

