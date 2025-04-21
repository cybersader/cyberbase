---
title: "Home Lab - VLAN setup in pfSense"
aliases:
date created: Sunday, April 20th 2025, 8:36 pm
domain: "chatgpt.com"
source:
tags:
  - "clippings"
  - "clippings/chatgpt"
  - "add_tags_related_to_the_video._use_a_comma_separated_list_like_`tag1"
  - "tag2"
  - "tag3`._tags_can't_have_spaces_in_the_name_use_underscores_or_snake_case_instead_of_spaces._use_nested_tags_for_ontologies_like_`parent/child`"
ai_model:
author:
  - "ChatGPT"
  - "Cybersader"
---

**User:**

Where does /24 fit into 192.168.1.1 and the network that's on? I'm trying to build VLANs and things in pfsense

---

**AI:**

The `/24` in `192.168.1.1/24` represents the **subnet mask** and determines how many IP addresses are in that network. Let’s break it down:

### What `/24` Means

- `/24` is shorthand for a subnet mask of `255.255.255.0`.
- This means the first 24 bits (3 octets) of the IP address are the **network portion**, and the last 8 bits are available for **host addresses**.

### How It Fits into `192.168.1.1`

- `192.168.1.1` is the **default gateway** or a specific device IP in the network.
- With `/24`, the network range is from `192.168.1.0` to `192.168.1.255`, where:
	- `192.168.1.0` is the **network address** (not assignable to a host).
	- `192.168.1.255` is the **broadcast address** (not assignable to a host).
	- Usable IP addresses for devices are `192.168.1.1` to `192.168.1.254`.

### Why This Matters for VLANs in pfSense

When building VLANs, you assign unique subnets to each VLAN. For example:

- VLAN 10: `192.168.10.0/24`
- VLAN 20: `192.168.20.0/24`
- VLAN 30: `192.168.30.0/24`

Each VLAN must have:

1. **A unique network range:** Ensure no overlap between VLAN subnets.
2. **A gateway in each VLAN:** pfSense assigns an IP (e.g., `192.168.10.1/24`) as the gateway for that VLAN.

### Steps to Build VLANs in pfSense

1. **Define VLANs:**
	- Go to **Interfaces > Assignments > VLANs**.
	- Add VLANs with unique tags (e.g., VLAN 10 = Tag 10).
2. **Assign Interfaces:**
	- Assign VLANs to the parent interface (e.g., `em0`).
3. **Set IPs:**
	- Go to **Interfaces > \[VLAN Interface\]** and assign a static IP (e.g., `192.168.10.1/24` for VLAN 10).
4. **Set DHCP:**
	- Enable DHCP for each VLAN if needed.
5. **Configure Firewall Rules:**
	- Go to **Firewall > Rules > \[VLAN Interface\]** and allow traffic as required (e.g., VLAN to VLAN or VLAN to WAN).

### Example Configuration

| VLAN | Network | Subnet Mask | Gateway |
| --- | --- | --- | --- |
| 10 | 192.168.10.0/24 | 255.255.255.0 | 192.168.10.1 |
| 20 | 192.168.20.0/24 | 255.255.255.0 | 192.168.20.1 |
| 30 | 192.168.30.0/24 | 255.255.255.0 | 192.168.30.1 |

You can now assign devices to the VLANs via their network settings or by configuring a managed switch with VLAN tagging.

Let me know if you need help with VLAN tagging on switches or specific pfSense setups!

**User:**

I'm a bit confused on what to configure in each dashboard. I'm trying to set up...potentially a physically separated type system at layer 2 or at least understand how to do it. The netgate 2100 comes with the marvel switch. - Interfaces > Switch > VLANs - Interfaces > VLANs (I have the below ones) - mvneta0 (wan) 10 DMZ - mvneta0 (wan) 30 HOME\_LAB - mvneta0 (wan) 20 INTERNAL - Interfaces > Interface Assignments Interface Network port WAN - mvneta0 (90:ec:77:91:13:56) LAN - mvneta1 (90:ec:77:91:13:57) OPT1 - VLAN 10 on mvneta0 - wan (DMZ) OPT2 - VLAN 20 on mvneta0 - wan (INTERNAL) OPT3 - VLAN 30 on mvneta0 - wan (HOME\_LAB) I'm trying to understand how to break up the physical ports on the netgate switch and use that in combination (or not in combination) with VLANs

---

**AI:**

To achieve a Layer 2 separation using the Netgate 2100 with VLANs and physical ports, you need to work through the configuration systematically. Here's an explanation of how to set this up using the **Netgate 2100's Marvell switch** and **pfSense dashboards**:

---

### **Key Concepts**

1. **Marvell Switch**:
	- The Netgate 2100 has an integrated switch that operates at Layer 2.
	- Ports on the switch can be configured to work as access ports (untagged) or trunk ports (tagged VLANs).
	- VLANs allow traffic segmentation even when sharing physical links.
2. **VLANs**:
	- You’ve created VLANs on the `mvneta0` interface (WAN port).
	- These VLANs logically separate traffic within the Marvell switch and across the router.
