<%*
  const activeTags = await tp.user.captureActiveTags(tp);
  new Notice("Active Tags: " + activeTags);
  tR += "tags: [" + activeTags + "]";
%>