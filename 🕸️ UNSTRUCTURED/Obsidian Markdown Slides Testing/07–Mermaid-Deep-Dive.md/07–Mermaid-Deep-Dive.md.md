---
aliases: []
tags: []
publish: true
permalink:
title: "Mermaid Deep Dive"
theme: sky
css: ["Slides-Extended-Library/_shared/custom.css"]
date created: Wednesday, November 5th 2025, 9:29 pm
date modified: Wednesday, November 5th 2025, 9:30 pm
---

# Sequence

```mermaid
sequenceDiagram
  autonumber
  User->>Obsidian: Edit note
  Obsidian->>Slides Extended: Render
  Slides Extended->>RevealJS: Display deck

```

Flowchart

```mermaid
flowchart LR
  A[Note] --> B{Slides Extended}
  B --> C[reveal.js deck]
  C --> D((Audience))
```
>Style mermaid with custom CSS if colors clash with your theme.

note:
> Styling Mermaid via CSS is effective; plugin supports custom CSS includes. :contentReference[oaicite:22]{index=22}