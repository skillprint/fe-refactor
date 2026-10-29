import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BotProfileClient from './BotProfileClient';
import { botDisplayName, botProfilePath, fetchBotProfile, isBotPlayerId } from '@/lib/models/portal/serverBotProfile';

interface BotPageProps {
  params: Promise<{ playerId: string }>;
}

async function playerIdOf({ params }: BotPageProps): Promise<string> {
  const { playerId } = await params;
  return decodeURIComponent(playerId);
}

export async function generateMetadata(props: BotPageProps): Promise<Metadata> {
  const playerId = await playerIdOf(props);
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
export default async function BotPage(props: BotPageProps) {
  const bot = await fetchBotProfile(await playerIdOf(props));
  if (!bot) notFound();
  return <BotProfileClient bot={bot} />;
}
