import React from 'react';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { PlaybookHero } from '@/components/PlaybookHero';
import { PlaybookSequence } from '@/components/PlaybookSequence';
import { PlaybookHowItWorks } from '@/components/PlaybookHowItWorks';
import { PlaybookProgressCard } from '@/components/PlaybookProgressCard';
import { OtherPlaybooksCard } from '@/components/OtherPlaybooksCard';
import { SkillCard, SkillCardProps } from '@/components/SkillCard';
import { MockDataTag } from '@/components/MockDataTag';
import { Playbook } from '@/lib/models/Playbook';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GameTileProps } from '@/components/GameTile';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Playbook',
};

const MOCK_GAMES: Record<string, GameTileProps> = {
    "whack-em-all": {
        id: "whack-em-all",
        title: "Whack 'em All",
        description: "The classic whack-a-mole game. Test your reaction time.",
        image: "/skillprint-portal-redesign/assets/images/games/game-mole.svg",
        url: "/game/whack-em-all",
        duration: "5-10 min",
        skills: [{ id: "cognition-attention", name: "Attention", dimension: "cognition" }]
    },
    "match-3": {
        id: "match-3",
        title: "Match 3",
        description: "Match 3 items in a row.",
        image: "/skillprint-portal-redesign/assets/images/games/game-gem.svg",
        url: "/game/match-3",
        duration: "5-10 min",
        skills: [{ id: "cognition-pattern-matching", name: "Pattern Matching", dimension: "cognition" }]
    },
    "hidden-objects": {
        id: "hidden-objects",
        title: "Hidden Objects",
        description: "Find hidden objects in the image.",
        image: "/skillprint-portal-redesign/assets/images/games/game-hide.svg",
        url: "/game/hidden-objects",
        duration: "5-10 min",
        skills: [{ id: "cognition-attention", name: "Attention", dimension: "cognition" }]
    },
    "zen-puzzle": {
        id: "zen-puzzle",
        title: "Zen Puzzle",
        description: "Relaxing puzzle to wind down.",
        image: "/skillprint-portal-redesign/assets/images/games/game-puzzle.svg",
        url: "/game/zen-puzzle",
        duration: "5 min",
        skills: [{ id: "mood-relax", name: "Relaxation", dimension: "mood" }]
    },
    "color-sort": {
        id: "color-sort",
        title: "Color Sort",
        description: "Sort colors peacefully.",
        image: "/skillprint-portal-redesign/assets/images/games/game-color.svg",
        url: "/game/color-sort",
        duration: "5 min",
        skills: [{ id: "mood-relax", name: "Relaxation", dimension: "mood" }]
    }
};

const MOCK_SKILLS: Record<string, SkillCardProps> = {
    "cognition-attention": {
        id: "cognition-attention",
        name: "Attention",
        description: "The ability to focus and maintain concentration.",
        dimension: "cognition",
        iconId: "ti-cognition-attention",
        progressPercentage: 45
    },
    "cognition-memory": {
        id: "cognition-memory",
        name: "Memory",
        description: "The ability to retain and recall information.",
        dimension: "cognition",
        iconId: "ti-cognition-memory",
        progressPercentage: 60
    }
};

export default async function PlaybookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const dbPlaybook = await Playbook.findOne({ where: { slug, organization_id: null } });
    
    if (!dbPlaybook) {
        notFound();
    }

    const playbookRaw = dbPlaybook.toJSON();
    const playbook = {
        ...playbookRaw,
        game_slugs: playbookRaw.game_ids || [],
        icon: playbookRaw.icon || 'playbook-focus',
        tone: playbookRaw.tone?.replace('tone--', '') || 'pink'
    };

    const allDbPlaybooks = await Playbook.findAll({ where: { organization_id: null } });
    const allPlaybooks = allDbPlaybooks.map(p => {
        const json = p.toJSON();
        return {
            ...json,
            game_slugs: json.game_ids || [],
            icon: json.icon || 'playbook-focus',
            tone: json.tone?.replace('tone--', '') || 'pink'
        };
    });

    if (!playbook) {
        notFound();
    }

    const playbookGames = playbook.game_slugs.map((gameSlug: string) => MOCK_GAMES[gameSlug] || {
        id: gameSlug,
        title: gameSlug,
        description: "Mock game",
        image: "",
        url: `/game/${gameSlug}`
    });

    const playbookSkills = (playbook.associated_skills || []).map((skillId: string) => MOCK_SKILLS[skillId] || {
        id: skillId,
        name: skillId,
        description: "Mock skill",
        dimension: "cognition",
        iconId: "ti-cognition-knowledge",
        progressPercentage: 0
    });

    // Mock progress - first game completed for deep-focus-routine
    const completedGameSlugs = slug === 'deep-focus-routine' ? [playbook.game_slugs[0]] : [];

    const pageHeader = (
        <div className="portal-head">
            <Link className="stat-hero__back layout-inline-flex items-center gap-md font-sm weight-semibold no-grow" href="/games">
                <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="#ti-chevron-left"></use>
                </svg>
                Games
            </Link>
            <div className="portal-head__row">
                <h1 id="pbTitle">{playbook.title}</h1>
            </div>
        </div>
    );

    const railContent = (
        <>
            <PlaybookProgressCard games={playbookGames} completedGameSlugs={completedGameSlugs} />
            <OtherPlaybooksCard playbooks={allPlaybooks} currentPlaybookSlug={slug} />
        </>
    );

    return (
        <PortalLayout
            pageClass="page--portal-playbook-detail"
            header={pageHeader}
            rail={railContent}
        >
            <PlaybookHero playbook={playbook} />
            
            <PlaybookSequence games={playbookGames} />
            
            <section className="portal-section" aria-labelledby="pbSkills" style={{ position: 'relative' }}>
                <div className="portal-section__bar">
                    <div className="min-width-0">
                        <h2 className="portal-section__title" id="pbSkills">Skills</h2>
                        <p className="portal-section__hint">Everything the {playbookGames.length} games move between them.</p>
                    </div>
                    <Link className="portal-section__link" href="/skills">
                        All skills 
                        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
                            <use href="#ti-chevron-right"></use>
                        </svg>
                    </Link>
                </div>
                <div className="skill-grid grid" data-pb-skill-groups="">
                    {playbookSkills.map((skill: any) => (
                        <SkillCard key={skill.id} {...skill} />
                    ))}
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0 }}>
                    <MockDataTag />
                </div>
            </section>
            
            <PlaybookHowItWorks howItWorks={playbook.how_it_works} />
        </PortalLayout>
    );
}
