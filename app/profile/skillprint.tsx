'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '../components/TopNav';
import ProgressBanner from '../components/ProgressBanner';
import toast from 'react-hot-toast';
import { useTheme } from '../components/ThemeProvider';
import { GameSessionManager } from '../components/GameSessionManager';
import { useGameSessions } from '../hooks/useGameSessions';
import { useUserProfile } from '../hooks/useUserProfile';
import BuckyballLoading from '../components/BuckyballLoading';
import SkillprintVisualization from '../components/Skillprint';
import FirstGameBadge from '../components/FirstGameBadge';
import { knownGameSlugs } from '../config/gameConfig';
import { useGoal, GOAL_OPTIONS } from '../hooks/useGoal';
import { useAuth } from '../context/AuthContext';
import { useUserSession } from '../hooks/useUserSession';
import { useVisualizeMoodProfile } from '../hooks/useVisualizeMoodProfile';
import { useVisualizeSkillProfile } from '../hooks/useVisualizeSkillProfile';
import { useSkillprintVisualizationData } from '../hooks/useSkillprintVisualizationData';
import DynamicChart from '../visualize/components/DynamicChart';
import { generateSyntheticData, DataPoint } from '../visualize/utils/syntheticData';


interface Skill {
  id: string;
  name: string;
  level: number;
  category: string;
  color: string;
}

const sampleSkills: Skill[] = [
  { id: '1', name: 'Problem Solving', level: 85, category: 'Cognitive', color: '#3B82F6' },
  { id: '2', name: 'Memory', level: 78, category: 'Cognitive', color: '#10B981' },
  { id: '3', name: 'Speed', level: 92, category: 'Cognitive', color: '#F59E0B' },
  { id: '4', name: 'Accuracy', level: 88, category: 'Cognitive', color: '#EF4444' },
  { id: '5', name: 'Pattern Recognition', level: 76, category: 'Cognitive', color: '#8B5CF6' },
  { id: '6', name: 'Spatial Awareness', level: 82, category: 'Cognitive', color: '#06B6D4' },
  { id: '7', name: 'Logic', level: 89, category: 'Cognitive', color: '#84CC16' },
  { id: '8', name: 'Creativity', level: 71, category: 'Cognitive', color: '#F97316' },
];

export const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

