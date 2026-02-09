
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SkillprintGraph from './SkillprintGraph';
import spBaseState from './spData';
import { updateWithUserState, COLOR_MAP } from './utils';
import { Position } from './types';

interface ScoredItem {
    slug: string;
    hasScore: boolean;
}

interface SkillprintProps {
    userSkills: string[];
    userMoods: string[];
    hasScoreBySkill: { [key: string]: boolean };
    hasScoreByMood: { [key: string]: boolean };
    size?: number;
    initialState?: 'reset' | 'skills' | 'mindsets' | 'traits';
}

const Skillprint: React.FC<SkillprintProps> = ({
    userSkills,
    userMoods,
    hasScoreBySkill,
    hasScoreByMood,
    size = 600,
    initialState = 'reset',
}) => {
    const router = useRouter();
    const [viewState, setViewState] = useState<string>(initialState);

    // Define zoom/position configurations for each state
    const positions: Record<string, Position> = {
        reset: {
            state: 'reset',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: 13,
        },
        skills: {
            state: 'skills',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: 13,
        },
        mindsets: {
            state: 'mindsets',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: 13,
        },
        // 'moods' is alias for 'mindsets' in logic mostly
        moods: {
            state: 'mindsets',
            translate: { dx: 0, dy: 0 },
            scale: 1.0,
            rotate: '0deg',
            textSize: 13,
        },
        traits: {
            state: 'traits',
            translate: { dx: 0, dy: 0 },
            scale: 1.0,
            rotate: '0deg',
            textSize: 13,
        }
    };

    const currentPosition = positions[viewState] || positions.reset;

    // Compute graph data
    const graphData = useMemo(() => {
        // Theme colors can be dynamic, but for now specific values
        const themeColors = {
            grey300: '#E7E9ED',
            grey800: '#1F2937',
        };

        return updateWithUserState(
            userSkills,
            userMoods,
            spBaseState,
            currentPosition,
            hasScoreBySkill,
            hasScoreByMood,
            themeColors
        );
    }, [userSkills, userMoods, hasScoreBySkill, hasScoreByMood, currentPosition]);

    return (
        <div className="flex flex-col items-center justify-center p-4">
            {/* Controls */}
            <div className="flex space-x-4 mb-4 bg-muted p-1 rounded-lg relative z-10">
                {['reset', 'skills', 'mindsets'].map((state) => (
                    <button
                        key={state}
                        onClick={() => setViewState(state === 'reset' ? 'reset' : state)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${(viewState === state || (viewState === 'moods' && state === 'mindsets'))
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50 cursor-pointer'
                            }`}
                    >
                        {state === 'reset' ? 'Summary' : state === 'mindsets' ? 'Moods' : 'Skills'}
                    </button>
                ))}
            </div>

            {/* Visualization Container */}
            <div
                className="relative bg-card rounded-xl flex items-center justify-center mb-8"
                style={{ width: size, height: size }}
            >
                <SkillprintGraph
                    data={graphData}
                    size={size}
                    state={currentPosition.state}
                    zoom={{
                        scale: currentPosition.scale,
                        translate: currentPosition.translate,
                        rotate: currentPosition.rotate,
                    }}
                    viewBox="-100 -100 1012 1012"
                    onNodeClick={(group, slug) => {
                        if (group === 'skills') {
                            router.push(`/profile/skill/${encodeURIComponent(slug)}`);
                        } else if (group === 'mindsets' || group === 'moods') {
                            router.push(`/games?mood=${encodeURIComponent(slug)}`);
                        } else {
                            console.log('Clicked node:', group, slug);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Skillprint;
