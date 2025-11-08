---
aliases: [Obsidian Extended Slides Testing]
tags: []
publish: true
permalink:
title:
date created: Wednesday, November 5th 2025, 8:55 pm
date modified: Friday, November 7th 2025, 8:35 pm
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

Slides Extended — Simple Theme Starter Pack (Notes 21–40)

> Copy each code block into its own note. Filenames are just suggestions. All examples use the simple theme and default to center: false, margin: 0.2, and handy markdown options.

---

21 – Simple – Minimal Deck Skeleton (21-simple-minimal.md)

---

# core deck options

theme: simple
center: false
margin: 0.2
minScale: 0.5  # downscale limit (fit small screens)
maxScale: 2.5  # upscale limit (fit big projectors)

# optional: load extra CSS (kept in your Theme Directory)

css:
  - css/my-talk.css

# optional: tweak markdown parser (reveal.js/marked)

markdown:
  gfm: true
  mangle: true
  pedantic: false
  smartLists: false
  smartypants: false
---

# Hello, Slides Extended

- Bullet 1
- Bullet 2

---

## Vertical stack demo

--

### Child A of this vertical stack

Some body text.

--

### Child B of this vertical stack

More body text.


---

22 – Simple – Slide & Element Annotations (22-annotations.md)

---
theme: simple
center: false
margin: 0.2
---

<!-- .slide: style="background: linear-gradient(135deg,#ffe08a,#ff6f61)" -->

# Gradient background via slide annotation

This whole slide is styled by the `.slide` annotation.

---

# Inline element annotations

Big coral heading <!-- element style="color: coral; letter-spacing: 1px" -->

Paragraph with a **class** <!-- element class="with-border" -->

