'use client';

import React from 'react';
import ProgressBanner from '../../components/ProgressBanner';
import { PlaybookWidget } from '../../components/PlaybookWidget';
import SkillprintVisualization from '../../components/Skillprint';
import DynamicChart from '../../visualize/components/DynamicChart';

// Mock data for visualizations
const MOCK_SKILLS = ['Problem Solving', 'Memory', 'Speed', 'Accuracy'];
const MOCK_MOODS = ['Innovate', 'Relax', 'Focus', 'Collaborate'];
const MOCK_NODE_DATA = new Map();
MOCK_NODE_DATA.set('Problem Solving', { size: 30, color: '#3B82F6' });
MOCK_NODE_DATA.set('Memory', { size: 25, color: '#10B981' });

const MOCK_CHART_DATA = [
  { date: '2023-01-01', value: 50 },
  { date: '2023-01-02', value: 60 },
  { date: '2023-01-03', value: 55 },
  { date: '2023-01-04', value: 70 },
  { date: '2023-01-05', value: 65 },
];

// Placeholder for sections that are hardcoded in page.tsx
const PlaceholderModule = ({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground mb-6">{description}</p>
    {children}
  </div>
);

const HeroModule = () => (
  <div className="bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-500 dark:to-purple-500 px-8 py-12 sm:py-16 rounded-2xl w-full">
    <div className="max-w-4xl">
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 dark:text-white">
        Skillprint
      </h1>
      <p className="text-xl mb-8 dark:text-white text-white">
        Build skills through engaging games and track your progress
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-foreground text-background rounded-full font-bold">Play Games</button>
        <button className="px-6 py-3 border-2 border-foreground text-foreground rounded-full font-bold">View Profile</button>
      </div>
    </div>
  </div>
);

const GameSliderModule = () => (
  <PlaceholderModule title="New Games" description="Check out our latest additions">
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map(i => (
        <div key={i} className="w-80 h-44 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex-shrink-0 p-5 flex flex-col justify-between">
          <h3 className="text-xl font-bold text-white">Awesome Game {i}</h3>
          <button className="bg-white text-black font-bold py-2 px-6 rounded-xl self-start">Play</button>
        </div>
      ))}
    </div>
  </PlaceholderModule>
);

const MoodSkillExplorerModule = () => (
  <PlaceholderModule title="Explore by Mood & Skill" description="Find the perfect game for your current state">
    <div className="flex gap-4">
      {['Focus', 'Relax', 'Innovate', 'Collaborate'].map(mood => (
        <div key={mood} className="px-6 py-4 border border-border rounded-2xl flex items-center justify-center font-bold">
          {mood}
        </div>
      ))}
    </div>
  </PlaceholderModule>
);

const ProfileStatsModule = () => (
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
      <div className="text-2xl font-bold text-primary">14</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Total Sessions</div>
    </div>
    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
      <div className="text-2xl font-bold text-primary">2h 30m</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Time Played</div>
    </div>
    <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
      <div className="text-2xl font-bold text-primary">85</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Avg Flow Score</div>
    </div>
  </div>
);

const SkillBreakdownModule = () => (
  <PlaceholderModule title="Skill Breakdown" description="Your top skills based on gameplay">
    <div className="space-y-4">
      {[
        { name: 'Problem Solving', score: 85, color: '#3B82F6' },
        { name: 'Memory', score: 72, color: '#10B981' },
      ].map(skill => (
        <div key={skill.name} className="flex items-center justify-between">
          <span className="font-medium">{skill.name}</span>
          <div className="flex items-center gap-4 w-1/2">
            <div className="h-2 flex-grow bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${skill.score}%`, backgroundColor: skill.color }} />
            </div>
            <span className="text-sm font-bold">{skill.score}%</span>
          </div>
        </div>
      ))}
    </div>
  </PlaceholderModule>
);

export const MODULE_REGISTRY: Record<string, { name: string; component: React.ComponentType<any>; icon: string }> = {
  hero: {
    name: 'Hero Section',
    component: HeroModule,
    icon: '✨'
  },
  progressBanner: {
    name: 'Progress Banner',
    component: () => <div className="pointer-events-none"><ProgressBanner /></div>,
    icon: '📊'
  },
  playbookWidget: {
    name: 'Playbook Widget',
    component: PlaybookWidget,
    icon: '📖'
  },
  skillprintGraph: {
    name: 'Skillprint Graph',
    component: () => (
      <div className="flex justify-center bg-card border border-border rounded-xl p-4 h-[400px]">
        <SkillprintVisualization 
          userSkills={MOCK_SKILLS} 
          userMoods={MOCK_MOODS} 
          hasScoreBySkill={{ 'Problem Solving': true, 'Memory': true }} 
          hasScoreByMood={{ 'Innovate': true, 'Relax': true, 'Focus': true, 'Collaborate': true }} 
          nodeDataMap={MOCK_NODE_DATA} 
          size={350} 
        />
      </div>
    ),
    icon: '🕸️'
  },
  gameSlider: {
    name: 'New Games Slider',
    component: GameSliderModule,
    icon: '🎮'
  },
  explorer: {
    name: 'Mood/Skill Explorer',
    component: MoodSkillExplorerModule,
    icon: '🧭'
  },
  profileStats: {
    name: 'Profile Stats Row',
    component: ProfileStatsModule,
    icon: '📈'
  },
  skillBreakdown: {
    name: 'Skill Breakdown',
    component: SkillBreakdownModule,
    icon: '💪'
  },
  dynamicChart: {
    name: 'Dynamic Chart',
    component: () => (
      <div className="bg-card p-6 border border-border rounded-xl">
        <h3 className="font-bold mb-4">Performance Trends</h3>
        <div className="h-64 pointer-events-none">
          <DynamicChart data={MOCK_CHART_DATA as any} type="Line" selectedFields={['value']} comparePeriods={0} compareCohort={false} />
        </div>
      </div>
    ),
    icon: '📉'
  }
};
