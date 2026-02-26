'use client';

import { useEffect } from 'react';
import { unifiedSlugFromBESlug } from '../game/[slug]/GameClient';

interface GameAdjustmentTesterProps {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    slug: string;
}

export default function GameAdjustmentTester({ iframeRef, slug }: GameAdjustmentTesterProps) {
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
        default:
            return []; // No test adjustments implemented yet for this game
    }
}
