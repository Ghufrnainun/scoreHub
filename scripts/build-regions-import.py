#!/usr/bin/env python3
"""Build Convex JSONL from pinned cahyadsn datasets. Stdlib only."""
import json, re, ssl, urllib.request
from pathlib import Path

REGION_SHA = "8e30c590e2346289c0f316677d14c2b787d7b14d"
POSTAL_SHA = "ba8497156c5cc9bcbfc527f7b8875d403eda2354"
REGION_URL = f"https://raw.githubusercontent.com/cahyadsn/wilayah/{REGION_SHA}/db/wilayah.sql"
POSTAL_URL = f"https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/{POSTAL_SHA}/json/wilayah_kodepos.min.json"
OUT = Path(__file__).resolve().parent / "generated" / "regions.jsonl"

def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as response: return response.read()
    except Exception:
        ctx = ssl._create_unverified_context()
        with urllib.request.urlopen(url, timeout=60, context=ctx) as response: return response.read()

def main():
    raw = json.loads(fetch(POSTAL_URL))
    postal = {str(k): str(v) for k, v in raw.items()} if isinstance(raw, dict) else {}
    rows = re.findall(r"\('([0-9.]+)',\s*'(.*?)'\)", fetch(REGION_URL).decode())
    if len(rows) != 91_599: raise SystemExit(f"Expected 91,599 regions, got {len(rows)}; upstream format changed")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open('w', encoding='utf-8') as output:
        for code, name in rows:
            parts = code.split('.')
            doc = {'code': code, 'level': ('province','regency','district','village')[len(parts)-1], 'name': name.replace("\\'", "'"), 'sourceVersion': 'Kepmendagri 300.2.2-2430/2025'}
            if len(parts) > 1: doc['parentCode'] = '.'.join(parts[:-1])
            if code in postal: doc['postalCode'] = postal[code]
            output.write(json.dumps(doc, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(f"Wrote {len(rows):,} regions to {OUT}")

if __name__ == '__main__': main()