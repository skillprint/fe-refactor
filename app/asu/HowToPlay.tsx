'use client';

import Link from 'next/link';
import { AnimatedGameTiles } from '../components/AnimatedGameTiles';
import { STICKERS, type StationGame } from '@/lib/asuStation';

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
  const { goal, steps, controls } = game.howToPlay;

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
              <span className="asu-howto__eyebrow">How to play</span>
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
              <div>
                <dt className="ui-label">Controls</dt>
                <dd>{controls}</dd>
              </div>
              <div>
                <dt className="ui-label">Time</dt>
                <dd>About 3 minutes</dd>
              </div>
              <div>
                <dt className="ui-label">{game.stickers.length === 1 ? 'Sticker' : 'Stickers'}</dt>
                <dd className="asu-howto__stickers">
                  {game.stickers.map((id) => (
                    <img key={id} src={STICKERS[id].art} alt={STICKERS[id].name} title={STICKERS[id].name} width={36} height={36} />
                  ))}
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