3. **Physical Ports**:
	- The Netgate 2100 has specific physical ports connected to the Marvell switch. Each port can be assigned to a VLAN or configured as a trunk to carry multiple VLANs.
4. **Interface Assignments**:
	- In pfSense, each VLAN must be assigned to an interface for routing, firewall rules, and other Layer 3 functions.

---

### **Goals**

- Break up the physical ports to match specific VLANs.
- Use VLAN tagging on trunk ports if you want multiple VLANs on the same port.
- Optionally, configure ports as access ports for a single VLAN.

---

### **Step-by-Step Configuration**

#### 1\. **Interfaces > Switch > VLANs**

This is where you configure the Marvell switch to map VLANs to physical ports:

- **VLAN Creation**:
	- Go to **Interfaces > Switch > VLANs**.
	- Create entries for VLANs 10 (DMZ), 20 (INTERNAL), and 30 (HOME\_LAB).
	- Assign physical ports to each VLAN based on your desired setup:
		- **Access Port**: Assign a single VLAN to a port (untagged traffic).
		- **Trunk Port**: Allow multiple VLANs on a port (tagged traffic).

Example:

| VLAN ID | Ports (Access/Untagged) | Ports (Tagged) |
| --- | --- | --- |
| 10 | Port 1 (Access) | Port 2 (Trunk) |
| 20 | Port 3 (Access) | Port 2 (Trunk) |
| 30 | Port 4 (Access) | Port 2 (Trunk) |

- Assign VLAN tags to appropriate ports:
	- For a trunk port (e.g., Port 2), mark all VLANs (10, 20, 30) as tagged.
	- For access ports (e.g., Port 1, Port 3, Port 4), assign only one VLAN and mark it as untagged.

---

#### 2\. **Interfaces > VLANs**

You’ve already configured VLANs on `mvneta0` (WAN). Verify these steps:

- VLANs 10, 20, and 30 should exist, associated with `mvneta0`:
	- VLAN 10 (DMZ): `mvneta0.10`
	- VLAN 20 (INTERNAL): `mvneta0.20`
	- VLAN 30 (HOME\_LAB): `mvneta0.30`

---

#### 3\. **Interfaces > Interface Assignments**

Each VLAN must be assigned to an interface:

- Assign VLANs to the **OPT** interfaces:
	- OPT1 = VLAN 10 (DMZ)
	- OPT2 = VLAN 20 (INTERNAL)
	- OPT3 = VLAN 30 (HOME\_LAB)
- Apply and enable these interfaces.
- Assign static IPs to each VLAN interface for routing (e.g., `192.168.10.1/24` for DMZ).

---

#### 4\. **Configure Physical Port Behavior**

In **Interfaces > Switch > Ports**:

- Define the role of each physical port:
	- **Access Ports**: Assign a VLAN to a specific port for devices that don't support VLAN tagging.
	- **Trunk Ports**: Allow multiple VLANs on a port for uplinks to managed switches or devices supporting VLAN tagging.

Example:

| Port | Function | VLAN Configuration |
| --- | --- | --- |
| 1 | Access | Untagged VLAN 10 |
| 2 | Trunk | Tagged VLANs 10, 20, 30 |
| 3 | Access | Untagged VLAN 20 |
| 4 | Access | Untagged VLAN 30 |

---

#### 5\. **Configure DHCP and Firewall Rules**

- Go to **Services > DHCP Server** and enable DHCP for each VLAN interface.
- Go to **Firewall > Rules** and define rules for each VLAN:
	- Allow traffic within VLANs or to specific destinations (e.g., WAN).
	- Isolate VLANs from each other unless explicitly allowed.

---

### **Physical and VLAN Isolation Options**

#### **Option 1: Fully Physically Separated VLANs**

Each physical port is tied to a specific VLAN (access port). Devices are isolated based on physical connection.

#### **Option 2: Mixed Physical and VLAN Separation**

Use a trunk port (e.g., Port 2) to carry all VLANs to a managed switch. At the switch:

- Break VLANs into separate physical ports or leave them tagged for VLAN-aware devices.

#### **Option 3: VLAN-Only Isolation**

All devices connect to a single trunk port and are assigned VLANs based on tagging (requires VLAN-aware devices).

---

### **Final Tips**

- Start simple: Assign VLANs to physical ports as access ports and verify connectivity.
- Gradually add complexity: Use trunk ports for uplinks to managed switches or VLAN-aware devices.
- Document your VLAN-port mapping for clarity.

Let me know if you need help configuring specific parts!

**User:**

Interfaces > Switch > VLANs looks like what's below instead. I'm confused on the sequence of setup here | VLAN group | Port | Members | Description | | ---------- | ---- | ------- | ------------------- | | 1 | 1 | 2,3,4,5 | Default System VLAN | | 2 | 2 | 1,3,4,5 | Default System VLAN | | 3 | 3 | 1,2,4,5 | Default System VLAN | | 4 | 4 | 1,2,3,5 | Default System VLAN | | 5 | 5 | 1,2,3,4 | Default System VLAN |

---

**AI:**

