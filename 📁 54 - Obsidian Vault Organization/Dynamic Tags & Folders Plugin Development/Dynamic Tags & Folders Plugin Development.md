---
tags: []
aliases: []
publish: true
permalink: 
date created: Sunday, March 23rd 2025, 2:20 pm
date modified: Sunday, March 23rd 2025, 5:06 pm
---

# 1) Naming & Concept

- Dynamic Tags & Folders
- Dynamic Tag & Folder Mapper
- Tag & Folder Mapper
- Tag & Folder Sync

Stuff for description:
- Path-based-tagging
- automatic-tagging
- organization
- 

The idea is to have a bidirectional system where you can define rules to translate a folder path (e.g. `person1/Projects/Project 1`) into a tag (e.g. `#projects/project1`) and vice versa.

**Key Points:**

- **Dual Mapping:**
    - **Folder → Tag:** Convert folder names into tags using regex patterns and transformation templates.
    - **Tag → Folder:** Use similar rules in reverse, letting you determine where a note should live based on its tags.
        
- **Transformation Flexibility:**  
    Beyond simple snake-case conversion, allow regex-based replacements and templating (e.g., using `$1` for captured groups) so that users can handle variations in naming conventions.
    
- **Priority & Conflict Handling:**  
    When rules overlap (a note may belong to multiple folders/tags), let users set priorities so the most specific or preferred rule “wins.” You can also offer options like prompting the user or preserving multiple tags.
    
- **Additional Features:**  
    Consider special cases such as handling untagged notes, folder notes (where a folder might have an associated note), and exclusions using regex or glob patterns.