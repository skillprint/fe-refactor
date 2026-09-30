'use client';

/**
 * The playbook builder (SKI-225).
 *
 * Shared by `/coach/playbooks/new` and `/coach/playbooks/[id]`, because
 * creating and editing differ only in whether there is an id to PATCH.
 *
 * Reordering is buttons, not drag-and-drop. The ticket says "drag-to-reorder",
 * and that is the nicer gesture — but it is also the one that is unusable by
 * keyboard and touch unless done properly, and a coach on a phone between
 * matches is a real user here. Up/down controls work everywhere, are
 * announceable, and leave the drag affordance as an addition rather than a
 * prerequisite. Flagged in SKI-225 rather than silently substituted.
 */
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCoachCatalogue, useCoachWrites, type CoachPlaybook } from '@/lib/models/coach';
import { ErrorState, Loading, Panel } from './ui';
import { FormError } from './AuthForm';

export function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function PlaybookBuilder({ playbook }: { playbook?: CoachPlaybook }) {
  const router = useRouter();
  const catalogue = useCoachCatalogue();
  const { createPlaybook, updatePlaybook } = useCoachWrites();

  const [title, setTitle] = useState(playbook?.title ?? '');
  const [description, setDescription] = useState(playbook?.description ?? '');
  const [slugs, setSlugs] = useState<string[]>(playbook?.games.map((g) => g.slug) ?? []);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const games = catalogue.data?.games ?? [];
  const bySlug = useMemo(() => new Map(games.map((g) => [g.slug, g])), [games]);

  // Searchable by name, skill and mood — a coach thinks "something for
  // attention" more often than they think of a game's title.
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return games.filter((game) => {
      if (slugs.includes(game.slug)) return false;
      if (!needle) return true;
      return (
        game.name.toLowerCase().includes(needle) ||
        game.skills.some((s) => s.includes(needle)) ||
        game.moods.some((m) => m.includes(needle))
      );
    });
  }, [games, query, slugs]);

  const totalSeconds = slugs.reduce(
    (total, slug) => total + (bySlug.get(slug)?.suggestedDurationSeconds ?? 0),
    0,
  );

  const move = (index: number, delta: number) => {
    const next = [...slugs];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlugs(next);
  };

  async function save(status: 'draft' | 'published') {
    setBusy(true);
    setError(null);
    try {
      const input = { title, description, games: slugs, status };
      const saved = playbook
        ? await updatePlaybook(playbook.id, input)
        : await createPlaybook(input);
      router.push(`/coach/playbooks/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save.');
      setBusy(false);
    }
  }

  return (
    <>
      <Panel title="Details">
        <div className="coach-field">
          <label htmlFor="pb-title">Title</label>
          <input id="pb-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="coach-field">
          <label htmlFor="pb-desc">What it&rsquo;s for</label>
          <textarea
            id="pb-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Panel>

      <Panel
        title="Sequence"
        note={`${slugs.length} ${slugs.length === 1 ? 'game' : 'games'} · about ${formatDuration(totalSeconds)}`}
      >
        {slugs.length === 0 ? (
          <p className="coach-meta">Nothing added yet — pick from the catalogue below.</p>
        ) : (
          <ol className="coach-sequence">
            {slugs.map((slug, index) => {
              const game = bySlug.get(slug);
              return (
                <li key={slug} className="coach-sequence__item">
                  <span className="coach-sequence__pos">{index + 1}</span>
                  <span className="coach-sequence__name">
                    {game?.name ?? slug}
                    <span className="coach-meta">
                      {' '}
                      · {formatDuration(game?.suggestedDurationSeconds ?? 0)}
                    </span>
                  </span>
                  <span className="coach-sequence__controls">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${game?.name ?? slug} earlier`}>↑</button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === slugs.length - 1} aria-label={`Move ${game?.name ?? slug} later`}>↓</button>
                    <button type="button" onClick={() => setSlugs(slugs.filter((s) => s !== slug))} aria-label={`Remove ${game?.name ?? slug}`}>✕</button>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>

      <Panel title="Catalogue" note="Search by game, skill or mood.">
        <div className="coach-field">
          <label htmlFor="pb-search" className="sr-only">Search games</label>
          <input
            id="pb-search"
            placeholder="attention, relax, Hextris…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {catalogue.isLoading && !catalogue.data && <Loading rows={3} />}
        {catalogue.error && <ErrorState error={catalogue.error} onRetry={catalogue.refetch} />}

        {catalogue.data && results.length === 0 && (
          <p className="coach-meta">Nothing matches — or everything matching is already added.</p>
        )}

        <ul className="coach-picker">
          {results.map((game) => (
            <li key={game.slug}>
              <button type="button" onClick={() => setSlugs([...slugs, game.slug])}>
                <span className="coach-picker__name">{game.name}</span>
                <span className="coach-meta">
                  {formatDuration(game.suggestedDurationSeconds ?? 0)}
                  {game.skills.length > 0 && ` · ${game.skills.join(', ').replace(/-/g, ' ')}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      {error && <FormError message={error} />}

      <div className="coach-actions">
        <button type="button" className="coach-submit coach-submit--ghost" disabled={busy} onClick={() => save('draft')}>
          Save draft
        </button>
        <button type="button" className="coach-submit" disabled={busy} onClick={() => save('published')}>
          {busy ? 'Saving…' : 'Publish'}
        </button>
      </div>
      <p className="coach-meta" style={{ textAlign: 'center' }}>
        A draft cannot be assigned. Publish when the sequence is ready.
      </p>
    </>
  );
}
