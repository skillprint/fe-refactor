import { NextResponse } from 'next/server';
import { fetchBotProfile } from '@/lib/models/portal/serverBotProfile';

/**
 * A bot's profile payloads, for `/bot/<player id>/` (BotPageClient). The
 * bot's token is minted here with the partner key and never reaches the
 * browser. 404 for an id that is not a bot's or that the backend doesn't know.
 *
 * Built only where the portal has a server (`.vercel.ts`, see next.config.ts).
 * The static export has none; there the share Lambda serves this path.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  const bot = await fetchBotProfile(decodeURIComponent(playerId));
  if (!bot) return NextResponse.json({ detail: 'Not found.' }, { status: 404 });
  return NextResponse.json(bot);
}
