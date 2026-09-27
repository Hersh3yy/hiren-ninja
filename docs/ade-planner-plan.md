# ADE Planner plan

## Context
Give ADE Planner your music and it tells you which of those artists play Amsterdam Dance Event 2026 (21-25 Oct), when and where. It lives in hiren.ninja as its own page at `/ade-planner` (a project, not an experiment). The ADE program is copied into VAMS once and refreshed now and then, so the site never calls ADE at request time.

Target for tonight: phase 1 and 2 running locally. You paste artist names or a public playlist link and get their ADE events back.

## Facts that shape the design (checked 2026-09-27)
- ADE program comes from an undocumented JSON API: `/api/program/filter/?section=persons|events&type=8262,8263&from=2026-10-21&to=2026-10-25&page=N`, 40 rows per page. Right now 3,355 artists (84 pages) and about 1,100 events (28 pages). The body is JSON with a `text/html` content type. robots.txt allows `/api/`.
- The events list has no lineup. Each artist page lists all of that artist's 2026 events (100% in a 12-page sample), so artist pages are the source for "which events does this artist play". Artist pages also carry a Spotify ID for about a third of artists.
- Public playlists need no login and no API key:
  - Spotify: `open.spotify.com/embed/playlist/{id}` has a `__NEXT_DATA__` JSON block with the track list and artist names. The official API refuses public playlists you don't own (Feb 2026 rule), so the embed page is the only no-login route. Tested: 50 of 50 tracks.
  - Apple Music: yes, public playlists exist (editorial ones and user playlists shared as `pl.u-...` links). The `music.apple.com` page has a `serialized-server-data` JSON block with `artistName` per track. Tested: 50 of 50 tracks. No Apple Developer account needed.
  - Both pages probably cap at the first ~100 tracks. Verify with a big playlist.
  - Both routes read the public web page, not an official API, which is against each service's terms. Fine for a personal experiment, and it can break when they change the page.
- VAMS host: `https://app.use-vams.me/api` (DigitalOcean App Platform). The ADE data is synced into that database. Without `VAMS_API_URL` set, hiren.ninja reads the bundled snapshot.
- VAMS: its API is read-only (`GET /api/entries/by-type/{slug}` with `X-API-Key`, 60 requests/min). It returns every entry of a type in one response with no pagination and no filter. Writes only go through the web UI, so hydration is an artisan command inside VAMS. The local `vams-api` container points at the production database.

## Copyright and legal (my read, not legal advice)
- Lineup facts (who plays where and when) are not copyrightable.
- The EU database right (Dutch Databankenwet) protects a database built with substantial investment against copying and re-publishing a substantial part. ADE's program probably qualifies. A private copy used to answer "which of my artists play" is low risk. Offering the full program for browsing or download on a public site is the part to avoid.
- Artist photos and bios are copyrighted by photographers and artists. Don't copy them into VAMS. Store names, IDs, times, venues and links, and link back to the ADE page for each event.
- Scraping Spotify and Apple Music pages breaks their terms (see above). It's a contract issue, not copyright. Keep it low volume, add caching, and don't rely on it for anything commercial.

## Data model in VAMS
Two new entry types owned by `info@hiren.ninja`:
- `ade-artist`: `externalId` (ADE id), `name`, `normalizedName`, `country`, `spotifyId`, `adeUrl`, `eventIds` (json array of ADE event ids).
- `ade-event`: `externalId`, `title`, `startsAt`, `endsAt` (ISO with timezone), `venue`, `categories`, `soldOut`, `adeUrl`.

`getEventsForArtist(name)`: normalize the name, find the `ade-artist` entry, map its `eventIds` onto `ade-event` entries, sort by start time.

## Build order
1. **VAMS hydration** (branch `coolify-integration`, runs in the local container against prod):
   - Seeder `AdePlannerSeeder` creates the two entry types and grants them to `info@hiren.ninja`. It's idempotent.
   - Command `php artisan ade:sync`:
     1. Pull all artist and event list pages (~112 requests).
     2. Fetch each artist page for `eventIds` and `spotifyId` (3,355 requests, 3 at a time, about 20-25 minutes).
     3. Upsert by `externalId`.
   - Options: `--only=events` for a quick refresh of times and sold-out status, `--limit` for testing.
   - Re-run whenever you want fresh data. Scheduling it comes later.
2. **hiren-ninja data layer**:
   - `server/utils/vams.ts` fetches `by-type` with a private `runtimeConfig.vamsApiKey`, cached 1 hour.
   - `server/utils/ade-planner/normalize.ts` and `match.ts`.
   - `server/api/ade-planner/events.get.ts?artist=` returns `getEventsForArtist`.
   - `server/api/ade-planner/match.post.ts` takes `{ artists: string[] }` and returns matches with their events.
3. **Inputs**:
   - A paste box: names one per line, or copied playlist text.
   - A public playlist link: `server/api/ade-planner/playlist.get.ts?url=` detects Spotify or Apple, reads the page and returns the artist names.
4. **UI** (atomic, reusing the site's atoms and molecules, colour tokens and the existing `motion-v`, no new animation library for now):
   - `organisms/AdePlannerInput`
   - `organisms/AdePlannerResults`, grouped by day
   - `molecules/AdeEventCard`: time, venue, sold-out badge, link to ADE
5. Next iteration, not tonight: Spotify login for top and followed artists (you have Premium, 5-user limit), clash warnings, `.ics` export, Last.fm similar artists, a scheduled refresh. Apple Music login only if a colleague's developer account turns up.

## House rules
- Stick to hiren.ninja's atomic design (`app/components/README.md`): the slot rule, colour tokens, no raw palette colours. Boyscout rule: clean up code smells we touch.
- One working branch (`experiment/ade-planner`), merged to `main` when it builds and runs.
- No LLM calls in the app for v1.

## Verification
- VAMS: `ade:sync --limit=20` first, check the entries in the VAMS UI, then the full run. Check counts against ADE (artists and events).
- hiren-ninja:
  - `curl /api/ade-planner/events?artist=Adam%20Beyer` returns his events.
  - Paste "Adam Beyer, Amelie Lens, Paul Kalkbrenner" in the browser pane.
  - Paste a public Spotify link and an Apple Music link.
  - `npm run build` stays green.
