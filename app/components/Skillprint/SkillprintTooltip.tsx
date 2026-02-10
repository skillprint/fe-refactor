
import React from 'react';

export interface SkillprintTooltipProps {
    isVisible: boolean;
    position: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
    title: string;
    group: string;
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
                {recentGame ? (
                    <div className="bg-white/5 p-2 rounded-md border border-white/5">
                        <p className="font-medium text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Recent Activity
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
