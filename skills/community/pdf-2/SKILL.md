---
name: pdf-2
cluster: community
description: "Advanced PDF v2: OCR, form extraction, table parsing, digital signatures, merge/split, annotation"
tags: ["pdf","ocr","tables","documents"]
dependencies: []
composes: []
similar_to: []
called_by: []
authorization_required: false
scope: general
model_hint: claude-sonnet
embedding_hint: "pdf ocr form extract table parse signature merge split annotate"
---

# pdf-2

## Purpose
This skill enables advanced PDF processing, including OCR for text extraction from images, form data extraction, table parsing into structured formats, digital signature verification and addition, PDF merging/splitting, and annotation handling. It's designed for automating document workflows in OpenClaw.

## When to Use
Use this skill for tasks involving scanned or complex PDFs, such as extracting data from invoices with tables and forms, verifying legal documents with signatures, or preparing reports by merging files. Apply it when dealing with non-searchable PDFs (e.g., via OCR) or when integration with other tools is needed for document pipelines.

## Key Capabilities
- OCR: Uses Tesseract engine to extract text; supports languages via --lang flag (e.g., --lang eng for English).
- Form Extraction: Parses PDF forms into JSON; extracts fields like text boxes or checkboxes using --fields flag.
- Table Parsing: Detects and converts tables to CSV; specify layout with --layout auto or --layout grid.
- Digital Signatures: Verifies signatures with --verify flag; adds new ones using --sign with a certificate path.
- Merge/Split: Merges multiple PDFs via --inputs flag; splits by page range, e.g., --pages 1-5.
- Annotation: Extracts or adds annotations (e.g., highlights) using --extract-annotations or --add-annotation type=highlight text="Note".

## Usage Patterns
Invoke via CLI for one-off tasks or API for scripted workflows. Chain commands with pipes, e.g., OCR output to a text processor. For batch processing, use loops in scripts. Always specify input/output paths explicitly. If handling large files, set --timeout 300 for extended operations. Configure defaults in a JSON config file, e.g., {"default_lang": "eng"}.

## Common Commands/API
CLI Commands:
- OCR: openclaw pdf-2 ocr --input path/to/file.pdf --lang eng --dpi 300 --output extracted.txt
- Form Extraction: openclaw pdf-2 extract-form --file form.pdf --fields name,address --output data.json
- Table Parsing: openclaw pdf-2 parse-table --input table.pdf --page 2 --output tables.csv
- Signature Verification: openclaw pdf-2 verify-signature --file signed.pdf --cert path/to/cert.pem
- Merge PDFs: openclaw pdf-2 merge --inputs file1.pdf file2.pdf --output merged.pdf
- Split PDF: openclaw pdf-2 split --input original.pdf --pages 1-3 --output split_folder/

API Endpoints:
- OCR: POST /api/pdf-2/ocr with JSON body: {"file": "base64encoded_string", "lang": "eng", "dpi": 300}
- Form Extraction: POST /api/pdf-2/extract-form with body: {"file": "base64encoded", "fields": ["name", "address"]}
- Table Parsing: POST /api/pdf-2/parse-table with body: {"file": "base64encoded", "page": 2}

Code Snippets:
1. Python API call for OCR:
   ```python
   import requests; import os; import base64
   api_key = os.environ['OPENCLAW_API_KEY']
   response = requests.post('https://api.openclaw.ai/api/pdf-2/ocr', headers={'Authorization': f'Bearer {api_key}'}, json={'file': base64.b64encode(open('file.pdf', 'rb').read()).decode()})
   ```
2. CLI in a shell script:
   ```bash
   export OPENCLAW_API_KEY=your_key
   openclaw pdf-2 ocr --input input.pdf --output output.txt
   ```

Config Formats:
Use JSON for API requests or CLI configs, e.g., {"lang": "eng", "timeout": 60}. Save as .json file and pass with --config path/to/config.json.

## Integration Notes
Require authentication via environment variable: set OPENCLAW_API_KEY=your_api_key for API calls. For CLI, ensure OpenClaw CLI is installed (e.g., via npm install openclaw) and authenticated. Integrate with other services by piping outputs, e.g., send OCR results to a NLP tool. Handle file uploads by encoding to base64 in API bodies. For webhooks, use the /api/pdf-2/webhook endpoint with a callback URL in requests.

## Error Handling
Check HTTP status codes for API errors (e.g., 400 for bad input, 401 for unauthorized); parse JSON response for details like {"error": "File not found"}. For CLI, errors output to stderr with codes (e.g., exit code 1 for failures). Handle common issues: use try-except for API timeouts, e.g., in Python: try: requests.post(...) except requests.exceptions.Timeout: print("Timeout occurred"). Validate inputs before commands, e.g., check if file exists with os.path.exists(). Retry transient errors with exponential backoff.

## Concrete Usage Examples
1. Extracting and parsing tables from a scanned invoice PDF:
   - First, perform OCR: openclaw pdf-2 ocr --input invoice_scanned.pdf --lang eng --output ocr_output.txt
   - Then, parse tables: openclaw pdf-2 parse-table --input invoice_scanned.pdf --page 1 --output invoice_tables.csv
   - This produces a CSV for further analysis, e.g., import into a database.

2. Merging PDFs and verifying signatures for a report:
   - Merge files: openclaw pdf-2 merge --inputs report_part1.pdf report_part2.pdf --output final_report.pdf
   - Verify signature: openclaw pdf-2 verify-signature --file final_report.pdf --cert company_cert.pem
   - If valid, proceed; otherwise, handle with error logging.

## Graph Relationships
- Depends on: ocr-1 (provides core OCR functionality)
- Integrates with: document-1 (for general document storage and retrieval)
- Conflicts with: none
- Related to: pdf-1 (basic PDF handling, as this is an advanced version)
- Clusters with: community (shared cluster for collaborative skills)
