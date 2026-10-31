import { NextResponse } from 'next/server';
import { fetchBotProfile } from '@/lib/models/portal/serverBotProfile';
import { serverOnly, shellParams } from '@/lib/staticExport';

/**
 * GET /api/bot/<player id>/
 *
 * A bot's profile payloads, for `/bot/<player id>/` (BotPageClient). The
 * bot's token is minted here with the partner key and never reaches the
 * browser. 404 for an id that is not a bot's or that the backend doesn't know.
 */
async function handleGet(_request: Request, { params }: { params: Promise<{ playerId: string }> }) {
  const { playerId } = await params;
  const bot = await fetchBotProfile(decodeURIComponent(playerId));
  if (!bot) return NextResponse.json({ detail: 'Not found.' }, { status: 404 });
  return NextResponse.json(bot);
}

export const GET = serverOnly(handleGet);
// The export insists on params for a dynamic route, even one it writes nothing for.
export const generateStaticParams = shellParams('playerId');
