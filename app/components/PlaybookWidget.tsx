'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlaybook } from '../hooks/usePlaybook';
import { getGameDetails } from '../config/gameConfig';
import { useAuth } from '../context/AuthContext';
import GamePreviewShareSheet from './GamePreviewShareSheet';

export const PlaybookWidget: React.FC = () => {
    const { currentPlaybook, progress, isLoaded } = usePlaybook();
    const { status } = useAuth();
    const [previewGameSlug, setPreviewGameSlug] = useState<string | null>(null);

    if (!isLoaded || !currentPlaybook || status === 'partner') {
        return null;
    }

    const { completedGames, percentComplete, isFinished } = progress;

    return (
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Current Playbook
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${currentPlaybook.goal === 'focus' ? 'bg-indigo-100 text-indigo-800' :
                                currentPlaybook.goal === 'learning' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                {currentPlaybook.goal}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{currentPlaybook.title}</h2>
                        <p className="text-muted-foreground mt-1">{currentPlaybook.description}</p>
                    </div>

                    {/* Progress Meter */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-foreground">Progress</span>
                                <span className="text-primary">{percentComplete}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${percentComplete}%` }}
                                />
                            </div>
                        </div>
                        {isFinished && (
                            <div className="bg-green-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Game Sequence */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {currentPlaybook.games.map((slug, index) => {
                        const details = getGameDetails(slug);
                        const isCompleted = completedGames[index];
                        const isLocked = index > 0 && !completedGames[index - 1] && !isCompleted;
                        const isCurrent = !isCompleted && (!isLocked || index === 0);

                        return (
                            <div key={slug} className={`relative group ${isLocked ? 'opacity-50 grayscale' : ''}`}>
                                {/* Connector Line (Desktop) */}
                                {index < currentPlaybook.games.length - 1 && (
                                    <div className="hidden sm:block absolute top-1/2 -right-4 w-8 h-1 bg-border -z-10 transform -translate-y-1/2" />
                                )}

                                <button
                                    disabled={isLocked}
                                    onClick={() => setPreviewGameSlug(slug)}
                                    className={`block text-left w-full bg-background rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${isCurrent
                                        ? 'border-primary ring-4 ring-primary/10 shadow-lg scale-105 z-10'
                                        : isCompleted
                                            ? 'border-green-500/50'
                                            : 'border-border hover:border-primary/50'
                                        } ${isLocked ? 'cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    {/* Status Badge */}
                                    <div className="absolute top-2 right-2 z-20">
                                        {isCompleted ? (
                                            <div className="bg-green-500 text-white p-1 rounded-full shadow-md">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                                PLAY NOW
                                            </div>
                                        ) : (
                                            <div className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                                                {index + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div className="h-24 w-full relative bg-secondary/20">
                                        {details?.image ? (
                                            <img
                                                src={details.image}
                                                alt={details.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">
                                                🎮
                                            </div>
                                        )}
                                        {/* Overlay for Locked */}
                                        {isLocked && (
                                            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-3">
                                        <h3 className="font-bold text-sm text-foreground truncate">{details?.name || slug}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                            {details?.difficulty} • {details?.estimatedTime}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            <GamePreviewShareSheet 
                slug={previewGameSlug} 
                isOpen={!!previewGameSlug} 
                onClose={() => setPreviewGameSlug(null)} 
                source="playbook"
                playbookId={currentPlaybook.id}
            />
        </div>
    );
};
