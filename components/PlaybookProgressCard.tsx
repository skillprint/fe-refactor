import React from 'react';
import { MockDataTag } from './MockDataTag';
import { GameTileProps } from './GameTile';

interface PlaybookProgressCardProps {
    games: GameTileProps[];
    completedGameSlugs: string[];
}

export function PlaybookProgressCard({ games, completedGameSlugs }: PlaybookProgressCardProps) {
    const done = completedGameSlugs.length;
    const total = games.length;
    
    let nextGame: GameTileProps | undefined;
    for (const game of games) {
        if (!completedGameSlugs.includes(game.id)) {
            nextGame = game;
            break;
        }
    }

    return (
        <article className="rail-card rail-card--record sp-card" aria-labelledby="pbProgress" style={{ position: 'relative' }}>
            <div className="rail-card__head">
                <h2 className="rail-card__title" id="pbProgress">Your progress</h2>
                <p className="rail-card__hint">Where you are in this set.</p>
            </div>
            <div data-pb-progress="">
                <p className="pb-progress__count weight-semibold">{done} of {total} games played</p>
                <ol className="pb-progress__pips layout-flex items-center" aria-hidden="true">
                    {games.map((game) => (
                        <li key={game.id} className={`pb-progress__pip ${completedGameSlugs.includes(game.id) ? 'pb-progress__pip--played' : ''}`}></li>
                    ))}
                </ol>
                <p className="pb-progress__next text-muted font-sm leading-md">
                    {done === total ? (
                        'You have played every game in this set. Playing them again keeps the reading current.'
                    ) : nextGame ? (
                        <>Next up: <strong className="text-default">{nextGame.title}</strong>.</>
                    ) : null}
                </p>
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <MockDataTag />
            </div>
        </article>
    );
}
