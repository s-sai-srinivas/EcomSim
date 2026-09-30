#!/bin/bash
# Polite crawl of amazon.in bestsellers (2 pages/dept) with hard timeouts.
set -u
OUT=$(pwd)/data/raw/bestsellers
mkdir -p "$OUT"
EXTRACT=scripts/crawl/extract.js

crawl_page() {
  local slug="$1" pg="$2"
  local f="$OUT/${slug}-p${pg}.json"
  [ -s "$f" ] && { echo "skip ${slug}-p${pg}"; return 0; }
  timeout 45 agent-browser open "https://www.amazon.in/gp/bestsellers/${slug}?pg=${pg}" > /dev/null 2>&1 || true
  timeout 30 agent-browser wait --load networkidle > /dev/null 2>&1 || true
  sleep 1
  local payload
  payload=$(timeout 20 agent-browser eval "$(cat "$EXTRACT")" 2>/dev/null | grep -oE '^.*$' | head -1)
  if [ -z "$payload" ]; then echo "EMPTY ${slug}-p${pg}"; return 1; fi
  printf '%s' "$payload" > "$f.raw"
  python3 - "$f" <<'PYEOF'
import json, sys
raw = open(sys.argv[1] + '.raw').read().strip()
try:
    data = json.loads(json.loads(raw)) if raw.startswith('"') else json.loads(raw)
except Exception as e:
    print("PARSE FAIL", sys.argv[1], e); sys.exit(1)
if data.get("captcha"):
    print("CAPTCHA on", sys.argv[1]); sys.exit(42)
with open(sys.argv[1], "w") as fh:
    json.dump(data, fh)
print(f"ok {sys.argv[1].split('/')[-1]}: {len(data.get('cards', []))} cards")
PYEOF
  local rc=$?
  rm -f "$f.raw"
  return $rc
}

while IFS= read -r slug; do
  for pg in 1 2; do
    crawl_page "$slug" "$pg"
    rc=$?
    [ $rc -eq 42 ] && echo "BLOCKED - aborting" && exit 42
    sleep 2
  done
done < /tmp/opencode/depts.txt
echo "CRAWL COMPLETE $(ls "$OUT"/*.json 2>/dev/null | wc -l) files"
