'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { PlaybookHero } from '@/components/PlaybookHero';
import { PlaybookSequence } from '@/components/PlaybookSequence';
import { PlaybookHowItWorks } from '@/components/PlaybookHowItWorks';
import { PlaybookProgressCard } from '@/components/PlaybookProgressCard';
import { OtherPlaybooksCard } from '@/components/OtherPlaybooksCard';
import { SkillCard, SkillCardProps } from '@/components/SkillCard';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { usePlaybookDetail } from '@/lib/models/portal/usePlaybookDetail';
import { usePlaybookList } from '@/lib/models/portal/usePlaybookList';
import { useProfileAggregate } from '@/lib/models/portal/useProfileAggregate';
import { profileDimensionMap } from '@/lib/models/portal/ProfileAggregate';
import { nextGameIndex, playbookGameToTile } from '@/lib/playbookUtils';
import { skillIconId } from '@/lib/skillIcons';

interface PlaybookDetailClientProps {
  slug: string;
}

function BackToGames() {
  return (
    <Link className="stat-hero__back layout-inline-flex items-center gap-md font-sm weight-semibold no-grow" href="/games">
      <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
        <use href="#ti-chevron-left"></use>
      </svg>
      Games
    </Link>
  );
}

export default function PlaybookDetailClient({ slug }: PlaybookDetailClientProps) {
  const decodedSlug = decodeURIComponent(slug);
  const { data: playbook, isLoading, error, notFound } = usePlaybookDetail(decodedSlug);
  const { data: allPlaybooks } = usePlaybookList();
  const { data: profile } = useProfileAggregate();

  const scores = useMemo(() => profileDimensionMap(profile), [profile]);

  const nextIndex = playbook ? nextGameIndex(playbook) : 0;
  const played = playbook?.progress.playedGames ?? 0;
  const isFinished = !!playbook && playbook.games.length > 0 && played >= playbook.games.length;

  const games = useMemo(() => {
    if (!playbook) return [];
    return playbook.games.map((game, index) =>
      playbookGameToTile(game, playbook, {
        played: index < played,
        isNext: !isFinished && index === nextIndex,
      })
    );
  }, [playbook, played, nextIndex, isFinished]);

  const skills: SkillCardProps[] = useMemo(() => {
    if (!playbook) return [];
    const ordered = [...playbook.targetSkills].sort((a, b) =>
      Number(b.slug === playbook.dimension) - Number(a.slug === playbook.dimension)
    );
    return ordered.map((skill) => ({
      id: skill.slug,
      name: skill.name,
      description: skill.description,
      dimension: skill.pillar,
      iconId: skillIconId(skill.pillar, skill.slug, skill.icon),
      progressPercentage: Math.round(scores[skill.slug]?.score ?? 0),
    }));
  }, [playbook, scores]);

  if (notFound) {
    return (
      <PortalLayout pageClass="page--portal-playbook-detail" header={<div className="portal-head"><BackToGames /><div className="portal-head__row"><h1>Playbook not found</h1></div></div>}>
        <div className="portal-blank">
          <p className="portal-blank__title">We could not find that playbook</p>
          <p className="portal-blank__note">It may have been retired, or the link is out of date.</p>
          <Link className="button button--secondary button--sm" href="/games">Browse playbooks</Link>
        </div>
      </PortalLayout>
    );
  }

  if (isLoading || !playbook) {
    return (
      <PortalLayout pageClass="page--portal-playbook-detail" header={<div className="portal-head"><BackToGames /><div className="portal-head__row"><h1>Playbook</h1></div></div>}>
        {error ? (
          <div className="portal-blank">
            <p className="portal-blank__title">We could not load this playbook</p>
            <p className="portal-blank__note">Please try again in a moment.</p>
          </div>
        ) : (
          <div className="flex justify-center items-center py-20">
            <BuckyballLoading />
          </div>
        )}
      </PortalLayout>
    );
  }

  const nextGame = games[nextIndex];
  const startUrl = nextGame?.url || '/games';

  const pageHeader = (
    <div className="portal-head">
      <BackToGames />
      <div className="portal-head__row">
        <h1 id="pbTitle">{playbook.title}</h1>
      </div>
    </div>
  );

  const railContent = (
    <>
      <PlaybookProgressCard games={games} progress={playbook.progress} nextGame={isFinished ? undefined : nextGame} />
      <OtherPlaybooksCard playbooks={allPlaybooks || []} currentPlaybookSlug={playbook.slug} />
    </>
  );

  return (
    <PortalLayout pageClass="page--portal-playbook-detail" header={pageHeader} rail={railContent}>
      <PlaybookHero playbook={playbook} startUrl={startUrl} isFinished={isFinished} />

      <PlaybookSequence games={games} playedCount={played} />

      <section className="portal-section" aria-labelledby="pbSkills">
        <div className="portal-section__bar">
          <div className="min-width-0">
            <h2 className="portal-section__title" id="pbSkills">Skills</h2>
            <p className="portal-section__hint">
              {games.length > 0
                ? `Everything the ${games.length} ${games.length === 1 ? 'game moves' : 'games move between them'}.`
                : 'What this playbook is built to move.'}
            </p>
          </div>
          <Link className="portal-section__link" href="/skills">
            All skills
            <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
              <use href="#ti-chevron-right"></use>
            </svg>
          </Link>
        </div>
        {skills.length > 0 ? (
          <div className="skill-grid grid" data-pb-skill-groups="">
            {skills.map((skill) => (
              <SkillCard key={skill.id} {...skill} />
            ))}
          </div>
        ) : (
          <p className="text-muted font-sm">No target skills are attached to this playbook yet.</p>
        )}
      </section>

      <PlaybookHowItWorks howItWorks={playbook.howItWorks} />
    </PortalLayout>
  );
}
