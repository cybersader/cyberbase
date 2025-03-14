/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => EGVPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// schema.ts
var DEFAULT_SETTINGS = {
  exportFormat: "mmd",
  includeOrphans: false,
  includeAttachments: false,
  maxNodes: 1e3,
  lastExported: ""
};

// views.ts
var import_obsidian = require("obsidian");
var EGVModal = class extends import_obsidian.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.customFilename = plugin.settings.lastExported || "";
    this.includeOrphans = plugin.settings.includeOrphans;
    this.includeAttachments = plugin.settings.includeAttachments;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Export graph view" });
    contentEl.createEl("p", { text: "All files are exported to your vault's root folder", cls: "root-notice" });
    new import_obsidian.Setting(contentEl).setName("Filename").setDesc("Enter a name (without extension) for your exported file").addText(
      (text) => text.setValue(this.customFilename).onChange((value) => {
        this.customFilename = (0, import_obsidian.normalizePath)(value);
      })
    );
    new import_obsidian.Setting(contentEl).setName("Include orphaned notes").setDesc("Toggle on to include notes without relationships").addToggle(
      (toggle) => toggle.setValue(this.includeOrphans).onChange((value) => {
        this.includeOrphans = value;
      })
    );
    new import_obsidian.Setting(contentEl).setName("Include attachments").setDesc("Toggle on to include all non-markdown files from this vault").addToggle(
      (toggle) => toggle.setValue(this.includeAttachments).onChange((value) => {
        this.includeAttachments = value;
      })
    );
    const metadataSection = contentEl.createDiv();
    metadataSection.addClass("metadata-section");
    metadataSection.createEl("p", {
      text: `Your vault has ${this.app.vault.getMarkdownFiles().length} markdown files`
    });
    const connectedCount = this.countConnectedNotes();
    metadataSection.createEl("p", {
      text: `${connectedCount} notes have connections`
    });
    const buttonContainer = contentEl.createDiv({ cls: "view-button-section" });
    new import_obsidian.ButtonComponent(buttonContainer).setButtonText("Export to file").setCta().setClass("export-button").onClick(async () => {
      this.plugin.settings.includeOrphans = this.includeOrphans;
      this.plugin.settings.includeAttachments = this.includeAttachments;
      await this.plugin.saveSettings();
      const finalpath = await this.plugin.exportGraph((0, import_obsidian.normalizePath)(this.customFilename));
      if (finalpath) {
        this.close();
      }
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
  countConnectedNotes() {
    const metadataCache = this.app.metadataCache;
    const connectedFiles = /* @__PURE__ */ new Set();
    for (const source in metadataCache.resolvedLinks) {
      const destinations = metadataCache.resolvedLinks[source];
      if (Object.keys(destinations).length > 0) {
        connectedFiles.add(source);
        for (const target in destinations) {
          connectedFiles.add(target);
        }
      }
    }
    return connectedFiles.size;
  }
};

// settings.ts
var import_obsidian2 = require("obsidian");
var EGVSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Export format").setDesc("Choose whether to export as .mmd (Mermaid) or .dot (Graphviz) file").addDropdown(
      (dropdown) => dropdown.addOption("mmd", ".mmd").addOption("dot", ".dot").setValue(this.plugin.settings.exportFormat).onChange(async (value) => {
        this.plugin.settings.exportFormat = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Include orphaned notes").setDesc("Default setting - toggle to include notes without relationships every time unless overriden").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeOrphans).onChange(async (value) => {
        this.plugin.settings.includeOrphans = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Include attachments").setDesc(
      "Default setting - toggle on to include all non-markdown files in this vault every time unless overriden"
    ).addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.includeAttachments).onChange(async (value) => {
        this.plugin.settings.includeAttachments = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Maximum nodes to export").setDesc(`Use the slide setting max number of nodes to export - this is a safeguard for huge vaults.`).addSlider(
      (slider) => slider.setLimits(100, 5e3, 100).setValue(this.plugin.settings.maxNodes).setDynamicTooltip().onChange(async (value) => {
        this.plugin.settings.maxNodes = value;
        await this.plugin.saveSettings();
      })
    );
    const helpText = containerEl.createEl("p", {
      text: "NOTE: The plugin will let you know how many notes and attachments are set to be exported.",
      cls: "help-text"
    });
    const buttonContainer = containerEl.createDiv({ cls: "settings-button-section" });
    const quickExportButton = new import_obsidian2.ButtonComponent(buttonContainer).setButtonText("Go to plugin").setCta().onClick(() => {
      new EGVModal(this.app, this.plugin).open();
    });
    quickExportButton.setClass("quick-export-button");
  }
};

