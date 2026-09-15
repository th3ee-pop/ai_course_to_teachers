#!/bin/bash
# 逐张调用 codex 生成示意图 SVG（串行，失败记录不中断）
cd "$(dirname "$0")/.." || exit 1
OUT="$PWD/assets/svg"; mkdir -p "$OUT"
for spec in build/codex_specs/*.txt; do
  f=$(basename "$spec" .txt)
  if [ -s "$OUT/$f" ]; then echo "skip $f"; continue; fi
  echo "=== $f $(date +%T)"
  codex exec -m gpt-5.5 -s workspace-write --skip-git-repo-check -C "$OUT" - < "$spec" > "build/codex_specs/$f.log" 2>&1
  if [ -s "$OUT/$f" ]; then echo "ok $f $(wc -c < "$OUT/$f") bytes"; else echo "FAIL $f"; tail -5 "build/codex_specs/$f.log"; fi
done
echo "=== done $(date +%T)"
rm -rf "$OUT/graft" "$OUT/.gitignore" "$OUT/.ignore"
