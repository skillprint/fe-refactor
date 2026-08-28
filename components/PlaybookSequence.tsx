import React from 'react';
import { GameTile, GameTileProps } from './GameTile';
import { MockDataTag } from './MockDataTag';
import Link from 'next/link';

interface PlaybookSequenceProps {
    games: GameTileProps[];
}

export function PlaybookSequence({ games }: PlaybookSequenceProps) {
    return (
        <section className="portal-section pb-sequence-section" aria-labelledby="pbSequence">
            <div className="portal-section__bar">
                <div className="min-width-0">
                    <h2 className="portal-section__title" id="pbSequence">The sequence</h2>
                    <p className="portal-section__hint">
                        {games.length} games, in this order. Finish the set and the skills it targets move together.
                    </p>
                </div>
                <Link className="portal-section__link" href="/games">
                    All games 
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                        <use href="#ti-chevron-right"></use>
                    </svg>
                </Link>
            </div>
            <ol className="pb-sequence" data-pb-sequence="">
                {games.map((game, index) => (
                    <li key={game.id} className="pb-sequence__item" style={{ position: 'relative' }}>
                        <GameTile {...game} />
                        <div style={{ position: 'absolute', top: 0, right: 0 }}>
                            <MockDataTag />
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
