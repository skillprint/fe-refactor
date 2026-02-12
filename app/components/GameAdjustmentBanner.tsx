import React, { useEffect, useState } from 'react';

interface GameAdjustmentBannerProps {
    parameterName: string;
    parameterValue: number;
    onDismiss?: () => void;
}

const PARAMETER_LABELS: Record<string, string> = {
    creationSpeedModifier: 'Game Pace',
    speedModifier: 'Game Speed',
    comboTime: 'Combo Duration',
    hexagonSpeed: 'Rotation Speed',
};

const getParameterLabel = (name: string) => PARAMETER_LABELS[name] || name.replace(/([A-Z])/g, ' $1').trim();

const formatValue = (name: string, value: number) => {
    // Round to 1 decimal for cleanliness
    const rounded = Math.round(value * 10) / 10;

    // Add signs or units if known
    if (name.toLowerCase().includes('speed') || name.toLowerCase().includes('modifier')) {
        return `${rounded}x`;
    }
    if (name.toLowerCase().includes('time')) {
        return `${rounded}s`;
    }
    return rounded.toString();
}

export default function GameAdjustmentBanner({ parameterName, parameterValue, onDismiss }: GameAdjustmentBannerProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        console.log("Showing banner");
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onDismiss) {
                console.log("Hiding banner");
                setTimeout(onDismiss, 500); // Allow exit animation
            }
        }, 3000); // Show for 3 seconds

        return () => clearTimeout(timer);
    }, [parameterName, parameterValue, onDismiss]);

    if (!isVisible && !parameterName) return null;

    return (
        <div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
            <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 min-w-[300px] justify-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Game Updated</span>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">{getParameterLabel(parameterName)}</span>
                        <span className="text-indigo-400 font-mono font-bold">{formatValue(parameterName, parameterValue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
