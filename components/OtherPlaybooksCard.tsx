import React from 'react';
import Link from 'next/link';
import type { PlaybookSummary } from '@/lib/models/portal/Playbooks';
import { playbookIconSrc } from '@/lib/playbookUtils';

interface OtherPlaybooksCardProps {
    playbooks: PlaybookSummary[];
    currentPlaybookSlug: string;
}

export function OtherPlaybooksCard({ playbooks, currentPlaybookSlug }: OtherPlaybooksCardProps) {
    const otherPlaybooks = playbooks.filter(p => p.slug !== currentPlaybookSlug);

    if (otherPlaybooks.length === 0) {
        return null;
    }

    return (
        <article className="rail-card sp-card" aria-labelledby="pbOthers">
            <div className="rail-card__head">
                <h2 className="rail-card__title" id="pbOthers">Other playbooks</h2>
            </div>
            <ul className="rail-list" data-pb-others="">
                {otherPlaybooks.map(playbook => (
                    <li key={playbook.slug}>
                        <Link className="rail-list__link" href={`/playbooks/${encodeURIComponent(playbook.slug)}`}>
                            <img 
                                className="rail-thumb" 
                                alt="" 
                                aria-hidden="true" 
                                src={playbookIconSrc(playbook)} 
                            />
                            <span className="rail-list__name">{playbook.title}</span>
                            {playbook.progress.totalGames > 0 && (
                                <span className="ui-badge ui-badge--sm" aria-label={`${playbook.progress.playedGames} of ${playbook.progress.totalGames} played`}>
                                    {playbook.progress.playedGames}/{playbook.progress.totalGames}
                                </span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </article>
    );
}
