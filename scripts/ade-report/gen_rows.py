import html
e = html.escape
SRC = {'spotify': 'Spotify', 'apple-music': 'Apple Music', 'youtube-music': 'YouTube Music', 'tidal': 'Tidal', 'deezer': 'Deezer'}

def playlist_row(p):
    runs = ' <span class="tag">×%d</span>' % p['runs'] if p['runs'] > 1 else ''
    more = '+' if (p.get('total') or 0) > (p['tracks'] or 0) else ''
    width = min(100, p['fit'] * 2.5)
    return ('<tr><td class="t">%s%s</td><td>%s</td><td class="n">%s%s</td><td class="n">%s</td>'
            '<td class="n strong">%d</td><td class="fitcell"><span class="fit"><span style="width:%.0f%%"></span></span>'
            '<span class="n">%d%%</span></td></tr>') % (
        e(p['title']), runs, SRC.get(p['source'], p['source'] or ''), format(p['tracks'] or 0, ','), more,
        format(p['artists'] or 0, ','), p['matched'], width, p['fit'])

def ticket_pill(status):
    if status == 'sold out':
        return '<span class="pill sold">Sold out</span>'
    if status == 'available':
        return '<span class="pill ok">Tickets</span>'
    return '<span class="pill">Check</span>'

def event_row(x, when):
    return ('<tr><td class="n strong">%d</td><td class="t">%s<div class="sub">%s</div></td>'
            '<td class="nowrap">%s</td><td>%s</td><td>%s</td></tr>') % (
        x['reach'], e(x['title']), e(', '.join(x['artists'][:5])), when(x['startsAt']), e(x['venue'] or ''), ticket_pill(x['ticketStatus']))
