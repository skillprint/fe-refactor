import React from 'react';
import { GameTile, GameTileProps } from './GameTile';
import Link from 'next/link';

interface PlaybookSequenceProps {
    games: GameTileProps[];
    /** How many games in the sequence the player has already played. */
    playedCount?: number;
}

export function PlaybookSequence({ games, playedCount = 0 }: PlaybookSequenceProps) {
    return (
        <section className="portal-section pb-sequence-section" aria-labelledby="pbSequence">
            <div className="portal-section__bar">
                <div className="min-width-0">
                    <h2 className="portal-section__title" id="pbSequence">The sequence</h2>
                    <p className="portal-section__hint">
                        {games.length} {games.length === 1 ? 'game' : 'games'}, in this order. Finish the set and the skills it targets move together.
                    </p>
                </div>
                <Link className="portal-section__link" href="/games">
                    All games 
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                        <use href="#ti-chevron-right"></use>
                    </svg>
                </Link>
            </div>
            {games.length === 0 ? (
                <div className="portal-blank">
                    <p className="portal-blank__title">No games in this set yet</p>
                    <p className="portal-blank__note">The games for this playbook are not available right now. Check back soon.</p>
                </div>
            ) : (
                <ol className="pb-sequence" data-pb-sequence="">
                    {games.map((game, index) => (
                        <li
                            key={game.id}
                            className={`pb-sequence__item ${index < playedCount ? 'is-played' : ''}`.trim()}
                            aria-label={`Step ${index + 1} of ${games.length}: ${game.title}`}
                        >
                            <GameTile {...game} />
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
