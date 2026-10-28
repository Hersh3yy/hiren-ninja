"""ADE 2026 recap data for hiren.ninja/ade-planner: totals only, nothing personal.

Reads out/report.json and out/ade-all.json (run.sh first) and writes
app/data/ade-2026-recap.json. No typed searches, no playlist titles, no search
times finer than the hour: artist names, event titles, counts.
"""
import json, os, re, collections as C

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
r = json.load(open(os.path.join(OUT, 'report.json')))
d = json.load(open(os.path.join(OUT, 'ade-all.json')))

# How many separate searches found each artist (a playlist searched twice counts once).
names = d['artistNames']
real = [s for s in d['searches'] if not s.get('example') and s.get('kind') in ('playlist', 'names')]
def pid(u):
    m = re.search(r'(?:playlist|pl\.)[/]?([A-Za-z0-9.-]+)', u or '')
    return m.group(1) if m else (u or '')
seen, unique = set(), []
for s in reversed(real):
    key = pid(s.get('playlistUrl')) if s['kind'] == 'playlist' else id(s)
    if key in seen:
        continue
    seen.add(key)
    unique.append(s)
found = C.Counter()
for s in unique:
    for a in set(s.get('matchedArtists') or []):
        found[names.get(a, a)] += 1

# The spelling people used most for an act that isn't on the lineup.
spellings = C.defaultdict(C.Counter)
for s in d['searches']:
    for n in s.get('unmatched') or []:
        spellings[n.strip().lower()][n.strip()] += 1
wanted = [[spellings[n].most_common(1)[0][0] if spellings[n] else n, c] for n, c in r['wanted'][:40]]

# Feature use per day, from the per-day counters (from Tue 13 Oct).
GROUPS = [
    ('opened', 'Events opened', ('ade-event-details',)),
    ('tickets', 'Ticket clicks', ('ade-ticket-click',)),
    ('stars', 'Saved to a plan', ('ade-favorite:add',)),
    ('ask', 'Ask', ('ade-ask-search',)),
    ('schedule', 'Schedule', ('ade-schedule-search',)),
    ('budget', 'On a budget', ('ade-budget-open', 'ade-free-open')),
    ('left', "What's left", ('ade-left-open',)),
    ('map', 'Map', ('ade-map-open', 'ade-near-me')),
    ('landings', 'From search engines', ('ade-landing',)),
    ('qr', 'QR stickers', ('ade-qr-scan',)),
    ('share', 'Calendar, story, link', ('ade-calendar', 'ade-story-image', 'ade-share-plan-link')),
]
usage = []
for u in r.get('usage', []):
    c = u['counters']
    usage.append({'day': u['day'], **{key: sum(v for k, v in c.items() if k.startswith(prefixes)) for key, _, prefixes in GROUPS}})

recap = {
    'generatedAt': r['generatedAt'],
    'first': r['first'][:10],
    'last': r['last'][:10],
    'searches': r['real'],
    'playlists': r['uniquePlaylists'],
    'tracks': r['tracksScanned'],
    'eventsReached': r['eventsReached'],
    'artistsFound': len(found),
    'kinds': {k: r['kinds'].get(k, 0) for k in ('playlist', 'names', 'ask', 'daytime')},
    'sources': {k: r['sources'].get(k, 0) for k in ('spotify', 'apple-music', 'youtube-music', 'tidal', 'deezer')},
    'totals': r['totals'],
    'perDay': r['perDay'],
    'perHour': r['perHour'],
    'topArtists': found.most_common(25),
    'topTyped': r['topTyped'][:12],
    'wanted': wanted,
    'genres': r['genres'][:12],
    'topEvents': [{k: e[k] for k in ('title', 'reach', 'startsAt', 'venue')} for e in r['topEvents'][:12]],
    'mostOpened': r['opened'][:10],
    'usageGroups': [[key, label] for key, label, _ in GROUPS],
    'usage': usage,
    # Lookup for "was my artist searched?": every artist at least one search found.
    'artistLookup': dict(found.most_common()),
}
path = os.path.join(HERE, '..', '..', 'app', 'data', 'ade-2026-recap.json')
os.makedirs(os.path.dirname(path), exist_ok=True)
json.dump(recap, open(path, 'w'), ensure_ascii=False, separators=(',', ':'))
print(f"{path}: {os.path.getsize(path) // 1024} KB, {len(found)} artists, {recap['searches']} searches")
