import { Suspense } from 'react';
import GameClient from '../game/[slug]/GameClient';

const ADJUSTMENTS = [
    { key: 1, desc: 'Set heroDamage to 10' },
    { key: 2, desc: 'Set heroDamage to 50' },
    { key: 3, desc: 'Set enemyDamage to 5' },
    { key: 4, desc: 'Set enemyDamage to 40' },
    { key: 5, desc: 'Set enemyAttackRateMs to 8000' },
    { key: 6, desc: 'Set enemyAttackRateMs to 3000' },
    { key: 7, desc: 'Set enemyAttackRateMs to 1000' },
    { key: 8, desc: 'Set healAmount to 10' },
    { key: 9, desc: 'Set healAmount to 60' },
];

export default function TestMageDuelPage() {
    return (
        <div className="relative w-full h-screen">
            <div className="absolute top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-xl shadow-xl pointer-events-none w-72 backdrop-blur-sm border border-white/10">
                <h3 className="font-bold mb-1 text-lg">Mage Duel Adjustments</h3>
                <p className="mb-4 text-white/60 text-sm">Press keys 1-9 to test parameters:</p>
                <ul className="space-y-2">
                    {ADJUSTMENTS.map(adj => (
                        <li key={adj.key} className="flex gap-3 items-center">
                            <span className="font-mono bg-white/20 text-white px-2 py-0.5 rounded-md text-xs font-bold w-6 text-center shadow-inner">{adj.key}</span>
                            <span className="text-sm font-medium text-white/90">{adj.desc}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading Mage Duel...</div>}>
                <GameClient slug="mage-duel-2d" />
            </Suspense>
        </div>
    );
}
