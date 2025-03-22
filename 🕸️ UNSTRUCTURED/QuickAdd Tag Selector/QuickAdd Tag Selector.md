---
aliases: []
tags: []
publish: true
permalink:
date created: Friday, March 21st 2025, 2:58 pm
date modified: Saturday, March 22nd 2025, 6:49 pm
---

# Scripts I Built for Use in Templater ("User Scripts")

- [captureActiveTags](../../System/QuickAdd%20Scripts/captureActiveTags.js)
- [tag_selector](../../System/QuickAdd%20Scripts/tag_selector.js)

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

# Modal Forms Plugins - The Best Method

- [(14) Obsidian Modal Forms Plugin: How to Transform your Data Entry in Obsidian - YouTube](https://www.youtube.com/watch?v=zVGyWaw3xZQ)
- Frontmatter example f/ Modal Forms docs - [Advanced - Obsidian Modal Form docs](https://danielorodriguez.com/obsidian-modal-form/advanced-examples/#modifying-frontmatter-with-a-form)