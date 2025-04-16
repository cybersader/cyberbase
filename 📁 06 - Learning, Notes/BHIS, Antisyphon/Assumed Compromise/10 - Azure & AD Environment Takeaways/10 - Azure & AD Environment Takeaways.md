---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, April 16th 2025, 9:20 am
date modified: Wednesday, April 16th 2025, 9:51 am
---

- Don't login to DC with RDP, use RSAT instead
- Don't enable SSH outbound (port 22) - hackers use it for C2 
	- [Enhancing Cyber Resilience: Insights from CISA Red Team Assessment of a US Critical Infrastructure Sector Organization | CISA](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-326a) 
- Something better than WEC and WEF?
	- Agent-based
	- Azure monitor agents - doesn't rely on WinRM
	- Hooks up to Log Analytics
	- Put Sentinel on top as a SIEM
- Why is SMB dangerous? - 09:44 AM
	- You can do tons of fake SMB shares so that the user authenticates to fake SMB
	- SMB can be used for RCE too - watch for RPC
	- 445 and SMB availability
	- Add workstation firewalls so they can't talk to each other

- Badblood
	- Don't run in prod - would be catastrophic
	- Will make the AD look like an old and realistic mess
- AD is easy out-of-the-box, but that creates issues long-term
- 