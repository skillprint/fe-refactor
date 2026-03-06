'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGoal, GOAL_OPTIONS } from '../hooks/useGoal';

interface Slide {
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    content?: React.ReactNode;
}

import { useAuth } from '../context/AuthContext';

const COOKIE_NAME = 'ftue_completed';
const COOKIE_EXPIRY_DAYS = 365;

export default function FTUECarousel() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
    const { goal, setGoal } = useGoal();
    const { status } = useAuth();

    useEffect(() => {
        // Only trigger FTUE if the user has formally logged in (bypassing Welcome screen)
        if (status === 'loggedOut' || status === 'partner') return;

        // Check if FTUE has been completed
        const hasCompletedFTUE = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${COOKIE_NAME}=`));

        if (!hasCompletedFTUE) {
            // Small delay to ensure smooth entrance animation after WelcomeScreen fades
            setTimeout(() => setIsVisible(true), 150);
        }
    }, [status]);

    const setCookie = () => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
        document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
    };

    const handleClose = () => {
        setCookie();
        setIsVisible(false);
    };

    const slides: Slide[] = [
        {
            title: 'Build Skills Through Play',
            description: 'To get started, we need you to play a few games to get a profile calculated. Unlock your personalized profile by playing interactive games designed to develop real-world skills while you play.',
            gradient: 'from-secondary via-accent to-destructive',
            icon: (
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {/* User Profile */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    {/* Stats / Building */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 21v-4m3 4v-6m3 6v-3" />
                    {/* Game / Play Indicator */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 10l4 2-4 2V10z" fill="currentColor" fillOpacity="0.2" />
                </svg>
            ),
        },
        {
            title: 'Set Your Goal',
            description: 'Why do you want to use Skillprint? Games are adaptive and will adjust depending on your goals and how you play.',
            gradient: 'from-purple-600 via-violet-600 to-indigo-600',
            icon: null,
            content: (
                <div className="flex flex-col gap-3 mt-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {GOAL_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setGoal(option.id)}
                            className={`p-4 rounded-xl text-left transition-all duration-200 border ${goal === option.id
                                ? 'bg-white text-purple-900 border-white shadow-xl scale-[1.02]'
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/30'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-lg">{option.title}</h3>
                                {goal === option.id && (
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <ul className="space-y-1 mt-2 list-none">
                                {option.details.map((detail, idx) => (
                                    <li key={idx} className={`text-sm flex list-none items-start gap-2 ${goal === option.id ? 'text-purple-800/80' : 'text-white/60'}`}>
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </button>
                    ))}
                </div>
            )
        },
        {
            title: 'Explore different moods and skills through gameplay',
            description: 'Play games that target specific moods or skills to build your profile and unlock new content.',
            gradient: 'from-blue-600 via-cyan-600 to-teal-600',
            icon: null,
            content: (
                <div className="flex flex-col gap-4 mt-6">
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/games?tab=moods&filter=focus" onClick={handleClose} className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors text-white text-sm font-medium">
                            Focus
                        </Link>
                        <Link href="/games?tab=moods&filter=relax" onClick={handleClose} className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors text-white text-sm font-medium">
                            Relax
                        </Link>
                        <Link href="/games?tab=skills&filter=memory" onClick={handleClose} className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30 hover:bg-violet-500/30 transition-colors text-white text-sm font-medium">
                            Memory
                        </Link>
                        <Link href="/games?tab=skills&filter=logic" onClick={handleClose} className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors text-white text-sm font-medium">
                            Logic
                        </Link>
                    </div>
                </div>
            )
        },
        {
            title: 'Browse our games',
            description: 'Jump right into the action and build your profile by playing games.',
            gradient: 'from-green-600 via-emerald-600 to-teal-600',
            icon: null,
            content: (
                <div className="flex flex-col gap-4 mt-6 items-center">
                    <Link href="/game/hextris/interstitial" onClick={handleClose} className="w-full max-w-xs group">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:scale-105 transition-transform duration-300">
                            <div className="h-32 flex items-center justify-center relative bg-[url('https://skillprint-api-static.s3.us-west-2.amazonaws.com/static/images/Hextris.png')] bg-cover">
                                <span className="text-2xl font-bold text-white/50 group-hover:text-white transition-colors">Hextris</span>
                            </div>
                            <div className="p-3 text-left">
                                <div className="font-semibold text-white">Hextris</div>
                                <div className="text-xs text-white/60">Fast-paced puzzle game</div>
                            </div>
                        </div>
                    </Link>
                    <Link href="/games" onClick={handleClose} className="text-white/80 hover:text-white text-sm font-medium underline decoration-white/30 hover:decoration-white transition-all">
                        View all games
                    </Link>
                </div>
            )
        },
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setSlideDirection('right');
            setCurrentSlide(currentSlide + 1);
        } else {
            handleClose();
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setSlideDirection('left');
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleSkip = () => {
        handleClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isVisible) return;

        if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'ArrowLeft') {
            handlePrevious();
        } else if (e.key === 'Escape') {
            handleSkip();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, currentSlide]);

    if (!isVisible) return null;

    const isLastSlide = currentSlide === slides.length - 1;
    const currentSlideData = slides[currentSlide];

    return (
        <div
            className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ftue-title"
        >
            {/* Close Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10 z-50"
                aria-label="Close"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Main Content Container */}
            <div className="relative w-full max-w-2xl mx-4 overflow-hidden">
                {/* Glassmorphism Card */}
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-20 rounded-3xl transition-all duration-700`} />

                    {/* Content */}
                    <div className="relative z-10">
                        {/* Slide Content */}
                        <div
                            key={currentSlide}
                            className={`text-center transition-all duration-500 ${slideDirection === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                                }`}
                        >
                            {/* Icon */}
                            {currentSlideData.icon && (
                                <div className="flex justify-center mb-8">
                                    <div className={`text-white bg-gradient-to-br ${currentSlideData.gradient} p-6 rounded-2xl shadow-lg`}>
                                        {currentSlideData.icon}
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <h2
                                id="ftue-title"
                                className="text-3xl md:text-4xl font-bold text-white mb-4"
                            >
                                {currentSlideData.title}
                            </h2>

                            {/* Description */}
                            <p className="text-lg text-white/90 leading-relaxed mb-8">
                                {currentSlideData.description}
                            </p>
                            {currentSlideData.content}
                            <div className="h-8"></div>
                        </div>

                        {/* Slide Indicators */}
                        <div className="flex justify-center gap-2 mb-8">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setSlideDirection(index > currentSlide ? 'right' : 'left');
                                        setCurrentSlide(index);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/40 hover:bg-white/60'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={index === currentSlide ? 'true' : 'false'}
                                />
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center gap-4">
                            {/* Previous Button */}
                            <button
                                onClick={handlePrevious}
                                disabled={currentSlide === 0}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${currentSlide === 0
                                    ? 'opacity-0 pointer-events-none'
                                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                                    }`}
                                aria-label="Previous slide"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            {/* Next/Get Started Button */}
                            <button
                                onClick={handleNext}
                                className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-200 bg-gradient-to-r ${currentSlideData.gradient} hover:shadow-lg hover:scale-105 text-white`}
                                aria-label={isLastSlide ? 'Play!' : 'Next slide'}
                            >
                                {isLastSlide ? 'Play!' : 'Next'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
        </div >
    );
}
