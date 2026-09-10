import React from 'react';
import { GameTileProps } from './GameTile';
import type { PlaybookProgress } from '@/lib/models/portal/Playbooks';

interface PlaybookProgressCardProps {
    games: GameTileProps[];
    /** Server-derived progress: replaying a game does not double-count. */
    progress: PlaybookProgress;
    nextGame?: GameTileProps;
}

export function PlaybookProgressCard({ games, progress, nextGame }: PlaybookProgressCardProps) {
    const total = progress.totalGames || games.length;
    const done = Math.min(progress.playedGames, total);
    const isFinished = total > 0 && done >= total;

    return (
        <article className="rail-card rail-card--record sp-card" aria-labelledby="pbProgress">
            <div className="rail-card__head">
                <h2 className="rail-card__title" id="pbProgress">Your progress</h2>
                <p className="rail-card__hint">Where you are in this set.</p>
            </div>
            <div data-pb-progress="">
                <p className="pb-progress__count weight-semibold">{done} of {total} games played</p>
                <ol className="pb-progress__pips layout-flex items-center" aria-hidden="true">
                    {Array.from({ length: total }).map((_, i) => (
                        <li key={i} className={`pb-progress__pip ${i < done ? 'pb-progress__pip--played' : ''}`.trim()}></li>
                    ))}
                </ol>
                <div
                    className="rail-meter"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress.percent}
                    aria-label="Playbook progress"
                    style={{ '--meter': `${progress.percent}%`, '--meter-fill': `${progress.percent}%` } as React.CSSProperties}
                >
                    <i></i>
                </div>
                <p className="pb-progress__next text-muted font-sm leading-md">
                    {isFinished ? (
                        'You have played every game in this set. Playing them again keeps the reading current.'
                    ) : nextGame ? (
                        <>Next up: <strong className="text-default">{nextGame.title}</strong>.</>
                    ) : total === 0 ? (
                        'Nothing to play yet.'
                    ) : null}
                </p>
            </div>
        </article>
    );
}
