---
aliases: [Ninestar 25 - Tripwires and Deception]
tags: []
publish: true
permalink: 
date created: Wednesday, April 16th 2025, 10:27 am
date modified: Wednesday, April 16th 2025, 11:00 am
---

[Honey Accounts in Windows AD](../../../../📁%2098%20-%20ARCHIVE/GradSchoolProjects/Honey%20Accounts%20in%20Windows%20AD/Honey%20Accounts%20in%20Windows%20AD.md)

- [One Active Directory Account Can Be Your Best Early Warning - Black Hills Information Security, Inc.](https://www.blackhillsinfosec.com/one-active-directory-account-can-be-your-best-early-warning/)
- `userAccountControl` is the most interesting attribute for AD accounts and objects
	- Tells hackers a lot from one "bitmapped" attribute
- To put honey accounts in global address list? - good question
- Honey Accounts are blocked from logging in with `nonexistent` value for `LogonWorkstations` attribute

- Rapid7 IDR has good tech
- All around deception tool - [Create New Canarytoken](https://canarytokens.org/nest/)
- 