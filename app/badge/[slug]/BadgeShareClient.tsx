'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import { fetchTalent, type Talent } from '@/lib/models/portal/serverTalents';
import { fetchLibraryGame, libraryGameImage } from '@/lib/models/portal/serverLibraryGame';
import type { LibraryGameDetail } from '@/lib/models/portal/LibraryGameDetail';
import { getBadgeArt } from '@/lib/badgeArt';
import { gameSharePath } from '@/lib/share';
import { useRouteParams } from '@/lib/useRouteParams';

type Loaded = { key: string; talent: Talent | null; game: LibraryGameDetail | null };

/**
 * A shared badge (`/badge/<talent>/?game=<game>`). Public: whoever opens a
 * shared link sees the badge, what it marks, and the game that earns it. It
 * names no player; the post that carried the link says who earned it.
 *
 * Both reads are public for the portal's origin, so they run in the browser
 * for a visitor who is not signed in.
 */
export default function BadgeShareClient() {
  const { slug } = useRouteParams('/badge/[slug]');
  const gameParam = useSearchParams().get('game');
  const key = `${slug}?${gameParam ?? ''}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchTalent(decodeURIComponent(slug)),
      // The game comes from the link, so it is only named when the library knows it.
      gameParam ? fetchLibraryGame(decodeURIComponent(gameParam)) : Promise.resolve(null),
    ]).then(([talent, game]) => {
      if (!cancelled) setLoaded({ key, talent, game });
    });
    return () => {
      cancelled = true;
    };
  }, [key, slug, gameParam]);

  if (!loaded || loaded.key !== key) return <main className="badge-share layout-grid place-center" aria-busy="true" />;
  const { talent, game } = loaded;
  if (!talent) notFound();

  const art = getBadgeArt(talent);
  const gameArt = game ? libraryGameImage(game) : null;

  return (
    <main className="badge-share layout-grid place-center">
      <article className="badge-share__card sp-card layout-grid gap-xl" aria-labelledby="badgeShareTitle">
        <Link className="badge-share__brand layout-inline-flex items-center gap-md" href="/">
          <img src="/assets/logos/skillprint-favicon-customer.svg" alt="" width="28" height="28" />
          <span className="ui-label">Skillprint badge</span>
        </Link>

        <figure className="sp-badge sp-badge--xl margin-none" data-badge={talent.slug} data-earned="true">
          {art ? (
            <img className="sp-badge__art layout-block" src={art} alt={`${talent.name} badge art: the ${talent.animalName}`} width="610" height="610" />
          ) : (
            <span className="sp-badge__art layout-grid place-center sp-icon-frame sp-icon-frame--lg" aria-hidden="true">
              <svg className="sp-icon sp-icon--lg" viewBox="0 0 24 24"><use href="#ti-trophy"></use></svg>
            </span>
          )}
          <figcaption className="sp-badge__copy layout-grid min-width-0">
            <h1 className="sp-badge__name margin-none" id="badgeShareTitle">{talent.name}</h1>
            {talent.animalName && <span className="sp-badge__animal">{talent.animalName}</span>}
            {talent.category && <span className="ui-badge ui-badge--pill">{talent.category}</span>}
          </figcaption>
        </figure>

        {talent.description && <p className="badge-share__lede margin-none">{talent.description}</p>}
        {talent.animalFunFact && <p className="badge-share__fact margin-none text-muted">{talent.animalFunFact}</p>}

        {game && (
          <div className="badge-share__game layout-flex items-center gap-lg">
            {gameArt && <img className="badge-share__game-art" src={gameArt} alt="" width="56" height="56" />}
            <div className="min-width-0">
              <span className="ui-label text-muted">Earned playing</span>
              <strong className="layout-block">{game.name}</strong>
            </div>
          </div>
        )}

        <div className="badge-share__actions layout-flex wrap gap-md">
          {game ? (
            <Link className="button button--primary button--md" href={gameSharePath(game.baseSlug)}>
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
              Play {game.name}
            </Link>
          ) : (
            <Link className="button button--primary button--md" href="/games">
              <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
              Play a game
            </Link>
          )}
          <Link className="button button--secondary button--md" href="/">Explore Skillprint</Link>
        </div>
        <p className="badge-share__note margin-none text-muted">
          Badges unlock when a few minutes of play show real mastery of a skill. Play and earn your own.
        </p>
      </article>
    </main>
  );
}
