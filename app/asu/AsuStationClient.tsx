'use client';

import { GameTile } from '@/components/GameTile';
import { getGameDetails } from '../config/gameConfig';
import { DEFAULT_GAME_IMAGE } from '@/lib/playbookUtils';
import { REMIX_URL, STATION_GAMES, STICKERS } from '@/lib/asuStation';
import { StationHeader } from './StationHeader';
import { useStationGuest } from './useStationGuest';

const STEPS = [
  { title: 'Pick a game', text: 'Any of the four below.' },
  { title: 'Play', text: 'For about three minutes.' },
  { title: 'See your Skillprint', text: 'Your game score and skill scores.' },
  { title: 'Get a sticker', text: 'One that fits the game you played.' },
];

/** Which station games can earn each sticker, for the sticker wall. */
const gamesFor = (stickerId: string) =>
  STATION_GAMES.filter((game) => game.stickers.includes(stickerId)).map((game) => game.name).join(' · ');

export default function AsuStationClient() {
  useStationGuest();

  return (
    <div className="asu-station">
      <StationHeader />

      <main className="asu-main layout-grid">
        <section className="asu-hero layout-grid" aria-labelledby="asu-title">
          <p className="asu-eyebrow">Skillprint at ReMix the Future 2026</p>
          <h1 id="asu-title" className="asu-hero__title">Play Attention!</h1>
          <ol className="asu-steps" aria-label="How it works">
            {STEPS.map((step, index) => (
              <li key={step.title} className="asu-step layout-grid">
                <span className="asu-step__n" aria-hidden="true">{index + 1}</span>
                <strong className="asu-step__title">{step.title}</strong>
                <span className="asu-step__text">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="asu-section layout-grid" aria-labelledby="asu-games">
          <div className="asu-section__head layout-grid">
            <h2 id="asu-games">Pick a game</h2>
          </div>
          <div className="asu-games">
            {STATION_GAMES.map((game) => (
              <GameTile
                key={game.slug}
                id={game.slug}
                title={game.name}
                description={game.hint ? `${game.description} ${game.hint}` : game.description}
                image={getGameDetails(game.slug)?.image || DEFAULT_GAME_IMAGE}
                url={`/asu/play/${game.slug}/`}
                duration="About 3 minutes"
                tone={game.tone}
                showInfoLink={false}
                extra={
                  <div className="asu-tile-stickers layout-grid gap-sm">
                    <span className="ui-label">{game.stickers.length === 1 ? 'Sticker' : 'Stickers'}</span>
                    <ul className="layout-flex wrap gap-sm margin-none padding-none">
                      {game.stickers.map((id) => (
                        <li key={id} className="asu-tile-sticker">
                          <img src={STICKERS[id].art} alt="" width={44} height={44} />
                          <span className="font-xs weight-semibold">{STICKERS[id].name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
            ))}
          </div>
        </section>

        <section className="asu-section layout-grid" aria-labelledby="asu-stickers">
          <div className="asu-section__head layout-grid">
            <h2 id="asu-stickers">The reward</h2>
          </div>
          <ul className="asu-sticker-wall margin-none padding-none">
            {Object.values(STICKERS).map((sticker) => (
              <li key={sticker.id} className="asu-sticker layout-grid">
                <img src={sticker.art} alt={`${sticker.name} sticker: ${sticker.animal}`} width={200} height={200} loading="lazy" />
                <strong className="asu-sticker__name">{sticker.name}</strong>
                <span className="asu-sticker__meaning">{sticker.meaning}</span>
                {/* The bonus's meaning already says how to earn it. */}
                {sticker.skill && <span className="asu-sticker__games">{gamesFor(sticker.id)}</span>}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="asu-footer">
        <p className="asu-footer__text margin-none">
          Skillprint is part of <a href={REMIX_URL} target="_blank" rel="noopener noreferrer">ReMix the Future 2026</a>, a four-day creative challenge at ASU&apos;s MIX Center in Mesa. This year&apos;s theme is Play Attention!
        </p>
      </footer>
    </div>
  );
}
