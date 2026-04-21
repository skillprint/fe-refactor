'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useSkillprintVisualizationData } from '../../../../hooks/useSkillprintVisualizationData';
import { useGamesBySkill } from '../../../../hooks/useGamesBySkill';
import GamePreviewShareSheet from '../../../../components/GamePreviewShareSheet';
import TopNav from '../../../../components/TopNav';

const getColorForSlug = (slug: string) => {
    const lowerSlug = slug.toLowerCase();
    const colorMap: Record<string, string> = {
      'focus': '#6366F1', 'relax': '#10B981', 'memory': '#8B5CF6', 
      'speed': '#EF4444', 'logic': '#06B6D4', 'attention': '#F59E0B', 
      'problem-solving': '#3B82F6', 'language': '#EC4899', 'math': '#84CC16', 
      'visual': '#F97316', 'creativity': '#D946EF',
    };
    if (colorMap[lowerSlug]) return colorMap[lowerSlug];
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
    let hash = 0;
    for (let i = 0; i < lowerSlug.length; i++) {
        hash = lowerSlug.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function StatsClient({ type, slug }: { type: string; slug: string }) {
    const router = useRouter();
    const { moodProfile, skillProfile, isLoading: isStatsLoading } = useSkillprintVisualizationData(null);
    const { gamesBySkill, gamesByMood, isLoading: isGamesLoading } = useGamesBySkill();
    const [previewGameSlug, setPreviewGameSlug] = useState<string | null>(null);

    const activeData = type === 'mood' ? moodProfile : skillProfile;

    const titleName = decodeURIComponent(slug).charAt(0).toUpperCase() + decodeURIComponent(slug).slice(1);

    const relevantYearlyStats = useMemo(() => {
        if (!activeData?.yearlySummary) return null;
        return activeData.yearlySummary.find((item: any) =>
            (item.mood?.toLowerCase() === slug.toLowerCase() || item.skill?.toLowerCase() === slug.toLowerCase())
        );
    }, [activeData, slug]);

    const chartData = useMemo(() => {
        if (!activeData?.weeklySessions) return [];
        return activeData.weeklySessions.map((session: any) => {
            const date = new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const hit = type === 'mood' 
                ? (session.mood?.toLowerCase() === slug.toLowerCase())
                : (session.skill?.toLowerCase() === slug.toLowerCase());
            
            return {
                date,
                value: hit ? 1 : 0
            };
        }).reverse();
    }, [activeData, type, slug]);

    const recommendedGames = useMemo(() => {
        if (type === 'mood') {
            return gamesByMood.filter((game: any) => 
                game.moods?.some((m: any) => m.slug.toLowerCase() === slug.toLowerCase())
            ).slice(0, 3);
        } else {
            return gamesBySkill.filter((game: any) => 
                game.skills?.some((s: any) => s.slug.toLowerCase() === slug.toLowerCase())
            ).slice(0, 3);
        }
    }, [gamesByMood, gamesBySkill, type, slug]);

    const handleBackClick = () => {
        router.back();
    };

    if (isStatsLoading) {
        return (
            <div className="font-sans min-h-screen bg-background flex flex-col">
                <TopNav />
                <div className="p-8 flex-1 flex items-center justify-center">
                    <div className="text-muted-foreground animate-pulse">Loading stats...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen bg-background">
            <TopNav />
            <div className="p-8 pb-32 max-w-[1440px] w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-accent hover:opacity-80 mb-4 transition-opacity"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Profile
                    </button>
                    <h1 className="text-3xl font-bold text-foreground">
                        {titleName} Stats
                    </h1>
                    <p className="text-muted-foreground mt-2 capitalize">
                        Detailed {type} metrics and activity
                    </p>
                </div>

                {/* Current Session Stats */}
                {activeData?.currentSession && (
                    (type === 'mood' && activeData.currentSession.targetMood?.toLowerCase() === slug.toLowerCase()) ||
                    (type === 'skill' && activeData.currentSession.skill?.toLowerCase() === slug.toLowerCase())
                ) && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Current Session</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Target
                                </div>
                                <div className="text-2xl font-bold text-primary capitalize">
                                    {activeData.currentSession.targetMood || activeData.currentSession.skill || '--'}
                                </div>
                            </div>
                            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Flow Score
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                    {activeData.currentSession.flowScore !== undefined 
                                        ? Math.round(activeData.currentSession.flowScore * 100)
                                        : '--'}
                                </div>
                            </div>
                            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Confidence
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                    {activeData.currentSession.confidence !== undefined 
                                        ? Number(activeData.currentSession.confidence).toFixed(2)
                                        : '--'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Yearly Summary Stats */}
                {relevantYearlyStats && (
                    <div className="mb-10">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Yearly Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Total Duration
                                </div>
                                <div className="text-2xl font-bold text-foreground font-mono">
                                    {relevantYearlyStats.duration || '--'}
                                </div>
                            </div>
                            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Momentum Score
                                </div>
                                <div className="text-2xl font-bold text-foreground font-mono">
                                    {relevantYearlyStats.momentumScore !== undefined 
                                        ? relevantYearlyStats.momentumScore
                                        : '--'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Weekly Time Series Chart */}
                {chartData.length > 0 && (
                    <div className="mb-10 pt-2">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Weekly Sessions Activity</h2>
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <div className="w-full h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            tick={{ fill: '#6B7280', fontSize: 12 }} 
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis 
                                            allowDecimals={false} 
                                            domain={[0, 1]}
                                            ticks={[0, 1]}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => val === 1 ? 'Active' : 'Inactive'}
                                        />
                                        <RechartsTooltip 
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                            }}
                                            formatter={(value) => [value === 1 ? 'Yes' : 'No', 'Activity Recorded']}
                                            labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#8F48F1" 
                                            strokeWidth={3} 
                                            dot={{ r: 4, fill: '#8F48F1', strokeWidth: 0 }} 
                                            activeDot={{ r: 6, fill: '#A78BFA' }}
                                            animationDuration={1000}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommended Games */}
                {(!isGamesLoading && recommendedGames.length > 0) && (
                    <div className="mb-10 pt-2">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Recommended games to improve your {titleName}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendedGames.map((game: any) => {
                                const tileColor = getColorForSlug(slug);
                                return (
                                    <button
                                        key={game.slug}
                                        onClick={() => setPreviewGameSlug(game.slug)}
                                        className="block group w-full text-left"
                                    >
                                        <div
                                            className="rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-row h-44"
                                            style={{ backgroundColor: tileColor }}
                                        >
                                            <div className="flex-1 p-5 flex flex-col justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white leading-tight mt-1 line-clamp-2">
                                                        {game.name}
                                                    </h3>
                                                </div>
                                                <div className="bg-white text-black font-bold py-2 px-6 rounded-xl hover:bg-gray-100 transition-colors mt-2 text-lg">
                                                    Play
                                                </div>
                                            </div>
                                            {game.screenshot && (
                                                <div className="relative aspect-square h-full shrink-0">
                                                    <Image
                                                        src={game.screenshot}
                                                        alt={game.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            
            <GamePreviewShareSheet 
                slug={previewGameSlug} 
                isOpen={!!previewGameSlug} 
                onClose={() => setPreviewGameSlug(null)} 
            />
        </div>
    );
}
