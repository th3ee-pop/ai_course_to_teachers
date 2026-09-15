#!/bin/bash
cd "$(dirname "$0")"
for f in notes_in/in_*.json; do
  n=$(basename "$f" .json); n=${n#in_}
  if [ -s "notes_out/out_$n.txt" ]; then continue; fi
  ( pi -p --no-session --model kimi-coding/k3 "$(cat notes_brief.txt)
$(cat "$f")" > "notes_out/out_$n.txt" 2> "notes_out/err_$n.txt"; echo "done $n $(date +%T)" >> notes_out/status.log ) &
done
wait
echo ALLDONE >> notes_out/status.log
