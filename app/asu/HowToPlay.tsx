'use client';

import Link from 'next/link';
import { AnimatedGameTiles } from '../components/AnimatedGameTiles';
import { STICKERS, type StationControl, type StationGame } from '@/lib/asuStation';

// Line icons drawn on the sprite's 24px grid, stroked like its own (Tabler) icons.
const LINE_ICONS: Record<Exclude<StationControl, 'arrow-keys'>, React.ReactNode> = {
  mouse: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="6" />
      <path d="M12 7v4" />
    </>
  ),
  touch: (
    <>
      <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
      <path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
      <path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" />
      <path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -5.2 -3l-2.8 -5a1.5 1.5 0 0 1 2.4 -1.8l1.6 1.8" />
    </>
  ),
  swipe: (
    <>
      <path d="M3 7c4 -3 10 -3 15 0" />
      <path d="M15 4l3 3l-3.5 1.5" />
      <path d="M9 21v-7a1.5 1.5 0 0 1 3 0v4" />
      <path d="M12 16.5a1.5 1.5 0 0 1 3 0v1" />
      <path d="M15 17.5a1.5 1.5 0 0 1 3 0v1.5a3 3 0 0 1 -3 3h-3" />
    </>
  ),
};

const CONTROL_NAMES: Record<StationControl, string> = {
  'arrow-keys': 'Left and right arrow keys',
  mouse: 'Mouse',
  touch: 'Touch',
  swipe: 'Swipe',
};

function ControlIcon({ control }: { control: StationControl }) {
  if (control === 'arrow-keys') {
    return (
      <span className="asu-howto__keys" role="img" aria-label={CONTROL_NAMES[control]}>
        {['left', 'right'].map((side) => (
          <kbd key={side} className="asu-howto__key">
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href={`#ti-arrow-${side}`}></use></svg>
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <span className="asu-howto__control-icon" role="img" aria-label={CONTROL_NAMES[control]}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {LINE_ICONS[control]}
      </svg>
    </span>
  );
}

interface HowToPlayProps {
  game: StationGame;
  onStart: () => void;
}

/**
 * The step before a station game: what the game is about and how to play it,
 * over the game's own art. The game loads only once the visitor starts, so
 * reading this doesn't count toward their session.
 */
export function HowToPlay({ game, onStart }: HowToPlayProps) {
  const { goal, steps, controls, controlIcons } = game.howToPlay;

  return (
    <div className="page scrollbar-subtle page--game-session margin-none text-default font-ui leading-base" data-sequence="briefing">
      <div aria-hidden="true" className="play-field" data-stage-field>
        <AnimatedGameTiles />
        <img alt="" className="play-field__art" src={`/assets/images/games/game-${game.slug}.svg`} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.closest('.play-field')?.setAttribute('data-tiles-active', ''); }} />
      </div>

      <div className="popup-backdrop inset-none place-center is-open">
        <article aria-labelledby="asu-howto-title" aria-modal="true" className="popup popup--dark asu-howto" role="dialog">
          <div className="popup__content scrollbar-violet relative">
            <div className="asu-howto__head layout-grid">
              <span className="asu-howto__eyebrow">How to play · About 3 minutes</span>
              <h2 id="asu-howto-title" className="asu-howto__title">{game.name}</h2>
              <p className="asu-howto__goal margin-none font-md leading-lg">{goal}</p>
            </div>

            <ol className="asu-howto__steps">
              {steps.map((step, index) => (
                <li key={step} className="asu-howto__step">
                  <span className="asu-howto__n" aria-hidden="true">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <dl className="asu-howto__facts">
              <div className="asu-howto__controls">
                <dt className="ui-label">Controls</dt>
                <dd>
                  <span className="asu-howto__control-icons">
                    {controlIcons.map((control, index) => (
                      <span key={control} className="layout-inline-flex items-center gap-sm">
                        {index > 0 && <span className="asu-howto__or">or</span>}
                        <ControlIcon control={control} />
                      </span>
                    ))}
                  </span>
                  <span>{controls}</span>
                </dd>
              </div>
              <div className="asu-howto__sticker-row">
                <dt className="ui-label">{game.stickers.length === 1 ? 'Sticker you can earn' : 'Stickers you can earn'}</dt>
                <dd>
                  <ul className="asu-howto__stickers">
                    {game.stickers.map((id) => (
                      <li key={id} className="asu-howto__sticker">
                        <img src={STICKERS[id].art} alt="" width={96} height={96} />
                        <span className="asu-howto__sticker-copy">
                          <strong>{STICKERS[id].name}</strong>
                          <span>{STICKERS[id].meaning}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          <footer className="popup__footer">
            <Link href="/asu/" className="button button--tertiary button--md">Pick another game</Link>
            <button type="button" className="button button--primary button--md" onClick={onStart} autoFocus>
              <svg className="sp-icon mr-2" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
              Start {game.name}
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
