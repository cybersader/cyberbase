---
aliases: []
tags:
  - test
publish: true
permalink: 
date created: Thursday, March 20th 2025, 11:42 am
date modified: Saturday, March 22nd 2025, 2:20 pm
---

[Inputs, Capture](../../📁%2010%20-%20My%20Obsidian%20Stack/Obsidian%20Knowledge%20Management%20Workflows/Inputs,%20Capture/Inputs,%20Capture.md)

- [ ] Use Templater instead? ➕ 2025-03-21

[test](🕸️%20UNSTRUCTURED/test/test.md)
# Links

- [github.com > danielo515/obsidian-modal-form: Define forms for filling data that you will be able to open from anywhere you can run JS](https://github.com/danielo515/obsidian-modal-form)
	- [danielorodriguez.com > Obsidian Modal Form docs](https://danielorodriguez.com/obsidian-modal-form/)
- [obsidian.md > Getting rid of QuickAdd with Templater - Share & showcase](https://forum.obsidian.md/t/getting-rid-of-quickadd-with-templater/96161)
- [obsidian.md > [New plugin] Modal form - integrate forms into QuickAdd](https://forum.obsidian.md/t/new-plugin-modal-form-integrate-forms-into-quickadd-templater-etc/67103/108)
- [github.com > Gather up tags and format for YAML frontmatter · SilentVoid13/Templater · Discussion #140 > Templater Showcase](https://github.com/SilentVoid13/Templater/discussions/categories/templates-showcase)
- [github.com > Obsidian Snippets](https://gist.github.com/Mearman/ba5b1bcf746b4e04d12865dc09402016#file-mutate_frontmatter-js)
- [youtube.com > Obsidian Modal Forms Plugin: How to Transform your Data Entry in Obsidian](https://www.youtube.com/watch?v=zVGyWaw3xZQ)
- [danielorodriguez.com > Obsidian Modal Form docs](https://danielorodriguez.com/obsidian-modal-form/#usage-with-templater)
- 

# QuickAdd

- Docs -  [obsidian.guide > Getting Started | QuickAdd](https://quickadd.obsidian.guide/docs/)
- [Paul Dickson - Obsidian QuickAdd Plugin How to Create Better Notes in Seconds](../../⬇️%20Clippings/YouTube/Paul%20Dickson%20-%20Obsidian%20QuickAdd%20Plugin%20How%20to%20Create%20Better%20Notes%20in%20Seconds/Paul%20Dickson%20-%20Obsidian%20QuickAdd%20Plugin%20How%20to%20Create%20Better%20Notes%20in%20Seconds.md)

## Community Scripts, Templates, Macros

- [github.com > Clothesline Method with Quick Add · zsviczian/obsidian-excalidraw-plugin · Discussion #138](https://github.com/zsviczian/obsidian-excalidraw-plugin/discussions/138)
- [obsidian.guide > Examples | QuickAdd](https://quickadd.obsidian.guide/docs/#be-inspired)
- [QuickAdd Tag Selector](../../🕸️%20UNSTRUCTURED/QuickAdd%20Tag%20Selector/QuickAdd%20Tag%20Selector.md)
- [obsidian.md > QuickAdd - Tasks User Guide - Obsidian Publish](https://publish.obsidian.md/tasks/Other+Plugins/QuickAdd)
- 

## My QuickAdd Workflow

This is dependent on my [Folder Structure](../Cyberbase%20Folder%20Structure/Cyberbase%20Folder%20Structure.md).  

Automating New Notes with QuickAdd Templates:
- Current folder
	- This would be useful if adding to one of the [OUTPUT type (public facing)](../SEACOWr%20Quick%20Start/SEACOWr%20Quick%20Start.md) folders
- Specific folders
	- 🕸️ UNSTRUCTURED
	- ⬇️ INBOX, DROPZONE

### Folder Notes Compatibility

- Automatically create folder notes
	- This setting breaks the link appending feature with QuickAdd

### Using Modal Forms Plugin to Add Tags During Creation

 - [QuickAdd Tag Selector](../../🕸️%20UNSTRUCTURED/QuickAdd%20Tag%20Selector/QuickAdd%20Tag%20Selector.md)

### Using Active File Frontmatter with New Note (QuickAdd + Templater + Modal Forms)

- [obsidian.md > QuickAdd - using active file frontmatter - Help](https://forum.obsidian.md/t/quickadd-using-active-file-frontmatter/78091/7)

This essentially requires using **QuickAdd** format syntax from within **Templater**.
- You have to then use a QuickAdd macro that [returns](https://quickadd.obsidian.guide/docs/FormatSyntax) the current active file tags as a life
- Then, you could try to feed these into the Modal Form builder API to allow you to select the tags or frontmatter combinations you want to keep
- You could have exclusions from within the code too

Passing data from QuickAdd to Templater and Modal Forms may be hard.  Not sure how to do it at this point yet.

I may be able to do this with a QuickAdd Macro:
- Use the QuickAdd macro to record the active file properties
- Use a template to open the new note
- Use a capture to feed in the potential values into the form builder api to have choices for frontmatter
- Not sure how to use {{MACRO:}} or {{VALUE:}} in this case though.  



Related:
- [QuickAdd - using active file frontmatter - Help - Obsidian Forum](https://forum.obsidian.md/t/quickadd-using-active-file-frontmatter/78091/6)
- [github.com > danielo515/obsidian-modal-form: Define forms for filling data that you will be able to open from anywhere you can run JS](https://github.com/danielo515/obsidian-modal-form/issues/269)
- [Form builder API - Obsidian Modal Form docs](https://danielorodriguez.com/obsidian-modal-form/FormBuilder/)
- 

## QuickAdd Overview

> [!summary]
> Quickadd is a combination of 4 tools also known as choices...

### 1) Templates

> [!tldr] add new notes

#### Uses:

- Create new notes
- Use predefined templates
- Keep folders organized

#### Works with:

- Obsidian Templates
- Templater plugin

### 2) Capture

> [!tldr] add new content to certain notes

#### Uses:

- To files and folders
- Insert format syntax
- Insert before/after

#### Works with:

- Active notes
- New notes

### 3) Macro

> [!tldr] advanced automation

#### Uses:

- Powerful tools
- Sequence of commands

#### Works with:

- Obsidian commands
- Editor commands
- User JS scripts
- Choices

### + Multi

> [!summary] Folder to organize Templates, Captures, and Macros
