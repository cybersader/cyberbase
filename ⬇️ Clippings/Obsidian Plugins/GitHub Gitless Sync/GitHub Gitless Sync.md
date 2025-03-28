---
title: "GitHub Gitless Sync - Sync a GitHub repository with vaults on different platforms without requiring git installation"
aliases:
description: "Sync a GitHub repository with vaults on different platforms without requiring git installation"
source: "https://www.obsidianstats.com/plugins/github-gitless-sync"
rating:
author:
published:
created: 2025-03-28
tags:
  - "-clippings/obsidian_plugins"
---

**GitHub Gitless Sync Plugin**

This Obsidian plugin synchronizes a GitHub repository with multiple vaults across different platforms without requiring Git installation. It leverages GitHub's REST APIs for synchronization, offering desktop and mobile support and eliminating the need for Git.

**Key Features:**

*   **No Git Dependency:** Synchronizes via GitHub APIs.
*   **Multiple Vaults:** Supports syncing to multiple Obsidian vaults.
*   **Scheduled Syncs:** Automatic synchronization on a fixed interval, plus manual sync options.
*   **Conflict Resolution:** Provides a conflict resolution view for managing discrepancies between remote and local vaults.
*   **Config Sync:** Enables synchronization of Obsidian vault configurations (e.g., `.obsiidian` folder).

**Installation & Setup:**

*   Requires a GitHub Fine-grained token with `Contents` permission.
*   Mandatory settings include GitHub token, repository owner, repository name, and repository branch.

**Synchronization Modes:**

*   Manual sync via side ribbon button.
*   Scheduled syncs.

**Conflict Resolution:**

*   Utilizes split or unified diff views depending on the platform.
*   Allows for manual resolution of conflicts.

**Important Considerations:**

*   First sync requires empty remote or local vault.
*   Avoid syncing configs with public repositories.
*   Synchronization is limited to GitHub; Git features are unavailable.

# Notes