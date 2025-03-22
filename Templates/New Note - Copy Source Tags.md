---
aliases: []
publish: true
permalink:
date created:
date modified:
<%*
  // Use QuickAdd's LINKCURRENT value.
  const linkCurrent = "{{LINKCURRENT}}";
  new Notice("LINKCURRENT value: " + linkCurrent);
  
  // Call captureActiveTags with the tp object and LINKCURRENT.
  const activeTags = await tp.user.captureActiveTags(tp, linkCurrent);
  new Notice("Active tags captured: " + activeTags);
  
  // Insert the YAML line.
  tR += "tags: [" + activeTags + "]";
%>
---