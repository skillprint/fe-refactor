import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { fetchTalent } from '@/lib/models/portal/serverTalents';
import { getBadgeArt } from '@/lib/badgeArt';
import { SKILLPRINT_MARK_DATA_URI, imageDataUri, ogBackground } from '@/lib/ogImage';

// Built only where the portal has a server (`.vercel.tsx`, see next.config.ts).
export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * GET /api/og/badge/?slug=<talent>
 *
 * The preview card for a shared badge: the badge art, its name, the animal
 * and what it marks. The art is the SVG shipped in public/, fetched from this
 * deployment and inlined for the renderer.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const talent = await fetchTalent(slug);
  if (!talent) {
    return new Response('Badge not found', { status: 404 });
  }

  const artPath = getBadgeArt(talent);
  const art = artPath ? await imageDataUri(new URL(artPath, req.nextUrl.origin).toString()) : null;
  const blurb = talent.description.length > 140 ? `${talent.description.slice(0, 137).trimEnd()}…` : talent.description;

  return new ImageResponse(
    (
      <div style={{ ...ogBackground, display: 'flex', alignItems: 'center', padding: 64, gap: 56 }}>
        <div style={{ display: 'flex', width: 440, height: 440, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {art ? (
            <img src={art} width={440} height={440} alt="" />
          ) : (
            <img src={SKILLPRINT_MARK_DATA_URI} width={260} height={260} alt="" />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0, height: HEIGHT - 128 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={SKILLPRINT_MARK_DATA_URI} width={48} height={48} alt="" />
            <span style={{ fontSize: 30, fontWeight: 700, color: '#ffffff' }}>Skillprint badge</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: talent.name.length > 16 ? 60 : 72, fontWeight: 700, color: '#ffffff', lineHeight: 1.05, letterSpacing: -1.5 }}>
              {talent.name}
            </div>
            {talent.animalName && (
              <div style={{ fontSize: 32, color: '#09e08f', fontWeight: 600 }}>{talent.animalName}</div>
            )}
            {blurb && <div style={{ fontSize: 26, color: '#c8c2f7', lineHeight: 1.3 }}>{blurb}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: '#ffffff', opacity: 0.85 }}>
            {talent.category ? `${talent.category} · ` : ''}Earned by playing at portal.skillprint.co
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400' },
    },
  );
}
