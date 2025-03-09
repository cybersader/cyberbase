---
aliases: [Dataview Queries]
tags: []
publish: true
permalink: 
date created: Saturday, March 8th 2025, 9:23 pm
date modified: Sunday, March 9th 2025, 1:18 pm
---

[Dataview](../../📁%2010%20-%20My%20Obsidian%20Stack/Dataview/Dataview.md)
[Obsidian Roadmaps](../../📁%2051%20-%20Cyberbase/Obsidian%20Roadmaps/Obsidian%20Roadmaps.md)

# WORKSPACE



# ARCHIVE

```_dataview
list rows.file.link
FROM "#areas"
sort file.name asc
group by file.folder
sort file.name asc
```


```_dataviewjs
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // The base tag (exclude '#' from this string).
  baseTag: "areas",

  // If true, we render the base tag as an H1 (or bullet if using bullet mode).
  useBaseTagAsH1: true,

  // Rendering mode: "headings" or "bullets"
  // - "headings": use H1..H6 (or up to config.maxHeadingDepth) for each level
  // - "bullets": use nested bullets from the top
  renderMode: "headings",

  // The maximum heading depth to use. Beyond this level, we switch to bullet lists.
  // (Only applies if renderMode = "headings".)
  maxHeadingDepth: 6,

  // The maximum nested tag depth to display. 
  // For example, if set to 2, then #areas/one/two/three will effectively stop at 'two'
  // and won't split further into 'three'.
  // If you want to show all levels, set this to something large like 9999.
  maxNestedTagDepth: 9999,

  // Filter out archived pages (or other conditions).
  // Adjust this function if you want additional filtering logic.
  filterFunction: (page) => {
    // Example: skip pages that have any tag including the text "archive"
    if (!page.file.tags) return true; // no tags => pass
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

////////////////////////////////////////////////////////////////////////////////
// 2. DATA COLLECTION
////////////////////////////////////////////////////////////////////////////////

// 2.1. Get pages that include the base tag.
const pages = dv
  .pages(`#${config.baseTag}`)
  .where(p => config.filterFunction(p));

// 2.2. Build a tree structure.
let tree = {
  name: config.baseTag, // root
  pages: [],
  children: {}
};

/**
 * Add a page to the tree given a tag which starts with baseTag.
 * Splits the tag by '/', discards the base tag, and respects config.maxNestedTagDepth.
 */
