import { useEffect, useState } from 'react';
import { gameParameterManifestUrl } from '@/lib/localGames';

/**
 * Whether the game at this page ships a parameter manifest beside it, i.e. the
 * backend tunes it during play. False until the check answers, and for a game
 * without one (the CDN refuses the request).
 */
export function useHasParameterManifest(gamePageUrl: string | null): boolean {
    const [hasManifest, setHasManifest] = useState(false);
    useEffect(() => {
        setHasManifest(false);
        if (!gamePageUrl) return;
        let cancelled = false;
        fetch(gameParameterManifestUrl(gamePageUrl), { method: 'HEAD' })
            .then((res) => { if (!cancelled) setHasManifest(res.ok); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [gamePageUrl]);
    return hasManifest;
}
