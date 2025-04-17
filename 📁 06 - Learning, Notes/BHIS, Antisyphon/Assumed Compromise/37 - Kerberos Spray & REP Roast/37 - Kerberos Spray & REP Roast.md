---
aliases: []
tags: []
publish: true
permalink:
date created: Thursday, April 17th 2025, 10:28 am
date modified: Thursday, April 17th 2025, 10:29 am
---

- Recovering Kerberos with pre-auth disabled requires computation and is not foolproof - passwords are usually small
- Kerberos accounts w/out pre-auth are typically related to legacy integrations
- Seeing password sprays for kerberos without pre-auth requires more in-depth queries
	- event ID 4768 with 0x0 pre-auth encryption type
- AS-REP roasting is for those accounts that don't require pre-authentication
- 