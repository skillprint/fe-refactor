import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { fetchLibraryGame, libraryGameImage } from '@/lib/models/portal/serverLibraryGame';
import { SKILLPRINT_MARK_DATA_URI, imageDataUri, ogBackground } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * GET /api/og/game/?slug=<game>
 *
 * The preview card for one game: its artwork, name, blurb and the skills it
 * trains, in the 1200x630 frame every network expects. The game page's
 * metadata points `og:image` here.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  const game = await fetchLibraryGame(slug);
  if (!game) {
    return new Response('Game not found', { status: 404 });
  }

  const art = await imageDataUri(libraryGameImage(game));
  const skills = [...game.skills, ...game.moods].map((t) => t.name).filter(Boolean).slice(0, 5);
  const blurb = game.shortDescription || game.longDescription || '';

  return new ImageResponse(
    (
      <div style={{ ...ogBackground, display: 'flex', padding: 56, gap: 48 }}>
        {/* Artwork */}
        <div
          style={{
            display: 'flex',
            width: 480,
            height: HEIGHT - 112,
            borderRadius: 32,
            overflow: 'hidden',
            backgroundColor: '#1d2646',
            border: '2px solid rgba(255,255,255,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {art ? (
            <img src={art} width={480} height={HEIGHT - 112} alt="" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          ) : (
            <img src={SKILLPRINT_MARK_DATA_URI} width={200} height={200} alt="" />
          )}
        </div>

        {/* Copy */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src={SKILLPRINT_MARK_DATA_URI} width={52} height={52} alt="" />
            <span style={{ fontSize: 34, fontWeight: 700, color: '#ffffff' }}>Skillprint</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: game.name.length > 18 ? 56 : 68, fontWeight: 700, color: '#ffffff', lineHeight: 1.05, letterSpacing: -1.5 }}>
              {game.name}
            </div>
            {blurb && (
              <div style={{ fontSize: 27, color: '#c8c2f7', lineHeight: 1.3, display: 'block', lineClamp: 3 }}>
                {blurb.length > 150 ? `${blurb.slice(0, 147).trimEnd()}…` : blurb}
              </div>
            )}
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {skills.map((name) => (
                  <span
                    key={name}
                    style={{
                      fontSize: 22,
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: 999,
                      backgroundColor: 'rgba(87,62,235,0.45)',
                      border: '1px solid rgba(171,160,244,0.5)',
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#09e08f' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: '#09e08f' }} />
            Play free at portal.skillprint.co
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
