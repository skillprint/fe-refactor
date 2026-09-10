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
 */
export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlaybookDetailClient slug={slug} />;
}
