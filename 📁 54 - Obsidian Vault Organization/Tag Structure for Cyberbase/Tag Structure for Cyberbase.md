---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, March 19th 2025, 12:50 pm
date modified: Wednesday, March 19th 2025, 5:24 pm
---

# My Tagging Structure - Using the SEACOW Framework

This outlines a **tagging structure** and **set of rules** for Obsidian, guided by the **SEACOW(r) Framework** (made up by me). The goal is to **scale** your vault organization effectively while respecting Obsidian’s **limitations** (e.g., restricted punctuation), ensuring consistent sorting, and supporting numerous scenarios for knowledge platform or KMS (knowledge management system) usage.

---

I'm using my [SEACOWr Framework](../Knowledge%20Platform%20Organization%20Meta-Framework/Knowledge%20Platform%20Organization%20Meta-Framework.md) to map this to a conceptual model

<u>SEACOW(R) Categories:</u>
1. **S**ystem – The platform or technology context (e.g., Obsidian, Notion, etc.).
2. **E**ntity – The audience, user, or agent interacting with the knowledge.
3. **A**ctivities – The main types of operations on your knowledge platform.
Under **Activities**, we have four sub-components:
- **C**apture – How you get knowledge into the system.
- **O**utput – How you interface or communicate the knowledge to external systems, entities, or audiences.
- **W**ork – How you derive utility or process knowledge toward a goal.
- (**r**)elation – How you interlink knowledge or connect concepts (not a core component)

> [!info]- SEACOW(r) is a _rule-setting blueprint_, _not_ an ontology you must represent literally in tags.  Instead, it helps define constraints for your system and design it in a way that scales.

---

<u>Obsidian Tagging (Capabilities & Constraints):</u>
- Benefits:
	- Can have overlapping ontologies w/nested tagging
- Limitations:
	- **Sorting** relies on Obsidian’s internal collator (based on Chromium’s `Intl.Collator`), which may differ from your OS’s file explorer.
	- Special characters reserved for Obsidian Markdown cannot be used.
	- Some tags (especially with **emoji** or **Unicode** look-alikes) may not render ideally or can be cumbersome to type.
	- Some tags may not render well in live view - [Tag Bugs & Issues](../Tag%20Bugs%20&%20Issues/Tag%20Bugs%20&%20Issues.md)
	- **Period (`.`)**, **comma (`,`)**, and other punctuation are not valid _within_ a tag. If you need them for versioning or naming, consider alternatives (underscores, slashes, frontmatter, etc.).

---

<u>SEACOW(r) Rule Definitions:</u>

>[!summary] Here I've [defined rules](../SEACOWr%20Quick%20Start/SEACOWr%20Quick%20Start.md) using SEACOW(r) components like System, Entity, and **Activity** (Capture, Output, Work, Relation) to act as guidelines for using tags or folders in Obsidian.

- Knowledge can gain SEACOW(r) contexts/components as you traverse down some knowledge structure, but it can't lose the context
- **CAPTURE Tags:**
	- Represent logic, context, and structure.
	- **Depth Limitation:** Keep CAPTURE-related  at _no more than two levels of nesting_ (`#_clip/articles`, `#_clip/articles/reviewed` is permissible, but adding another sub-level breaks the rule).
	- All CAPTURE tags tied directly to an interface (e.g., daily notes, encounters) should use a flat structure.
	- **Multiple Tag Prefixes Allowed:** You may want separate prefixes for _inbox items_ vs. _web clippings_. For instance, `@inbox/...` and `_clip/...` are both valid as long as they obey the same overarching CAPTURE constraints (e.g., limited nesting depth).
- **OUTPUT Tags:**
	- **Nested Structures are OK:** OUTPUT tags can use deeper nesting to represent hierarchical or structured data.  Think of a library that people can easily explore without knowing where to go (i.e. can be used in combination with ENTITY).
	- **Scope of Relocation Prohibited:** Once something is tagged under OUTPUT, it shouldn't be reclassified as CAPTURE or WORK unless it is _archived_ or otherwise clearly separated.  
	- **OUTPUT is strictly for OUTPUT** can have RELATIONAL structures that link to CAPTURE or WORK, but CAPTURE and WORK structures should not be nested within OUTPUT structures.  Example: `docs/clippings` is fine in that it relates to maybe a `-clippings` tag by name or by topic, but it may not have actual clippings associated.  You cannot use pages under this tag for CAPTURE purposes. 
	- OUTPUT-related tags take precedence if in the same page as a CAPTURE-related tag
