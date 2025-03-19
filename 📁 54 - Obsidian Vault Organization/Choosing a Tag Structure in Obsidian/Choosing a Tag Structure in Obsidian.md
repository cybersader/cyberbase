---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, March 19th 2025, 11:04 am
date modified: Wednesday, March 19th 2025, 11:34 am
---

## 1. Introduction

Obsidian tags provide a **flexible** way to group notes across multiple folders and contexts, creating **overlapping ontologies** impossible with a strict folder hierarchy alone. However, Obsidian has **some limitations** (e.g., disallowing periods in tags), and certain **Unicode-based** tagging conventions can be slower to type—particularly on Windows.

Meanwhile, frameworks like **SEA(COWr)** can guide us to build **purposeful** structures—without necessarily _forcing_ “SEA,” “COW,” or “RELATION” directly into the tag names. Instead, we use SEA(COWr) to define rules about **what** goes into tags and **how** they serve the knowledge system.

---

## 2. Why Collation and Sorting Matter

### 2.1 The Fundamental Nature of Sorting

On a **fundamental** level, all knowledge platforms must apply **some** kind of sorting or collation to strings (filenames, tags, etc.). Typically:

- **ASCII-based** sorting: Special characters (e.g., `!`, `#`, `-`, `_`) come before alphanumeric characters.
- **Unicode** sorting: Emojis and fullwidth characters often have code points that place them in different “blocks,” which can cause them to appear _before_ or _after_ typical ASCII letters—depending on the environment.
- **Obsidian** uses the underlying **Chromium or Electron** collation approach, which might not match the OS file explorer [exactly](../../📁%2010%20-%20My%20Obsidian%20Stack/File%20Order/File%20Order.md).

### 2.2 Taking Advantage of Sorting

Because these systems generally treat certain characters as “less” or “more” than letters, you can leverage that to **structure** your tag listing:

- **Underscores** (`_`) typically appear before letters in ASCII.
- **Hyphens** (`-`) often appear in a slightly different position.
- **Emojis** might come even _earlier_ or _later_ in the sorted list, depending on the environment.
- If you repeat certain characters (`--` or `___`), you can force them to appear at a certain order or to group them distinctly.

By understanding these fundamentals, you can create systematic, predictable “clusters” of tags that appear in specific segments of the Tag Pane or in alphabetical auto-completion lists.  This is how you can create a practical and powerful tagging system.

---

## 2. Context: SEA(COWr) as a Meta-Framework

### 2.1 What Is SEA(COWr)?

- **S**ystem (the platform or environment—Obsidian)
- **E**ntity (the audience or user)
- **A**ctivities (the main types of knowledge operations)
    - **C**apture
    - **O**utput
    - **W**ork
    - (r) **Relation** (sometimes considered part of Work)

### 2.2 Using SEA(COWr) as _Rules,_ Not a Naming Convention

- **Key Insight:** 
    - Example Rule: “Anything in `#capture_` is raw/unedited input, so we don’t nest or do deep linking below that.”
    - Example Rule: “Tags under `#output_` reflect final or shareable states. We keep them minimal.”
    - Example Rule: “For knowledge work, use tags like `#todo` or `#draft` to indicate tasks or in-progress states. We allow more granularity there.”

This way, **SEA(COWr)** helps you define _when_ and _why_ to tag, rather than prescribing the tag names themselves.

## 3. Applying the SEA(COWr) Meta-Framework

### 3.1 Quick Recap of SEA(COWr)

**SEA(COWr)** is a conceptual approach to ensure you address:

1. **S**ystem – The environment or platform constraints (e.g., sorting, plugin compatibility).
2. **E**ntity – Audience or user context (personal vs. team vs. public).
3. **A**ctivities – The core knowledge operations:
    - **C**apture
    - **O**utput
    - **W**ork
    - (r) **Relation** (sometimes nested under “Work”)

