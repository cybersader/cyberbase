---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, November 8th 2025, 1:03 pm
date modified: Sunday, November 9th 2025, 7:20 pm
---

- [truenas.com > Managing the System Configuration](https://www.truenas.com/docs/scale/25.10/scaletutorials/systemsettings/advanced/managesysconfig/)
- [youtube.com > TrueNAS 12 U1 Update and Quick Look at TrueCommand](https://www.youtube.com/watch?v=huZ6JQ2h5Ko)
- [truenas.com > Installing TrueCommand Cloud](https://www.truenas.com/docs/truecommand/3.0/tcgettingstarted/install/installtccloud/)
- [truenas.com > TrueCommand Install Articles > Installing or Updating](https://www.truenas.com/docs/truecommand/3.0/tcgettingstarted/install/)
- [youtube.com > TrueNAS Boot Drive Failure:How To Recover and Get Your NAS Back FAST](https://www.youtube.com/watch?v=Xf0i4OxzYWE)

# TL;DR

- If you didn't enable data encryption on the pool, then simply backup the config once a quarter
- If you did enable data encryption, then use TrueCommand for simplicity

# GPT Notes

**You:**

How to backup the truenas boot drive, config, and keys?\

* * *

**ChatGPT:**

Here’s a tight, battle-tested way to protect everything you’ll ever need to fully rebuild a TrueNAS box: the **config**, the **boot device**, and your **encryption/SSH/cert keys**. I’ll show UI clicks first (SCALE), then optional CLI/automation.

* * *

## 1) Back up the TrueNAS **configuration** (with secrets)

**UI (recommended):**  
System Settings → **General** → _Manage configuration_ → **Save Config**

- ✅ **Include Secret Seed** (must be checked to restore cloud creds, directory binds, etc.)
    
- (Optional) Set a passphrase for the exported file.
    
- Save the `.db`/`.tar` file to **two places**: your data pool (e.g., `/mnt/POOL/Backups/`) and an offsite store.
    

**What this gives you:** system settings, users/groups, services, shares, network, alerts, credentials, etc. With the **Secret Seed**, most credentials decrypt on restore.

* * *

## 2) Protect / clone the **boot device**

You want two safety nets:

#### A) Boot Environments (snapshots of the OS)

System Settings → **Boot** → **Boot Environments**

- Before/after updates, **Create** a boot environment.
    
- Keep at least the last 3 good ones.
    
- You can roll back from here if an update goes sideways.
    

#### B) Mirror the boot drive (best quick “backup”)

System Settings → **Boot** → **Boot Pool Status** (or “Boot Mirrors”) → **Attach**

- Insert a second SSD of equal/greater size → **Attach** to create a **mirror** of the boot pool.
    
- If the primary fails, the system still boots.
    
- If you want a cold spare: **Replace** with the spare drive, let it resilver, then **Detach** the original; label the removed drive “boot spare – YY-MM-DD”.
    

> Tip: Use small, reliable SSDs (e.g., 120–240 GB) just for boot; data never belongs on the boot device.

* * *

## 3) Export **dataset encryption keys** (ZFS native encryption)

If you use encrypted datasets, you must export their keys separately.

**UI (per-dataset):**  
Storage → **Pools** → expand your pool → click the encrypted dataset → **Export Key / Show Key** → **Download / copy**.  
Repeat for each encrypted dataset you care about.

**UI (bulk, if available in your version):**  
Storage → **Pools** → pool kebab (⋯) → **Export Dataset Keys** → save the bundle.

**Store keys** offline (password manager/secure USB). Without these, an imported pool with encrypted datasets stays locked.

* * *

## 4) Export **SSH host keys** and **user keys** (if you need to keep fingerprints stable)

- System Settings → **Services** → SSH → note the path to host keys (commonly `/etc/ssh` on the appliance).
    
    - Use an SMB/SSH session to copy: `/etc/ssh/ssh_host_*`
        
- User SSH keys live in each user’s home (e.g., `/home/username/.ssh/authorized_keys`). If you manage them in **Accounts → Users**, your config backup usually covers this mapping—but backing up `.ssh` folders is still smart if you hand-edited them.
    

* * *

## 5) Export **certificates** (TLS) and **CAs**

System Settings → **Certificates**

- For each cert/CA: **Export** (grab cert + private key where applicable).
    
- Store with your config backups.
    

* * *

## 6) (SCALE Apps) Back up **Apps** definitions/state

If you run Apps/Kubernetes:

- Apps → **Backups** (or **Advanced Settings → Backup/Restore** depending on version)
    
    - Configure a backup target (S3/SMB/NFS).
        
    - Run a backup of charts/releases and (if you choose) PVCs.
        
- Also back up the **dataset** that stores app data (e.g., `ix-applications` and any app-specific datasets). If they’re encrypted, ensure their **keys are exported** (Step 3).
    

* * *

## 7) Quick **restore drill** (do this once so you trust the process)

1. Fresh install same-family TrueNAS version on a spare USB/SSD.
    
2. Upload your **config** (System Settings → General → _Manage configuration_ → **Upload Config**).
    
3. Reboot when prompted; network/shares should return.
    
4. **Import Pool(s)** (Storage → **Import**).
    
5. **Unlock encrypted datasets** using the saved keys (Step 3).
    
6. If using Apps, **restore App backups** and confirm workloads come up.
    

This dry-run turns “I hope it restores” into “I know it restores.”

* * *

## 8) Light automation (optional)

If you like a single folder with everything:

- Create `/mnt/POOL/Backups/truenas/`
    
- Nightly tasks:
    
    - **Save Config** (with Secret Seed) to that folder.
        
    - **Export dataset keys** (bulk) to the same place.
        
    - **Rclone** or **cloud sync** that folder to an offsite target.
        

> Even if you don’t script it, schedule a **calendar reminder** to do a manual run monthly and after any big change.

* * *

### Minimal checklist (copy/paste to your notes)

- Save Config **with Secret Seed** → two locations (local + offsite).
    
- Boot Environments → create before updates; keep last 3+.
    
- **Mirror boot device** (or keep a freshly cloned spare).
    
- Export **ZFS dataset encryption keys** (per dataset or bulk).
    
- Export **certs/CAs**.
    
- Copy **SSH host keys** and any **user `.ssh`** you hand-maintain.
    
- **Apps backup** (charts + PVCs) and back up app datasets.
    
- Do a **restore drill** once.
    

If you want, tell me your pool/dataset names and whether you’re using Apps, and I’ll spit out a tiny cron-friendly script and a folder layout that matches your box.

* * *

**You:**

I don't honestly know where my NVMe boot drive and config and keys is.  I'm currently on 25.10.0 - Goldeye.  I don't know if I even have that as its own dataset to be honest currently.  Not sure how that works it would seem

* * *

**ChatGPT:**

Totally normal to feel fuzzy on this—on TrueNAS SCALE (25.10 “Goldeye”) the **boot device** lives in its own little ZFS pool (not in your data pool), and your **config**/**keys** are things you export on demand. Do this:

* * *

## Find your boot NVMe (and whether it’s mirrored)

**UI path:** System Settings → **Boot**

- In **Boot Environments**, click **Boot Pool Status** (or “Boot Pool”).
    
- You’ll see a pool usually named **`boot-pool`** with one or more devices (e.g., `nvme0n1`, `sda`). That’s your boot SSD/NVMe.
    
- If there’s only **one** device listed, you’re not mirrored yet. You can **Attach** a second, same-size drive here to mirror the boot pool.
    

**CLI (Shell → root):**

```bash
zpool list
zpool status boot-pool
ls -l /dev/disk/by-id | grep -E 'nvme|ssd|ata'
```

- `zpool status boot-pool` shows the exact device(s).
    
- The `/dev/disk/by-id/...` entries include **model + serial** so you can match to the physical drive.
    

* * *

## Your system **config** (where it “is” and how to back it up)

There isn’t a static “config file” you browse to; TrueNAS keeps config internally. You **export** it:

**UI (recommended):**  
System Settings → **General** → _Manage configuration_ → **Save Config**

- ✅ Check **Include Secret Seed**.
    
- Save the file to your data pool (e.g., `/mnt/POOL/Backups/truenas/`) **and** somewhere offsite.
    

> That one file + Secret Seed is what lets you fully restore users, shares, creds, services, etc.

* * *

## Your **encryption keys** (datasets, not the boot)

If you use ZFS native encryption, each **encrypted dataset** has a key. They’re **not** stored as a single global file—export them from Storage:

**UI (per dataset):**  
Storage → **Pools** → expand → select an 🔒 dataset → **Export Key / Show Key** → **Download**.  
(Repeat for each encrypted dataset you care about.)

**UI (bulk, if present in your build):**  
Storage → **Pools** → pool menu (⋯) → **Export Dataset Keys**.

**CLI (see which datasets are encrypted):**

```bash
zfs list -o name,encryption,keystatus -r YOURPOOL
```

- `encryption=on` and `keystatus=available` means that dataset has a key loaded right now; export/save it from the UI.
    

> Store keys offline (password manager or a labeled USB). Without them, you can import the pool but won’t unlock those datasets.

* * *

## (If you use Apps) Where the app data “lives”

On SCALE, the Kubernetes bits typically live in a dataset like **`ix-applications`** inside your data pool. Back up:

- The **Apps backup** (Apps → Backups / Advanced Settings → Backup).
    
- The **datasets** that hold app data (including `ix-applications` and any app-specific datasets).
    
- If `ix-applications` is encrypted, make sure its **key** is exported as above.
    

* * *

## Quick “do it now” checklist for you

1. **Identify boot device**
    
    - UI: System Settings → Boot → Boot Pool Status (look for `boot-pool` and the device name).
        
    - If single-disk: click **Attach** to add a mirror.
        
2. **Export config with secrets**
    
    - System Settings → General → **Save Config** → check **Include Secret Seed** → save to `/mnt/POOL/Backups/truenas/` and offsite.
        
3. **Export dataset keys**
    
    - Storage → Pools → (dataset) **Export Key** (or pool ⋯ → **Export Dataset Keys**) → store offline.
        
4. **(Apps) Run an Apps backup** and make sure app datasets are included in your normal dataset backups/snapshots/replication.
    

* * *

If you want, tell me your pool name (e.g., `tank`, `data`) and I’ll give you a tiny command block to:

- list encrypted datasets,
    
- create a dated backup folder, and
    
- remind you exactly where to click for exports—so you can paste it into your notes and run it whenever you like.

* * *

**You:**

Is it possible though to turn this into a dataset that I can remotely backup or is the config normally not backed up this way like in the below video

[youtube.com > Secure Your Data: Backup and Restore on TrueNAS Scale Explained](https://www.youtube.com/watch?v=-JSE-ucY3sU)

* * *

**ChatGPT:**

Short answer: you don’t “make the config a dataset.” On SCALE, the config isn’t a ZFS dataset you can replicate. Instead, you export the config to a **file** (optionally with the **Secret Seed**) and then store that file **inside** a dataset you already back up (Cloud Sync, replication, etc.). Likewise, **encryption keys** are exported as files. Here’s the clean way to do it:

## What’s possible vs. not

- **Not a dataset:** SCALE does **not** automatically store/replicate the system config in a dataset or the System Dataset. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/systemsettings/general/managesysconfigscale/?utm_source=chatgpt.com)
    
- **Do this instead:** Periodically **save the config file (with Secret Seed)** and place it in a dataset you already back up off-box (or schedule it via TrueCommand). [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/systemsettings/advanced/managesysconfig/?utm_source=chatgpt.com)
    
- **System Dataset ≠ config:** The System Dataset holds logs, reporting DBs, some metadata—not your exported config. Don’t rely on it as your config backup. [TrueNAS Open Enterprise Storage](https://www.truenas.com/community/threads/understanding-the-system-dataset-pool-and-its-default-placement.99010/?utm_source=chatgpt.com)
    

## The practical setup (SCALE 25.10 “Goldeye”)

### A) One-click, manual (UI)

System Settings → **General** → Manage configuration → **Download File** → **Export Password Secret Seed** → Save to `/mnt/POOL/Backups/truenas/` and also offsite. (Secret Seed ensures credentials decrypt after a fresh install.) [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/24.04/scaletutorials/systemsettings/general/managesysconfigscale/?utm_source=chatgpt.com)

### B) Automated to a dataset (cron + shell)

You can script the export so it **writes straight into a dataset** you already replicate/cloud-sync:

```bash
# Example: save dated tar with secret seed + root authorized_keys
# Target folder must exist and be part of your backup plan
FOLDER="/mnt/POOL/Backups/truenas"
mkdir -p "$FOLDER"
midclt call system.config.save '{"secretseed": true, "root_authorized_keys": true}' > "$FOLDER/config-$(date +%F).tar"
```

That command uses the official method (`system.config.save`) and redirects the output into your dataset. Put it in a scheduled **Cron Job** (Tasks → Cron) and keep a few generations. [TrueNAS API+1](https://api.truenas.com/v25.04/api_methods_config.save.html?utm_source=chatgpt.com)

> Prefer a point-and-click scheduler? **TrueCommand** can schedule automatic config backups for SCALE. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/systemsettings/general/managesysconfigscale/?utm_source=chatgpt.com)

### C) Keys (ZFS encryption)

Keys are per-dataset. Export them as files and store alongside the config export (same backup dataset/offsite):

- Storage → Pools → select encrypted dataset → **Export Key** (or **Export All Keys** on the root dataset’s encryption widget in recent SCALE). [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/25.04/scaleuireference/datasets/encryptionuiscale/?utm_source=chatgpt.com)
    

## Boot device is separate

Mirroring the **boot pool** gives you operating-system resilience, but it’s not a substitute for exporting the config and keys. (You can add a second device to mirror the boot pool from System Settings → **Boot**.) [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/mirroringthebootpool/?utm_source=chatgpt.com)

* * *

### TL;DR

- You **can’t** “turn the config into a dataset.”
    
- You **can** automate **exporting** the config to a **file inside a dataset** you already back up (plus export keys). That’s the recommended pattern on SCALE. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/systemsettings/advanced/managesysconfig/?utm_source=chatgpt.com)
    

If you tell me your pool name and where you want the files to live, I’ll hand you a ready-to-paste cron entry and a matching Cloud Sync job plan.

* * *

**You:**

Is there a clumsy way that I could just automate this somehow with the "Data Protection" section of TrueNAS?  I mean it seems like I need this backed up to be able to get my data back

* * *

**ChatGPT:**

Short version: **Yes—indirectly.** Data Protection (snapshots/replication/cloud-sync/rsync) can’t natively “back up the config DB,” but you can make it part of your backup flow in two reliable ways:

## What works (pick 1)

### A) Export → land in a dataset → let Data Protection move it off-box

1. Make a folder you already back up, e.g. `/mnt/POOL/Backups/truenas/`.
    
2. Add a **Cron Job** that exports the config _file_ there (with secrets) so it’s inside ZFS and gets picked up by your normal tasks:
    

```bash
midclt call system.config.save '{"secretseed": true, "root_authorized_keys": true}' > /mnt/POOL/Backups/truenas/config-$(date +%F).tar
```

This uses the supported `system.config.save` API to dump the live config; landing it under `/mnt` means your **Cloud Sync / Replication / Rsync Tasks** can send it to S3/Backblaze/remote NAS on a schedule. [TrueNAS Open Enterprise Storage+2TrueNAS Open Enterprise Storage+2](https://www.truenas.com/docs/scale/23.10/scaleclireference/system/cliconfig/?utm_source=chatgpt.com)

### B) Copy the **built-in daily** config backups into a dataset, then protect that

TrueNAS already makes a daily config snapshot internally (around **03:45**) under `/var/db/system/configs-<uuid>/…` on the system dataset/boot-pool. Add a **Cron Job** to copy the newest file(s) from there into `/mnt/POOL/Backups/truenas/`, and let your existing Data Protection tasks take it from there. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/usingconfigurationbackups/?utm_source=chatgpt.com)

> You can also point an **Rsync Task** directly at a folder (type the path, you don’t have to browse only `/mnt`) if you prefer to push straight from the source path to a remote. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/rsynctasksscale/?utm_source=chatgpt.com)

## Keys & apps (don’t skip)

- **Dataset encryption keys**: there isn’t a Data Protection task that exports them automatically. Use **Storage → Pools → (⋯) Export Dataset Keys** (or per-dataset “Export Key”), then store those files with your config export. The keys live on the boot-pool for auto-unlock; exported copies are your disaster-recovery lifeline. [TrueNAS Community Forums+1](https://forums.truenas.com/t/dataset-encryption-key/49137?utm_source=chatgpt.com)
    
- **Apps**: if you use SCALE Apps, also schedule **Apps → Backups** (plus back up `ix-applications` and any app-data datasets)—Cloud Sync/Rsync/Replication can then move those datasets off-box. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
    

## One clean recipe (copy/paste)

1. Create `/mnt/POOL/Backups/truenas/`.
    
2. Add Cron Job (daily, e.g., 04:00):
    

```bash
set -e
DEST="/mnt/POOL/Backups/truenas"
mkdir -p "$DEST"
# Export live config with secret seed
midclt call system.config.save '{"secretseed": true, "root_authorized_keys": true}' > "$DEST/config-$(date +%F).tar"
# (Optional) also copy the internal nightly backup made around 03:45
latest=$(ls -1t /var/db/system/configs-*/configs/*.db 2>/dev/null | head -n1 || true)
[ -n "$latest" ] && cp -p "$latest" "$DEST/internal-$(date +%F).db"
# keep last 14
ls -1t "$DEST"/config-*.tar "$DEST"/internal-*.db 2>/dev/null | tail -n +15 | xargs -r rm -f
```

3. Add a **Cloud Sync task** (or **Rsync/Replication task**) to ship `/mnt/POOL/Backups/truenas/` off-box on a schedule. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
    

## Alternative: let **TrueCommand** do it

If you run TrueCommand, it has a **Config Backups** button per system with scheduled, one-click backups & restores. Great if you manage multiple boxes. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/truecommand/3.0/userguide/systemmanagement/singlesystem/configbackups/?utm_source=chatgpt.com)

* * *

### Why this works

- The **config is not a dataset**; it’s a DB you **export**. Putting that export **into a dataset** brings it under ZFS snapshots/replication/cloud-sync control. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaletutorials/systemsettings/advanced/managesysconfig/?utm_source=chatgpt.com)
    
- TrueNAS already **auto-backs up** the config internally each night; you’re just **copying** that into a protected place you already back up. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/usingconfigurationbackups/?utm_source=chatgpt.com)
    

If you tell me your pool name and preferred remote (B2/S3/another NAS), I’ll tailor the cron and a Data Protection task plan to your exact setup.

* * *

**You:**

The thing is that all of the datasets in truenas I think are encrypted (not sure how to confirm), and if they are still encrypted then that means we have a chicken in egg problem with the key being in the backed up (to remote backups) and encrypted at the dataset layer storage, so that might be a bad idea right?

* * *

**ChatGPT:**

Great question—and you’re thinking about the risk exactly right.

### The “chicken-and-egg” with encrypted datasets

On TrueNAS SCALE, ZFS **dataset** encryption usually uses a **keyfile** (default). Those keyfiles are stored **in the clear on the boot pool** so the system can auto-unlock your encrypted datasets at boot. If the boot device dies and the **only** copies of your **config export** and **dataset keys** live **inside those encrypted datasets** (and nowhere else), you’ve got a recovery problem. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/community/threads/encryption-of-root-and-sub-dataset-and-cannot-find-button-for-export-dataset-keys.103090/?utm_source=chatgpt.com)

#### What that means for your backup design

- Keeping a copy of the config/keys **inside** a protected dataset is fine for convenience, but you **must also** keep a **separate, boot-pool-independent** copy (USB in a safe, password manager, or cloud with client-side encryption).
    
- If you switch a dataset to **passphrase** (instead of keyfile), it **won’t auto-unlock** on boot; you’ll need to type the passphrase each time. That’s more secure but changes operations. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/community/threads/zfs-encryption-usb-auto-unlock-and-mount-with-pass-phrase-as-i-do-with-gli.96517/?utm_source=chatgpt.com)
    

* * *

### Step 1 — Confirm what’s actually encrypted (and how)

Open a Shell on the NAS and run:

```bash
zfs get -r encryption,keyformat,keylocation,keystatus YOURPOOL
```

- `encryption=on` → dataset is encrypted.
    
- `keyformat=hex` (or `keyfile`) → **auto-unlock** path; key stored on boot pool.
    
- `keyformat=passphrase` → requires manual unlock. (Lock/unlock controls are in the UI.) [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/22.12/scaletutorials/storage/datasets/encryptionscale/?utm_source=chatgpt.com)
    

* * *

### Step 2 — Make a “break-glass” bundle that is **not** inside your encrypted pool

Create and store **three** items **outside** your encrypted datasets:

1. **Config export with Secret Seed**  
    System Settings → General → **Save Config** → check **Include Secret Seed** → download. (The seed lets TrueNAS decrypt saved service creds on another system; protect this file.) [TrueNAS Open Enterprise Storage+2TrueNAS Open Enterprise Storage+2](https://www.truenas.com/docs/scale/scaletutorials/systemsettings/advanced/managesysconfig/?utm_source=chatgpt.com)
    
2. **Exported dataset keys**  
    Storage → Pools → ⋯ → **Export Dataset Keys** (or per-dataset **Export Key**). Save the JSON(s). These are independent of the boot device. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/community/threads/encryption-of-root-and-sub-dataset-and-cannot-find-button-for-export-dataset-keys.103090/?utm_source=chatgpt.com)
    
3. **Optional:** SSH host keys/certs if you need fingerprint continuity (export from Certificates/SSH).
    

Put that bundle on an **offline USB** (in a safe) **and/or** in a **cloud bucket** that uses **client-side encryption** (next step).

* * *

### Step 3 — Let “Data Protection” move routine copies safely (without relying on pool encryption)

You can absolutely use **Data Protection → Cloud Sync**/**Replication** for routine copies—just don’t depend on pool encryption alone for the config/keys:

- Keep your regular scheduled **export** of the config into some dataset (so it’s backed up normally).
    
- **Additionally**, for an independent copy, use **Cloud Sync → Remote Encryption** (TrueNAS wraps rclone crypt) so your config/keys are **encrypted before upload** and stay encrypted **at rest** in the cloud—even if that cloud copy isn’t also under ZFS encryption. [Rclone+3TrueNAS Open Enterprise Storage+3TrueNAS Open Enterprise Storage+3](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
    

> Tip: If you ever need to decrypt those cloud copies off-box, you can use **rclone** directly with the same password/salt. [TrueNAS Open Enterprise Storage](https://www.truenas.com/community/threads/decrypting-cloud-sync-file.98258/?utm_source=chatgpt.com)

* * *

### A safe, simple pattern you can adopt today

1. **Nightly cron** (exports land inside a dataset you already back up):
    

```bash
DEST="/mnt/YOURPOOL/Backups/truenas"
mkdir -p "$DEST"
midclt call system.config.save '{"secretseed": true, "root_authorized_keys": true}' > "$DEST/config-$(date +%F).tar"
```

2. **Monthly “break-glass”**: manually export **dataset keys** (pool ⋯ → Export Dataset Keys) and copy:
    
    - `config-YYYY-MM-DD.tar`
        
    - exported keys JSON
        
    - (optional) certs  
        to a **USB** you keep offline.
        
3. **Cloud Sync (push)** the same folder with **Remote Encryption** enabled so a second copy exists off-site, encrypted client-side. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
    

* * *

### Bottom line

- Your instinct is right: don’t rely solely on “config/keys inside an encrypted dataset.” If the boot device (which holds the auto-unlock material) dies, you need **independent** copies. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/community/threads/encryption-of-root-and-sub-dataset-and-cannot-find-button-for-export-dataset-keys.103090/?utm_source=chatgpt.com)
    
- Keep a **break-glass bundle** (config+seed + exported dataset keys) **outside** the encrypted pool (USB safe / password vault / cloud with client-side encryption).
    
- Use Data Protection for convenience—but treat the independent copy as your true recovery lifeline.

* * *

**You:**

I like the idea of using the "/var/db/system/configs-\<uuid\>/…"  but I can't find it in the Data Protection setup for different backup tasks

* * *

**ChatGPT:**

You’re not crazy—you won’t see `/var/db/system/...` in most **Data Protection** pickers.

### Why it’s hidden

- **Replication** only works on ZFS datasets (things under `/mnt/...`). `/var/...` isn’t a dataset.
    
- **Cloud Sync** (rclone) refuses sources that aren’t inside a pool mount (you’ll get _“path must reside within a pool mount point”_). [Reddit](https://www.reddit.com/r/truenas/comments/1n8becb/cloud_sync_task_for_default_apps_mount_gives/?utm_source=chatgpt.com)
    

Meanwhile, TrueNAS **does** auto-save the config DB nightly around **03:45** into  
`/var/db/system/configs-<UUID>/configs/` (multiple dated copies). [TrueNAS Open Enterprise Storage+2TrueNAS Community Forums+2](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/usingconfigurationbackups/?utm_source=chatgpt.com)

So you have two clean ways to bring those files under Data Protection:

* * *

### Option A (recommended): Copy → /mnt, then let Data Protection move it

1. Make a target folder **inside a dataset** you already back up, e.g. `/mnt/POOL/Backups/truenas/configdb/`.
    
2. Add a **Cron Job** (run at, say, 04:10 to follow the 03:45 internal backup) with:
    

```bash
set -e
DEST="/mnt/POOL/Backups/truenas/configdb"
mkdir -p "$DEST"
# copy latest internal config DB backup(s) from /var to a dataset
latest=$(ls -1t /var/db/system/configs-*/configs/*.db 2>/dev/null | head -n1 || true)
[ -n "$latest" ] && cp -p "$latest" "$DEST/"
# (optional) keep last 30 copies
ls -1t "$DEST"/*.db 2>/dev/null | tail -n +31 | xargs -r rm -f
```

3. Point your **Cloud Sync / Replication / Rsync** task at `/mnt/POOL/Backups/truenas/configdb/`.
    
    - If pushing to cloud, you can enable **Remote Encryption** so files are **encrypted client-side** before upload (rclone crypt). [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
        

> This preserves the internal nightly backup behavior (03:45) and makes it visible to Data Protection because you’ve staged it under `/mnt/...`.

* * *

### Option B: Skip the internal copy; export a fresh config straight into /mnt

Add a **Cron Job** that writes the live config (with secrets) into a dataset you already back up:

```bash
DEST="/mnt/POOL/Backups/truenas/configexport"
mkdir -p "$DEST"
# export current config (with Secret Seed) as a .tar
midclt call core.download "config.save" '[{"secretseed": true, "root_authorized_keys": true}]' "$DEST/config-$(date +%F).tar" >/dev/null
```

That `midclt` form is the supported API-driven export from the shell. Then let Cloud Sync/Replication handle the folder. [TrueNAS Open Enterprise Storage](https://www.truenas.com/community/threads/configuration-backup-from-terminal-within-the-server.106870/?utm_source=chatgpt.com)

* * *

### Can I back up `/var/...` directly with Data Protection?

- **Cloud Sync:** No (source must be under `/mnt`). Use Option A or B. [Reddit](https://www.reddit.com/r/truenas/comments/1n8becb/cloud_sync_task_for_default_apps_mount_gives/?utm_source=chatgpt.com)
    
- **Rsync Task:** Yes, you can set a **local source path** like `/var/db/system/configs-<UUID>/configs/` and push to a remote host—rsync isn’t restricted to `/mnt`. (See TrueNAS rsync task how-to.) [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/dataprotection/rsynctasksscale/?utm_source=chatgpt.com)
    

* * *

### Don’t forget keys + an off-box copy

- TrueNAS auto-backs up the **config DB** nightly, but **you should still export** a copy via **System Settings → General → Manage configuration → Download** (with **Include Secret Seed**) and keep an **independent** off-box copy. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/systemsettings/advanced/managesysconfig/?utm_source=chatgpt.com)
    
- For **encrypted datasets**, export their keys (Storage → Datasets → **Export Key** / pool **Export Dataset Keys**) and store with your off-box bundle. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
    
- If using cloud, enable **Remote Encryption** in Cloud Sync so your config/keys are encrypted before leaving the NAS. You can decrypt later with standard rclone if needed. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/?utm_source=chatgpt.com)
    

* * *

#### TL;DR

You won’t see `/var/db/system/configs-<UUID>` in Data Protection. Copy it into `/mnt/...` (Option A) **or** export the config straight into `/mnt/...` (Option B). Then protect that folder with your usual Cloud Sync/Replication—and keep a separate off-box, client-side-encrypted copy for true disaster recovery. [TrueNAS Open Enterprise Storage+2Reddit+2](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/usingconfigurationbackups/?utm_source=chatgpt.com)

* * *

**You:**

Is it always the case that you can't recover TrueNAS without the boot drive or truenas config?  How do I see which case I am and account for all the nuance

* * *

**ChatGPT:**

Short answer: **No, it’s not always game-over without the boot drive or a saved config.** Whether you can fully recover ranges from “easy” (unencrypted pools) to “impossible” (encrypted pools + no keys). Here’s the quick matrix—and how to tell which case you’re in.

* * *

## What determines recoverability?

### 1) Is your data pool **encrypted**?

- **How to check (CLI):**
    
    ```bash
    zfs get -r encryption,keyformat,keystatus YOURPOOL
    ```
    
    - `encryption=off` → **Unencrypted**.
        
    - `encryption=on` with `keyformat=keyfile`/`hex` → **Key-based** (auto-unlock is typical).
        
    - `keyformat=passphrase` → **Passphrase-based** (manual unlock).  
        In the UI, selecting a dataset shows a ZFS Encryption widget; locked/unlocked state is visible there. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
        

**Why it matters:**

- **Unencrypted pools** can be re-imported after a fresh install even if the boot drive is lost; you’d just recreate services/shares if you don’t have the config. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaletutorials/storage/importpoolscale/?utm_source=chatgpt.com)
    
- **Encrypted pools** require the **key or passphrase**. Users are responsible for backing them up; losing them is effectively catastrophic. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
    

### 2) If encrypted, **how do they unlock?**

- **Key-based (default on SCALE):** keys are stored on the **boot pool** so the system can auto-unlock at boot; they’re also included in the config DB you download. Lose boot + no exported keys/config = trouble. [TrueNAS Open Enterprise Storage](https://www.truenas.com/community/threads/how-to-find-and-save-the-enryption-keys.95931/page-2?utm_source=chatgpt.com)
    
- **Passphrase-based:** boot device isn’t required to unlock; you just need the passphrase. You can switch a dataset from key → passphrase if you want stricter “no auto-unlock” behavior. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/community/threads/encrypted-pool-disable-unlocking-on-boot.94438/?utm_source=chatgpt.com)
    

### 3) Do you have a **config backup** (with **Export Password Secret Seed**)?

- A saved config with the **Secret Seed** lets you restore credentials/secrets on a fresh install, then import pools. Save this off-box. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/gettingstarted/configure/setupbackupscale/?utm_source=chatgpt.com)
    

### 4) Where is the **System Dataset**?

- TrueNAS writes its internal nightly config copies under `/var/db/system/...`. If your **System Dataset** is on a **data pool**, you can sometimes recover a config DB from there after a reinstall; if it was on the boot pool and you lost it, those internal copies are gone. Check/change at **System Settings → Advanced → System Dataset**. [TrueNAS Open Enterprise Storage+2TrueNAS Community Forums+2](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/settingthesystemdataset/?utm_source=chatgpt.com)
    

* * *

## Which case are you?

#### Case A — Unencrypted pool

- **Boot lost, no config?** Reinstall TrueNAS on a new boot device → **Storage → Import Pool**. Data comes back; you’ll recreate shares/users if needed. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaletutorials/storage/importpoolscale/?utm_source=chatgpt.com)
    

#### Case B — Encrypted (key-based auto-unlock)

- **You have exported keys or a config (with seed):** Reinstall → upload config → import pool → datasets auto-unlock. Good. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/usingconfigurationbackups/?utm_source=chatgpt.com)
    
- **No keys and no config:** Boot held the auto-unlock material; without exported keys/passphrases you likely **cannot** decrypt. (This is why exporting keys + config is critical.) [TrueNAS Open Enterprise Storage](https://www.truenas.com/community/threads/how-to-find-and-save-the-enryption-keys.95931/page-2?utm_source=chatgpt.com)
    

#### Case C — Encrypted (passphrase)

- Reinstall → **Import Pool** → **Unlock** with your passphrase → restore services. Boot/config are helpful, but **not required to decrypt**. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
    

#### Case D — You hope the **System Dataset** had a config copy

- If System Dataset was on your data pool, you can sometimes pull a nightly `*.db` from `/var/db/system/configs-*/configs/` after reinstall, then upload that. If it lived on the boot pool you lost, those copies are gone. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/settingthesystemdataset/?utm_source=chatgpt.com)
    

* * *

## Practical “figure-out-my-risk” steps (right now)

1. **Check encryption & unlock mode**
    
    ```bash
    zfs get -r encryption,keyformat,keystatus YOURPOOL
    ```
    
    - If `encryption=off` → you’re in the easy bucket (just keep good config backups).
        
    - If `keyformat=keyfile/hex` → export keys + config ASAP.
        
    - If `keyformat=passphrase` → make sure passphrases are documented offline. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/24.04/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
        
2. **See where the System Dataset lives**  
    Web UI: **System Settings → Advanced → System Dataset** (move it if you prefer). [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/core/13.0/coretutorials/systemconfiguration/settingthesystemdataset/?utm_source=chatgpt.com)
    
3. **Create a break-glass bundle (off-box)**
    
    - **Save Config** (+ **Export Password Secret Seed**).
        
    - **Export Dataset Keys** (pool ⋯ or per-dataset).  
        Store on offline USB and/or client-side-encrypted cloud. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/gettingstarted/configure/setupbackupscale/?utm_source=chatgpt.com)
        
4. **Test import** (once):  
    On a spare boot device/VM, install SCALE → **Upload Config** → **Import Pool** and (if encrypted) **Unlock**. Knowing this works removes all doubt. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaletutorials/storage/importpoolscale/?utm_source=chatgpt.com)
    

* * *

### TL;DR

- You **can** recover without the old boot drive/config if your pool is **unencrypted** (just import).
    
- If it’s **encrypted**, recovery **requires** the **keys or passphrase**; the boot device/config often holds auto-unlock material for key-based setups. Export keys + config **now**, store off-box, and you’re safe. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/24.04/scaletutorials/datasets/encryptionscale/?utm_source=chatgpt.com)
    

If you paste the output of `zfs get -r encryption,keyformat,keystatus YOURPOOL`, I’ll map you 1:1 to the right playbook and give you a minimal checklist for your exact state.

* * *

**You:**

Keep getting lines like "encryption  off          default"

* * *

**ChatGPT:**

Great news: that output means your datasets aren’t encrypted.

When you run `zfs get encryption` you see four columns: **NAME PROPERTY VALUE SOURCE**.  
Seeing `encryption off default` means the dataset’s encryption property is **off**, and that value came from the **default/inherited** source—i.e., no encryption was ever enabled on that dataset. [OpenZFS+2Oracle Docs+2](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-get.8.html?utm_source=chatgpt.com)

Here’s how to double-check thoroughly and what it implies.

* * *

## Verify your exact state

### CLI (fast + exhaustive)

Replace `POOL` with your pool name.

```bash
# See encryption status and where it comes from
zfs get -r -o name,property,value,source encryption POOL

# Show only encrypted datasets (if any)
zfs get -r -o name,property,value,source encryption POOL | awk '$3=="on"{print $1}'

# If you do see any "on", inspect their key details
zfs get -r encryption,keyformat,keylocation,keystatus POOL
```

- If everything shows `encryption off (default|inherited)`, your pool is **unencrypted**.
    
- Encrypted datasets will show `encryption=on` and have `keyformat` (`hex`/`raw`/`passphrase`) and a `keystatus`. (Encryption is enabled **at dataset creation time** and can’t be retro-toggled on for an existing dataset.) [OpenZFS](https://zfsonlinux.org/manpages/0.8.0/man8/zfs.8.html?utm_source=chatgpt.com)
    

### UI (visual confirmation)

Open **Datasets** and click a dataset. If it’s encrypted, you’ll get the **ZFS Encryption** widget with controls like **Export Key**/**Export All Keys** (and lock/unlock on children). Unencrypted datasets won’t show those key export options. [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/scaleuireference/datasets/encryptionuiscale/?utm_source=chatgpt.com)

* * *

## What recovery looks like in each case

- **Unencrypted (your case):** If the boot drive dies, you can reinstall TrueNAS, go to **Storage → Import Pool**, and your data imports without needing keys. A saved **config** just saves you time (users/shares/services), but it’s not required to decrypt anything. [OpenZFS](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-inherit.8.html?utm_source=chatgpt.com)
    
- **Encrypted:** Recovery requires the key/passphrase (and often the saved config makes life easier). Without keys/passphrases, data can’t be unlocked. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/23.10/scaletutorials/storage/datasets/encryptionscale/?utm_source=chatgpt.com)
    

* * *

## If you actually want encryption (optional next step)

Because encryption is set at **creation**, the safe path is to **create a new encrypted dataset** (or pool), then **send/receive** your data into it (or use TrueNAS replication tasks) so it’s encrypted at rest going forward. [Oracle Docs](https://docs.oracle.com/cd/E26502_01/html/E29031/zfs-encrypt-1m.html?utm_source=chatgpt.com)

* * *

## Minimum safety steps to do now

1. **Export config (with Secret Seed):** System Settings → General → **Save Config** → check **Include Secret Seed**. Keep it off-box. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/23.10/scaletutorials/storage/datasets/encryptionscale/?utm_source=chatgpt.com)
    
2. (If you ever enable encryption later) **Export keys** and store them with the config. [TrueNAS Open Enterprise Storage](https://www.truenas.com/docs/scale/scaleuireference/datasets/encryptionuiscale/?utm_source=chatgpt.com)
    

If you paste the one-liner output for `zfs get -r -o name,property,value,source encryption POOL`, I’ll call out any stragglers that are encrypted and tell you exactly what keys you’d need to save.