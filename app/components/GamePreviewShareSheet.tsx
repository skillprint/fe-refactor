'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGameDetails } from '../config/gameConfig';
import { getGameBySlug } from '../api/api';
import { getAdaptiveParametersForGame } from '../utils/adaptiveParameters';

const SKILL_ICONS: Record<string, string> = {
    // Explicit mappings for known deviations or preferred naming
    'Deduction': '/images/skills/DeductiveReasoning.png',
    'Attention': '/images/skills/SelectiveAttention.png',
    'Memory': '/images/skills/Memorization.png',
    'Logic': '/images/skills/DeductiveReasoning.png', // Fallback
    // Direct matches that might need help
    'Perceptual Speed': '/images/skills/PerceptualSpeed.png',
    'Speed Of Closure': '/images/skills/SpeedOfClosure.png',
    'Selective Attention': '/images/skills/SelectiveAttention.png',
    'Task Switching': '/images/skills/TaskSwitching.png',
    'Information Ordering': '/images/skills/InformationOrdering.png',
    'Inductive Reasoning': '/images/skills/InductiveReasoning.png',
    'Deductive Reasoning': '/images/skills/DeductiveReasoning.png',
    'Number Facility': '/images/skills/NumberFacility.png',
    'Visualization': '/images/skills/Visualization.png',
};

const MOOD_ICONS: Record<string, string> = {
    'Focus': '/images/mindsets/Focus.png',
    'Relax': '/images/mindsets/Relax.png',
    'Collaboration': '/images/mindsets/Collaboration.png',
    'Innovate': '/images/mindsets/Innovate.png',
};

interface GamePreviewShareSheetProps {
    slug: string | null;
    isOpen: boolean;
    onClose: () => void;
    source?: string;
    playbookId?: string;
}

