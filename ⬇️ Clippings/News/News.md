---
aliases: []
tags: []
publish: true
permalink:
date created: Saturday, March 15th 2025, 2:54 pm
date modified: Thursday, March 20th 2025, 1:42 pm
---

# MOC

```dataview
TABLE choice(favicon, "![favicon|25](" + favicon + ")", "") as Favicon, file.ctime as "Created", file.mtime as "Modified"
FROM ""
WHERE (contains(file.folder, this.file.folder) or contains(file.tags, "-clippings/news"))
  and file.path != this.file.path
SORT file.ctime desc
LIMIT 1000
```
