import React from 'react';
import Link from 'next/link';
import { Playbook } from '@/app/hooks/usePlaybook';
import { MockDataTag } from './MockDataTag';

interface OtherPlaybooksCardProps {
    playbooks: (Playbook & { game_slugs: string[] })[];
    currentPlaybookSlug: string;
}

export function OtherPlaybooksCard({ playbooks, currentPlaybookSlug }: OtherPlaybooksCardProps) {
    const otherPlaybooks = playbooks.filter(p => p.slug !== currentPlaybookSlug);

    if (otherPlaybooks.length === 0) {
        return null;
    }

    return (
        <article className="rail-card sp-card" aria-labelledby="pbOthers" style={{ position: 'relative' }}>
            <div className="rail-card__head">
                <h2 className="rail-card__title" id="pbOthers">Other playbooks</h2>
            </div>
            <ul className="rail-list" data-pb-others="">
                {otherPlaybooks.map(playbook => (
                    <li key={playbook.id}>
                        <Link className="rail-list__link" href={`/playbooks/${playbook.slug}`}>
                            <img 
                                className="rail-thumb" 
                                alt="" 
                                aria-hidden="true" 
                                src={`/skillprint-portal-redesign/assets/icons/${playbook.icon || 'playbook-focus'}.svg`} 
                            />
                            <span className="rail-list__name">{playbook.title}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div style={{ position: 'absolute', top: 0, right: 0 }}>
                <MockDataTag />
            </div>
        </article>
    );
}
