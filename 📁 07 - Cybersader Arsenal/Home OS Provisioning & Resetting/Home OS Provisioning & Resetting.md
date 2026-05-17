---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, May 10th 2025, 6:45 pm
date modified: Sunday, July 27th 2025, 8:54 pm
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
		- [youtube.com > The New BypassNRO](https://www.youtube.com/watch?v=LK75SWX4F2s&list=WL&index=2) - bypass using an MS account
		- [github.com > ChrisTitusTech/winutil: Chris Titus Tech's Windows Utility - Install Programs, Tweaks, Fixes, and Updates](https://github.com/ChrisTitusTech/winutil)
		- [youtube.com > How To Setup Windows](https://www.youtube.com/watch?v=0PA1wgdMeeI)
		- [youtube.com > How to Setup Windows PROPERLY](https://www.youtube.com/watch?v=MBCiMK4AmEI&list=WL&index=3&t=283s)
		- 
- If Windows already exists...
	- Move all MS account data to a local account profile - HARD
	- Resources or links
		- [youtube.com > How Do I Go Back to a Local Account after Setting Up Windows 11 with a Microsoft Account?](https://www.youtube.com/watch?v=h_5lWNWyVoY&list=WL&index=1)
	- Copying the User Profile Data?
		- [microsoft.com > Migrate User Accounts](https://learn.microsoft.com/en-us/windows/deployment/usmt/usmt-migrate-user-accounts) - using Microsoft USMT
		- [microsoft.com > Download and install the Windows ADK](https://learn.microsoft.com/en-us/windows-hardware/get-started/adk-install#download-the-adk-101261002454-december-2024)
		- [github.com > belowaverage-org/SuperGrate: 💾 Get moving with Super Grate; a free & open source Windows Profile Migration & Backup Utility. Super Grate is a GUI (Graphical User Interface) that assists Microsoft's USMT (User State Migration Utility) in performing remote migrations over a network connection.](https://github.com/belowaverage-org/SuperGrate)
			- [belowaverage.org > Super Grate](https://belowaverage.org/documentation/supergrate/)
		- Use "Robocopy"
			- `robocopy "C:\Users\OldUser" "C:\Users\NewUser" /MIR /COPYALL /X /R:1 /W:1`
			- `robocopy "C:\Users\OldUser" "C:\Users\NewUser"  /MIR /COPYALL /XJ /R:1 /W:1 /XD "C:\Users\OldUser\AppData\Local" "C:\Users\OldUser\AppData\LocalLow" /XD "C:\Users\OldUser\AppData\Local" "C:\Users\OldUser\AppData\LocalLow"`
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

---

# Future Considerations

## Automating first-launch credential entry (parked — currently manual)

**Current state:** unattended install scripts handle the binary install silently, but anything that requires logging into an account (Covenant Eyes / Victory Shield, password manager first-unlock, Microsoft account binding, etc.) is left to the user to type in by hand after install completes. The `install.ps1` pattern explicitly prints a "MANUAL STEP" block at the end with the relevant URLs.

**Future idea worth exploring:**

A "fetch-and-burn" credential pattern using a local secret store + UI automation:

1. Bitwarden CLI (`bw get item ...`) or 1Password CLI (`op read ...`) pulls the credential into memory only at install time
2. Pywinauto / AutoHotkey / Power Automate Desktop types it into the app's login form
3. Variables wiped from memory immediately after use (never written to disk in plaintext)

**Even further out:** vision-capable local LLMs (Llama 3.2 Vision, Qwen2.5-VL, OmniParser, OpenAdapt) driving the UI automation — resilient to vendor UI changes that break scripted automation. Anthropic Computer Use proves the capability; local equivalents are catching up. Probably overkill for stable login forms but useful where the UI shifts frequently.

**Why parked:** the manual login is also an *architectural feature* — credentials are personal identity, and parishioner deployments specifically should not have a script knowing the user's password. Automation is appropriate for one's own machines / reinstall workflows; less so for distributed parish use. See [[Tailscale File Transfer on Windows — Field Notes]] for the related conversation about the prudential-judgment line.

**Captured as a future video:** [[How I fully automate a Windows install in 2026]] — full walkthrough of the MicroWin + autounattend + winget + Bitwarden CLI fetch-and-burn stack, plus the "automate the work, preserve the identity boundary" framing.