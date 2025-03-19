---
aliases: []
tags: []
publish: true
permalink:
date created: Tuesday, March 11th 2025, 9:33 pm
date modified: Saturday, March 15th 2025, 2:52 pm
---

# MoC

```dataview
TABLE choice(favicon, "![favicon|25](" + favicon + ")", "") as Favicon, file.ctime as "Created", file.mtime as "Modified"
FROM ""
WHERE (contains(file.folder, this.file.folder) or contains(file.tags, "#clippings/tech"))
  and file.path != this.file.path
SORT file.ctime desc
LIMIT 1000
```

%% Begin Waypoint %%
- **[[Chatwoot]]**
- **[[Cryptee]]**
- **[[Cryptomator]]**
- **[[Fakeupdate]]**
- **[[Google-Gemma-3]]**
- **[[Kittl]]**
- **[[Kortex]]**
- **[[Makemydrivefun]]**
- **[[Napkin]]**
- **[[Notesnook]]**
- **[[Ollama]]**
- **[[Openfhe]]**
- **[[Opennote]]**
- **[[Peertube]]**
- **[[Printify]]**
- **[[Readdy]]**
- **[[Readwise]]**
- **[[Simplemind]]**
- **[[Slido]]**
- **[[Trilium Notes]]**
- **[[Zivver Security]]**

%% End Waypoint %%