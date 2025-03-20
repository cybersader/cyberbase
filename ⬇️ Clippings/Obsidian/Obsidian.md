---
aliases: []
tags: []
publish: true
permalink:
date created: Saturday, March 15th 2025, 4:15 pm
date modified: Thursday, March 20th 2025, 1:43 pm
---

# MOC

```dataview
table choice(thumbnailUrl, "![thumb|100](" + thumbnailUrl + ")", "") as Pic, file.ctime as "Created", file.mtime as "Modified"
from ""
where (file.folder = this.file.folder or contains(file.tags, "clippings/obsidian"))
  and file.path != this.file.path
sort file.mtime desc
limit 1000
```
