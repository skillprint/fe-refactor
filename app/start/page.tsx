import React from 'react';
import type { Metadata } from 'next';
import StartClient from './StartClient';
import VerifyEmailClient from './VerifyEmailClient';

type Search = Promise<{ token?: string | string[]; verify?: string | string[] }>;

const single = (value?: string | string[]) => (typeof value === 'string' ? value : null);

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const { verify } = await searchParams;
  return {
    title: single(verify) ? 'Confirming your email' : 'Opening your playbook',
    robots: { index: false },
  };
}

/**
 * Where email links land.
 *
 * * `/start?token=…`: an assignment email's button (SKI-233).
 * * `/start?verify=…`: the link that confirms a player's email address (SKI-265).
 *
 * Params are read here, server-side, rather than with `useSearchParams`, so
 * the page needs no Suspense boundary to prerender; the client redeems them.
 */
export default async function StartPage({ searchParams }: { searchParams: Search }) {
  const { token, verify } = await searchParams;
  if (single(verify)) return <VerifyEmailClient token={single(verify)} />;
  return <StartClient token={single(token)} />;
}