- **RELATION Tags:**
	- **Keep it Flat unless Mapped to OUTPUT:** RELATION tags (e.g., broad topics like `#keyword`, `#concept`, `#research`) typically remain _flat_ for easy cross-linking across the vault.
	- **Nested only within OUTPUT** if you want your _publicly shared taxonomy_ to nest certain relational concepts (e.g., `#-docs/research/quantum`).  In other words, you may only use RELATION tags for the purposes of structuring consumable knowledge for some audience.
	- **Purpose:** Provide cross-linking or conceptual grouping. For example, `#topic`, `#keyword`, `#reference`.
	- **Purely Descriptive:** They do not define a “stage” (like CAPTURE vs. OUTPUT). They simply link related notes or highlight thematic connections.
- **Entity Tags:**
	- **Context Cascade:** Once an ENTITY is used, all child tags imply that context. E.g., `#--bob/projects/launch` means “Bob’s launch project.”

---

<u>Goals of my Obsidian Tagging System:</u>
- **Ease of Typing** for frequent or quick tags (avoid too many underscores or complex symbols).
- **Consistent Sorting** using prefixes that appear in your preferred order (underscores or double-dashes to pin high-priority tags, slash-only or plain words for lower priority).
- **Scalability & Explorability**, grouping major categories at the top while letting ephemeral/keyword tags float near the bottom.

## Tagging Prefixes

Below is a **comprehensive table** of possible prefix styles. You do _not_ need all of these—choose what best matches your vault size and personal workflow.

| **Tag Type**            | **Likely SEACOW(r) Activity**                                                                       | **Examples**                                      | **Sorting Priority**                        | **Typing Ease**                      | **Usage/Notes**                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Double-Dash**         | Entity (E) or Work (W)                                                                              | `#--alice/projectX`  <br>`#--teamA`               | High (2 dashes often sort near top)         | Fairly Easy (two dashes)             | Perfect for referencing a person/team; can nest Work or sub-projects. E.g., `#--alice/tasks/design`.                                         |
| **Single Underscore**   | Capture (C) or System (S)                                                                           | `#_inbox`, `#_clip/youtube`                       | Very High (underscore typically first)      | Moderate (requires Shift+_)          | Good for CAPTURE tags (limit to 2-level nesting) or system-level settings (e.g. `_sys/plugins`). Ensures they appear at the top of Tag Pane. |
| **Double Underscore**   | System (S) or Special Priority                                                                      | `#__admin`, `#__archived`                         | Higher than single `_` (lex order)          | Harder (typing multiple `_`)         | For extremely important or archival tags that must be pinned. Use sparingly.                                                                 |
| **Single Dash**         | Output (O)                                                                                          | `#-docs/final`, `#-publish/blogs`                 | Just after underscores                      | Easier than underscore               | Ideal for structured OUTPUT tags. Allows deeper nesting. E.g., `#-docs/published/case-studies/security`.                                     |
| **Slash-Only**          | Could be Capture (C),  <br>or a general aggregator for clustering or keywords to improve search (r) | `#capture/articles`, `#capture/webclips/reviewed` | Mid (slash is ASCII 47, below `-` `_`)      | Very easy                            | Common approach for a simpler nested structure. Keep to 2 levels if it’s truly CAPTURE. If it’s OUTPUT, you can nest deeper.                 |
| **Hashtag-Word**        | Relation (r) or keyword                                                                             | `#idea`, `#research`                              | Lower (plain text sorts below symbols)      | Very easy                            | Flat keyword or conceptual tags. Perfect for cross-linking. E.g., `#concept`, `#productivity`, `#urgent`.                                    |
| **Emoji**               | Could be anything, but typically  <br>low-frequency or “secretive” use                              | `#🚀launch`, `#🔒private`                         | Low (Unicode emoji often sorts after ASCII) | Slow (need emoji keyboard)           | Great for visual emphasis or specialized meaning. Avoid overuse or confusion in large vaults.                                                |
| **Alphanumeric Prefix** | Flexible (C, W, O)                                                                                  | `#01-capture`, `#02-work`                         | Numeric sorting depends on leading zeros    | Medium (you must remember the codes) | Rigid ordering for large systems. E.g., `#01-capture`, `#02-output`. You can subdivide further, but must maintain consistent numbering.      |

