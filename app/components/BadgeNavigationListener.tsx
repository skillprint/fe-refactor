'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserSession } from '../hooks/useUserSession';
import { get } from '../api/api';
import toast from 'react-hot-toast';
import { INITIAL_MOCK_BADGES } from '../profile/badges/hooks/useBadges';
import { Badge } from '../profile/badges/types';

const LOCAL_STORAGE_KEY = 'skillprint_unlocked_badge_ids_tracker';
const MOCK_BADGES_KEY = 'skillprint_mock_badges';

function showBadgeUnlockToast(badge: Badge, router: any) {
    toast.custom((t) => (
        <div
            className={`
                ${t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
                w-[calc(100vw-2rem)] sm:max-w-md bg-slate-950/95 text-white border border-zinc-800/80 shadow-2xl rounded-2xl pointer-events-auto flex p-4 ring-1 ring-black/5 backdrop-blur-xl transition-all duration-300 ease-out
            `}
        >
            <div className="flex-1 w-0">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {/* Glowing container matching badge color */}
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.color} opacity-40 blur-md animate-pulse`} />
                            <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-2xl shadow-lg border border-white/10`}>
                                {badge.icon || '🏆'}
                            </div>
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <span className="inline-block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-0.5 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            Badge Unlocked!
                        </span>
                        <h3 className="text-sm font-black text-white mt-1 tracking-tight">
                            {badge.name}
                        </h3>
                        {badge.gameTitle && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                In {badge.gameTitle}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">
                            {badge.description}
                        </p>
                        <div className="mt-3 flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    router.push('/profile/badges');
                                }}
                                className="text-xs font-black text-amber-400 hover:text-amber-300 hover:underline transition-colors uppercase tracking-wider cursor-pointer flex items-center gap-1"
                            >
                                Learn More
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex items-start">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="rounded-lg p-1.5 inline-flex text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all focus:outline-none cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    ), {
        duration: Infinity, // Sticky toast
        position: 'bottom-right'
    });
}

function mergeBadgesWithServerData(serverData: any[], localBadges: Badge[]): Badge[] {
    if (!Array.isArray(serverData)) return localBadges;
    return localBadges.map(local => {
        const serverItem = serverData.find((s: any) =>
            s.id === local.id ||
            s.badgeId === local.id ||
            s.badge_id === local.id ||
            (s.name && s.name.toLowerCase() === local.name.toLowerCase()) ||
            (s.animalName && s.animalName.toLowerCase() === local.name.toLowerCase())
        );
        if (serverItem) {
            const isUnlocked = serverItem.unlocked ?? serverItem.earned ?? local.earned;
            return {
                ...local,
                earned: isUnlocked,
            };
        }
        return local;
    });
}

export default function BadgeNavigationListener() {
    const pathname = usePathname();
    const router = useRouter();
    const { userToken, isLoading } = useUserSession();
    const lastPathnameRef = useRef<string | null>(null);

    useEffect(() => {
        if (isLoading || !userToken) return;

        // Skip if pathname has not changed (prevents double triggering on query parameters)
        if (lastPathnameRef.current === pathname) return;
        lastPathnameRef.current = pathname;

        const checkBadges = async () => {
            let badgesToProcess: Badge[] = [];
            try {
                const headers: any = {};
                headers["X-Auth-Token"] = `Token ${userToken}`;
                const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'test-api-key';
                if (apiKey) {
                    headers["Authorization"] = `Api-Key ${apiKey}`;
                }

                console.log('[BadgeNavigationListener] Checking badges from BE on navigation to:', pathname);
                const response = await get('games/api/talents/me/', false, headers);
                
                const serverData = response
                    ? [...(response.unlocked || []), ...(response.locked || [])]
                    : [];

                // Load baseline mock badges
                let localBaseline = INITIAL_MOCK_BADGES;
                const saved = localStorage.getItem(MOCK_BADGES_KEY);
                if (saved) {
                    try {
                        localBaseline = JSON.parse(saved);
                    } catch (e) {
                        console.error('[BadgeNavigationListener] Failed to parse mock badges', e);
                    }
                }

                badgesToProcess = mergeBadgesWithServerData(serverData, localBaseline);
            } catch (err) {
                console.warn('[BadgeNavigationListener] Failed to fetch badges from backend, using local cache:', err);
                
                // Fallback to local cache
                const saved = localStorage.getItem(MOCK_BADGES_KEY);
                if (saved) {
                    try {
                        badgesToProcess = JSON.parse(saved);
                    } catch (e) {
                        console.error('[BadgeNavigationListener] Failed to parse mock badges on fallback', e);
                        badgesToProcess = INITIAL_MOCK_BADGES;
                    }
                } else {
                    badgesToProcess = INITIAL_MOCK_BADGES;
                }
            }

            const currentUnlockedIds = badgesToProcess
                .filter(b => b.earned)
                .map(b => b.id);

            const storedTracker = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!storedTracker) {
                // First-time load: seed tracker so we don't display toasts for old badges
                console.log('[BadgeNavigationListener] Seeding tracker:', currentUnlockedIds);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUnlockedIds));
                return;
            }

            const previousUnlockedIds: string[] = JSON.parse(storedTracker);

            // Handle badge reset (simulation reset on badges page)
            if (currentUnlockedIds.length < previousUnlockedIds.length) {
                console.log('[BadgeNavigationListener] Unlocked badges reset or reduced. Updating tracker.');
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUnlockedIds));
                return;
            }

            const newlyUnlockedIds = currentUnlockedIds.filter(id => !previousUnlockedIds.includes(id));

            if (newlyUnlockedIds.length > 0) {
                console.log('[BadgeNavigationListener] Newly unlocked badges detected:', newlyUnlockedIds);
                
                newlyUnlockedIds.forEach(id => {
                    const badge = badgesToProcess.find(b => b.id === id);
                    if (badge) {
                        showBadgeUnlockToast(badge, router);
                    }
                });

                // Update localStorage to track current list of unlocked badges
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentUnlockedIds));
            }
        };

        checkBadges();
    }, [pathname, userToken, isLoading, router]);

    return null;
}
