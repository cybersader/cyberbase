---
title: Data Engineering and Analytics Research Index
permalink: data-engineering-analytics-research
aliases:
  - Self-Hosted Data Pipeline Research
  - Data Platform Research Index
tags:
  - data-engineering
  - analytics
  - self-hosting
publish: true
date created: "2026-10-30"
date modified: "2026-11-03"
---

# Data Engineering and Analytics Research Index

A starting point for the data-platform research already collected in Cyberbase: self-hosted ingestion and transformation, ongoing data pipelines, and analytics for structured, nested, or tabular data. Much of the earlier exploration grew out of security monitoring, but the underlying tools and questions extend beyond security and GRC.

> [!note] Historical research, not a current product comparison
> This index connects existing notes without replacing them. Tool mentions range from bookmarks to workflow ideas; they do not establish that a product is lightweight, currently self-hostable, maintained, or suitable for a particular workload. Licensing, deployment requirements, and old pricing claims need fresh verification.

## Start here

### 1. Modern Data Engineering Stack for Cyber

[Open the original research hub](https://cybersader.github.io/cyberbase/CybersaderNotion/03-Awesome-Cyber/Pro-Cyber-Resources/Modern-Data-Engineering-Stack-for-Cyber)

The broadest entry point: ETL/ELT, APIs, Pandas, data integration, single-source-of-truth approaches, orchestration, ingestion, and streaming. Useful for recovering the original vocabulary and related research branches.

### 2. ETL, Data Integration, and Data Replication

[Open the ETL and integration notes](https://cybersader.github.io/cyberbase/CybersaderNotion/03-Awesome-Cyber/Pro-Cyber-Resources/Modern-Data-Engineering-Stack-for-Cyber/ETL-(Extract-Transform-Load)--and--Data-Integration--and-)

The closest match to the self-hosted pipeline question. Covers Airbyte and Jitsu, alongside n8n, Pipedream, Make, and Zapier. Includes observations about transformation limitations and sketches a source-to-target workflow using containerized ingestion tools. The original deployment labels are historical notes, not independently verified hosting guidance.

### 3. Pipeline and analytics research

Additional archived research is not selected for this public site, so this index does not link to or publish those source notes. The useful research threads to revisit are:

- **Security data pipelines:** Tenzir, Tarsal, Mezmo, and related pipeline research.
- **General analytics and exploration:** Metabase, Pentaho, Kibana, Jupyter, and broader data-platform search terms.
- **ETL, transformation, stream processing, and data pipelines:** Airbyte, Jitsu, dbt, Cribl Stream alternatives, Kafka, Airflow, Flink, and NiFi.
- **Data formats:** JSON, CSV, Parquet, Arrow, and other formats.
- **Additional transformation tools:** Singer, StreamSets, and Fluent Bit.

Finding alternatives to Cribl Stream is a useful thread to resume separately from general-purpose analytics.

### 4. Awesome SecOps Data Engineering

[Open the SecOps data-engineering collection](https://cybersader.github.io/cyberbase/%F0%9F%93%81-03---Curations,-Stacks/Awesome-SecOps-Data-Engineering/Awesome-SecOps-Data-Engineering)

A short navigation note with a link to the 2024 MAD data landscape. Some of its older internal references may point to material that is not published here. Its recorded dates are June 20, 2024 (created) and January 31, 2025 (modified); these are note metadata, not dates for a particular research session.

### 5. Self-hosting leads

Meltano was saved as a self-hosting research lead alongside Matano. This is a discovery lead rather than a completed evaluation. The original bookmark note is not selected for this public site and remains unchanged.

## Find the right research thread

| Question | Best starting point |
|---|---|
| How can APIs or databases feed a self-hosted pipeline? | ETL and integration notes |
| What alternatives exist for collecting, shaping, and routing events? | Cribl alternatives and security data pipelines |
| Which tools handle scheduling versus event streaming? | Airflow, Kafka, Flink, and NiFi |
| What could provide exploration, reports, or dashboards? | Metabase, Pentaho, Kibana, and Jupyter |
| Which self-hosting bookmark is worth revisiting? | Meltano |
| Where are the broader terminology references? | Modern Data Engineering hub |

## Questions for the next research pass

- **Continuous versus streaming:** is a reliable scheduled incremental refresh enough, or must each event be processed immediately?
- **Data shape:** how are nested objects, arrays, schema changes, joins, and tabular outputs handled?
- **Lightweight operation:** what are the minimum services, memory/storage needs, backup requirements, and upgrade burden?
- **Reliability and security:** how are checkpoints, retries, duplicate prevention, credential storage, access control, and private datasets handled?

These questions organize future evaluation; the existing notes do not yet resolve them into a tested shortlist. Linking a note here does not change whether that note is selected for public publication.
