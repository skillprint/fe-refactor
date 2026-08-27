import React from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { PortalPageLayout, PortalPageMain, PortalPageRail, PortalSection } from '@/components/LayoutGrid';
import { PortalSectionTitle, PortalSectionHint } from '@/components/Typography';
import { gameDetails } from '../config/gameConfig';
import { unifiedSlugFromBESlug } from '../utils/slugUtils';
import { GameTile } from '@/components/GameTile';
import { SkillCard } from '@/components/SkillCard';
import { TraitSkillPill, getSkillIconId } from '@/components/TraitSkillPill';
import { GameDetailRecord } from '@/components/GameDetailRecord';
import { GameDetailBadge } from '@/components/GameDetailBadge';
import { IconInfoCardWithDescription } from '@/components/IconInfoCardWithDescription';
import { GameRail } from '@/components/GameRail';

interface GameDetailPageProps {
  searchParams: Promise<{
    game?: string;
  }>;
}

export default async function GameDetailPage({ searchParams }: GameDetailPageProps) {
  const { game: rawGameSlug } = await searchParams;
  const gameSlug = rawGameSlug ? unifiedSlugFromBESlug(rawGameSlug) : null;
  
  const game = gameSlug ? gameDetails[gameSlug] : null;

  if (!game) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Game not found</h1>
            <Link href="/games" className="button button--primary button--md">Back to Games</Link>
          </div>
        </div>
      </PortalLayout>
    );
  }

  // Construct skills
  const skills = game.skills ? game.skills.map((skillItem: any) => {
    const skillName = typeof skillItem === 'string' ? skillItem : (skillItem.name || 'Skill');
    return {
      id: skillName.toLowerCase().replace(/\s+/g, '-'),
      name: skillName,
      dimension: (typeof skillItem === 'object' && skillItem.dimension) ? skillItem.dimension : 'cognition' as const, // Mock dimension
      description: `Develops your ability to master ${skillName.toLowerCase()}`,
      iconId: `ti-cognition-${skillName.toLowerCase().replace(/\s+/g, '-')}` // Mock icon id
    };
  }) : [];

  // Mock "More like this"
  const allGames = Object.entries(gameDetails).map(([slug, details]) => ({ slug, ...details }));
  const moreLikeThis = allGames.filter(g => 
    g.slug !== gameSlug && 
    g.skills && game.skills && 
    g.skills.some((s: string) => game.skills!.includes(s))
  ).slice(0, 5);

  return (
    <PortalLayout pageClass="page--portal-game-detail">
      <div className="portal-head">
        <Link className="stat-hero__back layout-inline-flex items-center gap-md font-sm weight-semibold no-grow" href="/games">
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-left"></use></svg>
          Games
        </Link>
        <div className="portal-head__row">
          <h1 data-gd-title="" id="gdTitle">{game.name}</h1>
        </div>
      </div>

      <PortalPageLayout>
        <PortalPageMain>
          {/* Game Overview */}
          <PortalSection ariaLabelledBy="gameOverview">
            <div className="gd-hero__grid grid">
              <div className="gd-art position-relative clip" data-gd-art="">
                <div className="gd-art__stack stack position-absolute inset-none clip">
                  <img alt={`${game.name} game artwork`} className="gd-art__layer gd-art__layer--static position-absolute layout-block" data-gd-art-static="" src={game.image || '/images/activities/covers/2048.png'} />
                </div>
                <span className="gd-art__flag media-badge ui-badge position-absolute layout-inline-flex items-center radius-full font-xs leading-sm" data-gd-status="" data-status="recommended">
                  <span data-gd-status-label="">Recommended</span>
                </span>
              </div>
              
              <div className="gd-hero__copy">
                <p className="gd-blurb text-muted" data-gd-blurb="">{game.description || 'A fantastic game to play and improve your skills.'}</p>
                <ul className="gd-facts layout-flex wrap gap-lg margin-none padding-none">
                  <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                    <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-clock"></use></svg>
                    <span className="text-muted">Est. time:</span><span data-gd-time="">6–10 min</span>
                  </li>
                  <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                    <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-gamepad"></use></svg>
                    <span className="text-muted">Category:</span><span data-gd-category="">{skills[0]?.name || 'Pattern Matching'}</span>
                  </li>
                  <li className="gd-fact layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold border-subtle">
                    <svg className="sp-icon sp-icon--sm sp-icon--muted" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-trending"></use></svg>
                    <span className="text-muted">Challenge:</span><span>Adapts to you</span>
                  </li>
                </ul>
                <p className="gd-target margin-none layout-inline-flex items-center gap-md font-sm leading-sm weight-semibold text-muted">
                  <svg className="sp-icon sp-icon--sm sp-icon--mood" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-category-mood"></use></svg>
                  Targeting: <strong className="text-default" data-gd-target="">{skills[0]?.name || 'Focus'}</strong>
                </p>
                
                <div className="gd-actions cluster wrap">
                  <Link className="gd-play button button--primary button--lg no-grow" data-gd-play="" href={`/game_session?game=${gameSlug}`}>
                    <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-play"></use></svg>
                    <span data-gd-play-label="">Play {game.name}</span>
                  </Link>
                </div>
              </div>
            </div>
          </PortalSection>

          {/* Skills */}
          {skills.length > 0 && (
            <PortalSection ariaLabelledBy="gdSkills">
              <div className="portal-section__bar">
                <div className="min-width-0">
                  <PortalSectionTitle id="gdSkills">Skills</PortalSectionTitle>
                  <PortalSectionHint data-gd-insight="">Develops {skills.map(s => s.name.toLowerCase()).join(', ')}.</PortalSectionHint>
                </div>
                <Link className="portal-section__link" href="/skills">
                  All skills <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-chevron-right"></use></svg>
                </Link>
              </div>
              <div className="skill-grid grid" data-gd-skill-groups="">
                {skills.map((skill, idx) => {
                  const dimension = (["mood", "cognition", "personality"] as const)[idx % 3]; // Distribute across dimensions for UI mockup
                  return (
                    <SkillCard 
                      key={skill.id}
                      id={skill.id}
                      name={skill.name}
                      description={skill.description}
                      dimension={dimension} 
                      iconId={getSkillIconId(skill.name, dimension)}
                      progressPercentage={0}
                    />
                  );
                })}
              </div>
            </PortalSection>
          )}

          {/* Adapts to You */}
          <PortalSection ariaLabelledBy="gdAdapt">
            <IconInfoCardWithDescription 
              title="Adapts to you"
              note="This game adjusts its speed and difficulty to your performance as you play, so the reading stays useful whether it is your first run or your fiftieth."
              iconId="ti-bolt"
            />
          </PortalSection>

          {/* How to play */}
          <PortalSection ariaLabelledBy="gdHowto" className="separator-top">
            <div className="portal-section__bar">
              <div>
                <PortalSectionTitle id="gdHowto">How to play</PortalSectionTitle>
                <PortalSectionHint>The rules, then it is all reaction.</PortalSectionHint>
              </div>
            </div>
            <div className="gd-panel sp-card">
              <p className="margin-none text-muted leading-md" data-gd-how="">Follow the on-screen instructions. Adjust your strategy as the game speeds up!</p>
              
              <div className="gd-controls" data-gd-controls="">
                <div className="gd-controls__set">
                  <h3 className="gd-controls__title">Desktop</h3>
                  <ul className="gd-controls__list">
                    <li className="gd-control">
                      <span className="gd-control__input"><kbd className="gd-key">&larr;</kbd><kbd className="gd-key">&rarr;</kbd></span>
                      <span className="gd-control__does">Move</span>
                    </li>
                    <li className="gd-control">
                      <span className="gd-control__input"><kbd className="gd-key">&darr;</kbd></span>
                      <span className="gd-control__does">Action</span>
                    </li>
                    <li className="gd-control">
                      <span className="gd-control__input"><kbd className="gd-key">P</kbd></span>
                      <span className="gd-control__does">Pause</span>
                    </li>
                  </ul>
                </div>
                <div className="gd-controls__set">
                  <h3 className="gd-controls__title">Mobile</h3>
                  <ul className="gd-controls__list">
                    <li className="gd-control">
                      <span className="gd-control__input"><span className="gd-gesture">Tap</span></span>
                      <span className="gd-control__does">Tap screen to interact</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </PortalSection>

          {/* More like this */}
          {moreLikeThis.length > 0 && (
            <PortalSection ariaLabelledBy="gdRelated" className="separator-top">
              <div className="portal-section__bar">
                <div>
                  <PortalSectionTitle id="gdRelated">More like this</PortalSectionTitle>
                  <PortalSectionHint>Games that train the same skills.</PortalSectionHint>
                </div>
              </div>
              
              <GameRail className="margin-none padding-none">
                {moreLikeThis.map((g, i) => (
                  <GameTile
                    key={g.slug}
                    id={g.slug}
                    title={g.name}
                    description={g.description || ''}
                    image={g.image || '/images/activities/covers/2048.png'}
                    url={`/game_session?game=${g.slug}`}
                    skills={g.skills ? g.skills.map((s: any) => typeof s === 'string' ? { id: s, name: s, dimension: 'cognition' as const } : { ...s, id: typeof s.id === 'string' ? s.id : (s.name || 'skill') }) : []}
                    tone={(["pink", "mint", "green", "blue", "yellow", "purple"] as const)[i % 6]}
                  />
                ))}
              </GameRail>
            </PortalSection>
          )}
        </PortalPageMain>

        <PortalPageRail>
          {/* Your Record */}
          <GameDetailRecord 
            gameTitle={game.name}
            gameSlug={gameSlug!}
            hasRecord={false} // Mock state: no record
            skillsCount={skills.length}
            skills={skills.slice(0, 3)} // Show max 3 pills
          />
          
          <GameDetailBadge 
            gameTitle={game.name}
            gameImage={game.image}
            isEarned={false}
          />
        </PortalPageRail>
      </PortalPageLayout>
    </PortalLayout>
  );
}
