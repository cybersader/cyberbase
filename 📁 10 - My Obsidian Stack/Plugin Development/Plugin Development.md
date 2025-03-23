---
aliases: []
tags: []
publish: true
permalink:
date created: Monday, December 16th 2024, 8:37 am
date modified: Sunday, March 23rd 2025, 3:06 pm
---

[Obsidian Plugins and Ideas for Contributions](../../📁%2051%20-%20Cyberbase/Obsidian%20Plugins%20and%20Ideas%20for%20Contributions/Obsidian%20Plugins%20and%20Ideas%20for%20Contributions.md)
[⬇️ Obsidian Ideas Drop](../⬇️%20Obsidian%20Ideas%20Drop/⬇️%20Obsidian%20Ideas%20Drop.md)

- [How to get started with developing a custom Plugin? - Developers: Plugin & API - Obsidian Forum](https://forum.obsidian.md/t/how-to-get-started-with-developing-a-custom-plugin/8157/3)
- [Leaving the Comfort Zone Behind: The Journey to Developing a Plugin for Obsidian.md - DEV Community](https://dev.to/dariocasciato/leaving-the-comfort-zone-behind-the-journey-to-developing-a-plugin-for-obsidianmd-53hi)

# Monetization

- [Is it possible to build paid obsidian plugins? : r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/1ao558b/is_it_possible_to_build_paid_obsidian_plugins/)
	- You can ask for donations and/or setup a priority queue via ko-fi or opencollective
	- [Open Collective - Make your community sustainable. Collect and spend money transparently.](https://opencollective.com/pricing)
	- [Ko-fi | Everything you need to earn & grow](https://ko-fi.com/features)

# PLUGIN DEVELOPMENT WORKFLOW

[yomaru.dev > 2 Obsidian Plugin 101](https://yomaru.dev/obsidian-plugin-101)

Prerequisites:
- [Git](https://git-scm.com/) installed on your local machine.
- A local development environment for [Node.js](https://node.js.org/en/about/).
- A code editor, such as [Visual Studio Code](https://code.visualstudio.com/).
- [bun.sh > Installation | Bun Docs](https://bun.sh/docs/installation#windows)
	- Make sure you have `bun` installed

1. **Clone the Sample Repo:**  
	In your vault's `.obsidian/plugins` folder, run:
	
	```
	git clone https://github.com/HananoshikaYomaru/obsidian-sample-plugin
	```
	This gives you a working template that automates a lot of the initial setup.
	
2. **Rename & Update:**
	- **Rename the folder:** Change the folder name to your desired plugin name.
	- **Update the manifest:** Edit `manifest.json` to update the plugin ID, name, version, etc.
	- **Adjust package.json & README:** Replace any sample names with your plugin’s name and adjust scripts if needed.

3. Change to your GitHub repo
	- Remove the original remote and add your own GitHub repo as the new remote:

```
	git remote remove origin
	git remote add origin https://github.com/yourusername/my-obsidian-plugin.git
	git push -u origin main
```

4. **Install Dependencies:**  
	Use Bun to install required packages:
	
	```
	bun install
	```

5. **Set Up Git (if not already):**  
	Initialize your repo and commit the changes:
	
	```
	git init
	git add .
	git commit -m "Initial commit for my Obsidian plugin"
	git push origin main
	```
	
6. **Test Locally:**  
	Open Obsidian, enable Community Plugins, and load your plugin from the development vault.

This method leverages the sample plugin to quickly scaffold your project, allowing you to focus on updating your plugin’s logic and details. For more detailed guidance, refer to the [Obsidian Plugin 101 guide](https://yomaru.dev/obsidian-plugin-101) which outlines the full process.

# Docs

- [Home - Developer Documentation | Obsidian](https://docs.obsidian.md/Home)
- [obsidianmd/obsidian-api: Type definitions for the latest Obsidian API.](https://github.com/obsidianmd/obsidian-api)
- [2 Obsidian Plugin 101 - Hananoshika Yomaru](https://yomaru.dev/obsidian-plugin-101)
- [Build a plugin - Developer Documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- -

# Workflows

- [Plugins mini FAQ - Basement - Obsidian Forum](https://forum.obsidian.md/t/plugins-mini-faq/7737/25)

# Tutorials

- [(14) Obsidian Plugin Development 101 - YouTube](https://www.youtube.com/watch?v=kQCc7HYOfpY&t=516s)
	- Using Bun