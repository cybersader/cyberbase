---
aliases: []
tags: []
publish: true
permalink:
date created: Sunday, December 15th 2024, 11:40 am
date modified: Sunday, December 15th 2024, 5:26 pm
---

> [!info] Why VLANs?
> Tad bit of security, but easier firewall rule setting and easier networking as you scale and need to troubleshoot complex problems.  Ultimately, subnetting + some not-foolproof security

# TL;DR - Handling VLANs

- 3 ways to put your devices (clients/PCs/phones) into different VLANs
	- For ethernet - by the port they are plugged into on the switch
	- For Wi-Fi - 
		- by SSID (Main wifi vs. Guest wifi) with separate SSIDs whether on the same or different access points.  Users are essentially broken up by knowing the right wifi password.  The wireless access point has to allow this to tag different SSIDs with different VLAN tags (specifies which VLAN the traffic is logically/virtually on).
		- by MAC address - not nearly as secure but great for convenience factor.  It's not as easy to set up though.

- VLAN-Aware devices (access points, switches, routers) vs. NOT VLAN-Aware networking (whether real appliances or virtual)
	- You can have a default (untagged) VLAN for devices that do not present VLAN tags. On a trunk (tagged) port, one VLAN is typically designated as “native” or untagged. Traffic without VLAN tags on that port is associated with this native VLAN, effectively acting as a fallback network for non-VLAN-aware devices.
	- When you configure a port to carry multiple VLANs (a trunk), you usually have one VLAN that is untagged—often called the **native VLAN**. On enterprise switches, this is a common concept. The native VLAN serves as the "default" network for any traffic arriving on that port without a VLAN tag. On Netgate appliances, you achieve a similar configuration by assigning a VLAN ID as the PVID (Port VLAN ID) and making it the untagged VLAN on that port.
	- If your access points don't allow setting VLANs (VLAN tags) based on different wireless SSIDs, then maybe try the MAC address-based approach from within Pfsense

# PfSense

```
I'm a bit confused on what to configure in each dashboard. I'm trying to set up...potentially a physically separated type system at layer 2 or at least understand how to do it. The netgate 2100 comes with the marvel switch.

- Interfaces > Switch > VLANs
- Interfaces > VLANs (I have the below ones)
- mvneta0 (wan) 10 DMZ
- mvneta0 (wan) 30 HOME_LAB
- mvneta0 (wan) 20 INTERNAL
- Interfaces > Interface Assignments

WAN - mvneta0 (90:ec:77:91:13:56)
LAN - mvneta1 (90:ec:77:91:13:57)
OPT1 - VLAN 10 on mvneta0 - wan (DMZ)
OPT2 - VLAN 20 on mvneta0 - wan (INTERNAL)
OPT3 - VLAN 30 on mvneta0 - wan (HOME_LAB)

I'm trying to understand how to break up the physical ports on the netgate switch and use that in combination (or not in combination) with VLANs
```

