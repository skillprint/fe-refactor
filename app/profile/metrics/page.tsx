'use client';

import { useState, Suspense } from 'react';
import { useMetricsData, Timeframe, MetricsFilter } from '../../hooks/useMetricsData';
import TopNav from '../../components/TopNav';
import ProgressBanner from '../../components/ProgressBanner';
import DateJumper from '../../components/Metrics/DateJumper';
import MetricsChart from '../../components/Metrics/MetricsChart';
import MultiSelectFilter from '../../components/Metrics/MultiSelectFilter';
import BuckyballLoading from '../../components/BuckyballLoading';

function MetricsContent() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [timeframe, setTimeframe] = useState<Timeframe>('Week');
    const [filters, setFilters] = useState<MetricsFilter[]>([]);

    const { chartData, moods, skills, games, gameMetadataMap } = useMetricsData(currentDate, timeframe, filters);

    const getColorForSlug = (slug: string) => {
        const colorMap: Record<string, string> = {
            'focus': '#6366F1', // indigo-500
            'relax': '#10B981', // emerald-500
            'memory': '#8B5CF6', // violet-500
            'speed': '#EF4444', // red-500
            'logic': '#06B6D4', // cyan-500
            'attention': '#F59E0B', // amber-500
            'problem-solving': '#3B82F6', // blue-500
            'language': '#EC4899', // pink-500
            'math': '#84CC16', // lime-500
            'visual': '#F97316', // orange-500
            'creativity': '#D946EF', // fuchsia-500
        };

        if (colorMap[slug]) return colorMap[slug];

        const colors = [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ];

        let hash = 0;
        for (let i = 0; i < slug.length; i++) {
            hash = slug.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    const getTintedBackground = (color: string, opacity: number) => {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    };

    const activeColor = filters.length > 0 && filters[0].slugs.length > 0
        ? getColorForSlug(filters[0].slugs[0])
        : null;

    const handleFilterChange = (newFilters: MetricsFilter[]) => {
        setFilters(newFilters);
    };

    const totalSessionsCount = chartData.reduce((acc, point) => acc + (point.total || 0), 0);

    return (
        <div
            className="font-sans min-h-screen bg-background transition-colors duration-500 ease-in-out"
            style={{ backgroundColor: activeColor ? getTintedBackground(activeColor, 0.03) : undefined }}
        >
            <div className="flex flex-col min-h-screen pb-32">
                <TopNav />
                <ProgressBanner />

                <main className="flex-1 px-4 py-8 max-w-4xl w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">Metrics</h1>
                        <p className="text-muted-foreground text-lg">Your gameplay activity over time.</p>
                    </div>

                    {/* Date Range Navigation */}
                    <DateJumper
                        currentDate={currentDate}
                        timeframe={timeframe}
                        onDateChange={setCurrentDate}
                        onTimeframeChange={setTimeframe}
                    />

                    {!moods.length && !skills.length ? (
                        <div className="flex justify-center items-center h-48">
                            <BuckyballLoading />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">

                            {/* Summary Hero Metric */}
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                                    TOTAL SESSIONS
                                </span>
                                <span className="text-5xl font-black text-foreground flex items-end">
                                    {totalSessionsCount}
                                    <span className="text-lg font-medium text-muted-foreground ml-2 mb-1">sessions</span>
                                </span>
                            </div>

                            {/* Chart */}
                            <MetricsChart
                                data={chartData}
                                filters={filters}
                                getColorForSlug={getColorForSlug}
                            />

                            {/* Filters */}
                            <MultiSelectFilter
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                availableMoods={moods}
                                availableSkills={skills}
                                availableGames={games}
                                getColorForSlug={getColorForSlug}
                            />

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default function MetricsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <BuckyballLoading />
            </div>
        }>
            <MetricsContent />
        </Suspense>
    );
}