export default function GamePreviewShareSheet({ slug, isOpen, onClose, source, playbookId }: GamePreviewShareSheetProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [gameApiData, setGameApiData] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [showUI, setShowUI] = useState(false);

    // Fetch game data when slug changes or modal opens
    useEffect(() => {
        if (!isOpen || !slug) return;

        const decodedSlug = decodeURIComponent(slug);
        const fetchGameData = async () => {
            try {
                const data = await getGameBySlug(decodedSlug);
                if (data) {
                    setGameApiData(data);
                }
            } catch (error) {
                console.error("Error fetching game data:", error);
            }
        };
        fetchGameData();
    }, [slug, isOpen]);

    // Handle mount/unmount and animations
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setIsMounted(true);
            const timer = setTimeout(() => setShowUI(true), 10);
            return () => clearTimeout(timer);
        } else if (isMounted) {
            document.body.style.overflow = 'auto';
            setShowUI(false);
            const timer = setTimeout(() => {
                setIsMounted(false);
                setIsLoading(false); // reset loading state if closed
            }, 300); // Wait for transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen, isMounted]);

    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (!isMounted || !slug) return null;

    const decodedSlug = decodeURIComponent(slug);
    const gameDetails = getGameDetails(decodedSlug);

    if (!gameDetails) {
        return null;
    }

    const handleStartGame = () => {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (source) params.set('source', source);
        if (playbookId) params.set('playbookId', playbookId);

        const queryString = params.toString();
        const url = `/game/${encodeURIComponent(decodedSlug)}${queryString ? `?${queryString}` : ''}`;
        router.push(url);
    };

    const displayImage = gameDetails.image || gameApiData?.image;
    const adaptiveParams = getAdaptiveParametersForGame(decodedSlug);
    const combinedSkills = gameApiData?.skills || gameDetails.skills?.map((s: string) => ({ name: s, slug: s.toLowerCase().replace(/ /g, '-') }));

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4 perspective-1000">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${showUI ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
                aria-label="Close share sheet overlay"
            />

            {/* Sheet Container */}
            <div className={`relative w-full sm:max-w-md lg:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out sm:ease-in-out ${showUI
                ? 'translate-y-0 sm:scale-100 opacity-100'
                : 'translate-y-full sm:translate-y-4 sm:scale-95 opacity-0'
                }`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex absolute top-4 right-4 z-20 items-center justify-center w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Cover Image */}
                <div className="relative w-full h-48 sm:h-56 shrink-0">
                    {displayImage ? (
                        <div className="w-full h-full relative">
                            <img
                                src={displayImage}
                                alt={gameDetails.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center relative">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        </div>
                    )}
                    <h2 className="absolute bottom-4 left-6 text-3xl font-bold text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                        {gameDetails.name}
                    </h2>
                </div>

                {/* Details Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
                    <div className="space-y-6">
                        {/* Summary / Category */}
                        {gameDetails.category && (
                            <div>
                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-2">
                                    {gameDetails.category}
                                </span>
                            </div>
                        )}

                        {gameDetails.description && (
                            <p className="text-foreground/90 leading-relaxed text-[15px]">
                                {gameDetails.description}
                            </p>
                        )}

                        {gameDetails.estimatedTime && (
                            <div className="flex items-center text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                                <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium mr-2">Est. Time:</span>
                                {gameDetails.estimatedTime}
                            </div>
                        )}

                        <hr className="border-border/50" />

                        {/* Skills Section */}
                        {combinedSkills && combinedSkills.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Skills Developed</h4>
                                <div className="flex flex-wrap gap-2">
                                    {combinedSkills.map((skill: any, index: number) => {
                                        const iconPath = SKILL_ICONS[skill.name] || SKILL_ICONS[skill.name.replace(/\s+/g, '')] || `/images/skills/${skill.name.replace(/\s+/g, '')}.png`;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl shadow-sm"
                                            >
                                                <img
                                                    src={iconPath}
                                                    alt={skill.name}
                                                    className="w-5 h-5 object-contain rounded-[4px]"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/logo192.png';
                                                    }}
                                                />
                                                <span className="text-sm font-semibold text-foreground">
                                                    {skill.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Moods Section */}
                        {gameApiData?.moods?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Moods</h4>
                                <div className="flex flex-wrap gap-2">
                                    {gameApiData.moods.map((mood: any, index: number) => {
                                        const iconPath = MOOD_ICONS[mood.name] || `/images/mindsets/${mood.name.replace(/\s+/g, '')}.png`;
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl shadow-sm"
                                            >
                                                <img
                                                    src={iconPath}
                                                    alt={mood.name}
                                                    className="w-5 h-5 object-contain rounded-[4px]"
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = '/logo192.png';
                                                    }}
                                                />
                                                <span className="text-sm font-semibold text-foreground">
                                                    {mood.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Adaptive Features Section */}
                        {adaptiveParams.length > 0 && (
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/30">
                                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-400 mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                    </svg>
                                    Adapts to You
                                </h4>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {adaptiveParams.map((paramName, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-white dark:bg-black/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full shadow-sm border border-indigo-100/50 dark:border-indigo-800/30"
                                        >
                                            {paramName}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-indigo-600/80 dark:text-indigo-300/80 leading-snug">
                                    This game actively adjusts these features based on your performance to optimize learning.
                                </p>
                            </div>
                        )}

                        {/* Instructions */}
                        {gameDetails.instructions && (
                            <div>
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">How to Play</h4>
                                <p className="text-foreground/90 text-sm leading-relaxed bg-secondary/20 p-4 rounded-xl border border-secondary/40 whitespace-pre-line">
                                    {gameDetails.instructions}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Action Bottom Bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-background/80 backdrop-blur-md border-t border-border pt-4 pb-6 sm:pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleStartGame}
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 hover:scale-[1.02] transform disabled:scale-100 disabled:bg-primary/50 text-primary-foreground font-bold text-lg py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-primary/25"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-play-fill" viewBox="0 0 16 16">
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                </svg>
                                Play Game
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
