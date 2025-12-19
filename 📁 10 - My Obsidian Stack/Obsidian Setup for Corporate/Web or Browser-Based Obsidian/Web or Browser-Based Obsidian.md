---
permalink: obsidian-in-browser
aliases: []
tags: []
publish: true
date created: Monday, November 25th 2024, 2:54 pm
date modified: Thursday, December 19th 2024, 10:00 pm
---

- All of these options will essentially run Obsidian somewhere else with mechanisms in place to make other essentials work:
	- Syncing
	- User Management
	- Community Plugin Management
	- Networking
	- Security

There's only one option that seems like it could scale and that's [Kasm Workspaces](../../📁%2005%20-%20Organizational%20Cyber/Remote%20Desktop%20Gateways/Kasm%20Workspaces/Kasm%20Workspaces.md) but the general solution are [Remote Desktop Gateways](../../📁%2005%20-%20Organizational%20Cyber/Remote%20Desktop%20Gateways/Remote%20Desktop%20Gateways.md)

---

# Three-Layer Architecture for Enterprise Web Obsidian

> [!summary] TL;DR
> **Layer 1**: VNC gateway (Kasm/Guacamole) streams Obsidian desktop to browser
> **Layer 2**: CRDT sync (Yjs) enables conflict-free real-time collaboration
> **Layer 3**: Auth + mount orchestration controls vault access at session start
>
> **Key insight**: RBAC at vault mount time, not file level. If you can mount it, you have full access.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   LAYER 3: AUTH + MOUNT ORCHESTRATION           │
│                                                                 │
│  User authenticates → Check groups → Mount permitted vaults     │
│                                                                 │
│  Components:                                                    │
│  - Authentik/Keycloak (IdP with LDAP/SAML/OIDC)               │
│  - Mount Orchestrator (checks permissions, mounts vaults)       │
│  - Audit Logger (who accessed what, when)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 2: CRDT SYNC                          │
│                                                                 │
│  Conflict-free collaboration between multiple users             │
│                                                                 │
│  Components:                                                    │
│  - Yjs Sync Server (y-websocket) - one room per vault          │
│  - Sync Daemon (per container) - watches files, syncs via CRDT │
│  - MinIO/S3 (binary attachments stored by hash reference)      │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 1: VNC/DESKTOP GATEWAY                │
│                                                                 │
│  Browser access to full Obsidian desktop experience             │
│                                                                 │
│  Options: Kasm Workspaces | Apache Guacamole | Selkies/noVNC   │
│                                                                 │
│  Per-user container:                                            │
│  - Obsidian app (full plugin support)                          │
│  - Sync daemon (watches filesystem)                             │
│  - Mounted vaults (only what user is authorized for)           │
└─────────────────────────────────────────────────────────────────┘
```

## Key Interfaces

| Interface | Protocol | Purpose |
|-----------|----------|---------|
| Browser → VNC Gateway | HTTPS/WSS | User accesses Obsidian UI |
| VNC Gateway → Container | VNC | Streams desktop to gateway |
| Sync Daemon → Yjs Server | WebSocket | CRDT sync between users |
| Sync Daemon → Filesystem | inotify | Detects file changes |
| Orchestrator → IdP | OIDC | Validates user, gets groups |
| Orchestrator → Storage | Docker API / SMB | Mounts permitted vaults |

## Layer 1: VNC/Desktop Gateway

**Purpose**: Provide browser access to Obsidian without requiring desktop install.

**Why VNC instead of native web?**
- Obsidian depends on Node.js filesystem APIs
- 1000+ plugins expect real filesystem
- VNC preserves full plugin compatibility

**Technology Options**:

| Technology | Pros | Cons | Best For |
|------------|------|------|----------|
| Kasm Workspaces | Enterprise SSO, scaling, persistence | Licensing cost | Enterprise |
| Apache Guacamole | Free, simple, well-documented | Less session mgmt | POC, small teams |
| Selkies/GStreamer | WebRTC (lower latency) | Newer | Performance-critical |

**Container runs**:
- X11/Xvfb (virtual display)
- VNC server
- Obsidian app
- Sync daemon (Layer 2)
- Supervisor (process manager)

## Layer 2: CRDT Sync Engine

**Purpose**: Real-time, conflict-free collaboration.

**What is CRDT?**
Conflict-free Replicated Data Type - data structure that can be modified independently on multiple devices, then merged automatically.

```
Traditional: User A edits, User B edits → CONFLICT
CRDT: User A edits, User B edits → Auto-merged (both changes preserved)
```

**Architecture**:
```
Yjs Server (central)
    │
    ├── WebSocket ──► Sync Daemon A (User A's container)
    │                      │
    │                      └── inotify watches /vault
    │                      └── Y.Doc per .md file
    │                      └── Writes CRDT updates to filesystem
    │
    └── WebSocket ──► Sync Daemon B (User B's container)
                           └── Same pattern
```

**Why external daemon instead of Obsidian plugin?**
- Obsidian's file cache causes timing issues
- Plugin crashes can crash Obsidian
- Daemon reads directly from filesystem after Obsidian writes

**Handling binary files**:
- CRDTs struggle with large binaries (images, PDFs)
- Solution: Store binaries in MinIO/S3, sync only hash references
- `![image](sha256:abc123)` syncs via CRDT, actual bytes in object store

**Technology**: Yjs (battle-tested, TypeScript, active community)

## Layer 3: Auth & Mount Orchestration

**Purpose**: Control who can access which vaults.

**Key Design Decision: Vault-Level RBAC**

```
❌ File-level RBAC (rejected):
   - Check permissions on every file operation
   - Complex, fights Obsidian's architecture
   - Would need to hide files in UI

✅ Vault-level RBAC (chosen):
   - Control which vaults are mounted at session start
   - If you can access a vault, you have full access
   - Simple, works with filesystem permissions
```

**Flow**:
1. User navigates to portal
2. Redirected to Authentik for SSO
3. Authentik returns JWT with user groups
4. Mount orchestrator checks: which vaults can this user access?
5. Only permitted vaults are mounted to container
6. Obsidian session starts with those vaults visible

**Vault Permissions Config**:
```yaml
vaults:
  - name: engineering
    path: /vaults/engineering
    allowed_groups: [engineering, devops]

  - name: finance
    path: /vaults/finance
    allowed_groups: [finance, executives]

  - name: wiki
    path: /vaults/wiki
    allowed_groups: [all-employees]
```

**Storage Options**:
- Docker volumes (simple, managed)
- SMB/CIFS shares (corporate, AD-integrated)
- Both (Docker for sync state, SMB for content)

## Implementation Status

POC repository: `obsidian-in-the-browser/`

| Component | Status | Notes |
|-----------|--------|-------|
| Obsidian Docker image | Done | Based on linuxserver/obsidian |
| Sync daemon (Yjs) | Done | Node.js + inotify + Yjs |
| Audit logging | Done | JSON structured logs |
| docker-compose | Done | Local testing stack |
| Mount orchestration | Pending | Need to integrate with IdP |
| Obsidian plugin | Pending | Optional enhancement |

## Research Sources

- [Obsidian Forum - Obsidian for Web](https://forum.obsidian.md/t/obsidian-for-web/2049/250)
- [Relay Plugin](https://github.com/No-Instructions/Relay) - Yjs-based Obsidian sync
- [Obsidian LiveSync](https://github.com/vrtmrz/obsidian-livesync) - CouchDB-based sync
- [Yjs Documentation](https://docs.yjs.dev/)
- [Kasm Workspaces Docs](https://kasmweb.com/docs/)

---

- [Apache Guacamole](../../../📁%2005%20-%20Organizational%20Cyber/Remote%20Desktop%20Gateways/Apache%20Guacamole/Apache%20Guacamole.md)
- [Kasm Workspaces](../../../📁%2005%20-%20Organizational%20Cyber/Remote%20Desktop%20Gateways/Kasm%20Workspaces/Kasm%20Workspaces.md)

# DROPZONE

- [github.com > silverbulletmd/silverbullet: An open source personal productivity platform built on Markdown, turbo charged with the scripting power of Lua](https://github.com/silverbulletmd/silverbullet)
- [obsidian.md > I need a Obsidian Web server service - Help](https://forum.obsidian.md/t/i-need-a-obsidian-web-server-service/97000)
- 
- [sytone/obsidian-remote: Run Obsidian.md in a browser via a docker container.](https://github.com/sytone/obsidian-remote)
- [https://code.visualstudio.com/docs/editor/vscode-web#\_extensions](https://code.visualstudio.com/docs/editor/vscode-web#_extensions) - an example of why Obsidian doesn't have a browser version
- https://www.reddit.com/r/ObsidianMD/comments/10sj378/web_version_of_obsidian/
- https://github.com/sytone/obsidian-remote
- https://vscode.dev/
- https://github.dev
- https://neverinstall.com/

# Kasm Workspaces for Obsidian | Browser-Based Obsidian

- [ ] Implement Kasm Workspaces in the browser with Obsidian and custom images ➕ 2024-11-20

## Kasm Workspaces - Requires VM | Docker Kasm with Obsidian

### Can you set up Kasm inside a Docker container?

Long story short, you can with DiD (Docker in Docker) but just don't...

- [You might want to take a look at the linuxserver project that bundles Kasm into a single container. It leverages Docker in Docker (DinD). The recommended way to run Kasm is on standalone machines/VMs, but the DinD solution should be close to what you are looking for.](https://www.reddit.com/r/kasmweb/comments/wz3amp/can_you_add_kasm_workspace_to_an_existing_docker/)
- [Kasm Docs - Kasm Workspaces can be installed on a Virtual Machine or directly on bare metal. We do not recommend running Kasm in LXC or WSL/WSL2.](https://kasmweb.com/docs/latest/install/system_requirements.html "System Requirements — Kasm 1.16.1 documentation")

### Kasm in a VM in TrueNAS Scale?

So...obsidian inside of Kasm inside of an Ubuntu Linux VM inside of TrueNAS Scale?

- [Running VMs in TrueNAS Scale - Should you run this instead of Proxmox? - YouTube](https://www.youtube.com/watch?v=hpPXOSC5GmU)

> [!tldr] TL;DR - TrueNAS VMs are not that great and I should just get a small server box and start running Proxmox separately

### Kasm in a VM in VMware Workstation Player

- Install guides
	- [Single Server Installation — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/install/single_server_install.html)
	- [(2) Kasm Workspaces - Installation - YouTube](https://www.youtube.com/watch?v=BYJ0M04cD18)
	- [Kasm Workspaces - Ep. 1 - Installing Kasm Workspaces - YouTube](https://www.youtube.com/watch?v=QHdU4HnseDw)

Steps:
- Download VMware Workstation Player
- Download a VM image - [supported VM image operating systems](https://kasmweb.com/docs/latest/install/system_requirements.html "System Requirements — Kasm 1.16.1 documentation")
	- [Get Ubuntu | Download | Ubuntu](https://ubuntu.com/download) 
- Add the VM to VMware Workstation Player by adding a new virtual machine (in workstation player) and selecting the ".iso" file you downloaded
	- Make sure it has enough resources - [Minimum Resource Requirements](https://kasmweb.com/docs/latest/install/system_requirements.html "System Requirements — Kasm 1.16.1 documentation")
- Setup Kasm and Linux
	- Once Linux server is running (just click through all the stuff for Linux till you're at the login
	- Login
	- Copy and Paste aren't enabled in Community edition for VMware Workstation Player 

- How does the networking work in a VM on my desktop?
	- Linux server showed...
		- DHCPv4 - 192.168.159.130/24
	- I accessed it by going to 192.168.159.131 in my browser

- Errors that can show up
	- ![](_attachments/file-20241125205530054.png)

- Opening up Obsidian as a user
	- ![](_attachments/file-20241125205612549.png)
	- ![](_attachments/file-20241125205629502.png)
	- ![](_attachments/file-20241125205653516.png)
	- ![](_attachments/file-20241125205735915.png)
	- ![](_attachments/file-20241125205855054.png)

### Problems with using Kasm for Obsidian

- [ ] Solve problems to make Obsidian work for a corporate setting using Kasm ➕ 2024-11-25

There's some problems that have to get solved in order for this to work for a corporate setting.

**Problems to solve for Kasm-based Obsidian:**
- Employees would have to learn to accept the interface - might be possible if the argument is that it's secure
- Provisioning and user management
- Authentication
	- [LDAP Authentication — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/ldap.html)
	- [SAML 2.0 Authentication — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/saml_authentication.html)
	- [OpenID Authentication — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/oidc.html)
	- [Two Factor Authentication — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/two_factor.html)
- Syncing, storage, Kasm workspace session persistence
	- [Persistent Data — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/persistent_data.html)
	- [Rclone Common Configurations — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/storage_providers/custom.html)
		- Includes SMB
	- [File Mappings — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/file_mappings.html)
	- How are community plugins managed?
		- Employees need to be able to upload files, yet, that allows them to change the ".plugins" folder - adds risk of malicious community plugins
		- [Storage Mappings — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/storage_mappings.html)
- Implementation in corporate infrastructure
	- [VM Provider Configs — Kasm 1.16.1 documentation](https://kasmweb.com/docs/latest/guide/compute/vm_providers.html)

# Obsidian in a Container

- Forums, discussions
	- [Has anyone here tried to virtualize Obsidian in docker container? : r/ObsidianMD](https://www.reddit.com/r/ObsidianMD/comments/s13lp5/has_anyone_here_tried_to_virtualize_obsidian_in/)
	- [Self hosted Docker instance - Share & showcase - Obsidian Forum](https://forum.obsidian.md/t/self-hosted-docker-instance/3788)
	- [Obsidian - running sync engine via Docker](https://www.blackvoid.club/obsidian-running-sync-engine-via-docker/)
	- [Obsidian for web - Feature requests - Obsidian Forum](https://forum.obsidian.md/t/obsidian-for-web/2049/221)
- [Unraid | Community Apps | Obsidian](https://unraid.net/community/apps?q=obsidian#r)
- [Package obsidian](https://github.com/linuxserver/docker-obsidian/pkgs/container/obsidian) 
- LinuxServer.io
	- [linuxserver/obsidian - Docker Image | Docker Hub](https://hub.docker.com/r/linuxserver/obsidian)
	- [obsidian - LinuxServer.io](https://docs.linuxserver.io/images/docker-obsidian/)
	- 
- Obsidian-Remote
	- [Obsidian Remote: Running Obsidian in docker with browser-based access - Share & showcase - Obsidian Forum](https://forum.obsidian.md/t/obsidian-remote-running-obsidian-in-docker-with-browser-based-access/34312) 
	- [sytone/obsidian-remote: Run Obsidian.md in a browser via a docker container.](https://github.com/sytone/obsidian-remote/tree/main?tab=readme-ov-file#hosting-behind-nginx-proxy-manager-npm)

