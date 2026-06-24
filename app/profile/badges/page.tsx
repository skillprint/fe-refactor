'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '../../components/TopNav';
import { useBadges } from './hooks/useBadges';
import BadgeGrid from './components/BadgeGrid';
import GoalModal from './components/GoalModal';
import { Badge } from './types';

export default function BadgesTestPage() {
    const router = useRouter();
    const { badges, isLoaded, earnedBadgesCount, totalBadgesCount, earnBadge, resetBadges } = useBadges();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'cognitive' | 'focus' | 'social' | 'milestone'>('all');
    const [activeUnlockedBadge, setActiveUnlockedBadge] = useState<Badge | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filter badges based on category selection
    const filteredBadges = badges.filter(badge => {
        if (selectedCategory === 'all') return true;
        return badge.category === selectedCategory;
    });

    const handleEarnBadge = (badgeId: string) => {
        const newlyEarned = earnBadge(badgeId);
        if (newlyEarned) {
            setActiveUnlockedBadge(newlyEarned);
        } else {
            // Already earned, let's just showcase it in the modal
            const existingBadge = badges.find(b => b.id === badgeId);
            if (existingBadge) {
                setActiveUnlockedBadge(existingBadge);
            }
        }
    };

    const handleRandomEarn = () => {
        const lockedBadges = badges.filter(b => !b.earned);
        if (lockedBadges.length > 0) {
            const randomBadge = lockedBadges[Math.floor(Math.random() * lockedBadges.length)];
            handleEarnBadge(randomBadge.id);
        } else {
            // If all earned, showcase a random one
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];
            setActiveUnlockedBadge(randomBadge);
        }
    };

    const overallProgressPercent = totalBadgesCount > 0 
        ? Math.round((earnedBadgesCount / totalBadgesCount) * 100) 
        : 0;

    return (
        <div className="font-sans min-h-screen bg-background text-foreground pb-24">
            <TopNav />

            <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Back Link */}
                <button
                    onClick={() => startTransition(() => router.push('/profile'))}
                    disabled={isPending}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group disabled:opacity-50"
                >
                    <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back to Profile</span>
                </button>

                {/* Hero Header Card */}
                <div className="relative overflow-hidden bg-card/60 backdrop-blur-md rounded-3xl border border-border/40 p-6 sm:p-8 mb-8 shadow-xl">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                Badges & Goals
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-foreground">
                                Play, Achieve, Unlock
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                Complete specific gameplay challenges and cognitive milestones to earn premium badges. Each badge unlocks unique insights into your gaming personality.
                            </p>
                        </div>

                        {/* Progress Stats Container */}
                        <div className="bg-muted/40 dark:bg-zinc-800/40 border border-border/40 rounded-2xl p-5 min-w-[240px] flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                    Overall Progress
                                </span>
                                <span className="text-lg font-black text-foreground">
                                    {earnedBadgesCount}/{totalBadgesCount}
                                </span>
                            </div>
                            <div className="w-full h-3 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${overallProgressPercent}%` }}
                                />
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {overallProgressPercent}% of total badges unlocked
                            </span>
                        </div>
                    </div>
                </div>

                {/* Simulation Control Panel */}
                <div className="bg-card/40 border border-border/30 rounded-3xl p-5 mb-8 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-lg">🛠️</span>
                        <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                            Badge Achievement Simulator
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleRandomEarn}
                            className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-xs uppercase tracking-wider flex items-center space-x-1.5"
                        >
                            <span>⚡</span>
                            <span>Simulate Random Goal</span>
                        </button>
                        <button
                            onClick={resetBadges}
                            className="px-4 py-2.5 bg-muted hover:bg-muted-foreground/15 text-foreground border border-border/40 font-bold rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider"
                        >
                            Reset Demo States
                        </button>
                        <div className="h-8 w-px bg-border/40 hidden sm:block align-middle self-center" />
                        <span className="text-xs text-muted-foreground self-center">
                            Or choose a badge:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {badges.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => handleEarnBadge(b.id)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 border
                                        ${b.earned 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' 
                                            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-border/30 text-foreground'}`}
                                >
                                    {b.icon} {b.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex overflow-x-auto space-x-2 pb-4 mb-8 no-scrollbar scroll-smooth">
                    {(['all', 'cognitive', 'focus', 'social', 'milestone'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap
                                ${selectedCategory === cat
                                    ? 'bg-foreground text-background border-foreground shadow-sm'
                                    : 'bg-card/40 border-border/30 text-muted-foreground hover:text-foreground hover:bg-card/75'
                                }`}
                        >
                            {cat === 'all' ? 'All Badges' : cat}
                        </button>
                    ))}
                </div>

                {/* Badge Grid */}
                {!isLoaded ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <BadgeGrid 
                        badges={filteredBadges} 
                        onEarnSimulate={handleEarnBadge}
                    />
                )}
            </div>

            {/* Goal Reached Modal Overlay */}
            {activeUnlockedBadge && (
                <GoalModal 
                    badge={activeUnlockedBadge} 
                    onClose={() => setActiveUnlockedBadge(null)}
                />
            )}
        </div>
    );
}
