---
publish: true
permalink:
title: "Tag Selection Workflow Options"
aliases: []
date created: Saturday, March 22nd 2025, 6:50 pm
domain: "chatgpt.com"
source:
tags: ["-clippings", "-clippings/chatgpt"]
ai_model: "ChatGPT o3-mini-high"
author:
  - "ChatGPT"
  - "Cybersader"
date modified: Saturday, March 22nd 2025, 6:51 pm
---

[Cyberbase New Note Workflow](../../../📁%2054%20-%20Obsidian%20Vault%20Organization/Cyberbase%20New%20Note%20Workflow/Cyberbase%20New%20Note%20Workflow.md)
[QuickAdd Tag Selector](../../../🕸️%20UNSTRUCTURED/QuickAdd%20Tag%20Selector/QuickAdd%20Tag%20Selector.md)

# Learning Lessons for QuickAdd, Templater & Modal Forms Integration in Obsidian

1. **QuickAdd Format Variables in Templater**  
   - You can use QuickAdd format variables (e.g. `{{LINKCURRENT}}`) as string variables within your Templater templates.
   - Example usage:  
     ```js
     const linkCurrent = "{{LINKCURRENT}}";
     ```
   - **Link:** [QuickAdd Documentation](https://quickadd.obsidian.guide/docs/)

2. **Modal Forms Plugin is Powerful**  
   - Modal Forms lets you build custom input forms (via a JSON/JS form builder API) that can prefill default values and return structured data.
   - It integrates seamlessly with Templater and QuickAdd for interactive workflows.
   - **Link:** [Obsidian Modal Forms GitHub](https://github.com/danielo515/obsidian-modal-form)

3. **Using TFile Objects**  
   - When interacting with the Obsidian API, use the full `TFile` object rather than just the file path.  
   - For example, use `app.vault.getAbstractFileByPath(filePath)` to obtain the TFile, then pass it to functions like `app.metadataCache.getFileCache(file)`.
   - **Link:** [Obsidian API Reference](https://publish.obsidian.md/api/)

4. **Pass the tp Object Explicitly**  
   - In Templater user scripts, always pass the `tp` object as an argument to ensure access to template-scoped variables and functions.
   - Example:  
     ```js
     await tp.user.myFunction(tp);
     ```
   - **Link:** [Templater User Functions Documentation](https://github.com/SilentVoid13/Templater)

5. **Debugging with Notices and Console Logging**  
   - Use `new Notice("message")` to display visual debug messages in Obsidian.
   - Use `console.log("message")` to output detailed debug info to the developer console.
   - These tools help track down issues in data flow between active files, modal forms, and metadata capture.
