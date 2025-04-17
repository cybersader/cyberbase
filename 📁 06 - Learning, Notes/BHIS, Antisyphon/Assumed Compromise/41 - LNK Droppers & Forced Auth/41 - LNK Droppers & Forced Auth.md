---
aliases: []
tags: []
publish: true
permalink:
date created: Thursday, April 17th 2025, 1:22 pm
date modified: Thursday, April 17th 2025, 1:22 pm
---

- This takes advantage of SMB file shares
- You put down a new file share that you (the attacker) control
- LNK files are just shortcuts to a network share
- Under you're doing LDAP signing on the far-end, you're pwned in seconds because...silent authentication be like dat

- NTLMRelayx
	- if they put it into a common environment, it's hosed

- They check for null values via the UAC attributes since the hash of the null value is always the same

- 