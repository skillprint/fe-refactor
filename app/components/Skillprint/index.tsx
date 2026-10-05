
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SkillprintGraph from './SkillprintGraph';
import SkillprintTooltip from './SkillprintTooltip';
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
    nodeDataMap?: { [key: string]: any };
    size?: number;
    initialState?: 'reset' | 'skills' | 'mindsets' | 'traits';
    hasMenu?: boolean;
    useSizeDirectly?: boolean;
    interactive?: boolean;
}

const Skillprint: React.FC<SkillprintProps> = ({
    userSkills,
    userMoods,
    hasScoreBySkill,
    hasScoreByMood,
    nodeDataMap = {},
    size = 1200,
    initialState = 'reset',
    hasMenu = false,
    useSizeDirectly = false,
    interactive = true,
}) => {
    const router = useRouter();
    const [viewState, setViewState] = useState<string>(initialState);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [tooltipState, setTooltipState] = useState<{
        visible: boolean;
        data: { group: string; slug: string; details?: any } | null;
        pos: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' }
    }>({ visible: false, data: null, pos: { x: 0, y: 0, placement: 'top' } });

    // Add timeout ref
    const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize(); // Initial check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNodeHover = (node: { group: string; slug: string; rect: DOMRect } | null) => {
        if (!interactive) return;

        // Clear any pending hide timeout if hovering a new node or re-entering
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }

        if (!node || !containerRef.current) {
            // Delay hiding to allow moving to tooltip
            hideTimeoutRef.current = setTimeout(() => {
                setTooltipState(prev => ({ ...prev, visible: false }));
            }, 300);
            return;
        }
        const containerRect = containerRef.current.getBoundingClientRect();

        // Center of the node relative to container
        const centerX = node.rect.left - containerRect.left + node.rect.width / 2;
        const centerY = node.rect.top - containerRect.top + node.rect.height / 2;
        const nodeTopY = node.rect.top - containerRect.top;
        const nodeBottomY = node.rect.bottom - containerRect.top;
        const nodeLeftX = node.rect.left - containerRect.left;
        const nodeRightX = node.rect.right - containerRect.left;

        // Smart placement logic
        let placement: 'top' | 'bottom' | 'left' | 'right' = 'top';
        let finalX = centerX;
        let finalY = nodeTopY;

        // If too close to top, place bottom
        if (nodeTopY < 150) {
            placement = 'bottom';
            finalY = nodeBottomY;
        }
        // If too close to left, place right
        else if (centerX < 150) {
            placement = 'right';
            finalX = nodeRightX;
            finalY = centerY;
        }
        // If too close to right, place left
        else if (centerX > size - 150) {
            placement = 'left';
            finalX = nodeLeftX;
            finalY = centerY;
        }

        const details = nodeDataMap[node.slug] || nodeDataMap[node.slug.toLowerCase()] || null;

        setTooltipState({
            visible: true,
            data: { group: node.group, slug: node.slug, details },
            pos: { x: finalX, y: finalY, placement }
        });
    };

    const handleTooltipEnter = () => {
        if (!interactive) return;
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handleTooltipLeave = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setTooltipState(prev => ({ ...prev, visible: false }));
        }, 300);
    };

    const navigateToGames = (group: string, slug: string) => {
        const tab = group === 'skills' ? 'skills' : 'moods';
        router.push(`/games?tab=${tab}&filter=${encodeURIComponent(slug)}`);
    };

    const navigateToStats = (group: string, slug: string) => {
        const type = group === 'skills' ? 'skill' : 'mood';
        router.push(`/profile/stats/${type}/${encodeURIComponent(slug)}`);
    };

    // Define zoom/position configurations for each state
    const positions: Record<string, Position> = {
        reset: {
            state: 'reset',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: isMobile ? 18 : 20,
        },
        skills: {
            state: 'skills',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: isMobile ? 18 : 20,
        },
        mindsets: {
            state: 'mindsets',
            translate: { dx: 0, dy: 0 },
            scale: 1.3,
            rotate: '0deg',
            textSize: isMobile ? 18 : 20,
        },
        // 'moods' is alias for 'mindsets' in logic mostly
        moods: {
            state: 'mindsets',
            translate: { dx: 0, dy: 0 },
            scale: 1.0,
            rotate: '0deg',
            textSize: isMobile ? 18 : 20,
        },
        traits: {
            state: 'traits',
            translate: { dx: 0, dy: 0 },
            scale: 1.0,
            rotate: '0deg',
            textSize: isMobile ? 18 : 20,
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

    const windowWidth = window.innerWidth;
    const overrideWidth = useSizeDirectly && size ? size : Math.min(windowWidth - 40, 600);

    return (
        <div className={useSizeDirectly ? "flex flex-col items-center justify-center" : "flex flex-col items-center justify-center md:p-4"}>
            {/* Controls */}
            {hasMenu && <div className="flex space-x-4 mb-4 bg-muted p-1 rounded-lg relative z-10 md:p-4">
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
            </div>}

            {/* Visualization Container */}
            <div
                ref={containerRef}
                className={useSizeDirectly 
                    ? "relative flex items-center justify-center w-full" 
                    : "relative bg-card rounded-xl flex items-center justify-center mb-8 md:p-0 w-full md:w-auto"}
                style={{
                    maxWidth: overrideWidth,
                    width: overrideWidth,
                    height: 'auto',
                    aspectRatio: '1 / 1'
                }}
            >
                <SkillprintGraph
                    data={graphData}
                    size={overrideWidth}
                    width="100%"
                    height="100%"
                    state={currentPosition.state}
                    zoom={{
                        scale: currentPosition.scale,
                        translate: currentPosition.translate,
                        rotate: currentPosition.rotate,
                    }}
                    nodeDataMap={nodeDataMap}
                    viewBox="-100 -100 1012 1012"
                    onNodeClick={interactive ? (group, slug) => navigateToStats(group, slug) : undefined}
                    onNodeHover={interactive ? handleNodeHover : undefined}
                />

                {interactive && (
                    <div
                        onMouseEnter={handleTooltipEnter}
                        onMouseLeave={handleTooltipLeave}
                    >
                        <SkillprintTooltip
                            isVisible={tooltipState.visible}
                            position={tooltipState.pos}
                            title={tooltipState.data?.slug || ''}
                            group={tooltipState.data?.group || ''}
                            yearlySummary={tooltipState.data?.details?.yearly}
                            weeklySessions={tooltipState.data?.details?.weekly}
                            currentSession={tooltipState.data?.details?.current}
                            onPlayAgain={() => {
                                if (tooltipState.data) navigateToGames(tooltipState.data.group, tooltipState.data.slug);
                            }}
                            onFilterGames={() => {
                                if (tooltipState.data) navigateToGames(tooltipState.data.group, tooltipState.data.slug);
                            }}
                            onViewDetails={() => {
                                if (tooltipState.data) navigateToStats(tooltipState.data.group, tooltipState.data.slug);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skillprint;