The display you’re seeing under **Interfaces > Switch > VLANs** on the Netgate 2100 is showing the default, built-in VLAN configuration for its internal switch. The Netgate 2100 (and 1100) have an integrated Marvell switch chip, and the initial view can be confusing because it doesn’t present VLANs in the same way as other managed switches or the pfSense software VLANs page.

**What You Are Seeing:**  
The table:

| VLAN group | Port | Members | Description |
| --- | --- | --- | --- |
| 1 | 1 | 2,3,4,5 | Default System VLAN |
| 2 | 2 | 1,3,4,5 | Default System VLAN |
| 3 | 3 | 1,2,4,5 | Default System VLAN |
| 4 | 4 | 1,2,3,5 | Default System VLAN |
| 5 | 5 | 1,2,3,4 | Default System VLAN |

These are the default VLAN groups representing how all ports are currently associated with each other before you create and customize your own VLANs. By default, all ports are effectively in a single broadcast domain (the default VLAN).

---

### The Basic Sequence of Setup

1. **Create VLAN Interfaces on pfSense (Layer 3):**  
	Go to **Interfaces > VLANs** in pfSense and create the VLANs you need on the correct parent interface (for the Netgate 2100, that's typically `mvneta0` for WAN-side or `mvneta1` for LAN-side, depending on the hardware model and how you plan to use them).
	- For example, create:
		- VLAN 10 (Tag 10) on `mvneta0`
		- VLAN 20 (Tag 20) on `mvneta0`
		- VLAN 30 (Tag 30) on `mvneta0`
	After adding them, you should see entries like:
	- `VLAN 10 on mvneta0`
	- `VLAN 20 on mvneta0`
	- `VLAN 30 on mvneta0`
2. **Assign These VLAN Interfaces to pfSense Interfaces:** Go to **Interfaces > Interface Assignments** and assign each of the newly created VLANs to an interface (e.g., OPT1 = VLAN 10 on mvneta0, OPT2 = VLAN 20, etc.).  
	Give each interface a static IP address and enable DHCP if needed.
3. **Configure the Switch (Layer 2) for Those VLANs:** Now go to **Interfaces > Switch > VLANs** to configure the Marvell switch chip. Here, you’ll **add new VLAN entries** that match the VLAN IDs you created under Interfaces > VLANs. This is the key step to actually create the VLANs on the hardware switch ports.
	- Click the **Add** button (usually at the bottom or top of the page) to create a new VLAN entry.
	- For VLAN 10 (DMZ), set the VLAN ID to 10.
	- Assign ports to this VLAN.
		- Typically, you must include the CPU (router) port (the internal port connecting the switch to pfSense) as a **tagged** member, because pfSense expects tagged traffic for VLANs.
		- Any port that should be untagged into this VLAN (like a PC or a server port) should be added as an **untagged member**. Only one VLAN can be untagged on a given port.
		- If the port is a trunk going to another VLAN-aware switch, set it as tagged for all VLANs that will traverse it.
	Repeat these steps for VLAN 20 and VLAN 30.
	After creating these VLANs, you’ll see a new table where each VLAN entry shows which ports are tagged and untagged. This replaces the default system VLAN configuration as you define your own network segmentation.
4. **Adjust Port Configuration (If Required):** In **Interfaces > Switch > Ports**, you can set each port’s PVID (Port VLAN ID) and confirm tagging modes:
	- The PVID is the VLAN assigned to untagged traffic entering that port.
	- If the port is an access port for VLAN 20, set its PVID to 20 and make sure only VLAN 20 is untagged there.
	- If the port is a trunk, ensure it’s tagged for VLANs 10, 20, and 30, and set a PVID for the native VLAN if needed.
5. **Firewall and DHCP Configuration:** In **Services > DHCP Server**, enable DHCP on each VLAN interface if you want automatic address assignment.  
	In **Firewall > Rules**, create rules for each VLAN interface to control how traffic flows between VLANs and to the WAN.

---

### Important Notes

- **The CPU or Router Port Must Be Tagged:**  
	For pfSense to communicate with the VLANs, the internal link from the switch to the router (often referred to as the CPU port) must carry VLAN tags. Ensure the CPU port is a tagged member of each VLAN you create.
- **Default VLAN (VLAN 1 or System VLAN):**  
	The default entries you see at first are the switch’s initial configuration. Once you start adding and assigning your own VLANs, you’ll override this default setup. Eventually, you’ll remove or reconfigure the default VLAN membership so that only the VLANs you’ve created are relevant.
- **Documentation and Reference:**  
	The Netgate documentation for the 2100 or 1100 provides step-by-step instructions. Consider referring to those resources as they often have examples and screenshots that align with the device’s unique switch configuration process.

---

**Bottom Line:**  
Right now, you’re looking at the switch’s default VLAN configuration. You need to create your custom VLANs (ID 10, 20, 30, etc.), assign them to the right ports as tagged/untagged, and ensure the CPU port is tagged in all VLANs. Once done, your VLAN interfaces on pfSense will match the switch VLAN settings, giving you the logical Layer 2 and Layer 3 separation you’re aiming for.

**User:**

I had to check the button to enable 802.1q and then now I've got the VLAN group 0 with VLAN tag 1 with 1,2,3,4,5 (members). When I click "add tag" now I can add a VLAN tag, description, and members, and check it as "tagged" or not. So this must be the connection to the logical VLAN stuff I added with "interfaces." It's really confusing with all of the terms they throw around. How do I move forward now and get these things set up? I'm also not sure, with the interfaces, how to set up the subnets correctly. The goal here is to let my xbox communicate out to the internet with UPnP and all that enabled and separate it from all the other stuff on my home net. The issue is that I have my port 4 on the netgate switch attached to the only access point I have for everything to connect to. I want to know the difference on how to separate things with VLANs completely or logically while they're on the same port (i'm assuming that's possible) as with the access point.

---

**AI:**

You're correct that the configuration on the Netgate 2100’s integrated switch can be confusing at first—especially because it’s different from a traditional managed switch interface. Let’s break down the steps and concepts, then we’ll walk through a specific scenario that matches your goal (isolating your Xbox for UPnP and internet access, separate from the rest of your home network).

### Understanding the Terms and Workflow

1. **802.1Q (VLAN Tagging):**  
	Enabling 802.1Q on the switch allows you to add VLANs, each identified by a unique VLAN ID/tag (like VLAN 10, VLAN 20, etc.). This is what you’ve done by checking the button to enable 802.1q.
2. **Switch VLAN Configuration vs. pfSense VLAN Interfaces:**
	- **Switch Level (Layer 2):**  
		Here you define VLAN tags and how they map to physical ports. You decide which ports are "tagged" or "untagged" members of a VLAN.
		- **Tagged port:** The port passes traffic with VLAN tags intact. This is used for trunk ports or connections to VLAN-aware devices.
		- **Untagged port:** The port strips VLAN tags and presents the traffic as plain Ethernet. Typically used for connecting non-VLAN aware devices or making a port "belong" to one VLAN.
	- **pfSense Level (Layer 3):**  
		Within pfSense, you create **VLAN interfaces** based on the VLAN tags you defined. Each VLAN interface gets its own subnet and can have DHCP, firewall rules, etc.  
		For example:
		- VLAN 10 interface might be assigned 192.168.10.1/24.
		- VLAN 20 interface might be assigned 192.168.20.1/24.
		pfSense will route between these VLANs (if allowed by the firewall rules).
3. **Subnets and VLANs:**  
	Each VLAN generally corresponds to its own subnet. This provides logical separation at Layer 3. You have something like:
	- VLAN 10: 192.168.10.0/24
	- VLAN 20: 192.168.20.0/24
	- VLAN 30: 192.168.30.0/24
	With separate subnets, you can enforce isolation and unique firewall rules between networks.

### Your Goal: Isolate the Xbox

- **Scenario:**  
	You have one physical port (say port 4 on the Netgate 2100’s switch) going to your single access point. Everything currently connects to the same SSID/network via that AP. You want to isolate the Xbox on its own VLAN and subnet, separate from your "normal" home network, but still allow it internet access and UPnP for gaming.
- **Key Consideration:**  
	To separate devices on the same physical AP port, you need that AP to be **VLAN-aware** (i.e., it can handle multiple SSIDs mapped to different VLANs). If the AP can broadcast multiple SSIDs, each SSID can be associated with a different VLAN tag. Devices connecting to SSID "XBOX" end up in VLAN 40, for example, while other SSIDs connect to VLAN 20.
	If your AP is not VLAN-capable, then logically splitting devices on the same port is not possible. You would need either:
	- A managed switch or AP that supports VLAN tagging.
	- Or physically separate the Xbox by plugging it directly into a dedicated port configured as an untagged access port on its own VLAN.

### Step-by-Step Setup

1. **Decide on a VLAN ID for the Xbox**  
	Let’s say you choose **VLAN 40** for the Xbox network.
2. **In pfSense (Interfaces > VLANs):**
	- Add a new VLAN with the Tag = 40 on the parent interface that goes to the switch (usually `mvneta0` or `mvneta1` depending on your setup).
	- Click Save and then Apply Changes.
3. **Interface Assignments:**
	- Go to **Interfaces > Assignments** and assign the newly created `VLAN 40 on mvnetaX` to an OPT interface. For example, call it "XBOX\_NET".
	- Enable that interface and give it a static IP like `192.168.40.1/24`.
	- Enable DHCP on that interface if you want the Xbox to get an IP automatically.
4. **Switch Configuration (Interfaces > Switch > VLANs):**  
	Now that 802.1q is enabled, click "Add tag" to create your custom VLAN:
	- VLAN Tag: 40
	- Description: XBOX\_NET
	- Members:
		- The CPU port (often shown as `portX` representing the internal connection to pfSense) should be **tagged**. This ensures VLAN 40 traffic can travel to/from pfSense.
		- If your AP supports VLAN tagging, set the port connected to the AP as **tagged** for VLAN 40. This tells the switch to send VLAN 40 traffic with a tag down that link.
	If your AP does not support VLANs, you can’t logically separate the Xbox on the same SSID. You’d need to:
	- Make port 4 untagged VLAN 40 only, and plug the Xbox in directly. (This physically isolates the Xbox into its own network.)
	- Or upgrade to a VLAN-capable AP.
5. **AP Configuration (If VLAN-aware):**
	- On your AP, create a new SSID called "XBOX" and configure its VLAN to 40.
	- Connecting the Xbox to the "XBOX" SSID will place it into VLAN 40.
6. **Firewall Rules:**  
	Go to **Firewall > Rules > \[XBOX\_NET\]** and allow traffic out to the internet (WAN). You can also enable UPnP (Services > UPnP) for the VLAN interface if you desire. This lets the Xbox open ports as needed.
7. **Final Check:**
	- The Xbox, when connected to the XBOX SSID (VLAN 40), should get an IP in the 192.168.40.x range.
	- It will be isolated from your other devices (on VLAN 20, for example) unless you create firewall rules to allow traffic between them.
	- Internet access should work if your rules allow outbound WAN access.
	- UPnP can be enabled for that VLAN interface, ensuring games and Xbox Live services function properly.

### Physical vs. Logical Separation

- **Physical Separation:**  
	Means literally dedicating a port to a particular VLAN. The device on that port sees no tags and belongs only to that VLAN/subnet. This is simpler but uses more ports.
- **Logical Separation (VLAN Trunk):**  
	One port carries multiple VLANs, each with its own subnet. Devices must be VLAN-aware or connect via a VLAN-aware AP/switch. This is more flexible and uses fewer ports, but requires more capable equipment.

### In Summary:

- You’ve enabled 802.1q, which allows creating VLANs on the switch.
- Create a new VLAN tag (like 40) on the switch and associate the CPU port and AP port as tagged members.
- On pfSense, create a VLAN interface with tag 40 and assign it a subnet and IP.
- Configure firewall rules, DHCP, and UPnP as needed.
- If your AP supports VLAN tagging, assign SSID to VLAN 40 for the Xbox. If not, consider physically separating the Xbox onto a dedicated port/VLAN or upgrading your AP.

This approach allows you to isolate your Xbox network traffic from your main LAN while still providing full internet access and the benefits of UPnP.

**User:**

Okay. I've got 5 ports with the Port 5 being the LAN uplink. I'm not sure what to tag and what not to tag as of now. I'm also not sure which members to include and why. I'm assuming not adding members acts as some sort of gap virtually. Not sure how to approach what to tag and what not to tag. I'll have the wireless AP on port 4, my direct PC on port 1, and likely the home server on port 3. Certain things shouldn't communicate with other things I'm assuming. Some arrogant IT guy made these UIs to be really confusing and roundabout. I've got a DMZ on tag 10, HOME\_LAB (home server and stuff) on 30, INTERNAL (trusted stuff like me and wire) on 20, and completely untrusted GUEST on 40 (the AP has a guest SSID). How will things be broken up by VLANs if there's one AP? Is it done with MAC addresses and somehow without additional auth?

---

**AI:**

Let’s clarify how to break down the network into VLANs with the given setup and constraints. Understanding how tagging works and how VLAN-aware vs. non-VLAN-aware devices fit into this picture is key. The interface can feel counterintuitive, but once you grasp the concepts, it becomes clearer.

### Big Picture

- **VLANs**: They’re like separate virtual switches running over the same physical cabling. Each VLAN has its own subnet, DHCP, firewall rules, etc.
- **Tagging**: Used when you want a single port to carry traffic for multiple VLANs. The data frames get a VLAN ID tag so the receiving device can distinguish which VLAN they belong to.
- **Untagged (Access) Ports**: Used for devices that are not VLAN-aware. The switch removes any VLAN tags before sending frames out that port, effectively making the device think it’s on a single “normal” LAN.
- **Tagged (Trunk) Ports**: Used when connecting to VLAN-aware devices like managed switches, VLAN-capable access points, or routers that need multiple VLANs on one cable. Traffic for each VLAN is sent with tags intact.

### Your VLANs and Ports

- VLAN 10: DMZ
- VLAN 20: INTERNAL (trusted devices like your PC)
- VLAN 30: HOME\_LAB (your home server network)
- VLAN 40: GUEST (untrusted devices, guest SSID)

You have 5 ports on the Netgate 2100. Let’s say you decide:

- **Port 1**: PC (Trusted/Internal)
- **Port 3**: Home Server (HOME\_LAB)
- **Port 4**: Wireless AP (This will carry multiple VLANs if your AP supports VLAN tagging/multiple SSIDs)

You also mentioned Port 5 being the LAN uplink (possibly the internal CPU port or another connection).

### Deciding on Tagging and Membership

**General Rules:**

- If the device does NOT understand VLANs (like a standard PC, most servers without VLAN config):
	- Make the port **untagged** in the VLAN you want it to be in. This port will only be a member of that one VLAN, and the device will get an IP in that VLAN’s subnet.
- If the device DOES understand VLANs or is expected to handle multiple VLANs (like a managed AP that can have multiple SSIDs mapped to VLANs):
	- Make the port **tagged** for all VLANs that should pass through. The device on that port must be configured to place different SSIDs/users into the appropriate VLAN ID.

**Example Configuration:**

1. **Port 1 (PC):**
	- You trust it and want it on INTERNAL (VLAN 20).
	- Set Port 1 as **untagged** member of VLAN 20.
	- Do not tag or include it in other VLANs. This PC now just sits in the INTERNAL subnet.
2. **Port 3 (Home Server):**
	- Belongs in HOME\_LAB (VLAN 30).
	- Set Port 3 as **untagged** member of VLAN 30.
	- Remove it from other VLANs (or ensure no other VLANs are untagged on that port).
3. **Port 4 (Wireless AP):**  
	Here’s where trunking/tagging comes into play. Your AP must support multiple SSIDs and VLAN tagging. Each SSID will correspond to a VLAN:
	- For example:
		- Main SSID → VLAN 20 (INTERNAL)
		- Guest SSID → VLAN 40 (GUEST)
		- Another SSID for DMZ devices → VLAN 10 (DMZ)
		- Another SSID for lab devices → VLAN 30 (HOME\_LAB)
	Since the AP needs multiple VLANs on the same physical port, you must tag these VLANs on Port 4:
	- Set Port 4 as **tagged** member of VLANs 10, 20, 30, and 40.
	On the AP’s configuration interface:
	- Assign the "Guest" SSID to VLAN 40.
	- Assign the "Main" SSID to VLAN 20.
	- Assign any special SSID for the DMZ to VLAN 10.
	- Assign a lab SSID to VLAN 30, if needed.
	The AP will broadcast multiple SSIDs, each associated with a different VLAN tag. When a client connects to that SSID, the AP tags the traffic for that VLAN and sends it up to the Netgate switch, which then routes it accordingly.

### How VLAN Separation Works with a Single AP

- **Not by MAC addresses:** VLAN assignments are not done by MAC addresses at this layer. They’re done via tagging on the AP. The AP separates devices based on the SSID they connect to. Each SSID is mapped to a VLAN.
- **Without additional auth:** VLAN tagging doesn’t require extra authentication by default. The separation is enforced by network design. If you secure each SSID (WPA2/WPA3), that’s your primary authentication. Each SSID places the device in a different VLAN/subnet.

### Summary of Steps to Move Forward

1. **On the Switch (Interfaces > Switch > VLANs):**
	- Create VLAN 10, 20, 30, 40.
	- Assign ports to each VLAN:
		- Port 1: Untagged in VLAN 20 only.
		- Port 3: Untagged in VLAN 30 only.
		- Port 4: Tagged in VLANs 10, 20, 30, 40.
2. **In pfSense (Interfaces > Assignments):**
	- Create VLAN interfaces for each VLAN and assign IP subnets.
	- Example subnets:
		- VLAN 20: 192.168.20.1/24
		- VLAN 30: 192.168.30.1/24
		- VLAN 10: 192.168.10.1/24
		- VLAN 40: 192.168.40.1/24
	- Enable DHCP if needed on each VLAN interface.
3. **On the AP:**
	- Configure multiple SSIDs.
	- Map SSIDs to VLAN IDs:
		- Main SSID = VLAN 20
		- Guest SSID = VLAN 40
		- Lab SSID = VLAN 30
		- DMZ SSID = VLAN 10 (if you want one)
4. **Firewall Rules:**
	- Control which VLANs can talk to each other. By default, keep them isolated and only allow desired outbound traffic (e.g., all can go to internet/WAN, but block VLAN 40 (Guest) from reaching VLAN 20 (Internal)).

### Closing Thoughts

Yes, the UI is tricky. The concept to remember:

- **Tagging** = multiple VLANs on one port (for VLAN-aware devices, like the AP).
- **Untagged** = single VLAN on a port (for normal devices, like PC/server).
- Use SSIDs on the AP to separate wireless clients into the correct VLANs.

This approach gives you strong logical separation—even on a single cable to the AP—without relying on MAC addresses or mysterious methods. It’s all about how the VLAN tags and SSIDs are mapped.

**User:**

But the actual setup for the switch ports is what confuses me. If, on the access point related switch port, I put untagged on a certain member/switch port, then does that mean untagged traffic gets that vlan tag? I'm confused about all the nuance here with the switch ports for the netgate 2100. It seems like I always have to have "5t" for tagging on the "LAN uplink" which I'm just assuming hooks into the switch and ultimately to WAN (hence "uplink"?)

---

**AI:**

Your confusion is totally understandable. The Netgate 2100’s switch configuration can feel counterintuitive at first because it’s not just a regular managed switch—it’s an integrated switch chip connecting internal ports and the CPU (pfSense).

Let’s break down some key points:

### The Role of the CPU (Router) Port

On the Netgate 2100, one of the switch ports (often referred to internally as port 5 or sometimes port 6, depending on the documentation) is actually the “CPU port.” This port isn’t a physical port you plug a cable into; it’s the internal link from the switch chip to the pfSense router software. To route between VLANs, pfSense must see VLAN tags. That’s why you’ll typically see something like "5t" on VLAN configurations, indicating that the CPU port is tagged. This ensures that pfSense (the router) can differentiate between different VLANs by reading their tags.

**In other words:**

- "5t" doesn’t mean an external uplink to WAN. It’s the internal uplink from the switch to the router’s CPU interface. It must carry all VLANs as tagged so pfSense can process them.

### Untagged vs. Tagged on a Port

- **Untagged (Access) Mode:** If you configure a port as untagged on a particular VLAN, any device plugged into that port will receive traffic for that VLAN without VLAN tags. Conversely, any untagged traffic coming into that port from the device is placed into that VLAN internally. This is how you connect a PC or a server that doesn’t know about VLANs at all. It just “sees” a normal LAN, but behind the scenes, it’s on a specific VLAN.
- **Tagged (Trunk) Mode:** If you configure a port as tagged for a VLAN, the switch sends frames with VLAN tags intact. This requires the device on the other end of the cable to understand VLAN tags. For example, a VLAN-capable Access Point (AP) can receive multiple VLANs over one port if they are tagged. The AP then separates traffic into different SSIDs or networks based on the VLAN tags.

### What Happens with Untagged Traffic?

If a port is set as untagged for VLAN X, then any untagged frames arriving at that port are automatically associated with VLAN X. When the switch sends traffic out of that port for VLAN X, it sends it untagged. So that port and its device are effectively isolated in VLAN X without either side needing to think about tags.

### Applying This to Your Scenario

You have multiple VLANs: DMZ (10), INTERNAL (20), HOME\_LAB (30), and GUEST (40). You have different devices that might or might not be VLAN-aware.

- **For a PC or Home Server (Not VLAN-Aware):**  
	Decide which VLAN that device belongs to. For example, your PC is trusted and should be on INTERNAL (VLAN 20). On the switch config, you set that port as **untagged** in VLAN 20, and remove any other VLANs from that port. Now that port only carries VLAN 20 traffic, but it’s presented to the PC without tags. The PC just gets a DHCP lease from the VLAN 20 subnet, no extra config needed on the PC.
- **For the Access Point (Potentially VLAN-Aware):**  
	If your AP can handle multiple SSIDs mapped to different VLANs, you need that single cable to carry multiple VLANs. To do this, you make the AP’s port **tagged** in VLANs 10, 20, 30, and 40. The AP will see frames with tags and can map each SSID to a specific VLAN. If the AP isn’t VLAN-aware, then you can’t separate networks logically on the same cable; you’d have to either get a VLAN-capable AP or run separate cables/ports.

### No VLANs Assigned = No Connectivity

If you don’t assign a port to any VLAN, that port is effectively isolated with no network. The switch won’t know where to put that traffic. Thus, every port that you want to use must be at least untagged in one VLAN (for a simple device) or tagged in one or more VLANs (for a VLAN-aware device).

### The CPU Port Always Tagged

The CPU port (the internal link to pfSense) should always be tagged in all VLANs you create. This lets pfSense handle DHCP, routing, and firewall rules for each VLAN. If it wasn’t tagged, pfSense wouldn’t know the difference between traffic belonging to VLAN 10 versus VLAN 20, etc.

### In Summary:

- “5t” (or similar) represents the CPU port which must carry all VLANs as tagged.
- Untagged on a port = That port is dedicated to one VLAN. Devices on that port see normal Ethernet, no tags.
- Tagged on a port = That port can carry multiple VLANs. The device at the other end must understand tags. This is common for uplinks to another switch or VLAN-capable devices like certain APs.
- No membership in a VLAN = That port gets no network connectivity from the switch.

Once you apply these concepts, the configuration steps become clearer:

1. Decide which VLAN each device belongs to.
2. If the device doesn’t understand VLANs, set its port untagged in that VLAN.
3. If the device needs multiple VLANs, make the port tagged for those VLANs.
4. Always have the CPU port tagged in all VLANs so pfSense can manage them.

With practice, these settings start to make more sense.

**User:**

Below is some of the information I've gathered. One thing I'm trying to understand for the case of switch settings on the pfsense appliance, is how to handle the non-aware ones when I only have one access point that can act as a router with VLAN tagging if need be. It would be cool if there's a way to have things fallback to the default VLAN if tagging isn't included with something coming off of the wireless account point network. Then it becomes a case of using the tagged VLAN and use the untagged one if not tagged. Is that a thing?For instance, with my DMZ VLAN switch, it could be 4t and 5t for the Members with VLAN tag 10 with a description of "allow/assume DMZ tagged traffic on the 4th switch port for wireless AP stuff." - 3 ways to put your devices (clients/PCs/phones) into different VLANs - For ethernet - by the port they are plugged into on the switch - For Wi-Fi - - by SSID (Main wifi vs. Guest wifi) with separate SSIDs whether on the same or different access points. Users are essentially broken up by knowing the right wifi password. The wireless access point has to allow this to tag different SSIDs with different VLAN tags (specifies which VLAN the traffic is logically/virtually on). - by MAC address - not nearly as secure but great for convenience factor. It's not as easy to set up though. - VLAN-Aware devices (access points, switches, routers) vs. NOT VLAN-Aware networking (whether real appliances or virtual) -

---

**AI:**

**Short Answer:** Yes, you can have a default (untagged) VLAN for devices that do not present VLAN tags. On a trunk (tagged) port, one VLAN is typically designated as “native” or untagged. Traffic without VLAN tags on that port is associated with this native VLAN, effectively acting as a fallback network for non-VLAN-aware devices.

---

**Detailed Explanation:**

### The Concept of a Native (Untagged) VLAN

When you configure a port to carry multiple VLANs (a trunk), you usually have one VLAN that is untagged—often called the **native VLAN**. On enterprise switches, this is a common concept. The native VLAN serves as the "default" network for any traffic arriving on that port without a VLAN tag. On Netgate appliances, you achieve a similar configuration by assigning a VLAN ID as the PVID (Port VLAN ID) and making it the untagged VLAN on that port.

### How It Works for the Access Point

1. **AP as a VLAN-Aware Device:**  
	If your access point (AP) supports VLANs, you can configure multiple SSIDs, each tagged with a different VLAN ID. Devices connecting to those SSIDs get placed into the corresponding VLAN. For example:
	- Main SSID → VLAN 20 (tagged)
	- Guest SSID → VLAN 40 (tagged)
	- DMZ SSID → VLAN 10 (tagged)
	All these VLANs are carried over a single cable to the Netgate switch port as tagged VLANs.
2. **Default (Untagged) VLAN for the AP Port:** Suppose you want one SSID or fallback scenario where devices are not VLAN-tagged by the AP (or you want to handle non-VLAN-aware devices connecting somehow). You can designate one VLAN as untagged on the AP’s switch port. This untagged VLAN acts as a default network:
	- Any traffic from the AP that does not carry a VLAN tag is placed into the untagged VLAN on that port.
	- Conversely, any non-tagged traffic sent to the AP from the router’s switch side will be seen as normal Ethernet traffic on that default SSID/network by the AP (if configured that way).
	For example, let’s say you assign VLAN 20 as the native/untagged VLAN on the AP port. Now:
	- If a device connects to the AP’s "Main" SSID that is not specifically VLAN-tagged, the AP sends that traffic out untagged.
	- The Netgate switch port receiving it sees untagged traffic and places it into VLAN 20, the PVID set for that port.
	This gives you a single default VLAN for devices that aren’t explicitly placed into another VLAN via an SSID with tagging.

### Applying This to Your Scenario

- **DMZ VLAN Example (VLAN 10):**  
	You mentioned having DMZ traffic on VLAN 10 and tagging it on port 4 and 5 (the CPU port). If the AP needs to send DMZ traffic, it should tag it as VLAN 10. On the switch side, port 4 would be configured with VLAN 10 as a tagged member, and port 5 (CPU port) would also be tagged. The CPU sees VLAN 10 tags and routes/firewalls accordingly.  
	No default fallback here—this is strictly tagged traffic for the DMZ SSID.
- **Falling Back to a Default (Untagged) VLAN:** Let’s say you want any device connecting to a certain SSID (or the AP’s default network) without a VLAN tag to end up in, say, VLAN 20 (INTERNAL). You can do this by:
	1. Setting port 4 (the AP port) to have VLAN 20 as untagged.
	2. Making sure VLAN 20 is also tagged on port 5 (CPU) so pfSense can see it. The CPU port always needs to see all VLANs tagged. In the switch configuration, the CPU (router) port is typically tagged in all VLANs. This is the internal link to pfSense and not a physical external port.
	The AP, if it sends untagged traffic (from a default SSID that doesn’t assign a VLAN), will have its traffic placed into VLAN 20 by the switch. This means devices connecting to that SSID will get IPs and routing from VLAN 20’s subnet.

### Important Nuances

- **You Must Still Assign a VLAN on the Switch CPU Port:**  
	The CPU port (often shown as “5t” or similar) must be tagged in every VLAN you create so pfSense can distinguish the VLANs. The CPU port doesn’t do untagged VLANs because pfSense needs to know exactly which VLAN incoming traffic belongs to.
- **The AP Configuration Matters:** Your AP must be configured correctly. If the AP’s default SSID doesn’t tag traffic, that traffic will appear untagged at the switch. The switch will place it into the native/untagged VLAN configured on that port. If you configure other SSIDs to tag traffic (e.g., Guest SSID = VLAN 40), the AP sends those frames tagged. The switch then knows to put them into VLAN 40.
- **Fallback VLAN:** If you want a scenario where some devices get a default VLAN if they do not have tags (or the AP doesn’t assign tags), you just ensure that the AP’s port has a single untagged VLAN. Any untagged traffic hitting that port from the AP automatically goes into that VLAN.

### Summary

- A “native” or “untagged” VLAN on a trunk port acts as a default for untagged traffic.
- VLAN-aware devices (like your AP) can send both tagged and untagged traffic.
- Tagged traffic goes to its corresponding VLAN; untagged traffic goes to the designated native (untagged) VLAN.
- This allows a “fallback” scenario: if something doesn’t get a VLAN tag, it ends up in the default VLAN you chose as untagged on that port.

By carefully setting the native/untagged VLAN on the AP’s port, you can control which VLAN unauthenticated or non-VLAN-tagged devices end up in, effectively giving you that fallback behavior you’re looking for.