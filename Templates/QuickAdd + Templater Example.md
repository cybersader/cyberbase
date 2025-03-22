<%*
  // Get the active file (source) and target file objects
  const activeFile = tp.config.active_file ? tp.config.active_file.basename : "None";
  const targetFile = tp.config.target_file ? tp.config.target_file.basename : "None";

  // Output as links using double bracket format
  tR += "Active File: [[" + activeFile + "]]\n";
  tR += "Target File: [[" + targetFile + "]]\n";
_%>

LINKCURRENT: {{LINKCURRENT}}