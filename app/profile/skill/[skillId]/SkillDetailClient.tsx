'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BottomTabs from '../../../components/BottomTabs';

interface GameSession {
    game_name: string;
    game_slug: string;
    total_plays: number;
    plays_last_day: number;
    plays_last_week: number;
    plays_last_month: number;
}

interface SkillDetailClientProps {
    skillId: string;
}

// Dummy game data mapped to skills
const skillGameMapping: Record<string, GameSession[]> = {
    'Problem Solving': [
        { game_name: 'Puzzle Master', game_slug: 'puzzle-master', total_plays: 156, plays_last_day: 3, plays_last_week: 18, plays_last_month: 42 },
        { game_name: 'Logic Grid', game_slug: 'logic-grid', total_plays: 89, plays_last_day: 1, plays_last_week: 12, plays_last_month: 28 },
        { game_name: 'Brain Teaser', game_slug: 'brain-teaser', total_plays: 134, plays_last_day: 4, plays_last_week: 22, plays_last_month: 51 },
        { game_name: 'Code Breaker', game_slug: 'code-breaker', total_plays: 67, plays_last_day: 2, plays_last_week: 8, plays_last_month: 19 },
        { game_name: 'Mystery Solver', game_slug: 'mystery-solver', total_plays: 112, plays_last_day: 3, plays_last_week: 15, plays_last_month: 38 },
    ],
    'Memory': [
        { game_name: 'Memory Match', game_slug: 'memory-match', total_plays: 203, plays_last_day: 5, plays_last_week: 28, plays_last_month: 67 },
        { game_name: 'Card Flip', game_slug: 'card-flip', total_plays: 178, plays_last_day: 4, plays_last_week: 24, plays_last_month: 58 },
        { game_name: 'Sequence Recall', game_slug: 'sequence-recall', total_plays: 145, plays_last_day: 3, plays_last_week: 19, plays_last_month: 45 },
        { game_name: 'Pattern Memory', game_slug: 'pattern-memory', total_plays: 92, plays_last_day: 2, plays_last_week: 11, plays_last_month: 27 },
        { game_name: 'Number Recall', game_slug: 'number-recall', total_plays: 121, plays_last_day: 3, plays_last_week: 16, plays_last_month: 39 },
    ],
    'Speed': [
        { game_name: 'Quick Tap', game_slug: 'quick-tap', total_plays: 287, plays_last_day: 8, plays_last_week: 42, plays_last_month: 98 },
        { game_name: 'Rapid Fire', game_slug: 'rapid-fire', total_plays: 234, plays_last_day: 6, plays_last_week: 35, plays_last_month: 82 },
        { game_name: 'Speed Run', game_slug: 'speed-run', total_plays: 198, plays_last_day: 5, plays_last_week: 29, plays_last_month: 71 },
        { game_name: 'Time Trial', game_slug: 'time-trial', total_plays: 156, plays_last_day: 4, plays_last_week: 23, plays_last_month: 54 },
        { game_name: 'Blitz Mode', game_slug: 'blitz-mode', total_plays: 211, plays_last_day: 6, plays_last_week: 31, plays_last_month: 76 },
    ],
    'Accuracy': [
        { game_name: 'Precision Strike', game_slug: 'precision-strike', total_plays: 143, plays_last_day: 3, plays_last_week: 21, plays_last_month: 49 },
        { game_name: 'Target Practice', game_slug: 'target-practice', total_plays: 167, plays_last_day: 4, plays_last_week: 25, plays_last_month: 59 },
        { game_name: 'Perfect Shot', game_slug: 'perfect-shot', total_plays: 98, plays_last_day: 2, plays_last_week: 14, plays_last_month: 33 },
        { game_name: 'Bullseye', game_slug: 'bullseye', total_plays: 189, plays_last_day: 5, plays_last_week: 27, plays_last_month: 64 },
        { game_name: 'Sharpshooter', game_slug: 'sharpshooter', total_plays: 124, plays_last_day: 3, plays_last_week: 18, plays_last_month: 42 },
    ],
    'Pattern Recognition': [
        { game_name: 'Pattern Finder', game_slug: 'pattern-finder', total_plays: 176, plays_last_day: 4, plays_last_week: 26, plays_last_month: 61 },
        { game_name: 'Shape Matcher', game_slug: 'shape-matcher', total_plays: 132, plays_last_day: 3, plays_last_week: 19, plays_last_month: 46 },
        { game_name: 'Sequence Detective', game_slug: 'sequence-detective', total_plays: 154, plays_last_day: 4, plays_last_week: 22, plays_last_month: 52 },
        { game_name: 'Visual Patterns', game_slug: 'visual-patterns', total_plays: 109, plays_last_day: 2, plays_last_week: 16, plays_last_month: 37 },
        { game_name: 'Trend Spotter', game_slug: 'trend-spotter', total_plays: 87, plays_last_day: 2, plays_last_week: 13, plays_last_month: 29 },
    ],
    'Spatial Awareness': [
        { game_name: '3D Maze', game_slug: '3d-maze', total_plays: 145, plays_last_day: 3, plays_last_week: 21, plays_last_month: 50 },
        { game_name: 'Rotation Master', game_slug: 'rotation-master', total_plays: 118, plays_last_day: 3, plays_last_week: 17, plays_last_month: 40 },
        { game_name: 'Space Navigator', game_slug: 'space-navigator', total_plays: 163, plays_last_day: 4, plays_last_week: 24, plays_last_month: 56 },
        { game_name: 'Perspective Puzzle', game_slug: 'perspective-puzzle', total_plays: 92, plays_last_day: 2, plays_last_week: 13, plays_last_month: 31 },
        { game_name: 'Dimension Shift', game_slug: 'dimension-shift', total_plays: 127, plays_last_day: 3, plays_last_week: 18, plays_last_month: 43 },
    ],
    'Logic': [
        { game_name: 'Logic Chains', game_slug: 'logic-chains', total_plays: 198, plays_last_day: 5, plays_last_week: 29, plays_last_month: 68 },
        { game_name: 'Deduction Game', game_slug: 'deduction-game', total_plays: 171, plays_last_day: 4, plays_last_week: 25, plays_last_month: 59 },
        { game_name: 'Reasoning Test', game_slug: 'reasoning-test', total_plays: 143, plays_last_day: 3, plays_last_week: 21, plays_last_month: 49 },
        { game_name: 'Inference Master', game_slug: 'inference-master', total_plays: 116, plays_last_day: 3, plays_last_week: 17, plays_last_month: 39 },
        { game_name: 'Critical Thinking', game_slug: 'critical-thinking', total_plays: 189, plays_last_day: 5, plays_last_week: 27, plays_last_month: 64 },
    ],
    'Creativity': [
        { game_name: 'Creative Builder', game_slug: 'creative-builder', total_plays: 134, plays_last_day: 3, plays_last_week: 20, plays_last_month: 46 },
        { game_name: 'Art Studio', game_slug: 'art-studio', total_plays: 156, plays_last_day: 4, plays_last_week: 23, plays_last_month: 53 },
        { game_name: 'Story Maker', game_slug: 'story-maker', total_plays: 98, plays_last_day: 2, plays_last_week: 14, plays_last_month: 33 },
        { game_name: 'Design Challenge', game_slug: 'design-challenge', total_plays: 112, plays_last_day: 3, plays_last_week: 16, plays_last_month: 38 },
        { game_name: 'Innovation Lab', game_slug: 'innovation-lab', total_plays: 87, plays_last_day: 2, plays_last_week: 12, plays_last_month: 29 },
    ],
};

