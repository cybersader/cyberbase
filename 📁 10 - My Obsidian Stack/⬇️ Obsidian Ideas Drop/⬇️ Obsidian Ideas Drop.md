---
permalink:
aliases: [Obsidian Wiki Drop]
tags: []
publish: true
date created: Friday, April 26th 2024, 11:33 am
date modified: Tuesday, March 11th 2025, 9:14 pm
---

%% Begin Waypoint %%


%% End Waypoint %%

- [ ] Linter that can be given conditions, bulk handling, or ability to ask user about certain cases before linting the file? ➕ 2024-11-06
- [ ] Vault crawler tool that uses AI to find connections in the vault - kind of like Omnisearch + File Organizer 2000 ➕ 2024-11-07

- generate folders and files from nested tags obsidian
- https://dentropy.github.io/1f1f914c-8e6e-48b7-9068-bc7b290b6b64/
- Per device obsidian customizing
	- obsidian per device
	- https://forum.obsidian.md/t/separate-settings-for-multiple-mobile-devices/20607
	- https://www.reddit.com/r/ObsidianMD/comments/zwvn1v/method_for_separating_settings_between_desktop/
	- https://forum.obsidian.md/t/how-to-have-different-themes-on-seperate-devices/73334
- Per client
	- ovveride config folder - stored locally so network shares and things like that don't matter

- [Track Watch Later List From YouTube : r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/yp2hfs/track_watch_later_list_from_youtube/)
- https://obsidian.rocks/editing-dataview-tables-with-the-metadata-menu-plugin/
- Live sync in part of note, but then use something like Git or Syncthing in other parts
	- Atomic and granular power over syncing and collaboration
- Sync obsidian before opening app 
- Sort by name and not folder vs file
- [Fleeting Notes | A scratchpad that syncs with Obsidian](https://www.fleetingnotes.app/)

# Users in Obsidian

- [Supercharged Links showcase - Share & showcase - Obsidian Forum](https://forum.obsidian.md/t/supercharged-links-showcase/18219)
- Define users somehow with a Templater user script?  This may be possible

# Plugins to look at 

- [konodyuk.github.io > Home | Obsidian Typing](https://konodyuk.github.io/obsidian-typing/)
- [Latticework: Unifying annotation and freeform text editing for augmented sensemaking](https://www.matthewsiu.com/Latticework)
- Semantic Canvas
- Telegraph Publish
- Folders to Graph
- Tags Routes
- Graph Banner
- InfraNodus
- Textgrams
- Symlink Creator (symlinks in general)
- Immich
- Abbrlink
- Link Formatter
- Link Range
- Tabout
- Grappling Hook
- Hover Editor
- Ordered List Style
- Copy Block Link
- Links
- Link Favicons
- Note Linker
- Better File Link
- Link Converter
- Influx
- Topic Linking
- Wikilink to MDLinks
- Link Exploder
- Backlink Cache
- Update Relative Links
- At People
- Auto Embed
- GitHub Link
- Import Attachments++
- External Links
- Canvas Explorer
- Block Link Plus
- Alias Picker
- 

# Custom Plugins

[Obsidian Plugins and Ideas for Contributions](../../📁%2051%20-%20Cyberbase/Obsidian%20Plugins%20and%20Ideas%20for%20Contributions/Obsidian%20Plugins%20and%20Ideas%20for%20Contributions.md)

- Plugin that can use parent folders to add/prepend (even w/regex) the parent folders to the title of a note to create additional aliases
- Plugin that makes pretty permalinks based on wiki page name and duplicates in the vault
- Plugin that uses AI to ask you about your day and smartly write and log about it for you in a daily note either through voice or text chat
- Modify refactor plugin to have 
	- option for copying md to README.md for github applicability
	- Ability to add sub folders or pages from within note like Notion
- Youtube links
	- [Embed YouTube Videos in Notes & Link Timestamps to Embedded Video - Feature archive - Obsidian Forum](https://forum.obsidian.md/t/embed-youtube-videos-in-notes-link-timestamps-to-embedded-video/36779/4) 
- Look for plugins that generate ascii, markdown, HTML with styles, and plaintext
	- Timeline plugin like this?
- Auto headings and bullets?
- Plugin to automatically put bullet point when clicking directly below a bullet list
- Plugin that does certain syntax to show page and heading when pasting link to page and heading
- Normalized content change glow added to graph to show recently active areas of the graph.  This could use git repo information with commits - would take a lot to render

# Ideas

- Make extension for usage in Github.dev for helping do markdown without code in innovative and safe ways
  - If this doesn't work then look at how other in-the-browser code editors are safe and if they could somehow be implemented
- Obsidian GitHub action for running code like a vault would
- StackEdit with GitHub as alternative to Github.dev?
- Family tree in Obsidian?
- 
- Linting for filenames and folders to make sure that they work on Windows (No ":" and other characters)
- [ ] Plugin or pull request to current plugin to clean youtube and amazon links of cookie and reference code stuff ➕ 2024-11-03 
- [ ] Add saving current workspace layout to custom save ⏫ ➕ 2024-11-03
- [ ] Smarter changelog plugin ⏫ ➕ 2024-11-04

# Workflow Examples

- [My Project Management Workflow; An In-Depth Explanation - Share & showcase - Obsidian Forum](https://forum.obsidian.md/t/my-project-management-workflow-an-in-depth-explanation/82508)
- 

# Misc

- [x] BUG with deleting files taking a long time 🔺 ➕ 2024-04-29 ✅ 2024-12-27
- Have AI generate smart permalinks for pages
	- [Permalinks - Publish and unpublish notes - Obsidian Help](https://help.obsidian.md/Obsidian+Publish/Publish+and+unpublish+notes#Permalinks)
- Color gradient based on how recently visited a page/folder was
- Way to upload videos to YouTube when pasted as unlinked to YouTube account?
- [ ] Decide on strategy for connecting, linking, backlinks - helps with pages that could be in two places ⏫ ➕ 2024-04-26
- [ ] Github style readme with badges implementation for Obsidian pages or properties? ➕ 2024-04-26
- [ ] Obsidian page templates when new pages are opened? ➕ 2024-04-26
- [ ] Automatically go to image size with pasting an image to choose size immediately without having to click ➕ 2024-04-27
- [ ] Reimplement last modified time check with Linter or another plugin (that actually works with Obsidian Publish) to use hashes of content to update even when hitting Ctrl S or linting 🔽 ➕ 2024-04-28
- [ ] Obsidian Plugin that uses an LLM funnel or other LLM and AI technology to take recently added to pages (using content hashes?) and summarizes work done in a certain format along with layers of templates.  Then a "firehose" folder is generated with pages of summaries based on schedules ⏬ ➕ 2024-04-29