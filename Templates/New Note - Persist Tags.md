---
aliases: []
publish: true
permalink:
date created:
date modified:
<%*
  // Show active file information
  const activeFile = app.workspace.getActiveFile();
  new Notice("Active file: " + (activeFile ? activeFile.basename : "none") + " | Path: " + (activeFile ? activeFile.path : "none"));
  
  // 1. Capture active file tags using your captureActiveTags function.
  const activeTags = await tp.user.captureActiveTags(tp);
  new Notice("Active tags from file: " + activeTags);
  
  // 2. Build default values for your modal form.
  const defaultValues = {
    Tags: activeTags  // Ensure this key matches your modal form field name
  };
  
  // 3. Get the Modal Forms API.
  const modalForm = app.plugins.plugins.modalforms.api;
  
  // 4. Open the modal form, passing in the default values.
  const result = await modalForm.openForm("tag-picker", { values: defaultValues });
  
  // 5. Retrieve and show what the modal form returned.
  const data = result.getData();
  new Notice("Modal returned: " + JSON.stringify(data));
  
  // 6. Format the result as a YAML frontmatter line.
  let tagsYaml = "";
  if (data && data.Tags) {
    const selectedTags = Array.isArray(data.Tags) ? data.Tags : [data.Tags];
    tagsYaml = `tags: [${selectedTags.join(", ")}]`;
  } else {
    tagsYaml = "tags: []";
  }
  
  // Insert the YAML line into the template.
  tR += tagsYaml;
-%>
---