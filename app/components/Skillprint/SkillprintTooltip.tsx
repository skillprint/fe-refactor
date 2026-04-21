
import React from 'react';

export interface SkillprintTooltipProps {
    isVisible: boolean;
    position: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
    title: string;
    group: string;
    yearlySummary?: {
        mood?: string;
        skill?: string;
        duration?: string;
        momentumScore?: number;
    };
    weeklySessions?: Array<{
        date: string;
        mood?: string | null;
        skill?: string | null;
    }>;
    currentSession?: {
        targetMood?: string;
        skill?: string;
        flowScore?: number;
    };
    recentGame?: {
        name: string;
        playedAt: string;
        score?: number;
    };
    onPlayAgain?: () => void;
    onFilterGames?: () => void;
    onViewDetails?: () => void;
}

const SkillprintTooltip: React.FC<SkillprintTooltipProps> = ({
    isVisible,
    position,
    title,
    group,
    yearlySummary,
    weeklySessions,
    currentSession,
    recentGame,
    onPlayAgain,
    onFilterGames,
    onViewDetails,
}) => {
    if (!isVisible) return null;

    // Calculate position styles
    const style: React.CSSProperties = {
        position: 'absolute',
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)', // Default to top-centered above point
        zIndex: 50,
    };

    // Adjust transform based on placement
    if (position.placement === 'bottom') {
        style.transform = 'translate(-50%, 10px)';
    } else if (position.placement === 'left') {
        style.transform = 'translate(-100%, -50%) translateX(-10px)';
    } else if (position.placement === 'right') {
        style.transform = 'translate(0, -50%) translateX(10px)';
    } else {
        // Top (default)
        style.transform = 'translate(-50%, -100%) translateY(-10px)';
    }

    return (
        <div
            className="absolute bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-4 rounded-lg shadow-2xl border border-white/10 w-64 text-sm pointer-events-auto flex flex-col gap-3 backdrop-blur-sm"
            style={style}
        >
            {/* Header */}
            <h3 className="font-bold text-lg border-b border-white/10 pb-2 capitalize flex items-baseline justify-between">
                {title} <span className="text-gray-400 text-xs font-normal">({group})</span>
            </h3>

            {/* Content */}
            <div className="space-y-2">
                {currentSession && (
                    <div className="bg-primary/20 p-2 rounded-md border border-primary/40 text-xs shadow-sm">
                        <div className="flex justify-between items-center mb-1 text-primary-100 font-bold">
                            <span>Current Target</span>
                            <span className="bg-primary w-2 h-2 rounded-full animate-pulse" />
                        </div>
                        <div className="flex justify-between items-center mb-1 text-gray-300">
                            <span>Target:</span>
                            <span className="font-mono text-white capitalize">{currentSession.targetMood || currentSession.skill}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Flow Score:</span>
                            <span className="font-mono text-white">{currentSession.flowScore ? Math.round(currentSession.flowScore * 100) : '--'}</span>
                        </div>
                    </div>
                )}
                {yearlySummary || weeklySessions ? (
                    <div className="bg-white/5 p-2 rounded-md border border-white/5">
                        <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-2">
                            Summary Activity
                        </p>
                        {yearlySummary?.duration && (
                            <div className="flex justify-between items-center mb-1 text-xs text-gray-300">
                                <span>Duration:</span>
                                <span className="font-mono text-white">{yearlySummary.duration}</span>
                            </div>
                        )}
                        {yearlySummary?.momentumScore !== undefined && (
                            <div className="flex justify-between items-center mb-1 text-xs text-gray-300">
                                <span>Momentum Score:</span>
                                <span className="font-mono text-white">{yearlySummary.momentumScore}</span>
                            </div>
                        )}
                        {weeklySessions && weeklySessions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center text-xs text-gray-300">
                                <span>Recent Activity:</span>
                                <div className="flex gap-1">
                                    {weeklySessions.slice(-7).map((s, i) => {
                                        const hit = s.mood || s.skill;
                                        return (
                                            <div 
                                                key={i} 
                                                className={`w-2 h-2 rounded-full ${hit ? 'bg-indigo-400' : 'bg-white/20'}`} 
                                                title={s.date}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : recentGame ? (
                    <div className="bg-white/5 p-2 rounded-md border border-white/5">
                        <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Recent Game
                        </p>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-indigo-300 truncate max-w-[120px]">
                                {recentGame.name}
                            </span>
                            <span className="text-xs text-gray-500">
                                {recentGame.playedAt}
                            </span>
                        </div>
                        {recentGame.score !== undefined && (
                            <div className="text-xs mb-2 text-gray-300">
                                Score: <span className="font-mono text-white">{recentGame.score}</span>
                            </div>
                        )}
                        {onPlayAgain && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayAgain();
                                }}
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-500 py-1.5 px-3 rounded text-xs font-medium transition-colors shadow-sm"
                            >
                                Play Again
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-2 italic text-xs">
                        No recent activity
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between gap-2 mt-1">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onFilterGames?.();
                    }}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 py-1.5 px-2 rounded text-xs font-medium transition-colors text-center border border-white/5"
                >
                    Games
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails?.();
                    }}
                    className="flex-1 bg-white/10 text-white hover:bg-white/20 py-1.5 px-2 rounded text-xs font-medium transition-colors text-center border border-white/5"
                >
                    Stats
                </button>
            </div>

            {/* Arrow/Triangle */}
            <div
                className={`absolute w-3 h-3 bg-neutral-900 border-white/10 transform rotate-45 ${position.placement === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r' :
                    position.placement === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2 border-t border-l' :
                        position.placement === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t border-r' :
                            'left-[-6px] top-1/2 -translate-y-1/2 border-b border-l'
                    }`}
            />
        </div>
    );
};

export default SkillprintTooltip;
