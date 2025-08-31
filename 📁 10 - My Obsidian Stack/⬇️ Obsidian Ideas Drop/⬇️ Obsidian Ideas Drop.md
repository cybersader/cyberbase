---
title:
permalink:
aliases: [Obsidian Wiki Drop]
tags: []
publish: true
date created: Friday, April 26th 2024, 11:33 am
date modified: Sunday, August 31st 2025, 7:07 pm
---

%% Begin Waypoint %%


%% End Waypoint %%

- [ ] Linter that can be given conditions, bulk handling, or ability to ask user about certain cases before linting the file? ➕ 2024-11-06
- [ ] Vault crawler tool that uses AI to find connections in the vault - kind of like Omnisearch + File Organizer 2000 ➕ 2024-11-07


- [The Best Way I Found To Organize My 5,173 Obsidian Notes](https://mattgiaro.com/organize-notes-obsidian/ "The Best Way I Found To Organize My 5,173 Obsidian Notes")
- [Should You Build Your Second Brain in Bear?](https://mattgiaro.com/second-brain-bear/ "Should You Build Your Second Brain in Bear?")
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

- https://forum.obsidian.md/t/integrating-microsoft-office-documents/32055/26
- https://forum.obsidian.md/t/actions-for-obsidian-40-dedicated-shortcuts-actions-for-obsidian-macos-ios/56341
- https://forum.obsidian.md/t/best-way-to-link-these-notes/94846/4
- https://github.com/Assblastois/Obsidian-Vault-Project-Management
- https://forum.obsidian.md/t/best-way-to-manage-saved-quotes/71160/6
- https://forum.obsidian.md/t/select-tools-for-zettelkasten-but-how/66067/2
- https://forum.obsidian.md/t/12-principles-for-using-zettelkasten/51679/2
- https://forum.obsidian.md/t/review-and-revise-notes-but-how/86820/6
- https://forum.obsidian.md/t/obsidian-notes-template-ob-template/28940/30
- https://forum.obsidian.md/t/make-good-notes-but-how/71760/7
- https://docs.freeplane.org/
- https://forum.obsidian.md/t/the-para-method-and-the-hard-facts-of-life/22279/6
- chrome://newtab/
- https://forum.obsidian.md/t/it-personal-knowledge/94137
- https://forum.obsidian.md/t/youtube-watchlist/94094
- https://forum.obsidian.md/t/historical-timeline-in-obsidian/6353/5
- https://forum.obsidian.md/t/implementing-a-zettelkasten-system-with-block-references-in-obsidian/82589
- https://forum.obsidian.md/t/understanding-meeting-notes-at-work/93659
- https://forum.obsidian.md/t/how-to-organize-an-overview-note-for-a-folder/92397
- https://forum.obsidian.md/t/eliminate-folders-as-a-concept/74337
- https://forum.obsidian.md/t/use-tags-but-how/35320/4
- https://forum.obsidian.md/t/quality-control-processes-for-notes/92117
- https://forum.obsidian.md/t/search-and-retrieve-notes-but-how/65386
- https://forum.obsidian.md/t/folders-vs-linking-vs-tags-the-definitive-guide-extremely-short-read-this/78468/5
- https://forum.obsidian.md/t/after-dozens-and-dozens-of-youtube-tutorials-i-have-nothing-but-a-mess-in-my-head-i-dont-know-how-to-build-the-structure-of-a-vault/89980
- https://forum.obsidian.md/t/inspect-and-adapt-process-but-how/36799
- https://forum.obsidian.md/t/start-with-clear-goals-but-how/85629
- https://forum.obsidian.md/t/simplify-zettelkasten-but-how/81090
- https://forum.obsidian.md/t/using-obsidian-with-stream-deck/7842
- https://forum.obsidian.md/t/folders-and-links-hierarchies-vs-flat/48400
- https://forum.obsidian.md/t/using-obsidian-at-work-project-manager-project-lead/33137
- https://forum.obsidian.md/t/how-do-i-mass-import-bookmarked-or-saved-instagram-posts/82125
- https://forum.obsidian.md/t/need-help-integrating-johnny-decimal-system-and-my-pkm-vault-in-obsidian/80847
- https://forum.obsidian.md/t/technical-script-snippets-resource-management/98303
- https://forum.obsidian.md/t/lifeos-pro-para-method-periodic-notes-fullcalendar/88125
- https://forum.obsidian.md/t/relay-multiplayer-plugin-for-obsidian-collaborative-editing-and-folder-sharing/87170/2
- https://forum.obsidian.md/t/hovernotes-transforming-videos-into-notes-in-your-obsidian-vault/98234/1
- https://forum.obsidian.md/t/why-manage-creation-and-modification-times-yourself/98192/1
- https://forum.obsidian.md/t/semantic-search-plugin/58407
- https://forum.obsidian.md/t/new-plugin-bujo-bullets/98179
- https://forum.obsidian.md/t/convert-entire-pdfs-to-markdown-new-mistral-ocr/97924
- https://forum.obsidian.md/t/publish-your-obsidian-vault-for-free-with-flowershow-cloud/98144
- https://forum.obsidian.md/t/differentiate-unresolved-links-in-the-quick-switcher/97789
- https://forum.obsidian.md/t/obsidianclipper-for-thunderbird-email-client/74822
- https://forum.obsidian.md/t/obsidian-web-clipper-bookmarklet-with-full-markdown-support-for-images-headings-and-code-blocks/22068
- https://forum.obsidian.md/t/templater-mermaid-tree-auto-creation/97717
- https://forum.obsidian.md/t/using-graph-view-to-visualize-my-linkedin-connections/97667
- https://code.visualstudio.com/docs/setup/vscode-web
- https://pivic.blog/blog/my-favourite-obsidian-plugins/#latticework
- https://web.hypothes.is/
- https://github.com/qawatake/obsidian-binary-file-manager-plugin