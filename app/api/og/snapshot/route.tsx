import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { PILLAR_COLOURS, PILLAR_LABELS, parseSnapshot } from '@/lib/skillprintSnapshot';
import { SKILLPRINT_MARK_DATA_URI, ogBackground } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * GET /api/og/snapshot/?s=attention.81,focus.74
 *
 * The preview card for a shared Skillprint snapshot: the top scores as
 * bars, in the profile wheel's pillar colours. Only skills the taxonomy
 * knows are drawn (see parseSnapshot).
 */
export async function GET(req: NextRequest) {
  const skills = parseSnapshot(req.nextUrl.searchParams.get('s'));
  if (skills.length === 0) {
    return new Response('Nothing to show', { status: 404 });
  }

  return new ImageResponse(
    (
      <div style={{ ...ogBackground, display: 'flex', flexDirection: 'column', padding: '56px 72px', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src={SKILLPRINT_MARK_DATA_URI} width={56} height={56} alt="" />
            <span style={{ fontSize: 46, fontWeight: 700, color: '#ffffff', letterSpacing: -1 }}>A Skillprint</span>
          </div>
          <div style={{ display: 'flex', gap: 22, fontSize: 22, color: '#c8c2f7' }}>
            {(['mood', 'cognition', 'personality'] as const).map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: PILLAR_COLOURS[p] }} />
                {PILLAR_LABELS[p]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1, justifyContent: 'center' }}>
          {skills.map((k) => (
            <div key={k.slug} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <span style={{ display: 'flex', width: 380, fontSize: 34, fontWeight: 700, color: '#ffffff' }}>{k.name}</span>
              <div style={{ display: 'flex', flex: 1, height: 18, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', width: `${k.score}%`, height: 18, borderRadius: 999, backgroundColor: PILLAR_COLOURS[k.pillar] }} />
              </div>
              <span style={{ display: 'flex', width: 70, justifyContent: 'flex-end', fontSize: 38, fontWeight: 700, color: PILLAR_COLOURS[k.pillar] }}>{k.score}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: '#09e08f' }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: '#09e08f' }} />
          Find yours at portal.skillprint.co
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable' },
    },
  );
}
