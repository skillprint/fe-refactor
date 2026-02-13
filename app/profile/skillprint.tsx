'use client';

import { useState, useEffect } from 'react';
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

export default function Skillprint() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [skills, setSkills] = useState<Skill[]>(sampleSkills);
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { count, isLoaded, markViewed, profileViewed } = useGameSessions();
  const { fetchUserProfile } = useUserProfile();

  useEffect(() => {
    if (isLoaded && count >= 3 && !profileViewed) {
      markViewed();
    }
  }, [isLoaded, count, markViewed, profileViewed]);

  const userSkills = skills.map(s => s.name);
  const hasScoreBySkill = skills.reduce((acc, s) => ({ ...acc, [s.name]: true }), {});

  // Example moods since none are in state currently
  const userMoods = ['Innovate', 'Relax', 'Focus', 'Collaborate'];
  const hasScoreByMood = userMoods.reduce((acc, m) => ({ ...acc, [m]: true }), {});

  useEffect(() => {
    // Load settings from cookies

    setUserId(getCookie('user_id') || '');
    setApiKey(getCookie('api_key') || '');
  }, []);

  const handleSkillClick = (skillName: string) => {
    // Navigate to skill detail page with the skill name as a parameter
    router.push(`/profile/skill/${encodeURIComponent(skillName)}`);
  };


  return (
    <div className="font-sans min-h-screen bg-background">
      <TopNav />
      {/* <ProgressBanner /> */}
      <div className="p-8 pb-32">
        <h1 className="text-3xl font-bold text-foreground mb-6">
          Your Skillprint
        </h1>
        {!isLoaded ? (
          <div className="flex justify-center py-20">
            <BuckyballLoading />
          </div>
        ) : count < 3 ? (
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
                    <p className="text-muted-foreground text-sm mb-3">
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
                size={600}
              />
            </div>

            <div className="py-6">
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
        <div className="mt-8">
          <GameSessionManager />
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Settings
          </h2>
          <div className="bg-card rounded-lg shadow p-6 space-y-6">
            {/* API Configuration */}
            <div className="space-y-4 border-b border-border pb-6">
              <h3 className="text-lg font-medium text-foreground">
                API Configuration
              </h3>
              <div className="grid gap-4">
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
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-input'
                  }`}
              >
                <span className="sr-only">Enable dark mode</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
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
          </div>
        </div>
      </div>
    </div>
  );
}