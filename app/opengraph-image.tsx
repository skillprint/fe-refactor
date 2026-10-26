import { ImageResponse } from 'next/og';
import { SKILLPRINT_MARK_DATA_URI, ogBackground } from '@/lib/ogImage';

export const alt = 'Skillprint: short games that read your mood, cognition and personality';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The site's preview card: what a shared portal link unfurls into. */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ ...ogBackground, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <img src={SKILLPRINT_MARK_DATA_URI} width={88} height={88} alt="" />
          <span style={{ fontSize: 56, fontWeight: 700, color: '#ffffff', letterSpacing: -1 }}>Skillprint</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, color: '#ffffff', lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 1000 }}>
            Short games. A real read on how you think.
          </div>
          <div style={{ fontSize: 30, color: '#c8c2f7', lineHeight: 1.3, maxWidth: 980 }}>
            Play a few minutes and see your mood, cognition and personality take shape.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 26, color: '#09e08f' }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: '#09e08f' }} />
          Free to play at portal.skillprint.co
        </div>
      </div>
    ),
    size,
  );
}
