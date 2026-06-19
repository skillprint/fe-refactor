'use client';

import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

// Color definitions matching our dashboard
const COLORS = ['#6366f1', '#0d9488', '#f97316', '#a855f7', '#3b82f6'];

// Mocked data sets based on selected filter
const DATA_SETS = {
    '7d': {
        playtime: [
            { name: 'Mon', hours: 45 },
            { name: 'Tue', hours: 55 },
            { name: 'Wed', hours: 80 },
            { name: 'Thu', hours: 65 },
            { name: 'Fri', hours: 75 },
            { name: 'Sat', hours: 30 },
            { name: 'Sun', hours: 25 },
        ],
        games: [
            { name: 'Hextris', sessions: 280 },
            { name: '2048', sessions: 210 },
            { name: 'Alchemy', sessions: 190 },
            { name: 'Mahjong', sessions: 140 },
            { name: 'Snake Attack', sessions: 90 },
        ],
        focus: [
            { name: 'Mood', value: 60 },
            { name: 'Skill', value: 40 },
        ]
    },
    '30d': {
        playtime: [
            { name: 'Week 1', hours: 220 },
            { name: 'Week 2', hours: 280 },
            { name: 'Week 3', hours: 310 },
            { name: 'Week 4', hours: 395 },
        ],
        games: [
            { name: 'Hextris', sessions: 1200 },
            { name: '2048', sessions: 980 },
            { name: 'Alchemy', sessions: 850 },
            { name: 'Mahjong', sessions: 540 },
            { name: 'Snake Attack', sessions: 420 },
        ],
        focus: [
            { name: 'Mood', value: 55 },
            { name: 'Skill', value: 45 },
        ]
    },
    '90d': {
        playtime: [
            { name: 'Month 1', hours: 950 },
            { name: 'Month 2', hours: 1120 },
            { name: 'Month 3', hours: 1422 },
        ],
        games: [
            { name: 'Hextris', sessions: 3800 },
            { name: '2048', sessions: 3100 },
            { name: 'Alchemy', sessions: 2600 },
            { name: 'Mahjong', sessions: 1900 },
            { name: 'Snake Attack', sessions: 1650 },
        ],
        focus: [
            { name: 'Mood', value: 58 },
            { name: 'Skill', value: 42 },
        ]
    }
};

export default function CorporateAnalyticsPage() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
    const activeData = DATA_SETS[timeRange];

    const handleExport = (format: 'csv' | 'json') => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 800)),
            {
                loading: `Preparing telemetry export in ${format.toUpperCase()}...`,
                success: `Export completed! skillprint_telemetry_${timeRange}.${format} downloaded.`,
                error: 'Export failed.'
            }
        );
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Usage Analytics</h1>
                    <p className="text-sm text-slate-400 mt-1">Deep insight analytics logs and cognitive development timelines.</p>
                </div>

                {/* Filter and export tools */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
                        {(['7d', '30d', '90d'] as const).map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                                    timeRange === r
                                        ? 'bg-slate-800 text-white font-bold'
                                        : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="relative group">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all flex items-center gap-1.5">
                            <span>Export Report</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-1.5 w-32 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-30">
                            <button
                                onClick={() => handleExport('csv')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => handleExport('json')}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                            >
                                Export JSON
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Playtime Area Chart */}
                <div className="lg:col-span-2 border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white mb-6">Playtime Telemetry Trend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activeData.playtime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Focus Distribution Donut */}
                <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
                    <h3 className="text-sm font-bold text-white mb-4">Focus Distribution</h3>
                    
                    <div className="h-60 w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={activeData.focus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {activeData.focus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-white">
                                {activeData.focus[0].value}%
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Mood Focus
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 text-xs mt-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            <span className="text-slate-400 font-medium">Mood-based Play ({activeData.focus[0].value}%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                            <span className="text-slate-400 font-medium">Skill-based Play ({activeData.focus[1].value}%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game engagements Bar Chart */}
            <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-sm font-bold text-white mb-6">Top Game Engagement Sessions</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeData.games} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="sessions" fill="#0d9488" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