> [!important] You don’t literally name your tags “SEA/COW.” Instead, you define **rules** that reflect each concept—like how and where you store or name things associated with capture, output, work, etc.  **SEA(COWr)** is a **mental model** to ensure you address each knowledge activity in your system.

### 3.2 Using SEA(COWr) as _Rules,_ Not a Naming Convention

> [!hint] When defining SEACOWr rules, refer often to knowledge platform **structures** and **contexts**

A frequent advanced approach is **restricting** how the knowledge activities can stack. For instance:

1. **“We can add, but not remove, certain SEA(COWr) components in deeper levels.”**
    - E.g., you can’t put an **Output** item **inside** Capture if you haven’t “upgraded” it to Work or related steps yet.
2. **“You can’t do advanced ‘Work’ or ‘Output’ activities under a ‘Capture’ structure/context.”**
    - So the tags (and sometimes folders) that start with a CAPTURE-related context _cannot_ have sub-tags for Work or Output-related contexts such as `#clippings/youtube/science/aerospace`.  Structuring like this counts as a form of knowledge WORK or knowledge OUTPUT (a consumable taxonomy).  

The next section shows how that might look in practice.

---

## 3. Core Considerations When Choosing Your Tag Strategy

1. **Ease of Typing vs. Visual Aesthetic**
    
    - Typing special Unicode or emoji tags is _slower_, especially on Windows (requiring the emoji panel).
    - Some advanced or fancy tag symbols look great but can disrupt **flow** during quick note-taking.
2. **Plugin Compatibility**
    
    - Many Obsidian plugins assume your tags are “regular words” with no periods, colons, or advanced punctuation.
    - If you rely on plugins (e.g., Tag Wrangler, Dataview queries for tags), “simple” tags (letters, underscores, hyphens) often work best.
3. **Clustering & Overlapping Ontologies**
    
    - One big reason to use tags is the ability to assign multiple categories to a note (e.g., `#science` and `#client_project`).
    - Even if you create advanced hierarchical tags (e.g., `#science/biology`), you can still overlap them with other tags in the same note.
4. **Auto-Completion and Alphabetical Sorting**
    
    - Obsidian auto-completes tags in the editor. Clear, consistent naming improves your speed and reduces confusion.
    - Alphabetical sorting in the tag pane means you might want to standardize prefixes or group tags by category:
        - Example: `#cluster_science`, `#cluster_history`, `#cluster_biology`

---

## 4. Common Tag Naming Approaches

### 4.1 Plain Words (Recommended for “Clustering”)

- **Examples**: `#science`, `#history`, `#research`, `#task`, `#todo`
- **Pros**: Very easy to type and remember; best plugin compatibility.
- **Cons**: Less visually distinct if you want fancy icons or advanced sorting.

### 4.2 Underscores / Hyphens for Hierarchy or Separation

- **Examples**: `#science_biology`, `#capture_inbox`, `#todo_done`, `#temp-note`
- **Pros**: Great for grouping related tags without using `/` (nested tags). Easy to type, no special characters needed.
- **Cons**: Doesn’t have the “collapsed” hierarchical look in the tag pane like slashes do.

### 4.3 Nested Tags with Slashes

- **Example**: `#science/biology`, `#todo/in_progress`, `#todo/completed`
- **Pros**: In Obsidian’s **Tag Pane**, these show up as collapsible lists. Good for multi-level categories (like `#science/biology/humangenetics`).
- **Cons**: Search gets more granular, sometimes leading to “tag explosion” if you overuse nesting.

### 4.4 Emoji or Special Unicode Prefixes

- **Examples**: `#🔍research`, `#📌pin`, `#⚠urgent`, `#→draft`
- **Pros**: Visually appealing, easy to pick out in a large list of tags.
- **Cons**: Slower to type (especially on Windows). Some plugins might not handle them gracefully. Sorting can be unpredictable if you mix emojis with standard tags.

