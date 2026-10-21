---
name: ade-planner-daily-usage
description: Every 3 hours (09:30–21:30) until 26 Oct 2026: rebuild the ADE Planner usage report from VAMS and republish the artifact
---

ADE Planner usage report for Hiren (hiren.ninja/ade-planner, ADE runs 21-25 Oct 2026). Runs every 3 hours.

1. If today's date is after 2026-10-26, do nothing except say "ADE is over: disable the ade-planner-daily-usage scheduled task" and stop.
2. Run: `~/Documents/koala/hiren-ninja/scripts/ade-report/run.sh`. It reads the VAMS production database read-only (via `php artisan tinker` in ~/Documents/koala/VAMS) and writes `~/Documents/koala/hiren-ninja/scripts/ade-report/out/ade-search-report.html`. Do not write to the database or change any code.
   - If it fails with a database connection timeout, this Mac's network is probably not on DigitalOcean's trusted sources (it happens on other Wi-Fi). Retry once after 2 minutes; if it still fails, stop and report that in one line.
3. Publish that HTML file with the Artifact tool to the existing artifact URL https://claude.ai/artifact/2fQHCSNtZpFDKjpXDMu8PW (pass it as `url`, action publish, label "<weekday> <HH:MM>"). Read the artifact first if the tool requires it.
4. Reply with a short summary in terse style (Hiren likes caveman-style brevity): today's row so far from the report's "Every day" table (searches, events opened, ticket clicks, stars, On a budget, daytime tab), QR scans today (feature counter ade-qr-scan:* in the "Every feature counter" list, if any), landing-page visits (ade-landing:*), the "Since the last report" line, and one notable thing (a new top artist, a jump or drop, a new playlist). Link the artifact. No other commentary.