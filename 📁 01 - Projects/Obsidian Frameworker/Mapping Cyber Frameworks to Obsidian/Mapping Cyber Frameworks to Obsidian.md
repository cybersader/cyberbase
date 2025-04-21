---
aliases: []
tags: []
publish: true
permalink:
date created: Sunday, April 20th 2025, 10:06 pm
date modified: Monday, April 21st 2025, 4:06 pm
---

[Framework Crosswalks](../Framework%20Crosswalks/Framework%20Crosswalks.md)
[Framework Crosswalker - TLDR](../Framework%20Crosswalker%20-%20TLDR/Framework%20Crosswalker%20-%20TLDR.md)


| #   | Link name (src ↔ tgt)    | DataFrame / Framework                 | Column used to match          | Expected value format<sup>*</sup>             | Common pitfalls                                                                                               |
| --- | ------------------------ | ------------------------------------- | ----------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | **CRI ↔ CSF2**           | `df_cri_core` (CRI)                   | **Profile Id**                | `DE.AE‑02.01` (function.category‑subcategory) | extra spaces, lowercase                                                                                       |
|     |                          | `df_csf2` (CSF v2)                    | **CSF ID**                    | same string, exact case                       | CSF IDs sometimes wrapped in parentheses in raw sheet                                                         |
| 3   | **NIST‑800‑53 ↔ ATT&CK** | `df_nist_core`                        | **Control Identifier**        | `AC‑…`                                        | _No canonical mapping exists_ – you need a cross‑walk table.  <br>With **exact** mode these will never match. |
|     |                          | `df_mitre_attack` (ATT&CK Enterprise) | **ID**                        | `T1059`, `T1059.003`                          | ATT&CK IDs start with **T**/**S**; they do not resemble 800‑53 IDs                                            |
| 4   | **ATT&CK ↔ D3FEND**      | `df_mitre_attack`                     | **ID**                        | `T1059` …                                     | ——                                                                                                            |
|     |                          | `df_defend` (D3FEND)                  | **ID**                        | `D3‑PUBS` style (e.g. `D3-IMAGERY`)           | ATT&CK “T‑codes” ≠ D3FEND IDs → no hits with **exact**                                                        |
| 5   | **CSF2 ↔ CIS v8**        | `df_csf2`                             | **CSF ID**                    | `DE.AE‑02.01` etc.                            | ——                                                                                                            |
|     |                          | `df_cis_controls` (CIS v8)            | **CIS ID** (generated column) | `1.1`, `3.5` (controls) **or** `1` …          | dot in safeguards removed later (`replace(".", "_")`) so file‑name and YAML differ                            |

# Merging Style

| want to…                                              | set `premerge` | supply `map_df` | pros & cons                                                                     |
| ----------------------------------------------------- | -------------- | --------------- | ------------------------------------------------------------------------------- |
| **A)** _join once, then treat like normal_            | `True`         | required        | fastest at runtime; but duplicates mapping columns in the core DF you pre‑merge |
| **B)** _keep tables separate; look up IDs on the fly_ | `False`        | required        | keeps core DFs pristine; slightly slower (dictionary lookup)                    |
| **C)** _ignore mapping table – direct compare_        | `False`        | `None`          | original behaviour                                                              |
|                                                       |                |                 |                                                                                 |

# Transformations/Normalizing Columns

- **CRI ↔ CSF2**
	- CRI
		- Profile 
			- GV.OC-05
			- GV.OC
			- GV
	- CSF2
		- CSF ID
			- GV
			- GV.OC
			- GV.OC-01
- **NIST‑800‑53 ↔ ATT&CK**
	- NIST‑800‑53
		- Control Identifier
			- AC-1
			- AC-3(7)
	- ATT&CK
		- T1608.003
- **ATT&CK ↔ D3FEND**
	- ATT&CK
		- 
	- D3FEND
		- 
- **CSF2 ↔ CIS v8**
	- CSF2
		- 
	- CIS v8
		- 