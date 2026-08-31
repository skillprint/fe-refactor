'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import { GameSessionManager } from '../components/GameSessionManager';
import { useGameSessions } from '../hooks/useGameSessions';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSkillprintVisualizationData } from '../hooks/useSkillprintVisualizationData';
import { useGoalSetting, AVAILABLE_SKILLS, AVAILABLE_MOODS } from '../hooks/useGoalSetting';
import { useGameMetrics } from '../hooks/useGameMetrics';
import { useGamesBySkill } from '../hooks/useGamesBySkill';
import BuckyballLoading from '../components/BuckyballLoading';

import ProfilePrint from '@/components/Profile/ProfilePrint';
import ProfilePerformanceTrends from '../components/ProfilePerformanceTrends';
import ProfileGameInsights from '@/components/Profile/ProfileGameInsights';
import ProfileGoals from '@/components/Profile/ProfileGoals';
import ProfileBadges from '@/components/Profile/ProfileBadges';
import ProfileSessions from '@/components/Profile/ProfileSessions';
import ProfileRail from '@/components/Profile/ProfileRail';

// Helper to format duration
function formatSecondsToDuration(sec: number): string {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Skillprint() {
  const router = useRouter();

  const { count, isLoaded, markViewed, profileViewed, sessions } = useGameSessions();
  const { fetchUserProfile, profile, isLoading, error } = useUserProfile();
  const [processedProfile, setProcessedProfile] = useState<any>(null);

  // Goal Setting
  const {
    goalSkills,
    goalMoods,
    isLoading: isGoalsLoading,
    isSavingSkills,
    isSavingMoods,
    saveSkills,
    saveMoods,
  } = useGoalSetting();

  const { gamesBySkill, gamesByMood } = useGamesBySkill();
  // We don't have gamesByMood exported from anywhere yet, so we just use gamesBySkill for uniqueGames for now
  const uniqueGames = React.useMemo(() => {
    const seen = new Set();
    const result: any[] = [];
    for (const g of [...(gamesByMood || []), ...(gamesBySkill || [])]) {
      if (g && g.slug && !seen.has(g.slug)) {
        seen.add(g.slug);
        result.push(g);
      }
    }
    return result;
  }, [gamesBySkill, gamesByMood]);

  const [selectedGames, setSelectedGames] = useState<string[]>([]);

  useEffect(() => {
    if (uniqueGames.length > 0 && selectedGames.length === 0) {
      setSelectedGames([uniqueGames[0].slug]);
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

  useEffect(() => {
    fetchUserProfile().then(data => {
      if (data) {
        setProcessedProfile(data.processedProfile);
      }
    });
  }, [fetchUserProfile]);

  const { nodeDataBySkill, hasScoreBySkill, nodeDataByMood, hasScoreByMood, nodeDataMap, skillProfile } = useSkillprintVisualizationData(processedProfile);

  const userSkills = Object.keys(nodeDataBySkill);
  const userMoods = Object.keys(nodeDataByMood);

  const hasData = processedProfile && (
    (processedProfile.skills && Object.keys(processedProfile.skills).length > 0) ||
    (processedProfile.moods && Object.keys(processedProfile.moods).length > 0) ||
    (processedProfile.traits && Object.keys(processedProfile.traits).length > 0)
  );

  // Calculate some stats for the Rail
  const skillsCount = userSkills.length;
  const totalSkills = 87; // from reference
  const daysPlayed = processedProfile ? processedProfile.totalSessions || 0 : 0;

  return (
    <PortalLayout pageClass="page--portal-profile">
      <GameSessionManager />
      
      <div className="portal-layout__main">
        <PortalHead
          eyebrow="Profile"
          title="Your Skillprint"
          description="Everything the games you've played have revealed about your skills, mindset, and traits."
          actions={
            <div className="cluster gap-md wrap justify-start md:justify-end">
              <a href="/profile/embed" className="button button--secondary">
                <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24"><use href="#ti-share"></use></svg>
                <span>Embed card</span>
              </a>
            </div>
          }
        />

        {!hasData ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <BuckyballLoading />
            <p className="mt-4 text-muted">Play games to discover your Skillprint</p>
          </div>
        ) : (
          <>
            <ProfilePrint 
              userSkills={userSkills}
              userMoods={userMoods}
              hasScoreBySkill={hasScoreBySkill}
              hasScoreByMood={hasScoreByMood}
              nodeDataMap={nodeDataMap}
              processedProfile={processedProfile}
              formatDuration={formatSecondsToDuration}
            />

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

            <ProfileBadges />

            <ProfileSessions sessions={sessions.map((s: any) => ({
              id: s.id,
              gameSlug: s.gameSlug || s.gameId,
              gameName: s.gameSlug || s.gameId,
              date: s.startedAt,
              score: s.score || 0,
              skillMeasured: s.parameters?.skill || s.parameters?.mood || 'Unknown',
              duration: s.duration_seconds ? formatSecondsToDuration(s.duration_seconds) : '0:00'
            }))} />

            <ProfileGoals 
              goalSkills={goalSkills}
              goalMoods={goalMoods}
              isGoalsLoading={isGoalsLoading}
              isSavingSkills={isSavingSkills}
              isSavingMoods={isSavingMoods}
              saveSkills={saveSkills}
              saveMoods={saveMoods}
              availableSkills={AVAILABLE_SKILLS as any}
              availableMoods={AVAILABLE_MOODS as any}
            />
          </>
        )}
      </div>

      <div className="portal-rail">
        <ProfileRail 
          skillsCount={skillsCount}
          totalSkills={totalSkills}
          daysPlayed={daysPlayed}
          sessions={sessions.map((s: any) => ({
            id: s.id,
            gameSlug: s.gameSlug || s.gameId,
            gameName: s.gameSlug || s.gameId,
            date: s.startedAt,
            score: s.score || 0,
            skillMeasured: s.parameters?.skill || s.parameters?.mood || 'Unknown',
            duration: s.duration_seconds ? formatSecondsToDuration(s.duration_seconds) : '0:00'
          }))}
        />
      </div>

    </PortalLayout>
  );
}