---

## 5. Balancing SEA(COWr) With Tag Design

### 5.1 Capture-Related Tags

- Typically represent raw or incoming info (images, web clippings, references).
- **Rule**: “Don’t nest or get fancy; keep it simple.” (e.g., `#capture_inbox`)
- **Why**: Because capture items are in flux, you don’t want overhead. You might do actual sorting or processing later.

### 5.2 Output-Related Tags

- Mark final or sharable artifacts (reports, published articles, or a note you plan to share).
- **Rule**: “Use short, clear tags for anything that is ‘finished.’” e.g., `#output_final`, `#published`.
- **Why**: You or your team can quickly filter for completed or public-ready content.

### 5.3 Work-Related Tags

- Indicate tasks, status, or processes (`#todo`, `#draft`, `#review`, `#in_progress`).
- **Rule**: These tags can get more granular because your knowledge work is iterative (`#todo/research`, `#todo/writing`).
- **Why**: It’s easier to see _what_ is in progress and _where_ you’re spending time.

### 5.4 Relation (Optional)

- Not always used as direct tags. You might rely on **links**, **metadata** fields, or MOCs for relationships.
- **Rule**: You _can_ use bridging tags, like `#crosslink`, to remind yourself that a note ties multiple topics together.
- **Why**: This can help you find “hub” notes that interrelate many ideas.

### 5.5 System & Entity

- SEA(COWr) also mentions **System** (platform constraints) and **Entity** (audiences).
- **Rule**: If you have multiple audiences or contexts, you could adopt tags like `#team_only` or `#publish_public`.
- **Why**: Distinguishes what can be shared externally vs. internal. This is especially handy if you use **Obsidian Publish** or share certain folders with a team.

---

## 4. Advanced Example: SEA(COWr) Tag Hierarchy

Below is an **example** of how you might label tags using **repeated dashes** or **underscores** to force sorting order, plus **slashed** subcategories. Notice how **Capture** tags come first in the ASCII sorting (due to `_` or `-` usage), while **Output** tags might be higher or lower, etc.

### 4.1 Example “Lego Blocks” in a Tag Structure

1. **`_/`** – Unstructured or “general categories” (top-level personal clusters)
    - `#_/science`
    - `#_/philosophy`
    - `#_/unstructured/random`
2. **`-/`** – Next-level category for “other purposes” or maybe “meta stuff”
    - `#-/meta`
    - `#-/dev` (for development)
3. **`--/`** – Another deeper prefix indicating “system-level” topics or rare categories
    - `#--/system_config`
    - `#--/obsidian_plugins`

#### Why Multiple Dashes?

- Multiple dashes **push** these tags farther up or down in an alphabetical list. For instance, `--/` might appear before `-/` or after, depending on how your environment sorts double-dashes vs. single.

### 4.2 Tying in SEA(COWr) Activities

Imagine you define these rules:

- **Capture** always sits under `#0_capture/…`
- **Work** always sits under `#1_work/…`
- **Output** always sits under `#2_output/…`
- You can’t place “Output” inside the “Capture” hierarchy. Instead, you must create a new note or tag that’s in `#1_work` or `#2_output`.

Then, within each major activity, you exploit sorting with underscores or repeated dashes:

- `#0_capture/inbox`
    
- `#0_capture/web_clips`
    
- `#0_capture/bookmarks`
    
- `#1_work/todo`
    
- `#1_work/in_progress`
    
- `#1_work/review`
    
- `#1_work--deep_dive` (the double-dash might appear at the bottom or top depending on collation)
    
- `#2_output/final`
    
- `#2_output/published`
    
- `#2_output-handoffs` (using a hyphen to separate an additional state)
    

**Result**: If you open Obsidian’s Tag Pane and sort by name, you see:

1. `#0_capture/...`
2. `#1_work/...`
3. `#2_output/...`

