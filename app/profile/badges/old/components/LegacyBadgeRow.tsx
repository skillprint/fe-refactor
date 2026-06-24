'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { UserAchievementType } from '../types';
import LocalImageAssets from '../assets';

interface LegacyBadgeRowProps {
    badge: UserAchievementType;
    onEarnSimulate?: () => void;
}

export default function LegacyBadgeRow({ badge, onEarnSimulate }: LegacyBadgeRowProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const infoButtonRef = useRef<HTMLButtonElement>(null);

    const isUnlocked = !!badge.userAchievementId;
    const slug = badge.slug;
    
    // Resolve dynamic assets using the copied map
    const iconKey = isUnlocked ? slug : `${slug}-grey`;
    const regKey = isUnlocked ? slug : `${slug}-grey`;
    
    const iconAsset = LocalImageAssets.badges.icons[iconKey];
    const regAsset = LocalImageAssets.badges.regular[regKey];

    // Toggle tooltip for mobile/touch or desktop click
    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
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

    return (
        <div 
            className={`relative flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl border transition-all duration-300 gap-4
                ${isUnlocked 
                    ? 'bg-card/75 border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30' 
                    : 'bg-card/30 border-border/20 shadow-xs opacity-80 hover:opacity-100 hover:border-border/50'
                }
                backdrop-blur-md ${showTooltip ? 'z-30 shadow-xl' : 'z-10'}`}
        >
            {/* Left section: Icon & Meta Details */}
            <div className="flex items-center space-x-4 w-full sm:w-auto relative z-10">
                {/* Copied Badge PNG Image */}
                <div className="w-16 h-16 relative flex-shrink-0 flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-800/50 rounded-2xl p-1 border border-border/10 shadow-inner">
                    {iconAsset ? (
                        <Image 
                            src={iconAsset} 
                            alt={badge.name} 
                            className={`w-14 h-14 object-contain transition-transform duration-500 hover:scale-110`}
                            priority={false}
                        />
                    ) : (
                        <span className="text-2xl">🏆</span>
                    )}
                </div>

                <div className="space-y-1">
                    {badge.triggerTargetAttribute && (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase
                            ${badge.triggerTargetAttribute.attributeType === 'skill' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
                            ${badge.triggerTargetAttribute.attributeType === 'mood' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
                            ${badge.triggerTargetAttribute.attributeType === 'trait' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : ''}
                        `}>
                            {badge.triggerTargetAttribute.name}
                        </span>
                    )}
                    <h3 className={`font-bold text-base ${isUnlocked ? 'text-foreground' : 'text-foreground/70'}`}>
                        {badge.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {badge.triggerDescription}
                    </p>
                </div>
            </div>

            {/* Right Section: Status/Unlock button & Tooltip trigger */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 relative z-10 mt-2 sm:mt-0">
                <div className="flex items-center space-x-3">
                    {isUnlocked ? (
                        <span className="flex items-center text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Unlocked
                        </span>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center text-xs text-muted-foreground bg-muted border border-border/20 px-3 py-1 rounded-xl">
                                <svg className="w-3 h-3 mr-1 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Locked
                            </span>
                            {onEarnSimulate && (
                                <button
                                    onClick={onEarnSimulate}
                                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors border border-primary/20"
                                >
                                    Simulate
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Tooltip trigger button */}
                <div className="relative">
                    <button
                        ref={infoButtonRef}
                        onClick={handleInfoClick}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className={`p-2 rounded-full transition-colors flex items-center justify-center border
                            ${showTooltip 
                                ? 'bg-primary/10 border-primary/30 text-primary' 
                                : 'text-muted-foreground border-border/20 hover:text-foreground hover:bg-muted/50 dark:hover:bg-zinc-800'
                            }`}
                        aria-label="Badge info"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>

                    {/* Popover Tooltip */}
                    <div
                        ref={tooltipRef}
                        className={`absolute right-0 bottom-full mb-2 w-72 p-5 rounded-2xl shadow-2xl border border-border/40 bg-card/95 backdrop-blur-md z-30 transition-all duration-300 text-sm origin-bottom-right
                            ${showTooltip 
                                ? 'opacity-100 scale-100 translate-y-0 visible' 
                                : 'opacity-0 scale-95 translate-y-2 invisible pointer-events-none'
                            }`}
                    >
                        {/* Little caret arrow */}
                        <div className="absolute right-4.5 top-full w-3.5 h-3.5 bg-card border-r border-b border-border/40 transform rotate-45 -translate-y-1.5" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                                Badge Details
                            </span>

                            {/* Large Badge Graphic inside tooltip */}
                            <div className="w-32 h-32 relative mb-4 flex items-center justify-center bg-zinc-100/30 dark:bg-zinc-800/30 rounded-full border border-border/10 shadow-inner">
                                {regAsset ? (
                                    <Image 
                                        src={regAsset} 
                                        alt={badge.name} 
                                        className="w-28 h-28 object-contain"
                                    />
                                ) : (
                                    <span className="text-5xl">🏆</span>
                                )}
                            </div>

                            <h4 className="font-extrabold text-foreground text-sm mb-1">
                                {badge.name}
                            </h4>
                            <p className="text-foreground/90 font-medium text-xs leading-relaxed mb-3">
                                {badge.longDescription}
                            </p>
                            
                            {badge.triggerTargetAttribute && (
                                <div className="w-full h-px bg-border/40 my-2" />
                            )}
                            {badge.triggerTargetAttribute && (
                                <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1">
                                    <span className="font-bold text-foreground/80">Cognitive Link:</span>
                                    <span className="italic">{badge.triggerTargetAttribute.name} ({badge.triggerTargetAttribute.attributeType})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
