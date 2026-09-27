# ADE Radar: Nuxt 4 plan

## Context
Goal: user gives their music (Spotify, Apple Music, or a plain list of artist names). App shows which of those artists play Amsterdam Dance Event 2026 (21-25 Oct), plus artists they would probably like. Step 1 is this plan. Step 2 is the base Nuxt 4 scaffold. Features come after we refine the plan together.

## Facts that shape the design (researched 2026-09-27)
- ADE has an undocumented JSON API: `/api/program/filter/?section=persons|events&type=8262,8263&from=2026-10-21&to=2026-10-25&page=N`. 40 rows per page. Currently 3,355 artists (84 pages) and ~1,100 events (28 pages). Cloudflare cached 1h. robots.txt allows `/api/`. No search param. Response is JSON sent as `text/html`, so parse it explicitly.
- Artist detail pages have a Spotify link for only ~33% of artists and never an Apple Music link. Matching is mostly by name. Spotify ID confirms a match when present.
- Event pages: no JSON-LD. Lineup links are incomplete, some lineups exist only in the title. Use the API `soldOut` field. Each event has an `.ics` link and an external ticket link.
- Data quirks: zero-width spaces, duplicate artists in different case, aliases, composite acts ("Mr. Belt & Wezol"). Match full name first, split on `&`/`+`/`b2b`/`x` as fallback. Times are Europe/Amsterdam, DST ends 25 Oct.
- Spotify (Feb 2026 rules): app owner needs Premium, max 5 allowlisted users per app, no extended quota for individuals. Works: `/me/top/artists`, `/me/following`, `/me/playlists`, `/me/tracks`. Does not work: reading tracks of any playlist the user does not own or collaborate on, so a pasted public playlist link fails. Redirect URI must be `http://127.0.0.1:3000/...`. Refresh tokens expire after 6 months. `genres` is effectively gone.
- nuxt-auth-utils 0.5.30 has a Spotify provider, returns refresh_token, no auto refresh.
- Apple Music: needs Apple Developer Program ($99/yr) for a developer token. MusicKit JS gives library playlists and heavy rotation. Research on public playlist links got cut off, verify in the spike.
- Versions: nuxt 4.5.2, @nuxt/ui 4.11.2. Nuxt 5 not released.

## Input sources, in build order
1. MVP fallback, always works: paste or upload a list of artist names (one per line, CSV, or copied playlist text). Zero accounts, zero cost.
2. Spotify login: top artists (4 weeks / 6 months / 1 year), followed artists, own playlists picked by name. Limited to 5 allowlisted users.
3. Apple Music login: library playlists by name, heavy rotation. Needs the paid developer account.
4. Optional: Last.fm username (`user.getTopArtists`, free key, no login). Good for people who scrobble.

## Matching and discovery
- Normalize: NFKC, strip zero-width chars, lowercase, strip diacritics and punctuation, `&` to `and`. Exact match first, then fuzzy only for names of 5+ characters, shown as "possible match".
- Confirm with Spotify ID when both sides have one. Different IDs means namesake, drop it.
- Discovery tiers: exact matches, Last.fm `artist.getSimilar` artists on the lineup ("because you like X"), co-billed artists on the same events, ADE genre categories you lean towards.
- Results: day-by-day timeline, venue, time, sold out badge, ticket link, clash warnings, `.ics` export, shortlist.

## Architecture
- Nuxt 4 (`app/` dir), TypeScript, pnpm, Tailwind 4, GSAP for motion (timeline reveal, card transitions), Nuxt UI 4 optional for form primitives.
- Atomic design in `app/components/`: `atoms/` (Badge, Button, Avatar), `molecules/` (ArtistChip, EventCard, SourcePicker), `organisms/` (MatchTimeline, InputPanel, ClashList), `templates/` (ResultsLayout). Pages stay thin.
- Server (Nitro): `server/utils/ade/` (client, parsers, sync), `server/utils/match/` (normalize, matcher), `server/api/ade/*` cached with `defineCachedFunction` (list 6h, artist detail 24h), `server/api/match.post.ts`, `server/routes/auth/spotify.get.ts`.
- ADE fetching: full list pulls are cheap (~112 requests). Artist detail pages fetched only for match candidates, concurrency 3, cached. `pnpm sync:ade` script writes a bundled JSON snapshot as fallback if ADE changes the API.
- No database for MVP. State in URL + localStorage. VAMS (your CMS) stays out until we need user accounts, saved plans, or an admin view; decide in refinement.
- Tests: Vitest for normalize/matcher/parsers with saved ADE HTML/JSON fixtures.

## Costs you can declare
- Spotify Premium (you likely have it): required for the Spotify part.
- Apple Developer Program $99/yr: required for Apple Music. Skip until the MVP works.
- Last.fm: free. Hosting: free tier (Vercel or Cloudflare) is enough.
- No paid tool removes the Spotify 5-user limit.

## Phases
0. Refine this plan together (open questions below).
1. Scaffold inside hiren-ninja on branch `experiment/ade-radar`: page `app/pages/experiments/ade-radar/`, atomic components in `app/components/experiments/ade-radar/`, server routes in `server/api/ade-radar/` (Netlify functions). Keep the site's Tailwind 3 and yarn; add GSAP for this experiment only. Add Vitest. No features yet.
   Main input path: public playlist link (Spotify embed page, Apple Music page), with paste-names as backup and login as an extra.
2. ADE data layer + snapshot script + parser tests.
3. MVP: paste list, matcher, results timeline.
4. Spotify login + sources.
5. Discovery (Last.fm, co-billing, genres), clashes, `.ics`.
6. Apple Music (if paid account), deploy.

## Open questions for refinement
- Personal tool for you + 4 friends, or public site? Public means Spotify login is only a bonus and the paste list is the main path.
- Project name and location (`~/Documents/koala/ade-radar`?).
- Use VAMS at all for v1?
- Visual direction: ADE-style dark neon, or your own brand?

## Verification
- Scaffold: `pnpm dev --host 127.0.0.1` boots, one atom renders, `pnpm test` and `pnpm lint` pass.
- Later phases: fixture tests; paste known names (Adam Beyer, Amelie Lens, Paul Kalkbrenner) and check results in the browser pane; you log into Spotify yourself in the pane (I never enter passwords).
