import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PILLAR_COLOURS, PILLAR_LABELS, encodeSnapshot, parseSnapshot, snapshotSharePath } from '@/lib/skillprintSnapshot';

interface SnapshotPageProps {
  searchParams: Promise<{ s?: string }>;
}

async function load({ searchParams }: SnapshotPageProps) {
  const { s } = await searchParams;
  return parseSnapshot(s);
}

export async function generateMetadata(props: SnapshotPageProps): Promise<Metadata> {
  const skills = await load(props);
  if (skills.length === 0) return { title: 'Skillprint', robots: { index: false } };

  const title = 'A Skillprint';
  const description = `Top skills: ${skills.slice(0, 3).map((k) => `${k.name} ${k.score}`).join(', ')}. Short games that read your mood, cognition and personality.`;
  const path = snapshotSharePath(skills);
  const image = { url: `/api/og/snapshot/?s=${encodeURIComponent(encodeSnapshot(skills))}`, width: 1200, height: 630, alt: title };

  return {
    title: 'A Skillprint',
    description,
    robots: { index: false },
    alternates: { canonical: path },
    openGraph: { siteName: 'Skillprint', type: 'website', title, description, url: path, images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

/**
 * A shared Skillprint snapshot (`/snapshot/?s=attention.81,focus.74`).
 * Public: the visitor sees the scores the player chose to share, and the
 * way in to play. It names no one; the post that carried the link does.
 */
export default async function SnapshotPage(props: SnapshotPageProps) {
  const skills = await load(props);
  if (skills.length === 0) notFound();

  return (
    <main className="badge-share layout-grid place-center">
      <article className="badge-share__card snapshot-share sp-card layout-grid gap-xl" aria-labelledby="snapshotTitle">
        <Link className="badge-share__brand layout-inline-flex items-center gap-md" href="/">
          <img src="/assets/logos/skillprint-favicon-customer.svg" alt="" width="28" height="28" />
          <span className="ui-label">Skillprint</span>
        </Link>

        <div className="layout-grid gap-sm">
          <h1 className="snapshot-share__title margin-none" id="snapshotTitle">A Skillprint</h1>
          <p className="badge-share__lede margin-none text-muted">The strongest skills a player&apos;s games have measured, out of 100.</p>
        </div>

        <ul className="snapshot-share__list margin-none padding-none" aria-label="Top skills">
          {skills.map((k) => (
            <li key={k.slug} className="snapshot-share__row">
              <div className="snapshot-share__label layout-flex items-center justify-between gap-md">
                <span className="layout-inline-flex items-center gap-sm min-width-0">
                  <i className="snapshot-share__dot" style={{ background: PILLAR_COLOURS[k.pillar] }} aria-hidden="true"></i>
                  <strong>{k.name}</strong>
                  <span className="snapshot-share__pillar text-muted">{PILLAR_LABELS[k.pillar]}</span>
                </span>
                <span className="snapshot-share__score">{k.score}</span>
              </div>
              <span className="snapshot-share__track" aria-hidden="true">
                <span className="snapshot-share__fill" style={{ width: `${k.score}%`, background: PILLAR_COLOURS[k.pillar] }}></span>
              </span>
            </li>
          ))}
        </ul>

        <div className="badge-share__actions layout-flex wrap gap-md">
          <Link className="button button--primary button--md" href="/games">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
            Find your Skillprint
          </Link>
          <Link className="button button--secondary button--md" href="/">Explore Skillprint</Link>
        </div>
        <p className="badge-share__note margin-none text-muted">
          A few minutes of play is enough for a first reading of your mood, cognition and personality.
        </p>
      </article>
    </main>
  );
}
