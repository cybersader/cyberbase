---
aliases: [Automate Folders Based on Tags, Dynamic Folders Based on Tags, Dynamic Folders From Hierarchical Tags]
tags: []
publish: true
permalink: 
date created: Monday, March 17th 2025, 11:51 am
date modified: Sunday, March 23rd 2025, 1:45 pm
---

[Plugin Development](../../📁%2010%20-%20My%20Obsidian%20Stack/Plugin%20Development/Plugin%20Development.md) - could develop a plugin for it
[Dynamic Tags from Folder](../Dynamic%20Tags%20Based%20on%20Folder/Dynamic%20Tags%20from%20Folder.md) - the opposite of this (automate tag based on folder)
[QuickAdd Tag Selector](../../🕸️%20UNSTRUCTURED/QuickAdd%20Tag%20Selector/QuickAdd%20Tag%20Selector.md) - select tags while adding new notes with QuickAdd
[Using Tags](../../📁%2010%20-%20My%20Obsidian%20Stack/Using%20Tags/Using%20Tags.md)

- Automatic Tags plugin
- [github.com > adanielnoel/obsidian-index-notes: Plugin that automatically generates index blocks based on tags](https://github.com/adanielnoel/obsidian-index-notes) - interesting related tag
- Auto Note Mover does this but not in a smart way

Add a system that decides when to dynamically move something to a different folder based on tags.  The system could have a priority structure or could even duplicate links or leave behind embedding versions in folders that they leave.  This would help solve the problem of strict hierarchies that you get with a hierarchical system like folders versus and emulated graph system like overlapping tag paths or links (pretty much a graph edge representation).  Ultimately, the problem still becomes that you need folders.

# Make my own plugin?

[Dynamic Tags & Folders Plugin Development](🕸️%20UNSTRUCTURED/Dynamic%20Tags%20&%20Folders%20Plugin%20Development/Dynamic%20Tags%20&%20Folders%20Plugin%20Development.md)

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

Transferring between the two seems to require a deterministic logic so not AI based.  Snake-case and regex replacements are one option.

below I'll workspace some of the logic for converting between the two

#### Tags to folder:

A rule/definition line could have:
- Tag regex - to match or wildcard glob syntax
    - typically you'll use this to match to the start of a tag
- Tag to folder transformations
    - case to certain folder naming - snake to spaces capitalized, etc. - these are the common default options
    - allow a regex replace per path level (separately for each folder in a depth in the path like "/parent/child"
- Folder path entry point - under what folder to establish matching transformed tags
    - allow a flatten setting with a depth value to flatten upwards kind of like flattening objects?
    - using regex groups for tag regex matches like "$1$2"??

#### Folder to tags:

Certain Tag to Folder configs/rules will make matching up the directions difficult unless deterministic with specific case transformations by default.  If that box is "ticked" then regex will have to likely be used in both directions.

The options will be similar to Tag to Folders:
- Folder matching with regex or glob for top level
- The Folder transformations with default case transformations along with custom regex replace that can run at each path level
- Tag entry point

### 2) Customizable Transformations

- using a custom piping syntax or designing one would probably be super hard so probably not a good idea.  however the stuff I mentioned above with some defaults or regex or doable (one or the other likely).

### 3) Priority, Logic, & Overlapping Hierarchies

- for priority we could just have the rules/definitions sorted like how auto mover does
- nesting and drop-down for organizing the rules could be helpful though
- allow setting to prompt the user to move with button to ignore for future notes
- advanced settings for each rule line to allow for key:value settings like ignore or ask user for prompt and things like that
- option to retain/add conflicting tags on conflicts 
- option to remove tag when moving from a folder (remove source folder tag)
- option to prompt for keepong or removing tags
- make tons of things as commands to allow for hotkeys and automation with other tools
- only run after leaving active file
- only run on save 
- command to delete conflicting tags (in terms of lower priority)
- options to favor broader or narrower tag paths (e.g. project vs project/1)

### 4) Handling Special Cases & Additional Features 

- How to handle untagged notes
- API that quickadd, templater, or modal forms could somehow access for instance to help decide where a new note can go
- handling for folder note based systems (move the folder).  use a function to look at the vault and figure out if you're using folder notes by looking at how many folder notes you have (folder matching note name). would still need to account for attachments being stored adjacent to parent folder instead of in it (specific settings for this)
- Folder exclusions to ignore allow regex here too
- ability to export settings as json or import them with copy and paste
- 