---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, April 16th 2025, 1:20 pm
date modified: Wednesday, April 16th 2025, 1:36 pm
---

- lnk file exploit with file shares
	- The defense for this is not having SMB outbound to the internet
	- FSRM is a great defense for this too

- Exfiltration and egress

- It's hard to block non-standard traffic on standard ports.  Requires lots of deep packet inspection
- Shrink your egress aperture - ports
	- Not just ports, but matching the traffic to protocols

- BGP, ASNs, and large-scale routing

- TLS findings - they exist because monster compute-having adversaries like Russia and China exist

- Attackers will convert all sorts of sensitive data into something that can be streamed out on a standard port

- MITM risks
	- Web logs
	- Packet captures
	- Attacker capturing egress on the machine

- Modern firewalls can deeply inspect traffic to combat these things

- 