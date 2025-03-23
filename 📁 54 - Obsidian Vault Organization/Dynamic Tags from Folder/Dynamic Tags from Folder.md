---
aliases: [Auto Nested Tagging Obsidian, Automate Tags Based On Folders]
tags: []
publish: true
permalink: 
date created: Monday, March 17th 2025, 11:39 am
date modified: Sunday, March 23rd 2025, 11:53 am
---

[Dynamic Folders Based on Tags](../Automate%20Folders%20Based%20on%20Tags/Dynamic%20Folders%20Based%20on%20Tags.md) - the opposite of this
[Using Tags](../../📁%2010%20-%20My%20Obsidian%20Stack/Using%20Tags/Using%20Tags.md)
[Plugin Development](../../📁%2010%20-%20My%20Obsidian%20Stack/Plugin%20Development/Plugin%20Development.md) - could develop a plugin for it

- Automatic Tags plugin

# Make my own plugin?

Be awesome if I could say anything the regex matches this in folder path gets a converted tag based on the path to snake case.

I want to create automatic tags based on folder paths in obsidian so that the folder hierarchy is represented in the tags

Okay.  Let's build an obsidian plugin that does this.  

Be awesome if I could say anything the regex matches this in folder path gets a converted tag based on the path to snake case

Could use a dataView query at the top of the page?  Potentially or the bottom with a template for it when it matches that regex I talked about

Problems in Tagging:

- folders to tagging
    - format to snake case for folder path and make a nested tag

- where do untagged go?

- how do we move to certain types of folders based on parent tags with nested tags (untagged go to unstructured section)?

- How do folder notes affect this?

- Most tag related plugin will just use regular tags and not allow appending things for structuring

- What's the actual alphabetic order in this?

- 

Plugins that use or affect structure:

- MyThesaurus
- TagFolder
- Tag Wrangler
- Folder by tags distributor
    - doesn't handle unstructured notes other than sending them to root
- Folder Notes

I'm trying to make a plugin that makes up for the limited nature of hierarchical systems for storage even though such things are necessary.  

The idea is that I should be able to define matching for tag to folder and even folder to tag.  So this goes beyond even just a system like auto note mover.

The core issue is that everything has to be stored in folders for the source.  There's two ways we organize folders: hierarchically and by names.  Therefore I should be able to define regex matches that define the mapping from folder to tag or tag to folder.  That's step one. The regex let's us handle the naming part since we can use patterns with names to at least help us break out certain things as we transfer between.  Simply doing snake case may not be enough.  

We may have a tag like \#projects/project1 but we actually want to store files with that tag under a path like "-/user_1/Projects/Project 1".  That's where regex and mapping those to a folder path top level can help.  Either way we need a better language between the two other than the exact matching that something like auto note mover provides.

Time to address the second core requirement.  Folders are fundamentally limited or flawed or not ideal because you have a strict hierarchy.  To account for this, we can have a priority mechanism where certain tags or folder get hierarchy.  Granted, tags can overlap, so this is really an issue for folders.  For instance a folder may have "#unstructured" and "projects/project1" on it.  This is where we would prioritize based on the tag classification or content or type of whatever fundamental way we can describe that.  Then we could also prioritize to be more broad or more narrow such as if a note has "\#projects" and \#projects/project1 in it.  

Extra notes from awhile back below

Add a system that decides when to dynamically move something to a different folder based on tags. The system could have a priority structure or could even duplicate links or leave behind embedding versions in folders that they leave. This would help solve the problem of strict hierarchies that you get with a hierarchical system like folders versus and emulated graph system like overlapping tag paths or links (pretty much a graph edge representation). Ultimately, the problem still becomes that you need folders.

## Core Concepts

### 1) Dual Mapping: Folder <-> Tag

We need a way to represent these relationships with some syntax that accounts for the nested and hierarchical nature of tags or folders and allows you to define entry points at either side (tag or folder) into those ultimate hierarchies.  For instance, you should be able to match up a tag like "project/project1" to some folder like "person1/project/project1."  The defined rules shouldn't need to have explicit perfect matches and should use some syntax, patterns like regex, or templating to make the configuration logic concise and intuitive.

However, fundamentally solving this problem is hard.  We have to have both directions figured out and each logical piece has to work in both directions.  There has to be mechanisms or logic to make sure the syntax is correct.



### 2) Customizable Transformations

- 

### 3) Priority & Overlapping Hierarchies

- 

### 4) Handling Special Cases

- 