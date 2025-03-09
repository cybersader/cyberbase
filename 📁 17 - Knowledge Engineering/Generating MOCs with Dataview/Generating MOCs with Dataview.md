---
aliases: [Dataview Queries]
tags: []
publish: true
permalink: 
date created: Saturday, March 8th 2025, 9:23 pm
date modified: Sunday, March 9th 2025, 2:49 pm
---

[Dataview](../../📁%2010%20-%20My%20Obsidian%20Stack/Dataview/Dataview.md)
[Obsidian Roadmaps](../../📁%2051%20-%20Cyberbase/Obsidian%20Roadmaps/Obsidian%20Roadmaps.md)

# WORKSPACE

%% DATAVIEW_PUBLISHER: start
```dataviewjs
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // Base tag (exclude the '#' prefix)
  baseTag: "areas",

  // If true, the base tag is rendered as an H1 (or top-level bullet in bullet mode).
  // If false, the base tag is skipped and its children become top-level.
  useBaseTagAsH1: false,

  // Rendering mode: "headings" (headings until max depth then bullets)
  // or "bullets" (pure bullet list).
  renderMode: "bullets", 

  // Maximum heading depth (only applies when renderMode is "headings").
  // Beyond this depth, bullet lists are used.
  maxHeadingDepth: 2,

  // Maximum number of nested tag segments to include.
  maxNestedTagDepth: 9999,

  // Starting depth for rendering.
  // For example, startingDepth: 1 renders the root as H1 (if useBaseTagAsH1 is true),
  // startingDepth: 2 renders the root as H2, etc.
  startingDepth: 1,

  // If true, display the full tag path (e.g. grandparent/parent/child) instead of just the current node.
  useFullTagPath: true,

  // If true, add an extra newline before a heading.
  newlineBeforeHeading: false,

  // If true, add an extra newline after a heading.
  newlineAfterHeading: false,

  // If true, add a '#' prefix to the displayed tag names (if not already present).
  addHashPrefixToTagNames: true,

  // Filter function: return true to include a page, false to skip it.
  filterFunction: (page) => {
    if (!page.file.tags) return true;
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

////////////////////////////////////////////////////////////////////////////////
// 2. COLLECT & BUILD TREE
////////////////////////////////////////////////////////////////////////////////

// Query pages that have the base tag.
const pages = dv.pages(`#${config.baseTag}`).where(config.filterFunction);

// Initialize the tree. The root represents the base tag.
let tree = {
  name: config.baseTag,
  fullPath: config.baseTag,
  pages: [],
  children: {}
};

/**
 * Add a page into the tree based on a tag.
 * The tag must start with the base tag; we remove that portion,
 * split on '/', and keep up to config.maxNestedTagDepth segments.
 */