export const updateSetting = (name: string, value: string, setter: (val: string) => void) => {
  setter(value);
  // Set cookie with 1 year expiration
  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

export const queryParamDebug = (): boolean => {
  // check query string
  if (typeof window === 'undefined') {
    return false;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const debug = searchParams.get('debug') === 'true';
  return debug;
}

export default function Skillprint() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [skills, setSkills] = useState<Skill[]>(sampleSkills);
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { count, isLoaded, markViewed, profileViewed } = useGameSessions();
  const { fetchUserProfile, profile, isLoading, error } = useUserProfile();
  const [processedProfile, setProcessedProfile] = useState<any>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [nextGameSlug, setNextGameSlug] = useState<string>('');
  const { goal, setGoal } = useGoal();
  const { logout } = useAuth();
  const { userToken, userId: sessionUserId, isWhitelisted } = useUserSession();
  const { nodeDataBySkill, hasScoreBySkill, nodeDataByMood, hasScoreByMood, nodeDataMap, skillProfile } = useSkillprintVisualizationData(processedProfile);

  const [comparePeriods, setComparePeriods] = useState<number>(1);
  const [chartType, setChartType] = useState<'BarLine' | 'Area'>('BarLine');
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const data = generateSyntheticData({
      modelName: 'MoodData',
      selectedFields: ['focus'],
      chartType: chartType,
      startDate: start,
      endDate: end,
      comparePeriods: comparePeriods,
      compareCohort: false
    });
    setChartData(data);
  }, [comparePeriods, chartType]);

  const isDebug = queryParamDebug();

  const MOOD_COLORS: Record<string, string> = {
    focus: '#8F48F1', relax: '#10B981', innovate: '#F59E0B', collaborate: '#3B82F6',
  };

  useEffect(() => {
    if (profile && profile.results && profile.results.length > 0) {
      console.log('Processing profile:', profile);
      const p = profile.results[0];
      const history = p.flowScoreHistory || [];
      const latestMoodsMap = new Map();
      history.forEach((entry: any) => {
        const mood = entry.targetMood;
        const current = latestMoodsMap.get(mood);
        if (!current || new Date(entry.timestamp) > new Date(current.timestamp)) {
          latestMoodsMap.set(mood, entry);
        }
      });
      setProcessedProfile({ ...p, latestMoods: Array.from(latestMoodsMap.values()) });
    }
  }, [profile]);

  useEffect(() => {
    // If skillProfile.yearlySummary exists, it can be an object or an array. Use it to build the skills list.
    if (skillProfile?.yearlySummary) {
      let newSkills: Skill[] = [];
      const summary = skillProfile.yearlySummary;

      if (Array.isArray(summary)) {
        newSkills = summary.map((item: any, i: number) => {
          const name = item.skill || item.mood || `Skill ${i}`;
          const level = typeof item.progress === 'number' ? item.progress : (Math.round((item.score || 0) * 100) || 0);
          return {
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
            level: level,
            category: 'Cognitive',
            color: MOOD_COLORS[name.toLowerCase()] || sampleSkills[i % sampleSkills.length].color
          };
        });
      } else {
        newSkills = Object.entries(summary).map(([name, details]: [string, any], i: number) => {
          return {
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
            level: typeof details.progress === 'number' ? details.progress : 0,
            category: 'Cognitive',
            color: MOOD_COLORS[name.toLowerCase()] || sampleSkills[i % sampleSkills.length].color
          };
        });
      }

      if (newSkills.length > 0) {
        setSkills(newSkills);
        return;
      }
    }

    // Fallback: If no skillProfile but processedProfile has latestMoods
    if (processedProfile?.latestMoods) {
      const moods = processedProfile.latestMoods.filter((m: any) => m && m.targetMood);
      if (moods.length > 0) {
        setSkills(moods.map((m: any) => ({
          id: m.targetMood,
          name: m.targetMood.charAt(0).toUpperCase() + m.targetMood.slice(1),
          level: Math.round((m.score || 0) * 100) || 0,
          category: 'Mindset',
          color: MOOD_COLORS[m.targetMood.toLowerCase()] || '#8F48F1'
        })));
      }
    }
  }, [skillProfile, processedProfile]);

  useEffect(() => {
    if (isLoaded && count >= 3 && !profileViewed) {
      markViewed();
    }
  }, [isLoaded, count, markViewed, profileViewed]);

  const userSkills = sampleSkills.map(s => s.name);
  const userMoods = ['Innovate', 'Relax', 'Focus', 'Collaborate'];

  useEffect(() => {
    // Load settings from cookies
    setUserId(getCookie('user_id') || '');
    setApiKey(getCookie('api_key') || '');
  }, []);

  const formatDuration = (timeStr: string) => {
    if (!timeStr) return '0h 0m';
    try {
      // Format "00:00:00.107634" -> "0h 0m" or similar
      // If it is just seconds? The sample is "00:00:00.107634".
      const [h, m] = timeStr.split(':');
      if (parseInt(h) === 0 && parseInt(m) === 0) {
        return '< 1m';
      }
      return `${parseInt(h)}h ${parseInt(m)}m`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleSkillClick = (skillName: string) => {
    // Navigate to skill detail page with the skill name as a parameter
    router.push(`/profile/skill/${encodeURIComponent(skillName)}`);
  };

  const handleTestBadge = () => {
    const randomGame = knownGameSlugs[Math.floor(Math.random() * knownGameSlugs.length)];
    setNextGameSlug(randomGame);
    setShowBadge(true);
  };


  return (
    <div className="font-sans min-h-screen bg-background">
      <TopNav />
      {/* <ProgressBanner /> */}
      <div className="p-8 pb-32 max-w-[1440px] w-full mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Your Skillprint
        </h1>
        {!isLoaded ? (
          <div className="flex justify-center py-20">
            <BuckyballLoading />
          </div>
        ) : ((count < 3 && !isWhitelisted) && !processedProfile) ? (
          <div className="bg-card rounded-lg shadow p-8 text-center border border-border mb-8">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Your Skillprint</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Play at least 3 games to reveal your unique cognitive profile and skill breakdown.
            </p>

            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`h-2 w-16 rounded-full ${count >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
              <div className={`h-2 w-16 rounded-full ${count >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
              <div className={`h-2 w-16 rounded-full ${count >= 3 ? 'bg-primary' : 'bg-secondary'}`} />
              <span className="ml-2 text-sm font-medium text-foreground">{count}/3 Played</span>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Link
                href="/game/hextris/interstitial"
                className="block group w-full max-w-xs text-left transition-transform hover:scale-105 duration-300"
              >
                <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-32 bg-gradient-to-br from-orange-500 to-red-500 relative flex items-center justify-center">
                    <span className="text-5xl">⚡</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                      <div className="bg-card/90 rounded-full p-3">
                        <svg className="w-8 h-8 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      Hextris
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2 min-h-[40px] h-[40px]">
                      Rotate and match hexagons
                    </p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Play Now
                      <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              <button
                onClick={() => router.push('/games?tab=moods')}
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors flex items-center gap-1"
              >
                Explore more games to improve your mood!
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg">
              <SkillprintVisualization
                userSkills={userSkills}
                userMoods={userMoods}
                hasScoreBySkill={hasScoreBySkill}
                hasScoreByMood={hasScoreByMood}
                nodeDataMap={nodeDataMap}
                size={600}
              />
            </div>

            {/* Stats Section */}
            {processedProfile && (
              <div className="grid grid-cols-3 gap-4 my-8">
                <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                  <div className="text-2xl font-bold text-primary">
                    {processedProfile.totalSessions}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Total Sessions
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                  <div className="text-2xl font-bold text-primary">
                    {formatDuration(processedProfile.totalTimePlayed)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Time Played
                  </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border text-center shadow-sm">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(processedProfile.avgFlowScore * 100)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">
                    Avg Flow Score
                  </div>
                </div>
              </div>
            )}

            <div className="py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Performance Trends
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Segmented Chart Type Toggle */}
                  <div className="flex items-center bg-secondary/50 p-1 rounded-full border border-border shadow-inner">
                    <button
                      onClick={() => setChartType('BarLine')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                        chartType === 'BarLine'
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Bar & Lines
                    </button>
                    <button
                      onClick={() => setChartType('Area')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                        chartType === 'Area'
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Area Chart
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-muted-foreground">Compare:</label>
                    <select
                      value={comparePeriods}
                      onChange={(e) => setComparePeriods(parseInt(e.target.value, 10))}
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value={0}>None</option>
                      <option value={1}>Last Week</option>
                      <option value={2}>Last 2 Weeks</option>
                      <option value={3}>Last 3 Weeks</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 shadow-sm h-[350px] mb-8">
                <DynamicChart
                  data={chartData}
                  type={chartType}
                  selectedFields={['focus']}
                  comparePeriods={comparePeriods}
                  compareCohort={false}
                />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-4">
                Skill Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    onClick={() => handleSkillClick(skill.name)}
                    className="flex items-center justify-between p-3 bg-card rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: skill.color }}
                      />
                      <span className="text-foreground font-medium">
                        {skill.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${skill.level}%`,
                            backgroundColor: skill.color,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {skill.level}%
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Badges Section */}
        {/* <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Achievements
            </h2>
            <button
              onClick={() => router.push('/badges')}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div
            onClick={() => router.push('/badges')}
            className="bg-card rounded-lg shadow p-4 cursor-pointer hover:bg-secondary transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">🏆</div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-lg">🧠</div>
                <div className="inline-block h-10 w-10 rounded-full ring-2 ring-card bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-lg">⚡</div>
              </div>
              <div className="flex-1">
                <p className="text-foreground font-medium">4 Badges Earned</p>
                <p className="text-sm text-muted-foreground">Latest: Consistent</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div> */}

        {/* Game Sessions Section */}
        {isDebug && (
          <div className="mt-8">
            <GameSessionManager />
          </div>
        )}

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Settings
          </h2>
          <div className="bg-card rounded-lg shadow p-6 space-y-6">
            {/* API Configuration */}

            <div className="space-y-4 border-b border-border pb-6">
              {isDebug && (

                <h3 className="text-lg font-medium text-foreground">
                  API Configuration
                </h3>
              )}
              <div className="grid gap-4">
                {isDebug && (
                  <div>
                    <label htmlFor="user_id" className="block text-sm font-medium text-muted-foreground mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      id="user_id"
                      value={userId}
                      onChange={(e) => updateSetting('user_id', e.target.value, setUserId)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter User ID"
                    />
                  </div>
                )}
                {isDebug && (
                  <div>
                    <label htmlFor="api_key" className="block text-sm font-medium text-muted-foreground mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      id="api_key"
                      value={apiKey}
                      onChange={(e) => updateSetting('api_key', e.target.value, setApiKey)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter API Key"
                    />
                  </div>
                )}

                {/* Goal Setting */}
                <div className="border-b border-border pb-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">
                    My Goal
                  </h3>
                  <div className="grid gap-3">
                    {GOAL_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setGoal(option.id)}
                        className={`p-4 rounded-xl text-left transition-all duration-200 border ${goal === option.id
                          ? 'bg-primary/20 border-primary shadow-sm'
                          : 'bg-card border-input hover:bg-secondary/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${goal === option.id ? 'text-primary' : 'text-foreground'}`}>
                            {option.title}
                          </h4>
                          {goal === option.id && (
                            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                              Active
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            {isDebug && (
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Appearance
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize your interface theme
                  </p>
                </div>
                <div className="relative">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="appearance-none bg-secondary text-foreground px-4 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="midnight">Midnight</option>
                    <option value="skillprint">Skillprint</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {isDebug && (
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Reset First-Time Experience
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clear all first-time user experience flags to see the welcome carousel again
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Delete the FTUE cookie
                    document.cookie = 'ftue_completed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    // delete the first badge cookie
                    document.cookie = 'first_game_badge_seen=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    // Show confirmation
                    toast.success('Settings reset! Refresh the page to see the welcome experience again.');
                  }}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                  Reset
                </button>
              </div>
            )}
            {isDebug && (
              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Debug Profile
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fetch profile data to console
                  </p>
                </div>
                <button
                  onClick={() => {
                    toast.promise(fetchUserProfile(), {
                      loading: 'Fetching profile...',
                      success: 'Check console for profile data!',
                      error: 'Failed to fetch profile',
                    });
                  }}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                  Fetch Data
                </button>
              </div>
            )}
            {isDebug && (
              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Test First Game Badge
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show the "First Game Played" popup
                  </p>
                </div>
                <button
                  onClick={handleTestBadge}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                  Test Popup
                </button>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <h3 className="text-lg font-medium text-foreground text-destructive">
                  Logout
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  End your current session
                </p>

                <p className="text-xs text-muted-foreground opacity-60 mt-2 font-mono break-all max-w-[200px]">
                  ID: {sessionUserId || 'none'}<br />
                  Token: {userToken ? `${userToken.substring(0, 16)}...` : 'none'}
                </p>
              </div>
              <button
                onClick={logout}
                className="px-6 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {showBadge && (
        <FirstGameBadge onDismiss={() => setShowBadge(false)} nextGameSlug={nextGameSlug} />
      )}
    </div>
  );
}