## Tagging Example Structure

Using SEA(COWr):

### Conceptual Flow (SEACOW(r))

1. **Capture** (`-clip/`, `-inbox`, etc.)
2. **Entity/Work** (`--cybersader/...`)
3. **Output** (`_publicTaxonomy/...`)
4. **Relation** (`#keyword`)
5. **System** (`/templates`)

### ASCII Order

#-- (because second='-', third='-')
#-  (second='-')
#/  (second='/')
#_  (second='\_')
#a  (letters)
#😀 (some emoji can appear even later)

### Tag Structure (SEACOW(r) Context)

> [!tip] Choice for sorting (which characters you use for prefix) should align with the goal of your vault.

- `-` - merely captured by no particular entity
	- **`-clip/`** (Activities: CAPTURE)
		- Used for collecting or capturing resources (e.g., web clippings).
		- Examples:
			- `#-clip/youtube`
			- `#-clip/articles`
		- **Gaining More Context**: A sub-level _may_ add an **Entity** context or a **RELATION** tag, but it should not stop being “Capture.” For instance, `#-clip/youtube/--bob` might indicate “Bob’s specialized YouTube captures,” but it still retains the CAPTURE function at its core.
	- **`-inbox`** (Activities: CAPTURE)
		- A flat tag (no slashes) for quick, ad-hoc notes that aren’t tied to a specific subcategory.
		- Still part of CAPTURE; if you add more structure later (e.g., an entity), it’s layering on top of the original CAPTURE context.

- **`--`** (Entity + potentially Work) - divides up for entities in the knowledge system/platform
    - Denotes a **person**, **team**, or **organization**.
    - `--cybersader/` - Entity + (Activities: Work) - knowledge work structure for cybersader

- **`_`** (Activities: OUTPUT) - Typically used to mirror or sync with a **public-facing** or final structure (e.g., published documents, library categories).
	- `#_publicTaxonomy/` (Activities: Output) + Entity - my public facing taxonomy for some particular audience
		- `#_publicTaxonomy/projects`
		- `#_publicTaxonomy/blogs`
	- `_/` - (Activities: Output) + Entity - my main public facing taxonomy for the general public
		- `_/01_projects` - (Activities: Output) + Entity + (Activities: Relation) - children under the public-facing OUTPUT folder may relate to out CAPTURE structures or WORK structures
			- `_/01_projects/cyber_tool_im_building` - example

- **`#<word>`** (Activities: RELATION) - used for clustering and keywords to help improve searching
    - Flat hashtags used for cross-linking or conceptual grouping (e.g., `#research`, `#idea`).
    - They can appear anywhere to add relational context _on top of_ existing CAPTURE or OUTPUT tags, but they don’t supplant or remove the original context.
    - If you want nested “RELATION” under OUTPUT for a publicly shared taxonomy, it must remain OUTPUT + RELATION (it can’t go “back” to being just capture).

- **`/`** (System)
    - Tags (or partial tags) used for **system-level** references (templates, config notes, plugin references).
	- `#/templates`
	- `#/obsidian/hooks`
    - If you nest further, you might add a relation or entity dimension, but it remains under the “system” banner

---

### Additional/Reserved Prefixes (Optional)

- **`__`** (Double underscore)
    - Sorts near or above single `_` (depending on subsequent characters).
    - Could mark _special system items_ or _archival content_ (like `#__archived`).
- **`<numbers>`** (e.g. `#01-capture`, `#02-work`)
    - Good for forcing a rigid numeric order. Typically appear between `-` (ASCII 45) and `_` (ASCII 95).
    - `#01-capture` or `#02-work`. The second character is `0` (ASCII 48), which is higher than dash 45 but lower than underscore 95. You might see these appear just after `#-` but before `#_`.
