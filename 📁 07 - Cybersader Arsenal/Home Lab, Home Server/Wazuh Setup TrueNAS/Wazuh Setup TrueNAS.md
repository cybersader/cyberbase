---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, October 5th 2025, 2:03 pm
date modified: Sunday, October 5th 2025, 5:21 pm
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

* **Simple:** one dataset, e.g. `/mnt/pool/wazuh`.
    
* **Better (recommended):** split by speed
    
    * **SSD**: `/mnt/pool/wazuh-ssd/indexer-data` (heavy I/O)
        
    * **HDD**:
        
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

## 5) Passwords—what needs what (and when)

There are **two** credential domains:

**A) Wazuh Manager API user** (`wazuh-wui`) — used by **Dashboard → Manager** over **55000**

* Put the **plain** password in both places:
    
    * your compose envs (`API_USERNAME` / `API_PASSWORD`) and
        
    * the Dashboard config file you mount: `config/wazuh_dashboard/wazuh.yml`.
        
* **No `securityadmin.sh` here.** This is not part of the OpenSearch security index. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
    

**B) Indexer internal users** (`admin`, `kibanaserver`) — live in **OpenSearch security index**

* When you change them you must:
    
    1. set the **plain** password in your compose/envs where referenced,
        
    2. generate a **hash** (using `hash.sh`) and place it into `config/wazuh_indexer/internal_users.yml`, then
        
    3. **apply with `securityadmin.sh`** so OpenSearch loads the updated file into its security index.  
        (You can only change **one user at a time**.) [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
        

### How to run `securityadmin.sh` from the TrueNAS Web Shell (no interactive container exec)

When you rotate an **indexer** user later, use a throwaway container that sits on the same Docker network and mounts your certs and security config. Example:

```bash
# 1) (Optional) generate a new hash to paste into internal_users.yml:
docker run --rm wazuh/wazuh-indexer \
  bash -lc '/usr/share/wazuh-indexer/plugins/opensearch-security/tools/hash.sh "NEWSTRONGPASSWORD"'

# -> copy the resulting hash into:
#    /mnt/personal/wazuh-hdd/config/wazuh_indexer/internal_users.yml
#    (for the one user you're changing)

# 2) Apply the change to the OpenSearch security index:
#    Adjust --network to your compose network name (often <folder>_default).
docker run --rm --network=wazuh_default \
  -v /mnt/personal/wazuh-hdd/config/wazuh_indexer_ssl_certs:/certs:ro \
  -v /mnt/personal/wazuh-hdd/config/wazuh_indexer:/sec:ro \
  wazuh/wazuh-indexer \
  bash -lc '\
    export CACERT=/certs/root-ca.pem; \
    export CERT=/certs/admin.pem; \
    export KEY=/certs/admin-key.pem; \
    /usr/share/wazuh-indexer/plugins/opensearch-security/tools/securityadmin.sh \
      -cd /sec/opensearch-security/ -nhnv \
      -cacert $CACERT -cert $CERT -key $KEY -p 9200 -icl -h wazuh.indexer'
```

OpenSearch does **not** auto-apply edits to `internal_users.yml`; running `securityadmin.sh` is the documented step that loads your changes into the index. [OpenSearch Documentation](https://docs.opensearch.org/latest/security/configuration/security-admin/?utm_source=chatgpt.com)

* * *

## 6) Reverse proxy (Nginx Proxy Manager)

* Proxy **only the Dashboard**: `https://<APP_IP>:443` (container **5601** → host **443** on the alias IP).
    
* Keep **9200 (indexer)** private. Keep **55000 (API)** LAN-only unless truly needed off-LAN. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    
* Because upstream is **self-signed** by default, either allow invalid upstream certs or add in **Advanced**:
    
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

* **Default:** place `.env` **next to your `compose.yaml`** (same directory). That’s where Compose auto-loads it. [Docker Documentation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)
    
* If you keep `.env` higher up (e.g., in `wazuh/` while `compose.yaml` is in `wazuh/single-node/`), then either:
    
    * run compose **from the parent** with `COMPOSE_FILE=single-node/compose.yaml`, so the “project directory” is the parent and `.env` is found there, **or**
        
    * keep running from `single-node/` but add **`--env-file ../.env`** (Compose v2) **or** use `env_file:` entries in your services. The path is **relative to the compose file**. [Docker Documentation+1](https://docs.docker.com/compose/how-tos/environment-variables/envvars/?utm_source=chatgpt.com)
        

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
    
    * Put the **plain** API password in `config/wazuh_dashboard/wazuh.yml` and make it match your `.env` `API_PASSWORD`.
        
    * Set `INDEXER_USERNAME/PASSWORD` and `DASHBOARD_USERNAME/PASSWORD` in `.env` for Dashboard ↔ Indexer auth (those are _plain_ values used by services). [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
        
5. **Deploy the Custom App** in TrueNAS (Apps → Custom → paste your compose YAML or point to it).
    
    * Publish ports only on your **alias IP** (`443→5601`, `1514`, `1515`, `55000`, plus optional `514/udp`).
        
    * **Do not** publish 9200. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
        
6. **Configure NPM** to proxy the Dashboard per §6.
    
7. **First login** to Dashboard using your configured credentials.
    
8. (Optional, later) **Rotate indexer user(s)**: generate hash → edit `internal_users.yml` → apply with **`securityadmin.sh`** via the docker-run one-shot in §5. [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
    

* * *

## 9) Ports: expose vs. keep private

* **Expose on APP_IP**:
    
    * `443/tcp` (Dashboard → NPM),
    * `1515/tcp` (agent enrollment),
    * `1514/tcp` (+ optionally `1514/udp` for syslog),
    * `55000/tcp` (Manager API—keep LAN-only).
        
* **Keep internal**: `9200/tcp` (Indexer/OpenSearch). If you must touch it, bind to `127.0.0.1:9200` temporarily. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    

* * *

## 10) Upgrades later

Bump the image tags and follow the Wazuh Docker upgrade notes—your bind-mounted datasets (data/certs/config) persist across redeploys. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/index.html?utm_source=chatgpt.com)

* * *

### Why these steps line up with the docs

* **Single-node stack + volumes/ports**: Wazuh’s Docker guide. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)
    
* **`vm.max_map_count`**: OpenSearch requires it even with Docker. [OpenSearch Documentation](https://docs.opensearch.org/latest/install-and-configure/install-opensearch/index/?utm_source=chatgpt.com)
    
* **Certs generator**: Official Wazuh image for TLS. [Docker Hub](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)
    
* **Password changes**: the Docker-specific flow and the “apply with `securityadmin.sh`” step come straight from Wazuh + OpenSearch security docs. [Wazuh Documentation+1](https://documentation.wazuh.com/current/deployment-options/docker/changing-default-password.html?utm_source=chatgpt.com)
    
* **`.env` location / `env_file` / COMPOSE_FILE**: official Docker Compose docs. [Docker Documentation+2Docker Documentation+2](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)
    
* **NPM upstream TLS**: using self-signed upstreams and disabling upstream verification if you haven’t installed a trusted cert yet. [GitHub](https://github.com/NginxProxyManager/nginx-proxy-manager/discussions/3332?utm_source=chatgpt.com)
    

* * *

## FAQ (quick)

**Does the depth of my `.env` file matter?**  
Yes. By default, Compose reads `.env` from the **same directory** as `compose.yaml`. If your `.env` is under `wazuh/` but your compose is under `wazuh/single-node/`, either move `.env` next to the compose **or** run from the parent with `COMPOSE_FILE=single-node/compose.yaml` **or** use `--env-file`/`env_file:` to point at it. [Docker Documentation+2Docker Documentation+2](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/?utm_source=chatgpt.com)

**Do I really have to run commands from the TrueNAS Web Shell?**  
For **cert generation** and (later) **`securityadmin.sh`**, yes—the official guidance expects those to run in the Docker host context; we’ve provided **docker-run** invocations so you don’t have to “exec” into containers. [Docker Hub+1](https://hub.docker.com/r/wazuh/wazuh-certs-generator?utm_source=chatgpt.com)

**Why keep 9200 private?**  
It’s the Indexer/OpenSearch API. Only the Manager/Filebeat/Dashboard should talk to it. Publishing it increases risk with no benefit in single-node. [Wazuh Documentation](https://documentation.wazuh.com/current/deployment-options/docker/wazuh-container.html?utm_source=chatgpt.com)