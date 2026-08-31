'use client';

import React, { useState, useEffect } from 'react';
import PortalLayout from '@/components/PortalLayout';
import { PortalSection } from '@/components/LayoutGrid';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import ProfileRail from '@/components/Profile/ProfileRail';
import ProfileGoals from '@/components/Profile/ProfileGoals';
import ProfileBadges from '@/components/Profile/ProfileBadges';
import ProfileSessions from '@/components/Profile/ProfileSessions';
import { useGameSessions } from '../hooks/useGameSessions';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSkillprintVisualizationData } from '../hooks/useSkillprintVisualizationData';
import { useGoalSetting, AVAILABLE_SKILLS, AVAILABLE_MOODS } from '../hooks/useGoalSetting';
import { getGameDetails } from '../config/gameConfig';
import ProfileGameInsights from '@/components/Profile/ProfileGameInsights';
import { useGameMetrics } from '../hooks/useGameMetrics';
import ProfileSkillsSection from '@/components/Profile/ProfileSkillsSection';
import ProfileSkillprintWheel from '@/components/Profile/ProfileSkillprintWheel';
import ProfilePerformanceTrends from '@/components/Profile/ProfilePerformanceTrends';

function formatSecondsToDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0m 0s';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function ProfilePageContent() {
  const { sessions } = useGameSessions();
  const { fetchUserProfile } = useUserProfile();
  const [processedProfile, setProcessedProfile] = useState<any>(null);

  const {
    goalSkills,
    goalMoods,
    isLoading: isGoalsLoading,
    isSavingSkills,
    isSavingMoods,
    saveSkills,
    saveMoods,
  } = useGoalSetting();

  useEffect(() => {
    fetchUserProfile().then(data => {
      if (data) {
        setProcessedProfile(data.processedProfile);
      }
    });
  }, [fetchUserProfile]);

  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const uniqueGames = React.useMemo(() => {
    if (!sessions || sessions.length === 0) {
      // Fallback to reference design games if no local sessions exist
      const refSlugs = ['snake-attack', 'gummy-blocks', 'box-tower', 'cat-focus', 'hextris'];
      return refSlugs.map(slug => ({ 
        slug, 
        name: getGameDetails(slug)?.name || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
      }));
    }
    const gamesMap = new Map();
    sessions.forEach((s: any) => {
      const slug = s.gameSlug || s.gameId;
      if (slug && !gamesMap.has(slug)) {
        gamesMap.set(slug, { slug, name: getGameDetails(slug)?.name || slug });
      }
    });
    return Array.from(gamesMap.values());
  }, [sessions]);

  useEffect(() => {
    if (uniqueGames.length > 0 && selectedGames.length === 0) {
      setSelectedGames(uniqueGames.map(g => g.slug));
    }
  }, [uniqueGames, selectedGames]);

  const { data: metricsData, isLoading: isMetricsLoading } = useGameMetrics(selectedGames);

  const parsedChartData = React.useMemo(() => {
    if (!metricsData) return [];
    const chartPoints: { name: string; score: number }[] = [];

    if (metricsData.flow && typeof metricsData.flow.avgScore === 'number') {
      chartPoints.push({ name: 'Flow', score: Math.round(metricsData.flow.avgScore * 100) });
    }
    if (metricsData.moods) {
      Object.entries(metricsData.moods).forEach(([name, details]: [string, any]) => {
        const score = details.avg_score || details.avgScore || 0;
        chartPoints.push({ name: name.charAt(0).toUpperCase() + name.slice(1), score: Math.round(score * 100) });
      });
    }
    if (metricsData.skills) {
      Object.entries(metricsData.skills).forEach(([name, details]: [string, any]) => {
        const score = details.avg_score || details.avgScore || 0;
        chartPoints.push({ name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '), score: Math.round(score * 100) });
      });
    }
    return chartPoints;
  }, [metricsData]);

  const { nodeDataBySkill } = useSkillprintVisualizationData(processedProfile);
  const skillsCount = Object.keys(nodeDataBySkill).length;
  const daysPlayed = processedProfile ? processedProfile.totalSessions || 0 : 0;

  const userScores = React.useMemo(() => {
    const s: Record<string, number> = {};
    if (!processedProfile) return s;
    const processCategory = (category: any) => {
      if (!category) return;
      Object.entries(category).forEach(([key, val]: [string, any]) => {
        let avg = val.avg_score ?? val.avgScore ?? val.score ?? 0;
        if (avg <= 1 && avg > 0) avg *= 100; // scale 0-1 to 0-100 if necessary
        s[key.toLowerCase().replace(/_/g, '-')] = avg;
      });
    };
    processCategory(processedProfile.skills);
    processCategory(processedProfile.moods);
    processCategory(processedProfile.personality);
    return s;
  }, [processedProfile]);

  const mappedSessions = sessions.map((s: any) => ({
    id: s.id,
    gameSlug: s.gameSlug,
    gameName: s.gameSlug ? (getGameDetails(s.gameSlug)?.name || s.gameSlug) : 'Unknown',
    gameImage: s.gameSlug ? getGameDetails(s.gameSlug)?.image : undefined,
    date: s.timestamp,
    score: s.score || 0,
    skillMeasured: s.metadata?.skill || s.metadata?.mood || s.parameters?.skill || s.parameters?.mood || 'Unknown'
  }));

  return (
    <PortalLayout 
      pageClass="page--portal-profile"
      header={<ProfileHeader />}
      rail={
        <ProfileRail 
          skillsCount={skillsCount} 
          totalSkills={28} 
          daysPlayed={daysPlayed} 
          sessions={mappedSessions} 
        />
      }
    >
      <PortalSection ariaLabelledBy="profile-skills-breakdown">
        <ProfileSkillsSection scores={userScores} />
      </PortalSection>
      
      <ProfileSkillprintWheel />
      <ProfilePerformanceTrends />

      <ProfileGameInsights 
        uniqueGames={uniqueGames}
        selectedGames={selectedGames}
        setSelectedGames={setSelectedGames}
        isMetricsLoading={isMetricsLoading}
        metricsData={metricsData}
        parsedChartData={parsedChartData}
        formatSecondsToDuration={formatSecondsToDuration}
      />

      <ProfileGoals 
        goalSkills={goalSkills}
        goalMoods={goalMoods}
        isGoalsLoading={isGoalsLoading}
        isSavingSkills={isSavingSkills}
        isSavingMoods={isSavingMoods}
        saveSkills={saveSkills}
        saveMoods={saveMoods}
        availableSkills={AVAILABLE_SKILLS}
        availableMoods={AVAILABLE_MOODS}
      />

      <ProfileBadges />

      <ProfileSessions sessions={mappedSessions} />
    </PortalLayout>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={<div>Loading profile...</div>}>
      <ProfilePageContent />
    </React.Suspense>
  );
}
