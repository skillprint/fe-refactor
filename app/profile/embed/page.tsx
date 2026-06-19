'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SkillprintClient } from '../../lib/skillprintSdk';
import { getVisualizeMoodProfile, getVisualizeSkillProfile } from '../../api/api';
import SkillprintVisualization from '../../components/Skillprint';
import BuckyballLoading from '../../components/BuckyballLoading';
import { getApiBaseUrl } from '../../utils/cookieUtils';

const USER_SKILLS = [
  'Problem Solving',
  'Memory',
  'Speed',
  'Accuracy',
  'Pattern Recognition',
  'Spatial Awareness',
  'Logic',
  'Creativity'
];

const USER_MOODS = ['Innovate', 'Relax', 'Focus', 'Collaborate'];

function EmbedProfileContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [visualizationData, setVisualizationData] = useState<{
    hasScoreBySkill: { [key: string]: boolean };
    hasScoreByMood: { [key: string]: boolean };
    nodeDataMap: { [key: string]: any };
  } | null>(null);

  const [size, setSize] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize listener to capture dimensions and compute the largest possible square
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const squareSize = Math.min(width, height);
        if (squareSize > 0) {
          setSize(squareSize);
        }
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const userTokenParam = searchParams.get('userToken');
  const userIdParam = searchParams.get('userId');
  const apiKeyParam = searchParams.get('apiKey');

  // Fetch token and profile data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      console.log('loadData started. userTokenParam:', userTokenParam, 'userIdParam:', userIdParam, 'apiKeyParam:', apiKeyParam);
      setIsLoading(true);
      setError(null);

      const apiKey = apiKeyParam || process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
      const baseUrl = getApiBaseUrl();

      if (!userTokenParam && !userIdParam) {
        console.warn('Authentication parameters are missing from URL.');
        setError(new Error('Missing authentication parameters. Please provide either "userToken" or "userId" in the URL query parameters.'));
        setIsLoading(false);
        return;
      }

      try {
        let finalToken = userTokenParam;

        const client = new SkillprintClient({
          apiKey: apiKey,
          baseUrl: baseUrl,
          logger: (msg, level) => {
            console.log(`[Embed Profile SDK] [${level}] ${msg}`);
          }
        });

        // 1. Resolve user token from userId if token not provided directly
        if (!finalToken && userIdParam) {
          console.log('Resolving userToken for userId via SDK...', userIdParam);
          const token = await client.createOrGetUserToken(userIdParam);
          console.log('Token resolved:', token);
          if (!token) {
            throw new Error('Failed to retrieve or create user token for the provided userId.');
          }
          finalToken = token;
        }

        if (!finalToken) {
          throw new Error('Failed to resolve user token.');
        }

        // Configure client with userToken
        client.setUserToken(finalToken);

        // 2. Fetch profiles. Only client.getUserProfile() is core/blocking.
        console.log('Fetching core profile from SDK using token:', finalToken);
        let profileResponse = null;
        try {
          profileResponse = await client.getUserProfile();
          console.log('Core profile fetched successfully:', profileResponse);
        } catch (e) {
          console.error('Blocking error: Failed to fetch core user profile:', e);
          throw e; // Rethrow to show the calm error display for core failures
        }

        console.log('Fetching optional mood profile...');
        let moodProfile = null;
        try {
          moodProfile = await getVisualizeMoodProfile(finalToken, apiKey);
          console.log('Optional mood profile fetched successfully:', moodProfile);
        } catch (e) {
          console.warn('Non-blocking: Failed to fetch mood visualization profile:', e);
        }

        console.log('Fetching optional skill profile...');
        let skillProfile = null;
        try {
          skillProfile = await getVisualizeSkillProfile(finalToken, apiKey);
          console.log('Optional skill profile fetched successfully:', skillProfile);
        } catch (e) {
          console.warn('Non-blocking: Failed to fetch skill visualization profile:', e);
        }

        console.log('Checking component mount state. isMounted =', isMounted);
        if (!isMounted) {
          console.warn('Component was unmounted before state could be set.');
          return;
        }

        // Process profile response history to obtain latest moods (matching skillprint.tsx layout)
        let processedProfile: any = null;
        if (profileResponse && profileResponse.results && profileResponse.results.length > 0) {
          const p = profileResponse.results[0];
          const history = p.flowScoreHistory || [];
          const latestMoodsMap = new Map();
          history.forEach((entry: any) => {
            const mood = entry.targetMood;
            const current = latestMoodsMap.get(mood);
            if (!current || new Date(entry.timestamp) > new Date(current.timestamp)) {
              latestMoodsMap.set(mood, entry);
            }
          });
          processedProfile = { ...p, latestMoods: Array.from(latestMoodsMap.values()) };
        }

        // Map data using visualization parsing rules
        const hasScoreBySkill: { [key: string]: boolean } = {};
        const nodeDataBySkill: { [key: string]: any } = {};

        if (skillProfile?.yearlySummary && Array.isArray(skillProfile.yearlySummary)) {
          skillProfile.yearlySummary.forEach((item: any) => {
            const skillKey = item.skill || item.mood;
            if (typeof skillKey === 'string') {
              const capitalizedSkill = skillKey.charAt(0).toUpperCase() + skillKey.slice(1);
              nodeDataBySkill[capitalizedSkill] = {
                yearly: item,
                weekly: Array.isArray(skillProfile.weeklySessions) ? skillProfile.weeklySessions : [],
              };
              nodeDataBySkill[skillKey.toLowerCase()] = nodeDataBySkill[capitalizedSkill];
              hasScoreBySkill[capitalizedSkill] = true;
              hasScoreBySkill[skillKey.toLowerCase()] = true;
            }
          });
        }

        if (skillProfile?.currentSession) {
          const key = skillProfile.currentSession.skill || skillProfile.currentSession.targetMood;
          if (key && typeof key === 'string') {
            const capitalizedSkill = key.charAt(0).toUpperCase() + key.slice(1);
            if (!nodeDataBySkill[capitalizedSkill]) {
              nodeDataBySkill[capitalizedSkill] = { yearly: null, weekly: [], current: skillProfile.currentSession };
              nodeDataBySkill[key.toLowerCase()] = nodeDataBySkill[capitalizedSkill];
              hasScoreBySkill[capitalizedSkill] = true;
              hasScoreBySkill[key.toLowerCase()] = true;
            } else {
              nodeDataBySkill[capitalizedSkill].current = skillProfile.currentSession;
              nodeDataBySkill[key.toLowerCase()].current = skillProfile.currentSession;
            }
          }
        }

        const hasScoreByMood: { [key: string]: boolean } = {};
        const nodeDataByMood: { [key: string]: any } = {};

        if (processedProfile?.latestMoods) {
          processedProfile.latestMoods.forEach((m: any) => {
            if (!m || !m.targetMood) return;
            hasScoreByMood[m.targetMood.charAt(0).toUpperCase() + m.targetMood.slice(1)] = true;
            hasScoreByMood[m.targetMood.toLowerCase()] = true;
          });
        }

        if (moodProfile?.yearlySummary && Array.isArray(moodProfile.yearlySummary)) {
          moodProfile.yearlySummary.forEach((item: any) => {
            const moodKey = item.mood;
            if (typeof moodKey === 'string') {
              const capitalizedMood = moodKey.charAt(0).toUpperCase() + moodKey.slice(1);
              nodeDataByMood[capitalizedMood] = {
                yearly: item,
                weekly: Array.isArray(moodProfile.weeklySessions) ? moodProfile.weeklySessions : [],
              };
              nodeDataByMood[moodKey.toLowerCase()] = nodeDataByMood[capitalizedMood];
              hasScoreByMood[capitalizedMood] = true;
              hasScoreByMood[moodKey.toLowerCase()] = true;
            }
          });
        }

        if (moodProfile?.currentSession) {
          const key = moodProfile.currentSession.mood || moodProfile.currentSession.targetMood;
          if (key && typeof key === 'string') {
            const capitalizedMood = key.charAt(0).toUpperCase() + key.slice(1);
            if (!nodeDataByMood[capitalizedMood]) {
              nodeDataByMood[capitalizedMood] = { yearly: null, weekly: [], current: moodProfile.currentSession };
              nodeDataByMood[key.toLowerCase()] = nodeDataByMood[capitalizedMood];
              hasScoreByMood[capitalizedMood] = true;
              hasScoreByMood[key.toLowerCase()] = true;
            } else {
              nodeDataByMood[capitalizedMood].current = moodProfile.currentSession;
              nodeDataByMood[key.toLowerCase()].current = moodProfile.currentSession;
            }
          }
        }

        console.log(hasScoreBySkill, hasScoreByMood, nodeDataBySkill, nodeDataByMood, "TEST 2");

        setVisualizationData({
          hasScoreBySkill,
          hasScoreByMood,
          nodeDataMap: { ...nodeDataBySkill, ...nodeDataByMood }
        });
      } catch (err: any) {
        console.error('Failed to load embed profile data:', err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userTokenParam, userIdParam, apiKeyParam]);

  console.log(error, visualizationData, "TEST");

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex items-center justify-center overflow-hidden bg-transparent m-0 p-0"
    >
      {isLoading ? (
        <BuckyballLoading />
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm bg-card rounded-2xl border border-border/85 shadow-lg animate-in fade-in zoom-in duration-300 mx-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-3xl mb-4 animate-pulse">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Unable to load profile</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {error.message || 'We ran into an unexpected issue while fetching the Skillprint visualization.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-sm rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
        </div>
      ) : visualizationData && size > 0 ? (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center relative animate-in fade-in duration-500"
        >
          <SkillprintVisualization
            userSkills={USER_SKILLS}
            userMoods={USER_MOODS}
            hasScoreBySkill={visualizationData.hasScoreBySkill}
            hasScoreByMood={visualizationData.hasScoreByMood}
            nodeDataMap={visualizationData.nodeDataMap}
            size={size}
            useSizeDirectly={true}
          />
        </div>
      ) : (
        <BuckyballLoading />
      )}
    </div>
  );
}

export default function ProfileEmbedPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center w-screen h-screen bg-transparent">
        <BuckyballLoading />
      </div>
    }>
      <EmbedProfileContent />
    </Suspense>
  );
}
