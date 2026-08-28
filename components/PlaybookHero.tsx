import React from 'react';
import Link from 'next/link';
import { Playbook } from '@/app/hooks/usePlaybook';
import { MockDataTag } from '@/components/MockDataTag';

interface PlaybookHeroProps {
    playbook: Playbook & { game_slugs: string[] };
}

export function PlaybookHero({ playbook }: PlaybookHeroProps) {
    return (
        <section 
            className={`portal-section pb-tone tone ${playbook.tone || 'tone--pink'}`} 
            aria-label="Playbook overview"
        >
            <div className="gd-hero__grid grid">
                <div className="pb-art position-relative clip">
                    <img 
                        alt="" 
                        aria-hidden="true" 
                        className="pb-art__mark layout-block" 
                        src={`/skillprint-portal-redesign/assets/icons/${playbook.icon || 'playbook-focus'}.svg`} 
                        width="512" 
                        height="512" 
                    />
                    <span className="pb-art__flag ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm">
                        Playbook
                    </span>
                </div>
                <div className="gd-hero__copy position-relative">
                    <p className="pb-eyebrow font-sm leading-sm weight-semibold">Playbook</p>
                    <p className="gd-blurb text-muted">{playbook.description}</p>
                    
                    <ul className="gd-facts layout-flex wrap gap-lg margin-none padding-none">
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-gamepad"></use>
                            </svg>
                            <span className="text-muted">In the set:</span>
                            <span>{playbook.game_slugs.length} games</span>
                        </li>
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-clock"></use>
                            </svg>
                            <span className="text-muted">Est. time:</span>
                            <span>{playbook.est_time}</span>
                        </li>
                        <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                            <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-adjust"></use>
                            </svg>
                            <span className="text-muted">Order:</span>
                            <span>Play in sequence</span>
                        </li>
                    </ul>
                    
                    <p className="gd-target margin-none layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold text-muted">
                        <svg className="sp-icon sp-icon--sm sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-category-mood"></use>
                        </svg>
                        Targeting: <strong className="text-default">{playbook.target}</strong>
                    </p>
                    
                    <div className="gd-actions cluster wrap">
                        <Link 
                            className="gd-play button button--primary button--lg no-grow" 
                            href={`/game/${playbook.game_slugs[0] || ''}`}
                        >
                            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <use href="#ti-play"></use>
                            </svg>
                            <span>Start Routine</span>
                        </Link>
                    </div>

                    <div style={{ position: 'absolute', top: 0, right: 0 }}>
                        <MockDataTag />
                    </div>
                </div>
            </div>
        </section>
    );
}
