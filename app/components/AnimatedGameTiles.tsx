import React from 'react';

const ROWS = [
  { duration: 115, delay: -41, reverse: false },
  { duration: 132, delay: -15, reverse: true },
  { duration: 96, delay: -11, reverse: false },
  { duration: 129, delay: -47, reverse: true },
  { duration: 108, delay: -29, reverse: false },
  { duration: 143, delay: -73, reverse: true },
  { duration: 117, delay: -5, reverse: false },
  { duration: 104, delay: -33, reverse: true },
  { duration: 135, delay: -62, reverse: false },
  { duration: 122, delay: -21, reverse: true },
  { duration: 98, delay: -55, reverse: false },
  { duration: 140, delay: -38, reverse: true },
  { duration: 125, delay: -25, reverse: false },
  { duration: 110, delay: -50, reverse: true },
];

const tileImages = [
    '/images/activities/covers/2048.png',
    '/images/activities/covers/Hextris.png',
    '/images/activities/covers/alchemy-0d0a33e5-d249-42d2-91cc-a734b00e6113.png',
    '/images/activities/covers/box-tower.png',
    '/images/activities/covers/brick-out.png',
    '/images/activities/covers/bubble-spirit-d1e8e962-1243-4e94-a9f4-351dec27ae8a.png',
    '/images/activities/covers/change-word-0bc38905-8138-43f2-9ff5-a01a5f038782.png',
    '/images/activities/covers/colorize-2-79f1475d-c180-43e0-a496-0123c3972709.png',
    '/images/activities/covers/flapcat-steampunk-fe310887-b4c3-4cbb-96d4-575e5786.png',
    '/images/activities/covers/fruit-boom-cfc9640c-477d-437b-9d2f-54f972163c09.png',
    '/images/activities/covers/0hh1-e28b593f-4355-4b9e-8444-6f9e04ca1846.png',
    '/images/activities/covers/garden-match-f883d184-cb16-434c-a866-6eaff7bd05b2.png',
    '/images/activities/covers/i-love-hue-115ad80c-adb3-47fb-8be7-4b683133a94e.png',
    '/images/activities/covers/mine-rusher-08ac08e4-61d5-4ac8-8cef-d29273cf8448.png',
    '/images/activities/covers/snake-attack-3b730898-fe67-4e51-a655-57c81bd3efbc.png',
    '/images/activities/covers/space-trip-ce24666e-4467-4a25-8658-0f86a0fdcb20.png',
    '/images/activities/covers/ultimate-sudoku-c5f5177d-6a3e-43f6-b2d2-6a7a78c88e.png',
    '/images/activities/covers/sweet-memory-2-6b558e2a-cf49-4ea7-be60-2a8dda06b60.png',
    '/images/activities/covers/star-puzzles-c2b7b115-b851-419e-8052-cad293bac997.png',
    '/images/activities/covers/mahjong-deluxe-77a68085-f806-48c8-a3a8-a11450f3d80.png'
];

export function AnimatedGameTiles() {
    return (
        <div className="welcome-field" data-welcome-field aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none' }}>
            <div className="welcome-field__stage">
                {ROWS.map((row, i) => {
                    // Deterministic shuffle for this row
                    const order = [...tileImages].sort((a, b) => (a.length * (i + 1)) % 5 - (b.length * (i + 1)) % 5);
                    // Ensure enough tiles to fill a large screen row (approx 24 cards per half)
                    const extendedOrder = [];
                    while (extendedOrder.length < 24) {
                        extendedOrder.push(...order);
                    }
                    const half = extendedOrder.slice(0, 24);
                    const trackItems = [...half, ...half]; // Duplicate for seamless loop

                    return (
                        <div key={i} className={`welcome-field__row ${row.reverse ? 'welcome-field__row--reverse' : ''}`}>
                            <div className="welcome-field__track" style={{
                                '--row-duration': `${row.duration}s`,
                                '--row-delay': `${row.delay}s`,
                                '--row-rest': `-${(((Math.abs(row.delay) / row.duration) % 1) * 50).toFixed(2)}%`,
                            } as React.CSSProperties}>
                                {trackItems.map((src, j) => (
                                    <span key={j} className="welcome-field__card">
                                        <img src={src} alt="" width="160" height="160" decoding="async" />
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