function addToTree(fullTag, page) {
  let raw = fullTag.replace(/^#/, "");
  let parts = raw.split("/");
  // Remove the base tag segment.
  parts.shift();
  // Limit nested depth.
  parts = parts.slice(0, config.maxNestedTagDepth);
  
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = {
        name: part,
        fullPath: node.fullPath ? (node.fullPath + "/" + part) : part,
        pages: [],
        children: {}
      };
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
}

// Process each page and each tag.
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// 3. BUILD MARKDOWN STRING
////////////////////////////////////////////////////////////////////////////////

/**
 * Helper: optionally prefix the tag name with '#' if enabled.
 */
function formatTitle(title) {
  if (config.addHashPrefixToTagNames && title && !title.startsWith("#")) {
    return "#" + title;
  }
  return title;
}

/**
 * Helper: returns a string of n tab characters.
 */
function indent(n) {
  return "\t".repeat(n);
}

/**
 * Build a Markdown string in "headings" mode.
 * – Headings are generated at effective depth = startingDepth + current recursion depth.
 * – When effective depth is within maxHeadingDepth, output a Markdown heading.
 * – When it exceeds maxHeadingDepth, output the node title as a bullet.
 * – In headings mode, page links are always output with no indent.
 */
function buildMarkdownHeadings(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth;
  let title = config.useFullTagPath ? node.fullPath : node.name;
  title = formatTitle(title);
  
  if ((depth > 0 || (depth === 0 && config.useBaseTagAsH1)) && node.name) {
    if (config.newlineBeforeHeading && md !== "") { md += "\n"; }
    if (effectiveDepth <= config.maxHeadingDepth) {
      md += `${"#".repeat(effectiveDepth)} ${title}\n`;
    } else {
      // Beyond heading depth, show title as a bullet (with no indent).
      md += `- ${title}\n`;
    }
    if (config.newlineAfterHeading) { md += "\n"; }
  }
  
  // Output page links for this node with no indentation.
  if (node.pages.length > 0) {
    for (let link of node.pages) {
      md += `- ${link}\n`;
    }
    md += "\n";
  }
  
  // Process children.
  for (let child in node.children) {
    md += buildMarkdownHeadings(node.children[child], depth + 1);
  }
  return md;
}

/**
 * Build a Markdown string in pure "bullets" mode.
 * – If useBaseTagAsH1 is true, output the base node as a heading and process its children starting at depth 1.
 * – For nodes at depth >= 1, the node label is output with (depth-1) tabs,
 *   and its page links are indented with depth tabs.
 */
function buildMarkdownBullets(node, depth = 0) {
  let md = "";
  if (depth === 0) {
    if (config.useBaseTagAsH1 && node.name) {
      md += `# ${formatTitle(node.name)}\n\n`;
    }
    if (node.pages.length > 0) {
      // Base node page links flush left.
      for (let link of node.pages) {
        md += `- ${link}\n`;
      }
      md += "\n";
    }
    // Process children at depth 1.
    for (let child in node.children) {
      md += buildMarkdownBullets(node.children[child], 1);
    }
  } else {
    // For nodes at depth>=1:
    // Node label gets indent = (depth - 1) tabs.
    let labelIndent = indent(depth - 1);
    let title = formatTitle(config.useFullTagPath ? node.fullPath : node.name);
    md += `${labelIndent}- ${title}\n`;
    // Page links get indent = depth tabs.
    if (node.pages.length > 0) {
      let linkIndent = indent(depth);
      for (let link of node.pages) {
        md += `${linkIndent}- ${link}\n`;
      }
      md += "\n";
    }
    // Recurse for children.
    for (let child in node.children) {
      md += buildMarkdownBullets(node.children[child], depth + 1);
    }
  }
  return md;
}

////////////////////////////////////////////////////////////////////////////////
// 4. FINAL OUTPUT
////////////////////////////////////////////////////////////////////////////////
let finalMd = "";
if (config.renderMode === "headings") {
  finalMd = buildMarkdownHeadings(tree, 0);
} else {
  finalMd = buildMarkdownBullets(tree, 0);
}
if (finalMd.trim() === "") {
  finalMd = `No pages found for tag #${config.baseTag}`;
}
finalMd
```
%%

- [[📁 03 - Curations, Stacks/Wiki, KB, KMS/Wiki, KB, KMS.md|Wiki, KB, KMS]]
- [[📁 03 - Curations, Stacks/Flashcards & Memorization/Flashcards & Memorization.md|Flashcards & Memorization]]
- [[📁 17 - Knowledge Engineering/Generating Graph MOCs/Generating Graph MOCs.md|Generating Graph MOCs]]
- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

- #areas/knowledge-management
	- [[📁 03 - Curations, Stacks/Wiki, KB, KMS/Wiki, KB, KMS.md|Wiki, KB, KMS]]
	- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

- #areas/kms
	- [[📁 03 - Curations, Stacks/Wiki, KB, KMS/Wiki, KB, KMS.md|Wiki, KB, KMS]]
	- [[📁 17 - Knowledge Engineering/Generating Graph MOCs/Generating Graph MOCs.md|Generating Graph MOCs]]
	- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

	- #areas/kms/test
		- [[📁 17 - Knowledge Engineering/Generating Graph MOCs/Generating Graph MOCs.md|Generating Graph MOCs]]
		- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

		- #areas/kms/test/test
			- [[📁 17 - Knowledge Engineering/Generating Graph MOCs/Generating Graph MOCs.md|Generating Graph MOCs]]
			- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

- #areas/learning
	- [[📁 03 - Curations, Stacks/Flashcards & Memorization/Flashcards & Memorization.md|Flashcards & Memorization]]
	- [[📁 17 - Knowledge Engineering/Generating MOCs with Dataview/Generating MOCs with Dataview.md|Generating MOCs with Dataview]]

%% DATAVIEW_PUBLISHER: end %%

## MD DISPLAY


# ARCHIVE

```_dataview
list rows.file.link
FROM "#areas"
sort file.name asc
group by file.folder
sort file.name asc
```

## MOC DATAVIEWJS & DV PUBLISHER

```
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // Base tag (exclude the '#' prefix)
  baseTag: "areas",

  // If true, the base tag is rendered as an H1 (or top-level bullet in bullet mode).
  // If false, the base tag is skipped and its children become top-level.
  useBaseTagAsH1: true,

  // Rendering mode: "headings" (headings until a max depth then bullets) or "bullets" (pure bullet list)
  renderMode: "headings",

  // Maximum heading depth (only applicable when renderMode is "headings").
  // Beyond this depth, bullet lists are used.
  maxHeadingDepth: 6,

  // Maximum number of nested tag segments to include.
  maxNestedTagDepth: 9999,

  // Starting depth for rendering.
  // For example, startingDepth: 1 will render the root as H1 (if useBaseTagAsH1 is true),
  // startingDepth: 2 will render the root as H2, etc.
  startingDepth: 1,

  // If true, display the full tag path (e.g. grandparent/parent/child) instead of just the current node.
  useFullTagPath: false,

  // If true, add an extra newline before a heading.
  newlineBeforeHeading: false,

  // If true, add an extra newline after a heading.
  newlineAfterHeading: false,

  // If true, add a '#' prefix to the displayed tag names (if not already present).
  addHashPrefixToTagNames: false,

  // Filter function: return true to include a page, false to skip it.
  filterFunction: (page) => {
    if (!page.file.tags) return true;
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

////////////////////////////////////////////////////////////////////////////////
// 2. COLLECT & BUILD TREE
////////////////////////////////////////////////////////////////////////////////

// Query pages that have the base tag.
const pages = dv.pages(`#${config.baseTag}`).where(config.filterFunction);

// Initialize the tree. The root represents the base tag.
let tree = {
  name: config.baseTag,
  fullPath: config.baseTag,
  pages: [],
  children: {}
};

/**
 * Add a page into the tree based on a tag.
 * The tag must start with the base tag; we remove that portion,
 * split on '/', and keep up to config.maxNestedTagDepth segments.
 */
function addToTree(fullTag, page) {
  let raw = fullTag.replace(/^#/, "");
  let parts = raw.split("/");
  // Remove the base tag segment.
  parts.shift();
  // Limit nested depth.
  parts = parts.slice(0, config.maxNestedTagDepth);
  
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = {
        name: part,
        fullPath: node.fullPath ? (node.fullPath + "/" + part) : part,
        pages: [],
        children: {}
      };
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
}

// Process each page and each tag.
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
// 3. BUILD MARKDOWN STRING
////////////////////////////////////////////////////////////////////////////////

/**
 * Helper: optionally prefix the tag name with '#' if the setting is on.
 */
function formatTitle(title) {
  if (config.addHashPrefixToTagNames && title && !title.startsWith("#")) {
    return "#" + title;
  }
  return title;
}

/**
 * Helper: returns a string of n tab characters.
 */
function indent(n) {
  return "\t".repeat(n);
}

/**
 * Build a Markdown string in "headings" mode.
 * Headings are generated at effective depth = startingDepth + current recursion depth.
 * When effective depth exceeds config.maxHeadingDepth, bullet lists are used.
 */
function buildMarkdownHeadings(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth; // e.g. startingDepth=1 => root=1, child=2, etc.
  
  // Determine the display title.
  let title = config.useFullTagPath ? node.fullPath : node.name;
  title = formatTitle(title);
  
  // Only render the node title if either:
  // - depth > 0, or
  // - depth === 0 and we're showing the base tag.
  if ((depth > 0 || (depth === 0 && config.useBaseTagAsH1)) && node.name) {
    if (config.newlineBeforeHeading && md !== "") { md += "\n"; }
    if (effectiveDepth <= config.maxHeadingDepth) {
      md += `${"#".repeat(effectiveDepth)} ${title}\n`;
    } else {
      // Beyond heading depth, use bullet list for the tag title.
      md += `${indent(effectiveDepth - config.maxHeadingDepth)}- ${title}\n`;
    }
    if (config.newlineAfterHeading) { md += "\n"; }
  }
  
  // Render page links for this node.
  if (node.pages.length > 0) {
    // For headings mode, bullet indent for page links equals (effectiveDepth - 1) tabs.
    let bulletIndent = indent(Math.max(effectiveDepth - 1, 0));
    for (let link of node.pages) {
      md += `${bulletIndent}- ${link}\n`;
    }
    md += "\n";
  }
  
  // Recurse over children.
  for (let childName in node.children) {
    md += buildMarkdownHeadings(node.children[childName], depth + 1);
  }
  return md;
}

/**
 * Build a Markdown string in pure "bullets" mode.
 * The bullet indent is computed as effectiveDepth = startingDepth + current recursion depth.
 */
function buildMarkdownBullets(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth;
  let title = config.useFullTagPath ? node.fullPath : node.name;
  title = formatTitle(title);
  
  if (depth === 0) {
    if (config.useBaseTagAsH1 && node.name) {
      md += `# ${title}\n\n`;
    }
  } else if (node.name) {
    // For bullet mode, use (effectiveDepth - 1) tabs for the node label.
    md += `${indent(Math.max(effectiveDepth - 1, 0))}- ${title}\n`;
  }
  
  if (node.pages.length > 0) {
    // For page links in bullet mode, also use (effectiveDepth - 1) tabs so that they align under the node label.
    let linkIndent = indent(Math.max(effectiveDepth - 1, 0));
    for (let link of node.pages) {
      md += `${linkIndent}- ${link}\n`;
    }
    md += "\n";
  }
  
  for (let childName in node.children) {
    md += buildMarkdownBullets(node.children[childName], depth + 1);
  }
  return md;
}

////////////////////////////////////////////////////////////////////////////////
// 4. FINAL OUTPUT
////////////////////////////////////////////////////////////////////////////////
let finalMd = "";
if (config.renderMode === "headings") {
  finalMd = buildMarkdownHeadings(tree, 0);
} else {
  finalMd = buildMarkdownBullets(tree, 0);
}

if (finalMd.trim() === "") {
  finalMd = `No pages found for tag #${config.baseTag}`;
}

finalMd
```

```
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // Base tag (exclude the '#' prefix)
  baseTag: "areas",

  // If true, the base tag is rendered as an H1 (or top-level bullet in bullet mode).
  // If false, the base tag name is skipped and its children become top-level.
  useBaseTagAsH1: true,

  // Rendering mode: "headings" or "bullets"
  renderMode: "bullets", 

  // Maximum heading depth (only applicable when renderMode is "headings").
  // Beyond this depth, bullet lists are used.
  maxHeadingDepth: 6,

  // Maximum number of nested tag segments to include.
  maxNestedTagDepth: 9999,

  // Starting depth for rendering. For example, if set to 2 then the top-level of the
  // generated output will start at H2 (or bullet indent level 2).
  startingDepth: 1,

  // If true, display the full tag path (grandparent/parent/child) instead of just the node name.
  useFullTagPath: false,

  // Extra newlines before and after a heading.
  newlineBeforeHeading: true,
  newlineAfterHeading: true,

  // Filter function: return true to include a page, false to skip it.
  filterFunction: (page) => {
    if (!page.file.tags) return true;
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

// (Optional) Log configuration for troubleshooting.
// console.log("MOC Builder config:", config);

////////////////////////////////////////////////////////////////////////////////
// 2. COLLECT & BUILD TREE
////////////////////////////////////////////////////////////////////////////////

// Query pages that have the base tag.
const pages = dv.pages(`#${config.baseTag}`).where(config.filterFunction);
// console.log(`Found ${pages.length} pages with tag #${config.baseTag}.`);

// Initialize the tree (the root represents the base tag).
let tree = {
  name: config.baseTag,
  fullPath: config.baseTag,
  pages: [],
  children: {}
};

/**
 * Add a page into the tree from a given tag.
 * The tag must start with the base tag. We remove the base tag,
 * split on '/', and only keep up to config.maxNestedTagDepth segments.
 */
function addToTree(fullTag, page) {
  // console.log("Processing tag:", fullTag, "for page:", page.file.path);
  let raw = fullTag.replace(/^#/, "");
  let parts = raw.split("/");
  // Remove the base tag segment.
  parts.shift();
  // Limit nested depth.
  parts = parts.slice(0, config.maxNestedTagDepth);
  
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = {
        name: part,
        fullPath: node.fullPath ? (node.fullPath + "/" + part) : part,
        pages: [],
        children: {}
      };
      // console.log("  Created node:", node.children[part].fullPath);
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
  // console.log("  Added page link:", page.file.link, "to node:", node.fullPath);
}

// Process each page and each tag.
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

// (Optional) Log the built tree.
// console.log("Tree built:", tree);

////////////////////////////////////////////////////////////////////////////////
// 3. BUILD MARKDOWN STRING
////////////////////////////////////////////////////////////////////////////////

/**
 * Build a Markdown string in "headings" mode.
 * Headings are generated at effective depth = startingDepth + current recursion depth.
 * When effective depth exceeds config.maxHeadingDepth, bullet lists are used.
 */
function buildMarkdownHeadings(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth; // e.g. startingDepth=1 makes root H1, startingDepth=2 makes root H2.

  // Determine the display title.
  let title = config.useFullTagPath ? node.fullPath : node.name;
  
  // Only render the node title if either:
  // - depth > 0, or
  // - depth === 0 and we're showing the base tag.
  if ((depth > 0 || (depth === 0 && config.useBaseTagAsH1)) && node.name) {
    // Optionally add a newline before the heading.
    if (config.newlineBeforeHeading && md !== "") { md += "\n"; }
    if (effectiveDepth <= config.maxHeadingDepth) {
      md += `${"#".repeat(effectiveDepth)} ${title}\n`;
    } else {
      let indent = "  ".repeat(effectiveDepth - config.maxHeadingDepth);
      md += `${indent}- ${title}\n`;
    }
    // Optionally add a newline after the heading.
    if (config.newlineAfterHeading) { md += "\n"; }
  }
  
  // Render page links for this node.
  if (node.pages.length > 0) {
    // In heading mode, we want the bullet list to start at a consistent indent.
    // We'll use an indent equal to effectiveDepth (i.e. H1 gets indent of 2 spaces, H2 gets 4, etc.).
    let bulletIndent = "  ".repeat(effectiveDepth);
    for (let link of node.pages) {
      md += `${bulletIndent}- ${link}\n`;
    }
    // End the bullet block with a single newline.
    md += "\n";
  }
  
  // Recurse over children.
  for (let childName in node.children) {
    md += buildMarkdownHeadings(node.children[childName], depth + 1);
  }
  return md;
}

/**
 * Build a Markdown string in pure "bullets" mode.
 * The bullet indent is computed as effectiveDepth = startingDepth + current depth.
 */
function buildMarkdownBullets(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth;
  let title = config.useFullTagPath ? node.fullPath : node.name;
  
  if (depth === 0) {
    if (config.useBaseTagAsH1 && node.name) {
      md += `# ${title}\n`;
    }
  } else if (node.name) {
    // Use indent based on effectiveDepth - 1 for the node label.
    md += `${"  ".repeat(effectiveDepth - 1)}- ${title}\n`;
  }
  
  if (node.pages.length > 0) {
    let indent = "  ".repeat(effectiveDepth);
    for (let link of node.pages) {
      md += `${indent}- ${link}\n`;
    }
  }
  
  for (let childName in node.children) {
    md += buildMarkdownBullets(node.children[childName], depth + 1);
  }
  return md;
}

////////////////////////////////////////////////////////////////////////////////
// 4. FINAL OUTPUT
////////////////////////////////////////////////////////////////////////////////
let finalMd = "";
if (config.renderMode === "headings") {
  finalMd = buildMarkdownHeadings(tree, 0);
} else {
  finalMd = buildMarkdownBullets(tree, 0);
}

if (finalMd.trim() === "") {
  finalMd = `No pages found for tag #${config.baseTag}`;
}

// Output final Markdown string so that Dataview renders it.
finalMd
```

```_dataviewjs
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // Base tag (exclude the '#' prefix)
  baseTag: "areas",

  // If true, the base tag is rendered as an H1 (or top-level bullet in bullet mode).
  // If false, the base tag is skipped and its children become top-level.
  useBaseTagAsH1: true,

  // Rendering mode: "headings" or "bullets"
  renderMode: "bullets", 

  // Maximum heading depth (only applicable when renderMode is "headings").
  // Beyond this depth the output will switch to bullet lists.
  maxHeadingDepth: 6,

  // Maximum number of nested tag segments to include.
  maxNestedTagDepth: 9999,

  // Starting depth for rendering (to allow embedding under an existing heading).
  // For example, if set to 2, then the top-level output will be rendered as H2 (or bullet indent level 2).
  startingDepth: 1,

  // If true, the full tag path is used when displaying each node (e.g. grandparent/parent/child)
  // instead of just the current level (child).
  useFullTagPath: true,

  // Filter function: return true to include a page, false to skip it.
  filterFunction: (page) => {
    if (!page.file.tags) return true;
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

// Optional logging for troubleshooting.
console.log("MOC Builder starting with config:", config);

////////////////////////////////////////////////////////////////////////////////
// 2. COLLECT & BUILD TREE
////////////////////////////////////////////////////////////////////////////////

// Query pages that have the base tag.
const pages = dv.pages(`#${config.baseTag}`).where(config.filterFunction);
console.log(`Found ${pages.length} pages with tag #${config.baseTag}.`);

// Initialize the tree. The root node represents the base tag.
let tree = {
  name: config.baseTag,
  fullPath: config.baseTag,
  pages: [],
  children: {}
};

/**
 * Add a page into the tree from a given tag.
 * The tag must start with the base tag. We then strip it off,
 * split on '/', and keep only up to config.maxNestedTagDepth segments.
 */
function addToTree(fullTag, page) {
  console.log("Processing tag:", fullTag, "for page:", page.file.path);
  let raw = fullTag.replace(/^#/, "");
  let parts = raw.split("/");
  // Remove the base tag portion.
  parts.shift();
  // Limit the nested depth.
  parts = parts.slice(0, config.maxNestedTagDepth);
  
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = {
        name: part,
        fullPath: node.fullPath ? (node.fullPath + "/" + part) : part,
        pages: [],
        children: {}
      };
      console.log("  Created node for:", part, "with fullPath:", node.children[part].fullPath);
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
  console.log("  Added page link:", page.file.link, "to node:", node.fullPath);
}

// Process each page and each tag.
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

console.log("Tree built:", tree);

////////////////////////////////////////////////////////////////////////////////
// 3. BUILD MARKDOWN STRING
////////////////////////////////////////////////////////////////////////////////

/**
 * Build a Markdown string in "headings" mode.
 * Headings are produced from effective depth = startingDepth + current recursion depth.
 * When effective depth exceeds config.maxHeadingDepth, fallback to bullet lists.
 */
function buildMarkdownHeadings(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth; // e.g. startingDepth 2 means top-level becomes H2.
  
  // Determine the title: full tag path if enabled; otherwise just the node's name.
  let title = config.useFullTagPath ? node.fullPath : node.name;
  
  // Only render the node name if either:
  //  - depth > 0, or
  //  - depth == 0 and we're showing the base tag as H1.
  if ((depth > 0 || (depth === 0 && config.useBaseTagAsH1)) && node.name) {
    if (effectiveDepth <= config.maxHeadingDepth) {
      md += `${"#".repeat(effectiveDepth)} ${title}\n`;
    } else {
      let indent = "  ".repeat(effectiveDepth - config.maxHeadingDepth);
      md += `${indent}- ${title}\n`;
    }
  }
  
  // Render any page links at this node.
  if (node.pages.length > 0) {
    if (effectiveDepth <= config.maxHeadingDepth) {
      for (let link of node.pages) {
        md += `${"  ".repeat(effectiveDepth)}- ${link}\n`;
      }
    } else {
      let indent = "  ".repeat(effectiveDepth - config.maxHeadingDepth + 1);
      for (let link of node.pages) {
        md += `${indent}- ${link}\n`;
      }
    }
  }
  
  // Recurse for children.
  for (let childName in node.children) {
    md += buildMarkdownHeadings(node.children[childName], depth + 1);
  }
  return md;
}

/**
 * Build a Markdown string in pure bullet mode.
 * The bullet indent is computed as effectiveDepth = startingDepth + current depth.
 */
function buildMarkdownBullets(node, depth = 0) {
  let md = "";
  let effectiveDepth = config.startingDepth + depth;
  let title = config.useFullTagPath ? node.fullPath : node.name;
  
  if (depth === 0) {
    if (config.useBaseTagAsH1 && node.name) {
      md += `# ${title}\n`;
    }
  } else if (node.name) {
    md += `${"  ".repeat(effectiveDepth - 1)}- ${title}\n`;
  }
  
  if (node.pages.length > 0) {
    let indent = "  ".repeat(effectiveDepth);
    for (let link of node.pages) {
      md += `${indent}- ${link}\n`;
    }
  }
  
  for (let childName in node.children) {
    md += buildMarkdownBullets(node.children[childName], depth + 1);
  }
  return md;
}

////////////////////////////////////////////////////////////////////////////////
// 4. FINAL OUTPUT
////////////////////////////////////////////////////////////////////////////////
let finalMd = "";
if (config.renderMode === "headings") {
  finalMd = buildMarkdownHeadings(tree, 0);
} else {
  finalMd = buildMarkdownBullets(tree, 0);
}

if (finalMd.trim() === "") {
  finalMd = `No pages found for tag #${config.baseTag}`;
}

console.log("Final Markdown output:\n", finalMd);

// Return the final Markdown string so that Dataview renders it.
finalMd
```

```_dataviewjs
////////////////////////////////////////////////////////////////////////////////
// 1. CONFIGURATION
////////////////////////////////////////////////////////////////////////////////
const config = {
  // Base tag (without the '#' prefix)
  baseTag: "areas",

  // If true, the base tag is rendered as an H1 (or top-level bullet in bullet mode).
  // If false, the base tag name is skipped, and its children become the top-level.
  useBaseTagAsH1: false,

  // Rendering mode: "headings" or "bullets"
  renderMode: "headings",

  // Maximum heading depth (only relevant if renderMode === "headings").
  // Beyond this depth, bullet lists are used.
  maxHeadingDepth: 6,

  // Maximum number of nested tag segments to include.
  maxNestedTagDepth: 9999,

  // Filter function: return true to include a page, false to skip it.
  filterFunction: (page) => {
    if (!page.file.tags) return true;
    return !page.file.tags.some(t => t.toLowerCase().includes("archive"));
  },
};

console.log("MOC Builder starting with config:", config);

////////////////////////////////////////////////////////////////////////////////
// 2. COLLECT & BUILD TREE
////////////////////////////////////////////////////////////////////////////////

// Query pages that have the base tag.
const pages = dv.pages(`#${config.baseTag}`).where(config.filterFunction);
console.log(`Found ${pages.length} pages with tag #${config.baseTag}.`);

let tree = {
  name: config.baseTag,
  pages: [],
  children: {}
};

/**
 * Add a page into the tree from a given tag.
 * The tag must start with the base tag; we then strip it off,
 * split on '/', and only keep up to config.maxNestedTagDepth segments.
 */
function addToTree(fullTag, page) {
  console.log("Processing tag:", fullTag, "for page:", page.file.path);
  let raw = fullTag.replace(/^#/, "");
  let parts = raw.split("/");
  // Discard the base tag portion.
  parts.shift();
  // Limit nested depth.
  parts = parts.slice(0, config.maxNestedTagDepth);
  
  let node = tree;
  for (let part of parts) {
    if (!node.children[part]) {
      node.children[part] = { name: part, pages: [], children: {} };
      console.log("  Created node for:", part);
    }
    node = node.children[part];
  }
  node.pages.push(page.file.link);
  console.log("  Added page link:", page.file.link, "to node:", node.name);
}

// Process each page and each tag.
for (let page of pages) {
  if (!page.file.tags) continue;
  for (let tag of page.file.tags) {
    if (tag.startsWith(`#${config.baseTag}`) || tag.startsWith(config.baseTag)) {
      addToTree(tag, page);
    }
  }
}

console.log("Tree built:", tree);

////////////////////////////////////////////////////////////////////////////////
// 3. BUILD MARKDOWN STRING
////////////////////////////////////////////////////////////////////////////////

function buildMarkdownHeadings(node, depth = 0) {
  let md = "";
  // If depth==0 and using base tag as H1, then effective depth becomes 1.
  let effectiveDepth = (depth === 0 && config.useBaseTagAsH1) ? 1 : depth;
  
  // Render node.name if it should be shown.
  if ((depth > 0 || (depth === 0 && config.useBaseTagAsH1)) && node.name) {
    if (effectiveDepth <= config.maxHeadingDepth) {
      md += `${"#".repeat(effectiveDepth)} ${node.name}\n\n`;
    } else {
      let indent = "  ".repeat(effectiveDepth - config.maxHeadingDepth);
      md += `${indent}- ${node.name}\n`;
    }
  }
  
  // Render pages as bullet items.
  if (node.pages.length > 0) {
    if (effectiveDepth > 0 && effectiveDepth <= config.maxHeadingDepth) {
      for (let link of node.pages) {
        md += `${"  ".repeat(effectiveDepth)}- ${link}\n`;
      }
      md += "\n";
    } else if (effectiveDepth > config.maxHeadingDepth) {
      let indent = "  ".repeat(effectiveDepth - config.maxHeadingDepth + 1);
      for (let link of node.pages) {
        md += `${indent}- ${link}\n`;
      }
      md += "\n";
    } else if (effectiveDepth === 0) {
      // If not showing the base tag, list pages at top level.
      for (let link of node.pages) {
        md += `- ${link}\n`;
      }
      md += "\n";
    }
  }
  
  // Recurse over children.
  for (let childName in node.children) {
    md += buildMarkdownHeadings(node.children[childName], depth + 1);
  }
  return md;
}

function buildMarkdownBullets(node, depth = 0) {
  let md = "";
  if (depth === 0 && config.useBaseTagAsH1 && node.name) {
    md += `# ${node.name}\n\n`;
  } else if (node.name && !(depth === 0 && !config.useBaseTagAsH1)) {
    let indent = "  ".repeat(depth);
    md += `${indent}- ${node.name}\n`;
  }
  if (node.pages.length > 0) {
    let indent = "  ".repeat(depth + 1);
    for (let link of node.pages) {
      md += `${indent}- ${link}\n`;
    }
    md += "\n";
  }
  for (let childName in node.children) {
    md += buildMarkdownBullets(node.children[childName], depth + 1);
  }
  return md;
}

////////////////////////////////////////////////////////////////////////////////
// 4. FINAL OUTPUT
////////////////////////////////////////////////////////////////////////////////
let finalMd = "";
if (config.renderMode === "headings") {
  finalMd = buildMarkdownHeadings(tree, 0);
} else {
  finalMd = buildMarkdownBullets(tree, 0);
}

console.log("Final Markdown output:\n", finalMd);

if (finalMd.trim() === "") {
  finalMd = `No pages found for tag #${config.baseTag}`;
}
`
${finalMd}
`
```

## OTHER

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