- **`<emojis>`** (e.g. `#🚀launch`)
    - High Unicode codepoints.  Where these occur in order will differ in many places.  Do testing to see if they are before or after general ASCII. 
    - Good for visually standing out
- **`-/`** or `//`
    - Might combine a dash or slash, but watch for how Obsidian parses them. Typically recognized as `#-`, then the next character `/` is ASCII 47, so they’ll sort similarly to other dash-plus-slash tags.

---

### Sorting Tips

In ASCII-based order:

- **Dash (`-`)** is ASCII 45 → Usually appears toward the _top_ of the list.
- **Slash (`/`)** is ASCII 47 → Just after dash in order.
- **Underscore (`_`)** is ASCII 95 → Sorts _below_ dash and slash.
- **Letters** (e.g. `#topic`) range from ASCII 97 (a) to 122 (z).
- **Emojis** or extended Unicode typically land _after_ standard ASCII.

So, in practice:

1. `#--...` (second+third char both `-`)
2. `#-...` (dash as second character)
3. `#/...` (slash as second)
4. `#_...` (underscore as second)
5. `#keyword` (letters)
6. `#🚀emoji` (high Unicode)

If you need OUTPUT tags to appear _above_ CAPTURE, consider reversing their prefixes or adopting `!` or double-underscore for OUTPUT.

---

### Making It “More Realistic”

- **Decide Which Prefix Absolutely Must Come First**  
    If you want OUTPUT to outrank CAPTURE in the Tag Pane, you might rename `_` to `-` (or even `!`) so it sorts at the top. But if you’re okay with CAPTURE being top (e.g., you frequently check new “-clip” or “-inbox” items), keep it as is.
    
- **Flatten or Nest Appropriately**  
    SEACOW(r) says CAPTURE can have 2-level nesting, OUTPUT can have more. So you might see deeper nested tags in `_publicTaxonomy/...` but only short ones in `-clip/...`.
    
- **Leverage Entity**  
    If you often collaborate with certain individuals, the `--` pattern is great for quickly scanning “who” is involved. If not, you could skip entity tags or keep them minimal.
    
- **Document the System**  
    Maintain a short note:

```
# Tag Prefix Conventions:
- `#-` => CAPTURE
- `#--` => ENTITY + WORK
- `#_` => OUTPUT
- `#` (plain word) => RELATION
- `#/` => SYSTEM
- ...
```

# Ideas

Tagging hacks
- emojis take long to use but easy to find scrolling
- emojis can appear before or after ASCII 
Patterns of characters are easy to type but limited like "---" and you should limit categories alphabetically for sea cow 
Break up tagging by entities like personal vs just system

Seacowr gives you a language to use and a mental model

Seacowr rule definition components
- structures/logic/context
- direction or data structures (graph, hierarchical, nested)
- length 
- seacowr attributes/states/components (SEACOWr)

My seacowr rules for tagging
- CAPTURE tags logic/context/structure cannot house nested tags more than 2 deep
- OUTPUT tags can have nested knowledge structures/tags but they can only RELATE to knowledge WORK and knowledge shall not be moved between them
- All CAPTURE categories with the interface/ENTITY directly as the person (daily notes, encounters, etc.) must reside in a flat structure.
- RELATION for CAPTURE content will be limited to flat tags and not nested ontologies unless being applicable to OUTPUT tag taxonomies in line with folders

System components of obsidian tagging for consideration:
- sorting
- typability and emoji keyboards
- nesting
- visual and recognition while scrolling
- system capability (OS and GitHub)

For my example I want this system to make it easy to type what's accessed most, work with GitHub, have consistent sorting, and be explorable with the clustered parts being at the bottom.

Example now:

_/ or _ - sorting good and typing harder
-/ or - sorting good and typing good
/ Sorting bad? And typing good
Emojis - sorting down more and typing bad can be the lowest too for secretive or hard to find rare cases 
#word - sorting down far and typing easy

Structure based on seacowr and other structures

Capture #_or-clippings
Output #_/ or -/ system compatible?
Relation #word
Entity/work for multiple people or groups #--group/projects or para folders