'use client';

import { GameTile } from '@/components/GameTile';
import { getGameDetails } from '../config/gameConfig';
import { DEFAULT_GAME_IMAGE } from '@/lib/playbookUtils';
import { BONUS_GAME_COUNT, REMIX_URL, STATION_GAMES, STICKERS } from '@/lib/asuStation';
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
          <p className="asu-hero__lede font-lg leading-lg text-muted">
            Play a short game and see what it says about how you think. Your Skillprint shows your game score and the skills you used, and you leave with a sticker.
          </p>
          <ol className="asu-steps" aria-label="How it works">
            {STEPS.map((step, index) => (
              <li key={step.title} className="asu-step layout-grid">
                <span className="asu-step__n" aria-hidden="true">{index + 1}</span>
                <strong>{step.title}</strong>
                <span className="font-sm text-muted">{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="asu-section layout-grid" aria-labelledby="asu-games">
          <div className="asu-section__head layout-grid">
            <h2 id="asu-games">Pick a game</h2>
            <p className="text-muted margin-none">Each one takes about three minutes.</p>
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
            <h2 id="asu-stickers">The stickers</h2>
            <p className="text-muted margin-none">
              The host picks the one that fits your game and your strongest skill. Play {BONUS_GAME_COUNT} different games for the Leverage Our Place bonus.
            </p>
          </div>
          <ul className="asu-sticker-wall margin-none padding-none">
            {Object.values(STICKERS).map((sticker) => (
              <li key={sticker.id} className="asu-sticker layout-grid">
                <img src={sticker.art} alt={`${sticker.name} sticker: ${sticker.animal}`} width={140} height={140} loading="lazy" />
                <strong>{sticker.name}</strong>
                <span className="font-xs text-muted">
                  {sticker.skill ? gamesFor(sticker.id) : `Bonus for ${BONUS_GAME_COUNT} different games`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="asu-footer">
        <p className="margin-none font-sm text-muted">
          Skillprint is part of <a href={REMIX_URL} target="_blank" rel="noopener noreferrer">ReMix the Future 2026</a>, a four-day creative challenge at ASU&apos;s MIX Center in Mesa. This year&apos;s theme is Play Attention!
        </p>
      </footer>
    </div>
  );
}
