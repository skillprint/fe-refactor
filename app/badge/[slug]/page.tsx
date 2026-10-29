import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchTalent } from '@/lib/models/portal/serverTalents';
import { fetchLibraryGame, libraryGameImage } from '@/lib/models/portal/serverLibraryGame';
import { getBadgeArt } from '@/lib/badgeArt';
import { badgeSharePath, gameSharePath } from '@/lib/share';

interface BadgePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ game?: string }>;
}

async function load({ params, searchParams }: BadgePageProps) {
  const { slug } = await params;
  const { game } = await searchParams;
  const [talent, record] = await Promise.all([
    fetchTalent(decodeURIComponent(slug)),
    // The game comes from the link, so it is only named when the library knows it.
    game ? fetchLibraryGame(decodeURIComponent(game)) : Promise.resolve(null),
  ]);
  return { talent, game: record };
}

export async function generateMetadata(props: BadgePageProps): Promise<Metadata> {
  const { talent, game } = await load(props);
  if (!talent) return { title: 'Badge', robots: { index: false } };

  const title = `${talent.name} badge on Skillprint`;
  const description = game
    ? `Earned playing ${game.name}. ${talent.description}`
    : talent.description;
  const path = badgeSharePath(talent.slug, game?.baseSlug);
  const image = { url: `/api/og/badge/?slug=${encodeURIComponent(talent.slug)}`, width: 1200, height: 630, alt: title };

  return {
    title: `${talent.name} badge`,
    description,
    alternates: { canonical: path },
    openGraph: { siteName: 'Skillprint', type: 'website', title, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

/**
 * A shared badge (`/badge/<talent>/?game=<game>`). Public: whoever opens a
 * shared link sees the badge, what it marks, and the game that earns it. It
 * names no player; the post that carried the link says who earned it.
 */
export default async function BadgePage(props: BadgePageProps) {
  const { talent, game } = await load(props);
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
