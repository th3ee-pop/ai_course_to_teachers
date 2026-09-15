#!/usr/bin/env python3
"""给 codex 生成的 SVG 补 width/height（Chrome 对无尺寸 SVG 的 <img> 默认 300×150），并清理 codex 残留文件。"""
import re, shutil
from pathlib import Path
d = Path(__file__).resolve().parent.parent / 'assets' / 'svg'
for junk in ['graft', '.gitignore', '.ignore']:
    p = d / junk
    if p.is_dir(): shutil.rmtree(p)
    elif p.exists(): p.unlink()
for f in sorted(d.glob('*.svg')):
    s = f.read_text(encoding='utf-8')
    m = re.search(r'<svg\b[^>]*>', s)
    if not m: print(f.name, 'no <svg>'); continue
    tag = m.group(0)
    vb = re.search(r'viewBox="([\d.\s-]+)"', tag)
    if not vb: print(f.name, 'no viewBox'); continue
    w, h = vb.group(1).split()[2:4]
    if re.search(r'\swidth=', tag) and re.search(r'\sheight=', tag): print(f.name, 'ok'); continue
    new = tag[:-1] + f' width="{w}" height="{h}">'
    f.write_text(s.replace(tag, new, 1), encoding='utf-8'); print(f.name, 'sized', w, h)
