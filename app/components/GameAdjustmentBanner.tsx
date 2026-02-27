import React, { useEffect, useState } from 'react';

interface GameAdjustmentBannerProps {
    parameterName: string;
    parameterValue: any;
    onDismiss?: () => void;
}

const PARAMETER_LABELS: Record<string, string> = {
    creationSpeedModifier: 'Game Pace',
    speedModifier: 'Game Speed',
    comboTime: 'Combo Duration',
    hexagonSpeed: 'Rotation Speed',
};

const MOOD_ICONS: Record<string, string> = {
    'Focus': '/images/mindsets/Focus.png',
    'Relax': '/images/mindsets/Relax.png',
    'Collaboration': '/images/mindsets/Collaboration.png',
    'Innovate': '/images/mindsets/Innovate.png',
    'Grit': '/images/mindsets/Grit.png',
    'Joy': '/images/mindsets/Joy.png',
    'Curiosity': '/images/mindsets/Curiosity.png',
    'Empathy': '/images/mindsets/Empathy.png',
    'Awe': '/images/mindsets/Awe.png'
};

const getParameterLabel = (name: string) => PARAMETER_LABELS[name] || name.replace(/([A-Z])/g, ' $1').trim();

const formatValue = (name: string, value: any) => {
    if (Array.isArray(value)) {
        return `[${value.join(', ')}]`;
    }
    if (typeof value !== 'number') {
        return String(value);
    }
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
    const [contextMood, setContextMood] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedMood = localStorage.getItem('targetMood');
            if (storedMood) {
                setContextMood(storedMood.charAt(0).toUpperCase() + storedMood.slice(1));
            }
        } catch (e) {
            console.error("Could not read target mood from localStorage", e);
        }

        console.log("Showing banner");
        setIsVisible(true);
        let dismissTimer: ReturnType<typeof setTimeout>;
        const timer = setTimeout(() => {
            setIsVisible(false);
            dismissTimer = setTimeout(() => {
                if (onDismiss) onDismiss();
            }, 500);
        }, 3000); // Show for 3 seconds

        return () => {
            clearTimeout(timer);
            clearTimeout(dismissTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parameterName, parameterValue]);

    if (!isVisible && !parameterName) return null;

    const iconPath = contextMood ? (MOOD_ICONS[contextMood] || `/images/mindsets/${contextMood}.png`) : null;

    return (
        <div
            className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        >
            <div className="bg-black/80 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 min-w-[300px] justify-center">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="flex flex-col items-start w-full">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Adjustment</span>

                        {contextMood && (
                            <div className="flex items-center gap-1.5 opacity-80 bg-white/10 px-2 py-0.5 rounded-full ml-3">
                                <span className="text-[10px] uppercase text-indigo-200 font-semibold tracking-wider">Targeting:</span>
                                {iconPath && (
                                    <img
                                        src={iconPath}
                                        alt={contextMood}
                                        className="w-3 h-3 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                <span className="text-[10px] text-white font-medium">{contextMood}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-bold text-lg">{getParameterLabel(parameterName)}</span>
                        <span className="text-indigo-400 font-mono font-bold">{formatValue(parameterName, parameterValue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
