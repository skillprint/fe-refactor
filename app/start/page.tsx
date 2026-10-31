import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import StartLinkClient from './StartLinkClient';
import { STATIC_EXPORT } from '@/lib/staticExport';

type Search = Promise<{ token?: string | string[]; verify?: string | string[]; t?: string | string[] }>;

const single = (value?: string | string[]) => (typeof value === 'string' ? value : null);

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  // The static export has no request to read.
  if (STATIC_EXPORT) return { title: 'Opening Skillprint', robots: { index: false } };
  const { verify, t } = await searchParams;
  return {
    title: single(verify) ? 'Confirming your email' : single(t) ? 'Opening Skillprint' : 'Opening your playbook',
    robots: { index: false },
  };
}

/**
 * Where email links land.
 *
 * * `/start?token=…`: an assignment email's button (SKI-233).
 * * `/start?verify=…`: the link that confirms a player's email address (SKI-265).
 * * `/start?t=…`: a sign-in link in a consumer email -- the daily game, the
 *   weekly digest (SKI-271).
 *
 * The params are read in the browser, so the page is the same file for every
 * link; the client redeems them.
 */
export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartLinkClient />
    </Suspense>
  );
}
