'use client';

import { useVisualizeMoodProfile } from '../../hooks/useVisualizeMoodProfile';
import BuckyballLoading from '../../components/BuckyballLoading';
import TopNav from '../../components/TopNav';
import Link from 'next/link';

export default function VisualizeMoodProfileTestPage() {
    const { data, isLoading, error } = useVisualizeMoodProfile();

    if (isLoading) {
        return (
            <div className="font-sans min-h-screen bg-background">
                <TopNav />
                <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
                    <BuckyballLoading />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="font-sans min-h-screen bg-background">
                <TopNav />
                <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-destructive">
                    <p>Error loading profile: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen bg-background">
            <TopNav />
            <div className="p-8 pb-32 max-w-6xl mx-auto">
                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Profile
                </Link>

                <h1 className="text-3xl font-bold mb-8 text-foreground">Mood Progression Profile</h1>

                {data ? (
                    <div className="space-y-12">
                        {/* Current Session */}
                        {data.currentSession && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-foreground">Current Session</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <h3 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Target Mood</h3>
                                        <div className="text-3xl font-bold capitalize text-primary">{data.currentSession.targetMood}</div>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <h3 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Flow Score</h3>
                                        <div className="text-3xl font-bold text-foreground">{data.currentSession.flowScore}</div>
                                    </div>
                                    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                                        <h3 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Confidence</h3>
                                        <div className="text-3xl font-bold text-foreground">{data.currentSession.confidence}</div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Weekly Sessions */}
                        {data.weeklySessions && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-foreground">Weekly Sessions</h2>
                                <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                    {data.weeklySessions.filter((s: any) => s.mood !== null).length > 0 ? (
                                        <ul className="divide-y divide-border">
                                            {data.weeklySessions
                                                .filter((s: any) => s.mood !== null)
                                                .map((session: any, i: number) => (
                                                    <li key={i} className="p-4 flex justify-between items-center hover:bg-secondary/50 transition-colors">
                                                        <span className="font-medium text-foreground">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm item-capitalize capitalize font-medium">{session.mood}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <div className="p-6 text-muted-foreground text-center">No recorded moods this week.</div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Yearly Summary */}
                        {data.yearlySummary && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-foreground">Yearly Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {data.yearlySummary.map((summary: any, i: number) => (
                                        <div key={i} className="bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group hover:border-primary/50 transition-colors">
                                            <h3 className="text-2xl font-bold capitalize mb-4 text-foreground">{summary.mood}</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Duration</span>
                                                    <span className="font-semibold text-foreground">{summary.duration}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Momentum</span>
                                                    <span className="font-semibold text-primary">{summary.momentumScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Raw JSON section */}
                        <section>
                            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Raw API Output</h2>
                            <div className="bg-secondary/50 p-6 rounded-lg overflow-x-auto border border-border shadow-inner">
                                <pre className="text-xs text-muted-foreground font-mono">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No profile data available.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
