'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/design-system/Layout';
import { PortalSidebar } from '@/components/design-system/PortalSidebar';
import { SkillGoalCard } from '@/components/design-system/SkillGoalCard';
import { ThisWeekRailCard } from '@/components/design-system/ThisWeekRailCard';
import { ProfileSkillBreakdown } from '@/components/design-system/ProfileSkillBreakdown';
import { GameSessionsList } from '@/components/design-system/GameSessionsList';

export default function PortalProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [orbitPillar, setOrbitPillar] = useState<'mood' | 'cognition' | 'personality' | 'sessions'>('mood');
  const [selectedOrbitNode, setSelectedOrbitNode] = useState<{
    name: string;
    pillar: string;
    score: number;
    baseline: number;
    change: string;
  } | null>({
    name: 'Focus',
    pillar: 'Mood',
    score: 82,
    baseline: 76,
    change: '+6',
  });

  // Performance insights selected games
  const [selectedGames, setSelectedGames] = useState<string[]>(['snake-attack', 'hextris']);

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

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleGameSelection = (gameId: string) => {
    setSelectedGames(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const PageHeader = (
    <>
      <div className="portal-eyebrow">Profile</div>
      <div className="portal-head__row flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Your Skillprint</h1>
        <Link href="/design-system/games" className="button button--secondary button--md flex items-center gap-1">
          <span>Explore games</span>
          <svg className="sp-icon sp-icon--sm" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-arrow-right"></use>
          </svg>
        </Link>
      </div>
      <p className="text-muted leading-base text-slate-400 mt-2">
        Your cognitive, mood and personality profile, drawn from every session you have played. Every game you finish updates the dial and refines the recommendations on Home.
      </p>
    </>
  );

  const PageRail = (
    <>
      {/* Rail Next Recommendation */}
      <article className="rail-card sp-card sp-card--raised p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="rail-card__head flex items-center justify-between">
          <h2 className="rail-card__title font-bold text-lg text-slate-100" id="railNext">Next</h2>
          <span className="ui-badge ui-badge--sm px-2 py-0.5 bg-slate-800 text-xs rounded-full text-slate-300">2 runs left</span>
        </div>
        <p className="margin-none font-sm leading-md text-sm text-slate-300">
          Two more <span className="weight-semibold font-semibold text-white">Space Trip</span> runs will complete the visualisation set. Personality needs four more sessions before it reads.
        </p>
        <Link className="button button--primary button--md full-width w-full justify-center" href="/game/space-trip">
          <svg className="sp-icon mr-1.5" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-play"></use>
          </svg>
          Play Space Trip
        </Link>
        <Link className="portal-section__link font-sm text-xs flex items-center justify-end gap-1 text-slate-400 hover:text-white" href="/design-system/games">
          <span>Choose Game</span>
          <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
          </svg>
        </Link>
      </article>

      {/* Rail Weekly Summary */}
      <ThisWeekRailCard />

      {/* Recent Sessions Rail Card */}
      <article className="rail-card sp-card p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4" id="recent-sessions">
        <div className="rail-card__head flex items-center justify-between">
          <span className="rail-card__label font-semibold text-slate-200" id="railRecent">Recent sessions</span>
          <span className="ui-badge ui-badge--sm px-2 py-0.5 bg-slate-800 text-xs rounded-full text-slate-400">Last 5</span>
        </div>
        <ul className="rail-list space-y-2 margin-none padding-none list-none">
          {[
            { title: 'Snake Attack', score: '1,240', art: '/assets/design-system/game-art/game-snake-attack.svg' },
            { title: 'Hextris', score: '980', art: '/assets/design-system/game-art/game-hextris.svg' },
            { title: 'Gummy Blocks', score: '1,510', art: '/assets/design-system/game-art/game-gummy-blocks.svg' },
            { title: 'Box Tower', score: '640', art: '/assets/design-system/game-art/game-box-tower.svg' },
            { title: 'Space Trip', score: '1,065', art: '/assets/design-system/game-art/game-space-trip.svg' },
          ].map((item, idx) => (
            <li key={idx}>
              <Link className="rail-list__link flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800" href="/design-system/games">
                <div className="flex items-center gap-2">
                  <img className="rail-thumb w-6 h-6 rounded object-cover" alt="" src={item.art} />
                  <span className="rail-list__name text-xs text-slate-200">{item.title}</span>
                </div>
                <span className="rail-list__value text-xs font-mono font-bold text-slate-300">{item.score}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="portal-section__link font-sm text-xs flex items-center justify-end gap-1 text-slate-400 hover:text-white" href="#sessions">
          <span>All sessions</span>
          <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
            <use href="/assets/design-system/icons/sprite.svg#ti-chevron-right"></use>
          </svg>
        </Link>
      </article>
    </>
  );

  const Footer = (
    <span className="portal-foot__legal text-muted font-sm text-slate-500">© 2026 Skillprint</span>
  );

  return (
    <Layout
      pageClass="page--portal-profile"
      sidebar={
        <PortalSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePath="/design-system/profile"
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      }
      header={PageHeader}
      rail={PageRail}
      footer={Footer}
      theme={theme}
    >
      <div className="space-y-12">
        {/* SECTION 1: ONTOLOGY WHEEL PANEL */}
        <section className="pp-section ontology-root pt-[0px]" id="print">
          <div className="pp-print sp-panel p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="pp-print__bar flex items-center justify-between wrap gap-md">
              <div className="min-width-0">
                <strong className="pp-print__who font-bold text-xl text-slate-100 block">Your Ontology Wheel</strong>
                <span className="pp-print__caption text-xs text-slate-400">Colour is the group · opacity and weight are the score</span>
              </div>
              <div className="flex items-center wrap gap-2">
                <button className="button button--secondary button--sm" type="button">
                  Reset view
                </button>
                <button className="button button--primary button--sm flex items-center gap-1.5" type="button">
                  <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                    <use href="/assets/design-system/icons/sprite.svg#ti-download"></use>
                  </svg>
                  <span>Download and share your Skillprint</span>
                </button>
              </div>
            </div>

            {/* Ontology Stage Banner */}
            <div className="ontology-visual position-relative clip layout-grid p-4 bg-slate-950 rounded-xl border border-slate-800/80 min-h-[320px] flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-3 z-10">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin duration-75"></div>
                </div>
                <h4 className="text-lg font-bold text-slate-200">Ada’s Ontology Map (87 Features)</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  87 game features hanging from the outer rim co-occurring across 700 rated games. Line opacity and thickness indicate your personal score.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: COGNITIVE ORBIT */}
        <section className="pp-section space-y-6" id="orbit">
          <div className="sp-panel p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="chart-card-head flex items-center justify-between wrap gap-md">
              <div className="chart-card-title">
                <span className="theme-label text-xs font-mono uppercase text-slate-400 block">Cognitive orbit</span>
                <strong className="text-xl font-bold text-slate-100 block">Your pillars this week</strong>
                <span className="text-xs text-slate-400">One scored pillar at a time, against your four-week baseline. Select a node for the skill behind it.</span>
              </div>
              <div className="chart-actions status-tabs flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                {(['mood', 'cognition', 'personality', 'sessions'] as const).map(p => (
                  <button
                    key={p}
                    aria-pressed={orbitPillar === p}
                    className={`status-tab px-3 py-1 text-xs font-medium rounded-md transition-colors ${orbitPillar === p ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setOrbitPillar(p)}
                    type="button"
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Orbit Node Detail Card */}
            {selectedOrbitNode && (
              <div className="pp-orbit-detail p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="pp-orbit-detail__head flex items-center gap-3">
                  <strong className="pp-orbit-detail__name text-lg font-bold text-slate-100">{selectedOrbitNode.name}</strong>
                  <span className="pp-orbit-detail__pillar ui-badge px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-xs">
                    {selectedOrbitNode.pillar}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">This week</span>
                    <strong className="font-mono text-base text-slate-100">{selectedOrbitNode.score}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Four-week baseline</span>
                    <strong className="font-mono text-base text-slate-100">{selectedOrbitNode.baseline}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Change</span>
                    <strong className="font-mono text-base text-emerald-400">{selectedOrbitNode.change}</strong>
                  </div>
                </div>
              </div>
            )}

            <p className="chart-insight text-xs text-slate-400 flex items-center gap-2">
              <span className="insight-dot w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Focus and Pattern Matching carry this week. Relax is the only mood below its four-week baseline.
            </p>
          </div>
        </section>

        {/* SECTION 3: SKILL BREAKDOWN */}
        <section className="pp-section space-y-6">
          <div className="section-head pp-head pp-subhead">
            <div className="section-head-copy">
              <h3 className="text-xl font-bold text-slate-100">Skill breakdown</h3>
              <p className="margin-none text-muted text-sm text-slate-400">
                Where every skill stands right now, ranked within its dimension. Open any row for its session-by-session progression.
              </p>
            </div>
          </div>

          <ProfileSkillBreakdown />
        </section>

        {/* SECTION 4: GAME-SPECIFIC PERFORMANCE INSIGHTS */}
        <section className="pp-section space-y-6" id="game-insights">
          <div className="section-head pp-head flex items-end justify-between wrap gap-md">
            <div className="section-head-copy">
              <h2 className="text-xl font-bold text-slate-100">Game-specific performance insights</h2>
              <p className="margin-none text-muted text-sm text-slate-400">Filter your cognitive and mood metrics by selecting one or more games</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="button button--secondary button--sm"
                type="button"
                onClick={() => setSelectedGames(['snake-attack', 'hextris', 'gummy-blocks', 'box-tower', 'space-trip'])}
              >
                Select All
              </button>
              <button className="button button--tertiary button--sm" type="button" onClick={() => setSelectedGames([])}>
                Clear All
              </button>
            </div>
          </div>

          {/* Game Tag Filter Chips */}
          <div className="pp-game-filters flex wrap gap-2" role="group" aria-label="Games">
            {[
              { id: 'snake-attack', name: 'Snake Attack' },
              { id: 'hextris', name: 'Hextris' },
              { id: 'gummy-blocks', name: 'Gummy Blocks' },
              { id: 'box-tower', name: 'Box Tower' },
              { id: 'space-trip', name: 'Space Trip' },
              { id: 'i-love-hue', name: 'I Love Hue' },
            ].map(g => (
              <button
                key={g.id}
                aria-pressed={selectedGames.includes(g.id)}
                className={`ui-tag px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-colors ${selectedGames.includes(g.id) ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-900/60 text-slate-400 border-slate-800'}`}
                onClick={() => toggleGameSelection(g.id)}
                type="button"
              >
                <svg className="sp-icon sp-icon--xs w-3.5 h-3.5" aria-hidden="true" viewBox="0 0 24 24">
                  <use href="/assets/design-system/icons/sprite.svg#ti-gamepad"></use>
                </svg>
                {g.name}
              </button>
            ))}
          </div>

          {/* Performance Insight Card */}
          <div className="pp-insight sp-panel p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
            <div className="pp-insight__head">
              <span className="ui-label text-xs font-mono uppercase text-slate-400 block">Selected games</span>
              <strong className="pp-insight__title text-lg font-bold text-slate-100 block">
                {selectedGames.length > 0 ? selectedGames.join(', ') : 'None selected'}
              </strong>
              <p className="pp-insight__note text-xs text-slate-400">Cognition and mood, scored per session and averaged across the games you have picked.</p>
            </div>

            <div className="pp-insight__stats grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="metric-card sp-card p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="ui-label text-xs text-slate-400 block">Sessions played</span>
                <strong className="metric-value font-mono text-2xl font-bold text-slate-100">{selectedGames.length}</strong>
              </div>
              <div className="metric-card sp-card p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="ui-label text-xs text-slate-400 block">Total playtime</span>
                <strong className="metric-value font-mono text-2xl font-bold text-slate-100">19m 5s</strong>
              </div>
              <div className="metric-card sp-card p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="ui-label text-xs text-slate-400 block">Average flow score</span>
                <strong className="metric-value font-mono text-2xl font-bold text-emerald-400">74%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: GAME SESSIONS */}
        <section className="pp-section space-y-6" id="sessions">
          <div className="section-head pp-head flex items-end justify-between wrap gap-md">
            <div className="section-head-copy">
              <h2 className="text-xl font-bold text-slate-100">Game sessions</h2>
              <p className="margin-none text-muted text-sm text-slate-400">
                Your complete gameplay history. Every session you have finished, newest first, with the score it returned and the skill it was read against.
              </p>
            </div>
            <Link className="button button--tertiary button--sm flex items-center gap-1" href="/design-system/games">
              <span>Play a game</span>
              <svg className="sp-icon sp-icon--xs" aria-hidden="true" viewBox="0 0 24 24">
                <use href="/assets/design-system/icons/sprite.svg#ti-arrow-right"></use>
              </svg>
            </Link>
          </div>

          <GameSessionsList />
        </section>

        {/* SECTION 6: GOALS */}
        <section className="pp-section space-y-6" id="goals">
          <div className="section-head pp-head">
            <div className="section-head-copy">
              <h2 className="text-xl font-bold text-slate-100">Goals</h2>
              <p className="margin-none text-muted text-sm text-slate-400">
                The skills and moods you want your play to work on. Every scored session is measured against these, and the games recommended on Home are picked to reach them.
              </p>
            </div>
          </div>

          <div className="pp-goal-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkillGoalCard />
          </div>
        </section>
      </div>
    </Layout>
  );
}
