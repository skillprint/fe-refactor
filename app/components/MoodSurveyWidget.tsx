'use client';

import React, { useState } from 'react';
import { submitMoodSurvey } from '../api/api';
import BuckyballLoading from './BuckyballLoading'; // Keep an eye out if this needs adjusting
import { useUserSession } from '../hooks/useUserSession';

interface MoodSurveyWidgetProps {
    gameSlug: string;
    targetMood: string;
}

export default function MoodSurveyWidget({ gameSlug, targetMood }: MoodSurveyWidgetProps) {
    const { userToken } = useUserSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedScore, setSelectedScore] = useState<number | null>(null);

    const handleSelection = async (score: number) => {
        setIsSubmitting(true);
        setError(null);
        setSelectedScore(score);

        try {
            const tokenToUse = userToken || (typeof window !== 'undefined' ? localStorage.getItem('userToken') : null);
            await submitMoodSurvey({
                game: gameSlug,
                mood: targetMood,
                score: score
            }, tokenToUse);
            setIsSubmitted(true);
        } catch (err) {
            console.error("Error submitting mood survey:", err);
            setError("Failed to submit feedback. Please try again.");
            setIsSubmitted(false);
            setSelectedScore(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-card border border-border/50 shadow-sm rounded-lg p-6 text-center animate-in fade-in duration-500">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-1">Thank you!</h4>
                <p className="text-sm text-muted-foreground">Your feedback helps us improve game recommendations.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border/50 shadow-sm rounded-lg p-5 mb-6 text-center">
            <h4 className="text-md font-semibold text-foreground mb-2">
                How did you feel after playing this game?
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
                Did this game help you feel more <strong className="capitalize text-foreground">{targetMood}</strong>?
            </p>

            {error && (
                <div className="mb-4 text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-center items-center gap-4 sm:gap-8">
                {/* No (-1) */}
                <button
                    onClick={() => handleSelection(-1)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${selectedScore === -1 ? 'scale-105 opacity-100' : (selectedScore !== null ? 'opacity-50' : '')}`}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 ${selectedScore === -1 ? 'bg-destructive text-destructive-foreground' : 'bg-card border-2 border-border text-muted-foreground hover:border-destructive hover:text-destructive'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                    <span className={`text-sm font-medium ${selectedScore === -1 ? 'text-destructive' : 'text-muted-foreground'}`}>Less {targetMood}</span>
                </button>

                {/* Same (0) */}
                <button
                    onClick={() => handleSelection(0)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${selectedScore === 0 ? 'scale-105 opacity-100' : (selectedScore !== null ? 'opacity-50' : '')}`}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 ${selectedScore === 0 ? 'bg-muted text-foreground' : 'bg-card border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </div>
                    <span className={`text-sm font-medium ${selectedScore === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>Same</span>
                </button>

                {/* Yes (+1) */}
                <button
                    onClick={() => handleSelection(1)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${selectedScore === 1 ? 'scale-105 opacity-100' : (selectedScore !== null ? 'opacity-50' : '')}`}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200 ${selectedScore === 1 ? 'bg-secondary text-secondary-foreground' : 'bg-card border-2 border-border text-muted-foreground hover:border-secondary hover:text-secondary'}`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                    </div>
                    <span className={`text-sm font-medium ${selectedScore === 1 ? 'text-secondary' : 'text-muted-foreground'}`}>More {targetMood}</span>
                </button>
            </div>

            {isSubmitting && (
                <div className="mt-4 flex justify-center">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
