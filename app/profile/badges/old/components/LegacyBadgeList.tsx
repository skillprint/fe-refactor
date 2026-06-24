'use client';

import { UserAchievementType } from '../types';
import LegacyBadgeRow from './LegacyBadgeRow';

interface LegacyBadgeListProps {
    achievements: UserAchievementType[];
    onEarnSimulate?: (slug: string) => void;
}

export default function LegacyBadgeList({ achievements, onEarnSimulate }: LegacyBadgeListProps) {
    const unlocked = achievements.filter(a => !!a.userAchievementId);
    const locked = achievements.filter(a => !a.userAchievementId);

    if (achievements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/40 bg-card/25 backdrop-blur-md">
                <span className="text-5xl mb-4">🔮</span>
                <h3 className="text-xl font-bold text-foreground mb-1">No Achievements Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    No achievements are available in this view.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Unlocked Achievements */}
            {unlocked.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                            Unlocked Achievements
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                            {unlocked.length}
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {unlocked.map((badge) => (
                            <LegacyBadgeRow 
                                key={badge.slug} 
                                badge={badge} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Achievements */}
            {locked.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-xl font-extrabold text-foreground/80 tracking-tight">
                            Available Achievements
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground text-xs font-bold border border-border/20">
                            {locked.length}
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {locked.map((badge) => (
                            <LegacyBadgeRow 
                                key={badge.slug} 
                                badge={badge} 
                                onEarnSimulate={onEarnSimulate ? () => onEarnSimulate(badge.slug) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
