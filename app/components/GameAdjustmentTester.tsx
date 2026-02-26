'use client';

import { useEffect } from 'react';

interface GameAdjustmentTesterProps {
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    slug: string;
}

export default function GameAdjustmentTester({ iframeRef, slug }: GameAdjustmentTesterProps) {
    useEffect(() => {
        console.log('GameAdjustmentTester mounted for game:', slug);
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only respond to keys 1-9
            if (!/^[1-9]$/.test(event.key)) {
                return;
            }

            const key = parseInt(event.key, 10);
            const adjustments = getAdjustmentsForGame(slug, key);

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
                console.log(`No adjustments mapped for key ${key} in game ${slug}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
