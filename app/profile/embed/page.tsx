'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SkillprintClient } from '../../lib/skillprintSdk';
import SkillprintVisualization from '../../components/Skillprint';
import spBaseState from '../../components/Skillprint/spData';
import BuckyballLoading from '../../components/BuckyballLoading';
import { getApiBaseUrl } from '../../utils/cookieUtils';
import EmbedCard from '@/components/Profile/EmbedCard';
import { portalFetch } from '@/lib/models/portal/portalFetch';
import { HomeSummary, generateMockHomeSummary } from '@/lib/models/portal/HomeSummary';
import { HomeJustPlayed, generateMockHomeJustPlayed } from '@/lib/models/portal/HomeJustPlayed';
import { PaginatedSession, generateMockPaginatedSession } from '@/lib/models/portal/PaginatedSession';
import { ProfileAggregate, generateMockProfileAggregate } from '@/lib/models/portal/ProfileAggregate';
import { ProfileTrendsResponse, generateMockProfileTrends } from '@/lib/models/portal/ProfileTrends';
import { TaxonomySkillsResponse, generateMockTaxonomySkills } from '@/lib/models/portal/TaxonomySkills';
import { buildEmbedData, EmbedData } from './buildEmbedData';

/** How many skill / mood nodes the static graph can label. */
const GRAPH_SLOTS = {
  skills: spBaseState.spAttrs.filter((a) => a.group === 'skills').length,
  moods: spBaseState.spAttrs.filter((a) => a.group === 'mindsets').length,
};

/** Optional fetch: a failure (or an empty body) leaves the slot null. */
function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

function EmbedProfileContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [embed, setEmbed] = useState<EmbedData | null>(null);

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
  }, [embed]);

  const userTokenParam = searchParams.get('userToken');
  const userIdParam = searchParams.get('userId');
  const apiKeyParam = searchParams.get('apiKey');
  // Dev-only: render the card from the portal mock payloads (same convention as /dev/game-result).
  const synthetic = process.env.NODE_ENV !== 'production' && searchParams.get('synthetic') === '1';

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      if (synthetic) {
        setEmbed(buildEmbedData({
          profile: generateMockProfileAggregate(),
          summary: generateMockHomeSummary(),
          sessions: generateMockPaginatedSession(),
          justPlayed: generateMockHomeJustPlayed(),
          trends: generateMockProfileTrends(),
          taxonomy: generateMockTaxonomySkills(),
          graphSlots: GRAPH_SLOTS,
        }));
        setIsLoading(false);
        return;
      }

      const apiKey = apiKeyParam || process.env.NEXT_PUBLIC_API_KEY || '';

      if (!userTokenParam && !userIdParam) {
        setError(new Error('Missing authentication parameters. Please provide either "userToken" or "userId" in the URL query parameters.'));
        setIsLoading(false);
        return;
      }

      try {
        // 1. Resolve a Knox token: either passed directly, or minted for the partner's user id.
        let token = userTokenParam;
        if (!token && userIdParam) {
          const client = new SkillprintClient({ apiKey, baseUrl: getApiBaseUrl() });
          token = await client.createOrGetUserToken(userIdParam);
        }
        if (!token) {
          throw new Error('Failed to resolve user token.');
        }

        // 2. Portal reads. Only the lifetime profile is required; the rest degrade to placeholders.
        const [profile, summary, sessions, justPlayed, trends, taxonomy] = await Promise.allSettled([
          portalFetch<ProfileAggregate>('/profile/', token),
          portalFetch<HomeSummary>('/home/summary/', token),
          portalFetch<PaginatedSession>('/sessions/?limit=50', token),
          portalFetch<HomeJustPlayed>('/home/just-played/', token),
          portalFetch<ProfileTrendsResponse>('/profile/trends/?period=weekly&points=2', token),
          portalFetch<TaxonomySkillsResponse>('/taxonomy/skills/', token),
        ]);

        if (profile.status === 'rejected') {
          throw profile.reason instanceof Error ? profile.reason : new Error(String(profile.reason));
        }

        if (!isMounted) return;

        setEmbed(buildEmbedData({
          profile: profile.value,
          summary: settled(summary),
          sessions: settled(sessions),
          justPlayed: settled(justPlayed),
          trends: settled(trends),
          taxonomy: settled(taxonomy),
          graphSlots: GRAPH_SLOTS,
        }));
      } catch (err: any) {
        console.error('Failed to load embed profile data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
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
  }, [userTokenParam, userIdParam, apiKeyParam, synthetic]);

  return (
    <div className="page--portal-profile-embed w-screen h-screen flex items-center justify-center overflow-hidden bg-transparent m-0 p-0">
      {isLoading || (!error && !embed) ? (
        <BuckyballLoading />
      ) : error ? (
        <EmbedCard
          error={error}
          onRetry={() => window.location.reload()}
        />
      ) : embed ? (
        <EmbedCard
          userName={embed.userName}
          summaryText={embed.summaryText}
          momentumText={embed.momentumText}
          flowMedian={embed.flowMedian}
          flowBest={embed.flowBest}
          stats={embed.stats}
          traits={embed.traits}
          targetMood={embed.targetMood}
          streakDays={embed.streakDays}
          visualizationNode={
            <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
              <SkillprintVisualization
                userSkills={embed.graph.userSkills}
                userMoods={embed.graph.userMoods}
                hasScoreBySkill={embed.graph.hasScoreBySkill}
                hasScoreByMood={embed.graph.hasScoreByMood}
                size={size > 0 ? size : 200}
                useSizeDirectly={true}
                interactive={false}
              />
            </div>
          }
        />
      ) : null}
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