- [(13) Basic Setup and Configuring pfsense Firewall Rules For Home - YouTube](https://www.youtube.com/watch?v=bjr0rm93uVA)

- [VLAN Configuration | pfSense Documentation](https://docs.netgate.com/pfsense/en/latest/vlan/configuration.html#web-interface-vlan-configuration)
- [VLANs with the Netgate 2100 - My experience : r/PFSENSE](https://www.reddit.com/r/PFSENSE/comments/u1qkkf/vlans_with_the_netgate_2100_my_experience/)
	- [Netgate 2100 VLAN Configuration | Linux & Cybersecurity in South Australia with AGIX](https://agix.com.au/netgate-2100-vlan-configuration/)
- [How to Set Up a DMZ in pfSense in 2024 - WunderTech](https://www.wundertech.net/how-to-set-up-a-dmz-in-pfsense/)
- [let’s subnet your home network // You SUCK at subnetting // EP 6 - YouTube](https://www.youtube.com/watch?v=mJ_5qeqGOaI&list=WL&index=5&t=91s "let’s subnet your home network // You SUCK at subnetting // EP 6 - YouTube")
- [How to structure networks with VLANs - YouTube](https://www.youtube.com/watch?v=lhrlrvVZnII&list=WL&index=6 "How to structure networks with VLANs - YouTube")
- [What is a VLAN??? - How to setup VLANs in your Home Network and WHY YOU NEED THEM - YouTube](https://www.youtube.com/watch?v=XdqP14NclZ0&list=WL&index=7 "What is a VLAN??? - How to setup VLANs in your Home Network and WHY YOU NEED THEM - YouTube")
- [Setting up VLANs in pfSense - YouTube](https://www.youtube.com/watch?v=rHE6MCL4Gz8&list=WL&index=8 "Setting up VLANs in pfSense - YouTube")
- [Configuring the Switch Ports | Netgate Documentation](https://docs.netgate.com/pfsense/en/latest/solutions/netgate-2100/configuring-the-switch-ports.html)
- [(1) SG-1100 VLAN Switch Configuration - YouTube | Lawrence Tech](https://www.youtube.com/watch?v=Bp_B79-WLlU)
- [(13) Easy VLAN Configuration in PFSense with DHCP, Firewall, and Switch Examples - YouTube](https://www.youtube.com/watch?v=NihE2u3zBlw)
- [(13) How To Setup VLANs With pfsense & UniFi 2023 - YouTube](https://www.youtube.com/watch?v=WMyz7SVlrgc&t=178s)

- What is OPT?
	- [Configuring an OPT interface as an additional WAN | Netgate Documentation](https://docs.netgate.com/pfsense/en/latest/solutions/netgate-2100/opt-wan.html)
	- "Optional" interface

- [Configuring the Switch Ports | Netgate Documentation](https://docs.netgate.com/pfsense/en/latest/solutions/netgate-2100/configuring-the-switch-ports.html)

- Access Ports (untagged) vs Trunk Ports (tagged VLANs)
	- Access Port (untagged):
		- Adds a VLAN tag to inbound untagged traffic
	- Trunk Port (tagged VLANs):
		- Allows tagged traffic containing specified VLAN IDs

Interfaces > Switch > VLANs:

| VLAN group | Port | Members | Description         |
| ---------- | ---- | ------- | ------------------- |
| 1          | 1    | 2,3,4,5 | Default System VLAN |
| 2          | 2    | 1,3,4,5 | Default System VLAN |
| 3          | 3    | 1,2,4,5 | Default System VLAN |
| 4          | 4    | 1,2,3,5 | Default System VLAN |
| 5          | 5    | 1,2,3,4 | Default System VLAN |

- 802.1q VLAN mode - guessing this is what implements the tagging of VLANs
	- 802.1Q, also known as Dot1q, is a networking standard that defines how to create virtual local area networks (VLANs) on an Ethernet network. It's the most common method for VLAN tagging and is used by many vendors.

- [Configuring the Switch Ports | Netgate Documentation](https://docs.netgate.com/pfsense/en/latest/solutions/netgate-2100/configuring-the-switch-ports.html)
	- Enable 802.1q
	- [Switch Overview | Netgate Documentation](https://docs.netgate.com/pfsense/en/latest/solutions/netgate-2100/switch-overview.html#q-vlan-mode)
- [(13) Easy VLAN Configuration in PFSense with DHCP, Firewall, and Switch Examples - YouTube](https://www.youtube.com/watch?v=NihE2u3zBlw)
	- Port 0 not showing on Interfaces > Switch > Ports

- The approach
	- Interfaces > Switch > VLANs
		- (managed netgear switch 2100)
		- 
## MAC Based VLANs and RADIUS on Pfsense

- [Assign mac addresses to specific vLANs : r/PFSENSE](https://www.reddit.com/r/PFSENSE/comments/szj5g4/assign_mac_addresses_to_specific_vlans/)
- [(13) How To Configure FreeRadius on pfsense and static assign IP addresses to VPN users - YouTube](https://www.youtube.com/watch?v=jEK-O3U3gdg)s