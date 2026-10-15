#!/bin/bash
# ADE Planner usage report: export from VAMS (prod DB, read only), analyse, render HTML.
# Usage: scripts/ade-report/run.sh   -> scripts/ade-report/out/ade-search-report.html
# Needs this Mac to reach the VAMS database (DigitalOcean trusted sources).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
VAMS="${VAMS_DIR:-$HOME/Documents/koala/VAMS}"
mkdir -p "$HERE/out"
[ -f "$HERE/out/report.json" ] && cp "$HERE/out/report.json" "$HERE/out/report-prev.json"
(cd "$VAMS" && ADE_REPORT_OUT="$HERE/out/ade-all.json" php artisan tinker --execute="require '$HERE/export.php';" 2>&1 | grep -v "PHP Startup")
python3 "$HERE/analyse.py"
python3 "$HERE/gen_report.py"
echo "$HERE/out/ade-search-report.html"
