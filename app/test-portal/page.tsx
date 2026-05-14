'use client';

import React from 'react';
import { useReferenceDimensions } from '../../lib/models/portal/useReferenceDimensions';
import { useReferenceInsightCategories } from '../../lib/models/portal/useReferenceInsightCategories';
import { useProfileSettings } from '../../lib/models/portal/useProfileSettings';
import { useSessionDetail } from '../../lib/models/portal/useSessionDetail';
import { usePaginatedSession } from '../../lib/models/portal/usePaginatedSession';
import { useLongitudinalMetric } from '../../lib/models/portal/useLongitudinalMetric';
import { useMetricAbout } from '../../lib/models/portal/useMetricAbout';
import { useMetricLeaderboard } from '../../lib/models/portal/useMetricLeaderboard';
import { useMetricDistribution } from '../../lib/models/portal/useMetricDistribution';
import { useProfileAggregate } from '../../lib/models/portal/useProfileAggregate';
import { useProfilePercentiles } from '../../lib/models/portal/useProfilePercentiles';
import { useHomeSummary } from '../../lib/models/portal/useHomeSummary';
import { useHomeFootprint } from '../../lib/models/portal/useHomeFootprint';
import { useHomeJustPlayed } from '../../lib/models/portal/useHomeJustPlayed';
import { useHomeRecentSessions } from '../../lib/models/portal/useHomeRecentSessions';
import { useTrendsSummary } from '../../lib/models/portal/useTrendsSummary';
import { useTrendsLongRange } from '../../lib/models/portal/useTrendsLongRange';
import { useTrendsDailySummary } from '../../lib/models/portal/useTrendsDailySummary';
import { useInsight } from '../../lib/models/portal/useInsight';
import { useNextGameRecommendation } from '../../lib/models/portal/useNextGameRecommendation';
import { useMoodMatchedRecommendation } from '../../lib/models/portal/useMoodMatchedRecommendation';
import { usePlaybookRecommendation } from '../../lib/models/portal/usePlaybookRecommendation';
import { useLibraryGame } from '../../lib/models/portal/useLibraryGame';
import { useLibraryGameDetail } from '../../lib/models/portal/useLibraryGameDetail';
import { useLibraryPersonalStats } from '../../lib/models/portal/useLibraryPersonalStats';
import { useLibraryCommunityStats } from '../../lib/models/portal/useLibraryCommunityStats';



const ReferenceDimensionsCard = () => {
    const { data, isLoading, error } = useReferenceDimensions(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">ReferenceDimensions</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const ReferenceInsightCategoriesCard = () => {
    const { data, isLoading, error } = useReferenceInsightCategories(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">ReferenceInsightCategories</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const ProfileSettingsCard = () => {
    const { data, isLoading, error } = useProfileSettings(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">ProfileSettings</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const SessionDetailCard = () => {
    const { data, isLoading, error } = useSessionDetail('test-session-123', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">SessionDetail</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const PaginatedSessionCard = () => {
    const { data, isLoading, error } = usePaginatedSession(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">PaginatedSession</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const LongitudinalMetricCard = () => {
    const { data, isLoading, error } = useLongitudinalMetric('mood', 'focus', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">LongitudinalMetric</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const MetricAboutCard = () => {
    const { data, isLoading, error } = useMetricAbout('cognition', 'attention', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">MetricAbout</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const MetricLeaderboardCard = () => {
    const { data, isLoading, error } = useMetricLeaderboard('cognition', 'attention', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">MetricLeaderboard</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const MetricDistributionCard = () => {
    const { data, isLoading, error } = useMetricDistribution('cognition', 'attention', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">MetricDistribution</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const ProfileAggregateCard = () => {
    const { data, isLoading, error } = useProfileAggregate(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">ProfileAggregate</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const ProfilePercentilesCard = () => {
    const { data, isLoading, error } = useProfilePercentiles(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">ProfilePercentiles</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const HomeSummaryCard = () => {
    const { data, isLoading, error } = useHomeSummary(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">HomeSummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const HomeFootprintCard = () => {
    const { data, isLoading, error } = useHomeFootprint(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">HomeFootprint</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const HomeJustPlayedCard = () => {
    const { data, isLoading, error } = useHomeJustPlayed(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">HomeJustPlayed</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const HomeRecentSessionsCard = () => {
    const { data, isLoading, error } = useHomeRecentSessions(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">HomeRecentSessions</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const TrendsSummaryCard = () => {
    const { data, isLoading, error } = useTrendsSummary(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">TrendsSummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const TrendsLongRangeCard = () => {
    const { data, isLoading, error } = useTrendsLongRange(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">TrendsLongRange</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const TrendsDailySummaryCard = () => {
    const { data, isLoading, error } = useTrendsDailySummary(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">TrendsDailySummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const InsightCard = () => {
    const { data, isLoading, error } = useInsight(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">Insight</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const NextGameRecommendationCard = () => {
    const { data, isLoading, error } = useNextGameRecommendation(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">NextGameRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const MoodMatchedRecommendationCard = () => {
    const { data, isLoading, error } = useMoodMatchedRecommendation(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">MoodMatchedRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const PlaybookRecommendationCard = () => {
    const { data, isLoading, error } = usePlaybookRecommendation(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">PlaybookRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const LibraryGameCard = () => {
    const { data, isLoading, error } = useLibraryGame(true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">LibraryGame</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const LibraryGameDetailCard = () => {
    const { data, isLoading, error } = useLibraryGameDetail('hextris', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">LibraryGameDetail</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const LibraryPersonalStatsCard = () => {
    const { data, isLoading, error } = useLibraryPersonalStats('hextris', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">LibraryPersonalStats</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const LibraryCommunityStatsCard = () => {
    const { data, isLoading, error } = useLibraryCommunityStats('hextris', true);
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col h-64 overflow-hidden shadow-lg backdrop-blur-sm transition-all hover:bg-white/10">
            <h3 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">LibraryCommunityStats</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : (
                <pre className="text-xs text-emerald-300 overflow-auto bg-black/40 p-2 rounded-lg flex-1">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};


export default function TestHooksPage() {
    return (
        <div className="min-h-screen bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Portal API Hooks Test Dashboard
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Displaying 26 parameterized hooks loading synthetic mock data simultaneously.
                    </p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <ReferenceDimensionsCard />
                    <ReferenceInsightCategoriesCard />
                    <ProfileSettingsCard />
                    <SessionDetailCard />
                    <PaginatedSessionCard />
                    <LongitudinalMetricCard />
                    <MetricAboutCard />
                    <MetricLeaderboardCard />
                    <MetricDistributionCard />
                    <ProfileAggregateCard />
                    <ProfilePercentilesCard />
                    <HomeSummaryCard />
                    <HomeFootprintCard />
                    <HomeJustPlayedCard />
                    <HomeRecentSessionsCard />
                    <TrendsSummaryCard />
                    <TrendsLongRangeCard />
                    <TrendsDailySummaryCard />
                    <InsightCard />
                    <NextGameRecommendationCard />
                    <MoodMatchedRecommendationCard />
                    <PlaybookRecommendationCard />
                    <LibraryGameCard />
                    <LibraryGameDetailCard />
                    <LibraryPersonalStatsCard />
                    <LibraryCommunityStatsCard />

                </div>
            </div>
        </div>
    );
}