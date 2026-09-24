import React from 'react';
import type { Metadata } from 'next';
import StartClient from './StartClient';

export const metadata: Metadata = {
  title: 'Opening your playbook',
  robots: { index: false },
};

/**
 * Where an assignment email's button lands (SKI-233): `/start?token=…`.
 *
 * The token is read here, server-side, rather than with `useSearchParams`, so
 * the page needs no Suspense boundary to prerender; the client redeems it.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <StartClient token={typeof token === 'string' ? token : null} />;
}
