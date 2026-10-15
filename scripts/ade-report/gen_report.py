import json, html, datetime as D, os, sys, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_rows import playlist_row, event_row, SRC

SP = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SP, 'out')
r = json.load(open(os.path.join(OUT, 'report.json')))
prev_path = os.path.join(OUT, 'report-prev.json')
prev = json.load(open(prev_path)) if os.path.exists(prev_path) else None
e = html.escape


def day(s):
    return D.datetime.strptime(s, '%Y-%m-%d').strftime('%a %-d')


def when(s):
    return D.datetime.fromisoformat(s).strftime('%a %-d Oct, %H:%M')


def pct(v, m):
    return '%.1f%%' % (100 * v / m)


k, src = r['kinds'], r['sources']
maxday = max(n for _, n in r['perDay'])
maxhour = max(r['perHour'])
pl = r['playlists']
for p in pl:
    p['fit'] = round(100 * p['matched'] / max(1, p['artists'] or 1))
sized = [p for p in pl if (p['artists'] or 0) >= 25]
best = max(sized, key=lambda p: p['fit'])
worst = min(sized, key=lambda p: p['fit'])
most = pl[0]
# A different playlist from the 'most on ADE' callout, so the four callouts show four playlists.
biggest = max([p for p in pl if p is not most], key=lambda p: p['tracks'] or 0)
ta = r['topArtists'][:20]
maxa = ta[0][1]
g = r['genres'][:10]
maxg = g[0][1]

# The wanted list is counted case-insensitively; show the spelling people used most.
spellings = collections.defaultdict(collections.Counter)
for s in json.load(open(os.path.join(OUT, 'ade-all.json')))['searches']:
    for n in s.get('unmatched') or []:
        spellings[n.strip().lower()][n.strip()] += 1


def display_name(n):
    return spellings[n].most_common(1)[0][0] if spellings[n] else n


total = r['real']
tot = r['totals']
steps = [('Real searches', total), ('Opened event details', tot['opens']), ('Clicked tickets, resale or ADE page', tot['tickets']), ('Saved to a plan (stars)', tot['stars'])]
funnel = ''.join('<div><span>%s</span><span class="track"><span style="width:%.0f%%"></span></span><span class="n">%d</span></div>' % (label, max(2, 100 * n / total), n) for label, n in steps)
# Compared with the previous run of this report (run.sh keeps it), else with Sun 11 Oct.
if prev:
    PREV = {**{k: prev[k] for k in ['real', 'uniquePlaylists', 'tracksScanned', 'eventsReached']}, **prev['totals']}
    prev_label = D.datetime.strptime(prev['generatedAt'], '%a %d %b %Y, %H:%M').strftime('%a %-d Oct, %H:%M')
else:
    PREV = {'real': 191, 'uniquePlaylists': 78, 'tracksScanned': 14413, 'eventsReached': 469, 'opens': 103, 'tickets': 52, 'stars': 44}
    prev_label = 'Sun 11 Oct'
since = 'Since the last report (%s): ' % prev_label + ' · '.join('%s <b>%s → %s</b>' % (label, format(PREV[key], ','), format(r[key], ',')) for key, label in [('real', 'searches'), ('uniquePlaylists', 'playlists'), ('tracksScanned', 'tracks'), ('eventsReached', 'events reached')]) \
    + ' · ' + ' · '.join('%s <b>%d → %d</b>' % (label, PREV[key], tot[key]) for key, label in [('opens', 'opens'), ('tickets', 'ticket clicks'), ('stars', 'stars')])

# Every day: searches from the log, the rest from VAMS ade-usage counters (from 13 Oct).
DAILY_COLS = [
    ('Searches', lambda day, c: r['searchesPerDay'].get(day, 0)),
    ('Event opened', lambda day, c: sum(v for k, v in c.items() if k.startswith('ade-event-details'))),
    ('Ticket clicks', lambda day, c: sum(v for k, v in c.items() if k.startswith('ade-ticket-click'))),
    ('Starred', lambda day, c: c.get('ade-favorite:add', 0)),
    ('Daytime tab', lambda day, c: c.get('ade-tab:daytime', 0)),
    ('My plan', lambda day, c: c.get('ade-plan-open', 0)),
    ('On a budget', lambda day, c: c.get('ade-budget-open', 0) + c.get('ade-free-open', 0)),
    ('Near me', lambda day, c: sum(v for k, v in c.items() if k.startswith('ade-near-me'))),
    ('Calendar / story / link', lambda day, c: c.get('ade-calendar', 0) + sum(v for k, v in c.items() if k.startswith(('ade-story-image', 'ade-share-plan-link')))),
]
usage_days = {u['day']: u['counters'] for u in r.get('usage', [])}
all_days = sorted(set(r['searchesPerDay']) | set(usage_days))[-10:]
daily_rows = ''.join('<tr><td class="nowrap">%s</td>%s</tr>' % (
    D.datetime.strptime(day, '%Y-%m-%d').strftime('%a %-d Oct'),
    ''.join('<td class="n">%s</td>' % (fn(day, usage_days.get(day, {})) if (day in usage_days or label == 'Searches') else '–') for label, fn in DAILY_COLS))
    for day in reversed(all_days))