…in a neat order, because numerals like **0, 1, 2** come before letters in ASCII. Inside each, your naming convention with underscores or repeated dashes can further cluster them.
---

## 6. Handling Unicode & Typing Speed

### 6.1 Keyboard Shortcuts for Emojis

- On Windows, press <kbd>Win + .</kbd> (period) to open the emoji keyboard.
    - Slow if you do it frequently.
- Consider a text expander tool (like **AutoHotkey** or **Espanso**) so typing `:rocket:` becomes `🚀`.

### 6.2 Fullwidth Unicode Substitutes

- If you absolutely need “@” or “.” in tags:
    - Use fullwidth symbols (`＠` U+FF20 or `．` U+FF0E).
    - Keep a snippet or text macro for quick insertion.
- **But** ensure you’re comfortable with potential plugin/compatibility quirks.

### 6.3 Hyphen or Underscore Over “Fancy” Unicode

- Often simpler to do `#capture_inbox` or `#capture-inbox` than messing with “look-alike” punctuation.
- Consistency is key: pick one delimiter (`-` or `_`) and stay with it.

---

## 7. Plugin Options & Sequences

### 7.1 Tag Wrangler

- Helps rename or merge tags if your structure changes.
- If you add new categories or rearrange nested tags, Tag Wrangler can bulk-update references.

### 7.2 Nested Tags (Core functionality)

- Simply add slashes in the tag: `#main/sub/child`.
- The Tag Pane will show collapsible tiers.

### 7.3 Dataview

- If you rely heavily on advanced queries (like searching `#todo` across multiple vault areas), keep tags short and straightforward.
- Dataview can also parse **YAML frontmatter**—so if you can’t use certain punctuation in tags, consider storing them as frontmatter fields.

---

## 8. Example Tag Systems

Below are a few **practical** examples to illustrate final naming patterns that align with SEA(COWr) logic (without _literally_ using “SEA” or “COW” in the tag).

### 8.1 Simple Alphanumeric + Underscore

- `#capture_inbox` – raw unprocessed notes
- `#work_in_progress` – items actively being edited
- `#output_final` – ready-to-share content
- `#science`, `#philosophy` – general knowledge clusters
- `#team_client` – indicates notes for client projects or shared with a client

### 8.2 Nested Slashes for Some Categories

- `#capture/inbox`
- `#work/todo` / `#work/review` / `#work/done`
- `#output/final`
- `#cluster/science` / `#cluster/biology` / `#cluster/ai`

### 8.3 Hybrid with Emojis

- `#🔍research`
- `#🚧wip` (work in progress)
- `#📤final_output`
- `#🏷cluster_science` / `#🏷cluster_history`
- Possibly a “tag root” prefix like `#🏷` or `#📂` for cluster tags, if you want them to sort together.

### 8.4 SEA(COWr) Advanced

---

## 9. Final Thoughts

- **SEA(COWr)** helps clarify **why** you’re labeling notes (Capture, Work, Output, etc.), guiding the _logic_ behind your tag sets.
- **Tag naming** is about balancing:
    - Speed of **typing**
    - **Readability** in the Tag Pane
    - **Plugin** compatibility
    - Potential **aesthetics** (like emojis)
- For large projects or teams, **consistency** in your tagging convention is more important than the exact choice of hyphen, underscore, or emoji. If multiple people edit notes, ensure everyone agrees on the same approach.
- Don’t be afraid to revise your tags over time—tools like **Tag Wrangler** or even simple “Find and Replace” can help you restructure as your system evolves.

---

### Quick Reference

1. **Keep tags simple** for broad clusters (`#science`, `#history`).
2. For more complex logic (versions, semver, advanced punctuation), consider **nested tags** (`#version/1/4/2`) or **properties** in YAML.
3. Decide whether **emojis** or **Unicode** are worth the typing cost.
4. Use a **framework** like SEA(COWr) to define guidelines about how tagging should be structured.  