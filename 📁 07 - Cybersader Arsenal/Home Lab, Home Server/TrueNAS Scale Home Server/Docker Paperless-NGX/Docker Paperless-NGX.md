---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, May 11th 2025, 11:30 am
date modified: Sunday, May 11th 2025, 3:59 pm
---

[Paperless Storage](../../../Paperless%20Storage/Paperless%20Storage.md)

- [paperless-ngx.com > Setup - Paperless-ngx](https://docs.paperless-ngx.com/setup/#docker)
- Good example of using custom YAML - [youtube.com > TrueNAS Scale + Custom App (Baserow example)](https://www.youtube.com/watch?v=ZjWRPOkLCwA)
	- [github.com > serversathome/ServersatHome: This is the official Github for Servers@Home](https://github.com/serversathome/ServersatHome/tree/main)
- [youtube.com > Setup PAPERLESS on TrueNAS SCALE: Your Self-Hosted Document Manager - YouTube](https://www.youtube.com/watch?v=-Y6VudY35nE)
- [truenas.com > Installing Custom Apps](https://apps.truenas.com/managing-apps/installing-custom-apps/)

```yaml
services:
  broker:
    image: redis:7
    restart: unless-stopped
    container_name: paperless-broker
    volumes:
      - /mnt/personal/paperless-ngx/redisdata:/data

  db:
    image: postgres:17
    restart: unless-stopped
    container_name: paperless-db
    volumes:
      - /mnt/personal/paperless-ngx/pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperless

  webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    restart: unless-stopped
    container_name: paperless-ngx
    depends_on:
      - db
      - broker
      - tika
      - gotenberg
    ports:
      - "8010:8000"
    volumes:
      - /mnt/personal/paperless-ngx/data:/usr/src/paperless/data
      - /mnt/personal/paperless-ngx/media:/usr/src/paperless/media
      - /mnt/personal/paperless-ngx/export:/usr/src/paperless/export
      - /mnt/personal/paperless-ngx/consume:/usr/src/paperless/consume
    environment:
      PAPERLESS_DBHOST: db
      PAPERLESS_DBNAME: paperless
      PAPERLESS_DBUSER: paperless
      PAPERLESS_DBPASS: paperless
      PAPERLESS_REDIS: redis://broker:6379
      USERMAP_UID: "1000"
      USERMAP_GID: "100"
      PAPERLESS_TIKA_ENABLED: "1"
      PAPERLESS_TIKA_ENDPOINT: http://tika:9998
      PAPERLESS_TIKA_GOTENBERG_ENDPOINT: http://gotenberg:3000

  tika:
    image: apache/tika:latest
    restart: unless-stopped

  gotenberg:
    image: gotenberg/gotenberg:8.19
    restart: unless-stopped
    command:
      - "--chromium-disable-javascript=true"
      - "--chromium-allow-list=file:///tmp/.*"

# (No 'volumes:' section needed when using host paths)
```