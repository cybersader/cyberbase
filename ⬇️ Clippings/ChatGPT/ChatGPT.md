---
title:
aliases: []
tags: []
publish: true
permalink:
date created: Saturday, March 15th 2025, 2:53 pm
date modified: Saturday, May 3rd 2025, 2:17 pm
---

# MoC

```dataview
table file.ctime as "Created", file.mtime as "Modified"
from ""
where (file.folder = this.file.folder or contains(file.tags, "clippings/chatgpt"))
  and file.path != this.file.path
sort file.mtime desc
limit 1000
```

