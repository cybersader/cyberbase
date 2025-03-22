module.exports = async function captureAndSelectTags(tp) {
    // 1. Capture active file tags using your existing captureActiveTags macro.
    // This macro should return a comma-separated string (e.g., "work, personal")
    let activeTagsString = await tp.user.captureActiveTags();
    // Convert the captured string into an array of tag values (trim and filter out empty strings)
    const defaultTagsArray = activeTagsString.split(",").map(t => t.trim()).filter(Boolean);
  
    // 2. Build a modal form using the Modal Forms FormBuilder API.
    const modalForm = app.plugins.plugins.modalforms.api;
    const builder = modalForm.builder;
    
    // Build a form with a multiselect field "selectedTags"
    const form = builder("tag-selector", "Select Tags")
      .multiselect({
        name: "selectedTags",
        label: "Choose Tags",
        options: defaultTagsArray,      // Options come from active file's tags
        default: defaultTagsArray       // Preselect them by default (or leave empty if you prefer)
      })
      .build();
  
    // 3. Open the modal form and wait for user input.
    const result = await modalForm.openForm(form);
    const data = result.getData(); // Expect data to be { selectedTags: [ "work", "personal", ... ] }
  
    // 4. Format the selected tags into a YAML frontmatter line without hashtags.
    const tagsFormatted = data.selectedTags && data.selectedTags.length > 0
      ? `[${data.selectedTags.join(", ")}]`
      : "[]";
  
    // Return the YAML line so that QuickAdd capture can insert it.
    return `tags: ${tagsFormatted}`;
};
  