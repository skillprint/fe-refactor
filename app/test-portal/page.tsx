'use client';

import React, { useState, Suspense } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Cell } from 'recharts';
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



const isObject = (val: any) => val && typeof val === 'object' && !Array.isArray(val);
const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-slate-600">-</span>;
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) return <div className="space-y-1">{val.map((v, i) => <div key={i}>{renderValue(v)}</div>)}</div>;
    if (isObject(val)) return <GenericTable data={val} />;
    return String(val);
}
const GenericTable = ({ data }: { data: any }) => {
    if (Array.isArray(data)) {
        if (data.length === 0) return <div className="text-slate-500 text-xs">Empty list</div>;
        const keys = Object.keys(data[0] || {}).filter(k => typeof data[0][k] !== 'object' || Array.isArray(data[0][k]));
        return (
            <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <thead className="uppercase bg-white/5 text-slate-400">
                        <tr>{keys.map(k => <th key={k} className="px-2 py-1.5 whitespace-nowrap">{k}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i} className="border-b border-white/5">
                                {keys.map(k => <td key={k} className="px-2 py-1.5 whitespace-nowrap">{renderValue(row[k])}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    } else if (isObject(data)) {
        return (
            <div className="overflow-x-auto w-full custom-scrollbar">
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                    <tbody>
                        {Object.entries(data).map(([k, v], i) => (
                            <tr key={i} className="border-b border-white/5">
                                <td className="px-2 py-1.5 font-medium text-slate-400 align-top whitespace-nowrap bg-white/5">{k}</td>
                                <td className="px-2 py-1.5 break-all">{renderValue(v)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
    return <div className="text-xs">{renderValue(data)}</div>
}

const ReferenceDimensionsCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useReferenceDimensions(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">ReferenceDimensions</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const ReferenceInsightCategoriesCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useReferenceInsightCategories(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">ReferenceInsightCategories</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const ProfileSettingsCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useProfileSettings(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">ProfileSettings</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const SessionDetailCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useSessionDetail('test-session-123', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">SessionDetail</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const PaginatedSessionCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = usePaginatedSession(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">PaginatedSession</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const LongitudinalMetricCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useLongitudinalMetric('mood', 'focus', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">LongitudinalMetric</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        return (
                            <div className="flex-1 w-full h-full flex flex-col min-h-[200px]">
                                <div className="flex justify-between items-center mb-2 px-2 text-xs">
                                    <span className="text-slate-400">Avg: {data.average}</span>
                                    <span className="text-emerald-400">{data.trend.label}</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.buckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                                        <ReferenceLine y={data.average} stroke="#38bdf8" strokeDasharray="3 3" />
                                        <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                            {data.buckets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={(entry.score ?? 0) > (data.average ?? 0) ? '#34d399' : '#818cf8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const MetricAboutCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useMetricAbout('cognition', 'attention', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">MetricAbout</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const MetricLeaderboardCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useMetricLeaderboard('cognition', 'attention', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">MetricLeaderboard</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const MetricDistributionCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useMetricDistribution('cognition', 'attention', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">MetricDistribution</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const ProfileAggregateCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useProfileAggregate(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">ProfileAggregate</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const ProfilePercentilesCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useProfilePercentiles(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">ProfilePercentiles</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const HomeSummaryCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useHomeSummary(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">HomeSummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const HomeFootprintCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useHomeFootprint(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">HomeFootprint</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        const chartData = data.axes.map(axis => ({ subject: axis.label, A: axis.score, fullMark: 100 }));
                        return (
                            <div className="flex-1 w-full h-full min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar name="Footprint" dataKey="A" stroke="#34d399" fill="#34d399" fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const HomeJustPlayedCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useHomeJustPlayed(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">HomeJustPlayed</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const HomeRecentSessionsCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useHomeRecentSessions(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">HomeRecentSessions</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const TrendsSummaryCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useTrendsSummary(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">TrendsSummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const TrendsLongRangeCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useTrendsLongRange(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">TrendsLongRange</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const TrendsDailySummaryCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useTrendsDailySummary(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">TrendsDailySummary</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        return (
                            <div className="flex-1 overflow-x-auto w-full">
                                <table className="w-full text-sm text-left text-slate-300">
                                    <thead className="text-xs uppercase bg-white/5 text-slate-400">
                                        <tr>
                                            <th className="px-3 py-2">Pillar</th>
                                            <th className="px-3 py-2">Score</th>
                                            <th className="px-3 py-2">Sessions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.dimensions.map((dim, i) => (
                                            <tr key={i} className="border-b border-white/5">
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${dim.pillar === 'mood' ? 'bg-fuchsia-500/20 text-fuchsia-300' : dim.pillar === 'cognition' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>
                                                        {dim.slug}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 font-bold">{dim.avg_score}</td>
                                                <td className="px-3 py-2 text-slate-400">{dim.sessions} sess.</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const InsightCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useInsight(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">Insight</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        return (
                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                {data.map((insight, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-start gap-3">
                                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">
                                            <span className="material-icons text-sm">auto_awesome</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{insight.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const NextGameRecommendationCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useNextGameRecommendation(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">NextGameRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        return (
                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
                                {data.map((rec, i) => (
                                    <div key={i} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3 rounded-lg border border-white/10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-10">
                                            <span className="material-icons text-4xl">play_circle</span>
                                        </div>
                                        <div className="relative z-10">
                                            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Recommended Next</span>
                                            <h4 className="text-lg font-bold text-white mt-1">{rec.game.name}</h4>
                                            <p className="text-xs text-slate-300 mt-2 bg-black/30 p-2 rounded">{rec.reason_text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const MoodMatchedRecommendationCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useMoodMatchedRecommendation(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">MoodMatchedRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                        return (
                            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
                                {data.map((rec, i) => (
                                    <div key={i} className="bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 p-3 rounded-lg border border-white/10">
                                        <span className="text-[10px] uppercase tracking-wider text-fuchsia-400 font-bold">Mood Match</span>
                                        <h4 className="text-base font-bold text-white mt-1">{rec.game.name}</h4>
                                        <p className="text-xs text-slate-300 mt-1">{rec.reason_text}</p>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            ) : null}
        </div>
    );
};

const PlaybookRecommendationCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = usePlaybookRecommendation(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">PlaybookRecommendation</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const LibraryGameCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useLibraryGame(useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">LibraryGame</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const LibraryGameDetailCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useLibraryGameDetail('hextris', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">LibraryGameDetail</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const LibraryPersonalStatsCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useLibraryPersonalStats('hextris', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">LibraryPersonalStats</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};

const LibraryCommunityStatsCard = ({ useSyntheticData }: { useSyntheticData: boolean }) => {
    const { data, isLoading, error } = useLibraryCommunityStats('hextris', useSyntheticData);
    return (
        <div className="bg-slate-800 border border-white/10 rounded-xl p-4 flex flex-col min-h-[300px] max-h-[400px] overflow-hidden shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 mb-3 pb-2 border-b border-white/10 uppercase tracking-wider">LibraryCommunityStats</h3>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
                </div>
            ) : error ? (
                <div className="text-red-400 text-sm overflow-auto">{error.message}</div>
            ) : data ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <GenericTable data={data} />
                </div>
            ) : null}
        </div>
    );
};


function TestHooksContent() {
    const [useSyntheticData, setUseSyntheticData] = useState(true);

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-10">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                            Portal API Visualizations
                        </h1>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800 shadow-inner">
                        <span className={`text-sm font-semibold transition-colors ${!useSyntheticData ? 'text-emerald-400' : 'text-slate-500'}`}>Server API</span>
                        <button
                            onClick={() => setUseSyntheticData(!useSyntheticData)}
                            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${useSyntheticData ? 'bg-cyan-500' : 'bg-emerald-500'}`}
                        >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${useSyntheticData ? 'translate-x-7' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-semibold transition-colors ${useSyntheticData ? 'text-cyan-400' : 'text-slate-500'}`}>Synthetic</span>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    <ReferenceDimensionsCard useSyntheticData={useSyntheticData} />
                    <ReferenceInsightCategoriesCard useSyntheticData={useSyntheticData} />
                    <ProfileSettingsCard useSyntheticData={useSyntheticData} />
                    <SessionDetailCard useSyntheticData={useSyntheticData} />
                    <PaginatedSessionCard useSyntheticData={useSyntheticData} />
                    <LongitudinalMetricCard useSyntheticData={useSyntheticData} />
                    <MetricAboutCard useSyntheticData={useSyntheticData} />
                    <MetricLeaderboardCard useSyntheticData={useSyntheticData} />
                    <MetricDistributionCard useSyntheticData={useSyntheticData} />
                    <ProfileAggregateCard useSyntheticData={useSyntheticData} />
                    <ProfilePercentilesCard useSyntheticData={useSyntheticData} />
                    <HomeSummaryCard useSyntheticData={useSyntheticData} />
                    <HomeFootprintCard useSyntheticData={useSyntheticData} />
                    <HomeJustPlayedCard useSyntheticData={useSyntheticData} />
                    <HomeRecentSessionsCard useSyntheticData={useSyntheticData} />
                    <TrendsSummaryCard useSyntheticData={useSyntheticData} />
                    <TrendsLongRangeCard useSyntheticData={useSyntheticData} />
                    <TrendsDailySummaryCard useSyntheticData={useSyntheticData} />
                    <InsightCard useSyntheticData={useSyntheticData} />
                    <NextGameRecommendationCard useSyntheticData={useSyntheticData} />
                    <MoodMatchedRecommendationCard useSyntheticData={useSyntheticData} />
                    <PlaybookRecommendationCard useSyntheticData={useSyntheticData} />
                    <LibraryGameCard useSyntheticData={useSyntheticData} />
                    <LibraryGameDetailCard useSyntheticData={useSyntheticData} />
                    <LibraryPersonalStatsCard useSyntheticData={useSyntheticData} />
                    <LibraryCommunityStatsCard useSyntheticData={useSyntheticData} />

                </div>
            </div>
        </div>
    );
}

export default function TestHooksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 p-10 flex items-center justify-center text-emerald-400">Loading Portal Visualizations...</div>}>
            <TestHooksContent />
        </Suspense>
    );
}
