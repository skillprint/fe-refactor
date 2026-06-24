'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '../../components/TopNav';
import { useBadges } from './hooks/useBadges';
import { useLegacyBadges } from './old/hooks/useLegacyBadges';
import BadgeGrid from './components/BadgeGrid';
import LegacyBadgeList from './old/components/LegacyBadgeList';
import GoalModal from './components/GoalModal';
import { Badge } from './types';

export default function BadgesTestPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // Hooks for both models
    const { 
        badges, 
        isLoaded: isModernLoaded, 
        earnedBadgesCount, 
        totalBadgesCount, 
        earnBadge, 
        resetBadges 
    } = useBadges();
    
    const { 
        achievements, 
        isLoaded: isLegacyLoaded, 
        earnedCount: earnedLegacyCount, 
        totalCount: totalLegacyCount, 
        earnAchievement, 
        resetAchievements 
    } = useLegacyBadges();

    // Toggle Tab between Modern (Grid) and Legacy (List)
    const [activeTab, setActiveTab] = useState<'modern' | 'legacy'>('modern');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'cognitive' | 'focus' | 'social' | 'milestone'>('all');
    
    // Unified Modal Trigger state
    const [activeUnlockedBadge, setActiveUnlockedBadge] = useState<Badge | null>(null);

    // Filter modern badges based on category selection
    const filteredBadges = badges.filter(badge => {
        if (selectedCategory === 'all') return true;
        return badge.category === selectedCategory;
    });

    // Helper mapping UserAchievementType to unified Badge model
    const mapLegacyToBadge = (achievement: any): Badge => {
        let color = 'from-blue-500 via-indigo-500 to-purple-600';
        if (achievement.slug.includes('mood') || achievement.slug.includes('whale')) {
            color = 'from-cyan-400 via-teal-500 to-emerald-500';
        } else if (achievement.slug.includes('skill') || achievement.slug.includes('score') || achievement.slug.includes('lion')) {
            color = 'from-blue-500 via-purple-500 to-pink-500';
        } else if (achievement.slug.includes('penguin') || achievement.slug.includes('chimpanzee')) {
            color = 'from-amber-400 via-orange-500 to-red-500';
        }
        
        return {
            id: achievement.slug,
            slug: achievement.slug, // Trigger legacy asset lookup inside GoalModal
            name: achievement.name,
            description: achievement.triggerDescription,
            longDescription: achievement.longDescription,
            icon: '', // Loaded from slug
            color: color,
            earned: !!achievement.userAchievementId,
            date: achievement.userAchievementId ? new Date().toISOString().split('T')[0] : undefined,
            gameTitle: achievement.triggerTargetAttribute ? achievement.triggerTargetAttribute.name : 'Gameplay Action',
            gameImage: '',
            category: (achievement.triggerTargetAttribute?.attributeType === 'trait' ? 'milestone' : achievement.triggerTargetAttribute?.attributeType === 'skill' ? 'cognitive' : 'focus') as any
        };
    };

    // Trigger modern badge simulation
    const handleEarnBadge = (badgeId: string) => {
        const newlyEarned = earnBadge(badgeId);
        if (newlyEarned) {
            setActiveUnlockedBadge(newlyEarned);
        } else {
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
            const randomBadge = badges[Math.floor(Math.random() * badges.length)];
            setActiveUnlockedBadge(randomBadge);
        }
    };

    // Trigger legacy achievement simulation
    const handleEarnLegacyBadge = (slug: string) => {
        const newlyEarned = earnAchievement(slug);
        if (newlyEarned) {
            setActiveUnlockedBadge(mapLegacyToBadge(newlyEarned));
        } else {
            const existing = achievements.find(a => a.slug === slug);
            if (existing) {
                setActiveUnlockedBadge(mapLegacyToBadge(existing));
            }
        }
    };

    const handleRandomLegacyEarn = () => {
        const locked = achievements.filter(a => !a.userAchievementId);
        if (locked.length > 0) {
            const randomBadge = locked[Math.floor(Math.random() * locked.length)];
            handleEarnLegacyBadge(randomBadge.slug);
        } else {
            const randomBadge = achievements[Math.floor(Math.random() * achievements.length)];
            setActiveUnlockedBadge(mapLegacyToBadge(randomBadge));
        }
    };

    // Calculate current stats based on active view
    const isLoaded = activeTab === 'modern' ? isModernLoaded : isLegacyLoaded;
    const earnedCount = activeTab === 'modern' ? earnedBadgesCount : earnedLegacyCount;
    const totalCount = activeTab === 'modern' ? totalBadgesCount : totalLegacyCount;
    const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

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
                                {activeTab === 'modern' ? 'Play, Achieve, Unlock' : 'Account Achievements'}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                                {activeTab === 'modern' 
                                    ? 'Complete specific gameplay challenges and cognitive milestones to earn premium badges. Each badge unlocks unique insights into your gaming personality.'
                                    : 'Review the legacy cognitive credentials accrued on your mobile profile. Re-activate completed categories to compare and share your progress.'}
                            </p>
                        </div>

                        {/* Progress Stats Container */}
                        <div className="bg-muted/40 dark:bg-zinc-800/40 border border-border/40 rounded-2xl p-5 min-w-[240px] flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase">
                                    {activeTab === 'modern' ? 'Modern Progress' : 'Legacy Progress'}
                                </span>
                                <span className="text-lg font-black text-foreground">
                                    {earnedCount}/{totalCount}
                                </span>
                            </div>
                            <div className="w-full h-3 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {progressPercent}% of achievements unlocked
                            </span>
                        </div>
                    </div>
                </div>

                {/* View Switcher Tabs (Unified layout switch) */}
                <div className="flex bg-card/60 backdrop-blur-md border border-border/40 p-1.5 rounded-2xl mb-8 max-w-md shadow-sm">
                    <button
                        onClick={() => setActiveTab('modern')}
                        className={`flex-1 py-2.5 text-center font-bold text-xs uppercase tracking-wider rounded-xl transition-all
                            ${activeTab === 'modern' 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Modern Grid View
                    </button>
                    <button
                        onClick={() => setActiveTab('legacy')}
                        className={`flex-1 py-2.5 text-center font-bold text-xs uppercase tracking-wider rounded-xl transition-all
                            ${activeTab === 'legacy' 
                                ? 'bg-primary text-white shadow-md' 
                                : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Legacy List View
                    </button>
                </div>

                {/* Simulator Control Panel (Adapts to Active View) */}
                {activeTab === 'modern' ? (
                    <div className="bg-card/40 border border-border/30 rounded-3xl p-5 mb-8 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-lg">🛠️</span>
                            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                                Modern Badge Simulator
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
                                Reset Modern Badges
                            </button>
                            <div className="h-8 w-px bg-border/40 hidden sm:block align-middle self-center" />
                            <span className="text-xs text-muted-foreground self-center">
                                Earn specific badge:
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
                ) : (
                    <div className="bg-card/40 border border-border/30 rounded-3xl p-5 mb-8 backdrop-blur-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-lg">🛠️</span>
                            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                                Legacy Achievement Simulator
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleRandomLegacyEarn}
                                className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-xs uppercase tracking-wider flex items-center space-x-1.5"
                            >
                                <span>⚡</span>
                                <span>Simulate Random Goal</span>
                            </button>
                            <button
                                onClick={resetAchievements}
                                className="px-4 py-2.5 bg-muted hover:bg-muted-foreground/15 text-foreground border border-border/40 font-bold rounded-xl transition-all active:scale-95 text-xs uppercase tracking-wider"
                            >
                                Reset Legacy Achievements
                            </button>
                            <div className="h-8 w-px bg-border/40 hidden sm:block align-middle self-center" />
                            <span className="text-xs text-muted-foreground self-center">
                                Unlock specific badge:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {achievements.map(a => (
                                    <button
                                        key={a.slug}
                                        onClick={() => handleEarnLegacyBadge(a.slug)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 border
                                            ${a.userAchievementId 
                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20' 
                                                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-border/30 text-foreground'}`}
                                    >
                                        🏷️ {a.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Display Body */}
                {!isLoaded ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'modern' ? (
                    <div>
                        {/* Filters only relevant for Modern Badges */}
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
                                    {cat === 'all' ? 'All Categories' : cat}
                                </button>
                            ))}
                        </div>
                        
                        <BadgeGrid 
                            badges={filteredBadges} 
                            onEarnSimulate={handleEarnBadge}
                        />
                    </div>
                ) : (
                    <LegacyBadgeList 
                        achievements={achievements} 
                        onEarnSimulate={handleEarnLegacyBadge}
                    />
                )}
            </div>

            {/* Goal Reached Modal Overlay (Handles both legacy and modern badge styles seamlessly) */}
            {activeUnlockedBadge && (
                <GoalModal 
                    badge={activeUnlockedBadge} 
                    onClose={() => setActiveUnlockedBadge(null)}
                />
            )}
        </div>
    );
}
