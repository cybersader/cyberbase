---
title: Wifi Mode Explanation
aliases: 
date created: Tuesday, May 13th 2025, 9:03 pm
domain: chatgpt.com
source: 
tags:
  - clippings
  - clippings/chatgpt
  - wifi_modes
  - ac
  - n
  - a
  - legacy
  - compatibility
  - performance
  - 5ghz
  - mixed_mode
  - backwards_compatibility
  - wifi
  - wireless
  - protocols
ai_model: 
author:
  - ChatGPT
  - Cybersader
---

**User:**

I see this setting for wifi and I'm confused i think it has to do it with 802.11. ac n/ac a/n/ac n

---

**AI:**

These modes control which 802.11 standards your 5 GHz radio will accept. Here’s what each one means:

- **ac**
	- Only allows 802.11 ac clients
	- Uses VHT (Very High Throughput) features—80 MHz (or 160 MHz) channels, MU‑MIMO
	- Maximum raw PHY rate up to multiple Gbps
	- ▶ **Pure‑AC mode: best performance if all your devices support 802.11 ac.**
- **n/ac**
	- Allows both 802.11 n **and** 802.11 ac clients
	- Falls back to HT (High Throughput) 40 MHz channels and MIMO for N devices
	- Mixed‑mode overhead when N devices are present, but you keep compatibility
	- ▶ **Good balance** if you have a mix of N‑only and AC‑capable devices.
- **a/n/ac**
	- Allows 802.11 a, **n**, and **ac** clients
	- 802.11 a is the original 5 GHz standard (up to 54 Mbps)
	- Use this if you have very old “a / n” equipment that wouldn’t even speak plain N
	- ▶ **Maximum backwards‑compatibility** at the cost of a bit more management overhead.
- **n**
	- Only allows 802.11 n clients on 5 GHz
	- HT 20 MHz or 40 MHz channels, up to ~600 Mbps raw PHY rate
	- ▶ **Pure‑N mode**: you’ll lose AC‑only device speeds, but avoid any AC‑related overhead.

---

### When to pick which mode?

1. **All‑AC environment** → **ac** (highest throughput, lowest legacy overhead)
2. **Mixed N + AC devices** → **n/ac** (most common today)
3. **Need to support really old 5 GHz hardware** → **a/n/ac**
4. **Only older N‑capable gear** → **n**

---

#### A quick reference table

| Mode | Supported PHYs | Max PHY rate (theoretical) | Frequency | Notes |
| --- | --- | --- | --- | --- |
| **ac** | 802.11ac | \>1 Gbps | 5 GHz | Highest speed, AC‑only devices |
| **n/ac** | 802.11n + 802.11ac | ~600 Mbps (N), >1 Gbps (AC) | 5 GHz | Best mix of legacy and new |
| **a/n/ac** | 802.11a + n + ac | 54 Mbps (A), ~600 Mbps (N), >1 Gbps (AC) | 5 GHz | Supports very old 5 GHz “a” clients |
| **n** | 802.11n | ~600 Mbps | 5 GHz | No AC‑only devices, pure N speeds |

---

**Tip:** if you also have a 2.4 GHz radio, it will typically run in **b/g/n** or **g/n** mode—those are the legacy standards for that band. Splitting your SSIDs by band (e.g. “MyWiFi‑2.4” vs. “MyWiFi‑5”) and picking the appropriate mode on each lets you optimize compatibility and performance.

**User:**

okay what is g/n or b/g/n

---

**AI:**

These are the mixed‑mode settings you’ll find on the 2.4 GHz radio, and they work just like the 5 GHz ones but for the older b/g/n standards:

- **b**
	- Only 802.11 b clients (DSSS, up to 11 Mbps)
	- Very tolerant of interference but **extremely** low throughput
	- ▶ **Legacy‑only**, mostly obsolete today.
- **g**
	- Only 802.11 g clients (OFDM, up to 54 Mbps)
	- Better speeds than “b” but still subject to 2.4 GHz noise
	- ▶ **Pure‑G mode**: use if you have no N devices and want to avoid N overhead.
- **n**
	- Only 802.11 n clients (HT, MIMO, 20 MHz or 40 MHz channels)
	- Theoretical up to ~150 Mbps per spatial stream (so ~300 Mbps for 2×2 MIMO)
	- ▶ **Pure‑N mode**: highest 2.4 GHz speeds, but 40 MHz channels can interfere with neighbors.
- **g/n**
	- Allows both G and N devices
	- Falls back to HT rates for N clients, OFDM for G clients
	- Mixed‑mode protection overhead when G clients are present
	- ▶ **Good compromise** if you have mostly N devices but a few G‑only gadgets.
- **b/g/n**
	- Allows B, G, and N clients
	- Supports the widest range of legacy hardware
	- **Biggest** performance hit: every B or G client forces legacy‑protection preambles
	- ▶ **Maximum backwards‑compatibility**; only use if absolutely necessary.

---

### When to choose which:

1. **All modern devices (N‑capable)** → **n** (best throughput on 2.4 GHz)
2. **Mostly N plus a couple G‑only** → **g/n**
3. **Need to support very old B devices** → **b/g/n**
4. **Only have G‑capable gear** → **g**
5. **Only B‑type legacy clients** → **b** (very rare today)

---

### Quick reference table

| Mode | PHYs supported | Max PHY rate | Notes |
| --- | --- | --- | --- |
| **b** | 802.11 b | 11 Mbps | Oldest, DSSS, large coverage but tiny bandwidth. |
| **g** | 802.11 g | 54 Mbps | OFDM, decent speed, still interference‑prone. |
| **n** | 802.11 n | ~150 – 600 Mbps | HT/MIMO; 40 MHz channels risk more neighbor clash. |
| **g/n** | 802.11 g + 802.11 n | Mixed | N speeds when possible, G fallback for old devices. |
| **b/g/n** | 802.11 b + g + n | Mixed | Full legacy support, highest management overhead. |

> **Tip:** On 2.4 GHz you’re limited to three non‑overlapping 20 MHz channels. Using 40 MHz for N can double speed but often causes more interference in dense areas—so many opt for pure **n** with 20 MHz or a **g/n** mix rather than full 40 MHz.