---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, August 9th 2025, 12:33 pm
date modified: Tuesday, August 12th 2025, 8:54 pm
---

>From GPT 

# Option A (recommended): zfs send/receive

> Briefly stopping HAOS (in my case) or any VM gives you a cleaner copy. If you can’t, you can snapshot live.

```bash
# 0) (optional) stop the LXC for a clean snapshot
incus list            # find the instance name (e.g., "haos")
incus stop haos       # adjust if your instance name differs

# 1) snapshot the Incus zvol
SNAP=export-$(date +%Y%m%d-%H%M)
zfs snapshot personal/.ix-virt/custom/default_haos@$SNAP

# 2) remove the empty target zvol so receive can create it with the right volsize
zfs destroy -R personal/vm/haoszvol

# 3) copy the snapshot into a new zvol at personal/vm/haoszvol
zfs send -w personal/.ix-virt/custom/default_haos@$SNAP | zfs receive -u personal/vm/haoszvol

# 4) (optional) restart your LXC if you stopped it
incus start haos
```

Notes:

- `-w` sends a **raw** stream that preserves holes/sparsity for ZVOLs.
- `-u` receives without trying to “mount” (not relevant to ZVOLs, but safe).
- This creates `personal/vm/haoszvol` with the **same size** and contents as the Incus volume.

* * *

# Option B: block copy with dd (only if target ≥ source size)

If you must keep the existing `haoszvol` and it’s **at least as large** as the source:

```bash
# verify sizes first
zfs get -o value -H volsize personal/.ix-virt/custom/default_haos
zfs get -o value -H volsize personal/vm/haoszvol

# if target is smaller, either enlarge it:
# zfs set volsize=<source-volsize> personal/vm/haoszvol

# snapshot for a consistent read (optional but smart)
SNAP=export-$(date +%Y%m%d-%H%M)
zfs snapshot personal/.ix-virt/custom/default_haos@$SNAP

# copy blocks
dd if=/dev/zvol/personal/.ix-virt/custom/default_haos@$SNAP \
   of=/dev/zvol/personal/vm/haoszvol bs=1M status=progress conv=sync
```

* * *

# Create the VM (GUI)

1. **Virtualization → VMs → Add**
2. Name: `HAOS-VM`; CPU/RAM: e.g., 2 vCPU / 2–4 GiB.
3. **Disks → Add → Use existing disk image** → pick `personal/vm/haoszvol`.
    - Try **VirtIO** disk bus first; if it won’t boot, switch to **SATA/AHCI**.
4. **NIC → Add → Bridged** (same LAN behavior as your LXC).
5. Save → Start → watch **Serial Console**.

* * *

# Quick sanity checks

```bash
# list the resulting zvols
zfs list -t volume personal/vm/haoszvol personal/.ix-virt/custom/default_haos

# peek at the target’s contents type
file -s /dev/zvol/personal/vm/haoszvol
```

* * *