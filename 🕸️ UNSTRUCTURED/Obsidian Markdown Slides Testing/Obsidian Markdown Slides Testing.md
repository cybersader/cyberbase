---
aliases: [Obsidian Extended Slides Testing]
tags: []
publish: true
permalink:
title:
date created: Wednesday, November 5th 2025, 8:55 pm
date modified: Wednesday, November 5th 2025, 9:08 pm
---


%% Begin Waypoint %%
- **[[01-Getting-Started]]**
- **[[03-Fragments-Showcase]]**
- **[[05-Backgrounds-Video-Parallax]]**
- **[[06–Code-Blocks-Highlighting]]**
- **[[07–Mermaid-Deep-Dive.md]]**
- **[[09-Image-Layouts-Grids]]**
- **[[10-Footnotes-Citation]]**
- **[[11-Speaker-Notes-Chalkboard]]**
- **[[12–Templates-&-DefaultTemplate.md]]**
- **[[13–Links-Embeds-&-Transclusions]]**
- **[[15–Charts-Options]]**
- **[[19–Consult-Theme-Clone]]**
- **[[20-Terminal-Alt-presenterm]]**

%% End Waypoint %%

So I'm trying to build a comprehensive markdown library of notes to show how to use the Slides Extended plugin in Obsidian to use markdown and the Slides Extended conventions to create BEAUTIFUL and flexible presentations. This namely uses Reveal.js. Below I have all of the data, but I want to create like 20 sets of notes with their own frontmatter and usage of tons of aspects of Slides Extended. This needs to include images, footnotes, beautiful unorthodox use of the syntax in certain cases or themes, blocks, code blocks, mermaid, Excalidraw, elements (annotated or whatever), grids, examples of different presentation slides, etc. etc.

- [obsidianstats.com > Slides Extended - Create markdown-based reveal.js presentations in Obsidian](https://www.obsidianstats.com/plugins/slides-extended)
- [dzello.com > reveal.js](https://revealjs-themes.dzello.com/#/)
- [ebullient.dev > Slides Extended](https://www.ebullient.dev/projects/obsidian-slides-extended/)
- Templates
	- [github.com > MSzturc/advanced-slides-consult-template: A theme to create professional presentations with Advanced Slides](https://github.com/MSzturc/advanced-slides-consult-template/tree/main)
- [github.com > ebullient/obsidian-slides-extended: Create markdown-based reveal.js presentations in Obsidian](https://github.com/ebullient/obsidian-slides-extended/tree/main)
- [obsidian.md > Slides Extended - Share & showcase](https://forum.obsidian.md/t/slides-extended/85825)
- Examples and notes
	- [github.com > namtao-com/src/site/notes at main · NamtaoProductions/namtao-com](https://github.com/NamtaoProductions/namtao-com/tree/main/src/site/notes)
		- [github.com > namtao-com/src/site/notes/Obsidian for Learning.md at main · NamtaoProductions/namtao-com](https://github.com/NamtaoProductions/namtao-com/blob/main/src/site/notes/Obsidian%20for%20Learning.md?plain=1)
- Custom CSS
	- [damirscorner.com > Customizing Advanced Slides for Obsidian](https://www.damirscorner.com/blog/posts/20221007-CustomizingAdvancedSlidesForObsidian.html)
- Terminal-based options
	- [github.com > mfontanini/presenterm: A markdown terminal slideshow tool](https://github.com/mfontanini/presenterm)

...after the answer

Extend off the current numbers and create some full-fledged default templates.  Let's start with the "simple" theme.  Let's also show the utilization of the below things from Slides Extended docs - https://www.ebullient.dev/projects/obsidian-slides-extended/

For each one of these show tons of different examples that we can copy paste

- Vertical Slides
- Element Annotations
     - things like <!-- .slide: style="background-color: coral;" -->
- Use the ":::block" thing 
- Some slides may be to show functionality and some should be default slide templates that we can start using
- Show classes with fragments
- Show lots of inline styling or also referencing a css file
- Show different color and gradient backgrounds for slides
- Show what to type with autofill for the plugin for the parts like "<!--...-->" to show variables like intellisense
- Icon examples and the emoji shortcodes - reference that plugin
- Show the simplest approach to the grid component - also lots of different iterations - without manually typing in the weird number combinations (requires too much brain power) - I like position by name examples - also show examples of ALL the attributes or namely padding, alignment, justify content, and fragments
	- Show attributes like even, gap, left and right, and wrap
	- Show no margin
	- Show how flow works
- Include key frontmatter options
	- Center to false
	- theme to simple
	- min and max scale (don't understand this)
	- margin to like 0.2
	- markdown options - useful?
- DEFINITELY show how to use slide templates or even create some for this
	- https://www.ebullient.dev/projects/obsidian-slides-extended/templates/
	- I'm definitely confused about these like ...
		- The following slide template is called `tpl-con-2-1-box`. It creates a slide structure with a narrow header bar at the top end of the slide, 2 broad columns at the center of the slide as well as a footer bar with a citation line in the bottom of the slide.
	- I don't understand how blcoks and the syntax of the "<!--...-->" parts fit into this.  I also don't understand if they're attached to something like the simple theme or attached to something other than a theme.
		- <% footer %> or <% content %> <------- don't understand these
	- I think this would be the most valuable but the autocomplete isn't working for it and I can't find the actual templates mentioned
- Use all of the basic markdown stuff to make it BEAUTIFUL
	- Text styles
	- Blockquotes
	- CodeBlocks
	- Footnotes
	- Callouts - these are so useful
- Take into account wikilinks versus markdown link usage