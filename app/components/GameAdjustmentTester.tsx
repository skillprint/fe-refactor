'use client';

import { useEffect } from 'react';
import { baseSlug } from '@/lib/gameSlug';

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
            const unifiedSlug = baseSlug(slug);
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
            // 1-5 set stackVelocity (px per frame), 6-8 perfectRange (px), 9 both
            switch (keyNumber) {
                case 1: return [{ parameterName: 'stackVelocity', parameterValue: 3 }];  // Slow
                case 2: return [{ parameterName: 'stackVelocity', parameterValue: 5 }];  // Default
                case 3: return [{ parameterName: 'stackVelocity', parameterValue: 8 }];
                case 4: return [{ parameterName: 'stackVelocity', parameterValue: 12 }];
                case 5: return [{ parameterName: 'stackVelocity', parameterValue: 20 }]; // Max
                case 6: return [{ parameterName: 'perfectRange', parameterValue: 0 }];   // Any misalignment is cut
                case 7: return [{ parameterName: 'perfectRange', parameterValue: 1 }];   // Default
                case 8: return [{ parameterName: 'perfectRange', parameterValue: 8 }];   // Forgiving
                case 9:
                    return [
                        { parameterName: 'stackVelocity', parameterValue: 15 },
                        { parameterName: 'perfectRange', parameterValue: 0 }
                    ]; // Hard mode
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
            // 0h h1 manages difficulty via the 'quality' of the board generated (fewer hints). Default is 60.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'qualityThreshold', parameterValue: 10 }]; // Very easy
                case 2: return [{ parameterName: 'qualityThreshold', parameterValue: 30 }];
                case 3: return [{ parameterName: 'qualityThreshold', parameterValue: 45 }];
                case 4: return [{ parameterName: 'qualityThreshold', parameterValue: 60 }]; // Default
                case 5: return [{ parameterName: 'qualityThreshold', parameterValue: 70 }];
                case 6: return [{ parameterName: 'qualityThreshold', parameterValue: 80 }];
                case 7: return [{ parameterName: 'qualityThreshold', parameterValue: 90 }];
                case 8: return [{ parameterName: 'qualityThreshold', parameterValue: 95 }]; // Very hard
                case 9: return [{ parameterName: 'qualityThreshold', parameterValue: 99 }]; // Extreme
                default:
                    return [];
            }
        case '2048':
            // 2048 handles starting tiles via 'startTiles' setting, default is 2
            switch (keyNumber) {
                case 1: return [{ parameterName: 'startTiles', parameterValue: 1 }]; // Minimal
                case 2: return [{ parameterName: 'startTiles', parameterValue: 2 }]; // Default
                case 3: return [{ parameterName: 'startTiles', parameterValue: 3 }];
                case 4: return [{ parameterName: 'startTiles', parameterValue: 4 }];
                case 5: return [{ parameterName: 'startTiles', parameterValue: 5 }];
                case 6: return [{ parameterName: 'startTiles', parameterValue: 6 }];
                case 7: return [{ parameterName: 'startTiles', parameterValue: 7 }];
                case 8: return [{ parameterName: 'startTiles', parameterValue: 8 }];
                case 9: return [{ parameterName: 'startTiles', parameterValue: 10 }]; // Crowded
                default:
                    return [];
            }
        case 'brick-out':
            // Brick Out: ballSpeed (base ball speed), bonusDropRate (power-up chance), maxBallSpawn (multi-ball cap)
            switch (keyNumber) {
                case 1: return [{ parameterName: 'ballSpeed', parameterValue: 0.6 }]; // Very slow
                case 2: return [{ parameterName: 'ballSpeed', parameterValue: 0.8 }]; // Slow
                case 3: return [{ parameterName: 'ballSpeed', parameterValue: 1.0 }]; // Default
                case 4: return [{ parameterName: 'ballSpeed', parameterValue: 1.3 }]; // Fast
                case 5: return [{ parameterName: 'ballSpeed', parameterValue: 1.6 }]; // Very fast
                case 6: return [{ parameterName: 'bonusDropRate', parameterValue: 0 }]; // No power-ups
                case 7: return [
                    { parameterName: 'bonusDropRate', parameterValue: 1 },
                    { parameterName: 'maxBallSpawn', parameterValue: 4 }
                ]; // Default power-ups
                case 8: return [
                    { parameterName: 'bonusDropRate', parameterValue: 2 },
                    { parameterName: 'maxBallSpawn', parameterValue: 6 }
                ]; // Lots of power-ups, big multi-ball
                case 9: return [
                    { parameterName: 'ballSpeed', parameterValue: 1.6 },
                    { parameterName: 'bonusDropRate', parameterValue: 0.3 },
                    { parameterName: 'maxBallSpawn', parameterValue: 1 }
                ]; // Hard mode
                default:
                    return [];
            }
        case 'change-word':
            // Change Word: timeMultiplier (time per word), rampMultiplier (how fast it shrinks), hintsPerStage
            switch (keyNumber) {
                case 1: return [{ parameterName: 'timeMultiplier', parameterValue: 2.0 }]; // Twice the time
                case 2: return [{ parameterName: 'timeMultiplier', parameterValue: 1.5 }];
                case 3: return [{ parameterName: 'timeMultiplier', parameterValue: 1.0 }]; // Default
                case 4: return [{ parameterName: 'timeMultiplier', parameterValue: 0.75 }];
                case 5: return [{ parameterName: 'timeMultiplier', parameterValue: 0.5 }]; // Half the time
                case 6: return [{ parameterName: 'rampMultiplier', parameterValue: 0 }]; // Time stops shrinking
                case 7: return [{ parameterName: 'rampMultiplier', parameterValue: 2 }]; // Shrinks twice as fast
                case 8: return [{ parameterName: 'hintsPerStage', parameterValue: 10 }]; // Refill hints
                case 9: return [
                    { parameterName: 'timeMultiplier', parameterValue: 0.5 },
                    { parameterName: 'rampMultiplier', parameterValue: 2 },
                    { parameterName: 'hintsPerStage', parameterValue: 0 }
                ]; // Hard mode
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
            // Easy to hard: smaller pieces and a tray that refills sooner, up to the game as designed (9).
            switch (keyNumber) {
                case 1: return [{ parameterName: 'maxPieceCells', parameterValue: 3 }, { parameterName: 'piecesToPlace', parameterValue: 1 }];
                case 2: return [{ parameterName: 'maxPieceCells', parameterValue: 3 }, { parameterName: 'piecesToPlace', parameterValue: 2 }];
                case 3: return [{ parameterName: 'maxPieceCells', parameterValue: 4 }, { parameterName: 'piecesToPlace', parameterValue: 1 }];
                case 4: return [{ parameterName: 'maxPieceCells', parameterValue: 4 }, { parameterName: 'piecesToPlace', parameterValue: 2 }];
                case 5: return [{ parameterName: 'maxPieceCells', parameterValue: 5 }, { parameterName: 'piecesToPlace', parameterValue: 2 }];
                case 6: return [{ parameterName: 'maxPieceCells', parameterValue: 5 }, { parameterName: 'piecesToPlace', parameterValue: 3 }];
                case 7: return [{ parameterName: 'maxPieceCells', parameterValue: 9 }, { parameterName: 'piecesToPlace', parameterValue: 1 }];
                case 8: return [{ parameterName: 'maxPieceCells', parameterValue: 9 }, { parameterName: 'piecesToPlace', parameterValue: 2 }];
                case 9: return [{ parameterName: 'maxPieceCells', parameterValue: 9 }, { parameterName: 'piecesToPlace', parameterValue: 3 }];
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
            // pairs / clusterSpread / cardRotation; all apply to the level in play
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pairs', parameterValue: 3 }];
                case 2: return [{ parameterName: 'pairs', parameterValue: 10 }];
                case 3: return [{ parameterName: 'pairs', parameterValue: 25 }];
                case 4: return [{ parameterName: 'clusterSpread', parameterValue: 0.5 }]; // Dense heap
                case 5: return [{ parameterName: 'clusterSpread', parameterValue: 1.0 }]; // Default
                case 6: return [{ parameterName: 'clusterSpread', parameterValue: 2.0 }]; // Spread out
                case 7: return [{ parameterName: 'cardRotation', parameterValue: 0 }]; // Upright
                case 8: return [{ parameterName: 'cardRotation', parameterValue: 180 }]; // Default
                case 9: return [
                    { parameterName: 'pairs', parameterValue: 40 },
                    { parameterName: 'clusterSpread', parameterValue: 0.5 },
                    { parameterName: 'cardRotation', parameterValue: 180 }
                ]; // Hard mode
                default:
                    return [];
            }
        case 'photo-hunt':
            // timeMultiplier scales each puzzle's own 120 s; missPenaltySeconds costs time per wrong tap
            switch (keyNumber) {
                case 1: return [{ parameterName: 'timeMultiplier', parameterValue: 2.0 }];
                case 2: return [{ parameterName: 'timeMultiplier', parameterValue: 1.5 }];
                case 3: return [{ parameterName: 'timeMultiplier', parameterValue: 1.0 }]; // Default
                case 4: return [{ parameterName: 'timeMultiplier', parameterValue: 0.75 }];
                case 5: return [{ parameterName: 'timeMultiplier', parameterValue: 0.5 }];
                case 6: return [{ parameterName: 'timeMultiplier', parameterValue: 0.25 }]; // 30 s
                case 7: return [{ parameterName: 'missPenaltySeconds', parameterValue: 0 }]; // Default
                case 8: return [{ parameterName: 'missPenaltySeconds', parameterValue: 5 }];
                case 9: return [
                    { parameterName: 'timeMultiplier', parameterValue: 0.4 },
                    { parameterName: 'missPenaltySeconds', parameterValue: 5 },
                    { parameterName: 'tiltMisses', parameterValue: 1 }
                ]; // Hard mode
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
        case 'dungeon-runner':
            // Mirrors PRESETS in the games repo's live/Dungeon Runner/static/js/params.js
            switch (keyNumber) {
                case 1: return [
                    { parameterName: 'playerSpeed', parameterValue: 7 },
                    { parameterName: 'enemySpawnRate', parameterValue: 1 },
                    { parameterName: 'enemyAggression', parameterValue: 0.1 },
                    { parameterName: 'obstacleDensity', parameterValue: 0.2 },
                    { parameterName: 'lightLevel', parameterValue: 1.2 }
                ]; // Chill stroll
                case 2: return [{ parameterName: 'playerSpeed', parameterValue: 8 }]; // Slow
                case 3: return [
                    { parameterName: 'playerSpeed', parameterValue: 10 },
                    { parameterName: 'enemySpawnRate', parameterValue: 3 }
                ]; // Default pace
                case 4: return [{ parameterName: 'playerSpeed', parameterValue: 14 }]; // Fast
                case 5: return [
                    { parameterName: 'enemySpawnRate', parameterValue: 6 },
                    { parameterName: 'enemySpeed', parameterValue: 1.4 }
                ]; // Horde
                case 6: return [
                    { parameterName: 'weaponType', parameterValue: 1 },
                    { parameterName: 'weaponDamage', parameterValue: 1.5 }
                ]; // Shotgun
                case 7: return [{ parameterName: 'weaponType', parameterValue: 2 }]; // Plasma
                case 8: return [
                    { parameterName: 'hazardTelegraphTime', parameterValue: 0.4 },
                    { parameterName: 'obstacleDensity', parameterValue: 0.8 }
                ]; // Twitch
                case 9: return [
                    { parameterName: 'playerSpeed', parameterValue: 18 },
                    { parameterName: 'enemySpawnRate', parameterValue: 8 },
                    { parameterName: 'enemySpeed', parameterValue: 1.8 },
                    { parameterName: 'enemyAggression', parameterValue: 1 },
                    { parameterName: 'obstacleDensity', parameterValue: 1 },
                    { parameterName: 'lightLevel', parameterValue: 0.3 }
                ]; // Nightmare
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
        case 'simon-says':
            // Note: number keys also drive in-game tile presses once a round reaches the
            // player's turn (1st..8th tile on screen, up to numTiles of them) — the game's
            // own listener ignores keys before Play is pressed and while it is showing the
            // sequence, so these presets are safest to trigger at those two moments.
            // Difficulty slider maps to three independent timings:
            //   announcement (0.5x: 1500ms, 1.5x: 500ms)
            //   gap between tiles (0.5x: 800ms, 1.5x: 300ms)
            //   gap between rounds (0.5x: 3000ms, 1.5x: 1000ms)
            switch (keyNumber) {
                case 1: return [
                    { parameterName: 'numTiles', parameterValue: 2 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 0.5 }
                ]; // Beginner
                case 2: return [
                    { parameterName: 'numTiles', parameterValue: 3 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 0.7 }
                ]; // Easy
                case 3: return [
                    { parameterName: 'numTiles', parameterValue: 4 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.0 }
                ]; // Default
                case 4: return [
                    { parameterName: 'numTiles', parameterValue: 4 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.15 }
                ]; // Moderate
                case 5: return [
                    { parameterName: 'numTiles', parameterValue: 5 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.2 }
                ]; // Challenging
                case 6: return [
                    { parameterName: 'numTiles', parameterValue: 6 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.3 }
                ]; // Hard
                case 7: return [
                    { parameterName: 'numTiles', parameterValue: 6 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.4 }
                ]; // Very hard
                case 8: return [
                    { parameterName: 'numTiles', parameterValue: 8 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.45 }
                ]; // Expert
                case 9: return [
                    { parameterName: 'numTiles', parameterValue: 8 },
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.5 }
                ]; // Extreme
                default:
                    return [];
            }
        case 'solitaire':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'drawCount', parameterValue: 1 }]; // Draw One (easy)
                case 2: return [{ parameterName: 'drawCount', parameterValue: 2 }];
                case 3: return [{ parameterName: 'drawCount', parameterValue: 3 }]; // Classic Draw Three (hard)
                default:
                    return [];
            }
        case 'reaction-time':
            switch (keyNumber) {
                case 1: return [
                    { parameterName: 'difficultyMultiplier', parameterValue: 0.5 },
                    { parameterName: 'attemptCount', parameterValue: 3 }
                ]; // Beginner
                case 2: return [
                    { parameterName: 'difficultyMultiplier', parameterValue: 0.75 },
                    { parameterName: 'attemptCount', parameterValue: 4 }
                ]; // Easy
                case 3: return [
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.0 },
                    { parameterName: 'attemptCount', parameterValue: 5 }
                ]; // Default
                case 4: return [
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.25 },
                    { parameterName: 'attemptCount', parameterValue: 6 }
                ]; // Challenging
                case 5: return [
                    { parameterName: 'difficultyMultiplier', parameterValue: 1.5 },
                    { parameterName: 'attemptCount', parameterValue: 7 }
                ]; // Expert
                case 6: return [
                    { parameterName: 'attemptCount', parameterValue: 10 }
                ]; // Extended session
                case 7: return [
                    { parameterName: 'attemptCount', parameterValue: 3 }
                ]; // Quick session
                default:
                    return [];
            }
        case 'dual-n-back':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'nLevel', parameterValue: 1 }, { parameterName: 'stimulusIntervalMs', parameterValue: 3000 }, { parameterName: 'trialCount', parameterValue: 15 }];
                case 2: return [{ parameterName: 'nLevel', parameterValue: 2 }, { parameterName: 'stimulusIntervalMs', parameterValue: 2500 }, { parameterName: 'trialCount', parameterValue: 20 }];
                case 3: return [{ parameterName: 'nLevel', parameterValue: 2 }, { parameterName: 'stimulusIntervalMs', parameterValue: 2000 }, { parameterName: 'trialCount', parameterValue: 25 }];
                case 4: return [{ parameterName: 'nLevel', parameterValue: 3 }, { parameterName: 'stimulusIntervalMs', parameterValue: 2500 }, { parameterName: 'trialCount', parameterValue: 25 }];
                case 5: return [{ parameterName: 'nLevel', parameterValue: 3 }, { parameterName: 'stimulusIntervalMs', parameterValue: 2000 }, { parameterName: 'trialCount', parameterValue: 30 }];
                case 6: return [{ parameterName: 'nLevel', parameterValue: 4 }, { parameterName: 'stimulusIntervalMs', parameterValue: 2000 }, { parameterName: 'trialCount', parameterValue: 30 }];
                case 7: return [{ parameterName: 'nLevel', parameterValue: 5 }, { parameterName: 'stimulusIntervalMs', parameterValue: 1800 }, { parameterName: 'trialCount', parameterValue: 35 }];
                default:
                    return [];
            }
        case 'stroop-test':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'conflictRatio', parameterValue: 0.2 }, { parameterName: 'responseWindowMs', parameterValue: 3000 }, { parameterName: 'roundCount', parameterValue: 15 }];
                case 2: return [{ parameterName: 'conflictRatio', parameterValue: 0.4 }, { parameterName: 'responseWindowMs', parameterValue: 2500 }, { parameterName: 'roundCount', parameterValue: 20 }];
                case 3: return [{ parameterName: 'conflictRatio', parameterValue: 0.5 }, { parameterName: 'responseWindowMs', parameterValue: 2000 }, { parameterName: 'roundCount', parameterValue: 20 }];
                case 4: return [{ parameterName: 'conflictRatio', parameterValue: 0.6 }, { parameterName: 'responseWindowMs', parameterValue: 1500 }, { parameterName: 'roundCount', parameterValue: 25 }];
                case 5: return [{ parameterName: 'conflictRatio', parameterValue: 0.75 }, { parameterName: 'responseWindowMs', parameterValue: 1200 }, { parameterName: 'roundCount', parameterValue: 30 }];
                case 6: return [{ parameterName: 'conflictRatio', parameterValue: 0.9 }, { parameterName: 'responseWindowMs', parameterValue: 1000 }, { parameterName: 'roundCount', parameterValue: 30 }];
                case 7: return [{ parameterName: 'conflictRatio', parameterValue: 1 }, { parameterName: 'responseWindowMs', parameterValue: 800 }, { parameterName: 'roundCount', parameterValue: 40 }];
                default:
                    return [];
            }
        case 'typing-speed':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'wordDifficulty', parameterValue: 1 }, { parameterName: 'timeLimitSec', parameterValue: 30 }];
                case 2: return [{ parameterName: 'wordDifficulty', parameterValue: 1 }, { parameterName: 'timeLimitSec', parameterValue: 60 }];
                case 3: return [{ parameterName: 'wordDifficulty', parameterValue: 2 }, { parameterName: 'timeLimitSec', parameterValue: 60 }];
                case 4: return [{ parameterName: 'wordDifficulty', parameterValue: 2 }, { parameterName: 'timeLimitSec', parameterValue: 90 }];
                case 5: return [{ parameterName: 'wordDifficulty', parameterValue: 3 }, { parameterName: 'timeLimitSec', parameterValue: 60 }];
                case 6: return [{ parameterName: 'wordDifficulty', parameterValue: 3 }, { parameterName: 'timeLimitSec', parameterValue: 120 }];
                default:
                    return [];
            }
        case 'guided-breathing':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'inhaleSec', parameterValue: 4 }, { parameterName: 'holdSec', parameterValue: 0 }, { parameterName: 'exhaleSec', parameterValue: 4 }, { parameterName: 'sessionLengthMin', parameterValue: 1 }];
                case 2: return [{ parameterName: 'inhaleSec', parameterValue: 4 }, { parameterName: 'holdSec', parameterValue: 4 }, { parameterName: 'exhaleSec', parameterValue: 4 }, { parameterName: 'sessionLengthMin', parameterValue: 2 }];
                case 3: return [{ parameterName: 'inhaleSec', parameterValue: 4 }, { parameterName: 'holdSec', parameterValue: 7 }, { parameterName: 'exhaleSec', parameterValue: 8 }, { parameterName: 'sessionLengthMin', parameterValue: 3 }];
                case 4: return [{ parameterName: 'inhaleSec', parameterValue: 5 }, { parameterName: 'holdSec', parameterValue: 2 }, { parameterName: 'exhaleSec', parameterValue: 7 }, { parameterName: 'sessionLengthMin', parameterValue: 5 }];
                case 5: return [{ parameterName: 'inhaleSec', parameterValue: 6 }, { parameterName: 'holdSec', parameterValue: 0 }, { parameterName: 'exhaleSec', parameterValue: 8 }, { parameterName: 'sessionLengthMin', parameterValue: 10 }];
                default:
                    return [];
            }
        case 'procedural-maze':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'mazeSize', parameterValue: 7 }, { parameterName: 'fogRadius', parameterValue: 0 }];
                case 2: return [{ parameterName: 'mazeSize', parameterValue: 11 }, { parameterName: 'fogRadius', parameterValue: 0 }];
                case 3: return [{ parameterName: 'mazeSize', parameterValue: 15 }, { parameterName: 'fogRadius', parameterValue: 0 }];
                case 4: return [{ parameterName: 'mazeSize', parameterValue: 15 }, { parameterName: 'fogRadius', parameterValue: 3 }];
                case 5: return [{ parameterName: 'mazeSize', parameterValue: 21 }, { parameterName: 'fogRadius', parameterValue: 3 }];
                case 6: return [{ parameterName: 'mazeSize', parameterValue: 25 }, { parameterName: 'fogRadius', parameterValue: 2 }];
                case 7: return [{ parameterName: 'mazeSize', parameterValue: 31 }, { parameterName: 'fogRadius', parameterValue: 2 }];
                default:
                    return [];
            }
        case 'order-rush':
            switch (keyNumber) {
                case 1: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 5500 }, { parameterName: 'patienceSec', parameterValue: 36 }, { parameterName: 'difficultyMultiplier', parameterValue: 0.6 }]; // Slow shift
                case 2: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 4500 }, { parameterName: 'patienceSec', parameterValue: 28 }, { parameterName: 'difficultyMultiplier', parameterValue: 0.8 }];
                case 3: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 3500 }, { parameterName: 'patienceSec', parameterValue: 22 }, { parameterName: 'difficultyMultiplier', parameterValue: 1.0 }]; // Default
                case 4: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 2800 }, { parameterName: 'patienceSec', parameterValue: 18 }, { parameterName: 'difficultyMultiplier', parameterValue: 1.15 }];
                case 5: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 2200 }, { parameterName: 'patienceSec', parameterValue: 15 }, { parameterName: 'difficultyMultiplier', parameterValue: 1.3 }]; // Dinner rush
                case 6: return [{ parameterName: 'cookTimeMs', parameterValue: 1800 }]; // Faster kitchen
                case 7: return [{ parameterName: 'tableCount', parameterValue: 8 }]; // Full dining room
                case 8: return [{ parameterName: 'sessionLengthSec', parameterValue: 300 }]; // Longer shift
                case 9: return [{ parameterName: 'customerSpawnIntervalMs', parameterValue: 1600 }, { parameterName: 'patienceSec', parameterValue: 12 }, { parameterName: 'difficultyMultiplier', parameterValue: 1.5 }]; // Impossible mode
                default:
                    return [];
            }
        case 'trails-webar':
            // Mirrors the game's README: 1-2 node count, 3 orbit, 4-6 symbol set, 7-8 guidance, 9 extreme.
            // nodeDimension also accepts the index 0-3 (numbers, letters, alternating, emojis), which is what the backend sends.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'totalNodesCount', parameterValue: 5 }];   // Fewer nodes (easy)
                case 2: return [{ parameterName: 'totalNodesCount', parameterValue: 15 }];  // More nodes
                case 3: return [{ parameterName: 'rotateNodesAroundUser', parameterValue: 1 }, { parameterName: 'rotationSpeed', parameterValue: 8.0 }]; // Orbiting nodes
                case 4: return [{ parameterName: 'nodeDimension', parameterValue: 'letters' }];
                case 5: return [{ parameterName: 'nodeDimension', parameterValue: 'emojis' }];
                case 6: return [{ parameterName: 'nodeDimension', parameterValue: 'alternating' }];
                case 7: return [{ parameterName: 'arrowHelpfulness', parameterValue: 1 }];  // Arrow only
                case 8: return [{ parameterName: 'arrowHelpfulness', parameterValue: 0 }];  // No guidance
                case 9: return [{ parameterName: 'totalNodesCount', parameterValue: 25 }, { parameterName: 'rotateNodesAroundUser', parameterValue: 1 }, { parameterName: 'rotationSpeed', parameterValue: 15.0 }, { parameterName: 'arrowHelpfulness', parameterValue: 0 }]; // Extreme
                default:
                    return [];
            }
        case 'mountain-appreciator':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next pair.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'daylightScale', parameterValue: 1.6 }, { parameterName: 'missPenaltySec', parameterValue: 3 }, { parameterName: 'blinkSunRate', parameterValue: 2 }, { parameterName: 'hitTolerance', parameterValue: 1.35 }]; // Relax
                case 2: return [{ parameterName: 'daylightScale', parameterValue: 1.3 }, { parameterName: 'missPenaltySec', parameterValue: 5 }, { parameterName: 'hitTolerance', parameterValue: 1.15 }]; // Gentle
                case 3: return [{ parameterName: 'daylightScale', parameterValue: 1.0 }, { parameterName: 'missPenaltySec', parameterValue: 7 }, { parameterName: 'blinkSunRate', parameterValue: 4 }, { parameterName: 'hitTolerance', parameterValue: 1.0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'daylightScale', parameterValue: 0.8 }, { parameterName: 'missPenaltySec', parameterValue: 10 }]; // Brisk
                case 5: return [{ parameterName: 'daylightScale', parameterValue: 0.65 }, { parameterName: 'missPenaltySec', parameterValue: 13 }, { parameterName: 'blinkSunRate', parameterValue: 7 }, { parameterName: 'hitTolerance', parameterValue: 0.8 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next pair
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }];  // Harder next pair
                case 8: return [{ parameterName: 'hitTolerance', parameterValue: 0.6 }]; // Precise clicks only
                case 9: return [{ parameterName: 'daylightScale', parameterValue: 0.5 }, { parameterName: 'missPenaltySec', parameterValue: 20 }, { parameterName: 'blinkSunRate', parameterValue: 8 }, { parameterName: 'hitTolerance', parameterValue: 0.6 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'equilibrium':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next mobile.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'liveTilt', parameterValue: true }, { parameterName: 'hintLevel', parameterValue: 2 }, { parameterName: 'candleScale', parameterValue: 2.2 }, { parameterName: 'maxWeight', parameterValue: 8 }]; // Relax
                case 2: return [{ parameterName: 'hintLevel', parameterValue: 1 }, { parameterName: 'candleScale', parameterValue: 1.6 }]; // Gentle
                case 3: return [{ parameterName: 'levelOffset', parameterValue: 0 }, { parameterName: 'maxWeight', parameterValue: 9 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'liveTilt', parameterValue: true }, { parameterName: 'candleScale', parameterValue: 1.0 }]; // Default
                case 4: return [{ parameterName: 'candleScale', parameterValue: 0.75 }]; // Brisk
                case 5: return [{ parameterName: 'liveTilt', parameterValue: false }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'candleScale', parameterValue: 0.7 }, { parameterName: 'maxWeight', parameterValue: 12 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next mobile
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next mobile
                case 8: return [{ parameterName: 'maxWeight', parameterValue: 15 }]; // Heavier weights
                case 9: return [{ parameterName: 'liveTilt', parameterValue: false }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'candleScale', parameterValue: 0.5 }, { parameterName: 'maxWeight', parameterValue: 15 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'firefly-gates':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. runSpeed and hazardDensity apply at once; the rest from the next stage.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'runSpeed', parameterValue: 0.7 }, { parameterName: 'gateTrickiness', parameterValue: 0.2 }, { parameterName: 'beaconStrictness', parameterValue: 0.7 }, { parameterName: 'hazardDensity', parameterValue: 0.3 }]; // Relax
                case 2: return [{ parameterName: 'runSpeed', parameterValue: 0.85 }, { parameterName: 'beaconStrictness', parameterValue: 0.8 }]; // Gentle
                case 3: return [{ parameterName: 'runSpeed', parameterValue: 1.0 }, { parameterName: 'gateTrickiness', parameterValue: 0.5 }, { parameterName: 'numberScale', parameterValue: 1.0 }, { parameterName: 'beaconStrictness', parameterValue: 0.9 }, { parameterName: 'hazardDensity', parameterValue: 1.0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'runSpeed', parameterValue: 1.3 }]; // Faster
                case 5: return [{ parameterName: 'runSpeed', parameterValue: 1.4 }, { parameterName: 'gateTrickiness', parameterValue: 0.85 }, { parameterName: 'beaconStrictness', parameterValue: 0.97 }, { parameterName: 'hazardDensity', parameterValue: 1.5 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next stage
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next stage
                case 8: return [{ parameterName: 'numberScale', parameterValue: 2.5 }]; // Bigger numbers
                case 9: return [{ parameterName: 'runSpeed', parameterValue: 1.8 }, { parameterName: 'gateTrickiness', parameterValue: 1.0 }, { parameterName: 'numberScale', parameterValue: 3.0 }, { parameterName: 'beaconStrictness', parameterValue: 1.0 }, { parameterName: 'hazardDensity', parameterValue: 2.0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'elixir':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next potion.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pourRate', parameterValue: 0.6 }, { parameterName: 'tolerance', parameterValue: 1.6 }, { parameterName: 'gradations', parameterValue: 4 }, { parameterName: 'brewTimeScale', parameterValue: 2.2 }]; // Relax
                case 2: return [{ parameterName: 'pourRate', parameterValue: 0.8 }, { parameterName: 'tolerance', parameterValue: 1.3 }, { parameterName: 'gradations', parameterValue: 2 }]; // Gentle
                case 3: return [{ parameterName: 'pourRate', parameterValue: 1.0 }, { parameterName: 'tolerance', parameterValue: 1.0 }, { parameterName: 'gradations', parameterValue: 0 }, { parameterName: 'brewTimeScale', parameterValue: 1.0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'brewTimeScale', parameterValue: 0.7 }, { parameterName: 'pourRate', parameterValue: 1.3 }]; // Brisk
                case 5: return [{ parameterName: 'pourRate', parameterValue: 1.6 }, { parameterName: 'tolerance', parameterValue: 0.7 }, { parameterName: 'gradations', parameterValue: 0 }, { parameterName: 'brewTimeScale', parameterValue: 0.6 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next potion
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next potion
                case 8: return [{ parameterName: 'gradations', parameterValue: 10 }]; // Tenths marked
                case 9: return [{ parameterName: 'pourRate', parameterValue: 2.0 }, { parameterName: 'tolerance', parameterValue: 0.5 }, { parameterName: 'gradations', parameterValue: 0 }, { parameterName: 'brewTimeScale', parameterValue: 0.5 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'lumen':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pieceBudget', parameterValue: 3 }, { parameterName: 'colourComplexity', parameterValue: 0 }, { parameterName: 'beamPreview', parameterValue: 2 }, { parameterName: 'windowTimer', parameterValue: 0 }]; // Relax
                case 2: return [{ parameterName: 'pieceBudget', parameterValue: 2 }, { parameterName: 'colourComplexity', parameterValue: 1 }, { parameterName: 'beamPreview', parameterValue: 2 }, { parameterName: 'windowTimer', parameterValue: 0 }]; // Gentle
                case 3: return [{ parameterName: 'pieceBudget', parameterValue: 1 }, { parameterName: 'colourComplexity', parameterValue: 1 }, { parameterName: 'beamPreview', parameterValue: 1 }, { parameterName: 'windowTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'pieceBudget', parameterValue: 1 }, { parameterName: 'beamPreview', parameterValue: 1 }, { parameterName: 'windowTimer', parameterValue: 150 }]; // Brisk
                case 5: return [{ parameterName: 'pieceBudget', parameterValue: 0 }, { parameterName: 'colourComplexity', parameterValue: 2 }, { parameterName: 'beamPreview', parameterValue: 0 }, { parameterName: 'windowTimer', parameterValue: 75 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next window
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next window
                case 8: return [{ parameterName: 'pieceBudget', parameterValue: 4 }]; // Many spares
                case 9: return [{ parameterName: 'pieceBudget', parameterValue: 0 }, { parameterName: 'colourComplexity', parameterValue: 2 }, { parameterName: 'beamPreview', parameterValue: 0 }, { parameterName: 'windowTimer', parameterValue: 45 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'flockwork':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'flightiness', parameterValue: 0.65 }, { parameterName: 'dogAutonomy', parameterValue: 0.85 }, { parameterName: 'flockSize', parameterValue: 9 }, { parameterName: 'dayLength', parameterValue: 1.8 }]; // Relax
                case 2: return [{ parameterName: 'flightiness', parameterValue: 0.8 }, { parameterName: 'dogAutonomy', parameterValue: 0.7 }, { parameterName: 'dayLength', parameterValue: 1.3 }]; // Gentle
                case 3: return [{ parameterName: 'flightiness', parameterValue: 1 }, { parameterName: 'dogAutonomy', parameterValue: 0.5 }, { parameterName: 'flockSize', parameterValue: 12 }, { parameterName: 'dayLength', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'dayLength', parameterValue: 0.75 }, { parameterName: 'flockSize', parameterValue: 16 }]; // Brisk
                case 5: return [{ parameterName: 'flightiness', parameterValue: 1.5 }, { parameterName: 'dogAutonomy', parameterValue: 0.1 }, { parameterName: 'flockSize', parameterValue: 18 }, { parameterName: 'dayLength', parameterValue: 0.7 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next field
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next field
                case 8: return [{ parameterName: 'dogAutonomy', parameterValue: 1 }]; // Dogs do it all
                case 9: return [{ parameterName: 'flightiness', parameterValue: 1.8 }, { parameterName: 'dogAutonomy', parameterValue: 0 }, { parameterName: 'flockSize', parameterValue: 30 }, { parameterName: 'dayLength', parameterValue: 0.5 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'broadsheet':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'pressTime', parameterValue: 1.8 }, { parameterName: 'vowelShare', parameterValue: 0.44 }, { parameterName: 'minWordLength', parameterValue: 3 }, { parameterName: 'hintLevel', parameterValue: 2 }]; // Relax
                case 2: return [{ parameterName: 'pressTime', parameterValue: 1.3 }, { parameterName: 'vowelShare', parameterValue: 0.41 }, { parameterName: 'hintLevel', parameterValue: 1 }]; // Gentle
                case 3: return [{ parameterName: 'pressTime', parameterValue: 1 }, { parameterName: 'vowelShare', parameterValue: 0.38 }, { parameterName: 'minWordLength', parameterValue: 3 }, { parameterName: 'hintLevel', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'pressTime', parameterValue: 0.75 }, { parameterName: 'minWordLength', parameterValue: 4 }]; // Brisk
                case 5: return [{ parameterName: 'pressTime', parameterValue: 0.65 }, { parameterName: 'vowelShare', parameterValue: 0.31 }, { parameterName: 'minWordLength', parameterValue: 4 }, { parameterName: 'hintLevel', parameterValue: 0 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next commission
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next commission
                case 8: return [{ parameterName: 'minWordLength', parameterValue: 5 }]; // Five-letter press
                case 9: return [{ parameterName: 'pressTime', parameterValue: 0.5 }, { parameterName: 'vowelShare', parameterValue: 0.28 }, { parameterName: 'minWordLength', parameterValue: 5 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'wayfinder':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'labelDensity', parameterValue: 3 }, { parameterName: 'clueClarity', parameterValue: 2 }, { parameterName: 'scoreRadiusKm', parameterValue: 1000 }, { parameterName: 'clueTimer', parameterValue: 0 }]; // Relax
                case 2: return [{ parameterName: 'labelDensity', parameterValue: 2 }, { parameterName: 'clueClarity', parameterValue: 1 }, { parameterName: 'scoreRadiusKm', parameterValue: 750 }]; // Gentle
                case 3: return [{ parameterName: 'labelDensity', parameterValue: 1 }, { parameterName: 'clueClarity', parameterValue: 1 }, { parameterName: 'scoreRadiusKm', parameterValue: 500 }, { parameterName: 'clueTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'clueTimer', parameterValue: 30 }, { parameterName: 'scoreRadiusKm', parameterValue: 400 }]; // Brisk
                case 5: return [{ parameterName: 'labelDensity', parameterValue: 0 }, { parameterName: 'clueClarity', parameterValue: 0 }, { parameterName: 'scoreRadiusKm', parameterValue: 250 }, { parameterName: 'clueTimer', parameterValue: 20 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next journey
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next journey
                case 8: return [{ parameterName: 'clueClarity', parameterValue: 0 }]; // Riddles only
                case 9: return [{ parameterName: 'labelDensity', parameterValue: 0 }, { parameterName: 'clueClarity', parameterValue: 0 }, { parameterName: 'scoreRadiusKm', parameterValue: 150 }, { parameterName: 'clueTimer', parameterValue: 12 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'hearthlight':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'showTime', parameterValue: 3.6 }, { parameterName: 'feelingClarity', parameterValue: 2 }, { parameterName: 'peeks', parameterValue: 3 }, { parameterName: 'nightTimer', parameterValue: 0 }]; // Relax
                case 2: return [{ parameterName: 'showTime', parameterValue: 3 }, { parameterName: 'feelingClarity', parameterValue: 2 }, { parameterName: 'peeks', parameterValue: 2 }]; // Gentle
                case 3: return [{ parameterName: 'showTime', parameterValue: 2.5 }, { parameterName: 'feelingClarity', parameterValue: 1 }, { parameterName: 'peeks', parameterValue: 1 }, { parameterName: 'nightTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'showTime', parameterValue: 1.8 }, { parameterName: 'nightTimer', parameterValue: 9 }]; // Brisk
                case 5: return [{ parameterName: 'showTime', parameterValue: 1.4 }, { parameterName: 'feelingClarity', parameterValue: 0 }, { parameterName: 'peeks', parameterValue: 0 }, { parameterName: 'nightTimer', parameterValue: 6 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next night
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next night
                case 8: return [{ parameterName: 'feelingClarity', parameterValue: 0 }]; // Faces only
                case 9: return [{ parameterName: 'showTime', parameterValue: 1 }, { parameterName: 'feelingClarity', parameterValue: 0 }, { parameterName: 'peeks', parameterValue: 0 }, { parameterName: 'nightTimer', parameterValue: 4 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'jelly-juggle':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'gravity', parameterValue: 0.75 }, { parameterName: 'spawnRate', parameterValue: 10 }, { parameterName: 'trampolineSize', parameterValue: 1.3 }, { parameterName: 'hoopSize', parameterValue: 1.3 }, { parameterName: 'superWindowMs', parameterValue: 300 }]; // Relax
                case 2: return [{ parameterName: 'gravity', parameterValue: 0.88 }, { parameterName: 'spawnRate', parameterValue: 13 }, { parameterName: 'trampolineSize', parameterValue: 1.15 }, { parameterName: 'hoopSize', parameterValue: 1.15 }, { parameterName: 'superWindowMs', parameterValue: 240 }]; // Gentle
                case 3: return [{ parameterName: 'gravity', parameterValue: 1 }, { parameterName: 'spawnRate', parameterValue: 16 }, { parameterName: 'trampolineSize', parameterValue: 1 }, { parameterName: 'hoopSize', parameterValue: 1 }, { parameterName: 'superWindowMs', parameterValue: 180 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'gravity', parameterValue: 1.15 }, { parameterName: 'spawnRate', parameterValue: 22 }]; // Brisk
                case 5: return [{ parameterName: 'gravity', parameterValue: 1.35 }, { parameterName: 'spawnRate', parameterValue: 30 }, { parameterName: 'trampolineSize', parameterValue: 0.8 }, { parameterName: 'hoopSize', parameterValue: 0.8 }, { parameterName: 'superWindowMs', parameterValue: 110 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next level
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next level
                case 8: return [{ parameterName: 'trampolineSize', parameterValue: 1.5 }]; // Giant trampoline
                case 9: return [{ parameterName: 'gravity', parameterValue: 1.6 }, { parameterName: 'spawnRate', parameterValue: 40 }, { parameterName: 'trampolineSize', parameterValue: 0.7 }, { parameterName: 'hoopSize', parameterValue: 0.7 }, { parameterName: 'superWindowMs', parameterValue: 60 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'xenoflora':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'trialBudget', parameterValue: 8 }, { parameterName: 'ruleComplexity', parameterValue: 0 }, { parameterName: 'attributeCount', parameterValue: 2 }, { parameterName: 'journalHints', parameterValue: 2 }]; // Relax
                case 2: return [{ parameterName: 'trialBudget', parameterValue: 6 }, { parameterName: 'attributeCount', parameterValue: 3 }, { parameterName: 'journalHints', parameterValue: 1 }]; // Gentle
                case 3: return [{ parameterName: 'trialBudget', parameterValue: 5 }, { parameterName: 'ruleComplexity', parameterValue: 0 }, { parameterName: 'attributeCount', parameterValue: 3 }, { parameterName: 'journalHints', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'trialBudget', parameterValue: 8 }, { parameterName: 'attributeCount', parameterValue: 4 }, { parameterName: 'journalHints', parameterValue: 0 }]; // Curious
                case 5: return [{ parameterName: 'trialBudget', parameterValue: 3 }, { parameterName: 'ruleComplexity', parameterValue: 2 }, { parameterName: 'attributeCount', parameterValue: 5 }, { parameterName: 'journalHints', parameterValue: 0 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next garden
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next garden
                case 8: return [{ parameterName: 'journalHints', parameterValue: 2 }]; // Full journal hints
                case 9: return [{ parameterName: 'trialBudget', parameterValue: 3 }, { parameterName: 'ruleComplexity', parameterValue: 2 }, { parameterName: 'attributeCount', parameterValue: 5 }, { parameterName: 'journalHints', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'chronicle':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'yearHints', parameterValue: 2 }, { parameterName: 'eraSpread', parameterValue: 100 }, { parameterName: 'obscurity', parameterValue: 1 }, { parameterName: 'cardsPerChapter', parameterValue: 6 }, { parameterName: 'placeTimer', parameterValue: 0 }]; // Relax
                case 2: return [{ parameterName: 'yearHints', parameterValue: 1 }, { parameterName: 'eraSpread', parameterValue: 50 }, { parameterName: 'obscurity', parameterValue: 1 }, { parameterName: 'cardsPerChapter', parameterValue: 7 }, { parameterName: 'placeTimer', parameterValue: 0 }]; // Gentle
                case 3: return [{ parameterName: 'yearHints', parameterValue: 0 }, { parameterName: 'eraSpread', parameterValue: 15 }, { parameterName: 'obscurity', parameterValue: 2 }, { parameterName: 'cardsPerChapter', parameterValue: 8 }, { parameterName: 'placeTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'placeTimer', parameterValue: 30 }, { parameterName: 'cardsPerChapter', parameterValue: 9 }]; // Brisk
                case 5: return [{ parameterName: 'yearHints', parameterValue: 0 }, { parameterName: 'eraSpread', parameterValue: 2 }, { parameterName: 'obscurity', parameterValue: 3 }, { parameterName: 'cardsPerChapter', parameterValue: 11 }, { parameterName: 'placeTimer', parameterValue: 15 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next chapter
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next chapter
                case 8: return [{ parameterName: 'yearHints', parameterValue: 2 }]; // Decade hints
                case 9: return [{ parameterName: 'yearHints', parameterValue: 0 }, { parameterName: 'eraSpread', parameterValue: 0 }, { parameterName: 'obscurity', parameterValue: 3 }, { parameterName: 'cardsPerChapter', parameterValue: 12 }, { parameterName: 'placeTimer', parameterValue: 8 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'glide':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'windStrength', parameterValue: 0.3 }, { parameterName: 'leadDuration', parameterValue: 8 }, { parameterName: 'obstacleDensity', parameterValue: 0.4 }, { parameterName: 'flockSize', parameterValue: 7 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'windStrength', parameterValue: 0.6 }, { parameterName: 'leadDuration', parameterValue: 10 }, { parameterName: 'obstacleDensity', parameterValue: 0.7 }]; // Gentle
                case 3: return [{ parameterName: 'windStrength', parameterValue: 1 }, { parameterName: 'leadDuration', parameterValue: 12 }, { parameterName: 'obstacleDensity', parameterValue: 1 }, { parameterName: 'flockSize', parameterValue: 7 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'obstacleDensity', parameterValue: 1.4 }, { parameterName: 'leadDuration', parameterValue: 14 }]; // Busy sky
                case 5: return [{ parameterName: 'windStrength', parameterValue: 1.6 }, { parameterName: 'leadDuration', parameterValue: 18 }, { parameterName: 'obstacleDensity', parameterValue: 1.7 }, { parameterName: 'flockSize', parameterValue: 9 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next leg
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next leg
                case 8: return [{ parameterName: 'flockSize', parameterValue: 11 }]; // Big skein (11 birds)
                case 9: return [{ parameterName: 'windStrength', parameterValue: 2 }, { parameterName: 'leadDuration', parameterValue: 24 }, { parameterName: 'obstacleDensity', parameterValue: 2 }, { parameterName: 'flockSize', parameterValue: 11 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'cache':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'cacheCount', parameterValue: 3 }, { parameterName: 'landmarkChanges', parameterValue: 0 }, { parameterName: 'delaySeconds', parameterValue: 6 }, { parameterName: 'digHints', parameterValue: 2 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'cacheCount', parameterValue: 3 }, { parameterName: 'landmarkChanges', parameterValue: 1 }, { parameterName: 'delaySeconds', parameterValue: 8 }, { parameterName: 'digHints', parameterValue: 2 }]; // Gentle
                case 3: return [{ parameterName: 'cacheCount', parameterValue: 4 }, { parameterName: 'landmarkChanges', parameterValue: 1 }, { parameterName: 'delaySeconds', parameterValue: 10 }, { parameterName: 'digHints', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'cacheCount', parameterValue: 5 }, { parameterName: 'landmarkChanges', parameterValue: 2 }, { parameterName: 'delaySeconds', parameterValue: 12 }]; // Brisk
                case 5: return [{ parameterName: 'cacheCount', parameterValue: 6 }, { parameterName: 'landmarkChanges', parameterValue: 3 }, { parameterName: 'delaySeconds', parameterValue: 20 }, { parameterName: 'digHints', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next park
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next park
                case 8: return [{ parameterName: 'landmarkChanges', parameterValue: 4 }]; // Shifting park
                case 9: return [{ parameterName: 'cacheCount', parameterValue: 8 }, { parameterName: 'landmarkChanges', parameterValue: 4 }, { parameterName: 'delaySeconds', parameterValue: 30 }, { parameterName: 'digHints', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'treehouse-telegraph':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'boardSize', parameterValue: 9 }, { parameterName: 'clueClarity', parameterValue: 1 }, { parameterName: 'decoyStrength', parameterValue: 0.1 }, { parameterName: 'turnTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'boardSize', parameterValue: 10 }, { parameterName: 'clueClarity', parameterValue: 0.9 }, { parameterName: 'decoyStrength', parameterValue: 0.25 }, { parameterName: 'turnTimer', parameterValue: 0 }]; // Gentle
                case 3: return [{ parameterName: 'boardSize', parameterValue: 12 }, { parameterName: 'clueClarity', parameterValue: 0.75 }, { parameterName: 'decoyStrength', parameterValue: 0.4 }, { parameterName: 'turnTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'boardSize', parameterValue: 12 }, { parameterName: 'turnTimer', parameterValue: 30 }]; // Brisk
                case 5: return [{ parameterName: 'boardSize', parameterValue: 16 }, { parameterName: 'clueClarity', parameterValue: 0.45 }, { parameterName: 'decoyStrength', parameterValue: 0.85 }, { parameterName: 'turnTimer', parameterValue: 20 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next board
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next board
                case 8: return [{ parameterName: 'decoyStrength', parameterValue: 1 }]; // Sneaky decoys
                case 9: return [{ parameterName: 'boardSize', parameterValue: 16 }, { parameterName: 'clueClarity', parameterValue: 0.3 }, { parameterName: 'decoyStrength', parameterValue: 1 }, { parameterName: 'turnTimer', parameterValue: 10 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'viewpoints':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'sightCones', parameterValue: 2 }, { parameterName: 'eventCount', parameterValue: 1 }, { parameterName: 'replay', parameterValue: 3 }, { parameterName: 'answerTimer', parameterValue: 0 }, { parameterName: 'storySpeed', parameterValue: 0.75 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'sightCones', parameterValue: 2 }, { parameterName: 'eventCount', parameterValue: 2 }, { parameterName: 'replay', parameterValue: 2 }, { parameterName: 'answerTimer', parameterValue: 0 }, { parameterName: 'storySpeed', parameterValue: 0.85 }]; // Gentle
                case 3: return [{ parameterName: 'sightCones', parameterValue: 1 }, { parameterName: 'eventCount', parameterValue: 2 }, { parameterName: 'replay', parameterValue: 1 }, { parameterName: 'answerTimer', parameterValue: 0 }, { parameterName: 'storySpeed', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'sightCones', parameterValue: 1 }, { parameterName: 'eventCount', parameterValue: 3 }, { parameterName: 'answerTimer', parameterValue: 20 }, { parameterName: 'storySpeed', parameterValue: 1.15 }]; // Brisk
                case 5: return [{ parameterName: 'sightCones', parameterValue: 0 }, { parameterName: 'eventCount', parameterValue: 5 }, { parameterName: 'replay', parameterValue: 0 }, { parameterName: 'answerTimer', parameterValue: 10 }, { parameterName: 'storySpeed', parameterValue: 1.4 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next story
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next story
                case 8: return [{ parameterName: 'sightCones', parameterValue: 2 }]; // All sight cones
                case 9: return [{ parameterName: 'sightCones', parameterValue: 0 }, { parameterName: 'eventCount', parameterValue: 6 }, { parameterName: 'replay', parameterValue: 0 }, { parameterName: 'answerTimer', parameterValue: 6 }, { parameterName: 'storySpeed', parameterValue: 1.6 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'bandstand':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'tempo', parameterValue: 80 }, { parameterName: 'phraseLength', parameterValue: 3 }, { parameterName: 'timingWindowMs', parameterValue: 220 }, { parameterName: 'bandHelp', parameterValue: 2 }]; // Relax
                case 2: return [{ parameterName: 'tempo', parameterValue: 90 }, { parameterName: 'phraseLength', parameterValue: 3 }, { parameterName: 'timingWindowMs', parameterValue: 180 }, { parameterName: 'bandHelp', parameterValue: 2 }]; // Gentle
                case 3: return [{ parameterName: 'tempo', parameterValue: 100 }, { parameterName: 'phraseLength', parameterValue: 4 }, { parameterName: 'timingWindowMs', parameterValue: 140 }, { parameterName: 'bandHelp', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'tempo', parameterValue: 116 }, { parameterName: 'phraseLength', parameterValue: 4 }, { parameterName: 'timingWindowMs', parameterValue: 130 }]; // Brisk
                case 5: return [{ parameterName: 'tempo', parameterValue: 128 }, { parameterName: 'phraseLength', parameterValue: 6 }, { parameterName: 'timingWindowMs', parameterValue: 90 }, { parameterName: 'bandHelp', parameterValue: 0 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next tune
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next tune
                case 8: return [{ parameterName: 'phraseLength', parameterValue: 8 }]; // Long calls
                case 9: return [{ parameterName: 'tempo', parameterValue: 150 }, { parameterName: 'phraseLength', parameterValue: 8 }, { parameterName: 'timingWindowMs', parameterValue: 60 }, { parameterName: 'bandHelp', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'switchyard':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'trainSpeed', parameterValue: 0.65 }, { parameterName: 'ruleSwitchEvery', parameterValue: 6 }, { parameterName: 'cueWarning', parameterValue: 5.5 }, { parameterName: 'trackComplexity', parameterValue: 1 }]; // Relax
                case 2: return [{ parameterName: 'trainSpeed', parameterValue: 0.8 }, { parameterName: 'ruleSwitchEvery', parameterValue: 4 }, { parameterName: 'cueWarning', parameterValue: 4.5 }, { parameterName: 'trackComplexity', parameterValue: 2 }]; // Gentle
                case 3: return [{ parameterName: 'trainSpeed', parameterValue: 1 }, { parameterName: 'ruleSwitchEvery', parameterValue: 3 }, { parameterName: 'cueWarning', parameterValue: 3 }, { parameterName: 'trackComplexity', parameterValue: 2 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'trainSpeed', parameterValue: 1.2 }, { parameterName: 'ruleSwitchEvery', parameterValue: 3 }, { parameterName: 'cueWarning', parameterValue: 2 }]; // Brisk
                case 5: return [{ parameterName: 'trainSpeed', parameterValue: 1.45 }, { parameterName: 'ruleSwitchEvery', parameterValue: 1 }, { parameterName: 'cueWarning', parameterValue: 0.5 }, { parameterName: 'trackComplexity', parameterValue: 4 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next level
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next level
                case 8: return [{ parameterName: 'ruleSwitchEvery', parameterValue: 1 }]; // New rule every train
                case 9: return [{ parameterName: 'trainSpeed', parameterValue: 2 }, { parameterName: 'ruleSwitchEvery', parameterValue: 1 }, { parameterName: 'cueWarning', parameterValue: 0 }, { parameterName: 'trackComplexity', parameterValue: 4 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'kind-words-cafe':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'tileChoices', parameterValue: 2 }, { parameterName: 'nuance', parameterValue: 0 }, { parameterName: 'customerPace', parameterValue: 0.6 }, { parameterName: 'hintLevel', parameterValue: 2 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'tileChoices', parameterValue: 3 }, { parameterName: 'nuance', parameterValue: 1 }, { parameterName: 'customerPace', parameterValue: 0.8 }, { parameterName: 'hintLevel', parameterValue: 1 }]; // Gentle
                case 3: return [{ parameterName: 'tileChoices', parameterValue: 3 }, { parameterName: 'nuance', parameterValue: 1 }, { parameterName: 'customerPace', parameterValue: 1 }, { parameterName: 'hintLevel', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'tileChoices', parameterValue: 4 }, { parameterName: 'customerPace', parameterValue: 1.3 }]; // Brisk
                case 5: return [{ parameterName: 'tileChoices', parameterValue: 5 }, { parameterName: 'nuance', parameterValue: 2 }, { parameterName: 'customerPace', parameterValue: 1.6 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next shift
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next shift
                case 8: return [{ parameterName: 'nuance', parameterValue: 2 }]; // Near-synonyms
                case 9: return [{ parameterName: 'tileChoices', parameterValue: 5 }, { parameterName: 'nuance', parameterValue: 2 }, { parameterName: 'customerPace', parameterValue: 2 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'blockwright':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'counterVisible', parameterValue: 0 }, { parameterName: 'targetSize', parameterValue: 0.75 }, { parameterName: 'constraintCount', parameterValue: 1 }, { parameterName: 'buildTimer', parameterValue: 0 }]; // Relax
                case 2: return [{ parameterName: 'counterVisible', parameterValue: 0 }, { parameterName: 'targetSize', parameterValue: 0.9 }, { parameterName: 'constraintCount', parameterValue: 2 }, { parameterName: 'buildTimer', parameterValue: 0 }]; // Gentle
                case 3: return [{ parameterName: 'counterVisible', parameterValue: 0 }, { parameterName: 'targetSize', parameterValue: 1 }, { parameterName: 'constraintCount', parameterValue: 2 }, { parameterName: 'buildTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'buildTimer', parameterValue: 120 }, { parameterName: 'constraintCount', parameterValue: 3 }]; // Brisk
                case 5: return [{ parameterName: 'counterVisible', parameterValue: 2 }, { parameterName: 'targetSize', parameterValue: 1.4 }, { parameterName: 'constraintCount', parameterValue: 3 }, { parameterName: 'buildTimer', parameterValue: 75 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next commission
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next commission
                case 8: return [{ parameterName: 'counterVisible', parameterValue: 1 }]; // Counter on request
                case 9: return [{ parameterName: 'counterVisible', parameterValue: 2 }, { parameterName: 'targetSize', parameterValue: 1.6 }, { parameterName: 'constraintCount', parameterValue: 4 }, { parameterName: 'buildTimer', parameterValue: 45 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'tidepool':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'camouflage', parameterValue: 0.2 }, { parameterName: 'tideSpeed', parameterValue: 0.6 }, { parameterName: 'creatureCount', parameterValue: 4 }, { parameterName: 'calmTolerance', parameterValue: 1.6 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'camouflage', parameterValue: 0.3 }, { parameterName: 'tideSpeed', parameterValue: 0.8 }, { parameterName: 'creatureCount', parameterValue: 4 }, { parameterName: 'calmTolerance', parameterValue: 1.3 }]; // Gentle
                case 3: return [{ parameterName: 'camouflage', parameterValue: 0.55 }, { parameterName: 'tideSpeed', parameterValue: 1 }, { parameterName: 'creatureCount', parameterValue: 5 }, { parameterName: 'calmTolerance', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'tideSpeed', parameterValue: 1.3 }, { parameterName: 'creatureCount', parameterValue: 6 }]; // Brisk
                case 5: return [{ parameterName: 'camouflage', parameterValue: 0.8 }, { parameterName: 'tideSpeed', parameterValue: 1.5 }, { parameterName: 'creatureCount', parameterValue: 7 }, { parameterName: 'calmTolerance', parameterValue: 0.7 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next pool
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next pool
                case 8: return [{ parameterName: 'camouflage', parameterValue: 0.95 }]; // Master of disguise
                case 9: return [{ parameterName: 'camouflage', parameterValue: 1 }, { parameterName: 'tideSpeed', parameterValue: 2 }, { parameterName: 'creatureCount', parameterValue: 9 }, { parameterName: 'calmTolerance', parameterValue: 0.5 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'lookout':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'eventRate', parameterValue: 0.7 }, { parameterName: 'protocolChanges', parameterValue: 0 }, { parameterName: 'cueVisibility', parameterValue: 1 }, { parameterName: 'responseWindow', parameterValue: 1.7 }]; // Relax
                case 2: return [{ parameterName: 'eventRate', parameterValue: 0.85 }, { parameterName: 'protocolChanges', parameterValue: 1 }, { parameterName: 'cueVisibility', parameterValue: 0.95 }, { parameterName: 'responseWindow', parameterValue: 1.3 }]; // Gentle
                case 3: return [{ parameterName: 'eventRate', parameterValue: 1 }, { parameterName: 'protocolChanges', parameterValue: 1 }, { parameterName: 'cueVisibility', parameterValue: 1 }, { parameterName: 'responseWindow', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'eventRate', parameterValue: 1.3 }, { parameterName: 'responseWindow', parameterValue: 0.85 }]; // Brisk
                case 5: return [{ parameterName: 'eventRate', parameterValue: 1.6 }, { parameterName: 'protocolChanges', parameterValue: 3 }, { parameterName: 'cueVisibility', parameterValue: 0.55 }, { parameterName: 'responseWindow', parameterValue: 0.7 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next shift
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next shift
                case 8: return [{ parameterName: 'cueVisibility', parameterValue: 0.35 }]; // Thick fog
                case 9: return [{ parameterName: 'eventRate', parameterValue: 2 }, { parameterName: 'protocolChanges', parameterValue: 4 }, { parameterName: 'cueVisibility', parameterValue: 0.3 }, { parameterName: 'responseWindow', parameterValue: 0.5 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'gearworks':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'ratioComplexity', parameterValue: 0 }, { parameterName: 'gearChoices', parameterValue: 4 }, { parameterName: 'previewSpin', parameterValue: 2 }, { parameterName: 'benchTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'ratioComplexity', parameterValue: 0 }, { parameterName: 'gearChoices', parameterValue: 5 }, { parameterName: 'previewSpin', parameterValue: 2 }, { parameterName: 'benchTimer', parameterValue: 0 }]; // Gentle
                case 3: return [{ parameterName: 'ratioComplexity', parameterValue: 1 }, { parameterName: 'gearChoices', parameterValue: 6 }, { parameterName: 'previewSpin', parameterValue: 1 }, { parameterName: 'benchTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'gearChoices', parameterValue: 8 }, { parameterName: 'previewSpin', parameterValue: 1 }, { parameterName: 'benchTimer', parameterValue: 90 }]; // Brisk
                case 5: return [{ parameterName: 'ratioComplexity', parameterValue: 2 }, { parameterName: 'gearChoices', parameterValue: 9 }, { parameterName: 'previewSpin', parameterValue: 0 }, { parameterName: 'benchTimer', parameterValue: 60 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next level
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next level
                case 8: return [{ parameterName: 'previewSpin', parameterValue: 0 }]; // No preview
                case 9: return [{ parameterName: 'ratioComplexity', parameterValue: 2 }, { parameterName: 'gearChoices', parameterValue: 9 }, { parameterName: 'previewSpin', parameterValue: 0 }, { parameterName: 'benchTimer', parameterValue: 30 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'market-day':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'queuePace', parameterValue: 0.6 }, { parameterName: 'dealComplexity', parameterValue: 0 }, { parameterName: 'changeHelp', parameterValue: 2 }, { parameterName: 'numberScale', parameterValue: 0.6 }]; // Relax
                case 2: return [{ parameterName: 'queuePace', parameterValue: 0.8 }, { parameterName: 'dealComplexity', parameterValue: 1 }, { parameterName: 'changeHelp', parameterValue: 1 }, { parameterName: 'numberScale', parameterValue: 0.8 }]; // Gentle
                case 3: return [{ parameterName: 'queuePace', parameterValue: 1 }, { parameterName: 'dealComplexity', parameterValue: 1 }, { parameterName: 'changeHelp', parameterValue: 0 }, { parameterName: 'numberScale', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'queuePace', parameterValue: 1.3 }, { parameterName: 'numberScale', parameterValue: 1.2 }]; // Brisk
                case 5: return [{ parameterName: 'queuePace', parameterValue: 1.6 }, { parameterName: 'dealComplexity', parameterValue: 2 }, { parameterName: 'changeHelp', parameterValue: 0 }, { parameterName: 'numberScale', parameterValue: 1.6 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next day
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next day
                case 8: return [{ parameterName: 'dealComplexity', parameterValue: 2 }]; // Percentage deals
                case 9: return [{ parameterName: 'queuePace', parameterValue: 2 }, { parameterName: 'dealComplexity', parameterValue: 2 }, { parameterName: 'changeHelp', parameterValue: 0 }, { parameterName: 'numberScale', parameterValue: 2 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'waggle':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'danceRepeats', parameterValue: 5 }, { parameterName: 'danceCount', parameterValue: 1 }, { parameterName: 'patchSpread', parameterValue: 1.7 }, { parameterName: 'sunMarker', parameterValue: 2 }, { parameterName: 'danceSpeed', parameterValue: 0.75 }]; // Relax
                case 2: return [{ parameterName: 'danceRepeats', parameterValue: 4 }, { parameterName: 'patchSpread', parameterValue: 1.3 }, { parameterName: 'sunMarker', parameterValue: 2 }, { parameterName: 'danceSpeed', parameterValue: 0.9 }]; // Gentle
                case 3: return [{ parameterName: 'danceRepeats', parameterValue: 3 }, { parameterName: 'danceCount', parameterValue: 0 }, { parameterName: 'patchSpread', parameterValue: 1 }, { parameterName: 'sunMarker', parameterValue: 1 }, { parameterName: 'danceSpeed', parameterValue: 1 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'danceRepeats', parameterValue: 2 }, { parameterName: 'danceSpeed', parameterValue: 1.25 }, { parameterName: 'danceCount', parameterValue: 2 }]; // Brisk
                case 5: return [{ parameterName: 'danceRepeats', parameterValue: 1 }, { parameterName: 'danceCount', parameterValue: 3 }, { parameterName: 'patchSpread', parameterValue: 0.65 }, { parameterName: 'sunMarker', parameterValue: 0 }, { parameterName: 'danceSpeed', parameterValue: 1.4 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next foray
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next foray
                case 8: return [{ parameterName: 'sunMarker', parameterValue: 0 }]; // No sun line
                case 9: return [{ parameterName: 'danceRepeats', parameterValue: 1 }, { parameterName: 'danceCount', parameterValue: 4 }, { parameterName: 'patchSpread', parameterValue: 0.5 }, { parameterName: 'sunMarker', parameterValue: 0 }, { parameterName: 'danceSpeed', parameterValue: 1.6 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        case 'rootwords':
            // Mirrors GAME_PARAMETERS.MD and the game's iframeTest.html. levelOffset applies from the next level.
            switch (keyNumber) {
                case 1: return [{ parameterName: 'rootChoices', parameterValue: 5 }, { parameterName: 'rarity', parameterValue: 0 }, { parameterName: 'hintLevel', parameterValue: 2 }, { parameterName: 'decodeTimer', parameterValue: 0 }, { parameterName: 'levelOffset', parameterValue: -1 }]; // Relax
                case 2: return [{ parameterName: 'rootChoices', parameterValue: 6 }, { parameterName: 'rarity', parameterValue: 0 }, { parameterName: 'hintLevel', parameterValue: 1 }, { parameterName: 'decodeTimer', parameterValue: 30 }]; // Gentle
                case 3: return [{ parameterName: 'rootChoices', parameterValue: 8 }, { parameterName: 'rarity', parameterValue: 1 }, { parameterName: 'hintLevel', parameterValue: 1 }, { parameterName: 'decodeTimer', parameterValue: 20 }, { parameterName: 'levelOffset', parameterValue: 0 }]; // Default
                case 4: return [{ parameterName: 'rootChoices', parameterValue: 10 }, { parameterName: 'decodeTimer', parameterValue: 14 }]; // Brisk
                case 5: return [{ parameterName: 'rootChoices', parameterValue: 11 }, { parameterName: 'rarity', parameterValue: 2 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'decodeTimer', parameterValue: 10 }, { parameterName: 'levelOffset', parameterValue: 1 }]; // Grit
                case 6: return [{ parameterName: 'levelOffset', parameterValue: -2 }]; // Easier next tree
                case 7: return [{ parameterName: 'levelOffset', parameterValue: 2 }]; // Harder next tree
                case 8: return [{ parameterName: 'hintLevel', parameterValue: 0 }]; // Bare roots (no meanings)
                case 9: return [{ parameterName: 'rootChoices', parameterValue: 12 }, { parameterName: 'rarity', parameterValue: 2 }, { parameterName: 'hintLevel', parameterValue: 0 }, { parameterName: 'decodeTimer', parameterValue: 6 }, { parameterName: 'levelOffset', parameterValue: 3 }]; // Extreme
                default:
                    return [];
            }
        default:
            return []; // No test adjustments implemented yet for this game
    }
}
