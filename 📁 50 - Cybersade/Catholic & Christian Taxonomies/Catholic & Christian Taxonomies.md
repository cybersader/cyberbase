---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Sunday, September 7th 2025, 7:24 pm
date modified: Sunday, September 7th 2025, 7:35 pm
---

##### You said:

Are there catholic or christian knowledge taxonomies or knowledge graphs or knowledge organization structures that have ever been created. You could say I'm trying to understand how one may organize such a library of knowledge or information. I should also note that I DO NOT want some complicated library science type organization, but moreso a simplified version that I could incorporate into a cyber-based website on digital stewardship to give resources

###### ChatGPT said:

Short answer: yes—there are several well-worn Catholic/Christian “organizing spines” you can borrow, and you can keep them simple.

# Proven spines you can reuse

1. **Catechism’s Four Pillars** (the de-facto Catholic macro-taxonomy)
- **Creed** (what we believe)
- **Liturgy/Sacraments** (how we worship)
- **Life in Christ** (morality/virtue)
- **Prayer** (how we pray)  
	These parts are explicit in the Catechism’s table of contents and make an excellent top-level nav.
2. **Code of Canon Law (7 Books)** — helpful when you need a “policies & governance” drawer (e.g., parish/diocesan guidance, roles, procedures):  
	I. General Norms; II. People of God; III. Teaching Office; IV. Sanctifying Office; V. Temporal Goods; VI. Sanctions; VII. Processes.
3. **Catholic Social Teaching (CST) “7 Themes”** — great tags for ethics/tech issues (privacy, AI, labor, media):  
	Life & Dignity; Family/Community/Participation; Rights & Responsibilities; Option for the Poor; Dignity of Work & Rights of Workers; Solidarity; Care for Creation.
4. **Virtue framework** — simple, universal tags for formation:
- **Cardinal**: prudence, justice, fortitude, temperance.
- **Theological**: faith, hope, charity.  
	(CCC 1803–1804 and Aquinas’s Summa I-II q.61).
5. **Bible referencing & lightweight data standards**
- **OSIS** (Open Scripture Information Standard) for consistent Scripture refs/links if you ever want structured Bible citations.
- **OpenBible.info** topical lists/geocoding are handy, free “starter datasets” to wire verses to topics.
6. **Subject lists used by churchy libraries (optional, borrowable terms)**
- **Catholic Subject Headings (CSH)**—historic supplements to LCSH you can mine for vocabulary without copying the whole library-science stack.
- **LC Class BR-BX**—just know it exists if you want a backstop for “where does this live?” questions.

# A **simplified** site taxonomy for “Digital Stewardship”

Keep it 2–3 levels max; think “drawers + tags.”

**Top level (drawers) = Four Pillars + a ‘Practice’ drawer**

- **Creed** (Doctrine, Creeds, Councils)
- **Worship** (Mass, Sacraments, sacramentals)
- **Life in Christ** (Moral theology, virtues, vices)
- **Prayer** (Methods, devotions, liturgy of the hours)
- **Digital Stewardship** (your focus; practical resources)

**Inside “Digital Stewardship” (second level)**

- **People**: parents, teens, clergy/staff, educators, volunteers
- **Practices**: safeguarding, privacy, screen habits, community rules, discernment, accountability, parish policies
- **Technology**: platforms (social, messaging), devices, filters, AI, data protection, incident response

**Tags (cross-cutting)**

- **CST themes** (7) → ethical angle on each resource.
- **Virtues** (prudence, temperance, …) → formation lens.
- **Authority level**: Magisterial (council, encyclical, CCC), Episcopal (USCCB/diocese), Religious orders, Trusted lay apostolates, Practitioner guides.
- **Media type**: Scripture, CCC, Church doc, guide, video, checklist, policy template.
- **Actionability**: Quick Win / Playbook / Deep Dive.

# Minimal, practical metadata (YAML you can drop into Obsidian)

```
title: "Family Phone & Media Rule-of-Life (Catholic)"
slug: family-media-rule
pillar: "Life in Christ"
cst_themes: ["Rights and Responsibilities","Solidarity","Dignity of Work & Workers"]
virtues: ["prudence","temperance","justice"]
audience: ["parents","parish-staff"]
authority_level: "practitioner"
media_type: "guide"
actionability: "Quick Win"
scripture_refs: ["Phil 4:8","Mt 5:8"]         # OSIS-ready if you later formalize
ccc_refs: ["CCC 1803-1804","CCC 2514-2533"]   # virtues, chastity/media purity
links:
  church_docs:
    - name: "CST Themes (USCCB)"
      url: "https://www.usccb.org/beliefs-and-teachings/what-we-believe/catholic-social-teaching/seven-themes-of-catholic-social-teaching"
  related_guides: ["teen-phone-contract","screen-time-discernment"]
summary: >
  A one-page family rule for phones/media rooted in virtue ethics and CST.
checklist:
  - "Define family purpose for tech (virtue/call to holiness)."
  - "Set do-not-disturb & charging station hours."
  - "Use accountability for adults; supervision for minors."
```

# How to stitch it together (fast)

- **Nav** = the **Four Pillars** + **Digital Stewardship**. (Authoritative, intuitive.)
- **Every resource** carries small **tags**: 1–2 CST themes + 1–2 virtues + audience. (This gives you instant filtered views like “Parents × Prudence × Privacy”.)
- **Citations**: When you quote Church teaching, link to **CCC** paragraphs or official docs; for policy/governance pieces, you can file them under the **Canon Law** drawer and tag appropriately.
- **Scripture**: keep refs simple now; if you ever want machine-readable Bible links or verse-topic widgets, adopt **OSIS** IDs later and/or pull topic lists from **OpenBible.info**.

If you want, I can turn this into:

- a starter folder/tag map for your vault,
- a half-dozen prefilled resource cards (Quick Wins + Playbooks),
- and a tiny JSON schema so your site can render filters instantly.