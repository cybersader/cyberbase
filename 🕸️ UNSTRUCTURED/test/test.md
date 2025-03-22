<%*
  // Call the combined macro to get the YAML frontmatter for tags.
  const tagsYaml = await tp.user.captureAndSelectTags();
  tR += tagsYaml;
_%>