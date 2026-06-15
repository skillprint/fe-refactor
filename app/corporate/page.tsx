'use client';

import React from 'react';
import Link from 'next/link';
import MetricCard from './components/MetricCard';

// Icon helpers
const MembersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const GamepadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrophyIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;

export default function CorporateDashboardPage() {
    const recentActivity = [
        { user: 'Sarah Connor', game: 'Hextris', mode: 'Focus Development', time: '5m ago', status: 'Completed', score: 1420 },
        { user: 'John Doe', game: '2048', mode: 'Logic Playbook', time: '18m ago', status: 'In Progress', score: 840 },
        { user: 'Ellen Ripley', game: 'Alchemy', mode: 'Creative Mindset', time: '42m ago', status: 'Completed', score: 2100 },
        { user: 'James T. Kirk', game: 'Mahjong Deluxe', mode: 'Memory Warm-up', time: '1h ago', status: 'Completed', score: 1150 },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Enterprise Overview</h1>
                    <p className="text-sm text-slate-400 mt-1">High-level telemetry insights and cognitive development activity.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/corporate/analytics"
                        className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
                    >
                        Detailed Analytics
                    </Link>
                    <Link
                        href="/corporate/challenges/new"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-98 transition-all"
                    >
                        + Create Challenge
                    </Link>
                </div>
            </header>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Managed Members"
                    value="42"
                    subtitle="Managed employees in organization"
                    icon={<MembersIcon />}
                    trend={{ value: '+3 this week', isPositive: true }}
                    color="indigo"
                />
                <MetricCard
                    title="Active Catalog Games"
                    value="12"
                    subtitle="Available catalog puzzle titles"
                    icon={<GamepadIcon />}
                    color="blue"
                />
                <MetricCard
                    title="Total Playtime"
                    value="1,205 hrs"
                    subtitle="Aggregated session time"
                    icon={<ClockIcon />}
                    trend={{ value: '+15.2%', isPositive: true }}
                    color="teal"
                />
                <MetricCard
                    title="Challenge Completion"
                    value="84.3%"
                    subtitle="Active challenge engagement rate"
                    icon={<TrophyIcon />}
                    trend={{ value: '+4.8%', isPositive: true }}
                    color="purple"
                />
            </div>

            {/* Main Content Splitting */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-bold text-white">Live Telemetry Logs</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time session updates from game clients.</p>
                        </div>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                            LIVE
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                                    <th className="pb-3 pl-2">User</th>
                                    <th className="pb-3">Game</th>
                                    <th className="pb-3">Warm-up Mode</th>
                                    <th className="pb-3">Time</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 pr-2 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {recentActivity.map((log, index) => (
                                    <tr key={index} className="hover:bg-slate-800/10 transition-colors">
                                        <td className="py-3.5 pl-2 font-semibold text-white">{log.user}</td>
                                        <td className="py-3.5 text-slate-300">{log.game}</td>
                                        <td className="py-3.5 text-slate-400">{log.mode}</td>
                                        <td className="py-3.5 text-slate-500">{log.time}</td>
                                        <td className="py-3.5">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                                log.status === 'Completed'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-2 font-mono font-bold text-right text-teal-400">{log.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-bold text-white mb-1">Administrative Shortcuts</h2>
                        <p className="text-xs text-slate-500 mb-6">Quick actions for workspace managers.</p>
                        
                        <div className="space-y-3">
                            <Link
                                href="/corporate/members"
                                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-white">Invite Team Members</span>
                                    <span className="text-[10px] text-slate-500 mt-0.5">Add collaborators to Acme Corp.</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            <Link
                                href="/corporate/playbooks"
                                className="flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-white">Review Playbooks</span>
                                    <span className="text-[10px] text-slate-500 mt-0.5">Customize curated cognitive game sets.</span>
                                </div>
                                <svg className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                            Connected via SP-Secure Gateway
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
