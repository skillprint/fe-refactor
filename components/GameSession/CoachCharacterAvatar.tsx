import React from 'react';
import type { PersonaLook } from '@/lib/coachBridge';

interface CoachCharacterAvatarProps {
  look?: Partial<PersonaLook>;
  name?: string;
  size?: number;
  kind?: 'agent' | 'human';
  pulse?: boolean;
}

const DEFAULT_LOOK: PersonaLook = {
  hair: '#4a2f1d',
  skin: '#f1c9a5',
  top: '#e8913a',
  bottom: '#3a4a86',
  shoes: '#f6f1e7',
};

export default function CoachCharacterAvatar({
  look,
  name = 'Coach',
  size = 28,
  kind = 'agent',
  pulse = false,
}: CoachCharacterAvatarProps) {
  const colors = { ...DEFAULT_LOOK, ...(look || {}) };

  return (
    <span
      aria-label={`${name} avatar`}
      title={`${name} (${kind === 'human' ? 'Human Player' : 'AI Agent'})`}
      style={{
        position: 'relative',
        display: 'inline-grid',
        placeItems: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flex: `0 0 ${size}px`,
        borderRadius: '9999px',
        background: 'color-mix(in srgb, var(--mindset-violet-500, #573eeb) 20%, var(--panel-navy-900, #171a38))',
        border: pulse
          ? '1.5px solid var(--core-green-400, #4ce7ae)'
          : '1px solid color-mix(in srgb, var(--geistface-grey-25, #ffffff) 20%, transparent)',
        boxShadow: pulse ? '0 0 0 3px rgba(76, 231, 174, 0.25)' : 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width={Math.round(size * 0.82)}
        height={Math.round(size * 0.82)}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {/* Hair */}
        <rect x="4" y="2" width="8" height="3" fill={colors.hair} />
        <rect x="3" y="3" width="1" height="3" fill={colors.hair} />
        <rect x="12" y="3" width="1" height="3" fill={colors.hair} />
        {/* Face / Skin */}
        <rect x="4" y="5" width="8" height="5" fill={colors.skin} />
        {/* Eyes */}
        <rect x="5" y="6" width="2" height="2" fill="#171a38" />
        <rect x="9" y="6" width="2" height="2" fill="#171a38" />
        <rect x="5" y="6" width="1" height="1" fill="#ffffff" />
        <rect x="9" y="6" width="1" height="1" fill="#ffffff" />
        {/* Shoulders / Top */}
        <rect x="3" y="10" width="10" height="4" fill={colors.top} />
        {/* Collar / Accent */}
        <rect x="6" y="10" width="4" height="1" fill={colors.shoes} />
        {/* Bottom / Belt */}
        <rect x="4" y="14" width="8" height="2" fill={colors.bottom} />
      </svg>
    </span>
  );
}
