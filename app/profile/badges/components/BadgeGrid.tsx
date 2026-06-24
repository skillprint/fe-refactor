'use client';

import { Badge } from '../types';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
    badges: Badge[];
    onEarnSimulate?: (badgeId: string) => void;
}

export default function BadgeGrid({ badges, onEarnSimulate }: BadgeGridProps) {
    const earnedBadges = badges.filter(b => b.earned);
    const unearnedBadges = badges.filter(b => !b.earned);

    if (badges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/40 bg-card/25 backdrop-blur-md">
                <span className="text-5xl mb-4">🔮</span>
                <h3 className="text-xl font-bold text-foreground mb-1">No Badges Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                    No badges match the selected filter category. Try selecting another filter!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Earned Badges Section */}
            {earnedBadges.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-6">
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                            Earned Badges
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                            {earnedBadges.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {earnedBadges.map((badge) => (
                            <BadgeCard 
                                key={badge.id} 
                                badge={badge} 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Unearned / Available Badges Section */}
            {unearnedBadges.length > 0 && (
                <div>
                    <div className="flex items-center space-x-2 mb-6">
                        <h2 className="text-xl font-extrabold text-foreground/80 tracking-tight">
                            Available to Earn
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground text-xs font-bold border border-border/20">
                            {unearnedBadges.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unearnedBadges.map((badge) => (
                            <BadgeCard 
                                key={badge.id} 
                                badge={badge} 
                                onEarnSimulate={onEarnSimulate ? () => onEarnSimulate(badge.id) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
