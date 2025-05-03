---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, May 3rd 2025, 2:14 pm
date modified: Saturday, May 3rd 2025, 2:16 pm
---

# MoC

```dataview
table file.ctime as "Created", file.mtime as "Modified"
from ""
where (file.folder = this.file.folder or contains(file.tags, "clippings/github"))
  and file.path != this.file.path
sort file.mtime desc
limit 1000
```
