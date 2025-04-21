---
aliases: []
tags: []
publish: true
permalink:
date created: Monday, April 21st 2025, 9:05 am
date modified: Monday, April 21st 2025, 9:09 am
---

# High‑Level Flow of `framework_to_obsidian.py`

## 1. Imports & Global Setup

- Standard libraries (`os`, `re`, `sys`, …)  
- Third‑party (`pandas`, `yaml`, `tqdm`, `numpy`, …)  
- Warnings suppression, progress‑bar integration  

---

## 2. Helper Functions  

These contain bits of logic that can’t live in data alone, e.g.:  
- `print_df_info()` – debug printer  
- `match_value()` – flexible string/array/regex matcher  
- `build_full_path_components()` / `split_folders()` – path splitting  
- `sanitize_column_name()`  
- `hierarchical_ffill()` – grouped forward‑fill  

---

## 3. Core Engine Stubs  

(Placeholders for the taxonomy + linker, to be fleshed out in code)  
- **Taxonomy builder** – “given a DataFrame + config → create folders + Markdown”  
- **Linker** – “given two frameworks + matching rules → inject relative links”  

---

## 4. `__main__` Orchestration  

### 4.1. Startup  

- `tqdm.pandas()`  
- Suppress warnings  

### 4.2. Load & Prep Each Framework  

For each framework (CRI, NIST‑53, ATT&CK, ENGAGE, D3FEND, CSF2, CIS):  
1. **Read** from Excel/CSV  
2. **Clean** strings & column names  
3. **Custom transforms** (e.g. tag‑aggregation for CRI; regex ID normalization for NIST A‑Procedures; hierarchical ffill for D3FEND; CIS “preamble” extraction)  
4. **Merge** crosswalk sheets into a single “core” DataFrame  

### 4.3. Deduplication  

- Call `deduplicate_by_id()` on each core DataFrame so each primary key appears only once  

### 4.4. Define Code‑Level Configs  

(Some logic here can’t be in pure JSON/YAML – e.g. the `add_cri_to_tags()` function, regex normalizers, or the way you want tags split.)  
- Build `FrameworkConfig` instances that tie each DataFrame to:  
  - its hierarchy columns  
  - path‑naming lambdas  
  - which fields → frontmatter vs. headings vs. tags  
- Build `LinkConfig` instances that define each cross‑framework relationship:  
  - source/target DataFrames & columns  
  - match mode (exact / array‑contains / regex)  
  - injection point (at_source / at_target / both)  

---

## 5. Taxonomy Generation Loop  

```python
for fw_cfg in all_framework_configs:
    build_taxonomy(fw_cfg, vault_base_path)
```

- Walk each row → compute folder path → write `.md` with YAML + headings + tags

---

## 6. Linking Loop

```python
for link_cfg in all_link_configs:
    apply_links(link_cfg, vault_base_path)
```

Build lookup of target IDs → scan source files → append/link accordingly

---

## 7. (Optional) Summary / Logging

- Print out final counts, any unmatched rows, etc.

---

## 8. Future Extensions / Plugins

- CLI args (–dry‑run, –framework=CRI, –clean-only)
- Hook for GUI configs or interactive mapping
- Export summary CSV of created files/links
- Does this capture the overall structure you had in mind?  Let me know which sections you’d move around or expand.