// main.ts
var EGVPlugin = class extends import_obsidian3.Plugin {
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("dot-network", "Export Graph View", () => {
      new EGVModal(this.app, this).open();
    });
    this.addCommand({
      id: "export-graph",
      name: "Export Graph to File",
      callback: () => {
        new EGVModal(this.app, this).open();
      }
    });
    this.addSettingTab(new EGVSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async exportGraph(providedFilename = "") {
    try {
      const graphdata = this.generateGraphData();
      let exportFilename;
      if (providedFilename) {
        exportFilename = (0, import_obsidian3.normalizePath)(providedFilename);
      } else {
        const vaultName = this.app.vault.getName();
        exportFilename = (0, import_obsidian3.normalizePath)(`${vaultName}-graph-data`);
      }
      this.settings.lastExported = exportFilename;
      await this.saveSettings();
      let filenameWithExtension;
      if (this.settings.exportFormat === "mmd") {
        filenameWithExtension = await this.exportMermaid(graphdata, exportFilename);
      } else {
        filenameWithExtension = await this.exportDot(graphdata, exportFilename);
      }
      new import_obsidian3.Notice(`Graph data exported to ${(0, import_obsidian3.normalizePath)(this.getExportPath(filenameWithExtension))}`, 5e3);
      return filenameWithExtension;
    } catch (error) {
      new import_obsidian3.Notice(`There was a problem exporting graph data: ${error.message}`);
      return null;
    }
  }
  generateGraphData() {
    const metadataCache = this.app.metadataCache;
    const vault = this.app.vault;
    const nodes = /* @__PURE__ */ new Map();
    const links = [];
    const mdFiles = vault.getMarkdownFiles();
    const mdFilesWithRelationships = /* @__PURE__ */ new Map();
    for (const source in metadataCache.resolvedLinks) {
      const destinations = metadataCache.resolvedLinks[source];
      if (Object.keys(destinations).length > 0) {
        mdFilesWithRelationships.set(source, true);
        for (const target in destinations) {
          mdFilesWithRelationships.set(target, true);
        }
      }
    }
    for (const file of mdFiles) {
      if (nodes.size >= this.settings.maxNodes)
        break;
      if (!this.settings.includeOrphans && !mdFilesWithRelationships.get(file.path)) {
        continue;
      }
      nodes.set(file.path, {
        id: (0, import_obsidian3.normalizePath)(file.path),
        name: file.basename,
        type: "note"
      });
    }
    if (this.settings.includeAttachments && nodes.size < this.settings.maxNodes) {
      vault.getFiles().forEach((file) => {
        if (file.extension !== "md" && !nodes.has(file.path)) {
          if (nodes.size >= this.settings.maxNodes)
            return;
          nodes.set(file.path, {
            id: (0, import_obsidian3.normalizePath)(file.path),
            name: file.basename,
            type: "attachment"
          });
        }
      });
    }
    for (const source in metadataCache.resolvedLinks) {
      if (!nodes.has(source))
        continue;
      const destinations = metadataCache.resolvedLinks[source];
      for (const target in destinations) {
        if (nodes.has(target)) {
          const linkCount = destinations[target];
          for (let i = 0; i < linkCount; i++) {
            links.push({
              source,
              target
            });
          }
        }
      }
    }
    return {
      nodes: Array.from(nodes.values()),
      links
    };
  }
  async exportMermaid(graphdata, basepath) {
    const mermaidContent = this.convertToMermaid(graphdata);
    const filename = (0, import_obsidian3.normalizePath)(`${basepath}.mmd`);
    await this.app.vault.create(filename, mermaidContent);
    return filename;
  }
  async exportDot(graphdata, basepath) {
    const dotContent = this.convertToDot(graphdata);
    const filename = (0, import_obsidian3.normalizePath)(`${basepath}.dot`);
    await this.app.vault.create(filename, dotContent);
    return filename;
  }
  getExportPath(providedFilename = "") {
    let exportFilename;
    if (providedFilename) {
      exportFilename = (0, import_obsidian3.normalizePath)(providedFilename);
    } else {
      const vaultName = this.app.vault.getName();
      exportFilename = (0, import_obsidian3.normalizePath)(`${vaultName}-graph-data`);
    }
    const exportFolder = this.app.vault.getName();
    return `${exportFolder}/${exportFilename}`;
  }
  convertToMermaid(graphdata) {
    let mermaid = "graph TD\n";
    graphdata.nodes.forEach((node) => {
      const nodeId = this.sanitizeId(node.id);
      const nodeStyle = node.type === "attachment" ? "style=fill,stroke:#ff9900" : "";
      mermaid += `    ${nodeId}["${this.escapeLabel(node.name)}"]${nodeStyle ? " " + nodeStyle : ""}
`;
    });
    graphdata.links.forEach((link) => {
      const sourceId = this.sanitizeId(link.source);
      const targetId = this.sanitizeId(link.target);
      mermaid += `    ${sourceId} --> ${targetId}
`;
    });
    return mermaid;
  }
  convertToDot(graphdata) {
    const vaultName = this.app.vault.getName();
    let dot = `digraph ${vaultName} {
`;
    dot += "    rankdir=LR;\n";
    dot += "    node [shape=box, style=rounded];\n";
    graphdata.nodes.forEach((node) => {
      const nodeId = this.sanitizeId(node.id);
      const nodeStyle = node.type === "attachment" ? 'fillcolor="#ffcc80", style="filled,rounded"' : 'fillcolor="#e3f2fd", style="filled,rounded"';
      dot += `    "${nodeId}" [label="${this.escapeLabel(node.name)}", ${nodeStyle}];
`;
    });
    graphdata.links.forEach((link) => {
      const sourceId = this.sanitizeId(link.source);
      const targetId = this.sanitizeId(link.target);
      dot += `    "${sourceId}" -> "${targetId}";
`;
    });
    dot += "}\n";
    return dot;
  }
  sanitizeId(id) {
    return id.replace(/[^a-zA-Z0-9]/g, "_");
  }
  escapeLabel(label) {
    return label.replace(/"/g, '\\"');
  }
};


/* nosourcemap */