// Generate day-by-day data for the last 30 days
const generateDailyData = (totalPlaysLastMonth: number) => {
    const data = [];
    const avgPerDay = totalPlaysLastMonth / 30;

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        // Add some variation to make it look realistic
        const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
        const userPlays = Math.max(0, Math.round(avgPerDay * (1 + variation)));
        const populationPlays = Math.max(0, Math.round(userPlays * 0.68)); // Population is ~68% of user

        data.push({
            date: dayName,
            you: userPlays,
            average: populationPlays,
        });
    }

    return data;
};

export default function SkillDetailClient({ skillId }: SkillDetailClientProps) {
    const router = useRouter();

    const [skillName, setSkillName] = useState<string>('');
    const [gameSessions, setGameSessions] = useState<GameSession[]>([]);

    useEffect(() => {
        // Decode the skill name from the URL
        const decodedSkillName = decodeURIComponent(skillId);
        setSkillName(decodedSkillName);

        // Get dummy data for this skill
        const sessions = skillGameMapping[decodedSkillName] || [];
        setGameSessions(sessions);
    }, [skillId]);

    // Calculate user stats
    const userStats = {
        totalPlays: gameSessions.reduce((sum, s) => sum + s.total_plays, 0),
        playsLastDay: gameSessions.reduce((sum, s) => sum + s.plays_last_day, 0),
        playsLastWeek: gameSessions.reduce((sum, s) => sum + s.plays_last_week, 0),
        playsLastMonth: gameSessions.reduce((sum, s) => sum + s.plays_last_month, 0),
    };

    // Population averages (dummy data - represents average user)
    const populationStats = {
        totalPlays: Math.floor(userStats.totalPlays * 0.7), // User is 30% above average
        playsLastDay: Math.floor(userStats.playsLastDay * 0.6),
        playsLastWeek: Math.floor(userStats.playsLastWeek * 0.65),
        playsLastMonth: Math.floor(userStats.playsLastMonth * 0.68),
    };

    // Generate daily comparison data
    const dailyData = generateDailyData(userStats.playsLastMonth);

    // Calculate percentile (how user compares to population)
    const calculatePercentile = (userValue: number, popValue: number) => {
        if (popValue === 0) return 100;
        const ratio = (userValue / popValue) * 100;
        return Math.min(Math.round(ratio), 200); // Cap at 200%
    };

    const handleGameClick = (gameSlug: string) => {
        router.push(`/game/${gameSlug}`);
    };

    const handleBackClick = () => {
        router.back();
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="p-8 pb-32">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Profile
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {skillName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gameplay sessions breakdown
                    </p>
                </div>

                {/* Game Sessions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {gameSessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                            No games found for this skill
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Game
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            Total Plays
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            Last Day
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            Last Week
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                                            Last Month
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {gameSessions.map((session, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => handleGameClick(session.game_slug)}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {session.game_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                    {session.total_plays}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {session.plays_last_day}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {session.plays_last_week}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {session.plays_last_month}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {gameSessions.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Games
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {gameSessions.length}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Total Plays
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {gameSessions.reduce((sum, s) => sum + s.total_plays, 0)}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Plays This Week
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {gameSessions.reduce((sum, s) => sum + s.plays_last_week, 0)}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Plays This Month
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {gameSessions.reduce((sum, s) => sum + s.plays_last_month, 0)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Population Comparison Graph */}
                {gameSessions.length > 0 && (
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Performance Comparison
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                See how your activity compares to the average user population
                            </p>
                        </div>

                        {/* Day-by-Day Bar Chart */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                30-Day Activity Breakdown
                            </h3>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dailyData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ fill: '#6B7280', fontSize: 11 }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            label={{ value: 'Plays', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            labelStyle={{ color: '#9CA3AF' }}
                                        />
                                        <Legend
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            formatter={(value) => value === 'you' ? 'Your Performance' : 'Population Average'}
                                        />
                                        <Bar
                                            dataKey="you"
                                            fill="#9333EA"
                                            radius={[4, 4, 0, 0]}
                                            name="you"
                                        />
                                        <Bar
                                            dataKey="average"
                                            fill="#6B7280"
                                            radius={[4, 4, 0, 0]}
                                            name="average"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Last Day Comparison */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Last Day
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {calculatePercentile(userStats.playsLastDay, populationStats.playsLastDay)}% of average
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {/* User Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 w-16">
                                            You
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((userStats.playsLastDay / Math.max(userStats.playsLastDay, populationStats.playsLastDay)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {userStats.playsLastDay}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Population Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16">
                                            Average
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-gray-400 to-gray-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((populationStats.playsLastDay / Math.max(userStats.playsLastDay, populationStats.playsLastDay)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {populationStats.playsLastDay}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Week Comparison */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Last Week
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {calculatePercentile(userStats.playsLastWeek, populationStats.playsLastWeek)}% of average
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {/* User Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 w-16">
                                            You
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((userStats.playsLastWeek / Math.max(userStats.playsLastWeek, populationStats.playsLastWeek)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {userStats.playsLastWeek}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Population Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16">
                                            Average
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-gray-400 to-gray-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((populationStats.playsLastWeek / Math.max(userStats.playsLastWeek, populationStats.playsLastWeek)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {populationStats.playsLastWeek}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Month Comparison */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Last Month
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {calculatePercentile(userStats.playsLastMonth, populationStats.playsLastMonth)}% of average
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {/* User Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 w-16">
                                            You
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((userStats.playsLastMonth / Math.max(userStats.playsLastMonth, populationStats.playsLastMonth)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {userStats.playsLastMonth}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Population Bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-16">
                                            Average
                                        </span>
                                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-gray-400 to-gray-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{
                                                    width: `${Math.min((populationStats.playsLastMonth / Math.max(userStats.playsLastMonth, populationStats.playsLastMonth)) * 100, 100)}%`
                                                }}
                                            >
                                                <span className="text-xs font-semibold text-white">
                                                    {populationStats.playsLastMonth}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Your Performance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-gradient-to-r from-gray-400 to-gray-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Population Average</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <BottomTabs />
        </div>
    );
}
