---
aliases: []
tags: []
publish: true
permalink:
date created: Thursday, April 17th 2025, 11:34 am
date modified: Thursday, April 17th 2025, 12:02 pm
---

- Proxychains
	- Allows you to shovel tooling back down SSH tunnels
- port 9050 for Tor because proxychains uses that port
	- listening port in proxychains config file has to match
- If Bloodhound "all" collection method doesn't pop EDR and SIEM, then you have detection gaps 
- LDAP and SMB signing
	- This is huge
	- LDAP signing and channel binding + SMB signing
	- Enforcing signing and integrity checks can be a problem if you push around huge files - isolate the systems where you are going to do so
- If you aren't managing IPv6 well, then you can do WPAD poisoning and other stuff
- Once they have a C2 working, they are quickly figuring out the security posture of your network