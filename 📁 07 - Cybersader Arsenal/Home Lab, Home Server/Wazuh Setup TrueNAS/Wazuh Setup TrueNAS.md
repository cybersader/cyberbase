---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, October 5th 2025, 2:03 pm
date modified: Monday, October 13th 2025, 2:55 pm
---

- [Wazuh](https://wazuh.com/)
- [youtube.com > Take Control of Your Security: Free, Self-Hosted SIEM & Logs with Graylog, Wazuh, & Security Onion](https://www.youtube.com/watch?v=GZZZvLRSUvc&t=165s)
- [youtube.com > this Cybersecurity Platform is FREE](https://www.youtube.com/watch?v=i68atPbB8uQ)
- [youtube.com > Detection Engineering with Wazuh](https://www.youtube.com/watch?v=nSOqU1iX5oQ&t=413s)
- [youtube.com > Secure your HomeLab for FREE // Wazuh](https://www.youtube.com/watch?v=RjvKn0Q3rgg)
- [medium.com > Wazuh[00.001] Deploying Wazuh Using Docker Desktop on Windows (Step-by-Step)](https://medium.com/@prakrititimilsina56/wazuh-00-001-deploying-wazuh-using-docker-desktop-on-windows-step-by-step-0849a92b203e)

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

## Wazuh on TrueNAS SCALE (Fangtooth) — Quick Guide (custom-YAML edition)

### 0) What you’re deploying (single-node)

Wazuh single-node = **wazuh.indexer** (OpenSearch), **wazuh.manager**, **wazuh.dashboard**—with persistent storage and TLS between components. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

### 1) One-time host setting: `vm.max_map_count`

OpenSearch **requires** `vm.max_map_count >= 262144`. Even with Docker, set it on the **host**: **System Settings → Advanced → Sysctl → Add** → `vm.max_map_count = 262144`. (This persists across reboots/updates.) [OpenSearch Documentation+1](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)

If you ever need to verify: `cat /proc/sys/vm/max_map_count`. [OpenSearch Documentation](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)

* * *

### 2) Datasets (map the many volumes cleanly)

Two options:

- **Easiest:** one dataset, e.g. `/mnt/pool/wazuh`.
- **Better (recommended):** SSD/HDD split:
    - SSD for **indexer data** (heavy I/O): `/mnt/pool/wazuh-ssd/indexer-data`
    - HDD for “lighter” bits (manager data, dashboard config/cache, certs, etc.):
        
```
/mnt/pool/wazuh-hdd/manager/{api_configuration,etc,logs,queue,
							var_multigroups,integrations,active-response,
							agentless,wodles}
/mnt/pool/wazuh-hdd/filebeat/{etc,var}
/mnt/pool/wazuh-hdd/dashboard/{config,custom}
/mnt/pool/wazuh-hdd/certs
/mnt/pool/wazuh-hdd/config   # holds the ./config tree from git (yml + certs)
```

The Wazuh Docker docs show which components persist; we’re just binding those paths to your ZFS datasets. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

### 3) Per-app IP (no custom networks required)

Add an **alias IP** on your TrueNAS NIC (Network → Interfaces). In Compose, bind to that IP using `IP:HOSTPORT:CONTAINERPORT` (Compose supports it). Example:  
`"192.168.1.50:443:5601"` for the dashboard. 

> You do **not** need a `networks:` block for this plan; the default bridge is fine. Add macvlan only if you want L2 IPs **inside** Docker (not necessary here).

* * *

### 4) Reverse proxy with **Nginx Proxy Manager (NPM)**

- **Proxy only the Dashboard** to `https://APP_IP:443` (container exposes **5601**, we’ll bind it to 443 on the app IP).
- Keep **9200 (indexer)** internal (do not publish publicly). Keep **55000 (API)** LAN-only unless you truly need remote access. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
- Because the dashboard defaults to a **self-signed** upstream cert, either:
    - In NPM, allow invalid upstream certs **or**
    - Add an advanced block to **disable upstream verification** for this host:
        
        ```
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600;
        proxy_ssl_verify off;
        ```
        
    
    (Community-accepted snippet for NPM with self-signed upstream.) [GitHub](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/3332?utm_source=chatgpt.com)
    
- If you prefer **end-to-end TLS**, install a real cert **inside** the Wazuh dashboard (LE/third-party) and keep upstream verification enabled. [Wazuh Documentation+1](https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/configuring-third-party-certs/index.html?utm_source=chatgpt.com)
    

> **DNS-01** in NPM is only needed for wildcards or when HTTP-01 isn’t possible; otherwise HTTP-01 is simpler. [GitHub](https://github.com/wazuh/wazuh-docker/discussions/727?utm_source=chatgpt.com)


---

## 4) Certificates (no-shell, docker-run)

Wazuh uses TLS between components. Generate the cert bundle **once** with the official image and write into your repo’s `config/wazuh_indexer_ssl_certs` folder.

**Run from anywhere that can reach Docker on the TrueNAS host:**

> [!attention] match the path to your own truenas or other system setup

```bash
docker run --rm -it \
  -v /mnt/personal/wazuh-hdd/config/wazuh_indexer_ssl_certs:/certs \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator
```

This creates `root-ca.pem`, node certs/keys, and admin certs your stack mounts. (Tool/image are the official route.) [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

> If you prefer everything inside Compose, you can add a short-lived `wazuh.certs` service that runs the same generator before indexer starts; the effect is identical. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

## 5) Passwords (keep it simple on day 1)

There are **two** credential domains:

- **A) Wazuh Server API user** (`wazuh-wui`) that the **dashboard** uses over port **55000**
    - Put the **plain** password in both:
        - `docker-compose.yml` (env `API_PASSWORD` for dashboard/manager), and
        - `config/wazuh_dashboard/wazuh.yml` (this file is read by the dashboard).
    - **No `securityadmin.sh` is needed** for API users. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
- **B) Indexer internal users** (`admin`, `kibanaserver`) that live in the **OpenSearch security index**.
    - If/when you change these, you **must** hash the new password, update `config/wazuh_indexer/internal_users.yml`, then **reapply with `securityadmin.sh`** so the security index is updated. (One user at a time.) [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
        

### Optional “no-shell” `securityadmin.sh` later (docker-run)

If you rotate an **indexer** user in the future, you can run the tool without a shell login by launching a **throwaway indexer container** on the same network and mounting the certs/config:

```bash
# Assumes your stack's default network is "wazuh_default".
# If unsure, run `docker network ls` and adjust the --network name.
docker run --rm --network=wazuh_default \
  -v /mnt/pool/wazuh-hdd/config/wazuh_indexer_ssl_certs:/certs:ro \
  -v /mnt/pool/wazuh-hdd/config/wazuh_indexer:/sec:ro \
  wazuh/wazuh-indexer \
  bash -lc '\
    export CACERT=/certs/root-ca.pem; \
    export CERT=/certs/admin.pem; \
    export KEY=/certs/admin-key.pem; \
    /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh \
      -cd /sec/opensearch-security/ -nhnv \
      -cacert $CACERT -cert $CERT -key $KEY -p 9200 -icl \
      -h wazuh.indexer'
```

That’s the same command the docs call for—just executed via `docker run` pointed at `wazuh.indexer:9200` on the compose network. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

* * *

### 6) Certs generator: how it fits your repo + Custom-YAML flow

The compose you pasted expects cert/key files under `./config/wazuh_indexer_ssl_certs/...`. Generate them **once** using the official **wazuh-certs-generator** container, writing into your repo’s `config` directory (which you then bind-mount from a dataset). After that, regular upgrades don’t need the generator again. [Docker Hub+1](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

You can either:
- Run a **one-shot certs service** in Compose (`depends_on` waits for it), **or**
- Pre-generate certs with a manual `docker run ...` and commit them in your repo path under `/mnt/pool/wazuh-hdd/config`.

* * *

## Custom YAML (reworked from your file)

Changes vs. your original:

- **Per-app IP** via `APP_IP` in `.env`.
- **Passwords & usernames** moved to `.env`.
- **Many named volumes** swapped for **bind mounts** into your datasets.
- **9200** **not** published publicly; if you need it, bind it only to `127.0.0.1:9200` or your alias IP and firewall tightly.
- Dashboard’s **5601** bound to **443** on the alias IP (easier for NPM).
- Kept your **ulimits**.

```yaml
services:
  # 1) One-shot: generate TLS certs into your repo/config dir
  wazuh.certs:
    image: wazuh/wazuh-certs-generator:latest
    command: >
      bash -lc "/entrypoint.sh && echo CERTS_OK"
    environment:
      - NODE_NAME=wazuh.indexer
      - WAZUH_MANAGER=wazuh.manager
      - WAZUH_DASHBOARD=wazuh.dashboard
    volumes:
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs:/certs
    restart: "no"

  # 2) One-shot: rotate passwords (Indexer internal + Manager API) from file
  wazuh.passwords:
    image: wazuh/wazuh-indexer:4.13.1
    depends_on:
      wazuh.certs:
        condition: service_completed_successfully
    # We run the official "passwords tool" in file mode (-f) pointing at your YAML.
    # The tool lives in the indexer image path. Docs: file-based mode supported.
    command: >
      bash -lc "
        curl -sO https://packages.wazuh.com/4.13/wazuh-passwords-tool.sh &&
        chmod +x wazuh-passwords-tool.sh &&
        ./wazuh-passwords-tool.sh --file ${CONFIG_DIR}/passwords/passwords.yml &&
        echo PW_OK
      "
    volumes:
      - ${CONFIG_DIR}:/mnt/config
    environment:
      - CONFIG_DIR=/mnt/config
    restart: "no"

  wazuh.indexer:
    image: wazuh/wazuh-indexer:4.13.1
    hostname: wazuh.indexer
    restart: always
    depends_on:
      wazuh.passwords:
        condition: service_completed_successfully
    environment:
      - OPENSEARCH_JAVA_OPTS=${OPENSEARCH_JAVA_OPTS}
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile:  { soft: 65536, hard: 65536 }
    volumes:
      - ${DATA_SSD}/indexer-data:/var/lib/wazuh-indexer
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-indexer/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer-key.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.key:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin.pem:/usr/share/wazuh-indexer/certs/admin.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin-key.pem:/usr/share/wazuh-indexer/certs/admin-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer/wazuh.indexer.yml:/usr/share/wazuh-indexer/opensearch.yml:ro
      - ${CONFIG_DIR}/wazuh_indexer/internal_users.yml:/usr/share/wazuh-indexer/opensearch-security/internal_users.yml:ro
    # keep 9200 internal; do NOT publish it

  wazuh.manager:
    image: wazuh/wazuh-manager:4.13.1
    hostname: wazuh.manager
    restart: always
    depends_on:
      wazuh.indexer:
        condition: service_started
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile:  { soft: 655360, hard: 655360 }
    ports:
      - "${APP_IP}:1514:1514"
      - "${APP_IP}:1515:1515"
      - "${APP_IP}:514:514/udp"
      - "${APP_IP}:55000:55000"
    environment:
      - INDEXER_URL=https://wazuh.indexer:9200
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - FILEBEAT_SSL_VERIFICATION_MODE=full
      - SSL_CERTIFICATE_AUTHORITIES=/etc/ssl/root-ca.pem
      - SSL_CERTIFICATE=/etc/ssl/filebeat.pem
      - SSL_KEY=/etc/ssl/filebeat.key
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      - ${DATA_HDD}/manager/api_configuration:/var/ossec/api/configuration
      - ${DATA_HDD}/manager/etc:/var/ossec/etc
      - ${DATA_HDD}/manager/logs:/var/ossec/logs
      - ${DATA_HDD}/manager/queue:/var/ossec/queue
      - ${DATA_HDD}/manager/var_multigroups:/var/ossec/var/multigroups
      - ${DATA_HDD}/manager/integrations:/var/ossec/integrations
      - ${DATA_HDD}/manager/active-response:/var/ossec/active-response/bin
      - ${DATA_HDD}/manager/agentless:/var/ossec/agentless
      - ${DATA_HDD}/manager/wodles:/var/ossec/wodles
      - ${DATA_HDD}/filebeat/etc:/etc/filebeat
      - ${DATA_HDD}/filebeat/var:/var/lib/filebeat
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca-manager.pem:/etc/ssl/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager.pem:/etc/ssl/filebeat.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager-key.pem:/etc/ssl/filebeat.key:ro
      - ${CONFIG_DIR}/wazuh_cluster/wazuh_manager.conf:/wazuh-config-mount/etc/ossec.conf:ro

  wazuh.dashboard:
    image: wazuh/wazuh-dashboard:4.13.1
    hostname: wazuh.dashboard
    restart: always
    depends_on:
      - wazuh.indexer
      - wazuh.manager
    ports:
      - "${APP_IP}:443:5601"
    environment:
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - WAZUH_API_URL=https://wazuh.manager
      - DASHBOARD_USERNAME=${DASHBOARD_USERNAME}
      - DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard-key.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-dashboard/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_dashboard/opensearch_dashboards.yml:/usr/share/wazuh-dashboard/config/opensearch_dashboards.yml:ro
      - ${CONFIG_DIR}/wazuh_dashboard/wazuh.yml:/usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml:ro
      - ${DATA_HDD}/dashboard/config:/usr/share/wazuh-dashboard/data/wazuh/config
      - ${DATA_HDD}/dashboard/custom:/usr/share/wazuh-dashboard/plugins/wazuh/public/assets/custom
```

**.env (next to your compose):**

```
WAZUH_VERSION=4.13.1
WAZUH_IMAGE_VERSION=4.13.1
WAZUH_TAG_REVISION=1
FILEBEAT_TEMPLATE_BRANCH=4.13.1
WAZUH_FILEBEAT_MODULE=wazuh-filebeat-0.4.tar.gz
WAZUH_UI_REVISION=1

# Host bind
APP_IP=192.168.1.50

# Storage roots
DATA_SSD=/mnt/personal/APP_Configs/wazuh-ssd
DATA_HDD=/mnt/personal/wazuh-hdd
CONFIG_DIR=/mnt/pool/wazuh-hdd/config

# OpenSearch heap, tune later (± half of indexer RAM allocation)
OPENSEARCH_JAVA_OPTS=-Xms4g -Xmx4g

# Credentials (CHANGE THESE — see password-change doc)
INDEXER_USERNAME=admin
INDEXER_PASSWORD=ChangeMe_Admin_!
DASHBOARD_USERNAME=kibanaserver
DASHBOARD_PASSWORD=ChangeMe_Kibana_!
API_USERNAME=wazuh-wui
API_PASSWORD=ChangeMe_WUI_!
```

> After first login, follow **Changing the default password of Wazuh users (Docker)** to properly rotate the **indexer internal users** and **manager API** creds (there’s a specific sequence and hash-generation step for internal users). [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

* * *

### 7) Certs generator — two easy ways

#### Option A — one-shot container (no shell inside)

Run once from your code-server terminal (or any place with Docker access):

```bash
docker run --rm -it \
  -v /mnt/pool/wazuh-hdd/config/wazuh_indexer_ssl_certs:/certs \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator:latest
```

This populates `/mnt/pool/wazuh-hdd/config/wazuh_indexer_ssl_certs` with the **exact** files your compose mounts. Commit them or leave them on disk; you typically don’t regenerate unless you’re re-keying. [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

#### Option B — add a “generator” service to Compose

If you prefer everything in Compose, add a short-lived `wazuh.certs` service that writes into `${CONFIG_DIR}/wazuh_indexer_ssl_certs` and then exits; make `depends_on` the others with `condition: service_completed_successfully`. (Same idea as above, just automated.) [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/container-usage.html?utm_source=chatgpt.com)

* * *

### 8) NPM setup (quick)

- Proxy Host: `wazuh.example.com` → **https → ${APP_IP}:443**, **Websockets on**.
- If using the **self-signed** default: use the “allow invalid certs” toggle **or** add the `proxy_ssl_verify off;` advanced block (above). [GitHub](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/3332?utm_source=chatgpt.com)
- If you install a **trusted** cert **inside** the dashboard (LE), you can keep upstream verification on. [Wazuh Documentation+1](https://documentation.wazuh.com/current/user-manual/wazuh-dashboard/configuring-third-party-certs/index.html?utm_source=chatgpt.com)

* * *

### 9) Ports you should/shouldn’t publish

- **Publish on APP_IP:** `1514/tcp+udp` (syslog—your file maps tcp; you can add udp), `1515/tcp` (agent enrollment), `55000/tcp` (API—keep LAN-only), `443/tcp` (dashboard → NPM).
- **Keep internal:** `9200/tcp` (indexer/OpenSearch). If you _must_ expose, bind to `127.0.0.1:9200` only and reverse-proxy/VPN into it. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

### 10) Upgrades later

Bump image tags and follow Wazuh’s **Upgrading Wazuh Docker** steps. Your bind-mount datasets keep data/certs intact. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/upgrading-wazuh-docker.html?utm_source=chatgpt.com)

* * *

#### Why this fits your “code-server → Custom YAML” workflow

- All config/certs live in your **repo path** (bind-mounted from datasets), so you can edit in code-server.
- The **generator** runs outside or once via Compose; no manual “bash into container then copy files” dance. [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)
- The only host tweak is the **sysctl** (done once, in UI). [OpenSearch Documentation](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)

# Wazuh on TrueNAS SCALE (Fangtooth) — Complete Guide (Custom YAML + docker-run)

## 0) What you’re deploying

Single-node Wazuh = **indexer** (OpenSearch) + **manager** + **dashboard**, with TLS between them. This mirrors the official single-node Docker layout. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

## 1) One-time host prerequisite (TrueNAS UI)

OpenSearch requires **`vm.max_map_count ≥ 262144`** on the **host** (even in Docker).  
TrueNAS: **System Settings → Advanced → Sysctl → Add** → `vm.max_map_count = 262144`.  
Verify in the Web Shell anytime: `cat /proc/sys/vm/max_map_count`. [OpenSearch Documentation+1](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)

* * *

## 2) Storage layout (datasets you bind-mount)

Pick one:

- **Simple:** one dataset, e.g. `/mnt/pool/wazuh`.
- **Better (recommended):** split by speed
    - **SSD**: `/mnt/pool/wazuh-ssd/indexer-data` (heavy I/O)
    - **HDD**:

        ```
        /mnt/pool/wazuh-hdd/manager/{api_configuration,etc,logs,queue,
                                    var_multigroups,integrations,active-response,
                                    agentless,wodles}
        /mnt/pool/wazuh-hdd/filebeat/{etc,var}
        /mnt/pool/wazuh-hdd/dashboard/{config,custom}
        /mnt/pool/wazuh-hdd/config    # your ./config tree (yml + certs)
        /mnt/pool/wazuh-hdd/certs     # optional separate certs folder
        ```


These paths map directly to the volumes in the Wazuh Docker docs. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

## 3) Per-app IP (no custom networks)

Add an **alias IP** on your TrueNAS NIC (Network → Interfaces). In Compose, publish to that IP via the normal `IP:HOSTPORT:CONTAINERPORT` form (e.g., `192.168.1.24:443:5601`). No `networks:` section is required unless you intentionally set up macvlan. [Docker Documentation](https://docs.docker.com/compose/how-tos/environment-variables/envvars/?utm_source=chatgpt.com)

* * *

## 4) Certificates (must run once from the **TrueNAS Web Shell**)

Wazuh uses TLS between components. Generate the cert bundle **once** with the official generator, outputting into your repo’s `config/wazuh_indexer_ssl_certs` (adjust the host path to your dataset):

```bash
docker run --rm -it \
  -v /mnt/personal/wazuh-hdd/config/wazuh_indexer_ssl_certs:/certs \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator
```

This creates `root-ca.pem`, node certs/keys, and the admin client certs that your stack mounts. (This is the supported route.) [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

> If you prefer, you can create a short-lived `wazuh.certs` service in Compose that runs the same image before `wazuh.indexer` starts; effect is identical. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

* * *

## 5) Passwords - what needs what (and when)

There are **two** credential domains:

**A) Wazuh Manager API user** (`wazuh-wui`) — used by **Dashboard → Manager** over **55000**
- Put the **plain** password in both places:
    - your compose envs (`API_USERNAME` / `API_PASSWORD`) and
    - the Dashboard config file you mount: `config/wazuh_dashboard/wazuh.yml`.
- **No `securityadmin.sh` here.** This is not part of the OpenSearch security index. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

**B) Indexer internal users** (`admin`, `kibanaserver`) — live in **OpenSearch security index**
- When you change them you must:
    1. set the **plain** password in your compose/envs where referenced,
    2. generate a **hash** (using `hash.sh`) and place it into `config/wazuh_indexer/internal_users.yml`, then
    3. **apply with `securityadmin.sh`** so OpenSearch loads the updated file into its security index.  
        (You can only change **one user at a time**.) [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

### How to run `securityadmin.sh` from the TrueNAS Web Shell (no interactive container exec)

When you rotate an **indexer** user later, use a throwaway container that sits on the same Docker network and mounts your certs and security config. Example:

For each password change, and in this order,...

```bash
# In TrueNAS Web Shell
cd /mnt/personal/docker-configs/wazuh

# Stop all services
docker compose down

# Start only indexer
docker compose up -d wazuh.indexer

# Wait for indexer to be ready
sleep 30

# Apply security configuration (update OpenSearch internal database)
docker run --rm --network=wazuh_default \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certs:ro \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer:/sec:ro \
  wazuh/wazuh-indexer:4.13.1 \
  bash -lc '\
    export CACERT=/certs/root-ca.pem; \
    export CERT=/certs/admin.pem; \
    export KEY=/certs/admin-key.pem; \
    /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh \
      -cd /sec/opensearch-security/ -nhnv \
      -cacert $CACERT -cert $CERT -key $KEY -p 9200 -icl \
      -h wazuh.indexer'
```

```bash
docker exec -it wazuh-wazuh.indexer-1 bash
```

```bash
# 1) (Optional) generate a new hash to paste into internal_users.yml:
docker run --rm wazuh/wazuh-indexer \
  bash -lc '/usr/share/wazuh-indexer/plugins/opensearch-security/tools/hash.sh -p "NEWSTRONGPASSWORD"'

# -> copy the resulting hash into:
#    /mnt/personal/wazuh-hdd/config/wazuh_indexer/internal_users.yml
#    (for the one user you're changing)

# 2) Apply the change to the OpenSearch security index:
docker run --rm --network=wazuh_default \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certs:ro \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer:/sec:ro \
  wazuh/wazuh-indexer:4.13.1 \
  bash -lc '\
    export CACERT=/certs/root-ca.pem; \
    export CERT=/certs/admin.pem; \
    export KEY=/certs/admin-key.pem; \
    /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh \
      -cd /sec/opensearch-security/ -nhnv \
      -cacert $CACERT -cert $CERT -key $KEY -p 9200 -icl \
      -h wazuh.indexer'
```

OpenSearch does **not** auto-apply edits to `internal_users.yml`; running `securityadmin.sh` is the documented step that loads your changes into the index. [OpenSearch Documentation](https://docs.opensearch.org/latest/security/configuration/security-admin/?utm_source=chatgpt.com)

* * *

## 6) Reverse proxy (Nginx Proxy Manager)

- Proxy **only the Dashboard**: `https://<APP_IP>:443` (container **5601** → host **443** on the alias IP).
- Keep **9200 (indexer)** private. Keep **55000 (API)** LAN-only unless truly needed off-LAN. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
- Because upstream is **self-signed** by default, either allow invalid upstream certs or add in **Advanced**:
    
    ```
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 3600;
    proxy_ssl_verify off;
    ```
    
    (Community-documented approach.) If you later install a trusted cert **inside** the Dashboard, keep verification on. [GitHub+2Wazuh Documentation+2](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/3332?utm_source=chatgpt.com)

* * *

## 7) Compose + `.env` (and where the `.env` must live)

### Where must `.env` be?

- **Default:** place `.env` **next to your `compose.yaml`** (same directory). That’s where Compose auto-loads it. [Docker Documentation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)
- If you keep `.env` higher up (e.g., in `wazuh/` while `compose.yaml` is in `wazuh/single-node/`), then either:
    - run compose **from the parent** with `COMPOSE_FILE=single-node/compose.yaml`, so the “project directory” is the parent and `.env` is found there, **or**
    - keep running from `single-node/` but add **`--env-file ../.env`** (Compose v2) **or** use `env_file:` entries in your services. The path is **relative to the compose file**. [Docker Documentation+1](https://docs.docker.com/compose/how-tos/environment-variables/envvars/?utm_source=chatgpt.com)

### Compose file (no `version:` key)

Modern Compose no longer requires a top-level `version:`; omit it. (Compose v2 ignores it.) [Docker Documentation](https://docs.docker.com/compose/how-tos/environment-variables/envvars/?utm_source=chatgpt.com)

> You already have a working compose; keep your bindings and per-app IP as-is. Ensure the Dashboard mount `config/wazuh_dashboard/wazuh.yml` contains the **plain** `API_PASSWORD` (Compose will **not** substitute `${API_PASSWORD}` inside mounted files). [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

* * *

## 8) Bring-up sequence (exact steps)

All commands below run from the **TrueNAS Web Shell**.

1. **Set the host sysctl** (TrueNAS UI → Sysctl) and verify:  
    `cat /proc/sys/vm/max_map_count` (must be `262144+`). [OpenSearch Documentation](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)
2. **Create datasets** (SSD/HDD) per §2 and put your repo under them.
3. **Generate TLS certs** (once) per §4 (`docker run ... wazuh/wazuh-certs-generator`). [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)
4. **Review secrets**:
    - Put the **plain** API password in `config/wazuh_dashboard/wazuh.yml` and make it match your `.env` `API_PASSWORD`.
    - Set `INDEXER_USERNAME/PASSWORD` and `DASHBOARD_USERNAME/PASSWORD` in `.env` for Dashboard ↔ Indexer auth (those are _plain_ values used by services). [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
5. **Deploy the Custom App** in TrueNAS (Apps → Custom → paste your compose YAML or point to it).
    - Publish ports only on your **alias IP** (`443→5601`, `1514`, `1515`, `55000`, plus optional `514/udp`).
    - **Do not** publish 9200. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
6. **Configure NPM** to proxy the Dashboard per §6.
7. **First login** to Dashboard using your configured credentials.
8. (Optional, later) **Rotate indexer user(s)**: generate hash → edit `internal_users.yml` → apply with **`securityadmin.sh`** via the docker-run one-shot in §5. [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)

* * *

## 9) Ports: expose vs. keep private

- **Expose on APP_IP**:
    
    - `443/tcp` (Dashboard → NPM),
    - `1515/tcp` (agent enrollment),
    - `1514/tcp` (+ optionally `1514/udp` for syslog),
    - `55000/tcp` (Manager API—keep LAN-only).
        
- **Keep internal**: `9200/tcp` (Indexer/OpenSearch). If you must touch it, bind to `127.0.0.1:9200` temporarily. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    

* * *

## 10) Upgrades later

Bump the image tags and follow the Wazuh Docker upgrade notes—your bind-mounted datasets (data/certs/config) persist across redeploys. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/index.html?utm_source=chatgpt.com)

* * *

### Why these steps line up with the docs

- **Single-node stack + volumes/ports**: Wazuh’s Docker guide. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    
- **`vm.max_map_count`**: OpenSearch requires it even with Docker. [OpenSearch Documentation](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)
    
- **Certs generator**: Official Wazuh image for TLS. [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)
    
- **Password changes**: the Docker-specific flow and the “apply with `securityadmin.sh`” step come straight from Wazuh + OpenSearch security docs. [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
    
- **`.env` location / `env_file` / COMPOSE_FILE**: official Docker Compose docs. [Docker Documentation+2Docker Documentation+2](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)
    
- **NPM upstream TLS**: using self-signed upstreams and disabling upstream verification if you haven’t installed a trusted cert yet. [GitHub](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/3332?utm_source=chatgpt.com)
    

* * *

## FAQ (quick)

**Does the depth of my `.env` file matter?**  
Yes. By default, Compose reads `.env` from the **same directory** as `compose.yaml`. If your `.env` is under `wazuh/` but your compose is under `wazuh/single-node/`, either move `.env` next to the compose **or** run from the parent with `COMPOSE_FILE=single-node/compose.yaml` **or** use `--env-file`/`env_file:` to point at it. [Docker Documentation+2Docker Documentation+2](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)

**Do I really have to run commands from the TrueNAS Web Shell?**  
For **cert generation** and (later) **`securityadmin.sh`**, yes—the official guidance expects those to run in the Docker host context; we’ve provided **docker-run** invocations so you don’t have to “exec” into containers. [Docker Hub+1](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

**Why keep 9200 private?**  
It’s the Indexer/OpenSearch API. Only the Manager/Filebeat/Dashboard should talk to it. Publishing it increases risk with no benefit in single-node. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)

## Resetting Configs Except Env and Compose YAML

Removing certs:

```
rm -rf /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs/*
```

Regenerating certs:

```
docker run --rm -it \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certs \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator:4.13.1
```

```bash
cd /mnt/personal/docker-configs/wazuh

# Stop all services
docker compose down -v

# Remove any leftover containers
docker container rm -f $(docker container ls -aq --filter "name=wazuh") 2>/dev/null || echo "No containers to remove"

# Remove all wazuh-related volumes
docker volume rm $(docker volume ls -q | grep wazuh) 2>/dev/null || echo "No volumes to remove"

# Nuclear option - remove ALL unused containers, networks, images, and volumes
docker system prune -af --volumes

# Verify nothing wazuh-related remains
docker ps -a | grep wazuh || echo "✅ No Wazuh containers"
docker volume ls | grep wazuh || echo "✅ No Wazuh volumes" 
docker network ls | grep wazuh || echo "✅ No Wazuh networks"
```

Delete all config data and certs:

```bash
cd /mnt/personal/docker-configs/wazuh

# Show what we're about to delete
echo "=== WILL DELETE ==="
ls -la config/ 2>/dev/null || echo "No config directory"

echo "=== WILL KEEP ==="
ls -la docker-compose.yml .env 2>/dev/null

# Delete all config directories and files
rm -rf config/

# Verify clean slate
ls -la
echo "✅ Config data deleted"
```

Create fresh directory structure:

```bash
cd /mnt/personal/docker-configs/wazuh

# Create fresh config directories
mkdir -p config/wazuh_indexer_ssl_certs
mkdir -p config/wazuh_indexer
mkdir -p config/wazuh_indexer/opensearch-security
mkdir -p config/wazuh_dashboard
mkdir -p config/wazuh_cluster

# Verify directory structure
tree config/ || find config/ -type d
echo "✅ Fresh directories created"
```

Next Steps After Reset:
1. Regenerate certificates (manual or auto)
2. Create minimal config files (indexer, dashboard configs)
3. Deploy with default passwords first
4. Test that it works
5. Then change passwords if desired

# Troubleshooting File Contents

## docker-compose.yml

```
services:
  wazuh.indexer:
    image: wazuh/wazuh-indexer:4.13.1
    hostname: wazuh.indexer
    restart: unless-stopped
    environment:
      - OPENSEARCH_JAVA_OPTS=${OPENSEARCH_JAVA_OPTS}
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile: { soft: 65536, hard: 65536 }
    volumes:
      # Named volume (Docker manages permissions)
      - wazuh-indexer-data:/var/lib/wazuh-indexer
      # Config files still use bind mounts (read-only, no permission issues)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-indexer/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer-key.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.key:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin.pem:/usr/share/wazuh-indexer/certs/admin.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin-key.pem:/usr/share/wazuh-indexer/certs/admin-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer/wazuh.indexer.yml:/usr/share/wazuh-indexer/opensearch.yml:ro
      - ${CONFIG_DIR}/wazuh_indexer/internal_users.yml:/usr/share/wazuh-indexer/opensearch-security/internal_users.yml:ro

  wazuh.manager:
    image: wazuh/wazuh-manager:4.13.1
    hostname: wazuh.manager
    restart: unless-stopped
    depends_on:
      - wazuh.indexer
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile: { soft: 655360, hard: 655360 }
    ports:
      - "${APP_IP}:1514:1514"
      - "${APP_IP}:1515:1515" 
      - "${APP_IP}:514:514/udp"
      - "${APP_IP}:55000:55000"
    environment:
      - INDEXER_URL=https://wazuh.indexer:9200
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - FILEBEAT_SSL_VERIFICATION_MODE=full
      - SSL_CERTIFICATE_AUTHORITIES=/etc/ssl/root-ca.pem
      - SSL_CERTIFICATE=/etc/ssl/filebeat.pem
      - SSL_KEY=/etc/ssl/filebeat.key
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      # Named volumes (Docker manages permissions)
      - wazuh_api_configuration:/var/ossec/api/configuration
      - wazuh_etc:/var/ossec/etc
      - wazuh_logs:/var/ossec/logs
      - wazuh_queue:/var/ossec/queue
      - wazuh_var_multigroups:/var/ossec/var/multigroups
      - wazuh_integrations:/var/ossec/integrations
      - wazuh_active_response:/var/ossec/active-response/bin
      - wazuh_agentless:/var/ossec/agentless
      - wazuh_wodles:/var/ossec/wodles
      - filebeat_etc:/etc/filebeat
      - filebeat_var:/var/lib/filebeat
      # Config files (bind mounts)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/etc/ssl/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager.pem:/etc/ssl/filebeat.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager-key.pem:/etc/ssl/filebeat.key:ro
      - ${CONFIG_DIR}/wazuh_cluster/wazuh_manager.conf:/wazuh-config-mount/etc/ossec.conf:ro

  wazuh.dashboard:
    image: wazuh/wazuh-dashboard:4.13.1
    hostname: wazuh.dashboard
    restart: unless-stopped
    depends_on:
      - wazuh.indexer
      - wazuh.manager
    ports:
      - "${APP_IP}:443:5601"
    environment:
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - WAZUH_API_URL=https://wazuh.manager
      - DASHBOARD_USERNAME=${DASHBOARD_USERNAME}
      - DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      # Named volumes (Docker manages permissions)
      - wazuh-dashboard-config:/usr/share/wazuh-dashboard/data/wazuh/config
      - wazuh-dashboard-custom:/usr/share/wazuh-dashboard/plugins/wazuh/public/assets/custom
      # Config files (bind mounts)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard-key.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-dashboard/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_dashboard/opensearch_dashboards.yml:/usr/share/wazuh-dashboard/config/opensearch_dashboards.yml:ro
      - ${CONFIG_DIR}/wazuh_dashboard/wazuh.yml:/usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml:ro

# Named volumes (Docker creates and manages these)
volumes:
  wazuh_api_configuration:
  wazuh_etc:
  wazuh_logs:
  wazuh_queue:
  wazuh_var_multigroups:
  wazuh_integrations:
  wazuh_active_response:
  wazuh_agentless:
  wazuh_wodles:
  filebeat_etc:
  filebeat_var:
  wazuh-indexer-data:
  wazuh-dashboard-config:
  wazuh-dashboard-custom:
```

## .env

```
WAZUH_VERSION=4.13.1
WAZUH_IMAGE_VERSION=4.13.1
WAZUH_TAG_REVISION=1
FILEBEAT_TEMPLATE_BRANCH=4.13.1
WAZUH_FILEBEAT_MODULE=wazuh-filebeat-0.4.tar.gz
WAZUH_UI_REVISION=1

# Host bind
APP_IP=192.168.1.29

# Storage roots
DATA_SSD=/mnt/personal/APP_Configs/wazuh-ssd
DATA_HDD=/mnt/personal/wazuh-hdd
CONFIG_DIR=/mnt/personal/docker-configs/wazuh/config

# OpenSearch heap, tune later (± half of indexer RAM allocation)
OPENSEARCH_JAVA_OPTS=-Xms4g -Xmx4g

# Credentials (CHANGE THESE — see password-change doc)
INDEXER_USERNAME=admin
INDEXER_PASSWORD=PASSWORD_HERE
DASHBOARD_USERNAME=kibanaserver
DASHBOARD_PASSWORD=PASSWORD_HERE
API_USERNAME=wazuh-wui
API_PASSWORD=PASSWORD_HERE
```

# LOGS

## Wazuh.indexer

```
2025-10-13 15:50:27.365727+00:00WARNING: Using incubator modules: jdk.incubator.vector
2025-10-13 15:50:27.401149+00:00WARNING: A terminally deprecated method in java.lang.System has been called
2025-10-13 15:50:27.401189+00:00WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.OpenSearch (file:/usr/share/wazuh-indexer/lib/opensearch-2.19.2.jar)
2025-10-13 15:50:27.401195+00:00WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.OpenSearch
2025-10-13 15:50:27.401213+00:00WARNING: System::setSecurityManager will be removed in a future release
2025-10-13 15:50:27.766711+00:00Oct 13, 2025 3:50:27 PM sun.util.locale.provider.LocaleProviderAdapter <clinit>
2025-10-13 15:50:27.766759+00:00WARNING: COMPAT locale provider will be removed in a future release
2025-10-13 15:50:28.023762+00:00WARNING: A terminally deprecated method in java.lang.System has been called
2025-10-13 15:50:28.023787+00:00WARNING: System::setSecurityManager has been called by org.opensearch.bootstrap.Security (file:/usr/share/wazuh-indexer/lib/opensearch-2.19.2.jar)
2025-10-13 15:50:28.023791+00:00WARNING: Please consider reporting this to the maintainers of org.opensearch.bootstrap.Security
2025-10-13 15:50:28.023801+00:00WARNING: System::setSecurityManager will be removed in a future release
2025-10-13 15:50:28.027027+00:00[2025-10-13T15:50:28,026][INFO ][o.o.n.Node               ] [wazuh.indexer] version[2.19.2], pid[1], build[rpm/63bef474b662d18fef0c73e0bd7660a8c5024121/2025-09-23T11:09:10.698387729Z], OS[Linux/6.12.15-production+truenas/amd64], JVM[Eclipse Adoptium/OpenJDK 64-Bit Server VM/21.0.6/21.0.6+7-LTS]
2025-10-13 15:50:28.027884+00:00[2025-10-13T15:50:28,027][INFO ][o.o.n.Node               ] [wazuh.indexer] JVM home [/usr/share/wazuh-indexer/jdk], using bundled JDK/JRE [true]
2025-10-13 15:50:28.028104+00:00[2025-10-13T15:50:28,028][INFO ][o.o.n.Node               ] [wazuh.indexer] JVM arguments [-Xshare:auto, -Dopensearch.networkaddress.cache.ttl=60, -Dopensearch.networkaddress.cache.negative.ttl=10, -XX:+AlwaysPreTouch, -Xss1m, -Djava.awt.headless=true, -Dfile.encoding=UTF-8, -Djna.nosys=true, -XX:-OmitStackTraceInFastThrow, -XX:+ShowCodeDetailsInExceptionMessages, -Dio.netty.noUnsafe=true, -Dio.netty.noKeySetOptimization=true, -Dio.netty.recycler.maxCapacityPerThread=0, -Dio.netty.allocator.numDirectArenas=0, -Dlog4j.shutdownHookEnabled=false, -Dlog4j2.disable.jmx=true, -Djava.security.manager=allow, -Djava.locale.providers=SPI,COMPAT, -XX:+UseG1GC, -XX:G1ReservePercent=25, -XX:InitiatingHeapOccupancyPercent=30, -Djava.io.tmpdir=/tmp/opensearch-10726014082122382092, -XX:+HeapDumpOnOutOfMemoryError, -XX:HeapDumpPath=/var/lib/wazuh-indexer, -XX:ErrorFile=/var/log/wazuh-indexer/hs_err_pid%p.log, -Xlog:gc*,gc+age=trace,safepoint:file=/var/log/wazuh-indexer/gc.log:utctime,pid,tags:filecount=32,filesize=64m, -Djava.security.manager=allow, --add-modules=jdk.incubator.vector, -Djava.util.concurrent.ForkJoinPool.common.threadFactory=org.opensearch.secure_sm.SecuredForkJoinWorkerThreadFactory, -Dclk.tck=100, -Djdk.attach.allowAttachSelf=true, -Djava.security.policy=file:///usr/share/wazuh-indexer/opensearch-performance-analyzer/opensearch_security.policy, --add-opens=jdk.attach/sun.tools.attach=ALL-UNNAMED, -Xms4g, -Xmx4g, -XX:MaxDirectMemorySize=2147483648, -Dopensearch.path.home=/usr/share/wazuh-indexer, -Dopensearch.path.conf=/usr/share/wazuh-indexer, -Dopensearch.distribution.type=rpm, -Dopensearch.bundled_jdk=true]
2025-10-13 15:50:28.148912+00:00[2025-10-13T15:50:28,148][INFO ][o.a.l.i.v.PanamaVectorizationProvider] [wazuh.indexer] Java vector incubator API enabled; uses preferredBitSize=512; FMA enabled
2025-10-13 15:50:28.714326+00:00[2025-10-13T15:50:28,714][INFO ][o.o.s.s.t.SSLConfig      ] [wazuh.indexer] SSL dual mode is disabled
2025-10-13 15:50:28.714749+00:00[2025-10-13T15:50:28,714][INFO ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] OpenSearch Config path is /usr/share/wazuh-indexer
2025-10-13 15:50:28.899528+00:00[2025-10-13T15:50:28,899][INFO ][o.o.s.s.SslSettingsManager] [wazuh.indexer] TLS HTTP Provider                    : JDK
2025-10-13 15:50:28.900183+00:00[2025-10-13T15:50:28,900][INFO ][o.o.s.s.SslSettingsManager] [wazuh.indexer] Enabled TLS protocols for HTTP layer : [TLSv1.3, TLSv1.2]
2025-10-13 15:50:28.901344+00:00[2025-10-13T15:50:28,901][INFO ][o.o.s.s.SslSettingsManager] [wazuh.indexer] TLS Transport Client Provider             : JDK
2025-10-13 15:50:28.901732+00:00[2025-10-13T15:50:28,901][INFO ][o.o.s.s.SslSettingsManager] [wazuh.indexer] TLS Transport Server Provider             : JDK
2025-10-13 15:50:28.901935+00:00[2025-10-13T15:50:28,901][INFO ][o.o.s.s.SslSettingsManager] [wazuh.indexer] Enabled TLS protocols for Transport layer : [TLSv1.3, TLSv1.2]
2025-10-13 15:50:29.296445+00:00[2025-10-13T15:50:29,296][INFO ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Clustername: opensearch
2025-10-13 15:50:29.392369+00:00[2025-10-13T15:50:29,392][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Directory /usr/share/wazuh-indexer/certs has insecure file permissions (should be 0700)
2025-10-13 15:50:29.392994+00:00[2025-10-13T15:50:29,392][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Directory /usr/share/wazuh-indexer/.cache has insecure file permissions (should be 0700)
2025-10-13 15:50:29.393439+00:00[2025-10-13T15:50:29,393][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Directory /usr/share/wazuh-indexer/.cache/JNA has insecure file permissions (should be 0700)
2025-10-13 15:50:29.393790+00:00[2025-10-13T15:50:29,393][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Directory /usr/share/wazuh-indexer/.cache/JNA/temp has insecure file permissions (should be 0700)
2025-10-13 15:50:29.394139+00:00[2025-10-13T15:50:29,394][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/opensearch.yml has insecure file permissions (should be 0600)
2025-10-13 15:50:29.394445+00:00[2025-10-13T15:50:29,394][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Directory /usr/share/wazuh-indexer/logs has insecure file permissions (should be 0700)
2025-10-13 15:50:29.395065+00:00[2025-10-13T15:50:29,394][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/opensearch-security/internal_users.yml has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395087+00:00[2025-10-13T15:50:29,394][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395104+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-shard has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395289+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/indexer-security-init.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395470+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-upgrade has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395651+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-keystore has insecure file permissions (should be 0600)
2025-10-13 15:50:29.395835+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-env has insecure file permissions (should be 0600)
2025-10-13 15:50:29.396013+00:00[2025-10-13T15:50:29,395][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/systemd-entrypoint has insecure file permissions (should be 0600)
2025-10-13 15:50:29.396228+00:00[2025-10-13T15:50:29,396][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-performance-analyzer/performance-analyzer-agent has insecure file permissions (should be 0600)
2025-10-13 15:50:29.396400+00:00[2025-10-13T15:50:29,396][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-performance-analyzer/performance-analyzer-agent-cli has insecure file permissions (should be 0600)
2025-10-13 15:50:29.396683+00:00[2025-10-13T15:50:29,396][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-node has insecure file permissions (should be 0600)
2025-10-13 15:50:29.396787+00:00[2025-10-13T15:50:29,396][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-plugin has insecure file permissions (should be 0600)
2025-10-13 15:50:29.397002+00:00[2025-10-13T15:50:29,396][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-cli has insecure file permissions (should be 0600)
2025-10-13 15:50:29.397257+00:00[2025-10-13T15:50:29,397][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/bin/opensearch-env-from-file has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398017+00:00[2025-10-13T15:50:29,397][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/lib/jspawnhelper has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398036+00:00[2025-10-13T15:50:29,397][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/lib/modules has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398048+00:00[2025-10-13T15:50:29,397][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jdeprscan has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398203+00:00[2025-10-13T15:50:29,398][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/javap has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398567+00:00[2025-10-13T15:50:29,398][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jdb has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398717+00:00[2025-10-13T15:50:29,398][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/javac has insecure file permissions (should be 0600)
2025-10-13 15:50:29.398970+00:00[2025-10-13T15:50:29,398][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jrunscript has insecure file permissions (should be 0600)
2025-10-13 15:50:29.399197+00:00[2025-10-13T15:50:29,399][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jhsdb has insecure file permissions (should be 0600)
2025-10-13 15:50:29.399452+00:00[2025-10-13T15:50:29,399][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jps has insecure file permissions (should be 0600)
2025-10-13 15:50:29.399732+00:00[2025-10-13T15:50:29,399][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/serialver has insecure file permissions (should be 0600)
2025-10-13 15:50:29.400084+00:00[2025-10-13T15:50:29,399][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/keytool has insecure file permissions (should be 0600)
2025-10-13 15:50:29.400248+00:00[2025-10-13T15:50:29,400][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jstat has insecure file permissions (should be 0600)
2025-10-13 15:50:29.400473+00:00[2025-10-13T15:50:29,400][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jstatd has insecure file permissions (should be 0600)
2025-10-13 15:50:29.400682+00:00[2025-10-13T15:50:29,400][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jlink has insecure file permissions (should be 0600)
2025-10-13 15:50:29.401013+00:00[2025-10-13T15:50:29,400][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/rmiregistry has insecure file permissions (should be 0600)
2025-10-13 15:50:29.401237+00:00[2025-10-13T15:50:29,401][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jshell has insecure file permissions (should be 0600)
2025-10-13 15:50:29.401424+00:00[2025-10-13T15:50:29,401][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jconsole has insecure file permissions (should be 0600)
2025-10-13 15:50:29.401605+00:00[2025-10-13T15:50:29,401][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jwebserver has insecure file permissions (should be 0600)
2025-10-13 15:50:29.401839+00:00[2025-10-13T15:50:29,401][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jmap has insecure file permissions (should be 0600)
2025-10-13 15:50:29.402145+00:00[2025-10-13T15:50:29,402][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jcmd has insecure file permissions (should be 0600)
2025-10-13 15:50:29.402342+00:00[2025-10-13T15:50:29,402][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jstack has insecure file permissions (should be 0600)
2025-10-13 15:50:29.402522+00:00[2025-10-13T15:50:29,402][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jinfo has insecure file permissions (should be 0600)
2025-10-13 15:50:29.402825+00:00[2025-10-13T15:50:29,402][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jpackage has insecure file permissions (should be 0600)
2025-10-13 15:50:29.403096+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/javadoc has insecure file permissions (should be 0600)
2025-10-13 15:50:29.403271+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jfr has insecure file permissions (should be 0600)
2025-10-13 15:50:29.403492+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jdeps has insecure file permissions (should be 0600)
2025-10-13 15:50:29.403662+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/java has insecure file permissions (should be 0600)
2025-10-13 15:50:29.403845+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jmod has insecure file permissions (should be 0600)
2025-10-13 15:50:29.404012+00:00[2025-10-13T15:50:29,403][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jar has insecure file permissions (should be 0600)
2025-10-13 15:50:29.404205+00:00[2025-10-13T15:50:29,404][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jarsigner has insecure file permissions (should be 0600)
2025-10-13 15:50:29.404474+00:00[2025-10-13T15:50:29,404][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/jdk/bin/jimage has insecure file permissions (should be 0600)
2025-10-13 15:50:29.404899+00:00[2025-10-13T15:50:29,404][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/plugins/opensearch-security/tools/audit_config_migrater.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.405045+00:00[2025-10-13T15:50:29,404][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/plugins/opensearch-security/tools/wazuh-passwords-tool.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.405281+00:00[2025-10-13T15:50:29,405][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/plugins/opensearch-security/tools/hash.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.405465+00:00[2025-10-13T15:50:29,405][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.405666+00:00[2025-10-13T15:50:29,405][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/plugins/opensearch-security/tools/wazuh-certs-tool.sh has insecure file permissions (should be 0600)
2025-10-13 15:50:29.405855+00:00[2025-10-13T15:50:29,405][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/performance-analyzer-rca/bin/performance-analyzer-agent has insecure file permissions (should be 0600)
2025-10-13 15:50:29.406096+00:00[2025-10-13T15:50:29,405][WARN ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] File /usr/share/wazuh-indexer/performance-analyzer-rca/bin/performance-analyzer-rca has insecure file permissions (should be 0600)
2025-10-13 15:50:31.296154+00:00[2025-10-13T15:50:31,295][INFO ][o.o.p.c.c.PluginSettings ] [wazuh.indexer] Trying to create directory /dev/shm/performanceanalyzer/.
2025-10-13 15:50:31.296559+00:00[2025-10-13T15:50:31,296][INFO ][o.o.p.c.c.PluginSettings ] [wazuh.indexer] Config: metricsLocation: /dev/shm/performanceanalyzer/, metricsDeletionInterval: 1, httpsEnabled: false, cleanup-metrics-db-files: true, batch-metrics-retention-period-minutes: 7, rpc-port: 9650, webservice-port 9600
2025-10-13 15:50:31.576676+00:00[2025-10-13T15:50:31,576][INFO ][o.o.i.r.ReindexPlugin    ] [wazuh.indexer] ReindexPlugin reloadSPI called
2025-10-13 15:50:31.577495+00:00[2025-10-13T15:50:31,577][INFO ][o.o.i.r.ReindexPlugin    ] [wazuh.indexer] Unable to find any implementation for RemoteReindexExtension
2025-10-13 15:50:31.593492+00:00[2025-10-13T15:50:31,593][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: opensearch_time_series_analytics, index: .opendistro-anomaly-detector-jobs
2025-10-13 15:50:31.606722+00:00[2025-10-13T15:50:31,606][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: reports-scheduler, index: .opendistro-reports-definitions
2025-10-13 15:50:31.607597+00:00[2025-10-13T15:50:31,607][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: opendistro-index-management, index: .opendistro-ism-config
2025-10-13 15:50:31.609011+00:00[2025-10-13T15:50:31,608][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: checkBatchJobTaskStatus, index: .ml_commons_task_polling_job
2025-10-13 15:50:31.609781+00:00[2025-10-13T15:50:31,609][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: scheduler_geospatial_ip2geo_datasource, index: .scheduler-geospatial-ip2geo-datasource
2025-10-13 15:50:31.610798+00:00[2025-10-13T15:50:31,610][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: async-query-scheduler, index: .async-query-scheduler
2025-10-13 15:50:31.614557+00:00[2025-10-13T15:50:31,614][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [aggs-matrix-stats]
2025-10-13 15:50:31.614749+00:00[2025-10-13T15:50:31,614][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [analysis-common]
2025-10-13 15:50:31.614906+00:00[2025-10-13T15:50:31,614][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [cache-common]
2025-10-13 15:50:31.615064+00:00[2025-10-13T15:50:31,614][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [geo]
2025-10-13 15:50:31.615247+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-common]
2025-10-13 15:50:31.615409+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-geoip]
2025-10-13 15:50:31.615534+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-user-agent]
2025-10-13 15:50:31.615639+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-expression]
2025-10-13 15:50:31.615760+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-mustache]
2025-10-13 15:50:31.615867+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-painless]
2025-10-13 15:50:31.616022+00:00[2025-10-13T15:50:31,615][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [mapper-extras]
2025-10-13 15:50:31.616157+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [opensearch-dashboards]
2025-10-13 15:50:31.616281+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [parent-join]
2025-10-13 15:50:31.616386+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [percolator]
2025-10-13 15:50:31.616479+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [rank-eval]
2025-10-13 15:50:31.616576+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [reindex]
2025-10-13 15:50:31.616673+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [repository-url]
2025-10-13 15:50:31.616759+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [search-pipeline-common]
2025-10-13 15:50:31.616877+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [systemd]
2025-10-13 15:50:31.616975+00:00[2025-10-13T15:50:31,616][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [transport-netty4]
2025-10-13 15:50:31.617274+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-alerting]
2025-10-13 15:50:31.617383+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-anomaly-detection]
2025-10-13 15:50:31.617471+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-asynchronous-search]
2025-10-13 15:50:31.617564+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-cross-cluster-replication]
2025-10-13 15:50:31.617668+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-geospatial]
2025-10-13 15:50:31.617803+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-index-management]
2025-10-13 15:50:31.617910+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-job-scheduler]
2025-10-13 15:50:31.618003+00:00[2025-10-13T15:50:31,617][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-knn]
2025-10-13 15:50:31.618124+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-ml]
2025-10-13 15:50:31.618222+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-neural-search]
2025-10-13 15:50:31.618301+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-notifications]
2025-10-13 15:50:31.618387+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-notifications-core]
2025-10-13 15:50:31.618509+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-observability]
2025-10-13 15:50:31.618609+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-performance-analyzer]
2025-10-13 15:50:31.618738+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-reports-scheduler]
2025-10-13 15:50:31.618833+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-security]
2025-10-13 15:50:31.618929+00:00[2025-10-13T15:50:31,618][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-sql]
2025-10-13 15:50:31.655135+00:00[2025-10-13T15:50:31,654][INFO ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Disabled https compression by default to mitigate BREACH attacks. You can enable it by setting 'http.compression: true' in opensearch.yml
2025-10-13 15:50:31.670811+00:00[2025-10-13T15:50:31,670][WARN ][stderr                   ] [wazuh.indexer] WARNING: A restricted method in java.lang.foreign.Linker has been called
2025-10-13 15:50:31.671028+00:00[2025-10-13T15:50:31,670][WARN ][stderr                   ] [wazuh.indexer] WARNING: java.lang.foreign.Linker::downcallHandle has been called by the unnamed module
2025-10-13 15:50:31.671275+00:00[2025-10-13T15:50:31,671][WARN ][stderr                   ] [wazuh.indexer] WARNING: Use --enable-native-access=ALL-UNNAMED to avoid a warning for this module
2025-10-13 15:50:31.718251+00:00[2025-10-13T15:50:31,718][INFO ][o.a.l.s.MemorySegmentIndexInputProvider] [wazuh.indexer] Using MemorySegmentIndexInput and native madvise support with Java 21 or later; to disable start with -Dorg.apache.lucene.store.MMapDirectory.enableMemorySegments=false
2025-10-13 15:50:31.723516+00:00[2025-10-13T15:50:31,723][INFO ][o.o.e.NodeEnvironment    ] [wazuh.indexer] using [1] data paths, mounts [[/var/lib/wazuh-indexer (personal/ix-apps/docker)]], net usable_space [2.6tb], net total_space [2.8tb], types [zfs]
2025-10-13 15:50:31.723884+00:00[2025-10-13T15:50:31,723][INFO ][o.o.e.NodeEnvironment    ] [wazuh.indexer] heap size [4gb], compressed ordinary object pointers [true]
2025-10-13 15:50:31.796803+00:00[2025-10-13T15:50:31,796][INFO ][o.o.n.Node               ] [wazuh.indexer] node name [wazuh.indexer], node ID [wtM9IQfZScqa5z7prVDivA], cluster name [opensearch], roles [ingest, remote_cluster_client, data, cluster_manager]
2025-10-13 15:50:31.825123+00:00[2025-10-13T15:50:31,824][INFO ][o.o.e.ExtensionsManager  ] [wazuh.indexer] ExtensionsManager initialized
2025-10-13 15:50:33.319424+00:00[2025-10-13T15:50:33,319][INFO ][o.o.n.p.NeuralSearch     ] [wazuh.indexer] Registering hybrid query phase searcher with feature flag [plugins.neural_search.hybrid_search_disabled]
2025-10-13 15:50:33.601173+00:00[2025-10-13T15:50:33,601][WARN ][o.o.s.c.Salt             ] [wazuh.indexer] If you plan to use field masking pls configure compliance salt e1ukloTsQlOgPquJ to be a random string of 16 chars length identical on all nodes
2025-10-13 15:50:33.623049+00:00[2025-10-13T15:50:33,622][ERROR][o.o.s.a.s.SinkProvider   ] [wazuh.indexer] Default endpoint could not be created, auditlog will not work properly.
2025-10-13 15:50:33.623660+00:00[2025-10-13T15:50:33,623][WARN ][o.o.s.a.r.AuditMessageRouter] [wazuh.indexer] No default storage available, audit log may not work properly. Please check configuration.
2025-10-13 15:50:33.623881+00:00[2025-10-13T15:50:33,623][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Message routing enabled: false
2025-10-13 15:50:33.647723+00:00[2025-10-13T15:50:33,647][INFO ][o.o.s.f.SecurityFilter   ] [wazuh.indexer] <NONE> indices are made immutable.
2025-10-13 15:50:33.833767+00:00[2025-10-13T15:50:33,833][INFO ][o.o.t.b.CircuitBreakerService] [wazuh.indexer] Registered memory breaker.
2025-10-13 15:50:34.057951+00:00[2025-10-13T15:50:34,057][INFO ][o.o.r.m.c.i.SdkClientFactory] [wazuh.indexer] Using local opensearch cluster as metadata store.
2025-10-13 15:50:34.069179+00:00[2025-10-13T15:50:34,068][INFO ][o.o.m.b.MLCircuitBreakerService] [wazuh.indexer] Registered ML memory breaker.
2025-10-13 15:50:34.069648+00:00[2025-10-13T15:50:34,069][INFO ][o.o.m.b.MLCircuitBreakerService] [wazuh.indexer] Registered ML disk breaker.
2025-10-13 15:50:34.069802+00:00[2025-10-13T15:50:34,069][INFO ][o.o.m.b.MLCircuitBreakerService] [wazuh.indexer] Registered ML native memory breaker.
2025-10-13 15:50:34.120864+00:00[2025-10-13T15:50:34,120][INFO ][o.r.Reflections          ] [wazuh.indexer] Reflections took 27 ms to scan 1 urls, producing 27 keys and 67 values 
2025-10-13 15:50:34.133918+00:00[2025-10-13T15:50:34,133][INFO ][o.r.Reflections          ] [wazuh.indexer] Reflections took 1 ms to scan 1 urls, producing 3 keys and 5 values 
2025-10-13 15:50:34.161219+00:00[2025-10-13T15:50:34,161][WARN ][o.o.s.p.SQLPlugin        ] [wazuh.indexer] Master key is a required config for using create and update datasource APIs. Please set plugins.query.datasources.encryption.masterkey config in opensearch.yml in all the cluster nodes. More details can be found here: https://github.com/opensearch-project/sql/blob/main/docs/user/ppl/admin/datasources.rst#master-key-config-for-encrypting-credential-information
2025-10-13 15:50:34.625615+00:00[2025-10-13T15:50:34,625][INFO ][o.o.t.NettyAllocator     ] [wazuh.indexer] creating NettyAllocator with the following configs: [name=opensearch_configured, chunk_size=512kb, suggested_max_allocation_size=512kb, factors={opensearch.unsafe.use_netty_default_chunk_and_page_size=false, g1gc_enabled=true, g1gc_region_size=2mb}]
2025-10-13 15:50:34.629200+00:00[2025-10-13T15:50:34,629][INFO ][o.o.s.s.t.SSLConfig      ] [wazuh.indexer] SSL dual mode is disabled
2025-10-13 15:50:34.699385+00:00[2025-10-13T15:50:34,699][INFO ][o.o.d.DiscoveryModule    ] [wazuh.indexer] using discovery type [single-node] and seed hosts providers [settings]
2025-10-13 15:50:34.993849+00:00[2025-10-13T15:50:34,993][WARN ][o.o.g.DanglingIndicesState] [wazuh.indexer] gateway.auto_import_dangling_indices is disabled, dangling indices will not be automatically detected or imported and must be managed manually
2025-10-13 15:50:35.385069+00:00[2025-10-13T15:50:35,384][INFO ][o.o.p.h.c.PerformanceAnalyzerConfigAction] [wazuh.indexer] PerformanceAnalyzer Enabled: false
2025-10-13 15:50:35.402454+00:00[2025-10-13T15:50:35,402][INFO ][o.o.n.Node               ] [wazuh.indexer] initialized
2025-10-13 15:50:35.402661+00:00[2025-10-13T15:50:35,402][INFO ][o.o.n.Node               ] [wazuh.indexer] starting ...
2025-10-13 15:50:35.464135+00:00[2025-10-13T15:50:35,463][INFO ][o.o.t.TransportService   ] [wazuh.indexer] publish_address {172.16.23.2:9300}, bound_addresses {[::]:9300}
2025-10-13 15:50:35.465130+00:00[2025-10-13T15:50:35,465][INFO ][o.o.t.TransportService   ] [wazuh.indexer] Remote clusters initialized successfully.
2025-10-13 15:50:35.787368+00:00[2025-10-13T15:50:35,787][WARN ][o.o.b.BootstrapChecks    ] [wazuh.indexer] max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
2025-10-13 15:50:35.788219+00:00[2025-10-13T15:50:35,788][INFO ][o.o.c.c.Coordinator      ] [wazuh.indexer] cluster UUID [COvh6pTES6Oy2hUz-NUBFA]
2025-10-13 15:50:35.898474+00:00[2025-10-13T15:50:35,898][INFO ][o.o.c.s.MasterService    ] [wazuh.indexer] Tasks batched with key: org.opensearch.cluster.coordination.JoinHelper, count:3 and sample tasks: elected-as-cluster-manager ([1] nodes joined)[{wazuh.indexer}{wtM9IQfZScqa5z7prVDivA}{qLRE6tDkTWKI7aM5KoCvDA}{172.16.23.2}{172.16.23.2:9300}{dimr}{shard_indexing_pressure_enabled=true} elect leader, _BECOME_CLUSTER_MANAGER_TASK_, _FINISH_ELECTION_], term: 4, version: 86, delta: cluster-manager node changed {previous [], current [{wazuh.indexer}{wtM9IQfZScqa5z7prVDivA}{qLRE6tDkTWKI7aM5KoCvDA}{172.16.23.2}{172.16.23.2:9300}{dimr}{shard_indexing_pressure_enabled=true}]}
2025-10-13 15:50:36.431472+00:00[2025-10-13T15:50:36,431][INFO ][o.o.c.s.ClusterApplierService] [wazuh.indexer] cluster-manager node changed {previous [], current [{wazuh.indexer}{wtM9IQfZScqa5z7prVDivA}{qLRE6tDkTWKI7aM5KoCvDA}{172.16.23.2}{172.16.23.2:9300}{dimr}{shard_indexing_pressure_enabled=true}]}, term: 4, version: 86, reason: Publication{term=4, version=86}
2025-10-13 15:50:36.435815+00:00[2025-10-13T15:50:36,435][INFO ][o.o.t.i.IndexManagement  ] [wazuh.indexer] Candidate custom result indices are empty.
2025-10-13 15:50:36.436028+00:00[2025-10-13T15:50:36,435][INFO ][o.o.t.i.IndexManagement  ] [wazuh.indexer] Candidate custom result indices are empty.
2025-10-13 15:50:36.436231+00:00[2025-10-13T15:50:36,436][INFO ][o.o.t.c.ClusterEventListener] [wazuh.indexer] Cluster is not recovered yet.
2025-10-13 15:50:36.449647+00:00[2025-10-13T15:50:36,449][INFO ][o.o.i.i.ManagedIndexCoordinator] [wazuh.indexer] Cache cluster manager node onClusterManager time: 1760370636449
2025-10-13 15:50:36.454422+00:00[2025-10-13T15:50:36,454][WARN ][o.o.p.c.s.h.ConfigOverridesClusterSettingHandler] [wazuh.indexer] Config override setting update called with empty string. Ignoring.
2025-10-13 15:50:36.458448+00:00[2025-10-13T15:50:36,458][INFO ][o.o.d.PeerFinder         ] [wazuh.indexer] setting findPeersInterval to [1s] as node commission status = [true] for local node [{wazuh.indexer}{wtM9IQfZScqa5z7prVDivA}{qLRE6tDkTWKI7aM5KoCvDA}{172.16.23.2}{172.16.23.2:9300}{dimr}{shard_indexing_pressure_enabled=true}]
2025-10-13 15:50:36.460246+00:00[2025-10-13T15:50:36,460][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:36.461217+00:00[2025-10-13T15:50:36,461][INFO ][o.o.h.AbstractHttpServerTransport] [wazuh.indexer] publish_address {172.16.23.2:9200}, bound_addresses {[::]:9200}
2025-10-13 15:50:36.461351+00:00[2025-10-13T15:50:36,461][INFO ][o.o.n.Node               ] [wazuh.indexer] started
2025-10-13 15:50:36.461788+00:00[2025-10-13T15:50:36,461][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Will attempt to create index .opendistro_security and default configs if they are absent
2025-10-13 15:50:36.462357+00:00[2025-10-13T15:50:36,462][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Background init thread started. Install default config?: true
2025-10-13 15:50:36.462574+00:00[2025-10-13T15:50:36,462][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Wait for cluster to be available ...
2025-10-13 15:50:36.462781+00:00[2025-10-13T15:50:36,462][INFO ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] 0 OpenSearch Security modules loaded so far: []
2025-10-13 15:50:36.469376+00:00[2025-10-13T15:50:36,469][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:36.672125+00:00[2025-10-13T15:50:36,671][INFO ][o.o.c.s.ClusterSettings  ] [wazuh.indexer] updating [plugins.index_state_management.template_migration.control] from [0] to [-1]
2025-10-13 15:50:36.693193+00:00[2025-10-13T15:50:36,693][INFO ][o.o.t.c.HashRing         ] [wazuh.indexer] Node added: [wtM9IQfZScqa5z7prVDivA]
2025-10-13 15:50:36.695524+00:00[2025-10-13T15:50:36,695][INFO ][o.o.t.c.HashRing         ] [wazuh.indexer] Add data node to version hash ring: wtM9IQfZScqa5z7prVDivA
2025-10-13 15:50:36.696834+00:00[2025-10-13T15:50:36,696][INFO ][o.o.t.c.HashRing         ] [wazuh.indexer] All nodes with known version: {wtM9IQfZScqa5z7prVDivA=ADNodeInfo{version=2.19.2, isEligibleDataNode=true}}
2025-10-13 15:50:36.697035+00:00[2025-10-13T15:50:36,697][INFO ][o.o.t.c.HashRing         ] [wazuh.indexer] Rebuild hash ring for realtime with cooldown, nodeChangeEvents size 0
2025-10-13 15:50:36.697175+00:00[2025-10-13T15:50:36,697][INFO ][o.o.t.c.HashRing         ] [wazuh.indexer] Build version hash ring successfully
2025-10-13 15:50:36.697817+00:00[2025-10-13T15:50:36,697][INFO ][o.o.t.c.ADDataMigrator   ] [wazuh.indexer] Start migrating AD data
2025-10-13 15:50:36.697920+00:00[2025-10-13T15:50:36,697][INFO ][o.o.t.c.ADDataMigrator   ] [wazuh.indexer] AD job index doesn't exist, no need to migrate
2025-10-13 15:50:36.698157+00:00[2025-10-13T15:50:36,698][INFO ][o.o.t.c.ClusterEventListener] [wazuh.indexer] Init version hash ring successfully
2025-10-13 15:50:36.705058+00:00[2025-10-13T15:50:36,704][INFO ][o.o.g.GatewayService     ] [wazuh.indexer] recovered [15] indices into cluster_state
2025-10-13 15:50:36.706430+00:00[2025-10-13T15:50:36,706][WARN ][o.o.o.i.ObservabilityIndex] [wazuh.indexer] message: index [.opensearch-observability/pW5e07ztRWWBtabiJs4NEw] already exists
2025-10-13 15:50:36.706596+00:00[2025-10-13T15:50:36,706][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:36.999902+00:00[2025-10-13T15:50:36,999][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[.opensearch-observability/pW5e07ztRWWBtabiJs4NEw]
2025-10-13 15:50:37.074790+00:00[2025-10-13T15:50:37,074][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-alerts-4.x-2025.10.13/M6XcTXjeSdGmKRBElqR3Ug]
2025-10-13 15:50:37.103476+00:00[2025-10-13T15:50:37,103][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[.opendistro_security/pT5TXKLxTsW_sP5ae6-Fpw]
2025-10-13 15:50:37.108223+00:00[2025-10-13T15:50:37,108][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[.plugins-ml-config/LjgFK-JwQQuBhw1KwbPIJg]
2025-10-13 15:50:37.570363+00:00[2025-10-13T15:50:37,569][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Index .opendistro_security already exists
2025-10-13 15:50:37.570969+00:00[2025-10-13T15:50:37,570][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Node started, try to initialize it. Wait for at least yellow cluster state....
2025-10-13 15:50:37.571674+00:00[2025-10-13T15:50:37,571][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:37.583519+00:00[2025-10-13T15:50:37,583][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'config' with /usr/share/wazuh-indexer/opensearch-security/config.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.633472+00:00[2025-10-13T15:50:37,633][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id config, skipping update.
2025-10-13 15:50:37.633829+00:00[2025-10-13T15:50:37,633][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'roles' with /usr/share/wazuh-indexer/opensearch-security/roles.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.641143+00:00[2025-10-13T15:50:37,640][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id roles, skipping update.
2025-10-13 15:50:37.641421+00:00[2025-10-13T15:50:37,641][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'rolesmapping' with /usr/share/wazuh-indexer/opensearch-security/roles_mapping.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.646792+00:00[2025-10-13T15:50:37,646][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id rolesmapping, skipping update.
2025-10-13 15:50:37.646984+00:00[2025-10-13T15:50:37,646][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'internalusers' with /usr/share/wazuh-indexer/opensearch-security/internal_users.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.652105+00:00[2025-10-13T15:50:37,651][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id internalusers, skipping update.
2025-10-13 15:50:37.652300+00:00[2025-10-13T15:50:37,652][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'actiongroups' with /usr/share/wazuh-indexer/opensearch-security/action_groups.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.655214+00:00[2025-10-13T15:50:37,655][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id actiongroups, skipping update.
2025-10-13 15:50:37.655406+00:00[2025-10-13T15:50:37,655][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'tenants' with /usr/share/wazuh-indexer/opensearch-security/tenants.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.657678+00:00[2025-10-13T15:50:37,657][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id tenants, skipping update.
2025-10-13 15:50:37.657934+00:00[2025-10-13T15:50:37,657][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'nodesdn' with /usr/share/wazuh-indexer/opensearch-security/nodes_dn.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=true
2025-10-13 15:50:37.659832+00:00[2025-10-13T15:50:37,659][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id nodesdn, skipping update.
2025-10-13 15:50:37.660023+00:00[2025-10-13T15:50:37,659][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'whitelist' with /usr/share/wazuh-indexer/opensearch-security/whitelist.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=true
2025-10-13 15:50:37.661976+00:00[2025-10-13T15:50:37,661][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id whitelist, skipping update.
2025-10-13 15:50:37.662157+00:00[2025-10-13T15:50:37,662][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'allowlist' with /usr/share/wazuh-indexer/opensearch-security/allowlist.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=true
2025-10-13 15:50:37.663972+00:00[2025-10-13T15:50:37,663][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id allowlist, skipping update.
2025-10-13 15:50:37.664235+00:00[2025-10-13T15:50:37,664][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Will update 'audit' with /usr/share/wazuh-indexer/opensearch-security/audit.yml and populate it with empty doc if file missing and populateEmptyIfFileMissing=false
2025-10-13 15:50:37.673348+00:00[2025-10-13T15:50:37,673][INFO ][o.o.s.s.ConfigHelper     ] [wazuh.indexer] Index .opendistro_security already contains doc with id audit, skipping update.
2025-10-13 15:50:37.775828+00:00[2025-10-13T15:50:37,775][INFO ][stdout                   ] [wazuh.indexer] [FINE] No subscribers registered for event class org.opensearch.security.securityconf.DynamicConfigFactory$NodesDnModelImpl
2025-10-13 15:50:37.776309+00:00[2025-10-13T15:50:37,776][INFO ][stdout                   ] [wazuh.indexer] [FINE] No subscribers registered for event class org.greenrobot.eventbus.NoSubscriberEvent
2025-10-13 15:50:37.776558+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing on REST API is enabled.
2025-10-13 15:50:37.776701+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] [AUTHENTICATED, GRANTED_PRIVILEGES] are excluded from REST API auditing.
2025-10-13 15:50:37.776781+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing on Transport API is enabled.
2025-10-13 15:50:37.776870+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] [AUTHENTICATED, GRANTED_PRIVILEGES] are excluded from Transport API auditing.
2025-10-13 15:50:37.776944+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing of request body is enabled.
2025-10-13 15:50:37.777017+00:00[2025-10-13T15:50:37,776][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Bulk requests resolution is disabled during request auditing.
2025-10-13 15:50:37.777088+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Index resolution is enabled during request auditing.
2025-10-13 15:50:37.777158+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Sensitive headers exclusion from auditing is enabled.
2025-10-13 15:50:37.777234+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing requests from kibanaserver users is disabled.
2025-10-13 15:50:37.777329+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing request headers <NONE> is disabled.
2025-10-13 15:50:37.777413+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing request url params <NONE> is disabled.
2025-10-13 15:50:37.777561+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing of external configuration is disabled.
2025-10-13 15:50:37.777625+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing of internal configuration is enabled.
2025-10-13 15:50:37.777698+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing only metadata information for read request is enabled.
2025-10-13 15:50:37.777816+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing will watch {} for read requests.
2025-10-13 15:50:37.777909+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing read operation requests from kibanaserver users is disabled.
2025-10-13 15:50:37.777980+00:00[2025-10-13T15:50:37,777][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing only metadata information for write request is enabled.
2025-10-13 15:50:37.778111+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing diffs for write requests is disabled.
2025-10-13 15:50:37.778222+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing write operation requests from kibanaserver users is disabled.
2025-10-13 15:50:37.778307+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Auditing will watch <NONE> for write requests.
2025-10-13 15:50:37.778374+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] .opendistro_security is used as internal security index.
2025-10-13 15:50:37.778437+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.a.i.AuditLogImpl   ] [wazuh.indexer] Internal index used for posting audit logs is null
2025-10-13 15:50:37.778816+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Hot-reloading of audit configuration is enabled
2025-10-13 15:50:37.778893+00:00[2025-10-13T15:50:37,778][INFO ][o.o.s.c.ConfigurationRepository] [wazuh.indexer] Node 'wazuh.indexer' initialized
2025-10-13 15:50:38.232828+00:00[2025-10-13T15:50:38,229][WARN ][r.suppressed             ] [wazuh.indexer] path: /.kibana/_count, params: {index=.kibana}
2025-10-13 15:50:38.232865+00:00org.opensearch.action.search.SearchPhaseExecutionException: all shards failed
2025-10-13 15:50:38.232869+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseFailure(AbstractSearchAsyncAction.java:775) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232888+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.executeNextPhase(AbstractSearchAsyncAction.java:395) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232892+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseDone(AbstractSearchAsyncAction.java:815) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232898+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onShardFailure(AbstractSearchAsyncAction.java:548) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232901+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.lambda$performPhaseOnShard$0(AbstractSearchAsyncAction.java:290) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232907+00:00at org.opensearch.action.search.AbstractSearchAsyncAction$2.doRun(AbstractSearchAsyncAction.java:373) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232909+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232912+00:00at org.opensearch.threadpool.TaskAwareRunnable.doRun(TaskAwareRunnable.java:78) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232917+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232920+00:00at org.opensearch.common.util.concurrent.TimedRunnable.doRun(TimedRunnable.java:59) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232923+00:00at org.opensearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:1014) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232928+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:38.232931+00:00at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144) [?:?]
2025-10-13 15:50:38.232936+00:00at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642) [?:?]
2025-10-13 15:50:38.232940+00:00at java.base/java.lang.Thread.run(Thread.java:1583) [?:?]
2025-10-13 15:50:38.701973+00:00[2025-10-13T15:50:38,701][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-interfaces-wazuh.manager/1ng3Zy9gSm-__SZloTcM1g]
2025-10-13 15:50:38.710194+00:00[2025-10-13T15:50:38,709][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-networks-wazuh.manager/MI8UZWXOSFOhP8-eVFEFng]
2025-10-13 15:50:39.661645+00:00[2025-10-13T15:50:39,661][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:40.401651+00:00[2025-10-13T15:50:40,401][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-protocols-wazuh.manager/bNBzfOnrQpaYY0xh-Hi2gA]
2025-10-13 15:50:40.406073+00:00[2025-10-13T15:50:40,405][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-ports-wazuh.manager/2PxaYSsERUWFCnyo7G91vQ]
2025-10-13 15:50:40.410195+00:00[2025-10-13T15:50:40,410][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-hotfixes-wazuh.manager/LSk0a16XRhqqiYB7gVHg1Q]
2025-10-13 15:50:40.413419+00:00[2025-10-13T15:50:40,413][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-hardware-wazuh.manager/Np9F7r94SHK_v9h64unnVQ]
2025-10-13 15:50:40.740642+00:00[2025-10-13T15:50:40,740][WARN ][r.suppressed             ] [wazuh.indexer] path: /.kibana/_count, params: {index=.kibana}
2025-10-13 15:50:40.740696+00:00org.opensearch.action.search.SearchPhaseExecutionException: all shards failed
2025-10-13 15:50:40.740702+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseFailure(AbstractSearchAsyncAction.java:775) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740734+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.executeNextPhase(AbstractSearchAsyncAction.java:395) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740739+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseDone(AbstractSearchAsyncAction.java:815) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740750+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onShardFailure(AbstractSearchAsyncAction.java:548) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740757+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.lambda$performPhaseOnShard$0(AbstractSearchAsyncAction.java:290) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740766+00:00at org.opensearch.action.search.AbstractSearchAsyncAction$2.doRun(AbstractSearchAsyncAction.java:373) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740776+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740781+00:00at org.opensearch.threadpool.TaskAwareRunnable.doRun(TaskAwareRunnable.java:78) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740789+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740793+00:00at org.opensearch.common.util.concurrent.TimedRunnable.doRun(TimedRunnable.java:59) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740798+00:00at org.opensearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:1014) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740807+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:40.740812+00:00at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144) [?:?]
2025-10-13 15:50:40.740816+00:00at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642) [?:?]
2025-10-13 15:50:40.740827+00:00at java.base/java.lang.Thread.run(Thread.java:1583) [?:?]
2025-10-13 15:50:43.246867+00:00[2025-10-13T15:50:43,246][WARN ][r.suppressed             ] [wazuh.indexer] path: /.kibana/_count, params: {index=.kibana}
2025-10-13 15:50:43.246926+00:00org.opensearch.action.search.SearchPhaseExecutionException: all shards failed
2025-10-13 15:50:43.246944+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseFailure(AbstractSearchAsyncAction.java:775) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246949+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.executeNextPhase(AbstractSearchAsyncAction.java:395) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246959+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseDone(AbstractSearchAsyncAction.java:815) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246976+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onShardFailure(AbstractSearchAsyncAction.java:548) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246979+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.lambda$performPhaseOnShard$0(AbstractSearchAsyncAction.java:290) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246995+00:00at org.opensearch.action.search.AbstractSearchAsyncAction$2.doRun(AbstractSearchAsyncAction.java:373) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.246998+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247003+00:00at org.opensearch.threadpool.TaskAwareRunnable.doRun(TaskAwareRunnable.java:78) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247006+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247009+00:00at org.opensearch.common.util.concurrent.TimedRunnable.doRun(TimedRunnable.java:59) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247014+00:00at org.opensearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:1014) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247017+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:43.247022+00:00at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144) [?:?]
2025-10-13 15:50:43.247025+00:00at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642) [?:?]
2025-10-13 15:50:43.247029+00:00at java.base/java.lang.Thread.run(Thread.java:1583) [?:?]
2025-10-13 15:50:43.927193+00:00[2025-10-13T15:50:43,927][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:45.498747+00:00[2025-10-13T15:50:45,498][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-packages-wazuh.manager/Za1P807YRcSIRP9Noouevw]
2025-10-13 15:50:45.504553+00:00[2025-10-13T15:50:45,504][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-system-wazuh.manager/HhBuml_TSQGHdWMX-awlSA]
2025-10-13 15:50:45.508118+00:00[2025-10-13T15:50:45,507][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-vulnerabilities-wazuh.manager/3AwsmwfgQPOvT-2IY32png]
2025-10-13 15:50:45.511439+00:00[2025-10-13T15:50:45,511][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-inventory-processes-wazuh.manager/bLHgiPVHTWuryw5X7CVpNQ]
2025-10-13 15:50:45.757651+00:00[2025-10-13T15:50:45,756][WARN ][r.suppressed             ] [wazuh.indexer] path: /.kibana/_count, params: {index=.kibana}
2025-10-13 15:50:45.757723+00:00org.opensearch.action.search.SearchPhaseExecutionException: all shards failed
2025-10-13 15:50:45.757751+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseFailure(AbstractSearchAsyncAction.java:775) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757754+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.executeNextPhase(AbstractSearchAsyncAction.java:395) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757760+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseDone(AbstractSearchAsyncAction.java:815) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757764+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onShardFailure(AbstractSearchAsyncAction.java:548) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757767+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.lambda$performPhaseOnShard$0(AbstractSearchAsyncAction.java:290) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757772+00:00at org.opensearch.action.search.AbstractSearchAsyncAction$2.doRun(AbstractSearchAsyncAction.java:373) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757775+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757780+00:00at org.opensearch.threadpool.TaskAwareRunnable.doRun(TaskAwareRunnable.java:78) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757783+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757786+00:00at org.opensearch.common.util.concurrent.TimedRunnable.doRun(TimedRunnable.java:59) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757791+00:00at org.opensearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:1014) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757794+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:45.757799+00:00at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144) [?:?]
2025-10-13 15:50:45.757802+00:00at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642) [?:?]
2025-10-13 15:50:45.757806+00:00at java.base/java.lang.Thread.run(Thread.java:1583) [?:?]
2025-10-13 15:50:46.475805+00:00[2025-10-13T15:50:46,475][INFO ][o.o.m.a.MLModelAutoReDeployer] [wazuh.indexer] Index not found, not performing auto reloading!
2025-10-13 15:50:46.476011+00:00[2025-10-13T15:50:46,475][INFO ][o.o.m.c.MLCommonsClusterManagerEventListener] [wazuh.indexer] Starting ML sync up job...
2025-10-13 15:50:48.265695+00:00[2025-10-13T15:50:48,264][WARN ][r.suppressed             ] [wazuh.indexer] path: /.kibana/_count, params: {index=.kibana}
2025-10-13 15:50:48.265787+00:00org.opensearch.action.search.SearchPhaseExecutionException: all shards failed
2025-10-13 15:50:48.265797+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseFailure(AbstractSearchAsyncAction.java:775) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265803+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.executeNextPhase(AbstractSearchAsyncAction.java:395) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265820+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onPhaseDone(AbstractSearchAsyncAction.java:815) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265826+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.onShardFailure(AbstractSearchAsyncAction.java:548) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265838+00:00at org.opensearch.action.search.AbstractSearchAsyncAction.lambda$performPhaseOnShard$0(AbstractSearchAsyncAction.java:290) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265845+00:00at org.opensearch.action.search.AbstractSearchAsyncAction$2.doRun(AbstractSearchAsyncAction.java:373) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265850+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265862+00:00at org.opensearch.threadpool.TaskAwareRunnable.doRun(TaskAwareRunnable.java:78) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265868+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265879+00:00at org.opensearch.common.util.concurrent.TimedRunnable.doRun(TimedRunnable.java:59) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265886+00:00at org.opensearch.common.util.concurrent.ThreadContext$ContextPreservingAbstractRunnable.doRun(ThreadContext.java:1014) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265892+00:00at org.opensearch.common.util.concurrent.AbstractRunnable.run(AbstractRunnable.java:52) [opensearch-2.19.2.jar:2.19.2]
2025-10-13 15:50:48.265903+00:00at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1144) [?:?]
2025-10-13 15:50:48.265909+00:00at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:642) [?:?]
2025-10-13 15:50:48.265916+00:00at java.base/java.lang.Thread.run(Thread.java:1583) [?:?]
2025-10-13 15:50:48.686419+00:00[2025-10-13T15:50:48,686][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:49.117757+00:00[2025-10-13T15:50:49,117][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[.kibana_1/Of5cvm6cRX2sryJmVGRAZQ]
2025-10-13 15:50:49.359015+00:00[2025-10-13T15:50:49,358][INFO ][o.o.c.r.a.AllocationService] [wazuh.indexer] Cluster health status changed from [RED] to [GREEN] (reason: [shards started [[.kibana_1][0]]]).
2025-10-13 15:50:49.803633+00:00[2025-10-13T15:50:49,803][WARN ][o.o.c.r.a.AllocationService] [wazuh.indexer] Falling back to single shard assignment since batch mode disable or multiple custom allocators set
2025-10-13 15:50:51.217762+00:00[2025-10-13T15:50:51,217][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[5c3-uEceS1yjViaIg-CZCA/zryrTCuIQLyIcv8c8h59hA]
2025-10-13 15:50:51.225623+00:00[2025-10-13T15:50:51,225][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[ftXfqx04S_ih8WiQOYahDA/7vwT-wODTLKblZSSmAQFiw]
2025-10-13 15:50:52.382821+00:00[2025-10-13T15:50:52,382][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[pQv6SkirTj6-DV7HsTnTsg/zKaWG4obSre1MgtFdbWLGg]
2025-10-13 15:50:52.395657+00:00[2025-10-13T15:50:52,395][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] adding template [wazuh] for index patterns [wazuh-alerts-4.x-*, wazuh-archives-4.x-*]
2025-10-13 15:50:56.482866+00:00[2025-10-13T15:50:56,482][INFO ][o.o.m.c.MLSyncUpCron     ] [wazuh.indexer] ML configuration already initialized, no action needed
2025-10-13 15:51:36.450978+00:00[2025-10-13T15:51:36,450][INFO ][o.o.i.i.ManagedIndexCoordinator] [wazuh.indexer] Performing move cluster state metadata.
2025-10-13 15:51:36.451540+00:00[2025-10-13T15:51:36,451][INFO ][o.o.i.i.MetadataService  ] [wazuh.indexer] ISM config index not exist, so we cancel the metadata migration job.
2025-10-13 15:51:41.854267+00:00[2025-10-13T15:51:41,854][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-pyo3slbwsu2h5srpktpg8g/EuhLIntUQVWva4gEVWVgPw]
2025-10-13 15:51:41.858564+00:00[2025-10-13T15:51:41,858][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-vulnerabilities-wazuh.manager_template] for index patterns [wazuh-states-vulnerabilities-*]
2025-10-13 15:51:42.000839+00:00[2025-10-13T15:51:42,000][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-wv9wmkpyr_ccaebd7n2aiq/4xB5hn8BRzSsP0LOauuBog]
2025-10-13 15:51:42.004126+00:00[2025-10-13T15:51:42,004][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-packages-wazuh.manager_template] for index patterns [wazuh-states-inventory-packages*]
2025-10-13 15:51:42.093936+00:00[2025-10-13T15:51:42,093][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[wazuh-states-vulnerabilities-wazuh.manager/3AwsmwfgQPOvT-2IY32png]
2025-10-13 15:51:43.014274+00:00[2025-10-13T15:51:43,014][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-cy4wo5hns3ihotcprr__ew/iwf9zZj2Q92rvZgj-2oG-Q]
2025-10-13 15:51:43.016589+00:00[2025-10-13T15:51:43,016][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-system-wazuh.manager_template] for index patterns [wazuh-states-inventory-system*]
2025-10-13 15:51:44.456215+00:00[2025-10-13T15:51:44,456][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-4mfoawbvsw-ah9y9fbzndg/rBMVLj0BTEC8UTutQxExIQ]
2025-10-13 15:51:44.458413+00:00[2025-10-13T15:51:44,458][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-processes-wazuh.manager_template] for index patterns [wazuh-states-inventory-processes*]
2025-10-13 15:51:45.504597+00:00[2025-10-13T15:51:45,504][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-azjos9nzqu-uhzz2npmwdq/qNl3TpC2QsOg2JLNDXgFkg]
2025-10-13 15:51:45.506541+00:00[2025-10-13T15:51:45,506][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-ports-wazuh.manager_template] for index patterns [wazuh-states-inventory-ports*]
2025-10-13 15:51:46.198648+00:00[2025-10-13T15:51:46,198][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-fv1m6tn1tlqykvdqi2acxw/qDu71NAYS4aDELmNAv3YmQ]
2025-10-13 15:51:46.200374+00:00[2025-10-13T15:51:46,200][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-hotfixes-wazuh.manager_template] for index patterns [wazuh-states-inventory-hotfixes*]
2025-10-13 15:51:47.349382+00:00[2025-10-13T15:51:47,349][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-v7pmybqmt8g1ijvwwxuf4w/jaEZIBC4T9u--IU71Cyr_A]
2025-10-13 15:51:47.351603+00:00[2025-10-13T15:51:47,351][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-hardware-wazuh.manager_template] for index patterns [wazuh-states-inventory-hardware*]
2025-10-13 15:51:48.497371+00:00[2025-10-13T15:51:48,497][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-7tdjicgstxkjz4e1nhklua/oWZG3vBbRtqgkwhFNhMU1g]
2025-10-13 15:51:48.499659+00:00[2025-10-13T15:51:48,499][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-protocols-wazuh.manager_template] for index patterns [wazuh-states-inventory-protocols*]
2025-10-13 15:51:49.672971+00:00[2025-10-13T15:51:49,672][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-x2ivd6vorlaajweg_dxeng/YVCXAC27QG2yFB9uIeivnA]
2025-10-13 15:51:49.674973+00:00[2025-10-13T15:51:49,674][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-interfaces-wazuh.manager_template] for index patterns [wazuh-states-inventory-interfaces*]
2025-10-13 15:51:50.546014+00:00[2025-10-13T15:51:50,545][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] PluginService:onIndexModule index:[validate-template-mlv3kgplqdq_a3r5xlurja/BTQsyajHT6aku7sZ8T_IDA]
2025-10-13 15:51:50.547838+00:00[2025-10-13T15:51:50,547][INFO ][o.o.c.m.MetadataIndexTemplateService] [wazuh.indexer] updating index template [wazuh-states-inventory-networks-wazuh.manager_template] for index patterns [wazuh-states-inventory-networks*]
2025-10-13 15:52:36.451031+00:00[2025-10-13T15:52:36,450][INFO ][o.o.i.i.ManagedIndexCoordinator] [wazuh.indexer] Cancel background move metadata process.
2025-10-13 15:52:36.451562+00:00[2025-10-13T15:52:36,451][INFO ][o.o.i.i.ManagedIndexCoordinator] [wazuh.indexer] Performing move cluster state metadata.
2025-10-13 15:52:36.451658+00:00[2025-10-13T15:52:36,451][INFO ][o.o.i.i.MetadataService  ] [wazuh.indexer] Move metadata has finished.
2025-10-13 15:55:35.790845+00:00[2025-10-13T15:55:35,790][INFO ][o.o.j.s.JobSweeper       ] [wazuh.indexer] Running full sweep
```

## wazuh.dashboard

```
2025-10-13 15:50:28.802946+00:00Created OpenSearch Dashboards keystore in /usr/share/wazuh-dashboard/config/opensearch_dashboards.keystore
2025-10-13 15:50:29.660815+00:00Wazuh APP already configured
2025-10-13 15:50:32.401896+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-service"],"pid":54,"message":"Plugin \"applicationConfig\" is disabled."}
2025-10-13 15:50:32.402455+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-service"],"pid":54,"message":"Plugin \"cspHandler\" is disabled."}
2025-10-13 15:50:32.402688+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-service"],"pid":54,"message":"Plugin \"dataSource\" is disabled."}
2025-10-13 15:50:32.403084+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-service"],"pid":54,"message":"Plugin \"visTypeXy\" is disabled."}
2025-10-13 15:50:32.403328+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-service"],"pid":54,"message":"Plugin \"workspace\" is disabled."}
2025-10-13 15:50:32.438040+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["warning","config","deprecation"],"pid":54,"message":"\"opensearch.requestHeadersWhitelist\" is deprecated and has been replaced by \"opensearch.requestHeadersAllowlist\""}
2025-10-13 15:50:32.487431+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","dynamic-config-service"],"pid":54,"message":"registering middleware to inject context to AsyncLocalStorage"}
2025-10-13 15:50:32.507936+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.535902+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins-system"],"pid":54,"message":"Setting up [50] plugins: [usageCollection,opensearchDashboardsUsageCollection,opensearchDashboardsLegacy,mapsLegacy,share,opensearchUiShared,legacyExport,embeddable,expressions,data,savedObjects,queryEnhancements,home,dashboard,visualizations,visTypeVega,visTypeTimeline,visTypeTable,visTypeMarkdown,visBuilder,visAugmenter,tileMap,regionMap,inputControlVis,ganttChartDashboards,visualize,apmOss,management,indexPatternManagement,dataSourceManagement,reportsDashboards,indexManagementDashboards,customImportMapDashboards,alertingDashboards,notificationsDashboards,console,advancedSettings,dataExplorer,charts,visTypeVislib,visTypeTimeseries,visTypeTagcloud,visTypeMetric,discover,savedObjectsManagement,securityDashboards,wazuhCore,wazuhCheckUpdates,wazuh,bfetch]"}
2025-10-13 15:50:32.572694+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.576700+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","plugins","queryEnhancements"],"pid":54,"message":"queryEnhancements: Setup complete"}
2025-10-13 15:50:32.661472+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.666291+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.667632+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.671593+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.680640+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.686819+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.688452+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.695437+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.705788+00:00[agentkeepalive:deprecated] options.freeSocketKeepAliveTimeout is deprecated, please use options.freeSocketTimeout instead
2025-10-13 15:50:32.760419+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","dynamic-config-service"],"pid":54,"message":"initiating start()"}
2025-10-13 15:50:32.760955+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","dynamic-config-service"],"pid":54,"message":"finished start()"}
2025-10-13 15:50:32.780550+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["info","savedobjects-service"],"pid":54,"message":"Waiting until all OpenSearch nodes are compatible with OpenSearch Dashboards before starting saved objects migrations..."}
2025-10-13 15:50:32.794546+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 15:50:32.809725+00:00{"type":"log","@timestamp":"2025-10-13T15:50:32Z","tags":["error","savedobjects-service"],"pid":54,"message":"Unable to retrieve version information from OpenSearch nodes."}
2025-10-13 15:50:35.294328+00:00{"type":"log","@timestamp":"2025-10-13T15:50:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 15:50:38.173319+00:00{"type":"log","@timestamp":"2025-10-13T15:50:38Z","tags":["info","savedobjects-service"],"pid":54,"message":"Starting saved objects migrations"}
2025-10-13 15:50:38.235234+00:00{"type":"log","@timestamp":"2025-10-13T15:50:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[search_phase_execution_exception]: all shards failed"}
2025-10-13 15:50:38.235638+00:00{"type":"log","@timestamp":"2025-10-13T15:50:38Z","tags":["warning","savedobjects-service"],"pid":54,"message":"Unable to connect to OpenSearch. Error: search_phase_execution_exception: "}
2025-10-13 15:50:40.742174+00:00{"type":"log","@timestamp":"2025-10-13T15:50:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[search_phase_execution_exception]: all shards failed"}
2025-10-13 15:50:43.248680+00:00{"type":"log","@timestamp":"2025-10-13T15:50:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[search_phase_execution_exception]: all shards failed"}
2025-10-13 15:50:45.759422+00:00{"type":"log","@timestamp":"2025-10-13T15:50:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[search_phase_execution_exception]: all shards failed"}
2025-10-13 15:50:48.268314+00:00{"type":"log","@timestamp":"2025-10-13T15:50:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[search_phase_execution_exception]: all shards failed"}
2025-10-13 15:50:50.817728+00:00{"type":"log","@timestamp":"2025-10-13T15:50:50Z","tags":["warning","cross-compatibility-service"],"pid":54,"message":"Starting cross compatibility service"}
2025-10-13 15:50:50.817970+00:00{"type":"log","@timestamp":"2025-10-13T15:50:50Z","tags":["info","plugins-system"],"pid":54,"message":"Starting [50] plugins: [usageCollection,opensearchDashboardsUsageCollection,opensearchDashboardsLegacy,mapsLegacy,share,opensearchUiShared,legacyExport,embeddable,expressions,data,savedObjects,queryEnhancements,home,dashboard,visualizations,visTypeVega,visTypeTimeline,visTypeTable,visTypeMarkdown,visBuilder,visAugmenter,tileMap,regionMap,inputControlVis,ganttChartDashboards,visualize,apmOss,management,indexPatternManagement,dataSourceManagement,reportsDashboards,indexManagementDashboards,customImportMapDashboards,alertingDashboards,notificationsDashboards,console,advancedSettings,dataExplorer,charts,visTypeVislib,visTypeTimeseries,visTypeTagcloud,visTypeMetric,discover,savedObjectsManagement,securityDashboards,wazuhCore,wazuhCheckUpdates,wazuh,bfetch]"}
2025-10-13 15:50:51.130389+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","plugins","wazuh","initialize"],"pid":54,"message":"dashboard index: .kibana"}
2025-10-13 15:50:51.130420+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","plugins","wazuh","initialize"],"pid":54,"message":"App revision: 01"}
2025-10-13 15:50:51.130615+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","plugins","wazuh","initialize"],"pid":54,"message":"Total RAM: 63975MB"}
2025-10-13 15:50:51.242502+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","plugins","wazuh","monitoring"],"pid":54,"message":"Updated the wazuh-agent template"}
2025-10-13 15:50:51.243613+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","plugins","wazuh","cron-scheduler"],"pid":54,"message":"Updated the wazuh-statistics template"}
2025-10-13 15:50:51.291768+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["listening","info"],"pid":54,"message":"Server running at https://0.0.0.0:5601"}
2025-10-13 15:50:51.358608+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["info","http","server","OpenSearchDashboards"],"pid":54,"message":"http server running at https://0.0.0.0:5601"}
2025-10-13 15:50:51.497809+00:00{"type":"log","@timestamp":"2025-10-13T15:50:51Z","tags":["error","plugins","wazuh","monitoring"],"pid":54,"message":"Request failed with status code 401"}
2025-10-13 15:55:00.630357+00:00{"type":"log","@timestamp":"2025-10-13T15:55:00Z","tags":["error","plugins","wazuh","cron-scheduler"],"pid":54,"message":"AxiosError: Request failed with status code 401"}
2025-10-13 15:55:00.630985+00:00{"type":"log","@timestamp":"2025-10-13T15:55:00Z","tags":["error","plugins","wazuh","cron-scheduler"],"pid":54,"message":"AxiosError: Request failed with status code 401"}
```

# Wazuh on TrueNAS SCALE - Complete Setup Guide

## Overview

This guide covers deploying Wazuh (single-node) on TrueNAS SCALE using Docker Compose with VS Code Server for configuration management. You'll get a working SIEM with indexer (OpenSearch), manager, and dashboard components.

## Prerequisites

### 1. System Requirements

- TrueNAS SCALE (tested on Fangtooth)
- Minimum 8GB RAM (4GB allocated to indexer)
- Custom IP alias configured for the app
- VS Code Server app installed for config management

### 2. Set vm.max_map_count (Required)

OpenSearch requires `vm.max_map_count ≥ 262144` on the host.

**In TrueNAS UI:**
- **System Settings → Advanced → Sysctl → Add**
- Variable: `vm.max_map_count`
- Value: `262144`
- Description: `Required for OpenSearch/Wazuh indexer`

**Verify in TrueNAS Web Shell:**
```bash
cat /proc/sys/vm/max_map_count
# Should show: 262144
```

### 3. Network Setup

Create a custom IP alias for the Wazuh application:
- **Network → Interfaces → [Your Interface] → Edit**
- Add IP Address: `192.168.1.29/24` (adjust to your network)

## Directory Structure & Configuration Space

### VS Code Server Configuration Layout

```
/mnt/personal/docker-configs/wazuh/
├── docker-compose.yml          # Main compose file
├── .env                       # Environment variables
└── config/                    # Configuration directory
    ├── wazuh_indexer_ssl_certs/          # Certificates (auto-generated)
    ├── wazuh_indexer/                     # Indexer config files
    │   ├── wazuh.indexer.yml
    │   └── internal_users.yml
    ├── wazuh_dashboard/                   # Dashboard config files
    │   ├── opensearch_dashboards.yml
    │   └── wazuh.yml
    └── wazuh_cluster/                     # Manager config files
        └── wazuh_manager.conf
```

### TrueNAS Dataset Structure

Create these datasets for persistent storage:
```
/mnt/personal/docker-configs/wazuh/     # Config files (VS Code Server access)
```

## Configuration Files

### Environment Variables (.env)

**File: `/mnt/personal/docker-configs/wazuh/.env`**
```bash
WAZUH_VERSION=4.13.1
WAZUH_IMAGE_VERSION=4.13.1
WAZUH_TAG_REVISION=1
FILEBEAT_TEMPLATE_BRANCH=4.13.1
WAZUH_FILEBEAT_MODULE=wazuh-filebeat-0.4.tar.gz
WAZUH_UI_REVISION=1

# Host bind
APP_IP=192.168.1.29

# Storage roots
CONFIG_DIR=/mnt/personal/docker-configs/wazuh/config

# OpenSearch heap (adjust based on available RAM)
OPENSEARCH_JAVA_OPTS=-Xms4g -Xmx4g

# Credentials (CHANGE THESE after first deployment)
INDEXER_USERNAME=admin
INDEXER_PASSWORD=SecretPassword
DASHBOARD_USERNAME=kibanaserver
DASHBOARD_PASSWORD=kibanaserver
API_USERNAME=wazuh-wui
API_PASSWORD=MyS3cr37P450r.*-
```

### Docker Compose Configuration

**File: `/mnt/personal/docker-configs/wazuh/docker-compose.yml`**
```yaml
services:
  wazuh.indexer:
    image: wazuh/wazuh-indexer:4.13.1
    hostname: wazuh.indexer
    restart: unless-stopped
    environment:
      - OPENSEARCH_JAVA_OPTS=${OPENSEARCH_JAVA_OPTS}
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile: { soft: 65536, hard: 65536 }
    volumes:
      # Named volume for data (Docker manages permissions)
      - wazuh-indexer-data:/var/lib/wazuh-indexer
      # Config files (bind mounts, read-only)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-indexer/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer-key.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.key:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.indexer.pem:/usr/share/wazuh-indexer/certs/wazuh.indexer.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin.pem:/usr/share/wazuh-indexer/certs/admin.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/admin-key.pem:/usr/share/wazuh-indexer/certs/admin-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer/wazuh.indexer.yml:/usr/share/wazuh-indexer/opensearch.yml:ro
      - ${CONFIG_DIR}/wazuh_indexer/internal_users.yml:/usr/share/wazuh-indexer/opensearch-security/internal_users.yml:ro

  wazuh.manager:
    image: wazuh/wazuh-manager:4.13.1
    hostname: wazuh.manager
    restart: unless-stopped
    depends_on:
      - wazuh.indexer
    ulimits:
      memlock: { soft: -1, hard: -1 }
      nofile: { soft: 655360, hard: 655360 }
    ports:
      - "${APP_IP}:1514:1514"
      - "${APP_IP}:1515:1515" 
      - "${APP_IP}:514:514/udp"
      - "${APP_IP}:55000:55000"
    environment:
      - INDEXER_URL=https://wazuh.indexer:9200
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - FILEBEAT_SSL_VERIFICATION_MODE=full
      - SSL_CERTIFICATE_AUTHORITIES=/etc/ssl/root-ca.pem
      - SSL_CERTIFICATE=/etc/ssl/filebeat.pem
      - SSL_KEY=/etc/ssl/filebeat.key
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      # Named volumes for persistent data
      - wazuh_api_configuration:/var/ossec/api/configuration
      - wazuh_etc:/var/ossec/etc
      - wazuh_logs:/var/ossec/logs
      - wazuh_queue:/var/ossec/queue
      - wazuh_var_multigroups:/var/ossec/var/multigroups
      - wazuh_integrations:/var/ossec/integrations
      - wazuh_active_response:/var/ossec/active-response/bin
      - wazuh_agentless:/var/ossec/agentless
      - wazuh_wodles:/var/ossec/wodles
      - filebeat_etc:/etc/filebeat
      - filebeat_var:/var/lib/filebeat
      # Config files (bind mounts)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/etc/ssl/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager.pem:/etc/ssl/filebeat.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.manager-key.pem:/etc/ssl/filebeat.key:ro

  wazuh.dashboard:
    image: wazuh/wazuh-dashboard:4.13.1
    hostname: wazuh.dashboard
    restart: unless-stopped
    depends_on:
      - wazuh.indexer
      - wazuh.manager
    ports:
      - "${APP_IP}:443:5601"
    environment:
      - INDEXER_USERNAME=${INDEXER_USERNAME}
      - INDEXER_PASSWORD=${INDEXER_PASSWORD}
      - WAZUH_API_URL=https://wazuh.manager
      - API_USERNAME=${API_USERNAME}
      - API_PASSWORD=${API_PASSWORD}
    volumes:
      # Named volumes for dashboard data
      - wazuh-dashboard-config:/usr/share/wazuh-dashboard/data/wazuh/config
      - wazuh-dashboard-custom:/usr/share/wazuh-dashboard/plugins/wazuh/public/assets/custom
      # Config files (bind mounts)
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/wazuh.dashboard-key.pem:/usr/share/wazuh-dashboard/certs/wazuh-dashboard-key.pem:ro
      - ${CONFIG_DIR}/wazuh_indexer_ssl_certs/root-ca.pem:/usr/share/wazuh-dashboard/certs/root-ca.pem:ro
      - ${CONFIG_DIR}/wazuh_dashboard/opensearch_dashboards.yml:/usr/share/wazuh-dashboard/config/opensearch_dashboards.yml:ro
      - ${CONFIG_DIR}/wazuh_dashboard/wazuh.yml:/usr/share/wazuh-dashboard/data/wazuh/config/wazuh.yml:ro

# Named volumes (Docker creates and manages these)
volumes:
  wazuh_api_configuration:
  wazuh_etc:
  wazuh_logs:
  wazuh_queue:
  wazuh_var_multigroups:
  wazuh_integrations:
  wazuh_active_response:
  wazuh_agentless:
  wazuh_wodles:
  filebeat_etc:
  filebeat_var:
  wazuh-indexer-data:
  wazuh-dashboard-config:
  wazuh-dashboard-custom:
```

### Required Configuration Files

Create these files in VS Code Server before first deployment:

#### Indexer Configuration

**File: `config/wazuh_indexer/wazuh.indexer.yml`**
```yaml
network.host: 0.0.0.0
node.name: wazuh.indexer
cluster.initial_master_nodes:
  - wazuh.indexer
cluster.name: wazuh-cluster
discovery.seed_hosts:
  - wazuh.indexer
node.max_local_storage_nodes: 3
path.data: /var/lib/wazuh-indexer
path.logs: /var/log/wazuh-indexer

plugins.security.ssl.transport.pemcert_filepath: certs/wazuh.indexer.pem
plugins.security.ssl.transport.pemkey_filepath: certs/wazuh.indexer.key
plugins.security.ssl.transport.pemtrustedcas_filepath: certs/root-ca.pem
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: certs/wazuh.indexer.pem
plugins.security.ssl.http.pemkey_filepath: certs/wazuh.indexer.key
plugins.security.ssl.http.pemtrustedcas_filepath: certs/root-ca.pem
plugins.security.allow_unsafe_democertificates: false
plugins.security.allow_default_init_securityindex: true
plugins.security.authcz.admin_dn:
  - CN=admin,OU=Wazuh,O=Wazuh,L=California,C=US
plugins.security.check_snapshot_restore_write_privileges: true
plugins.security.enable_snapshot_restore_privilege: true
plugins.security.system_indices.enabled: true
plugins.security.system_indices.indices:
  - ".opendistro-alerting-config"
  - ".opendistro-alerting-alert*"
  - ".opendistro-anomaly-results*"
  - ".opendistro-anomaly-detector*"
  - ".opendistro-anomaly-checkpoints"
  - ".opendistro-anomaly-detection-state"
  - ".opendistro-reports-*"
  - ".opendistro-notifications-*"
  - ".opendistro-notebooks"
  - ".opensearch-observability"
  - ".opendistro-asynchronous-search-response*"
  - ".replication-metadata-store"
cluster.routing.allocation.disk.threshold_enabled: false
```

#### Dashboard Configuration

**File: `config/wazuh_dashboard/opensearch_dashboards.yml`**
```yaml
server.host: 0.0.0.0
server.port: 5601
opensearch.hosts: https://wazuh.indexer:9200
opensearch.ssl.verificationMode: certificate
opensearch.ssl.certificateAuthorities: ["/usr/share/wazuh-dashboard/certs/root-ca.pem"]
opensearch.username: kibanaserver
opensearch.password: kibanaserver
opensearch.requestHeadersAllowlist: ["securitytenant","Authorization"]
opensearch_security.multitenancy.enabled: false
opensearch_security.readonly_mode.roles: ["kibana_read_only"]
server.ssl.enabled: true
server.ssl.key: "/usr/share/wazuh-dashboard/certs/wazuh-dashboard-key.pem"
server.ssl.certificate: "/usr/share/wazuh-dashboard/certs/wazuh-dashboard.pem"
server.ssl.certificateAuthorities: ["/usr/share/wazuh-dashboard/certs/root-ca.pem"]
opensearch.ssl.certificateAuthorities: ["/usr/share/wazuh-dashboard/certs/root-ca.pem"]
uiSettings.overrides.defaultRoute: /app/wazuh
```

**File: `config/wazuh_dashboard/wazuh.yml`**
```yaml
hosts:
  - 1513629884013:
      url: https://wazuh.manager
      port: 55000
      username: wazuh-wui
      password: MyS3cr37P450r.*-
```

## Deployment Process

### Step 1: Create Directory Structure

**In VS Code Server terminal:**
```bash
# Create the main directory
mkdir -p /mnt/personal/docker-configs/wazuh
cd /mnt/personal/docker-configs/wazuh

# Create config subdirectories
mkdir -p config/wazuh_indexer_ssl_certs
mkdir -p config/wazuh_indexer
mkdir -p config/wazuh_dashboard
mkdir -p config/wazuh_cluster
```

### Step 2: Create Configuration Files

Using VS Code Server interface, create the files listed above with their respective content.

Download the initial ones from - https://github.com/wazuh/wazuh-docker/tree/main/single-node - or git clone the whole repo then pull the ones you want.

### Step 3: Generate Certificates

**In TrueNAS Web Shell:**
```bash
# Generate TLS certificates (must be done from TrueNAS Web Shell)
docker run --rm -it \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certificates \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator:0.0.2

# Verify certificates were created
ls -la /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs/
```

### Step 4: Deploy Wazuh Stack

**In TrueNAS Web Shell:**
```bash
cd /mnt/personal/docker-configs/wazuh

# Deploy the stack
docker compose up -d

# Monitor the deployment
docker compose logs -f
```

### Step 5: Initial Access

- **Dashboard URL**: `https://192.168.1.29:443`
- **Default Login**: `admin` / `SecretPassword`

## Password Management

Wazuh has two separate credential systems:

### A) Wazuh Manager API Password (Simple)

Controls: Dashboard → Manager API communication

**Files to Update:**
1. `.env` file: `API_PASSWORD=YourNewAPIPassword`
2. `config/wazuh_dashboard/wazuh.yml`: Update the `password` field

**Apply Changes:**
```bash
docker compose restart wazuh.manager wazuh.dashboard
```

### B) OpenSearch Internal Users (Complex)

Controls: Service-to-service authentication with indexer

**Important**: Change only **one user at a time**

#### Example: Changing Admin Password

**Step 1: Generate Password Hash**
```bash
# In TrueNAS Web Shell
docker run --rm wazuh/wazuh-indexer:4.13.1 \
  /usr/share/wazuh-indexer/plugins/opensearch-security/tools/hash.sh -p "NewStrongPassword123!"

# Copy the output hash (starts with $2a$12$...)
```

**Step 2: Update Compose Environment**
```bash
# In VS Code Server - edit .env file
INDEXER_PASSWORD=NewStrongPassword123!
```

**Step 3: Update Internal Users File**
```bash
# In VS Code Server - edit config/wazuh_indexer/internal_users.yml
admin:
  hash: "$2a$12$YOUR_GENERATED_HASH_HERE"
  reserved: true
  backend_roles:
  - "admin"
  description: "Demo admin user"

# Keep other users unchanged during this change
kibanaserver:
  hash: "$2a$12$4AcgvvJ5RBKHrFAKE9fC1.MMvNPp2eM9xN2VWgqhn5Ut2fN7dWNxS"
  reserved: true
  description: "Demo kibanaserver user"
```

**Step 4: Apply OpenSearch Security Changes**
```bash
# In TrueNAS Web Shell
cd /mnt/personal/docker-configs/wazuh

# Stop all services
docker compose down

# Start only indexer
docker compose up -d wazuh.indexer

# Wait for indexer to be ready
sleep 30

# Apply security configuration
docker run --rm --network=wazuh_default \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certs:ro \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer:/sec:ro \
  wazuh/wazuh-indexer:4.13.1 \
  /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh \
  -cd /sec/opensearch-security/ -nhnv \
  -cacert /certs/root-ca.pem \
  -cert /certs/admin.pem \
  -key /certs/admin-key.pem \
  -p 9200 -icl -h wazuh.indexer

# Start all services
docker compose up -d
```

**Step 5: Verify**
```bash
# Test new credentials
curl -k -u admin:NewStrongPassword123! https://192.168.1.29:9200/_cluster/health
```

## Reverse Proxy Setup (Nginx Proxy Manager)

### NPM Configuration

- **Proxy Host**: `wazuh.yourdomain.com`
- **Destination**: `https://192.168.1.29:443`
- **Websockets**: Enabled
- **SSL Certificate**: Let's Encrypt or custom

### Handle Self-Signed Upstream Certificate

In NPM Advanced tab, add:
```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
proxy_read_timeout 3600;
proxy_ssl_verify off;
```

## Complete Reset Procedure

When things break and you need to start fresh:

### Clean Docker Environment

**In TrueNAS Web Shell:**
```bash
cd /mnt/personal/docker-configs/wazuh

# Stop all services
docker compose down -v

# Remove any leftover containers
docker container rm -f $(docker container ls -aq --filter "name=wazuh") 2>/dev/null || echo "No containers to remove"

# Remove all wazuh-related volumes
docker volume rm $(docker volume ls -q | grep wazuh) 2>/dev/null || echo "No volumes to remove"

# Clean up networks
docker network rm $(docker network ls -q --filter "name=wazuh") 2>/dev/null || echo "No networks to remove"

# Verify clean state
docker ps -a | grep wazuh || echo "✅ No Wazuh containers"
docker volume ls | grep wazuh || echo "✅ No Wazuh volumes"
```

### Reset Configuration (Keep YAML/ENV)

**In TrueNAS Web Shell:**
```bash
cd /mnt/personal/docker-configs/wazuh

# Show what will be deleted
echo "=== WILL DELETE ==="
ls -la config/ 2>/dev/null || echo "No config directory"

echo "=== WILL KEEP ==="
ls -la docker-compose.yml .env

# Delete all config directories and files
rm -rf config/

# Create fresh directory structure
mkdir -p config/wazuh_indexer_ssl_certs
mkdir -p config/wazuh_indexer
mkdir -p config/wazuh_dashboard
mkdir -p config/wazuh_cluster

echo "✅ Config reset complete"
```

### Regenerate Certificates

```bash
# Generate fresh certificates
docker run --rm -it \
  -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certificates \
  -e NODE_NAME=wazuh.indexer \
  -e WAZUH_MANAGER=wazuh.manager \
  -e WAZUH_DASHBOARD=wazuh.dashboard \
  wazuh/wazuh-certs-generator:0.0.2
```

```bash
docker run --rm -it \ -v /mnt/personal/docker-configs/wazuh/config/wazuh_indexer_ssl_certs:/certificates \ -v /mnt/personal/docker-configs/wazuh/config/certs.yml:/config/certs.yml \ wazuh/wazuh-certs-generator:0.0.2
```


### Recreate Configuration Files

Using VS Code Server, recreate the configuration files listed in the "Required Configuration Files" section above.

Download fresh config files

```bash
# Download official Wazuh configuration files
curl -so config/wazuh_indexer/wazuh.indexer.yml https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.13.0/single-node/config/wazuh_indexer/wazuh.indexer.yml
curl -so config/wazuh_indexer/internal_users.yml https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.13.0/single-node/config/wazuh_indexer/internal_users.yml  
curl -so config/wazuh_dashboard/opensearch_dashboards.yml https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.13.0/single-node/config/wazuh_dashboard/opensearch_dashboards.yml
curl -so config/wazuh_dashboard/wazuh.yml https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.13.0/single-node/config/wazuh_dashboard/wazuh.yml
curl -so config/wazuh_cluster/wazuh_manager.conf https://raw.githubusercontent.com/wazuh/wazuh-docker/v4.13.0/single-node/config/wazuh_cluster/wazuh_manager.conf

echo "✅ Fresh config files downloaded"
```

## Troubleshooting

### Common Issues

**1. `vm.max_map_count` Warning**
```
[WARN] max virtual memory areas vm.max_map_count [65530] is too low
```
**Solution**: Set the sysctl value as described in prerequisites.

**2. Certificate Permission Warnings**
These warnings in logs are cosmetic and don't affect functionality:
```
[WARN] Directory /usr/share/wazuh-indexer/certs has insecure file permissions
```

**3. 401 Authentication Errors**
```
Request failed with status code 401
```
**Solution**: Follow the password management procedures exactly, ensuring you change only one OpenSearch user at a time.

**4. Certificate Generator Image Not Found**
```
manifest for wazuh/wazuh-certs-generator:4.13.1 not found
```
**Solution**: Use the correct image tag: `wazuh/wazuh-certs-generator:0.0.2`

### Port Configuration

- **Published Ports** (on APP_IP): 443 (dashboard), 1514/1515 (agents), 55000 (API), 514/udp (syslog)
- **Internal Only**: 9200 (indexer) - never publish this port publicly

## Maintenance

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f wazuh.dashboard
```

### Updates

```bash
# Update image tags in docker-compose.yml
# Then redeploy
docker compose pull
docker compose up -d
```

### Backup Important Data

- Configuration files in `/mnt/personal/docker-configs/wazuh/config/`
- Docker volumes contain runtime data (managed by Docker)

This comprehensive guide should get you a fully functional Wazuh deployment on TrueNAS SCALE with proper certificate management, password controls, and troubleshooting procedures.