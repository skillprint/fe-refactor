'use client';

import { useState, useRef, useEffect } from 'react';
import { Badge } from '../types';

interface BadgeCardProps {
    badge: Badge;
    onEarnSimulate?: () => void;
}

export default function BadgeCard({ badge, onEarnSimulate }: BadgeCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const infoButtonRef = useRef<HTMLButtonElement>(null);

    // Toggle tooltip for tap (mobile/desktop click)
    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering card click
        setShowTooltip(prev => !prev);
    };

    // Close tooltip if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current && 
                !tooltipRef.current.contains(event.target as Node) &&
                infoButtonRef.current &&
                !infoButtonRef.current.contains(event.target as Node)
            ) {
                setShowTooltip(false);
            }
        };

        if (showTooltip) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTooltip]);

    const hasProgress = badge.progressCurrent !== undefined && badge.progressTarget !== undefined;
    const progressPercent = hasProgress
        ? Math.min(100, Math.round((badge.progressCurrent! / badge.progressTarget!) * 100))
        : 0;

    return (
        <div 
            className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 group
                ${badge.earned 
                    ? 'bg-card/75 border-border/40 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-primary/30' 
                    : 'bg-card/30 border-border/20 shadow-sm opacity-80 hover:opacity-100 hover:border-border/50'
                }
                backdrop-blur-md ${showTooltip ? 'z-30 shadow-2xl' : 'z-10'}`}
        >
            {/* Ambient Background Glow for earned badges (clipped inside card) */}
            {badge.earned && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                    <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${badge.color} blur-2xl opacity-15 group-hover:opacity-30 transition-opacity duration-300`} />
                </div>
            )}

            {/* Top Row: Icon/Image & Info Button */}
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                    {/* Badge Icon Circular Display */}
                    <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform duration-500 group-hover:scale-110 relative
                            ${badge.earned 
                                ? `bg-gradient-to-br ${badge.color} text-white shadow-md` 
                                : 'bg-muted dark:bg-zinc-800 text-muted-foreground grayscale border border-dashed border-border/50'
                            }`}
                    >
                        {badge.earned && (
                            <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                        )}
                        <span>{badge.icon}</span>
                    </div>

                    <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase mb-1
                            ${badge.category === 'cognitive' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
                            ${badge.category === 'focus' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
                            ${badge.category === 'social' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : ''}
                            ${badge.category === 'milestone' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                        `}>
                            {badge.category}
                        </span>
                        <h3 className={`font-bold text-base leading-tight ${badge.earned ? 'text-foreground' : 'text-foreground/70'}`}>
                            {badge.name}
                        </h3>
                    </div>
                </div>

                {/* Info Button with Tooltip Trigger */}
                <div className="relative">
                    <button
                        ref={infoButtonRef}
                        onClick={handleInfoClick}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className={`p-1.5 rounded-full transition-colors flex items-center justify-center
                            ${showTooltip 
                                ? 'bg-primary/10 text-primary' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-zinc-800'
                            }`}
                        aria-label="Badge info"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {/* Tooltip Popup (Glassmorphic) */}
                    <div
                        ref={tooltipRef}
                        className={`absolute right-0 bottom-full mb-2 w-64 p-4 rounded-xl shadow-xl border border-border/40 bg-card/95 backdrop-blur-md z-30 transition-all duration-300 text-sm origin-bottom-right
                            ${showTooltip 
                                ? 'opacity-100 scale-100 translate-y-0 visible' 
                                : 'opacity-0 scale-95 translate-y-2 invisible pointer-events-none'
                            }`}
                    >
                        {/* Little caret arrow */}
                        <div className="absolute right-3.5 top-full w-3 h-3 bg-card border-r border-b border-border/40 transform rotate-45 -translate-y-1.5" />
                        
                        <div className="relative z-10">
                            <p className="font-bold text-foreground mb-1 text-xs uppercase tracking-wide text-primary">
                                Badge Description
                            </p>
                            <p className="text-foreground/90 font-medium mb-2 text-xs leading-relaxed">
                                {badge.longDescription}
                            </p>
                            <div className="h-px bg-border/40 my-2" />
                            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                                <span className="font-semibold text-foreground/80">Source Game:</span>
                                <span className="italic">{badge.gameTitle}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Short Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 relative z-10">
                {badge.description}
            </p>

            {/* Bottom Section: Progress or Date earned */}
            <div className="mt-auto relative z-10">
                {badge.earned ? (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center text-emerald-500 font-semibold">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Earned
                        </span>
                        <span>{badge.date}</span>
                    </div>
                ) : (
                    <div>
                        {hasProgress ? (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{badge.progressCurrent}/{badge.progressTarget}</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-1 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Locked
                                </span>
                                {onEarnSimulate && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEarnSimulate();
                                        }}
                                        className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-md text-[10px] uppercase tracking-wider transition-colors"
                                    >
                                        Unlock
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
