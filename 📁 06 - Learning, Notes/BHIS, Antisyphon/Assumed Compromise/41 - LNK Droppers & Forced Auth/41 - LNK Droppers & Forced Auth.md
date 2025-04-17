---
aliases: []
tags: []
publish: true
permalink:
date created: Thursday, April 17th 2025, 1:22 pm
date modified: Thursday, April 17th 2025, 1:41 pm
---

- This takes advantage of SMB file shares
- You put down a new file share that you (the attacker) control
- LNK files are just shortcuts to a network share
- Under you're doing LDAP signing on the far-end, you're pwned in seconds because...silent authentication be like dat

- NTLMRelayx
	- if they put it into a common environment, it's hosed

- They check for null values via the UAC attributes since the hash of the null value is always the same

- If you get a bunch of hashes or passwords, make sure that non-repudiation won't be an issue to where everyone has to rotate passwords

- FSRM - audit your file servers

- Event 4662 with 3 Activity GUIDs
	- If it's not a DC in the list, then it's really bad
	- This usually means you're getting ransomwared
	- Resume-generating event/activity
	- Scorched-earth - new DC and rejoin everything
	- Hackers will DC-Sync as you try to rotate passwords
	- You have to do a new domain - only way
	- Shut down egress and figure out what's happening internally
	- Expensive easy buttons like Crowdstrike would detect it

- You need cold storage that ISN'T HOT

- Do certificate auth for wireless (RADIUS)