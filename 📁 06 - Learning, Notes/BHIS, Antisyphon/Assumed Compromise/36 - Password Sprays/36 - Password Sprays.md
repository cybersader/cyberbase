---
aliases: []
tags: []
publish: true
permalink:
date created: Thursday, April 17th 2025, 9:20 am
date modified: Thursday, April 17th 2025, 10:00 am
---

- Indefinite lockout periods and a small number of tries is a vulnerability and not a defense
- When pentesters get a notification that they have a cred, they have to move fast
- With Microsoft, use automated actions with MS ASR and other features - smart lockouts
- Failed authentication from one IP to multiple accounts is obvious.  Then again, they could use FireProxy to rotate

- Cyber Deception with [Honey Accounts](../../../../📁%2098%20-%20ARCHIVE/GradSchoolProjects/Honey%20Accounts%20in%20Windows%20AD/Honey%20Accounts%20in%20Windows%20AD.md) is typically "high fidelity" and a good IOC that an attacker is trying to spray accounts internally

- Check for NTLM auth dangling off the edge of the network
- Check in the password spray span by checking the user accounts and their behavior (geo, IP, etc.)
- You can use STL decomposition or standard deviation to threshold for alerts

- Will machine account quota affect things like banks with branches?
	- In a perfect world, you don't use admin accounts and really an svc account that is domain joined
	- This is the quota for joining computers to the domain
	- Provide some AD delegation - members of a group have privilege to join computers to the domain.  This means the creation of a computer account.
- 