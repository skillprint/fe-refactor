import React from 'react';
import type { Metadata } from 'next';
import PlaybookDetailClient from './PlaybookDetailClient';

export const metadata: Metadata = {
  title: 'Playbook',
};

/**
 * Playbook detail (SKI-129). The hydrated playbook — ordered games, target
 * skills and the player's progress — comes from `GET /api/portal/playbooks/{slug}/`,
 * which needs the player's token, so the page body is a client component.
 *
 * `?assignment=` arrives from an "assigned to you" card and says which of a
 * coach's assignments this is (SKI-224). Read here rather than with
 * `useSearchParams`, which would need a Suspense boundary to prerender.
 */
export default async function PlaybookDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ assignment?: string | string[] }>;
}) {
  const { slug } = await params;
  const { assignment } = await searchParams;
  return <PlaybookDetailClient slug={slug} assignmentId={typeof assignment === 'string' ? assignment : null} />;
}
