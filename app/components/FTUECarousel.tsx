'use client';

import React, { useState, useEffect } from 'react';

interface Slide {
    title: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
}

const slides: Slide[] = [
    {
        title: 'Build Skills Through Play',
        description: 'Transform learning into an engaging adventure. Play interactive games designed to develop real-world skills while having fun.',
        gradient: 'from-purple-600 via-pink-600 to-red-600',
        icon: (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        title: 'Track Your Progress',
        description: 'Visualize your skill development journey with beautiful charts and insights. Watch yourself grow and celebrate every milestone.',
        gradient: 'from-blue-600 via-cyan-600 to-teal-600',
        icon: (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        title: 'Personalized Journey',
        description: 'Get tailored skill recommendations based on your interests and progress. Your unique path to mastery starts here.',
        gradient: 'from-green-600 via-emerald-600 to-teal-600',
        icon: (
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

const COOKIE_NAME = 'ftue_completed';
const COOKIE_EXPIRY_DAYS = 365;

export default function FTUECarousel() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

    useEffect(() => {
        // Check if FTUE has been completed
        const hasCompletedFTUE = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${COOKIE_NAME}=`));

        if (!hasCompletedFTUE) {
            // Small delay to ensure smooth entrance animation
            setTimeout(() => setIsVisible(true), 100);
        }
    }, []);

    const setCookie = () => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
        document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/`;
    };

    const handleClose = () => {
        setCookie();
        setIsVisible(false);
    };

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ftue-title"
        >
            {/* Skip Button */}
            <button
                onClick={handleSkip}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10"
                aria-label="Skip introduction"
            >
                Skip
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
                            <div className="flex justify-center mb-8">
                                <div className={`text-white bg-gradient-to-br ${currentSlideData.gradient} p-6 rounded-2xl shadow-lg`}>
                                    {currentSlideData.icon}
                                </div>
                            </div>

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
                                aria-label={isLastSlide ? 'Get started' : 'Next slide'}
                            >
                                {isLastSlide ? 'Get Started' : 'Next'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Text */}
                <div className="text-center mt-4 text-white/60 text-sm">
                    {currentSlide + 1} of {slides.length}
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
      `}</style>
        </div>
    );
}
