---
title: "Codex CLI VS Code Setup"
aliases:
date created: Monday, April 28th 2025, 11:34 am
domain: "chatgpt.com"
source:
tags:
  - "clippings"
  - "clippings/chatgpt"
  - "installing_codex_cli"
  - "authentication"
  - "default_model"
  - "vs_code"
  - "vs_code_extension"
  - "openai"
  - "codex"
  - "cli"
  - "ide"
ai_model: "ChatGPT o4-mini-high"
author:
  - "ChatGPT"
  - "Cybersader"
---

**User:**

Let's say that I wanted to start using the codex CLI from OpenAI with some GPT models to help me code in VS Code. How can I do that and also set up spending limits?

---

**AI:**

## Summary

To integrate the OpenAI Codex CLI into VS Code, you install the CLI via npm and authenticate with your API key. You can then run `codex` commands directly in the VS Code integrated terminal, specifying your desired model and approval mode flags. Alternatively, you may install the **OpenAI Codex Integration** extension from the Visual Studio Marketplace to invoke Codex model prompts directly from the editor. To prevent unexpected charges, configure project-level spending limits via the OpenAI platform UI under **Organization settings → Projects → Limits**. Here you can set a monthly budget (hard limit), notification threshold (soft limit), and model usage restrictions for each project. Note that there is currently no API method to set budgets programmatically; limit configuration must be done via the web UI with owner permissions.

---

## Installing and Configuring Codex CLI in VS Code

### 1\. Installation

- Install the Codex CLI globally with npm:
	```
	npm install -g @openai/codex
	```
- To update to the latest release at any time, run:
	```
	codex --upgrade
	```

### 2\. Authentication

- Before invoking Codex, export your API key in your shell session:
	```
	export OPENAI_API_KEY="<YOUR_API_KEY>"
	```
	(On Windows PowerShell: `setx OPENAI_API_KEY "<YOUR_API_KEY>"`.)

### 3\. Default Model and Flags

- By default, Codex targets the `o4-mini` model for fast reasoning; override this with `codex -m <model_name>` (e.g., `codex -m o3`).
- Control how Codex applies edits with approval modes:
	- **Suggest** (default): Proposes edits and shell commands, awaiting your approval.
	- **Auto-Edit**: Applies file changes automatically, but asks before running commands.
	- **Full-Auto**: Fully autonomous, sandboxed edits and commands.  
		Switch modes via flags: `--suggest`, `--auto-edit`, or `--full-auto`.

### 4\. Running in VS Code

- Open the integrated terminal in VS Code and run `codex` from your project root to perform tasks such as explaining code, refactoring, or debugging.

---

## Integrating via the VS Code Extension

### 1\. Install the Extension

- Launch the Quick Open dialog (`Ctrl+P` or `Cmd+P`), paste:
	```
	ext install JohannesVoderholzer.codex-model-integration
	```
	and press Enter.

### 2\. Usage

- Select code or place your cursor, then click the robot icon in the sidebar. Choose **Chatbot** (for Q&A) or **Continue Writing** (raw model completion).
- Ensure your `OPENAI_API_KEY` is set in your environment variables and restart VS Code after configuration.

### 3\. Automating with Tasks (Optional)

You can define custom VS Code tasks in `.vscode/tasks.json` to wrap common codex commands, for example:

