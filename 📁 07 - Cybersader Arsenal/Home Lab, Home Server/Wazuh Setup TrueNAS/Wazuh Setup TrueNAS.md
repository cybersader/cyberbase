---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, October 5th 2025, 2:03 pm
date modified: Sunday, October 5th 2025, 4:13 pm
---

- [Wazuh](https://wazuh.com/)
	- [youtube.com > Take Control of Your Security: Free, Self-Hosted SIEM & Logs with Graylog, Wazuh, & Security Onion](https://www.youtube.com/watch?v=GZZZvLRSUvc&t=165s)
	- [youtube.com > this Cybersecurity Platform is FREE](https://www.youtube.com/watch?v=i68atPbB8uQ)
	- [youtube.com > Detection Engineering with Wazuh](https://www.youtube.com/watch?v=nSOqU1iX5oQ&t=413s)
	- [youtube.com > Secure your HomeLab for FREE // Wazuh](https://www.youtube.com/watch?v=RjvKn0Q3rgg)

# TrueNAS Wazuh Setup

- 
- Docker deployment
	- [wazuh.com > Wazuh Docker deployment - Deployment on Docker · Wazuh documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html#single-node-stack)
- Immediate points of nuance with TrueNAS
	- Setting the `max_map_counts` would change the core 
		- You can change this in the TrueNAS Sysctl settings. System Settings → Advanced → Sysctl → Add
	- Docker engine used by TrueNAS
	- How many volumes get mapped to datasets?  Can you map a bunch of volumes to one main dataset?
		- Just use one root dataset `wazuh` for everything.  Not ideal, but the ZFS benefits shouldn't matter that much here.
		- Alternative is to split the datasets up into hdd and ssd so that you can have different speeds of storage for each: `wazuh-hdd` and `wazuh-ssd`
	- Host IPs in TrueNAS get used by the `ports` section of the compose yaml. Use custom IP via [Per App Ips with Custom Apps](📁%2007%20-%20Cybersader%20Arsenal/Home%20Lab,%20Home%20Server/TrueNAS%20Scale%20Home%20Server/Custom%20Docker%20Apps%20in%20TrueNAS/Custom%20Docker%20Apps%20in%20TrueNAS.md#Per%20App%20Ips%20with%20Custom%20Apps)
	- Can you throw NPM-related certs into the compose YAMLs?  Why is that something you should do? What does it do?
	- 

## Setup Quick Guide

- Set the `max_map_counts` in TrueNAS system settings
	- [Linux/Unix host requirements](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html#linux-unix-host-requirements "Wazuh Docker deployment - Deployment on Docker · Wazuh documentation")
	- You can change this in the TrueNAS Sysctl settings. System Settings → Advanced → Sysctl → Add
- Set up your datasets
	- Easiest: one root dataset `wazuh`.
	- Better: split datasets by speed - put **indexer data** on SSD (`wazuh-ssd`), and the lighter bits (manager data, certs) on HDD (`wazuh-hdd`). Wazuh’s single-node Docker docs show the three components you’ll be persisting (indexer, manager, dashboard)
- Make sure you have a "Host IP" or custom IP set up in TrueNAS via Network by setting up a `bridge` or bridged network.  
	- [Using Hostnames Locally](../TrueNAS%20Scale%20Home%20Server/Using%20Hostnames%20Locally/Using%20Hostnames%20Locally.md)
- Download the initial configuration files
	- 2 options:
		- TrueNAS Web Shell
			- 
		- Code Server approach with YAML configs
			- [youtube.com > A Better Way to Run Docker Apps on TrueNAS](https://www.youtube.com/watch?v=gPL7_tzsJO8)
			- [truenas.com > Electric Eel - How I am using Dockerfile, .env files, compose files - Apps and Virtualization](https://forums.truenas.com/t/electric-eel-how-i-am-using-dockerfile-env-files-compose-files/15252/39)
- Change the internal user passwords
	- [wazuh.com > Changing the default password of Wazuh users - Deployment on Docker](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html)
	- 
- Edit the Docker compose YAML
	- **Per-app IP:** you already discovered you can bind a specific **host IP alias** right in `ports:` using `IP:HOSTPORT:CONTAINERPORT`. Keep using that.
	- You don’t need a custom `networks:` block for this plan. The stack can live on the default bridge network; you’ll still publish ports to your chosen host IP alias via `ports:`. Define a custom network only if you’re doing **macvlan** (not necessary here).
	- 
- Run the cert bootstrapping script?
	- Not sure how to handle this when I've got my Code server that i use to manage my compose YAMLs.  It seems like I may have to go into the TrueNAS web shell to get things working.
		- [youtube.com > A Better Way to Run Docker Apps on TrueNAS](https://www.youtube.com/watch?v=gPL7_tzsJO8)
		- [truenas.com > Electric Eel - How I am using Dockerfile, .env files, compose files - Apps and Virtualization](https://forums.truenas.com/t/electric-eel-how-i-am-using-dockerfile-env-files-compose-files/15252/39)
	- Wazuh ships a tiny **certs generator** container. We’ll run it **once** via Compose so it writes into your mounted `certs` folder, and make the other services **wait** for it. This avoids manual shelling and works with your “prepare in code-server, then deploy as Custom App” flow.

## Wazuh on TrueNAS SCALE (Fangtooth): Quick Guide + Custom YAML

### 0) What you’ll deploy (single-node)

Wazuh’s **single-node Docker stack** = 3 containers: **indexer** (OpenSearch), **manager**, **dashboard**. Persistent storage + certs are supported out-of-the-box. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

### 1) One-time host setting (required): `vm.max_map_count`

OpenSearch needs a higher mmap limit. Set it once in the SCALE UI and it persists:

- **TrueNAS → System Settings → Advanced → Sysctl → Add**
    - **Variable:** `vm.max_map_count`
    - **Value:** `262144` (or higher)
- This is the official requirement for OpenSearch; setting it on the host is the supported way. [OpenSearch Documentation+1](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/docker/?utm_source=chatgpt.com)
- TrueNAS documents the **Advanced → Sysctl** location (that’s where it lives). [TrueNAS Open Enterprise Storage+1](https://www.truenas.com/docs/scale/23.10/scaletutorials/systemsettings/advanced/?utm_source=chatgpt.com)

* * *

### 2) Datasets (storage layout)

Two simple options:

- **Easiest:** one dataset `wazuh` for everything.
    
- **Better:** split by media speed
    
    - **SSD** for **indexer data** (OpenSearch I/O heavy)
        
    - **HDD** for **manager data** and **certs**
        

Wazuh’s Docker docs describe which components persist data; you’re just mapping each to your dataset path(s). [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

### 3) Per-app IP (bind to your host alias)

Add an **alias IP** on your TrueNAS NIC (Network → Interfaces). In Compose, bind each published port to that IP using the `IP:HOSTPORT:CONTAINERPORT` form—no custom networks needed:

```yaml
ports:
  - "192.168.1.50:443:443"
  - "192.168.1.50:1515:1515"
  - "192.168.1.50:1514:1514/udp"
  - "192.168.1.50:55000:55000"
```

This is standard Docker/Compose port publishing; Compose uses a default bridge network for inter-container comms unless you define otherwise. [Docker Documentation+1](https://docs.docker.com/compose/how-tos/networking/?utm_source=chatgpt.com)

* * *

### 4) Reverse proxy (NPM) — keep it simple

- **Proxy only the Dashboard** (`https://<WAZUH_IP>:443`). Don’t expose `9200`; keep `55000` LAN-only unless you truly need it. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    
- In **Nginx Proxy Manager (NPM)**, add a Proxy Host:
    
    - **Domain:** `wazuh.example.com`
        
    - **Scheme:** `https`
        
    - **Forward Host/Port:** `<WAZUH_IP>` / `443`
        
    - **Websockets:** enabled
        
    - Because the dashboard is **self-signed** by default, either “allow invalid certs” or add an advanced block to disable upstream verification for this host:
        
        ```
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600;
        proxy_ssl_verify off;
        ```
        
    - (NPM basics + disabling upstream verify are well-trodden; see guide and community snippet.) [nginxproxymanager.com+1](https://nginxproxymanager.com/guide/?utm_source=chatgpt.com)
        
- If you prefer **end-to-end TLS**, install a trusted cert **inside** the Wazuh dashboard (their docs cover LE/3rd-party certs) and keep `proxy_ssl_verify` on. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/index.html?utm_source=chatgpt.com)
    

> DNS-01 only if you need wildcards or can’t expose 80/443 for HTTP-01. Otherwise HTTP-01 in NPM is simpler. [nginxproxymanager.com](https://nginxproxymanager.com/guide/?utm_source=chatgpt.com)

* * *

### 5) Passwords & hardening (after first run)

Change Wazuh internal users (indexer + dashboard) per the Docker docs: set new password(s), create hash if applicable, and apply. [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

* * *

### 6) How the **certs generator** fits your “Custom YAML” flow

Wazuh ships a **certs-generator** container. We run it **once** at deploy time so it writes into your mounted `certs` folder; other service