import { Suspense } from 'react';
import GameClient from '../game/[slug]/GameClient';

export default function TestMageDuelPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading Mage Duel...</div>}>
            <GameClient slug="mage-duel-2d" />
        </Suspense>
    );
}