function addToTree(tag, page) {
  // Remove any leading '#' and split by '/'
  let normalized = tag.replace(/^#/, '');
  let parts = normalized.split("/");
  // The first part is the base tag; discard it:
  parts.shift(); 
  // Respect maxNestedTagDepth
  parts = parts.slice(0, config.maxNestedTagDepth);

  // Walk down the tree
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = {
        name: part,
        pages: [],
        children: {}
      };
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
}

// Populate the tree from each page’s tags
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    // Only process tags that start with the baseTag
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// 3. RENDERING
////////////////////////////////////////////////////////////////////////////////

/**
 * Render the tree in "headings" mode, up to config.maxHeadingDepth.
 * After that, use bullet lists.
 * 
 * @param {object} node - A tree node with { name, pages[], children{} }
 * @param {number} depth - How many levels down from the root we are
 */
function renderTreeHeadings(node, depth) {
  // If we are at depth 0, that means the root node (the baseTag).
  // Depth 1 => 1st level child, Depth 2 => 2nd level child, etc.

  // If user does not want the base tag as H1, we skip rendering it at depth=0
  // and start headings from the next level. 
  // But if they do want it, we show it as H1 or bullets accordingly.

  // We convert "depth" to "heading level" as follows:
  //   If useBaseTagAsH1 is true, root depth=0 => H1
  //   If useBaseTagAsH1 is false, then root depth=0 is not displayed 
  //   => its children at depth=1 become H1, depth=2 => H2, etc.

  // Decide if we should display a heading or skip
  let headingLevel = depth; // base measure
  if (!config.useBaseTagAsH1) headingLevel = depth - 1; 

  // Actually render node.name if headingLevel >= 1
  if (node.name && headingLevel >= 1) {
    if (headingLevel <= config.maxHeadingDepth) {
      dv.header(headingLevel, node.name);
    } else {
      // We have exceeded the max heading depth => bullet label
      const bulletIndent = "  ".repeat(headingLevel - config.maxHeadingDepth);
      dv.paragraph(bulletIndent + "- " + node.name);
    }
  }

  // Render any pages at this node
  if (node.pages.length > 0) {
    // For headings within the limit
    if (headingLevel <= config.maxHeadingDepth && headingLevel >= 1) {
      // This will produce clickable links
      dv.list(node.pages);
    }
    // For bullet-lists after we exceed maxHeadingDepth 
    else if (headingLevel > config.maxHeadingDepth) {
      // We can’t directly indent dv.list, but we can build an array of strings with some indentation
      const bulletIndent = "  ".repeat(headingLevel - config.maxHeadingDepth);
      const items = node.pages.map(p => bulletIndent + "- " + p);
      dv.list(items);
    }
  }

  // Render children
  for (let c in node.children) {
    renderTreeHeadings(node.children[c], depth + 1);
  }
}

/**
 * Render the entire tree in "bullets" mode (no headings).
 * 
 * @param {object} node - A tree node with { name, pages[], children{} }
 * @param {number} depth - How far down we are
 */
function renderTreeBullets(node, depth) {
  // If user wants base tag as H1 in bullet mode:
  // - Depth=0 => H1 for root (or skip if false).
  // - Then everything else is bullets.

  if (depth === 0 && config.useBaseTagAsH1 && node.name) {
    dv.header(1, node.name);
  } else if (node.name && !(depth === 0 && !config.useBaseTagAsH1)) {
    // Indent bullet for each level
    // If we used base tag as H1 at depth=0, depth>0 => bullet
    // If not used base tag, depth=1 => bullet for top children
    const bulletIndent = "  ".repeat(depth);
    dv.paragraph(bulletIndent + "- " + node.name);
  }

  // List the pages (clickable links). Indent them a bit more.
  if (node.pages.length > 0) {
    const bulletIndent = "  ".repeat(depth + 1);
    const items = node.pages.map(p => bulletIndent + "- " + p);
    dv.list(items);
  }

  // Recurse
  for (let c in node.children) {
    renderTreeBullets(node.children[c], depth + 1);
  }
}

////////////////////////////////////////////////////////////////////////////////
// 4. OUTPUT
////////////////////////////////////////////////////////////////////////////////

if (config.renderMode === "headings") {
  // Start from depth=0
  renderTreeHeadings(tree, 0);
} else {
  // "bullets" mode
  // Start from depth=0
  renderTreeBullets(tree, 0);
}
```


```_dataview
 TABLE rows.file.link AS Note FROM #workspaces
 FLATTEN file.etags AS Tags
 WHERE contains(Tags, "#workspaces") AND contains(Tags, "monitoring") AND !contains(Tags, "#archive")
 GROUP BY Tags
 ```
 
 
 ```_dataview
 TABLE rows.file.link AS Note FROM #workspaces
 FLATTEN file.etags AS Tags
 WHERE contains(Tags, "#workspaces") AND contains(Tags, "meeting") AND !contains(Tags, "#archive")
 GROUP BY Tags
 ```
 
 ```_dataview
 TABLE rows.file.link AS Note FROM #projects
 FLATTEN file.etags AS Tags
 WHERE contains(Tags, "#projects") AND !contains(Tags, "#archive") 
 GROUP BY Tags
 ```
 
 ```_dataview
 TABLE rows.file.link AS Note FROM #workspaces
 FLATTEN file.etags AS Tags
 WHERE contains(Tags, "#workspaces") AND !contains(Tags, "#archive")
 GROUP BY Tags
 ```

```_dataview
 LIST FROM #workspaces/vendor_meetings 
 SORT data DESCENDING
 ```
