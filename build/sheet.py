#!/usr/bin/env python3
"""Capture pages and tile them into contact sheets.

Usage:
  python3 build/sheet.py [ID ...]            # default: every page in build/manifest.json
  python3 build/sheet.py --prefix v3 P001 P002
Outputs: build/qa/<ID>.png (via cdp_shot.mjs --jobs), build/qa/sheets/<prefix>_NN.png (3x3, labelled).
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
QA = ROOT / 'build' / 'qa'; SHEETS = QA / 'sheets'; SHEETS.mkdir(parents=True, exist_ok=True)

args = sys.argv[1:]
prefix = 'all'
if args and args[0] == '--prefix':
    prefix = args[1]; args = args[2:]
ids = args or [m['id'] for m in json.load(open(ROOT / 'build' / 'manifest.json'))]

jobs = [{'url': f'file://{ROOT}/index.html?all#{pid}', 'out': f'build/qa/{pid}.png', 'wait': 900} for pid in ids]
jobfile = QA / f'jobs_{prefix}.json'
jobfile.write_text(json.dumps(jobs, ensure_ascii=False))
subprocess.run(['node', str(ROOT / 'build' / 'cdp_shot.mjs'), '--jobs', str(jobfile)], cwd=ROOT, check=False)

COLS, ROWS, TW, TH, LABEL = 3, 3, 640, 360, 28
try:
    font = ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', 22)
except Exception:
    font = ImageFont.load_default()
for n in range(0, len(ids), COLS * ROWS):
    chunk = ids[n:n + COLS * ROWS]
    sheet = Image.new('RGB', (COLS * TW, ROWS * (TH + LABEL)), 'white')
    d = ImageDraw.Draw(sheet)
    for i, pid in enumerate(chunk):
        x, y = (i % COLS) * TW, (i // COLS) * (TH + LABEL)
        p = QA / f'{pid}.png'
        if p.exists():
            im = Image.open(p).convert('RGB').resize((TW, TH), Image.LANCZOS)
            sheet.paste(im, (x, y + LABEL))
        else:
            d.rectangle([x, y + LABEL, x + TW, y + LABEL + TH], fill='#eee')
        d.text((x + 8, y + 3), pid, fill='black', font=font)
        d.rectangle([x, y, x + TW - 1, y + LABEL + TH - 1], outline='#999')
    out = SHEETS / f'{prefix}_{n // (COLS * ROWS):02d}.png'
    sheet.save(out)
    print('sheet', out, chunk)
