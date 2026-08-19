'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/design-system/Layout';
import { PortalTopNav } from '@/components/design-system/PortalTopNav';
import { PortalSidebar } from '@/components/design-system/PortalSidebar';
import { PortalSection, GameRail, GameGrid } from '@/components/design-system/GridSystem';
import { Button } from '@/components/design-system/Button';
import { Tag, Badge } from '@/components/design-system/Tag';
import { Card } from '@/components/design-system/Card';
import { ContinueCard } from '@/components/design-system/ContinueCard';
import { GameCard } from '@/components/design-system/GameCard';
import { SkillTileCard } from '@/components/design-system/SkillTileCard';
import { PlaybookRailCard } from '@/components/design-system/PlaybookRailCard';
import { SkillFocusCard } from '@/components/design-system/SkillFocusCard';
import { RecentActivityCard } from '@/components/design-system/RecentActivityCard';
import { Icon } from '@/components/ui/Icon';

export default function PortalHomeDesignSystemPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync theme to document element so all top-level CSS selectors match
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-surface', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Home Page Banner Header
  const PageHeader = (
    <>
      <div className="portal-eyebrow">Monday · Week 29</div>
      <div className="portal-head__row">
        <h1 className="font-display">Ready to play.</h1>
        <Button variant="secondary" size="md" icon="ti-arrow-right" iconPosition="right" href="/games">
          Browse all games
        </Button>
      </div>
      <p className="text-muted leading-base">
        Four short games this week. Each one reads how you think while you play it.
      </p>
    </>
  );

  // Right Rail Sidebar Cards
  const RailContent = (
    <>
      <PlaybookRailCard
        title="Current playbook"
        badgeLabel="Week 29"
        description="Build attention first. Short sessions, one game a day, mid-morning where your scores hold best."
        stats={[
          { label: 'Sessions', value: 8 },
          { label: 'Flow', value: 72 },
          { label: 'Streak', value: 4 },
        ]}
        playHref="/game/space-trip"
      />

      <SkillFocusCard
        title="Skill focus"
        skillsHref="/skills"
        skills={[
          { name: 'Attention', score: 64 },
          { name: 'Pattern Matching', score: 81 },
          { name: 'Planning', score: 76 },
        ]}
      />

      <RecentActivityCard
        title="Recent activity"
        profileHref="/profile"
        activities={[
          {
            gameTitle: 'Snake Attack',
            timestamp: '09:14',
            thumbSrc: '/assets/design-system/game-art/game-snake-attack.svg',
          },
          {
            gameTitle: 'Gummy Blocks',
            timestamp: 'Sun',
            thumbSrc: '/assets/design-system/game-art/game-gummy-blocks.svg',
          },
          {
            gameTitle: 'Box Tower',
            timestamp: 'Sat',
            thumbSrc: '/assets/design-system/game-art/game-box-tower.svg',
          },
          {
            gameTitle: 'Cat Focus',
            timestamp: 'Fri',
            thumbSrc: '/assets/design-system/game-art/game-cat-focus.svg',
          },
        ]}
      />
    </>
  );

  // Footer Links
  const PageFooter = (
    <>
      <nav aria-label="Portal utility links">
        <a href="#top">Help</a>
      </nav>
      <span className="portal-foot__legal">© 2026 Skillprint</span>
    </>
  );

  return (
    <Layout
      theme={theme}
      sidebar={
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath="/design-system/home"
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      }
      header={PageHeader}
      rail={RailContent}
      footer={PageFooter}
    >
        {/* Main Portal Sections */}
        <div className="space-y-10">
          {/* Section 1: Continue Playing */}
          <PortalSection title="Continue playing" id="continueTitle" linkHref="/games" linkText="All games">
            <ContinueCard
              sessionLabel="Session 3 of 5"
              title="Space Trip"
              lede="You stopped at the second corridor. Two more runs finishes the visualisation set and unlocks the full reading."
              progressPercent={60}
              continueHref="/game/space-trip"
              detailHref="/game/space-trip/detail"
              staticArt="/assets/design-system/game-art/game-space-trip.svg"
              animatedArt="/assets/design-system/game-art/game-space-trip-animated.svg"
            />
          </PortalSection>

          {/* Section 2: Recommended for Today */}
          <PortalSection
            title="Recommended for today"
            id="recommendedTitle"
            hint="Picked from your playbook — attention is the skill with the most headroom this week."
          >
            <GameRail>
              <GameCard
                variant="recommended"
                title="Cat Focus"
                href="/game/cat-focus"
                flag="Top pick"
                skillOrTimeMeta="Attention · 4–7 min"
                tagLabel="Playful"
                staticArt="/assets/design-system/game-art/game-cat-focus.svg"
                animatedArt="/assets/design-system/game-art/game-cat-focus-animated.svg"
              />
              <GameCard
                variant="recommended"
                title="Hextris"
                href="/game/hextris"
                skillOrTimeMeta="Pattern Matching · 6–10 min"
                tagLabel="Focus"
                staticArt="/assets/design-system/game-art/game-hextris.svg"
                animatedArt="/assets/design-system/game-art/game-hextris-animated.svg"
              />
              <GameCard
                variant="recommended"
                title="Snake Attack"
                href="/game/snake-attack"
                skillOrTimeMeta="Timing · 5–10 min"
                tagLabel="Energise"
                staticArt="/assets/design-system/game-art/game-snake-attack.svg"
                animatedArt="/assets/design-system/game-art/game-snake-attack-animated.svg"
              />
              <GameCard
                variant="recommended"
                title="Box Tower"
                href="/game/box-tower"
                skillOrTimeMeta="Planning · 5–8 min"
                tagLabel="Relax"
                staticArt="/assets/design-system/game-art/game-box-tower.svg"
                animatedArt="/assets/design-system/game-art/game-box-tower-animated.svg"
              />
            </GameRail>
          </PortalSection>

          {/* Section 3: Recently Played */}
          <PortalSection title="Recently played" id="recentTitle" linkHref="/profile#sessions" linkText="All sessions">
            <GameRail>
              <GameCard
                variant="recent"
                title="Snake Attack"
                href="/game/snake-attack"
                skillOrTimeMeta="Today 09:14 · Score 1,240"
                tagLabel="Flow 74"
                actionType="again"
                staticArt="/assets/design-system/game-art/game-snake-attack.svg"
                animatedArt="/assets/design-system/game-art/game-snake-attack-animated.svg"
              />
              <GameCard
                variant="recent"
                title="Gummy Blocks"
                href="/game/gummy-blocks"
                skillOrTimeMeta="Sunday 20:02 · Score 880"
                tagLabel="Flow 69"
                actionType="again"
                staticArt="/assets/design-system/game-art/game-gummy-blocks.svg"
                animatedArt="/assets/design-system/game-art/game-gummy-blocks-animated.svg"
              />
              <GameCard
                variant="recent"
                title="Box Tower"
                href="/game/box-tower"
                skillOrTimeMeta="Saturday 11:40 · Score 1,015"
                tagLabel="Flow 71"
                actionType="again"
                staticArt="/assets/design-system/game-art/game-box-tower.svg"
                animatedArt="/assets/design-system/game-art/game-box-tower-animated.svg"
              />
              <GameCard
                variant="recent"
                title="Cat Focus"
                href="/game/cat-focus"
                skillOrTimeMeta="Friday 18:26 · Score 640"
                tagLabel="Flow 66"
                actionType="again"
                staticArt="/assets/design-system/game-art/game-cat-focus.svg"
                animatedArt="/assets/design-system/game-art/game-cat-focus-animated.svg"
              />
            </GameRail>
          </PortalSection>

          {/* Section 4: New Games */}
          <PortalSection title="New games" id="newTitle" linkHref="/games" linkText="All games">
            <GameRail>
              <GameCard
                variant="new"
                title="Hextris"
                href="/game/hextris"
                flag="New"
                skillOrTimeMeta="Rotate and match hexagons"
                staticArt="/assets/design-system/game-art/game-hextris.svg"
                animatedArt="/assets/design-system/game-art/game-hextris-animated.svg"
              />
              <GameCard
                variant="new"
                title="Snake Attack"
                href="/game/snake-attack"
                flag="New"
                skillOrTimeMeta="Grow the snake, keep the room"
                staticArt="/assets/design-system/game-art/game-snake-attack.svg"
                animatedArt="/assets/design-system/game-art/game-snake-attack-animated.svg"
              />
              <GameCard
                variant="new"
                title="Space Trip"
                href="/game/space-trip"
                flag="New"
                skillOrTimeMeta="Read the route before you fly it"
                staticArt="/assets/design-system/game-art/game-space-trip.svg"
                animatedArt="/assets/design-system/game-art/game-space-trip-animated.svg"
              />
              <GameCard
                variant="new"
                title="Gummy Blocks"
                href="/game/gummy-blocks"
                flag="New"
                skillOrTimeMeta="Fit the pieces, clear the line"
                staticArt="/assets/design-system/game-art/game-gummy-blocks.svg"
                animatedArt="/assets/design-system/game-art/game-gummy-blocks-animated.svg"
              />
            </GameRail>
          </PortalSection>

          {/* Section 5: Play By Skill */}
          <PortalSection
            title="Play by skill"
            id="bySkillTitle"
            hint="Every game reads several dimensions at once. These are the ones it reads hardest."
            linkHref="/skills"
            linkText="All skills"
          >
            <GameGrid variant="pairs">
              <SkillTileCard
                title="Attention"
                gameCount={3}
                iconName="ti-cognition-attention"
                href="/skills/attention"
              />
              <SkillTileCard
                title="Planning"
                gameCount={2}
                iconName="ti-cognition-planning"
                href="/skills/planning"
              />
              <SkillTileCard
                title="Pattern Matching"
                gameCount={2}
                iconName="ti-cognition-pattern-matching"
                href="/skills/pattern-matching"
              />
              <SkillTileCard
                title="Visualization"
                gameCount={1}
                iconName="ti-cognition-visualization"
                href="/skills/visualization"
              />
            </GameGrid>
          </PortalSection>
        </div>
      </Layout>
  );
}
