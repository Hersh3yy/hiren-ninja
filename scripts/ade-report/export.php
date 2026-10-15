<?php
// Run from VAMS: php artisan tinker --execute="require '<this file>';"
// Writes everything the ADE Planner usage report needs to $ADE_REPORT_OUT (JSON):
// the anonymous search log, counted artists and events, and per-day feature counts.
$ty = fn ($s) => App\Models\EntryType::where('slug', $s)->value('id');
$artists = App\Models\Entry::where('entry_type_id', $ty('ade-artist'))->get()->keyBy('id');
$events = App\Models\Entry::where('entry_type_id', $ty('ade-event'))->where('status', 'published')->get()->keyBy('id');
$searches = App\Models\Entry::where('entry_type_id', $ty('ade-search'))->orderBy('created_at')->get()
    ->map(fn ($s) => ['at' => $s->created_at->setTimezone('Europe/Amsterdam')->format('Y-m-d H:i'), 'title' => $s->title] + $s->content);
$usage = App\Models\Entry::where('entry_type_id', $ty('ade-usage'))->orderBy('title')->get()
    ->map(fn ($u) => ['day' => $u->title, 'counters' => $u->content['counters'] ?? []])->values();
$a = $artists->filter(fn ($x) => ($x->content['hits'] ?? 0) > 0)
    ->map(fn ($x) => ['name' => $x->title, 'hits' => $x->content['hits'] ?? 0, 'searches' => $x->content['searches'] ?? 0, 'events' => $x->content['events'] ?? []])->values();
$ev = $events->map(fn ($e) => [
    'id' => $e->id, 'title' => $e->title, 'startsAt' => $e->content['startsAt'] ?? null, 'venue' => $e->content['venue'] ?? null,
    'ticketStatus' => $e->content['ticketStatus'] ?? null, 'genres' => $e->content['genres'] ?? [], 'isParty' => $e->content['isParty'] ?? null,
    'favorites' => $e->content['favorites'] ?? 0, 'opens' => $e->content['opens'] ?? 0, 'ticketClicks' => $e->content['ticketClicks'] ?? 0,
    'program' => $e->content['program'] ?? null, 'topics' => $e->content['topics'] ?? [],
])->values();
file_put_contents(getenv('ADE_REPORT_OUT'), json_encode([
    'searches' => $searches, 'artists' => $a, 'artistNames' => $artists->map(fn ($x) => $x->title), 'events' => $ev, 'usage' => $usage,
], JSON_UNESCAPED_UNICODE));
echo 'searches '.$searches->count().', usage days '.$usage->count()."\n";