<style>
.with-border { border: 2px dashed #999; padding: .5rem; }
</style>

---

## Background image shorthand

<!-- slide bg="[[assets/images/mountains.jpg]]" data-background-opacity="0.6" -->
Caption text over background.


---

23 – Simple – Blocks (23-blocks.md)

---
theme: simple
center: false
margin: 0.2
---

# Block Comments (`::: block`)

::: block <!-- element style="background: #222; color: white; border-radius: 16px; padding: 16px" -->

### A styled group

- The annotation on the **block** styles everything within
- Great for callouts, grouped lists, and code samples
:::

---

# Nested blocks

::: block <!-- element style="background:#fff3cd; padding:12px; border-left:6px solid #f0ad4e" -->
**Outer** block

::: block <!-- element style="background:#d1ecf1; padding:12px; border-left:6px solid #17a2b8" -->
**Inner** block
:::
:::


---

24 – Simple – Fragments & Classes (24-fragments.md)

---
theme: simple
center: false
margin: 0.2
fragments: true
---

# Fragments on elements

First appears <!-- element class="fragment" data-fragment-index="1" -->

Then fades out <!-- element class="fragment fade-out" data-fragment-index="2" -->

Highlights red <!-- element class="fragment highlight-red" data-fragment-index="3" -->

---

# Fragmented list

- Permanent item
- Second <!-- element class="fragment" data-fragment-index="2" -->
- First  <!-- element class="fragment" data-fragment-index="1" -->


---

25 – Simple – Grid: Basics by name (25-grid-basics.md)

---
theme: simple
center: false
margin: 0.2
---

# Grid positioned by names (no math)

<grid drag="40 30" drop="topleft" bg="#f4f6ff" pad="12px" align="left">

### Top-left

</grid>

<grid drag="40 30" drop="top" bg="#fff" border="thin solid #ddd" align="center">

### Top (center)

</grid>

<grid drag="40 30" drop="right" bg="#eefaf5" pad="10px">

### Right

</grid>

<grid drag="40 20" drop="bottom" align="stretch" style="font-size:20px">
**Footer bar** with stretch alignment
</grid>


---

26 – Simple – Grid: Flow (row/col) & spacing (26-grid-flow.md)

---
theme: simple
center: false
margin: 0.2
---

# Column flow (vertical children)

<grid drag="40 60" drop="left" bg="white" flow="col" align="center">
One
Two
Three
</grid>

# Row flow (horizontal children)

<grid drag="60 40" drop="right" bg="white" flow="row" align="center">
Alpha
Beta
Gamma
Delta
</grid>

---

# Custom spacing (CSS)

<grid drag="90 40" drop="center" flow="row" style="gap: 1rem;">
A
B
C
D
</grid>

> Tip: `gap` is applied via `style`.


---

27 – Simple – Grid: Alignment & Justify (27-grid-align-justify.md)

---
theme: simple
center: false
margin: 0.2
---

# Horizontal/vertical alignment

<grid drag="36 20" drop="topleft" align="left">Left aligned</grid>
<grid drag="36 20" drop="topright" align="right">Right aligned</grid>
<grid drag="36 20" drop="center" align="justify">Justified paragraph will stretch across lines</grid>

---

# Justify content (space-between / around / evenly)

<grid drag="90 20" drop="top" justify-content="space-between" bg="#f5f5f5">
Item 1
Item 2
Item 3
Item 4
</grid>

<grid drag="90 20" drop="center" justify-content="space-around" bg="#eef">
Item 1
Item 2
Item 3
Item 4
</grid>

<grid drag="90 20" drop="bottom" justify-content="space-evenly" bg="#efe">
Item 1
Item 2
Item 3
Item 4
</grid>


---

28 – Simple – Grid: Fragments, Rotate, Filter (28-grid-effects.md)

---
theme: simple
center: false
margin: 0.2
---

# Enter by fragments

<grid drag="25 25" drop="left" bg="#ffd1dc" frag="1">One</grid>
<grid drag="25 25" drop="center" bg="#c1e1c1" frag="2">Two</grid>
<grid drag="25 25" drop="right" bg="#cde7ff" frag="3">Three</grid>

---

# Rotate & filter

<grid drag="30 25" drop="topleft" rotate="-8" bg="#B565A7">Tilted</grid>
<grid drag="30 25" drop="center" filter="grayscale()" bg="#fff">Grayscale</grid>
<grid drag="30 25" drop="bottomright" opacity="0.6" bg="#000" style="color:white">Semi-transparent</grid>


---

29 – Simple – Backgrounds: Color, Image, Opacity (29-backgrounds.md)

---
theme: simple
center: false
margin: 0.2
---
<!-- slide bg="#222" -->

# Solid background

---
<!-- slide bg="[[assets/images/desk.jpg]]" data-background-opacity="0.55" -->

# Image with 55% opacity

---
<!-- .slide: style="background: radial-gradient(circle at 20% 30%, #fceabb, #f8b500)" -->

# Gradient via inline style

---

30 – Simple – Fonts & Extra CSS (30-fonts-css.md)

---
theme: simple
center: false
margin: 0.2
css:
  - css/typography.css
  - css/brand-accents.css
---

# Using additional CSS files

Body text with custom fonts and accent classes.

**Accent** <!-- element class="brand-accent" --> text example.


---

31 – Simple – Templates: Define files (31-templates-define.md)

<!-- Save each of these as its own note in your vault. -->

# tpl-simple-footer.md

<% content %>
<grid drag="100 8" drop="bottom" align="left" pad="0 16px">
<%? footer %>
</grid>

---

# tpl-2col-header-footer.md

<grid drag="100 10" drop="top" bg="white" align="left" pad="0 20px">
<%? title %>
</grid>

<grid drag="60 70" drop="left" align="topleft">
<% left %>
</grid>

<grid drag="35 70" drop="right" align="topleft">
<% right %>
</grid>

<% content %>

<grid drag="100 8" drop="bottom" align="left" pad="0 20px">
<%? footer %>
</grid>

---

# tpl-quote-image.md

<grid drag="60 80" drop="left" align="center" pad="12px">
<% quote %>
</grid>

<grid drag="36 80" drop="right" align="center">
<% image %>
</grid>

<% content %>


---

32 – Simple – Templates: Use them (32-templates-use.md)

---
theme: simple
center: false
margin: 0.2

# Apply a default for *all* slides (optional)

defaultTemplate: "[[tpl-simple-footer]]"
---
<!-- slide template="[[tpl-2col-header-footer]]" -->
::: title

### My Talk — Section 1

:::

::: left
- Bullets on the left
- **Styled** and tidy
:::

::: right
![[assets/images/diagram.png|600]]
:::

::: footer
*© Your Org — 2025*
:::

---
<!-- slide template="[[tpl-quote-image]]" -->
::: quote
> “Simplicity is the ultimate sophistication.”
:::

::: image
![[assets/images/leonardo.jpg|450]]
:::

Main content under the quote+image.


---

33 – Simple – “Autocomplete” cheat sheet (33-autofill-cheats.md)

---
theme: simple
center: false
margin: 0.2
---

# Type these starters to get suggestions

`<!-- slide ` … then attributes like `bg="…"`, `data-background-opacity="…"`

`<!-- .slide: ` … then CSS `style="…"` or `class="…"`

`<!-- element ` … then `class="…"`, `style="…"`, `data-…="…"`

`::: block` … then annotate the block with `<!-- element … -->`

`<grid ` … then common attributes: `drag="w h" drop="pos" flow="row|col" align="…" justify-content="…" bg="…" pad="…"`


---

34 – Simple – Icons & Emoji (34-icons-emoji.md)

---
theme: simple
center: false
margin: 0.2
---

# Font Awesome icons

![](fas fa-envelope fa-3x) <!-- element color="coral" -->
<i class="fas fa-camera fa-2x"></i>

# Emoji shortcodes

:smile: :rocket: :sparkles:  *(use Emoji Shortcodes plugin for completion)*


---

35 – Simple – Markdown Beauty (35-markdown-beauty.md)

---
theme: simple
center: false
margin: 0.2
highlightTheme: vs2015
---

# Text styles

**Bold**, *italic*, ~~strikethrough~~, `inline code`

> Blockquote with annotation <!-- element style="border-left: 6px solid #ccc; padding-left: 12px" -->

```python
# Code block with highlight theme
print("Hello, Slides Extended")

Footnote demo[^1]

[^1]: Footnote text shown at the bottom of the slide.

> [!tip] Callout Helpful callouts are great on slides.



---

## 36 – Simple – Mermaid + Excalidraw (`36-mermaid-excalidraw.md`)
```markdown
---
theme: simple
center: false
margin: 0.2
---
# Mermaid diagram
```mermaid
flowchart LR
  A[Start] --> B{Choice}
  B -- Yes --> C[Path 1]
  B -- No  --> D[Path 2]


---

Excalidraw embed

![[Sample.excalidraw|100]]

![[Sample.excalidraw]] <!-- element style="width:320px; height:280px" -->

---

## 37 – Simple – Slide Backgrounds Library (`37-background-library.md`)
```markdown
---
theme: simple
center: false
margin: 0.2
bg: '#ffffff'  # default for all slides
---
<!-- slide bg="#111" -->
## Dark

---
<!-- slide bg="rgb(25, 118, 210)" -->
## RGB

---
<!-- slide bg="hsla(315, 100%, 50%, 1)" -->
## HSLA

---
<!-- slide bg="https://picsum.photos/seed/picsum/800/600" data-background-opacity="0.45" -->
## Image + opacity


---

38 – Simple – Content-first “Templates” (38-templates-content-first.md)

---
theme: simple
center: false
margin: 0.2
---
<!-- slide template="[[tpl-simple-footer]]" -->
# Section Title
Body content here.

::: footer
[Docs](https://www.revealjs.com) • [[Local WikiLink]] • [External Markdown Link](https://example.com)
:::

---
<!-- slide template="[[tpl-simple-footer]]" -->
## Bulleted Summary
- point one
- point two

::: footer
© 2025 • [[About Me]]
:::


---

39 – Simple – Grid “Card” Gallery (39-grid-cards.md)

---
theme: simple
center: false
margin: 0.2
---
# Card grid with wrap via CSS
<grid drag="100 70" drop="center" flow="row" style="gap: 12px; flex-wrap: wrap;">
::: block <!-- element style="background:white; padding:12px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,.1); width: 30%" -->
**Card 1**
:::

::: block <!-- element style="background:white; padding:12px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,.1); width: 30%" -->
**Card 2**
:::

::: block <!-- element style="background:white; padding:12px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,.1); width: 30%" -->
**Card 3**
:::

::: block <!-- element style="background:white; padding:12px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,.1); width: 30%" -->
**Card 4**
:::
</grid>


---

40 – Simple – “Starter Slide Templates” you can duplicate (40-starter-slide-templates.md)

---
theme: simple
center: false
margin: 0.2
---
<!-- slide template="[[tpl-2col-header-footer]]" -->
::: title
### Two Column — Big Title
:::

::: left
1. Left bullet list
2. Another line
:::

::: right
> [!warning]
> Important caution block on the right.
:::

::: footer
**Your Org** — www.example.com
:::

---
<!-- slide template="[[tpl-quote-image]]" -->
::: quote
> "Short quote with impact."
:::

::: image
![[assets/images/hero.png|600]]
:::

Notes or links below.


---

Bonus – Micro Snippets you’ll reuse (_snippets.md)

<!-- .slide: style="background-color: coral;" -->
<!-- slide bg="#222" data-background-opacity="0.4" -->

<!-- element class="fragment fade-in" data-fragment-index="1" -->

::: block <!-- element style="background:#f9f9f9; padding: 12px; border-radius: 8px" -->
Grouped content
:::

<grid drag="60 40" drop="center" flow="row" align="center" justify-content="space-evenly">
A
B
C
</grid>

I dropped a 20-note “Simple theme” starter pack into the canvas with copy-paste-ready files (notes 21–40) plus a bonus snippet sheet. It covers vertical stacks, slide/element annotations, ::: block, fragments, Grid layouts (by name, flow, align/justify, effects), backgrounds (solid/image/gradient), inline CSS & extra CSS files, icons, emoji shortcodes, Mermaid, Excalidraw, and—most importantly—slide templates (with <% content %>, <% footer %>, etc.) and how to use them.

Quick orientation (answers to your sticking points):

Vertical slides: use -- for children in a vertical stack; --- stays horizontal. 

Slide vs. element annotations:

Whole-slide: <!-- .slide: style="…" --> or <!-- slide bg="…" -->. 

Single element: add <!-- element … --> after the line you want to style/class. 


::: block groups content; the annotation after the opening line styles everything inside the block. (See note 23.) 

Fragments: add class="fragment …" (optionally with data-fragment-index). I included both inline and list patterns. 

Grid component (no math mode): position by names like drop="left|right|top|bottom|center|topleft|…"; control flow (row|col), align, justify-content, frag, pad, rotate, filter, bg, etc. (Notes 25–28.) 
Tip: there isn’t a dedicated gap/wrap attribute—use style="gap: …; flex-wrap: wrap;" on the grid (I show this in note 39).

Backgrounds: use bg="#hex", bg="[[image]]", and data-background-opacity="…", or a CSS gradient via .slide style. (Note 29, 37.) 

Frontmatter you asked about (note 21):

center: false, theme: simple, margin: 0.2, minScale/maxScale bound how far content scales to fit different screens, and markdown: maps to reveal.js’s marked options (I included a safe default block). 


Templates (your big confusion):

A template is just another note that defines placeholders like <% content %>, <% footer %>, <% left %>, etc.

In your slide, you reference the template: <!-- slide template="[[tpl-…]]" -->.

Then you fill placeholders with block comments named after them: ::: footer … :::, ::: left … ::: (anything not in a block goes to <% content %>).

I provided working files: tpl-simple-footer, tpl-2col-header-footer, tpl-quote-image, and usage examples in notes 31–32 & 38–40. 


Inline CSS & external CSS: you can add a <style>…</style> block in a slide, or load CSS files via frontmatter css:; paths are relative to your Slides Extended theme directory. (Notes 22, 30.) 

Icons & emoji: Font Awesome icons work via image syntax/HTML/shortcodes; emoji shortcodes render and pair nicely with the Emoji Shortcodes plugin. (Note 34.) 

Theme: this pack uses theme: simple, but you can switch themes or even reference remote CSS (e.g., dzello themes) via frontmatter. 

Excalidraw: works if auto-export SVG/PNG is enabled; I show both width-capped and styled embeds. (Note 36.)


If you want, I can spin up matching packs for other themes (e.g., consult/mattropolis) or generate snippet completions tailored to your vault structure.