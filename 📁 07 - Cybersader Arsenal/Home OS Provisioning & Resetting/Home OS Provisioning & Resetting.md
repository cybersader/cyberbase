---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, May 10th 2025, 6:45 pm
date modified: Sunday, July 27th 2025, 5:43 pm
---

[Windows Desktop Provisioning](../../🕸️%20UNSTRUCTURED/Windows%20Desktop%20Provisioning/Windows%20Desktop%20Provisioning.md)
[Windows Home IT Admin](../Windows%20Home%20IT%20Admin/Windows%20Home%20IT%20Admin.md)

# Links

- [youtube.com > Are you paying too much for Windows?](https://www.youtube.com/watch?v=yJkRd9py5mA&t=566s)
- [youtube.com > Hate Windows 11? Try these fixes.](https://www.youtube.com/watch?v=GZPRrYLGrhI)
- [youtube.com > The Perfect Windows 11 Install - YouTube](https://www.youtube.com/watch?v=6UQZ5oQg8XA)
- [youtube.com > Making the Best Windows ISO - YouTube](https://www.youtube.com/watch?v=xLCWtC6UYrM&t=100s)
- [youtube.com > Create A Custom Windows 10 or 11 ISO - YouTube](https://www.youtube.com/watch?v=_gMJNQ3yWNE)
- [psappdeploytoolkit.com > Features · PSAppDeployToolkit](https://psappdeploytoolkit.com/features)
- [boxstarter.org > 100% Uninterrupted Windows Environment Installs](https://boxstarter.org/)
- 

# Tech Stack 

- [TrueNAS Scale Home Server](../Home%20Lab,%20Home%20Server/TrueNAS%20Scale%20Home%20Server/TrueNAS%20Scale%20Home%20Server.md) -  specifically SMB shares implemented in some way (network-accessible storage)
- 

# Windows OS Approach

- If setting up Windows...
	- Use commands to avoid using an MS account and use a local account instead
	- Resources or links
		- [youtube.com > How to Setup Windows PROPERLY](https://www.youtube.com/watch?v=MBCiMK4AmEI&list=WL&index=3&t=283s)
		- [youtube.com > The New BypassNRO](https://www.youtube.com/watch?v=LK75SWX4F2s&list=WL&index=2) - bypass using an MS account
		- 
- If Windows already exists...
	- Move all MS account data to a local account profile - HARD
	- Resources or links
		- [youtube.com > How Do I Go Back to a Local Account after Setting Up Windows 11 with a Microsoft Account?](https://www.youtube.com/watch?v=h_5lWNWyVoY&list=WL&index=1)
	- Copying the User Profile Data?
		- [microsoft.com > Migrate User Accounts](https://learn.microsoft.com/en-us/windows/deployment/usmt/usmt-migrate-user-accounts) - using Microsoft USMT
		- 
		- 

--- 

# Workflows

This playbook shows how to:

- **Workflow 1**: Trigger Windows’ “Reset this PC → Keep my files,” then bulk‑reinstall apps via **winget** and **Chocolatey**, while keeping your data on TrueNAS/Syncthing/Duplicati.
- **Workflow 2**: Build or update a **baseline image** (via **Sysprep + DISM** or **Clonezilla**/**NTLite**), capture settings with **Provisioning Packages**, then deploy to a new machine, preserving preferences.

All tools are free or built into Windows; commands and links are provided so you can copy/paste directly.

## 1) On‑Demand OS Refresh + Automated App Redeployment

- .

## 2) Baseline‑Driven Windows Provisioning