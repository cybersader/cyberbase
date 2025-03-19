---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, March 19th 2025, 12:50 pm
date modified: Wednesday, March 19th 2025, 3:57 pm
---

# My Tagging Structure

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

<u>Obsidian Tagging and Limitations:</u>
- Benefits:
	- Can have overlapping ontologies w/nested tagging
- Limitations:
	- Sorting depends on Obsidian’s collator.
	- Special characters reserved for Obsidian Markdown cannot be used.
	- Some tags may not render well in live view - [Tag Bugs & Issues](../Tag%20Bugs%20&%20Issues/Tag%20Bugs%20&%20Issues.md)

<u>SEACOW(r) Rule Definitions:</u>

The SEACOW(r) Framework (System, Entity, Activities → Capture, Output, Work, (r)elation) serves as a _rule-setting blueprint_ rather than an ontology. Here’s an advanced take on how to apply these rules:

- **CAPTURE Tags:**
	- Represent logic, context, and structure.
	- Must remain flat—no more than two levels deep.
	- All CAPTURE tags tied directly to an interface (e.g., daily notes, encounters) should use a flat structure.
- **OUTPUT Tags:**
	- Can have nested structures.
	- Nested OUTPUT tags may only relate to knowledge work; knowledge should not be shifted between them.
- **RELATION Tags:**
	- For CAPTURE content, RELATION tags are kept flat unless integrated within an OUTPUT taxonomy aligned with folder structures.
- **Entity/Work Tags:**
	- Used for knowledge work tied to individuals or groups.
	- For example, instead of a slow-to-type `_ben/para/projects`, use a faster alternative like `--ben/projects`.

<u>Goals of my Obsidian Tagging System:</u>
- **Easy to type** for frequently accessed tags.
- **Consistent sorting** across the platform.
- **Explorable**, with clustered/keyword tags appearing toward the bottom.

## Tagging Prefixes

| **Tag Type**            | Applicable SEACOWr Mapping or Rules | **Examples**              | **Sorting Priority**               | **Typing Ease**         | **Usage/Notes**                                                                       |
| ----------------------- | ----------------------------------- | ------------------------- | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| **Underscore-Prefixed** |                                     | `_/`, `_ -`               | Very High (appears at top)         | Harder to type          | Ideal for CAPTURE tags (logic, context, flat structure)                               |
| **Dash-Prefixed**       |                                     | `-/`, `- /`               | Very High (right after underscore) | Easier than underscore  | Best for OUTPUT tags (system compatible, supports limited nesting for knowledge work) |
| **Slash-Only**          |                                     | `/`                       | Mid-to-Low                         | Very easy               | Suited for simple tags with minimal hierarchy                                         |
| **Emoji Tags**          |                                     | 😃, 🚀, etc.              | Low (after ASCII characters)       | Slower (emoji keyboard) | Use for secretive/rare tags relying on visual cues                                    |
| **Hashtag-Word**        |                                     | `#word`                   | Lower                              | Very easy               | Great for relation tags or keyword cross-linking                                      |
| **Entity/Group Tags**   |                                     | `#--group`, `#--projects` | Lower (similar to hashtag-word)    | Very easy               | For tagging entities or groups (multiple people/projects, folder-like categorization) |
|                         |                                     |                           |                                    |                         |                                                                                       |

## Tagging Example Structure

Using SEA(COWr):

Choice for sorting (which characters you use for prefix) should align with the goal of your vault.

- `_clip/` - A(C) -
	- `_clip/youtube`
	- `_clip/articles`
- `_inbox` - A(C) -
- `-/` - A(O) - used to map directly and sync with the root folder structure in terms of the strict public-facing taxonomy 
	- `-/01_projects` - A(O) + A(r) - children under the public-facing OUTPUT folder may relate to out CAPTURE structures or WORK structures
		- `-/01_projects/cyber_tool_im_building` - example 
- `#<word>` - A(r) - used to for clustering and keywords to help improve searching
- `--/` - E - divides up for entities in the knowledge system/platform
	- `--/cybersader` - E + A(W) - knowledge work structure for cybersader
- `/` - S - system-related tagging structures (likely related to Obsidian or other interfacing systems like GitHub)
	- `/templates` - S - templates for Obsidian vault

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