import React from 'react';
import Link from 'next/link';
import type { PlaybookDetail } from '@/lib/models/portal/Playbooks';
import { playbookEstimatedTime, playbookIconSrc, playbookToneClass } from '@/lib/playbookUtils';
import { PILLAR_ICON_IDS, isPillar, pillarLabel, titleFromSlug } from '@/lib/skillIcons';

interface PlaybookHeroProps {
    playbook: PlaybookDetail;
    /** Where "Start routine" goes: the next unplayed game in the sequence. */
    startUrl: string;
    isFinished: boolean;
}

export function PlaybookHero({ playbook, startUrl, isFinished }: PlaybookHeroProps) {
    const gameCount = playbook.games.length;
    const dimensionSkill = playbook.dimension
        ? playbook.targetSkills.find((s) => s.slug === playbook.dimension)
        : undefined;
    const target = playbook.target
        || dimensionSkill?.name
        || (playbook.dimension ? titleFromSlug(playbook.dimension) : undefined)
        || playbook.targetSkills[0]?.name
        || pillarLabel(playbook.pillar);
    const pillarIcon = isPillar(playbook.pillar) ? PILLAR_ICON_IDS[playbook.pillar] : 'ti-category-cognition';

    return (
        <section 
            className={`portal-section pb-tone tone ${playbookToneClass(playbook)}`} 
            aria-label="Playbook overview"
        >
            <div className="gd-hero__grid grid">
                <div className="pb-art position-relative clip">
                    <img 
                        alt="" 
                        aria-hidden="true" 
                        className="pb-art__mark layout-block" 
                        src={playbookIconSrc(playbook)} 
                        width="512" 
                        height="512" 
                    />
                    <span className="pb-art__flag ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm">
                        {playbook.source === 'generated' ? 'Made for you' : 'Playbook'}
                    </span>
                </div>
                <div className="gd-hero__copy position-relative">
                    <p className="pb-eyebrow font-sm leading-sm weight-semibold">
                        {playbook.source === 'generated' ? `${pillarLabel(playbook.pillar)} playbook` : 'Playbook'}
                    </p>
                    <p className="gd-blurb text-muted">{playbook.description}</p>
                    
                    <ul className="gd-facts layout-flex wrap gap-lg margin-none padding-none">
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-gamepad"></use>
                            </svg>
                            <span className="text-muted">In the set:</span>
                            <span>{gameCount} {gameCount === 1 ? 'game' : 'games'}</span>
                        </li>
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-clock"></use>
                            </svg>
                            <span className="text-muted">Est. time:</span>
                            <span>{playbookEstimatedTime(playbook)}</span>
                        </li>
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-adjust"></use>
                            </svg>
                            <span className="text-muted">Order:</span>
                            <span>Play in sequence</span>
                        </li>
                        {typeof playbook.currentScore === 'number' && (
                            <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                                <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                    <use href="#ti-chart"></use>
                                </svg>
                                <span className="text-muted">Your score:</span>
                                <span>{Math.round(playbook.currentScore)}</span>
                            </li>
                        )}
                    </ul>
                    
                    <p className="gd-target margin-none layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold text-muted">
                        <svg className={`sp-icon sp-icon--sm sp-icon--${playbook.pillar}`} aria-hidden="true" viewBox="0 0 24 24">
                            <use href={`#${pillarIcon}`}></use>
                        </svg>
                        Targeting: <strong className="text-default">{target}</strong>
                    </p>
                    
                    <div className="gd-actions cluster wrap">
                        <Link 
                            className="gd-play button button--primary button--lg no-grow" 
                            href={startUrl}
                        >
                            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-play"></use>
                            </svg>
                            <span>{isFinished ? 'Play the set again' : playbook.progress.playedGames > 0 ? 'Continue routine' : 'Start routine'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
