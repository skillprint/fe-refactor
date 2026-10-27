import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { PILLAR_COLOURS, PILLAR_LABELS, SNAPSHOT_SIZE, parseSnapshot, snapshotScores } from '@/lib/skillprintSnapshot';
import { wheelSvgMarkup } from '@/lib/skillsWheel';
import { PORTAL_SKILLS } from '@/app/config/skillsTaxonomy';
import { SKILLPRINT_MARK_DATA_URI, ogBackground } from '@/lib/ogImage';

export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;
const WHEEL_PX = 530;

/**
 * GET /api/og/snapshot/?s=attention.81,focus.74,...
 *
 * The preview card for a shared Skillprint: the wheel (every measured skill,
 * in the profile wheel's pillar colours) beside the strongest five. Only
 * skills the taxonomy knows are drawn (see parseSnapshot). The wheel is an
 * inlined SVG: the renderer draws images but has no fonts for SVG text, so
 * the names are set beside it instead.
 */
export async function GET(req: NextRequest) {
  const skills = parseSnapshot(req.nextUrl.searchParams.get('s'));
  if (skills.length === 0) {
    return new Response('Nothing to show', { status: 404 });
  }

  const wheel = `data:image/svg+xml;utf8,${encodeURIComponent(wheelSvgMarkup(snapshotScores(skills), PILLAR_COLOURS))}`;
  const top = skills.slice(0, SNAPSHOT_SIZE);

  return new ImageResponse(
    (
      <div style={{ ...ogBackground, display: 'flex', alignItems: 'center', padding: '40px 64px 40px 40px', gap: 36 }}>
        {/* The mark sits on the hub; the renderer drops images nested in an SVG. */}
        <div style={{ display: 'flex', position: 'relative', width: WHEEL_PX, height: WHEEL_PX, flexShrink: 0 }}>
          <img src={wheel} width={WHEEL_PX} height={WHEEL_PX} alt="" />
          <img src={SKILLPRINT_MARK_DATA_URI} width={64} height={64} alt="" style={{ position: 'absolute', left: (WHEEL_PX - 64) / 2, top: (WHEEL_PX - 64) / 2 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: HEIGHT - 80, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 50, fontWeight: 700, color: '#ffffff', letterSpacing: -1 }}>A Skillprint</span>
            <span style={{ fontSize: 22, color: '#c8c2f7' }}>
              {skills.length} of {Object.keys(PORTAL_SKILLS).length} skills measured · strongest
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {top.map((k) => (
              <div key={k.slug} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: PILLAR_COLOURS[k.pillar], flexShrink: 0 }} />
                <span style={{ display: 'flex', flex: 1, fontSize: 32, fontWeight: 700, color: '#ffffff' }}>{k.name}</span>
                <span style={{ fontSize: 34, fontWeight: 700, color: PILLAR_COLOURS[k.pillar] }}>{k.score}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 22, fontSize: 20, color: '#c8c2f7' }}>
              {(['mood', 'cognition', 'personality'] as const).map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 5, borderRadius: 999, backgroundColor: PILLAR_COLOURS[p] }} />
                  {PILLAR_LABELS[p]}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, color: '#09e08f' }}>
              <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: '#09e08f' }} />
              Find yours at portal.skillprint.co
            </div>
          </div>
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
