import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import BotPageClient from './BotPageClient';
import { botDisplayName, botProfilePath, isBotPlayerId } from '@/lib/models/portal/serverBotProfile';
import { STATIC_EXPORT } from '@/lib/staticExport';

interface BotPageProps {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: BotPageProps): Promise<Metadata> {
  // The export builds one page for every bot; the share Lambda puts each
  // bot's own tags on it.
  if (STATIC_EXPORT) return { title: 'Bot', openGraph: { siteName: 'Skillprint', type: 'profile' } };
  const playerId = decodeURIComponent((await params).playerId);
  if (!isBotPlayerId(playerId)) return { title: 'Bot', robots: { index: false } };

  const name = botDisplayName(playerId);
  const title = `${name}'s Skillprint`;
  const description = `${name} is an AI agent from LLM Island, scored by Skillprint across mood, cognition and personality.`;
  const path = botProfilePath(playerId);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { siteName: 'Skillprint', type: 'profile', title, description, url: path },
  };
}

/**
 * A bot's profile (`/bot/<player id>/`), public: an AI agent from LLM Island
 * is not a person, and its profile is what the island shows off. Only
 * `island-*` player ids are served; anything else is a 404, as is an id the
 * backend has never seen.
 */
export default function BotPage() {
  return (
    <Suspense fallback={null}>
      <BotPageClient />
    </Suspense>
  );
}
