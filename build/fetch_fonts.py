#!/usr/bin/env python3
"""下载 Google Fonts 的 woff2 分片到 assets/fonts/，生成本地 fonts.css（无外网时也能用同一字体）"""
import re, urllib.request, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'fonts'; OUT.mkdir(parents=True, exist_ok=True)
URL = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;700&display=swap'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
css = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': UA}), timeout=30).read().decode()
n = 0
def repl(m):
    global n
    u = m.group(1); name = re.sub(r'[^A-Za-z0-9._-]', '_', u.split('/')[-1])
    if not name.endswith('.woff2'): name += '.woff2'
    f = OUT / name
    if not f.exists():
        f.write_bytes(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60).read()); n += 1
    return f'url({name})'
css2 = re.sub(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', repl, css)
(OUT / 'fonts.css').write_text('/* 本地字体：由 build/fetch_fonts.py 从 Google Fonts 下载，供无外网现场使用 */\n' + css2, encoding='utf-8')
print('fonts: downloaded', n, 'files; total', sum(f.stat().st_size for f in OUT.glob('*.woff2')) // 1024, 'KB')
