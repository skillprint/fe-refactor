'use client';

import { useEffect } from 'react';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';

interface GameAdjustmentTesterProps {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    slug: string;
    onAdjustment?: (adjustment: any) => void;
}

export default function GameAdjustmentTester({ iframeRef, slug, onAdjustment }: GameAdjustmentTesterProps) {
    useEffect(() => {
        console.log('GameAdjustmentTester mounted for game:', slug);

        const processKey = (keyString: string) => {
            // Only respond to keys 1-9
            if (!/^[1-9]$/.test(keyString)) {
                return;
            }

            const key = parseInt(keyString, 10);
            const unifiedSlug = unifiedSlugFromBESlug(slug);
            const adjustments = getAdjustmentsForGame(unifiedSlug, key);

            console.log('Sending manual test adjustment:', adjustments);

            if (adjustments && adjustments.length > 0 && iframeRef.current?.contentWindow) {
                // Send adjustments one by one
                adjustments.forEach(adjustment => {
                    console.log('Sending manual test adjustment:', adjustment);
                    iframeRef.current!.contentWindow!.postMessage({
                        type: 'ADJUST_GAME',
                        data: adjustment
                    }, '*');
                });
                if (onAdjustment && adjustments.length > 0) {
                    onAdjustment(adjustments[0]); // Just display the first parameter modified in the banner
                }
            } else if (adjustments && adjustments.length === 0) {
                console.log(`No adjustments mapped for key ${key} in game ${unifiedSlug}`);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            console.log('[GameAdjustmentTester] Native keydown intercepted:', event.key);
            processKey(event.key);
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'skillprint_keydown') {
                console.log('[GameAdjustmentTester] Iframe keydown message received:', event.data.key);
                processKey(event.data.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('message', handleMessage);
        };
    }, [iframeRef, slug]);

    return null; // This is a behavioral component only
}

// Maps 1-9 to combinations of adjustments that the game supports.
function getAdjustmentsForGame(slug: string, keyNumber: number): any[] {
    switch (slug) {
        case 'box-tower':
            // Examples of different logic we can map to the 9 keys.
            // 1-3 modifies velocity, 4-6 modifies perfect range, 7-9 does both.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'stackVelocity', parameterValue: 5 }]; // Very Slow
                case 2: return [{ parameterName: 'stackVelocity', parameterValue: 15 }]; // Default
                case 3: return [{ parameterName: 'stackVelocity', parameterValue: 35 }]; // Fast
                case 4: return [{ parameterName: 'perfectRange', parameterValue: 0.1 }];  // Extremely hard perfects
                case 5: return [{ parameterName: 'perfectRange', parameterValue: 1 }];    // Default
                case 6: return [{ parameterName: 'perfectRange', parameterValue: 10 }];   // Easy perfects
                case 7:
                    return [
                        { parameterName: 'stackVelocity', parameterValue: 10 },
                        { parameterName: 'perfectRange', parameterValue: 5 }
                    ]; // Slower, forgiving
                case 8:
                    return [
                        { parameterName: 'stackVelocity', parameterValue: 20 },
                        { parameterName: 'perfectRange', parameterValue: 2 }
                    ]; // Faster, little more forgiving
                case 9:
                    return [
                        { parameterName: 'stackVelocity', parameterValue: 40 },
                        { parameterName: 'perfectRange', parameterValue: 0 }
                    ]; // Extremely fast, no forgiving
                default:
                    return [];
            }
        case 'hextris':
            // 1-3 sets easy comboTime, 4-6 mod speedModifier, 7-9 extreme
            // Note: Hextris combo times appear to be multipliers or fixed integers, while speedModifier defaults to ~1
            switch (keyNumber) {
                case 1: return [{ parameterName: 'comboTime', parameterValue: 1000 }]; // Very long combo time
                case 2: return [{ parameterName: 'speedModifier', parameterValue: 0.5 }]; // Slow shapes
                case 3:
                    return [
                        { parameterName: 'comboTime', parameterValue: 1000 },
                        { parameterName: 'speedModifier', parameterValue: 0.5 }
                    ]; // Complete easy mode
                case 4: return [{ parameterName: 'speedModifier', parameterValue: 1 }]; // Default speed
                case 5: return [{ parameterName: 'comboTime', parameterValue: 200 }]; // Default combo
                case 6:
                    return [
                        { parameterName: 'speedModifier', parameterValue: 1.5 },
                        { parameterName: 'comboTime', parameterValue: 100 }
                    ]; // Fast and challenging
                case 7: return [{ parameterName: 'speedModifier', parameterValue: 2 }]; // Very fast
                case 8: return [{ parameterName: 'speedModifier', parameterValue: 3 }]; // Ludicrous speed
                case 9:
                    return [
                        { parameterName: 'speedModifier', parameterValue: 4 },
                        { parameterName: 'comboTime', parameterValue: 50 }
                    ]; // Impossible mode
                default:
                    return [];
            }
        case '0hh1':
            // 0h h1 manages qualityThreshold, maxGridSize, and hintsAllowed.
            switch (keyNumber) {
                case 1:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 20 },
                        { parameterName: 'maxGridSize', parameterValue: 4 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 2:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 20 },
                        { parameterName: 'maxGridSize', parameterValue: 6 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 3:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 20 },
                        { parameterName: 'maxGridSize', parameterValue: 6 },
                        { parameterName: 'hintsAllowed', parameterValue: 0 }
                    ];
                case 4:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 60 },
                        { parameterName: 'maxGridSize', parameterValue: 6 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 5:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 60 },
                        { parameterName: 'maxGridSize', parameterValue: 8 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 6:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 60 },
                        { parameterName: 'maxGridSize', parameterValue: 8 },
                        { parameterName: 'hintsAllowed', parameterValue: 0 }
                    ];
                case 7:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 90 },
                        { parameterName: 'maxGridSize', parameterValue: 8 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 8:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 90 },
                        { parameterName: 'maxGridSize', parameterValue: 10 },
                        { parameterName: 'hintsAllowed', parameterValue: 1 }
                    ];
                case 9:
                    return [
                        { parameterName: 'qualityThreshold', parameterValue: 95 },
                        { parameterName: 'maxGridSize', parameterValue: 10 },
                        { parameterName: 'hintsAllowed', parameterValue: 0 }
                    ];
                default:
                    return [];
            }
        case '2048':
            // 2048 manages startTiles, fourProbability, and targetValue.
            switch (keyNumber) {
                case 1:
                    return [
                        { parameterName: 'startTiles', parameterValue: 1 },
                        { parameterName: 'fourProbability', parameterValue: 0 },
                        { parameterName: 'targetValue', parameterValue: 256 }
                    ];
                case 2:
                    return [
                        { parameterName: 'startTiles', parameterValue: 2 },
                        { parameterName: 'fourProbability', parameterValue: 5 },
                        { parameterName: 'targetValue', parameterValue: 512 }
                    ];
                case 3:
                    return [
                        { parameterName: 'startTiles', parameterValue: 2 },
                        { parameterName: 'fourProbability', parameterValue: 10 },
                        { parameterName: 'targetValue', parameterValue: 1024 }
                    ];
                case 4:
                    return [
                        { parameterName: 'startTiles', parameterValue: 2 },
                        { parameterName: 'fourProbability', parameterValue: 10 },
                        { parameterName: 'targetValue', parameterValue: 2048 }
                    ];
                case 5:
                    return [
                        { parameterName: 'startTiles', parameterValue: 3 },
                        { parameterName: 'fourProbability', parameterValue: 15 },
                        { parameterName: 'targetValue', parameterValue: 2048 }
                    ];
                case 6:
                    return [
                        { parameterName: 'startTiles', parameterValue: 4 },
                        { parameterName: 'fourProbability', parameterValue: 20 },
                        { parameterName: 'targetValue', parameterValue: 2048 }
                    ];
                case 7:
                    return [
                        { parameterName: 'startTiles', parameterValue: 4 },
                        { parameterName: 'fourProbability', parameterValue: 30 },
                        { parameterName: 'targetValue', parameterValue: 2048 }
                    ];
                case 8:
                    return [
                        { parameterName: 'startTiles', parameterValue: 5 },
                        { parameterName: 'fourProbability', parameterValue: 40 },
                        { parameterName: 'targetValue', parameterValue: 4096 }
                    ];
                case 9:
                    return [
                        { parameterName: 'startTiles', parameterValue: 6 },
                        { parameterName: 'fourProbability', parameterValue: 50 },
                        { parameterName: 'targetValue', parameterValue: 4096 }
                    ];
                default:
                    return [];
            }
        case 'brick-out':
            // Brick out limits ball velocity and multiball spawns
            switch (keyNumber) {
                case 1: return [{ parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 0.5 }, { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 0.1 }]; // Very Slow
                case 2: return [{ parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 1.0 }, { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 0.4 }]; // Slower
                case 3: return [{ parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 1.5 }, { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 0.5 }]; // Default
                case 4: return [{ parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 2.5 }, { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 1.0 }]; // Fast
                case 5: return [{ parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 4.0 }, { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 2.0 }]; // Extremely Fast
                case 6: return [{ parameterName: 'MAX_BALL_SPAWN', parameterValue: 1 }]; // No Multiball allowed
                case 7: return [{ parameterName: 'MAX_BALL_SPAWN', parameterValue: 4 }]; // Default Multiball cap
                case 8: return [{ parameterName: 'MAX_BALL_SPAWN', parameterValue: 20 }]; // Crazy Multiball cap
                case 9: return [
                    { parameterName: 'MAX_VELOCITY_LIMIT', parameterValue: 5.0 },
                    { parameterName: 'MIN_VELOCITY_LIMIT', parameterValue: 3.0 },
                    { parameterName: 'TIME_BOUNCE_BALL', parameterValue: 0.1 }
                ]; // Impossible mode
                default:
                    return [];
            }
        case 'change-word':
            // Change word uses `timer` in ms for limits per level
            switch (keyNumber) {
                case 1: return [{ parameterName: 'timer', parameterValue: 120000 }]; // 120s
                case 2: return [{ parameterName: 'timer', parameterValue: 90000 }];
                case 3: return [{ parameterName: 'timer', parameterValue: 60000 }];
                case 4: return [{ parameterName: 'timer', parameterValue: 40000 }]; // Approximating Default
                case 5: return [{ parameterName: 'timer', parameterValue: 30000 }];
                case 6: return [{ parameterName: 'timer', parameterValue: 20000 }];
                case 7: return [{ parameterName: 'timer', parameterValue: 10000 }];
                case 8: return [{ parameterName: 'timer', parameterValue: 5000 }];  // 5 seconds
                case 9: return [{ parameterName: 'timer', parameterValue: 1000 }];  // Impossible 1 sec
                default:
                    return [];
            }
        case 'fruit-sorting':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'seconds_on_clock', parameterValue: 120 }];
                case 2: return [{ parameterName: 'seconds_on_clock', parameterValue: 90 }];
                case 3: return [{ parameterName: 'seconds_on_clock', parameterValue: 60 }];
                case 4: return [{ parameterName: 'seconds_on_clock', parameterValue: 45 }];
                case 5: return [{ parameterName: 'seconds_on_clock', parameterValue: 30 }]; // Default
                case 6: return [{ parameterName: 'seconds_on_clock', parameterValue: 20 }];
                case 7: return [{ parameterName: 'seconds_on_clock', parameterValue: 15 }];
                case 8: return [{ parameterName: 'seconds_on_clock', parameterValue: 10 }];
                case 9: return [{ parameterName: 'seconds_on_clock', parameterValue: 5 }];
                default:
                    return [];
            }
        case 'gems-of-hanoi':
            // 'levels' sets the cap on unlocked levels out of 8 total
            switch (keyNumber) {
                case 1: return [{ parameterName: 'levels', parameterValue: 1 }];
                case 2: return [{ parameterName: 'levels', parameterValue: 2 }];
                case 3: return [{ parameterName: 'levels', parameterValue: 3 }];
                case 4: return [{ parameterName: 'levels', parameterValue: 4 }];
                case 5: return [{ parameterName: 'levels', parameterValue: 5 }];
                case 6: return [{ parameterName: 'levels', parameterValue: 6 }];
                case 7: return [{ parameterName: 'levels', parameterValue: 7 }];
                case 8: return [{ parameterName: 'levels', parameterValue: 8 }]; // Default max
                case 9: return [{ parameterName: 'levels', parameterValue: 9 }]; // All disks
                default:
                    return [];
            }
        case 'gummy-blocks':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'PIECE_TO_PLACE', parameterValue: 1 }];
                case 2: return [{ parameterName: 'PIECE_TO_PLACE', parameterValue: 2 }];
                case 3: return [{ parameterName: 'PIECE_TO_PLACE', parameterValue: 3 }];
                case 4: return [{ parameterName: 'PIECE_TO_PLACE', parameterValue: 4 }];
                case 5: return [{ parameterName: 'PIECE_TO_PLACE', parameterValue: 5 }];
                case 6: return [{ parameterName: 'NUM_ROWS', parameterValue: 6 }];
                case 7: return [{ parameterName: 'NUM_ROWS', parameterValue: 8 }];
                case 8: return [{ parameterName: 'NUM_ROWS', parameterValue: 10 }];
                case 9: return [{ parameterName: 'NUM_ROWS', parameterValue: 12 }];
                default:
                    return [];
            }
        case 'katana-fruits':
            // OCCURENCE_FRUIT is in ms. Lower is faster.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 10000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 0.5 }];  // Very slow
                case 2: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 6000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 1 }];
                case 3: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 5000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 1.5 }];
                case 4: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 4000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 2 }];
                case 5: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 3000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 2 }]; // Default
                case 6: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 2000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 2.5 }];
                case 7: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 1500 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 3 }];
                case 8: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 1000 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 4 }]; // Fast
                case 9: return [{ parameterName: 'OCCURENCE_FRUIT', parameterValue: 500 }, { parameterName: 'MAX_FRUIT_ROT_SPEED', parameterValue: 5 }]; // Impossible
                default:
                    return [];
            }
        case 'mahjong-deluxe':
            // BONUS_TIME is in ms. Lower is harder. Default 12000.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'BONUS_TIME', parameterValue: 60000 }, { parameterName: 'HINT_PENALTY', parameterValue: 0 }];
                case 2: return [{ parameterName: 'BONUS_TIME', parameterValue: 45000 }, { parameterName: 'HINT_PENALTY', parameterValue: 2 }];
                case 3: return [{ parameterName: 'BONUS_TIME', parameterValue: 30000 }, { parameterName: 'HINT_PENALTY', parameterValue: 5 }];
                case 4: return [{ parameterName: 'BONUS_TIME', parameterValue: 20000 }, { parameterName: 'HINT_PENALTY', parameterValue: 8 }];
                case 5: return [{ parameterName: 'BONUS_TIME', parameterValue: 12000 }, { parameterName: 'HINT_PENALTY', parameterValue: 10 }]; // Default
                case 6: return [{ parameterName: 'BONUS_TIME', parameterValue: 8000 }, { parameterName: 'HINT_PENALTY', parameterValue: 15 }];
                case 7: return [{ parameterName: 'BONUS_TIME', parameterValue: 5000 }, { parameterName: 'HINT_PENALTY', parameterValue: 20 }];
                case 8: return [{ parameterName: 'BONUS_TIME', parameterValue: 2000 }, { parameterName: 'HINT_PENALTY', parameterValue: 50 }];
                case 9: return [{ parameterName: 'BONUS_TIME', parameterValue: 1000 }, { parameterName: 'HINT_PENALTY', parameterValue: 100 }];
                default:
                    return [];
            }
        case 'match-doodle':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pairs', parameterValue: 2 }];
                case 2: return [{ parameterName: 'pairs', parameterValue: 3 }];
                case 3: return [{ parameterName: 'pairs', parameterValue: 4 }];
                case 4: return [{ parameterName: 'pairs', parameterValue: 5 }]; // Default level 1
                case 5: return [{ parameterName: 'pairs', parameterValue: 6 }];
                case 6: return [{ parameterName: 'pairs', parameterValue: 8 }];
                case 7: return [{ parameterName: 'pairs', parameterValue: 10 }];
                case 8: return [{ parameterName: 'pairs', parameterValue: 15 }];
                case 9: return [{ parameterName: 'pairs', parameterValue: 20 }];
                default:
                    return [];
            }
        case 'photo-hunt':
            // default is 30 seconds, 3 misses. Lower seconds is harder.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'seconds_on_clock', parameterValue: 120 }, { parameterName: 'tilt_misses', parameterValue: 10 }];
                case 2: return [{ parameterName: 'seconds_on_clock', parameterValue: 90 }, { parameterName: 'tilt_misses', parameterValue: 8 }];
                case 3: return [{ parameterName: 'seconds_on_clock', parameterValue: 60 }, { parameterName: 'tilt_misses', parameterValue: 5 }];
                case 4: return [{ parameterName: 'seconds_on_clock', parameterValue: 45 }, { parameterName: 'tilt_misses', parameterValue: 4 }];
                case 5: return [{ parameterName: 'seconds_on_clock', parameterValue: 30 }, { parameterName: 'tilt_misses', parameterValue: 3 }]; // Default
                case 6: return [{ parameterName: 'seconds_on_clock', parameterValue: 20 }, { parameterName: 'tilt_misses', parameterValue: 2 }];
                case 7: return [{ parameterName: 'seconds_on_clock', parameterValue: 15 }, { parameterName: 'tilt_misses', parameterValue: 1 }];
                case 8: return [{ parameterName: 'seconds_on_clock', parameterValue: 10 }, { parameterName: 'tilt_misses', parameterValue: 1 }];
                case 9: return [{ parameterName: 'seconds_on_clock', parameterValue: 5 }, { parameterName: 'tilt_misses', parameterValue: 1 }];
                default:
                    return [];
            }
        case 'snake-attack':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'hero_speed', parameterValue: 2 }, { parameterName: 'hero_rotation_speed', parameterValue: 5 }];
                case 2: return [{ parameterName: 'hero_speed', parameterValue: 4 }, { parameterName: 'hero_rotation_speed', parameterValue: 6 }];
                case 3: return [{ parameterName: 'hero_speed', parameterValue: 6 }, { parameterName: 'hero_rotation_speed', parameterValue: 7 }];
                case 4: return [{ parameterName: 'hero_speed', parameterValue: 8 }, { parameterName: 'hero_rotation_speed', parameterValue: 8 }];
                case 5: return [{ parameterName: 'hero_speed', parameterValue: 10 }, { parameterName: 'hero_rotation_speed', parameterValue: 10 }]; // Default
                case 6: return [{ parameterName: 'hero_speed', parameterValue: 12 }, { parameterName: 'hero_rotation_speed', parameterValue: 12 }];
                case 7: return [{ parameterName: 'hero_speed', parameterValue: 15 }, { parameterName: 'hero_rotation_speed', parameterValue: 15 }];
                case 8: return [{ parameterName: 'hero_speed', parameterValue: 18 }, { parameterName: 'hero_rotation_speed', parameterValue: 18 }];
                case 9: return [{ parameterName: 'hero_speed', parameterValue: 22 }, { parameterName: 'hero_rotation_speed', parameterValue: 22 }];
                default:
                    return [];
            }
        case 'space-adventure-pinball':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'NUM_BALL', parameterValue: 10 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 25 }];
                case 2: return [{ parameterName: 'NUM_BALL', parameterValue: 8 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 22 }];
                case 3: return [{ parameterName: 'NUM_BALL', parameterValue: 6 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 20 }];
                case 4: return [{ parameterName: 'NUM_BALL', parameterValue: 4 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 19 }];
                case 5: return [{ parameterName: 'NUM_BALL', parameterValue: 3 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 18 }]; // Default
                case 6: return [{ parameterName: 'NUM_BALL', parameterValue: 2 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 16 }];
                case 7: return [{ parameterName: 'NUM_BALL', parameterValue: 1 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 14 }];
                case 8: return [{ parameterName: 'NUM_BALL', parameterValue: 1 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 12 }];
                case 9: return [{ parameterName: 'NUM_BALL', parameterValue: 1 }, { parameterName: 'FLIPPER_STRENGTH', parameterValue: 10 }];
                default:
                    return [];
            }
        case 'sumagi':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'second_on_clock', parameterValue: [120, 150, 180] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 2 }];
                case 2: return [{ parameterName: 'second_on_clock', parameterValue: [90, 120, 150] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 3 }];
                case 3: return [{ parameterName: 'second_on_clock', parameterValue: [60, 90, 120] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 4 }];
                case 4: return [{ parameterName: 'second_on_clock', parameterValue: [45, 60, 90] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 4 }];
                case 5: return [{ parameterName: 'second_on_clock', parameterValue: [30, 45, 60] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 5 }]; // Default
                case 6: return [{ parameterName: 'second_on_clock', parameterValue: [20, 30, 45] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 6 }];
                case 7: return [{ parameterName: 'second_on_clock', parameterValue: [15, 20, 30] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 7 }];
                case 8: return [{ parameterName: 'second_on_clock', parameterValue: [10, 15, 20] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 8 }];
                case 9: return [{ parameterName: 'second_on_clock', parameterValue: [5, 10, 15] }, { parameterName: 'rounds_per_difficulty_level', parameterValue: 10 }];
                default:
                    return [];
            }
        case 'sweet-memory':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pairs', parameterValue: 2 }, { parameterName: 'time', parameterValue: 60 }];
                case 2: return [{ parameterName: 'pairs', parameterValue: 3 }, { parameterName: 'time', parameterValue: 60 }];
                case 3: return [{ parameterName: 'pairs', parameterValue: 4 }, { parameterName: 'time', parameterValue: 50 }];
                case 4: return [{ parameterName: 'pairs', parameterValue: 5 }, { parameterName: 'time', parameterValue: 45 }];
                case 5: return [{ parameterName: 'pairs', parameterValue: 6 }, { parameterName: 'time', parameterValue: 45 }]; // Default level 3
                case 6: return [{ parameterName: 'pairs', parameterValue: 8 }, { parameterName: 'time', parameterValue: 45 }];
                case 7: return [{ parameterName: 'pairs', parameterValue: 10 }, { parameterName: 'time', parameterValue: 40 }];
                case 8: return [{ parameterName: 'pairs', parameterValue: 12 }, { parameterName: 'time', parameterValue: 40 }];
                case 9: return [{ parameterName: 'pairs', parameterValue: 15 }, { parameterName: 'time', parameterValue: 30 }];
                default:
                    return [];
            }
        case 'ultimate-sudoku':
            switch (keyNumber) {
                // Lower is harder (less starting givens)
                case 1: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 70 }];
                case 2: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 60 }];
                case 3: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 50 }];
                case 4: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 44 }];
                case 5: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 38 }]; // Default
                case 6: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 34 }];
                case 7: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 30 }];
                case 8: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 26 }];
                case 9: return [{ parameterName: 'MAX_GIVENS_EASY', parameterValue: 20 }];
                default:
                    return [];
            }
        case 'whack-em-all':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 2000 }, { parameterName: 'TIME_LEVEL', parameterValue: 120000 }];
                case 2: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 1800 }, { parameterName: 'TIME_LEVEL', parameterValue: 100000 }];
                case 3: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 1500 }, { parameterName: 'TIME_LEVEL', parameterValue: 90000 }];
                case 4: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 1200 }, { parameterName: 'TIME_LEVEL', parameterValue: 75000 }];
                case 5: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 1000 }, { parameterName: 'TIME_LEVEL', parameterValue: 60000 }]; // Default
                case 6: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 800 }, { parameterName: 'TIME_LEVEL', parameterValue: 50000 }];
                case 7: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 600 }, { parameterName: 'TIME_LEVEL', parameterValue: 40000 }];
                case 8: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 400 }, { parameterName: 'TIME_LEVEL', parameterValue: 30000 }];
                case 9: return [{ parameterName: 'START_SPAWN_TIME', parameterValue: 200 }, { parameterName: 'TIME_LEVEL', parameterValue: 30000 }];
                default:
                    return [];
            }
        case 'colorize-2':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 1 }, { parameterName: 'zoomLevelsCount', parameterValue: 5 }];
                case 2: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 1 }, { parameterName: 'zoomLevelsCount', parameterValue: 3 }];
                case 3: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 1 }, { parameterName: 'zoomLevelsCount', parameterValue: 1 }];
                case 4: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 2 }, { parameterName: 'zoomLevelsCount', parameterValue: 5 }];
                case 5: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 2 }, { parameterName: 'zoomLevelsCount', parameterValue: 3 }];
                case 6: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 2 }, { parameterName: 'zoomLevelsCount', parameterValue: 1 }];
                case 7: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 3 }, { parameterName: 'zoomLevelsCount', parameterValue: 5 }];
                case 8: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 3 }, { parameterName: 'zoomLevelsCount', parameterValue: 3 }];
                case 9: return [{ parameterName: 'maxCategoryComplexity', parameterValue: 3 }, { parameterName: 'zoomLevelsCount', parameterValue: 1 }];
                default:
                    return [];
            }
        case 'mage-duel-2d':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'heroDamage', parameterValue: 10 }];
                case 2: return [{ parameterName: 'heroDamage', parameterValue: 50 }];
                case 3: return [{ parameterName: 'enemyDamage', parameterValue: 5 }];
                case 4: return [{ parameterName: 'enemyDamage', parameterValue: 40 }];
                case 5: return [{ parameterName: 'enemyAttackRateMs', parameterValue: 8000 }];
                case 6: return [{ parameterName: 'enemyAttackRateMs', parameterValue: 3000 }];
                case 7: return [{ parameterName: 'enemyAttackRateMs', parameterValue: 1000 }];
                case 8: return [{ parameterName: 'healAmount', parameterValue: 10 }];
                case 9: return [{ parameterName: 'healAmount', parameterValue: 60 }];
                default:
                    return [];
            }
        case 'airport-rush':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'planeMoveSpeed', parameterValue: 0.2 }]; // Very Slow
                case 2: return [{ parameterName: 'planeMoveSpeed', parameterValue: 0.5 }];
                case 3: return [{ parameterName: 'planeMoveSpeed', parameterValue: 0.8 }];
                case 4: return [{ parameterName: 'planeMoveSpeed', parameterValue: 1 }]; // Default
                case 5: return [{ parameterName: 'planeMoveSpeed', parameterValue: 1.2 }];
                case 6: return [{ parameterName: 'planeMoveSpeed', parameterValue: 1.5 }];
                case 7: return [{ parameterName: 'planeMoveSpeed', parameterValue: 2 }];
                case 8: return [{ parameterName: 'planeMoveSpeed', parameterValue: 3 }];
                case 9: return [{ parameterName: 'planeMoveSpeed', parameterValue: 5 }]; // Very Fast
                default:
                    return [];
            }
        case 'circle-word':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'angleSpeed', parameterValue: 60 }]; // Easy (Slow)
                case 2: return [{ parameterName: 'angleSpeed', parameterValue: 50 }];
                case 3: return [{ parameterName: 'angleSpeed', parameterValue: 40 }];
                case 4: return [{ parameterName: 'angleSpeed', parameterValue: 30 }]; // Default
                case 5: return [{ parameterName: 'angleSpeed', parameterValue: 25 }];
                case 6: return [{ parameterName: 'angleSpeed', parameterValue: 20 }];
                case 7: return [{ parameterName: 'angleSpeed', parameterValue: 15 }];
                case 8: return [{ parameterName: 'angleSpeed', parameterValue: 10 }];
                case 9: return [{ parameterName: 'angleSpeed', parameterValue: 5 }]; // Very Fast
                default:
                    return [];
            }
        case 'color-bump':
        case 'crossy-chicken':
        case 'jigsaw-puzzle':
        case 'jumper-frog':
        case 'miner-block':
        case 'pipe-flow':
        case 'slide':
        case 'sweet-candy-saga':
        case 'twenty-one':
        case 'unlock-blox':
        case 'word-search':
        case 'zig-zag-switch':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'speedModifier', parameterValue: 0.2 }]; // Very Slow
                case 2: return [{ parameterName: 'speedModifier', parameterValue: 0.5 }];
                case 3: return [{ parameterName: 'speedModifier', parameterValue: 0.8 }];
                case 4: return [{ parameterName: 'speedModifier', parameterValue: 1 }]; // Default
                case 5: return [{ parameterName: 'speedModifier', parameterValue: 1.2 }];
                case 6: return [{ parameterName: 'speedModifier', parameterValue: 1.5 }];
                case 7: return [{ parameterName: 'speedModifier', parameterValue: 2 }];
                case 8: return [{ parameterName: 'speedModifier', parameterValue: 3 }];
                case 9: return [{ parameterName: 'speedModifier', parameterValue: 5 }]; // Very Fast
                default:
                    return [];
            }
        case 'doodle-god-next':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'hintCooldownTime', parameterValue: 60.0 }]; // Very slow hints
                case 2: return [{ parameterName: 'hintCooldownTime', parameterValue: 15.0 }]; // Default
                case 3: return [{ parameterName: 'hintCooldownTime', parameterValue: 5.0 }];  // Very fast hints
                case 4: return [{ parameterName: 'startingHints', parameterValue: 1 }];       // Hard starting hints
                case 5: return [{ parameterName: 'startingHints', parameterValue: 5 }];       // Default hints
                case 6: return [{ parameterName: 'startingHints', parameterValue: 15 }];      // Easy starting hints
                case 7: return [
                    { parameterName: 'adsFrequencyMinutes', parameterValue: 10.0 },
                    { parameterName: 'debugMode', parameterValue: 0 }
                ];
                case 8: return [
                    { parameterName: 'adsFrequencyMinutes', parameterValue: 5.0 },
                    { parameterName: 'debugMode', parameterValue: 0 }
                ];
                case 9: return [
                    { parameterName: 'adsFrequencyMinutes', parameterValue: 1.0 },
                    { parameterName: 'debugMode', parameterValue: 1 }
                ];
                default:
                    return [];
            }
        case 'cut-the-rope':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'gravity', parameterValue: 0.5 }]; // Low gravity
                case 2: return [{ parameterName: 'gravity', parameterValue: 1.0 }]; // Default
                case 3: return [{ parameterName: 'gravity', parameterValue: 2.0 }]; // High gravity
                case 4: return [{ parameterName: 'ropeElasticity', parameterValue: 0.5 }]; // Stiff ropes
                case 5: return [{ parameterName: 'ropeElasticity', parameterValue: 1.0 }]; // Default
                case 6: return [{ parameterName: 'ropeElasticity', parameterValue: 1.8 }]; // Elastic ropes
                case 7: return [
                    { parameterName: 'scoreMultiplier', parameterValue: 1 },
                    { parameterName: 'timeLimitSeconds', parameterValue: 90 }
                ];
                case 8: return [
                    { parameterName: 'scoreMultiplier', parameterValue: 2 },
                    { parameterName: 'timeLimitSeconds', parameterValue: 45 }
                ];
                case 9: return [
                    { parameterName: 'scoreMultiplier', parameterValue: 5 },
                    { parameterName: 'timeLimitSeconds', parameterValue: 15 }
                ];
                default:
                    return [];
            }
        case 'alchemy':
            switch (keyNumber) {
                case 1:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 80 },
                        { parameterName: 'combineDuration', parameterValue: 100 }
                    ];
                case 2:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 60 },
                        { parameterName: 'combineDuration', parameterValue: 200 }
                    ];
                case 3:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 40 },
                        { parameterName: 'combineDuration', parameterValue: 300 }
                    ];
                case 4:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 40 },
                        { parameterName: 'combineDuration', parameterValue: 400 }
                    ];
                case 5:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 35 },
                        { parameterName: 'combineDuration', parameterValue: 600 }
                    ];
                case 6:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 30 },
                        { parameterName: 'combineDuration', parameterValue: 800 }
                    ];
                case 7:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 25 },
                        { parameterName: 'combineDuration', parameterValue: 1000 }
                    ];
                case 8:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 20 },
                        { parameterName: 'combineDuration', parameterValue: 1500 }
                    ];
                case 9:
                    return [
                        { parameterName: 'combineDistance', parameterValue: 15 },
                        { parameterName: 'combineDuration', parameterValue: 2000 }
                    ];
                default:
                    return [];
            }
        case 'omnomrun':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'speedScale', parameterValue: 0.6 }]; // Slow runner
                case 2: return [{ parameterName: 'speedScale', parameterValue: 1.0 }]; // Default
                case 3: return [{ parameterName: 'speedScale', parameterValue: 1.5 }]; // Fast runner
                case 4: return [{ parameterName: 'invincibilityDuration', parameterValue: 5 }]; // Stiff/Short invincibility
                case 5: return [{ parameterName: 'invincibilityDuration', parameterValue: 10 }]; // Default
                case 6: return [{ parameterName: 'invincibilityDuration', parameterValue: 25 }]; // Extended invincibility
                case 7: return [
                    { parameterName: 'magnetRadius', parameterValue: 1 },
                    { parameterName: 'coinSpawnRate', parameterValue: 1 }
                ];
                case 8: return [
                    { parameterName: 'magnetRadius', parameterValue: 3 },
                    { parameterName: 'coinSpawnRate', parameterValue: 2 }
                ];
                case 9: return [
                    { parameterName: 'magnetRadius', parameterValue: 8 },
                    { parameterName: 'coinSpawnRate', parameterValue: 4 }
                ];
                default:
                    return [];
            }
        case 'bubble-spirit':
            switch (keyNumber) {
                case 1:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 700 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 1.5 }
                    ];
                case 2:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 900 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 1.2 }
                    ];
                case 3:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1200 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 1.0 }
                    ];
                case 4:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 900 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 1.0 }
                    ];
                case 5:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1100 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 0.9 }
                    ];
                case 6:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1300 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 1 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 0.8 }
                    ];
                case 7:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1000 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 0 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 0.8 }
                    ];
                case 8:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1400 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 0 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 0.7 }
                    ];
                case 9:
                    return [
                        { parameterName: 'shootVelocity', parameterValue: 1800 },
                        { parameterName: 'aimGuideEnabled', parameterValue: 0 },
                        { parameterName: 'bubbleLimitMultiplier', parameterValue: 0.5 }
                    ];
                default:
                    return [];
            }
        default:
            return []; // No test adjustments implemented yet for this game
    }
}
