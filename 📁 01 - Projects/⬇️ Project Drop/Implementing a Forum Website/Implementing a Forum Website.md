---
title:
permalink:
aliases: []
tags: []
publish: true
date created: Saturday, August 17th 2024, 8:12 pm
date modified: Monday, August 11th 2025, 8:35 am
---

[Community IT Support Setup](../../../🕸️%20UNSTRUCTURED/Community%20IT%20Support%20Setup.md)

- [Discourse pricing | Discourse - Civilized Discussion](https://www.discourse.org/pricing)
- https://hub.docker.com/r/bitnami/discourse
- [hub.docker.com/r/bitnami/discourse](https://hub.docker.com/r/bitnami/discourse "hub.docker.com/r/bitnami/discourse")
- [Discourse pricing | Discourse - Civilized Discussion](https://www.discourse.org/pricing "Discourse pricing | Discourse - Civilized Discussion")
- [self hosting discourse - Brave Search](https://search.brave.com/search?q=self+hosting+discourse&source=android&summary=1&conversation=835a932eaaadaae527e361 "self hosting discourse - Brave Search")
- [Self hosted open source forum systems : r/selfhosted](https://www.reddit.com/r/selfhosted/comments/k6e42i/self_hosted_open_source_forum_systems/ "Self hosted open source forum systems : r/selfhosted")
- [Transactional Email API Service For Developers | Mailgun](https://www.mailgun.com/ "Transactional Email API Service For Developers | Mailgun")
- [Discourse is the place to build civilized communities | Discourse - Civilized Discussion](https://www.discourse.org/ "Discourse is the place to build civilized communities | Discourse - Civilized Discussion")
- [Recommended Hosting Providers for Self Hosters - Installation / Hosting - Discourse Meta](https://meta.discourse.org/t/recommended-hosting-providers-for-self-hosters/79562 "Recommended Hosting Providers for Self Hosters - Installation / Hosting - Discourse Meta")
- [Browse One-Click App Marketplace | Akamai](https://www.linode.com/marketplace/apps/ "Browse One-Click App Marketplace | Akamai")
- [Deploy Nextcloud through the Linode Marketplace | Linode Docs](https://www.linode.com/docs/marketplace-docs/guides/nextcloud/ "Deploy Nextcloud through the Linode Marketplace | Linode Docs")
- [Deploy Rocket.Chat through the Linode Marketplace | Linode Docs](https://www.linode.com/docs/marketplace-docs/guides/rocketchat/ "Deploy Rocket.Chat through the Linode Marketplace | Linode Docs")
- [Deploy GlusterFS Cluster through the Linode Marketplace | Linode Docs](https://www.linode.com/docs/marketplace-docs/guides/glusterfs-cluster/ "Deploy GlusterFS Cluster through the Linode Marketplace | Linode Docs")
- [ditributed file system decentralized - Brave Search](https://search.brave.com/search?q=ditributed+file+system+decentralized&source=android&summary=1&conversation=660dcc1c03d6ab41614139 "ditributed file system decentralized - Brave Search")
- [Discourse | DigitalOcean Marketplace 1-Click App](https://marketplace.digitalocean.com/apps/discourse "Discourse | DigitalOcean Marketplace 1-Click App")
- [hub.docker.com/search?q=discourse](https://hub.docker.com/search?q=discourse "hub.docker.com/search?q=discourse")
- [What are the differences between self-host and discourse business host? - Installation / Hosting - Discourse Meta](https://meta.discourse.org/t/what-are-the-differences-between-self-host-and-discourse-business-host/147391 "What are the differences between self-host and discourse business host? - Installation / Hosting - Discourse Meta")

# Discourse Setup on TrueNAS

## Overview

| Component | Purpose |
| --- | --- |
| Ubuntu VM | Official Discourse install runs within this VM. |
| Reverse Proxy | TLS termination & routing through your existing proxy. |
| Transactional Email | Reliable SMTP via SES, Postmark, etc. |
| Object Storage | Off‑site uploads & backups (S3-compatible). |

* * *

## 1. **Run Discourse inside a Linux VM on TrueNAS SCALE ("fangtooth")**

- Discourse does **not support** Docker Compose setups—it's designed to be installed via the official `discourse_docker` launcher within a Linux host.
- TrueNAS SCALE **does not run Docker natively**: any Docker-based services must be run inside a Linux VM.
- Community consensus agrees—just spin up an Ubuntu VM on TrueNAS and follow the standard Discourse install inside. [discourse.cubecoders.com+11truenas.com+11forum.level1techs.com+11](https://www.truenas.com/community/threads/anyone-have-suggestions-to-install-discourse-forum-software-in-freenas.78106/?utm_source=chatgpt.com)[forum.storj.io](https://forum.storj.io/t/ubuntu-linux-or-truenas-scale-what-do-you-recommend/23222?utm_source=chatgpt.com)[meta.discourse.org](https://meta.discourse.org/t/trying-to-install-discourse-in-an-ubuntu-vm-on-proxmox/113703?utm_source=chatgpt.com)

### VM tips:

- Use an **Ubuntu Server ISO** (e.g. 22.04 or 24.04) as your guest OS.
- Assign **2 vCPUs and 4–6 GB RAM** to start.
- Use a **zvol-backed VM disk** for good performance and flexibility.
- Ensure virtual networking is set up correctly (bridge or NAT as needed).

* * *

## 2. **Inside the Ubuntu VM: Use official Discourse Docker method**

- Clone `discourse_docker`, configure `app.yml`, and run `./launcher rebuild app`.
- Set fields such as `DISCOURSE_HOSTNAME`, `SMTP_URL`, Let’s Encrypt email, etc.
- This is the officially supported install path—easier to upgrade and maintain.

* * *

## 3. **Reverse Proxy + HTTPS**

- Continue using your existing reverse proxy (e.g. Nginx Proxy Manager).
- Configure DNS (e.g., `forum.example.com`) to point to your TrueNAS host.
- Forward HTTP/S to the Discourse VM.
- Discourse supports being behind an HTTPS-terminating proxy smoothly.

* * *

## 4. **Email Setup (SMTP)**

Use a trusted **transactional email provider** (SES, Postmark, SendGrid, etc.):

- Add SPF/DKIM/DMARC records in your DNS for deliverability.
- Place credentials in `SMTP_URL` inside `app.yml`.
- Validate using Discourse’s email troubleshooting guides.
    

* * *

## 5. **Object Storage for Uploads & Backups**

- Configure S3-compatible storage (AWS S3, B2, R2, Wasabi…) for:
    - **User uploads** (images, attachments).
    - **Automated backups**, stored off-site for resilience.
- Optionally enable object locking for added protection from accidental deletion.

* * *

## 6. **Bonus: Future Scalability**

- As your forum grows, the `discourse_docker` setup supports:
    - Splitting into multiple containers (web, redis, postgres).
    - Potential horizontal scaling across multiple VMs.

* * *

### Summary: Why this VM-based method is the most resilient

- **Officially supported** by Discourse—no drifting from upstream.
- **Isolated environment**—disaster recovery is simpler with VM snapshots.
- **Easier maintenance**—standard upgrade path, S3 backups, predictable email.
- **Hardware-friendly**—TrueNAS stays focused on storage; VM handles app logic.

# Setup & Common Issues

- [discourse.org > Configure a firewall for Discourse - Documentation / Self-Hosting](https://meta.discourse.org/t/configure-a-firewall-for-discourse/20584) - you may need to fiddle with the "ufw" firewall to let in port 80 or 443 requests

## Overlapping VM MAC Addresses in Virtual Machines in TrueNAS

- I noticed there was overlap with two VMs.  Maybe you have to generate MACs for them each time you create one