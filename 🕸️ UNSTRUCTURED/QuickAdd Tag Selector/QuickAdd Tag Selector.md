---
aliases: []
tags: []
publish: true
permalink:
date created: Friday, March 21st 2025, 2:58 pm
date modified: Friday, March 21st 2025, 6:18 pm
---

# Related Macros

## select_tags.js

```js
module.exports = async function select_tags(params) {
  const {app, quickAddApi: {suggester}} = params;
  const allTags = Object.keys(app.metadataCache.getTags());
  let tag = await suggester(allTags, allTags);
  if (!tag) return;
  
  tag = tag.substring(1);  // skip the hash symbol
  return tag;
}
```