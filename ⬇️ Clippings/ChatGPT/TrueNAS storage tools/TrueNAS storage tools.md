---
description: "TrueNAS Storage Usage Visualization"
author:
  - "ChatGPT"
  - "Cybersader"
"date created": Monday, September 15th 2025, 8:43 pm
domain: "chatgpt.com"
source:
tags:
  - "clippings"
  - "clippings/chatgpt"
  - "storage"
  - "truenas"
  - "nas"
  - "analytics"
  - "visualization"
  - "treemap"
title: "TrueNAS storage tools"
ai_model:
---
##### You said:

Is there a tool like Wiztree that I could use across TrueNAS to gauge what's using the most storage?

###### ChatGPT said:

Yep—several good “WizTree-for-NAS” options that work great with TrueNAS (SCALE or CORE). Here are the ones I recommend, from dead-simple CLI to full GUI:

# Fast + simple (on-box)

**ncdu (TUI)** – interactive, super fast, perfect for “what’s big in this tree?”

- Open **Shell** on TrueNAS and run (SCALE example):
	```
	apt update && apt install -y ncdu
	# scan a whole pool or any dataset:
	ncdu -x /mnt/POOLNAME
	```
	Tips: `?` for help; `d` to delete; `g` to go to path.  
	(On CORE: `pkg install ncdu`.)

**ZFS-native views (where did the space go?)**

- Datasets & snapshots:
	```
	zfs list -o name,used,avail,usedbydataset,usedbychildren,usedbysnapshots -r POOLNAME | sort -h -k2
	zfs list -t snapshot -o name,used,refer -r POOLNAME | sort -h -k2
	```
- By user/group on a dataset:
	```
	zfs userspace -o name,used -H POOLNAME/DATASET | sort -h -k2 | tail
	zfs groupspace -o name,used -H POOLNAME/DATASET | sort -h -k2 | tail
	```
- Biggest files under a path (quick “top 20”):
	```
	find /mnt/POOLNAME/DATASET -xdev -type f -printf "%s\t%p\n" | sort -n | tail -n 20 | numfmt --to=iec --suffix=B
	```

# Nice web/GUI options

**DUC (Disk Usage Collector) – web sunburst/treemap**

- Run in a light container that mounts your pool and serves a web UI:
	```
	# one-shot in a Debian container
	docker run --rm -it -v /mnt:/data -p 8888:8888 debian:bookworm \
	  sh -lc 'apt-get update && apt-get install -y duc && duc index /data && duc web -l 0.0.0.0:8888 /data'
	```
	Then open `http://truenas:8888` → click around like WizTree.

**QDirStat (desktop GUI) – works over SSH**

- Install QDirStat on a Linux desktop and use its *remote cache* helper on TrueNAS (runs a scan via SSH and loads locally). Feels very close to WinDirStat/WizTree but leverages scanning on the NAS.

# If you prefer scanning from your PC

- **WizTree** or **TreeSize** can scan SMB shares. They’re slower over the network (no MFT shortcut), but still effective for “which share/folder is biggest” without touching the NAS.

---

## Which to pick?

- **I want answers now:** `ncdu -x /mnt/POOL`
- **I’m losing space to snapshots:** `zfs list … usedbysnapshots` + per-snapshot listing
- **I want a pretty, shareable map:** DUC web
- **I want a desktop GUI feel:** QDirStat remote cache (or TreeSize/WizTree over SMB)

If you tell me your pool/dataset names (and whether you’re on SCALE or CORE), I’ll drop in exact commands tailored to your layout.

##### You said:

Is there anything in netdata that can show this?

###### ChatGPT said:

Short answer: **yes, but not like WizTree’s treemap.** Netdata can show *where space is going* at three useful levels:

1. **Per-mountpoint usage** – auto charts for each filesystem under “Disk space” (used/avail/inodes). Good for “which dataset/share is full?”. You can tweak inclusion/exclusion in `netdata.conf` → `[plugin:proc:diskspace]`.
2. **ZFS pool usage & health** – enable the **zfspool** collector to see pool free/used %, fragmentation, and vdev health. Create `/etc/netdata/go.d/zfspool.conf` if it’s not already there. *(Note: some NAS OS builds ship older Netdata that lack this collector; you can run a newer Netdata container if needed.)*
3. **Specific directory sizes** (your “top offenders”) – use the **filecheck** collector to track the size and file count of chosen paths (e.g., `/mnt/tank/media`, `/mnt/tank/backups`). Add them in `/etc/netdata/go.d/filecheck.conf`:
```
jobs:
  - name: top_datasets
    update_every: 60
    dirs:
      collect_dir_size: yes
      include:
        - '/mnt/tank/media'
        - '/mnt/tank/backups'
        - '/mnt/tank/home'
```

You’ll get charts like `filecheck.dir_size_bytes` and `filecheck.dir_files`. This is great for trend + alerting, but it’s a *watch list*, not an automatic full tree scan.

### What it won’t do

- Netdata **won’t** build a full treemap or auto “largest folders/files” inventory like WizTree. For one-off deep dives, still use `ncdu`/`duc`/`find` on the NAS.

### ZFS snapshot caveat

- Directory sizing (and tools like `du`) reflect *live files*, not snapshot-held space. To see snapshot consumption, use ZFS stats (e.g., `zfs list -t snapshot`) alongside Netdata’s pool view.

If you tell me your TrueNAS version (SCALE vs CORE) and whether you’re using the built-in agent or a container, I’ll hand you exact config edits and alert examples.

##### You said:

Are there any other technologies that could do this on truenas scale with a nice GUI?

###### ChatGPT said:

Yep—there are a few **nice-GUI** options on TrueNAS SCALE beyond Netdata:

# Top picks (with a real GUI)

**Diskover Data (TrueNAS App – web UI)**

- Full web app that *indexes* your datasets (via Elasticsearch) and gives dashboards for biggest folders, file types, age, duplicates, etc. Feels closest to “WizTree for a NAS,” but more powerful. Available directly in the **TrueNAS Apps** catalog.
- Notes: It runs a crawler and search backend, so the first index is heavier than a one-off `du`. There have been a few forum reports of bumps on very new releases (25.04), but it’s actively maintained.

**DUC (Disk Usage Collector) – web treemap**

- Lightweight: indexes a path, then serves an interactive **treemap/sunburst** over HTTP. Great for “show me the space hogs” as a shareable page. (Run in a container and mount `/mnt` read-only.)

**agedu (age-colored web report)**

- Generates an HTML UI that highlights *stale* data by last access time—perfect for finding “safe to archive/delete” targets. Run it in a container, index `/mnt/POOL/DATASET`, then serve its mini web UI. (Don’t apt-install on the host.)

**QDirStat (desktop GUI) with remote cache**

- For a desktop-style treemap: run `qdirstat-cache-writer` on the NAS (ideally in a container) to produce a cache, then open that file in QDirStat on your PC. You get a fast, detailed GUI without hammering the NAS repeatedly.

# Also worth knowing

- **Built-in TrueNAS UI** shows pool/dataset capacity (donut + stats), handy for “which dataset is filling up?”, but it doesn’t drill to per-folder/ per-file like WizTree.
- **TrueCommand** gives fleet-level capacity and reports, not file-level treemaps. Good for trending and multi-system monitoring.

---

## Quick start suggestions (SCALE-friendly)

- **Easiest, all-in-one:** install **Diskover Data** from *Apps → Discover → Diskover Data* and point it at your datasets. It’s designed for this use case.
- **Want a simple treemap with tiny footprint?** Run **DUC** in a container, index `/mnt`, then open the web UI.
- **Hunting old/stale files?** Use **agedu** to get a color-by-age web view.

If you tell me your pool/dataset paths and whether you’re on 24.10 “Electric Eel” or 25.04 “Fangtooth,” I’ll drop in container commands (compose or `docker run`) wired exactly to your layout.