daily_head = ''.join('<th class="n">%s</th>' % e(label) for label, _ in DAILY_COLS)
features = collections.Counter()
for counters in usage_days.values():
    features.update(counters)
feature_list = ''.join('<li><span class="name">%s</span><span class="n">%d</span></li>' % (e(k), v) for k, v in features.most_common(24))
sources = ' · '.join('%s %d' % (SRC[s], src.get(s, 0)) for s in ['spotify', 'apple-music', 'youtube-music', 'tidal', 'deezer'])

values = {
    'CSS': open(os.path.join(SP, 'report.css')).read(),
    'TOTAL': str(total), 'PLAYLISTS': str(r['uniquePlaylists']), 'TRACKS': format(r['tracksScanned'], ','),
    'EVENTS': str(r['eventsReached']), 'SOLDOUT': str(r['soldOutReached']),
    'FIRST': when(r['first'].replace(' ', 'T')), 'LAST': when(r['last'].replace(' ', 'T')), 'GENERATED': r['generatedAt'],
    'SINCE': since, 'SOURCES': sources, 'DAILY_HEAD': daily_head, 'DAILY_ROWS': daily_rows, 'FEATURES': feature_list,
    'PLAYLIST_N': str(k.get('playlist', 0)), 'NAMES_N': str(k.get('names', 0)), 'DAY_N': str(k.get('daytime', 0)), 'DAY_FLEX': str(max(k.get('daytime', 0), 3)),
    'EXAMPLES': str(r['examples']),
    'DAYS': ''.join('<div class="col"><div class="colbar" style="height:%.0f%%"><span>%d</span></div><div class="lab">%s</div></div>' % (100 * n / maxday, n, day(d)) for d, n in r['perDay']),
    'HOURS': ''.join('<div class="h" title="%02d:00, %d searches"><div style="height:%.0f%%"></div></div>' % (h, n, (100 * n / maxhour) if n else 2) for h, n in enumerate(r['perHour'])),
    'ROWS_PL': ''.join(playlist_row(p) for p in pl),
    'ROWS_EV': ''.join(event_row(x, when) for x in r['topEvents'][:12]),
    'MOST_T': e(most['title']), 'MOST_M': str(most['matched']), 'MOST_A': format(most['artists'], ','),
    'BIG_T': e(biggest['title']), 'BIG_N': format(biggest['tracks'], ',') + ('+' if (biggest.get('total') or 0) > (biggest['tracks'] or 0) else ''),
    'BEST_T': e(best['title']), 'BEST_F': str(best['fit']), 'WORST_T': e(worst['title']), 'WORST_F': str(worst['fit']),
    'ARTISTS': ''.join('<li><span class="name">%s</span><span class="track"><span style="width:%s"></span></span><span class="n">%d</span></li>' % (e(n), pct(c, maxa), c) for n, c in ta),
    'TYPED': ''.join('<li><span class="name">%s</span><span class="n">%d</span></li>' % (e(n), c) for n, c in r['topTyped'][:12]),
    'GENRES': ''.join('<li><span class="name">%s</span><span class="track"><span style="width:%s"></span></span></li>' % (e(n), pct(c, maxg)) for n, c in g),
    'WANTED': ''.join('<span class="chip">%s<b>%d</b></span>' % (e(display_name(n)), c) for n, c in r['wanted'][:22]),
    'FUNNEL': funnel, 'STARS_TOTAL': str(tot['stars']),
    'OPENED': ''.join('<li><span class="name">%s</span><span class="n">%d open · %d tickets · %d ★</span></li>' % (e(o['title']), o['opens'], o['tickets'], o['stars']) for o in r['opened'][:12]),
}
out = open(os.path.join(SP, 'report.tpl.html')).read()
for key, val in values.items():
    out = out.replace('{{' + key + '}}', val)
assert '{{' not in out, out[out.index('{{'):out.index('{{') + 40]
open(os.path.join(OUT, 'ade-search-report.html'), 'w').write(out)
print(len(out), '| most', most['title'], '| biggest', biggest['title'], '| best', best['title'], best['fit'], '| worst', worst['title'], worst['fit'])
