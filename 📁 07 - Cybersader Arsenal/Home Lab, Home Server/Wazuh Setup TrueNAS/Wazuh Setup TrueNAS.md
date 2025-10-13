---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, October 5th 2025, 2:03 pm
date modified: Monday, October 13th 2025, 10:02 am
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

## 5) Passwords—what needs what (and when)

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
2025-10-05 22:05:39.844133+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844137+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844144+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initPerformanceAnalyzerStateFromConf$0(PerformanceAnalyzerController.java:222) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844149+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844157+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.844163+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844176+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initPerformanceAnalyzerStateFromConf(PerformanceAnalyzerController.java:214) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844181+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:57) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844190+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.844196+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.844203+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.844208+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.844214+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844221+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844226+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844230+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844238+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844243+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844247+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844255+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844260+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844264+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844272+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844277+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844284+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844289+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844294+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.844301+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848511+00:00[2025-10-05T22:05:39,847][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/performance_analyzer_enabled.conf
2025-10-05 22:05:39.848560+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/performance_analyzer_enabled.conf
2025-10-05 22:05:39.848581+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.848586+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.848591+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.848599+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.848604+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.848610+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.848618+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.848623+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848629+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848636+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.848640+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848646+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848650+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.updatePerformanceAnalyzerState(PerformanceAnalyzerController.java:143) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848659+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initPerformanceAnalyzerStateFromConf$0(PerformanceAnalyzerController.java:228) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848663+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848671+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.848675+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848682+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initPerformanceAnalyzerStateFromConf(PerformanceAnalyzerController.java:214) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848691+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:57) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848706+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.848714+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.848722+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.848727+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.848733+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848740+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848745+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848750+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848758+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848763+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848769+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848777+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848781+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848786+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848793+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848798+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848802+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848809+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848814+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.848818+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852522+00:00[2025-10-05T22:05:39,851][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/rca_enabled.conf
2025-10-05 22:05:39.852560+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/rca_enabled.conf
2025-10-05 22:05:39.852582+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.852586+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.852589+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.852600+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.852604+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.852608+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.852617+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.852621+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852626+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852634+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.852639+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852645+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852650+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initRcaStateFromConf$1(PerformanceAnalyzerController.java:242) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852658+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852663+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.852671+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852675+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initRcaStateFromConf(PerformanceAnalyzerController.java:234) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852682+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:58) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852687+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.852695+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.852699+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.852704+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.852712+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852717+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852721+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852730+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852734+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852738+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852746+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852751+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852755+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852763+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852767+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852772+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852782+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852786+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852790+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.852798+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856028+00:00[2025-10-05T22:05:39,854][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/rca_enabled.conf
2025-10-05 22:05:39.856076+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/rca_enabled.conf
2025-10-05 22:05:39.856079+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.856083+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.856094+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.856097+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.856100+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.856105+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.856108+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.856111+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856116+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856119+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.856122+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856128+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856131+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.updateRcaState(PerformanceAnalyzerController.java:158) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856136+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initRcaStateFromConf$1(PerformanceAnalyzerController.java:248) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856139+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856144+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.856147+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856152+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initRcaStateFromConf(PerformanceAnalyzerController.java:234) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856155+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:58) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856166+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.856170+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.856179+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.856183+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.856186+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856191+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856194+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856197+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856202+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856205+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856208+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856214+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856217+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856220+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856225+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856228+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856234+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856237+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856240+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.856245+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.859950+00:00[2025-10-05T22:05:39,858][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/logging_enabled.conf
2025-10-05 22:05:39.860017+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/logging_enabled.conf
2025-10-05 22:05:39.860050+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.860056+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.860062+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.860071+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.860076+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.860081+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.860090+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.860096+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860101+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860109+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.860115+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860123+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860129+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initLoggingStateFromConf$2(PerformanceAnalyzerController.java:262) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860139+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860145+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.860154+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860159+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initLoggingStateFromConf(PerformanceAnalyzerController.java:254) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860167+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:59) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860173+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.860181+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.860187+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.860192+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.860201+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860207+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860211+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860219+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860225+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860230+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860238+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860243+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860248+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860257+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860263+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860267+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860277+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860282+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860290+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.860297+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.862853+00:00[2025-10-05T22:05:39,862][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/logging_enabled.conf
2025-10-05 22:05:39.862922+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/logging_enabled.conf
2025-10-05 22:05:39.862930+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.862936+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.862953+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.862959+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.862964+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.862974+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.862979+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.862984+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.862993+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.862999+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.863008+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863014+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863023+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.updateLoggingState(PerformanceAnalyzerController.java:175) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863030+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initLoggingStateFromConf$2(PerformanceAnalyzerController.java:268) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863040+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863045+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.863050+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863059+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initLoggingStateFromConf(PerformanceAnalyzerController.java:254) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863065+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:59) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863074+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.863079+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.863095+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.863101+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.863113+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863118+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863123+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863132+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863137+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863142+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863151+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863157+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863162+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863170+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863175+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863180+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863188+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863193+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863197+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.863205+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865206+00:00[2025-10-05T22:05:39,864][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/batch_metrics_enabled.conf
2025-10-05 22:05:39.865337+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/batch_metrics_enabled.conf
2025-10-05 22:05:39.865353+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.865375+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.865397+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.865403+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.865409+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.865420+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.865425+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.865432+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865442+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865447+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.865453+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865461+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865468+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initBatchMetricsStateFromConf$3(PerformanceAnalyzerController.java:281) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865479+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865491+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.865495+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865499+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initBatchMetricsStateFromConf(PerformanceAnalyzerController.java:274) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865509+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:60) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865514+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.865521+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.865528+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.865535+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.865540+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865545+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865552+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865557+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865563+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865571+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865577+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865584+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865597+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865605+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865610+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865621+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865627+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865631+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865643+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.865648+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.866871+00:00[2025-10-05T22:05:39,866][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/batch_metrics_enabled.conf
2025-10-05 22:05:39.866932+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/batch_metrics_enabled.conf
2025-10-05 22:05:39.866939+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.866958+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.866963+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.866968+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.866978+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.866982+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.866987+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.866992+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867001+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867006+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.867015+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867020+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867028+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.updateBatchMetricsState(PerformanceAnalyzerController.java:190) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867035+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initBatchMetricsStateFromConf$3(PerformanceAnalyzerController.java:291) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867045+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867050+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.867063+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867068+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initBatchMetricsStateFromConf(PerformanceAnalyzerController.java:274) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867077+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:60) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867082+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.867091+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.867096+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.867101+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.867111+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867116+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867121+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867129+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867135+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867145+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867150+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867155+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867164+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867169+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867173+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867182+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867187+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867192+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867200+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.867205+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869066+00:00[2025-10-05T22:05:39,868][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/thread_contention_monitoring_enabled.conf
2025-10-05 22:05:39.869130+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/thread_contention_monitoring_enabled.conf
2025-10-05 22:05:39.869136+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.869141+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.869161+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.869165+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.869169+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.869179+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.869184+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.869188+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869197+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869202+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.869212+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869217+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869225+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initThreadContentionMonitoringStateFromConf$4(PerformanceAnalyzerController.java:304) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869231+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869241+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.869245+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869254+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initThreadContentionMonitoringStateFromConf(PerformanceAnalyzerController.java:297) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869259+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:61) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869269+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.869273+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.869283+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.869290+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.869294+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869306+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869310+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869314+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869323+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869328+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869332+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869342+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869348+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869353+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869387+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869392+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869396+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869409+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869414+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.869419+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.871764+00:00[2025-10-05T22:05:39,871][ERROR][o.o.p.c.PerformanceAnalyzerController] [wazuh.indexer] java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/thread_contention_monitoring_enabled.conf
2025-10-05 22:05:39.871819+00:00java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/thread_contention_monitoring_enabled.conf
2025-10-05 22:05:39.871857+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:39.871863+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:39.871867+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:39.871882+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.newByteChannel(UnixFileSystemProvider.java:261) ~[?:?]
2025-10-05 22:05:39.871887+00:00at java.base/java.nio.file.spi.FileSystemProvider.newOutputStream(FileSystemProvider.java:482) ~[?:?]
2025-10-05 22:05:39.871891+00:00at java.base/java.nio.file.Files.newOutputStream(Files.java:228) ~[?:?]
2025-10-05 22:05:39.871901+00:00at java.base/java.nio.file.Files.write(Files.java:3505) ~[?:?]
2025-10-05 22:05:39.871905+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$saveStateToConf$5(PerformanceAnalyzerController.java:350) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871909+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871919+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.871924+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871933+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.saveStateToConf(PerformanceAnalyzerController.java:342) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871938+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.updateThreadContentionMonitoringState(PerformanceAnalyzerController.java:208) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871949+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.lambda$initThreadContentionMonitoringStateFromConf$4(PerformanceAnalyzerController.java:320) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871954+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.lambda$invokePrivileged$1(PerformanceAnalyzerPlugin.java:141) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871964+00:00at java.base/java.security.AccessController.doPrivileged(AccessController.java:319) [?:?]
2025-10-05 22:05:39.871969+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.invokePrivileged(PerformanceAnalyzerPlugin.java:137) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871980+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.initThreadContentionMonitoringStateFromConf(PerformanceAnalyzerController.java:297) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871985+00:00at org.opensearch.performanceanalyzer.config.PerformanceAnalyzerController.<init>(PerformanceAnalyzerController.java:61) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871995+00:00at org.opensearch.performanceanalyzer.PerformanceAnalyzerPlugin.<init>(PerformanceAnalyzerPlugin.java:172) [opensearch-performance-analyzer-2.19.2.0.jar:2.19.2.0]
2025-10-05 22:05:39.871999+00:00at java.base/jdk.internal.reflect.DirectConstructorHandleAccessor.newInstance(DirectConstructorHandleAccessor.java:62) ~[?:?]
2025-10-05 22:05:39.872007+00:00at java.base/java.lang.reflect.Constructor.newInstanceWithCaller(Constructor.java:502) ~[?:?]
2025-10-05 22:05:39.872013+00:00at java.base/java.lang.reflect.Constructor.newInstance(Constructor.java:486) ~[?:?]
2025-10-05 22:05:39.872017+00:00at org.opensearch.plugins.PluginsService.loadPlugin(PluginsService.java:809) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872039+00:00at org.opensearch.plugins.PluginsService.loadBundle(PluginsService.java:757) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872044+00:00at org.opensearch.plugins.PluginsService.loadBundles(PluginsService.java:551) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872048+00:00at org.opensearch.plugins.PluginsService.<init>(PluginsService.java:197) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872064+00:00at org.opensearch.node.Node.<init>(Node.java:524) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872069+00:00at org.opensearch.node.Node.<init>(Node.java:451) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872074+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872085+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872089+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872094+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872104+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872108+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872113+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872122+00:00at org.opensearch.cli.Command.main(Command.java:101) [opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872127+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:39.872131+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) [opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.147977+00:00[2025-10-05T22:05:40,147][INFO ][o.o.i.r.ReindexPlugin    ] [wazuh.indexer] ReindexPlugin reloadSPI called
2025-10-05 22:05:40.148796+00:00[2025-10-05T22:05:40,148][INFO ][o.o.i.r.ReindexPlugin    ] [wazuh.indexer] Unable to find any implementation for RemoteReindexExtension
2025-10-05 22:05:40.165077+00:00[2025-10-05T22:05:40,164][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: opensearch_time_series_analytics, index: .opendistro-anomaly-detector-jobs
2025-10-05 22:05:40.179349+00:00[2025-10-05T22:05:40,179][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: reports-scheduler, index: .opendistro-reports-definitions
2025-10-05 22:05:40.180346+00:00[2025-10-05T22:05:40,180][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: opendistro-index-management, index: .opendistro-ism-config
2025-10-05 22:05:40.181791+00:00[2025-10-05T22:05:40,181][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: checkBatchJobTaskStatus, index: .ml_commons_task_polling_job
2025-10-05 22:05:40.182426+00:00[2025-10-05T22:05:40,182][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: scheduler_geospatial_ip2geo_datasource, index: .scheduler-geospatial-ip2geo-datasource
2025-10-05 22:05:40.183465+00:00[2025-10-05T22:05:40,183][INFO ][o.o.j.JobSchedulerPlugin ] [wazuh.indexer] Loaded scheduler extension: async-query-scheduler, index: .async-query-scheduler
2025-10-05 22:05:40.186967+00:00[2025-10-05T22:05:40,186][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [aggs-matrix-stats]
2025-10-05 22:05:40.187220+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [analysis-common]
2025-10-05 22:05:40.187345+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [cache-common]
2025-10-05 22:05:40.187586+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [geo]
2025-10-05 22:05:40.187707+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-common]
2025-10-05 22:05:40.187852+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-geoip]
2025-10-05 22:05:40.187934+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [ingest-user-agent]
2025-10-05 22:05:40.188026+00:00[2025-10-05T22:05:40,187][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-expression]
2025-10-05 22:05:40.188138+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-mustache]
2025-10-05 22:05:40.188230+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [lang-painless]
2025-10-05 22:05:40.188322+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [mapper-extras]
2025-10-05 22:05:40.188403+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [opensearch-dashboards]
2025-10-05 22:05:40.188483+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [parent-join]
2025-10-05 22:05:40.188608+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [percolator]
2025-10-05 22:05:40.188713+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [rank-eval]
2025-10-05 22:05:40.188819+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [reindex]
2025-10-05 22:05:40.188907+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [repository-url]
2025-10-05 22:05:40.189001+00:00[2025-10-05T22:05:40,188][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [search-pipeline-common]
2025-10-05 22:05:40.189099+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [systemd]
2025-10-05 22:05:40.189196+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded module [transport-netty4]
2025-10-05 22:05:40.189541+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-alerting]
2025-10-05 22:05:40.189632+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-anomaly-detection]
2025-10-05 22:05:40.189759+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-asynchronous-search]
2025-10-05 22:05:40.189882+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-cross-cluster-replication]
2025-10-05 22:05:40.190002+00:00[2025-10-05T22:05:40,189][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-geospatial]
2025-10-05 22:05:40.190130+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-index-management]
2025-10-05 22:05:40.190264+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-job-scheduler]
2025-10-05 22:05:40.190352+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-knn]
2025-10-05 22:05:40.190480+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-ml]
2025-10-05 22:05:40.190566+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-neural-search]
2025-10-05 22:05:40.190677+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-notifications]
2025-10-05 22:05:40.190776+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-notifications-core]
2025-10-05 22:05:40.190907+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-observability]
2025-10-05 22:05:40.190989+00:00[2025-10-05T22:05:40,190][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-performance-analyzer]
2025-10-05 22:05:40.191109+00:00[2025-10-05T22:05:40,191][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-reports-scheduler]
2025-10-05 22:05:40.191258+00:00[2025-10-05T22:05:40,191][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-security]
2025-10-05 22:05:40.191418+00:00[2025-10-05T22:05:40,191][INFO ][o.o.p.PluginsService     ] [wazuh.indexer] loaded plugin [opensearch-sql]
2025-10-05 22:05:40.228712+00:00[2025-10-05T22:05:40,228][INFO ][o.o.s.OpenSearchSecurityPlugin] [wazuh.indexer] Disabled https compression by default to mitigate BREACH attacks. You can enable it by setting 'http.compression: true' in opensearch.yml
2025-10-05 22:05:40.241601+00:00[2025-10-05T22:05:40,240][ERROR][o.o.b.OpenSearchUncaughtExceptionHandler] [wazuh.indexer] uncaught exception in thread [main]
2025-10-05 22:05:40.241632+00:00org.opensearch.bootstrap.StartupException: OpenSearchException[failed to bind service]; nested: AccessDeniedException[/var/lib/wazuh-indexer/nodes];
2025-10-05 22:05:40.241657+00:00uncaught exception in thread [main]
2025-10-05 22:05:40.241664+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:185) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241687+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241702+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241705+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138) ~[opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241708+00:00at org.opensearch.cli.Command.main(Command.java:101) ~[opensearch-cli-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241716+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241719+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241722+00:00Caused by: org.opensearch.OpenSearchException: failed to bind service
2025-10-05 22:05:40.241728+00:00at org.opensearch.node.Node.<init>(Node.java:1564) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241731+00:00at org.opensearch.node.Node.<init>(Node.java:451) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241734+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241740+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241743+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241746+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241753+00:00... 6 more
2025-10-05 22:05:40.241756+00:00Caused by: java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/nodes
2025-10-05 22:05:40.241759+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90) ~[?:?]
2025-10-05 22:05:40.241765+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106) ~[?:?]
2025-10-05 22:05:40.241768+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111) ~[?:?]
2025-10-05 22:05:40.241772+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.createDirectory(UnixFileSystemProvider.java:462) ~[?:?]
2025-10-05 22:05:40.241778+00:00at java.base/java.nio.file.Files.createDirectory(Files.java:700) ~[?:?]
2025-10-05 22:05:40.241781+00:00at java.base/java.nio.file.Files.createAndCheckIsDirectory(Files.java:808) ~[?:?]
2025-10-05 22:05:40.241784+00:00at java.base/java.nio.file.Files.createDirectories(Files.java:794) ~[?:?]
2025-10-05 22:05:40.241786+00:00at org.opensearch.env.NodeEnvironment.lambda$new$0(NodeEnvironment.java:343) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241793+00:00at org.opensearch.env.NodeEnvironment$NodeLock.<init>(NodeEnvironment.java:265) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241796+00:00at org.opensearch.env.NodeEnvironment.<init>(NodeEnvironment.java:341) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241802+00:00at org.opensearch.node.Node.<init>(Node.java:561) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241805+00:00at org.opensearch.node.Node.<init>(Node.java:451) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241808+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241814+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241817+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241820+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181) ~[opensearch-2.19.2.jar:2.19.2]
2025-10-05 22:05:40.241826+00:00... 6 more
2025-10-05 22:05:40.242191+00:00OpenSearchException[failed to bind service]; nested: AccessDeniedException[/var/lib/wazuh-indexer/nodes];
2025-10-05 22:05:40.242227+00:00Likely root cause: java.nio.file.AccessDeniedException: /var/lib/wazuh-indexer/nodes
2025-10-05 22:05:40.242234+00:00at java.base/sun.nio.fs.UnixException.translateToIOException(UnixException.java:90)
2025-10-05 22:05:40.242256+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:106)
2025-10-05 22:05:40.242262+00:00at java.base/sun.nio.fs.UnixException.rethrowAsIOException(UnixException.java:111)
2025-10-05 22:05:40.242267+00:00at java.base/sun.nio.fs.UnixFileSystemProvider.createDirectory(UnixFileSystemProvider.java:462)
2025-10-05 22:05:40.242291+00:00at java.base/java.nio.file.Files.createDirectory(Files.java:700)
2025-10-05 22:05:40.242296+00:00at java.base/java.nio.file.Files.createAndCheckIsDirectory(Files.java:808)
2025-10-05 22:05:40.242301+00:00at java.base/java.nio.file.Files.createDirectories(Files.java:794)
2025-10-05 22:05:40.242305+00:00at org.opensearch.env.NodeEnvironment.lambda$new$0(NodeEnvironment.java:343)
2025-10-05 22:05:40.242315+00:00at org.opensearch.env.NodeEnvironment$NodeLock.<init>(NodeEnvironment.java:265)
2025-10-05 22:05:40.242320+00:00at org.opensearch.env.NodeEnvironment.<init>(NodeEnvironment.java:341)
2025-10-05 22:05:40.242325+00:00at org.opensearch.node.Node.<init>(Node.java:561)
2025-10-05 22:05:40.242334+00:00at org.opensearch.node.Node.<init>(Node.java:451)
2025-10-05 22:05:40.242338+00:00at org.opensearch.bootstrap.Bootstrap$5.<init>(Bootstrap.java:242)
2025-10-05 22:05:40.242343+00:00at org.opensearch.bootstrap.Bootstrap.setup(Bootstrap.java:242)
2025-10-05 22:05:40.242352+00:00at org.opensearch.bootstrap.Bootstrap.init(Bootstrap.java:404)
2025-10-05 22:05:40.242357+00:00at org.opensearch.bootstrap.OpenSearch.init(OpenSearch.java:181)
2025-10-05 22:05:40.242361+00:00at org.opensearch.bootstrap.OpenSearch.execute(OpenSearch.java:172)
2025-10-05 22:05:40.242366+00:00at org.opensearch.cli.EnvironmentAwareCommand.execute(EnvironmentAwareCommand.java:104)
2025-10-05 22:05:40.242375+00:00at org.opensearch.cli.Command.mainWithoutErrorHandling(Command.java:138)
2025-10-05 22:05:40.242381+00:00at org.opensearch.cli.Command.main(Command.java:101)
2025-10-05 22:05:40.242385+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:138)
2025-10-05 22:05:40.242389+00:00at org.opensearch.bootstrap.OpenSearch.main(OpenSearch.java:104)
2025-10-05 22:05:40.242398+00:00For complete error details, refer to the log at /var/log/wazuh-indexer/opensearch.log
```

## wazuh.manager

```
2025-10-05 22:05:38.738742+00:00Configuring Certificate Authorities.
2025-10-05 22:05:38.740322+00:00Configuring SSL Certificate.
2025-10-05 22:05:38.741937+00:00Configuring SSL Key.
2025-10-05 22:05:38.745509+00:00[cont-init.d] 1-config-filebeat: exited 0.
2025-10-05 22:05:38.746355+00:00[cont-init.d] 2-manager: executing... 
2025-10-05 22:05:39.916987+00:00Configuring password.
2025-10-05 22:05:40.882956+00:002025/10/05 22:05:40 wazuh-modulesd:router: INFO: Loaded router module.
2025-10-05 22:05:40.882991+00:002025/10/05 22:05:40 wazuh-modulesd:content_manager: INFO: Loaded content_manager module.
2025-10-05 22:05:40.882997+00:002025/10/05 22:05:40 wazuh-modulesd:inventory-harvester: INFO: Loaded Inventory harvester module.
2025-10-05 22:05:41.257757+00:00Starting Wazuh v4.13.1...
2025-10-05 22:06:42.632865+00:00wazuh-apid did not start correctly.
2025-10-05 22:06:42.654836+00:00[cont-init.d] 2-manager: exited 1.
2025-10-05 22:06:42.657616+00:00[cont-init.d] done.
2025-10-05 22:06:42.660491+00:00[services.d] starting services
2025-10-05 22:06:42.694337+00:00starting Filebeat
2025-10-05 22:06:42.694666+00:00[services.d] done.
2025-10-05 22:06:42.694997+00:002025/10/05 21:51:50 wazuh-modulesd:router: INFO: Loaded router module.
2025-10-05 22:06:42.695010+00:002025/10/05 21:51:50 wazuh-modulesd:content_manager: INFO: Loaded content_manager module.
2025-10-05 22:06:42.695013+00:002025/10/05 21:51:50 wazuh-modulesd:inventory-harvester: INFO: Loaded Inventory harvester module.
2025-10-05 22:06:42.695026+00:002025/10/05 22:02:03 wazuh-modulesd:router: INFO: Loaded router module.
2025-10-05 22:06:42.695029+00:002025/10/05 22:02:03 wazuh-modulesd:content_manager: INFO: Loaded content_manager module.
2025-10-05 22:06:42.695032+00:002025/10/05 22:02:03 wazuh-modulesd:inventory-harvester: INFO: Loaded Inventory harvester module.
2025-10-05 22:06:42.695036+00:002025/10/05 22:05:40 wazuh-modulesd:router: INFO: Loaded router module.
2025-10-05 22:06:42.695039+00:002025/10/05 22:05:40 wazuh-modulesd:content_manager: INFO: Loaded content_manager module.
2025-10-05 22:06:42.695043+00:002025/10/05 22:05:40 wazuh-modulesd:inventory-harvester: INFO: Loaded Inventory harvester module.
2025-10-05 22:06:42.708829+00:002025-10-05T22:06:42.708Z	INFO	instance/beat.go:645	Home path: [/usr/share/filebeat] Config path: [/etc/filebeat] Data path: [/var/lib/filebeat] Logs path: [/var/log/filebeat]
2025-10-05 22:06:42.708863+00:002025-10-05T22:06:42.708Z	INFO	instance/beat.go:653	Beat ID: 6bb3bd8f-fc0f-47a0-902f-7675172dff8c
2025-10-05 22:06:42.709128+00:002025-10-05T22:06:42.709Z	INFO	[seccomp]	seccomp/seccomp.go:124	Syscall filter successfully installed
2025-10-05 22:06:42.709155+00:002025-10-05T22:06:42.709Z	INFO	[beat]	instance/beat.go:981	Beat info	{"system_info": {"beat": {"path": {"config": "/etc/filebeat", "data": "/var/lib/filebeat", "home": "/usr/share/filebeat", "logs": "/var/log/filebeat"}, "type": "filebeat", "uuid": "6bb3bd8f-fc0f-47a0-902f-7675172dff8c"}}}
2025-10-05 22:06:42.709164+00:002025-10-05T22:06:42.709Z	INFO	[beat]	instance/beat.go:990	Build info	{"system_info": {"build": {"commit": "aacf9ecd9c494aa0908f61fbca82c906b16562a8", "libbeat": "7.10.2", "time": "2021-01-12T22:10:33.000Z", "version": "7.10.2"}}}
2025-10-05 22:06:42.709168+00:002025-10-05T22:06:42.709Z	INFO	[beat]	instance/beat.go:993	Go runtime info	{"system_info": {"go": {"os":"linux","arch":"amd64","max_procs":16,"version":"go1.14.12"}}}
2025-10-05 22:06:42.709745+00:002025-10-05T22:06:42.709Z	INFO	[beat]	instance/beat.go:997	Host info	{"system_info": {"host": {"architecture":"x86_64","boot_time":"2025-08-19T23:16:20Z","containerized":false,"name":"wazuh.manager","ip":["127.0.0.1/8","::1/128","172.16.23.3/24","fdd0:0:0:17::3/64","fe80::42:acff:fe10:1703/64"],"kernel_version":"6.12.15-production+truenas","mac":["02:42:ac:10:17:03"],"os":{"family":"redhat","platform":"amzn","name":"Amazon Linux","version":"2023","major":2023,"minor":8,"patch":20250908},"timezone":"UTC","timezone_offset_sec":0}}}
2025-10-05 22:06:42.709822+00:002025-10-05T22:06:42.709Z	INFO	[beat]	instance/beat.go:1026	Process info	{"system_info": {"process": {"capabilities": {"inheritable":null,"permitted":["chown","dac_override","fowner","fsetid","kill","setgid","setuid","setpcap","net_bind_service","net_raw","sys_chroot","mknod","audit_write","setfcap"],"effective":["chown","dac_override","fowner","fsetid","kill","setgid","setuid","setpcap","net_bind_service","net_raw","sys_chroot","mknod","audit_write","setfcap"],"bounding":["chown","dac_override","fowner","fsetid","kill","setgid","setuid","setpcap","net_bind_service","net_raw","sys_chroot","mknod","audit_write","setfcap"],"ambient":null}, "cwd": "/run/s6/services/filebeat", "exe": "/usr/share/filebeat/bin/filebeat", "name": "filebeat", "pid": 773, "ppid": 769, "seccomp": {"mode":"filter","no_new_privs":true}, "start_time": "2025-10-05T22:06:42.270Z"}}}
2025-10-05 22:06:42.709835+00:002025-10-05T22:06:42.709Z	INFO	instance/beat.go:299	Setup Beat: filebeat; Version: 7.10.2
2025-10-05 22:06:42.710146+00:002025-10-05T22:06:42.710Z	INFO	eslegclient/connection.go:99	elasticsearch url: https://wazuh.indexer:9200
2025-10-05 22:06:42.710267+00:002025-10-05T22:06:42.710Z	INFO	[publisher]	pipeline/module.go:113	Beat name: wazuh.manager
2025-10-05 22:06:42.711085+00:002025-10-05T22:06:42.711Z	INFO	beater/filebeat.go:117	Enabled modules/filesets: wazuh (alerts),  ()
2025-10-05 22:06:42.711368+00:002025-10-05T22:06:42.711Z	INFO	instance/beat.go:455	filebeat start running.
2025-10-05 22:06:42.711502+00:002025-10-05T22:06:42.711Z	INFO	memlog/store.go:119	Loading data file of '/var/lib/filebeat/registry/filebeat' succeeded. Active transaction id=0
2025-10-05 22:06:42.711514+00:002025-10-05T22:06:42.711Z	INFO	memlog/store.go:124	Finished loading transaction log file for '/var/lib/filebeat/registry/filebeat'. Active transaction id=0
2025-10-05 22:06:42.711552+00:002025-10-05T22:06:42.711Z	INFO	[registrar]	registrar/registrar.go:109	States Loaded from registrar: 0
2025-10-05 22:06:42.711566+00:002025-10-05T22:06:42.711Z	INFO	[crawler]	beater/crawler.go:71	Loading Inputs: 1
2025-10-05 22:06:42.711726+00:002025-10-05T22:06:42.711Z	INFO	log/input.go:157	Configured paths: [/var/ossec/logs/alerts/alerts.json]
2025-10-05 22:06:42.711735+00:002025-10-05T22:06:42.711Z	INFO	[crawler]	beater/crawler.go:141	Starting input (ID: 9132358592892857476)
2025-10-05 22:06:42.711739+00:002025-10-05T22:06:42.711Z	INFO	[crawler]	beater/crawler.go:108	Loading and starting Inputs completed. Enabled inputs: 1
```

## wazuh.dashboard

```
0:0:0:17::2:9200"}
2025-10-13 13:16:50.762259+00:00{"type":"log","@timestamp":"2025-10-13T13:16:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:16:53.266757+00:00{"type":"log","@timestamp":"2025-10-13T13:16:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:16:55.766919+00:00{"type":"log","@timestamp":"2025-10-13T13:16:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:16:58.271060+00:00{"type":"log","@timestamp":"2025-10-13T13:16:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:00.758044+00:00{"type":"log","@timestamp":"2025-10-13T13:17:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:03.263606+00:00{"type":"log","@timestamp":"2025-10-13T13:17:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:05.770930+00:00{"type":"log","@timestamp":"2025-10-13T13:17:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:08.280526+00:00{"type":"log","@timestamp":"2025-10-13T13:17:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:10.776226+00:00{"type":"log","@timestamp":"2025-10-13T13:17:10Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:13.268313+00:00{"type":"log","@timestamp":"2025-10-13T13:17:13Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:15.765984+00:00{"type":"log","@timestamp":"2025-10-13T13:17:15Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:18.289890+00:00{"type":"log","@timestamp":"2025-10-13T13:17:18Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:20.783095+00:00{"type":"log","@timestamp":"2025-10-13T13:17:20Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:23.288560+00:00{"type":"log","@timestamp":"2025-10-13T13:17:23Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:25.785035+00:00{"type":"log","@timestamp":"2025-10-13T13:17:25Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:28.287800+00:00{"type":"log","@timestamp":"2025-10-13T13:17:28Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:30.786597+00:00{"type":"log","@timestamp":"2025-10-13T13:17:30Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:33.280285+00:00{"type":"log","@timestamp":"2025-10-13T13:17:33Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:35.792145+00:00{"type":"log","@timestamp":"2025-10-13T13:17:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:38.287307+00:00{"type":"log","@timestamp":"2025-10-13T13:17:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:40.792386+00:00{"type":"log","@timestamp":"2025-10-13T13:17:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:43.295521+00:00{"type":"log","@timestamp":"2025-10-13T13:17:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:45.784086+00:00{"type":"log","@timestamp":"2025-10-13T13:17:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:48.285542+00:00{"type":"log","@timestamp":"2025-10-13T13:17:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:50.786008+00:00{"type":"log","@timestamp":"2025-10-13T13:17:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:53.292868+00:00{"type":"log","@timestamp":"2025-10-13T13:17:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:55.801732+00:00{"type":"log","@timestamp":"2025-10-13T13:17:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:17:58.295304+00:00{"type":"log","@timestamp":"2025-10-13T13:17:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:00.802767+00:00{"type":"log","@timestamp":"2025-10-13T13:18:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:03.293117+00:00{"type":"log","@timestamp":"2025-10-13T13:18:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:05.805446+00:00{"type":"log","@timestamp":"2025-10-13T13:18:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:08.299014+00:00{"type":"log","@timestamp":"2025-10-13T13:18:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:10.803690+00:00{"type":"log","@timestamp":"2025-10-13T13:18:10Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:13.306698+00:00{"type":"log","@timestamp":"2025-10-13T13:18:13Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:15.805745+00:00{"type":"log","@timestamp":"2025-10-13T13:18:15Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:18.297003+00:00{"type":"log","@timestamp":"2025-10-13T13:18:18Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:20.806286+00:00{"type":"log","@timestamp":"2025-10-13T13:18:20Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:23.312410+00:00{"type":"log","@timestamp":"2025-10-13T13:18:23Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:25.812466+00:00{"type":"log","@timestamp":"2025-10-13T13:18:25Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:28.312416+00:00{"type":"log","@timestamp":"2025-10-13T13:18:28Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:30.806748+00:00{"type":"log","@timestamp":"2025-10-13T13:18:30Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:33.317457+00:00{"type":"log","@timestamp":"2025-10-13T13:18:33Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:35.805454+00:00{"type":"log","@timestamp":"2025-10-13T13:18:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:38.321073+00:00{"type":"log","@timestamp":"2025-10-13T13:18:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:40.808045+00:00{"type":"log","@timestamp":"2025-10-13T13:18:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:43.321055+00:00{"type":"log","@timestamp":"2025-10-13T13:18:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:45.810298+00:00{"type":"log","@timestamp":"2025-10-13T13:18:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:48.319558+00:00{"type":"log","@timestamp":"2025-10-13T13:18:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:50.810709+00:00{"type":"log","@timestamp":"2025-10-13T13:18:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:53.312116+00:00{"type":"log","@timestamp":"2025-10-13T13:18:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:55.813395+00:00{"type":"log","@timestamp":"2025-10-13T13:18:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:18:58.328503+00:00{"type":"log","@timestamp":"2025-10-13T13:18:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:00.816529+00:00{"type":"log","@timestamp":"2025-10-13T13:19:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:03.331683+00:00{"type":"log","@timestamp":"2025-10-13T13:19:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:05.823983+00:00{"type":"log","@timestamp":"2025-10-13T13:19:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:08.321622+00:00{"type":"log","@timestamp":"2025-10-13T13:19:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:10.820007+00:00{"type":"log","@timestamp":"2025-10-13T13:19:10Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:13.326675+00:00{"type":"log","@timestamp":"2025-10-13T13:19:13Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:15.833228+00:00{"type":"log","@timestamp":"2025-10-13T13:19:15Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:18.337158+00:00{"type":"log","@timestamp":"2025-10-13T13:19:18Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:20.834318+00:00{"type":"log","@timestamp":"2025-10-13T13:19:20Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:23.336970+00:00{"type":"log","@timestamp":"2025-10-13T13:19:23Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:25.828705+00:00{"type":"log","@timestamp":"2025-10-13T13:19:25Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:28.338258+00:00{"type":"log","@timestamp":"2025-10-13T13:19:28Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:30.840184+00:00{"type":"log","@timestamp":"2025-10-13T13:19:30Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:33.338580+00:00{"type":"log","@timestamp":"2025-10-13T13:19:33Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:35.833487+00:00{"type":"log","@timestamp":"2025-10-13T13:19:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:38.335639+00:00{"type":"log","@timestamp":"2025-10-13T13:19:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:40.843712+00:00{"type":"log","@timestamp":"2025-10-13T13:19:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:43.340589+00:00{"type":"log","@timestamp":"2025-10-13T13:19:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:45.844657+00:00{"type":"log","@timestamp":"2025-10-13T13:19:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:48.337636+00:00{"type":"log","@timestamp":"2025-10-13T13:19:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:50.838105+00:00{"type":"log","@timestamp":"2025-10-13T13:19:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:53.342754+00:00{"type":"log","@timestamp":"2025-10-13T13:19:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:55.841160+00:00{"type":"log","@timestamp":"2025-10-13T13:19:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:19:58.341151+00:00{"type":"log","@timestamp":"2025-10-13T13:19:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:00.844852+00:00{"type":"log","@timestamp":"2025-10-13T13:20:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:03.344986+00:00{"type":"log","@timestamp":"2025-10-13T13:20:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:05.844963+00:00{"type":"log","@timestamp":"2025-10-13T13:20:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:08.346010+00:00{"type":"log","@timestamp":"2025-10-13T13:20:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:10.850708+00:00{"type":"log","@timestamp":"2025-10-13T13:20:10Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:13.348817+00:00{"type":"log","@timestamp":"2025-10-13T13:20:13Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:15.857858+00:00{"type":"log","@timestamp":"2025-10-13T13:20:15Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:18.350466+00:00{"type":"log","@timestamp":"2025-10-13T13:20:18Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:20.849451+00:00{"type":"log","@timestamp":"2025-10-13T13:20:20Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:23.352748+00:00{"type":"log","@timestamp":"2025-10-13T13:20:23Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:25.867460+00:00{"type":"log","@timestamp":"2025-10-13T13:20:25Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:28.354802+00:00{"type":"log","@timestamp":"2025-10-13T13:20:28Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:30.862441+00:00{"type":"log","@timestamp":"2025-10-13T13:20:30Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:33.356984+00:00{"type":"log","@timestamp":"2025-10-13T13:20:33Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:35.858103+00:00{"type":"log","@timestamp":"2025-10-13T13:20:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:38.358125+00:00{"type":"log","@timestamp":"2025-10-13T13:20:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:40.870497+00:00{"type":"log","@timestamp":"2025-10-13T13:20:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:43.360267+00:00{"type":"log","@timestamp":"2025-10-13T13:20:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:45.872813+00:00{"type":"log","@timestamp":"2025-10-13T13:20:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:48.362289+00:00{"type":"log","@timestamp":"2025-10-13T13:20:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:50.861991+00:00{"type":"log","@timestamp":"2025-10-13T13:20:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:53.363051+00:00{"type":"log","@timestamp":"2025-10-13T13:20:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:55.876397+00:00{"type":"log","@timestamp":"2025-10-13T13:20:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:20:58.365649+00:00{"type":"log","@timestamp":"2025-10-13T13:20:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:00.878855+00:00{"type":"log","@timestamp":"2025-10-13T13:21:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:03.369461+00:00{"type":"log","@timestamp":"2025-10-13T13:21:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:05.876584+00:00{"type":"log","@timestamp":"2025-10-13T13:21:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:08.369831+00:00{"type":"log","@timestamp":"2025-10-13T13:21:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:10.869734+00:00{"type":"log","@timestamp":"2025-10-13T13:21:10Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:13.370799+00:00{"type":"log","@timestamp":"2025-10-13T13:21:13Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:15.884042+00:00{"type":"log","@timestamp":"2025-10-13T13:21:15Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:18.373228+00:00{"type":"log","@timestamp":"2025-10-13T13:21:18Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:20.875490+00:00{"type":"log","@timestamp":"2025-10-13T13:21:20Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:23.377044+00:00{"type":"log","@timestamp":"2025-10-13T13:21:23Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:25.874001+00:00{"type":"log","@timestamp":"2025-10-13T13:21:25Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:28.376372+00:00{"type":"log","@timestamp":"2025-10-13T13:21:28Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:30.889777+00:00{"type":"log","@timestamp":"2025-10-13T13:21:30Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:33.378641+00:00{"type":"log","@timestamp":"2025-10-13T13:21:33Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:35.892685+00:00{"type":"log","@timestamp":"2025-10-13T13:21:35Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:38.380658+00:00{"type":"log","@timestamp":"2025-10-13T13:21:38Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:40.894964+00:00{"type":"log","@timestamp":"2025-10-13T13:21:40Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:43.381174+00:00{"type":"log","@timestamp":"2025-10-13T13:21:43Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:45.892716+00:00{"type":"log","@timestamp":"2025-10-13T13:21:45Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:48.386519+00:00{"type":"log","@timestamp":"2025-10-13T13:21:48Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:50.896262+00:00{"type":"log","@timestamp":"2025-10-13T13:21:50Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:53.387522+00:00{"type":"log","@timestamp":"2025-10-13T13:21:53Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:55.898122+00:00{"type":"log","@timestamp":"2025-10-13T13:21:55Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:21:58.388121+00:00{"type":"log","@timestamp":"2025-10-13T13:21:58Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:22:00.887944+00:00{"type":"log","@timestamp":"2025-10-13T13:22:00Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:22:03.396392+00:00{"type":"log","@timestamp":"2025-10-13T13:22:03Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:22:05.890042+00:00{"type":"log","@timestamp":"2025-10-13T13:22:05Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
2025-10-13 13:22:08.391631+00:00{"type":"log","@timestamp":"2025-10-13T13:22:08Z","tags":["error","opensearch","data"],"pid":54,"message":"[ConnectionError]: connect ECONNREFUSED fdd0:0:0:17::2:9200"}
```