```
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Explain Current File with Codex",
      "type": "shell",
      "command": "codex --suggest Explain this file",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

---

## Setting Up Spending Limits

### 1\. Project-Level Limits via UI

- **Navigate** to your organization on [platform.openai.com](https://platform.openai.com/) and select **Projects → Limits**.
- **Monthly budget**: Set a hard cap in USD; once this amount is reached in a calendar month (UTC), all further API requests for the project are blocked.
- **Notification threshold**: Configure a soft limit to receive email alerts when usage exceeds this amount.
- **Model usage**: Restrict which models the project can call (e.g., allow only `gpt-4o-mini` while blocking others).
- **Permissions**: Only organization owners can set and modify these limits.

### 2\. No Programmatic Limit Setting

- There is no admin API endpoint to configure budgets or model restrictions; all spending controls must be managed via the web UI.

---

By following these steps, you'll have Codex integrated into your VS Code workflow and robust safeguards against unexpected API spend.

**User:**

How to add API key in PS?

---

**AI:**

## Summary

You can add your OpenAI API key in PowerShell either temporarily for the current session using `$Env:OPENAI_API_KEY = "YOUR_API_KEY"` or persistently across sessions using `setx OPENAI_API_KEY "YOUR_API_KEY"`. The persistent method writes the variable to the registry and requires reopening PowerShell to take effect.

---

## 1\. Temporarily for Current Session

To set the variable only for the active PowerShell session:

```
$Env:OPENAI_API_KEY = "YOUR_API_KEY"
```
- This change lasts until you close the PowerShell window.
- You can verify it by running:
	```
	echo $Env:OPENAI_API_KEY
	```

---

## 2\. Persistently Across Sessions

To make the API key available in all future PowerShell sessions:

```
setx OPENAI_API_KEY "YOUR_API_KEY"
```
- Requires reopening PowerShell (or opening a new window) before the variable is available.
- The `setx` command writes the variable under `HKEY_CURRENT_USER` by default.
- To create a system-wide variable, run PowerShell as Administrator and add the `/M` switch:
	```
	setx OPENAI_API_KEY "YOUR_API_KEY" /M
	```

---

## 3\. Verifying and Troubleshooting

- List all environment variables to confirm:
	```
	Get-ChildItem Env:
	```
- If you don’t see your key after using `setx`, ensure you opened a **new** PowerShell window.
- Variable names in Windows are case-insensitive, but they must match exactly when accessed via `$Env:` or `Get-ChildItem`.

**User:**

I'm trying to add it globally from PS in VS Code and getting denied

---

**AI:**

## Summary

When you use `setx /M` to write an environment variable to the machine scope, Windows requires Administrator rights because it writes into the system registry hive . In VS Code’s integrated PowerShell terminal, the session inherits the permissions of the VS Code process itself, so without elevating that process you’ll see an “Access is denied” error . If you lack admin privileges, you can still set the API key at the user level with `setx` (no `/M`) or for the current session only using `$Env:OPENAI_API_KEY`, both of which do not require elevation .

---

## Why You’re Seeing “Access Denied”

### `setx /M` Requires Admin Privileges

The `/M` switch tells `setx` to write to the **Machine** (system-wide) environment variables, which live under `HKEY_LOCAL_MACHINE` in the registry and demand Administrator permissions .

### Registry Path Denial

SuperUser reports confirm that running `setx /M` without admin rights produces an “access to registry path is denied” error because the console lacks the necessary registry ACLs .

### PowerShell Scopes and Permissions

PowerShell environment variables operate in three scopes—**Process**, **User**, and **Machine**—with Machine modifications requiring registry access that is blocked unless you’re elevated .

---

## How to Add the API Key Globally

### 1\. Launch VS Code as Administrator

To give your integrated terminal the needed rights, right-click the **Visual Studio Code** shortcut and choose **Run as administrator**. Now any `setx /M` commands will succeed .

### 2\. Use `setx /M` in an Elevated Shell

In the elevated terminal, run:

```
setx /M OPENAI_API_KEY "YOUR_API_KEY"
```

This writes the key into the system environment variables for all users .

### 3\. Alternative: .NET Class Method

Also in an Administrator session, you can use the .NET API directly:

```
[System.Environment]::SetEnvironmentVariable(
  'OPENAI_API_KEY',
  'YOUR_API_KEY',
  'Machine'
)
```

This achieves the same machine-wide setting and likewise requires elevation .

### 4\. If You Don’t Have Admin Rights

- **User-scope** (no `/M`):
	```
	setx OPENAI_API_KEY "YOUR_API_KEY"
	```
	This writes under your user hive (`HKEY_CURRENT_USER`) without needing elevation .
- **Session-only**:
	```
	$Env:OPENAI_API_KEY = "YOUR_API_KEY"
	```
	This sets the variable in the current process but does not persist after closing the shell .

---

## Verifying the Change

After opening a **new** terminal session:

1. **PowerShell Process Scope**
	```
	echo $Env:OPENAI_API_KEY
	```
	Confirms what the process inherited from the environment .
2. **Machine Registry Scope**
	```
	Get-ItemProperty \`
	  -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" \`
	  -Name "OPENAI_API_KEY"
	```
	Reads the value stored in the system registry .

---

## Troubleshooting

If you still get “Access is denied,” double-check that you truly launched VS Code (or your PowerShell session) with **Administrator** privileges—a necessity for any Machine-level environment change .

**User:**

How do I just set an environmental variable for the user?

---

**AI:**

## Summary

To create a persistent user-scope environment variable on Windows, you can use the built-in **`setx`** command without the `/M` switch, the PowerShell **`[Environment]::SetEnvironmentVariable()`** method targeting the *User* scope, or the Windows GUI under System Properties. For temporary session-only variables, you can still use the `$Env:` syntax in PowerShell.

---

## 1\. Using the `setx` Command

Run this in any Command Prompt or non-elevated PowerShell window:

```
setx OPENAI_API_KEY "YOUR_API_KEY"
```
- **No `/M` switch** means the variable is written under your user hive (`HKEY_CURRENT_USER`) and does **not** require Administrator rights.
- The change takes effect in **new** Command Prompt or PowerShell sessions (it won’t appear in the current window).

---

## 2\. Using PowerShell’s .NET API

In PowerShell (any elevation level), you can programmatically set a user variable:

```
[System.Environment]::SetEnvironmentVariable(
  'OPENAI_API_KEY',
  'YOUR_API_KEY',
  'User'
)
```
- Targets the **User** scope directly, modifying the registry under `HKEY_CURRENT_USER\Environment`.
- Available immediately in new child processes and future sessions; existing shells must be reopened.

---

## 3\. Temporary (Current Session) with `$Env:`

For a variable valid only for the **current** PowerShell process:

```
$Env:OPENAI_API_KEY = "YOUR_API_KEY"
```
- No registry changes; inherited by any child processes spawned from this session.
- Lost when you close the shell.

---

## 4\. Using the Windows GUI

1. Press **Win + R**, type `SystemPropertiesAdvanced`, and press Enter.
2. Click **Environment Variables…**.
3. Under **User variables for <YourUser>**, click **New…**.
4. Enter the **Variable name** (e.g., `OPENAI_API_KEY`) and **Variable value**, then **OK**.
5. Close and reopen any terminal windows to pick up the change.

---

Choose the method that best fits your workflow. For scripts and automation, `setx` or the .NET API approach is ideal; for one-off manual setups, the GUI can be more straightforward.