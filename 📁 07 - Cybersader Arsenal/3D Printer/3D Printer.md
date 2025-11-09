---
aliases: []
tags: []
publish: true
permalink:
title:
date created: Saturday, July 19th 2025, 12:03 pm
date modified: Sunday, November 9th 2025, 1:16 pm
---

[3D Prints](../3D%20Prints/3D%20Prints.md)
[3D Printing](../../⬇%20INBOX,%20DROPZONE/3D%20Printing/3D%20Printing.md)

# Setup - Ender 3 S1

- [youtube.com > Creality Ender-3 S1 - 3D Printer - Unbox & Setup](https://www.youtube.com/watch?v=AghQEvW-4JQ)

## Networking?

- Set up Octopi on Raspberry Pi and plug that into the Ender 3 S1

# Workflow

- Modeling
	- Tinkercad
	- Blender
	- Sketchup
- Slicing
	- Ultimaker Cura
	- Creality Slicer

## Summary

Ultimaker Cura remains the industry‑standard slicer for preparing 3D models with extensive control over slicing parameters such as layer height, infill, supports, and over 400 custom settings [UltiMaker](https://ultimaker.com/software/ultimaker-cura/?utm_source=chatgpt.com). OctoPrint provides a snappy web interface for controlling and monitoring prints, offering full remote control and basic slicing via plugins, but it lacks the depth of a dedicated slicer like Cura [OctoPrint.org](https://octoprint.org/?utm_source=chatgpt.com)[OctoPrint Community Forum](https://community.octoprint.org/t/plugin-octoprint-internal-slicer/57514?utm_source=chatgpt.com). A common beginner workflow is to import your STL into Cura, fine‑tune layer thickness (e.g., 0.1–0.3 mm) and infill (10–50 %), export the resulting G‑code, then upload and manage the print via OctoPrint’s web UI [All3DP](https://all3dp.com/2/3d-printer-layer-height-how-much-does-it-matter/?utm_source=chatgpt.com)[All3DP](https://all3dp.com/2/infill-3d-printing-what-it-means-and-how-to-use-it/?utm_source=chatgpt.com). Since STL files themselves do not embed metadata, you should consult the model page or creator’s notes for recommended settings like layer height, infill density, and filament type to ensure optimal results [Reddit](https://www.reddit.com/r/3Dprinting/comments/t1dew6/a_silly_but_serious_question_regarding_stl_files/?utm_source=chatgpt.com)[All3DP](https://all3dp.com/2/best-3d-printer-test-print-3d-models/?utm_source=chatgpt.com).

---

## Workflow Overview

### Slicing in Cura

Cura offers both “Recommended” mode with simplified presets and “Custom” mode exposing over 400 adjustable parameters, including support generation, print temperature, and advanced extrusion controls [UltiMaker](https://ultimaker.com/learn/ultimaker-cura-features/?utm_source=chatgpt.com). Layer height controls the vertical resolution of prints; smaller values like 0.1 mm yield smoother surfaces at the cost of longer build times, while larger heights like 0.3 mm print faster with reduced detail; for the Ender 3 S1, 0.2 mm is a great starting point [All3DP](https://all3dp.com/2/3d-printer-layer-height-how-much-does-it-matter/?utm_source=chatgpt.com). Infill density affects part strength and weight: 10–20 % is sufficient for decorative or low‑stress parts, 30–50 % for functional components, and up to 100 % for maximum solidity in load‑bearing prints [All3DP](https://all3dp.com/2/infill-3d-printing-what-it-means-and-how-to-use-it/?utm_source=chatgpt.com). Cura also lets you assign filament profiles (e.g., PLA, PETG) which automatically set optimal nozzle and bed temperatures as well as flow rates [UltiMaker](https://ultimaker.com/software/ultimaker-cura/?utm_source=chatgpt.com).

### Sending to OctoPrint

OctoPrint runs on a Raspberry Pi (or similar SBC) and connects to the Ender 3 S1 over USB, providing remote operations such as print start/pause, temperature adjustment, live webcam streaming, and timelapse recording [OctoPrint.org](https://octoprint.org/?utm_source=chatgpt.com). While OctoPrint can slice STL files via the “OctoPrint Internal Slicer” plugin, that plugin is community‑maintained and offers only basic slicing profiles; it’s generally recommended to use Cura’s robust engine and then send the exported G‑code to OctoPrint for printing [OctoPrint Community Forum](https://community.octoprint.org/t/plugin-octoprint-internal-slicer/57514?utm_source=chatgpt.com)[Reddit](https://www.reddit.com/r/3Dprinting/comments/wo98rl/octoprint_used_to_have_a_slicer_build_in/?utm_source=chatgpt.com).

---

## Key Decisions Explained

### Layer Height

Your layer height choice balances print quality and speed: 0.1 mm achieves very fine detail, 0.2 mm is a sweet spot for most prototypes, and 0.3 mm can halve print time for draft or large models [All3DP](https://all3dp.com/2/3d-printer-layer-height-how-much-does-it-matter/?utm_source=chatgpt.com). Adjust this based on the visible layer lines you’re willing to accept versus the total print duration.

### Infill Settings

Infill percentage and pattern determine internal strength, weight, and material usage: grid, cubic, gyroid, or triangle patterns are common. A 20 % grid infill is a solid general‑purpose choice; bump to 50 % or higher with triangle or gyroid for structural parts [All3DP](https://all3dp.com/2/infill-3d-printing-what-it-means-and-how-to-use-it/?utm_source=chatgpt.com). Lower infill (10 %) can save material on non‑functional prints.

### Model Metadata & Download Info

Although STL files do not embed standard metadata like layer height or filament settings, some newer formats (3MF, AMF) can carry basic annotations, though adoption is limited [Adobe](https://www.adobe.com/creativecloud/file-types/image/vector/stl-file.html?utm_source=chatgpt.com). Your best resource is the model’s download page or accompanying README, which often lists print time, material type, recommended layer height, and infill percentage [Original Prusa 3D Printers](https://forum.prusa3d.com/forum/english-forum-general-discussion-announcements-and-releases/printables-include-print-data/?utm_source=chatgpt.com). Look for downloadable profiles (e.g., `.3mf` with embedded profiles) or user comments that confirm successful print settings.

---

By slicing in Cura and then managing prints via OctoPrint, you leverage the strengths of both tools: Cura’s deep slicing controls and OctoPrint’s powerful remote monitoring and control. With a solid grasp of layer height, infill choices, and how to extract creator‑provided metadata, you’ll be well on your way to smooth, successful prints on your Ender 3 S1.