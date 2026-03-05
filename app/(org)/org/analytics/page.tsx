"use client";
import { useState, useEffect } from "react";

const Activity = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const Clock = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const PieChart = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>;
const Target = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const AlertCircle = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>;

interface AnalyticsData {
    totalPlaytimeHours: number;
    playtimeTrend: string;
    totalSessions: number;
    sessionsTrend: string;
    topGames: { name: string; sessions: number }[];
    focusDistribution: {
        mood: number;
        skill: number;
    };
}

export default function OrgAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const res = await fetch("/api/org/analytics");
                const json = await res.json();

                if (json.success) {
                    setData(json.data);
                } else {
                    setError(json.error || "Failed to fetch analytics");
                }
            } catch (err) {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        }
        fetchAnalytics();
    }, []);

    return (
        <div className="min-h-full p-8 lg:p-12 space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
            <header className="space-y-1">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 drop-shadow-sm">
                    Analytics & Usage
                </h1>
                <p className="text-base font-medium text-neutral-400">
                    Telemetry insights aggregated from your external systems.
                </p>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold mb-1">Error Loading Data</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            ) : data ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Total Playtime</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-bold text-white">{data.totalPlaytimeHours.toLocaleString()}h</h3>
                                    <span className="text-emerald-400 text-sm font-semibold mb-1">{data.playtimeTrend}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Game Sessions</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-bold text-white">{data.totalSessions.toLocaleString()}</h3>
                                    <span className="text-emerald-400 text-sm font-semibold mb-1">{data.sessionsTrend}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-4xl">
                        {/* Top Games Section */}
                        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                Top Games Played
                            </h2>
                            <div className="space-y-4">
                                {data.topGames.map((game: { name: string; sessions: number }, i: number) => {
                                    const maxSessions = data.topGames[0].sessions;
                                    const pct = Math.round((game.sessions / maxSessions) * 100);
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-white">{game.name}</span>
                                                <span className="text-neutral-400">{game.sessions.toLocaleString()} sessions</span>
                                            </div>
                                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Focus Distribution */}
                        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-sm">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-400" />
                                Focus Distribution
                            </h2>
                            <div className="flex flex-col h-full justify-center pb-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-white">Mood Focus ({data.focusDistribution.mood}%)</span>
                                    <span className="text-sm font-semibold text-white">Skill Focus ({data.focusDistribution.skill}%)</span>
                                </div>
                                <div className="flex h-6 rounded-full overflow-hidden shadow-sm">
                                    <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${data.focusDistribution.mood}%` }} />
                                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${data.focusDistribution.skill}%` }} />
                                </div>
                                <div className="mt-6 text-sm text-neutral-400 leading-relaxed text-center px-4">
                                    Users in your organization spend <strong>{data.focusDistribution.mood}%</strong> of their time exploring mood-based outcomes.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
