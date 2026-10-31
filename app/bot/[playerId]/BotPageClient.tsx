'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import BotProfileClient from './BotProfileClient';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import type { BotProfile } from '@/lib/models/portal/serverBotProfile';
import { useRouteParams } from '@/lib/useRouteParams';

type Loaded = { playerId: string; bot: BotProfile | null; failed: boolean };

/** Loads the bot from `/api/bot/<player id>/`, which mints its token on the server. */
export default function BotPageClient() {
  const { playerId } = useRouteParams('/bot/[playerId]');
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: Loaded;
      try {
        const res = await fetch(`/api/bot/${playerId}/`);
        next = { playerId, bot: res.ok ? ((await res.json()) as BotProfile) : null, failed: !res.ok && res.status !== 404 };
      } catch {
        next = { playerId, bot: null, failed: true };
      }
      if (!cancelled) setLoaded(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (!loaded || loaded.playerId !== playerId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <BuckyballLoading />
      </div>
    );
  }
  if (loaded.failed) {
    return <p className="flex h-screen items-center justify-center text-muted">This profile couldn&apos;t load. Try again in a moment.</p>;
  }
  if (!loaded.bot) notFound();
  return <BotProfileClient bot={loaded.bot} />;
}
