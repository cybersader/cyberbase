---
description: "Discussion about documents to keep physically versus digitally, with specific focus on legal and official originals that require a physical copy. A breakdown is provided for documents that should be kept in both digital and physical form, documents that may need the original if required, and documents that can be kept digitally only. Tips for long-term safety are also included."
author:
  - "ChatGPT"
  - "Cybersader"
date created: Sunday, July 13th 2025, 11:31 am
domain: "chatgpt.com"
source:
tags: ["clippings", "clippings/chatgpt", "legal_documents", "paperless_ngx", "document_organization", "document_storage", "document_retention", "document_safety"]
title: "Legal Documents to Keep"
ai_model:
date modified: Sunday, July 13th 2025, 11:33 am
---

##### You said:

I've got paperless ngx, but are there any documents that I need to legally physically keep? Are there any documents that would require to be physical other than things like receipts?

###### ChatGPT said:

Great question—and it's a smart move to use Paperless-ngx to digitize and organize your documents. However, **yes**, there are some documents you **should or must keep in physical form** depending on legal, governmental, or institutional requirements.

Here’s a breakdown of **documents you should keep physically** even if digitized:

---

### ✅ **Must Keep Physical (Legal/Official Originals)**

These are documents where the physical original may be required for legal purposes, identity verification, or critical processes:

| Document Type | Why Keep Physically |
| --- | --- |
| **Birth certificate** | Often needed for passports, ID, or government processes |
| **Social Security card (U.S.)** | Identity and tax purposes |
| **Marriage/divorce certificates** | Required for legal name changes, benefits |
| **Passports** | Official travel document |
| **Naturalization or immigration papers** | Immigration status proof |
| **Vehicle titles** | Required for selling or transferring ownership |
| **Property deeds** | Legal ownership proof |
| **Wills and trusts** | Often need original for probate |
| **Military discharge papers (e.g., DD-214)** | Benefits, veteran status proof |
| **Court judgments or legal settlements** | Sometimes required in original for enforcement |
| **Adoption papers** | Identity/legal proof |
| **Death certificates (of relatives)** | Settling estates, insurance, benefits |
| **Power of attorney documents** | Some institutions require the original |

---

### ⚠️ **Strongly Recommended to Keep (Backed Digitally)**

These might not *always* be required in physical form, but the original often speeds up or secures important processes:

| Document Type | Notes |
| --- | --- |
| **Loan agreements (e.g., mortgages, personal loans)** | Original signatures often preferred in disputes |
| **Stock/bond certificates (if physical)** | If not held electronically |
| **Insurance policies (home, life, etc.)** | Some older policies may only exist physically |
| **Receipts for major purchases (appliances, jewelry, electronics)** | Needed for warranty/insurance claims |

---

### ✅ **Can Usually Be Digital Only (Backups Recommended)**

| Document Type | Notes |
| --- | --- |
| Utility bills, bank statements, tax forms (if accepted digitally) | IRS and many institutions accept scanned versions if legible and authentic |
| Medical records | Can be scanned or pulled from provider portals |
| Pay stubs | Usually safe to store digitally unless needed for mortgage or other loan apps |
| General receipts | Often sufficient as scanned copies unless IRS audit requires originals for deductions (rare but possible) |

---

### 🛑 Receipts: When to Keep Originals

The **IRS recommends** keeping original **receipts for tax deductions** for up to **3–7 years** in case of an audit. However, **scans are usually sufficient** if they're clear and show all details, unless the IRS questions authenticity.

---

### 🔐 Tips for Long-Term Safety

- Store originals in a **fireproof, waterproof safe**.
- Keep **digital backups encrypted** and **stored off-site** (e.g., cloud and offline).
- Consider notarizing key documents where possible to preserve legal weight of digital versions.

---

Would you like a checklist PDF of these document types for your Paperless-ngx folders?

##### You said:

How do I retry the OCR content part on a document? It kind of sucked on one of my handwritten ones

###### ChatGPT said:

To retry the **OCR (Optical Character Recognition)** on a document in **Paperless-ngx**, especially if the original attempt didn't yield good results (e.g., for handwriting), you can re-run it manually using the following steps:

---

## 🧾 Step-by-Step: Retry OCR on a Document in Paperless-ngx

### Option 1: **Via the Web Interface (Re-consume)**

Paperless-ngx allows you to re-process a document by treating it as if it were just imported:

1. **Download the PDF** of the poorly OCR’d document.
2. **Delete the document** from Paperless-ngx (optional, if you don’t want duplicates).
3. **Drop the downloaded PDF into your `consume` folder** again.
	- Located at something like: `/path/to/paperless/consume/`
4. Let Paperless-ngx re-process it.
	- You can improve results by:
		- Naming the file smartly (e.g., include keywords or dates in the filename).
		- Enhancing the PDF using a tool like [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF) beforehand (see below).

---

### Option 2: **Using `document_retag.py` (Advanced CLI Method)**

If you don’t want to reimport, you can **force OCR retry** via command line.

If you have access to the container or backend:

```
docker exec -it paperless bash
# Inside the container:
python3 manage.py document_retag <document_id>
```

> Replace `<document_id>` with the ID number of the document. You can find this in the URL when viewing the document in the web interface.

---

### Option 3: **Use OCRmyPDF Before Reimporting**

Paperless-ngx uses OCRmyPDF under the hood. You can preprocess it yourself for better results, especially for handwritten text:

```
ocrmypdf --rotate-pages --deskew --clean --optimize 3 input.pdf output.pdf
```

Then re-import `output.pdf` into Paperless-ngx.

- You can add options like `--tesseract-config` for better recognition.
- If you want to try a **handwriting-friendly OCR model**, you can experiment with:
	- `--ocr-engine-mode 1` (for Tesseract legacy engine).
	- Or external tools like Transkribus (more complex, academic-level).

---

## 🛠 Tips for Better Handwriting OCR

- Increase contrast before importing.
- Use a scanner instead of a phone, if possible.
- Try writing more clearly with printed (not cursive) letters.
- Tesseract OCR (used by Paperless) struggles with messy handwriting.

---

Want me to help generate a shell script to retry OCR or enhance images automatically before Paperless imports them?