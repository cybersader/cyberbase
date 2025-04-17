---
aliases: []
tags: []
publish: true
permalink:
date created: Wednesday, April 16th 2025, 10:32 am
date modified: Thursday, April 17th 2025, 4:35 pm
---

- Talk about cyber deception with HR for awareness
- Get Bloodhound + Plumhound reports
- Make sure your EDR or SIEM tools give your cyber deception features
- Do PrivEsc check script in environment
- Detecting lab enumeration
- Detecting Kerberoasting
- Defenses against Shadow Credentials
- LDAP signing and credential signing
	- Browser abuse, DP API, WPAD
- Clearing event logs is common - do you have detections for it?
- Does our SIEM cover what Sysmon does?
- lnk file exploit with file shares
	- The defense for this is not having SMB outbound to the internet
	- FSRM is a great defense for this too
- Shrink your egress aperture - ports
- Review DPI capabilities on firewalls
- PowerAutomate - used for exfil by hackers
	- Hackers are good at getting around DLP by avoiding UI interactions
- Review 3rd party printer management - toner and paper and such
	- Printers sometimes have access to everything (shares and email)
	- 3rd parties should change default creds on these
- Write a detection for reflection.assembly or get rid of PowerShell ISE and the module if users don't need it
	- C# code is integral to Windows pentesting
- Review host-based firewall rules and policies
- Check machine account quotas
- Check RemoteRegistry detection
- Indefinite lockout periods and a small number of tries is a vulnerability and not a defense
- With Microsoft, use automated actions with MS ASR and other features - smart lockouts - helps against password sprays
- Check for NTLM auth dangling off the edge of the network

- Roles and job functional security
	- POS_SEC and POS_DIST
	- Name computers same as usernames to use "percent trick"
	- Role groups all the way down to resources
	- HR has to have job descriptions
	- HR should have authority and define job functions

- Do we disable accounts even if they're computer accounts
- HR relationship is CRUCIAL for InfoSec team!
- Do we manage our IPv6 space well?
- Test LNK droppers on an engagement
- FSRM - audit your file servers
	- Allows you to understand inventory better
	- https://learn.microsoft.com/en-us/windows-server/storage/fsrm/file-screening-management
- You need cold storage that ISN'T HOT
- Do certificate auth for wireless (RADIUS)
- Do we have a bastion domain?
- No automated systems should use RemoteRegistry
- We use RSAT primarily...yes?
- Entra Password Protection
- Management and bastion forest
- Stop using work email on non-work-related 3rd party sites
	- Infostealers work 70+% of the time for this pentesting firm
- How do we reset MFA
- Use the LoginData detection for DPAPI
- [Stealer Malware 101: Understanding the Different Variants and Families - SOCRadar® Cyber Intelligence Inc.](https://socradar.io/stealer-malware-101-understanding-the-different-variants-and-families/)
- 

- Other test types
	- AR Architecture Review
	- 