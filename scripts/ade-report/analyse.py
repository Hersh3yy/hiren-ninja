import json, collections as C, re, datetime as D, os
SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SP, 'out')
d = json.load(open(os.path.join(OUT, 'ade-all.json')))
S = d['searches']; names = d['artistNames']; ev = {e['id']: e for e in d['events']}
real = [s for s in S if not s.get('example')]
def pid(u):
    m = re.search(r'(?:playlist|pl\.)[/]?([A-Za-z0-9.-]+)', u or '')
    return m.group(1) if m else (u or '')
up = {}
for s in real:
    if s['kind'] == 'playlist':
        up.setdefault(pid(s.get('playlistUrl')) or s['title'], []).append(s)
uniq = [v[-1] for v in up.values()] + [s for s in real if s['kind'] != 'playlist']
af = C.Counter(); typed = C.Counter()
for s in uniq:
    for a in set(s.get('matchedArtists') or []):
        af[names.get(a, a)] += 1
        if s['kind'] == 'names':
            typed[names.get(a, a)] += 1
aev = {a['name']: a['events'] for a in d['artists']}
er = C.Counter(); evArt = C.defaultdict(set)
for s in uniq:
    seen = set()
    for a in set(s.get('matchedArtists') or []):
        n = names.get(a, a)
        for e in aev.get(n, []):
            if e in ev:
                evArt[e].add(n)
                if e not in seen:
                    seen.add(e); er[e] += 1
g = C.Counter()
for e, n in er.items():
    for gg in ev[e]['genres']:
        g[gg] += n
w = C.Counter()
for s in uniq:
    for n in set(x.strip() for x in (s.get('unmatched') or [])):
        if n and n != '-':
            w[n.lower()] += 1
events = d['events']
out = {
    'generatedAt': D.datetime.now().strftime('%a %d %b %Y, %H:%M'),
    'first': S[0]['at'], 'last': S[-1]['at'], 'total': len(S), 'real': len(real), 'examples': len(S) - len(real),
    'kinds': C.Counter(s['kind'] for s in real), 'sources': C.Counter(s.get('source') for s in real),
    'perDay': sorted(C.Counter(s['at'][:10] for s in real).items()),
    'perHour': [C.Counter(int(s['at'][11:13]) for s in real).get(h, 0) for h in range(24)],
    'uniquePlaylists': len(up), 'tracksScanned': sum(s.get('trackCount', 0) for s in [v[-1] for v in up.values()]),
    'playlists': sorted([{'title': v[-1]['title'], 'source': v[-1].get('source'), 'tracks': v[-1].get('trackCount'), 'total': v[-1].get('totalTracks'), 'artists': v[-1].get('artistCount'), 'matched': v[-1].get('matchedCount', 0), 'runs': len(v)} for v in up.values()], key=lambda x: -x['matched']),
    'topArtists': af.most_common(30), 'topTyped': typed.most_common(15),
    'topEvents': [{'title': ev[e]['title'], 'reach': n, 'startsAt': ev[e]['startsAt'], 'venue': ev[e]['venue'], 'ticketStatus': ev[e]['ticketStatus'], 'artists': sorted(evArt[e])[:6]} for e, n in er.most_common(15)],
    'eventsReached': len(er), 'soldOutReached': sum(1 for e in er if ev[e]['ticketStatus'] == 'sold out'),
    'opened': sorted([{'title': e['title'], 'opens': e['opens'], 'tickets': e['ticketClicks'], 'stars': e['favorites']} for e in events if e['opens'] or e['ticketClicks'] or e['favorites']], key=lambda x: -(x['opens'] + x['tickets'] * 2 + x['stars'] * 3)),
    'totals': {'opens': sum(e['opens'] for e in events), 'tickets': sum(e['ticketClicks'] for e in events), 'stars': sum(e['favorites'] for e in events)},
    'genres': g.most_common(12), 'wanted': w.most_common(24),
    'typedZero': [s.get('query', '').replace('\n', ' / ')[:50] for s in real if s['kind'] == 'names' and not s.get('matchedCount')],
    'daytime': [s.get('query') for s in real if s['kind'] == 'daytime'],
}
out['usage'] = d.get('usage', [])
out['searchesPerDay'] = {day: n for day, n in out['perDay']}
json.dump(out, open(os.path.join(OUT, 'report.json'), 'w'), ensure_ascii=False, indent=1)
print({k: out[k] for k in ['first', 'last', 'real', 'examples', 'uniquePlaylists', 'tracksScanned', 'eventsReached', 'soldOutReached', 'totals']})
print('top artists', out['topArtists'][:8]); print('top events', [(x['title'][:30], x['reach']) for x in out['topEvents'][:5]]); print('wanted', out['wanted'][:8])
