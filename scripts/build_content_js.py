"""Mirrors data/content.json into data/content.js as `window.SITE_CONTENT = {...};`.

Why this exists: opening index.html directly via file:// (double-click, no server)
makes fetch('content.json') fail with a CORS error in Chrome/Edge/Safari — there is
no server to grant it. A <script src="content.js"> tag has no such restriction, so the
site loads the data by executing this file instead of fetching JSON.

content.json stays the single file a human (or an AI assistant) should hand-edit.
Re-run this script after any edit to content.json so content.js mirrors it exactly:

    python3 scripts/build_content_js.py
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "content.json")
DEST = os.path.join(ROOT, "data", "content.js")

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

with open(DEST, "w", encoding="utf-8") as f:
    f.write("// AUTO-GENERATED from content.json — do not hand-edit. Run scripts/build_content_js.py after editing content.json.\n")
    f.write("window.SITE_CONTENT = ")
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write(";\n")

print(f"wrote {DEST} ({os.path.getsize(DEST)} bytes)")
