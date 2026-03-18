'use client';

import { useVisualizeSkillProfile } from '../../hooks/useVisualizeSkillProfile';
import BuckyballLoading from '../../components/BuckyballLoading';
import TopNav from '../../components/TopNav';
import Link from 'next/link';

export default function VisualizeSkillProfileTestPage() {
    const { data, isLoading, error } = useVisualizeSkillProfile();

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

                <h1 className="text-3xl font-bold mb-8 text-foreground">Skill Progression Profile</h1>

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

                        {/* Yearly Summary */}
                        {data.yearlySummary && Object.keys(data.yearlySummary).length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-foreground">Skill Breakdown (Yearly)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {Object.entries(data.yearlySummary).map(([skillName, details]: [string, any]) => (
                                        <div key={skillName} className="bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group hover:border-primary/50 transition-colors">
                                            <h3 className="text-lg font-bold capitalize mb-4 text-foreground">{skillName.replace('-', ' ')}</h3>

                                            <div className="mb-4">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-2xl font-bold text-primary">{details.progress}</span>
                                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Score</span>
                                                </div>
                                                <div className="w-full bg-secondary rounded-full h-2">
                                                    <div className="bg-primary h-2 rounded-full" style={{ width: `${details.progress}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Rating</span>
                                                    <span className="font-semibold text-foreground">{details.rating}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                                                    <span className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">Entries</span>
                                                    <span className="font-semibold text-foreground">{details.entriesCount}</span>
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
