---
aliases: []
tags: []
publish: true
permalink:
date created: Sunday, March 23rd 2025, 2:23 pm
date modified: Sunday, March 23rd 2025, 2:24 pm
---

[Plugin Development](../../📁%2010%20-%20My%20Obsidian%20Stack/Plugin%20Development/Plugin%20Development.md)

## 1\. Environment Setup

### Prerequisites

- **Git:** Make sure Git is installed on your machine.
- **Node.js:** Install Node.js (LTS version is recommended).
- **Bun (Optional):** Some modern workflows use Bun instead of npm; you can install it from [Bun Docs](https://bun.sh/docs/installation#windows) if you prefer.
- **Code Editor:** Use Visual Studio Code (or another editor you’re comfortable with).
- **Obsidian Vault:** Have a vault ready, since plugins reside in your vault’s hidden plugins folder.

### Obsidian Typings & API

- Familiarize yourself with [Obsidian API Type Definitions](https://fevol.github.io/obsidian-typings/) to understand available classes and methods.
- Read through the [Obsidian Developer Documentation](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) to learn about the plugin lifecycle and API structure.

## 2\. Cloning the Sample Plugin

The easiest way to get started is by using the official sample plugin:

1. **Create a Plugins Folder in Your Vault:**
	```
	cd path/to/your/vault
	mkdir -p .obsidian/plugins
	cd .obsidian/plugins
	```
2. **Clone the Sample Plugin Repository:**
	```
	git clone https://github.com/obsidianmd/obsidian-sample-plugin.git
	```
	> This repository is a great reference to see how plugins are structured and how to use the Obsidian API.
3. **Open in Your Editor:**  
	Open the folder in Visual Studio Code:
	```
	code .
	```

---

## 3\. Installing Dependencies & Building

### Using npm:

- **Install Dependencies:**
	```
	npm install
	```
- **Build the Plugin:**
	```
	npm run build
	```

### Using Bun (if you choose this alternative):

- **Install Dependencies:**
	```
	bun install
	```
- **Run Your Plugin in Dev Mode:**
	```
	bun run dev
	```
	> Using Bun can speed up the install and build process.

---

## 4\. Developing & Testing Your Plugin

### Development Workflow

- **Start Small:**  
	Begin by modifying the sample plugin. For instance, update the `onload()` method to log a message:
	```
	export default class MyPlugin extends Plugin {
	  onload() {
	    console.log('My Plugin Loaded!');
	    // Add your dual mapping logic here later.
	  }
	}
	```
- **Auto Reload:**  
	After making changes, rebuild the plugin and reload Obsidian. You can reload Obsidian by using the command palette (`Ctrl+P` or `Cmd+P`) and typing “Reload app.”
- **Debugging:**  
	Use console logs (viewable in Obsidian’s developer console) to verify that your code is running as expected. Adding breakpoints in VS Code and using TypeScript error messages can also help.

### Testing Your Plugin

- **Install Your Plugin in Obsidian:**  
	In Obsidian, go to Settings → Community Plugins → Enable Safe Mode off (if needed) and load your plugin from the local plugins folder.
- **Iterate Quickly:**  
	Work on one feature (e.g., folder-to-tag mapping) at a time, test it, and then move on to the next feature. Use simple test cases to validate your regex-based mappings.

---

## 5\. Additional Resources & Next Steps

- **Obsidian Plugin Documentation:**  
	Check the [Build a Plugin guide](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin) for a comprehensive overview.
- **Community Tutorials:**  
	Watch tutorials like [Obsidian Plugin Development 101 on YouTube](https://www.youtube.com/watch?v=kQCc7HYOfpY&t=516s) for a visual walkthrough.
- **Forums & Support:**  
	Visit the [Obsidian Forum](https://forum.obsidian.md/) and look for posts tagged with “plugin” to see community tips and troubleshooting advice.
- **Exporting/Importing Settings:**  
	As your plugin grows, consider adding commands to export or import JSON settings for easier sharing and backup of your mapping configurations.

---

By following these steps, you should be able to quickly set up your environment and begin iterating on your dual-mapping plugin concept. This guide covers the basics—now it’s time to dive into the code, experiment, and gradually build up the more complex logic for managing your folder and tag hierarchies. Happy coding!