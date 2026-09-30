import React from 'react';
import type { Metadata } from 'next';
import StartClient from './StartClient';
import VerifyEmailClient from './VerifyEmailClient';
import ConsumerLinkClient from './ConsumerLinkClient';

type Search = Promise<{ token?: string | string[]; verify?: string | string[]; t?: string | string[] }>;

const single = (value?: string | string[]) => (typeof value === 'string' ? value : null);

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
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
 * Params are read here, server-side, rather than with `useSearchParams`, so
 * the page needs no Suspense boundary to prerender; the client redeems them.
 */
export default async function StartPage({ searchParams }: { searchParams: Search }) {
  const { token, verify, t } = await searchParams;
  if (single(verify)) return <VerifyEmailClient token={single(verify)} />;
  if (single(t)) return <ConsumerLinkClient token={single(t)} />;
  return <StartClient token={single(token)} />;
}
