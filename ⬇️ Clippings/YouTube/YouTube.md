---
aliases: []
tags: [utils/dv]
publish: true
permalink: 
date created: Saturday, March 15th 2025, 2:25 pm
date modified: Saturday, March 15th 2025, 2:55 pm
---

# MoC

```dataview
table choice(thumbnailUrl, "![thumb|100](" + thumbnailUrl + ")", "") as Thumbnail, file.ctime as "Created", file.mtime as "Modified"
from ""
where (file.folder = this.file.folder or contains(file.tags, "#clippings/youtube"))
  and file.path != this.file.path
sort file.mtime desc
limit 1000
```


%% Begin Waypoint %%
- **[[Custom PCs Australia - Steve Jobs perfect response to an insult. Worldwide developer conference 1997]]**
- **[[S3 - 2025 The Dawn of Energy Abundance]]**
- **[[SXSW - The State of Personal Online Security and Confidentiality]]**
- **[[To Scale - To Scale TIME]]**

%% End Waypoint %%

