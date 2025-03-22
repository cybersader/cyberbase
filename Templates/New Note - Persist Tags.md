---
aliases: []
publish: true
permalink:
date created:
date modified:
<%*
  // Capture LINKCURRENT from QuickAdd's format syntax.
  const linkCurrent = "{{LINKCURRENT}}";  
  new Notice("LINKCURRENT value: " + linkCurrent);

  // 1. Capture active file tags using your captureActiveTags function.
  const activeTagsStr = await tp.user.captureActiveTags(tp, linkCurrent);
  new Notice("Active tags from file: " + activeTagsStr);

  // Convert the comma-separated string into an array.
  const defaultTagsArray = activeTagsStr.split(",").map(t => t.trim()).filter(Boolean);
  new Notice("Default tags array: " + JSON.stringify(defaultTagsArray));

  // 2. Build default values for your modal form.
  // The key "Tags" must match the field name in your modal form definition.
  const defaultValues = {
    Tags: defaultTagsArray
  };

  // 3. Get the Modal Forms API.
  const modalForm = app.plugins.plugins.modalforms.api;
  
  // 4. Open the modal form, passing in the default values.
  const result = await modalForm.openForm("tag-picker", { values: defaultValues });
  
  // 5. Retrieve what the modal form returned.
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
%>
---