'use client';

/**
 * Records the player's timezone from the browser (SKI-267), so email the
 * backend schedules "at 5pm" or "on Monday" arrives on the player's clock,
 * not the server's.
 *
 * Once per browser session per player: read `/profile/settings/`, and if the
 * zone on record differs from the browser's, send it with
 * `timezoneSource: "auto"`. A zone the player chose by hand is left alone;
 * the backend enforces that too. Failures are silent and retried on the next
 * page load: nothing on screen depends on this.
 */
import { Suspense, useEffect } from 'react';
import { useUserSession } from '../hooks/useUserSession';
import { portalFetch } from '../../lib/models/portal/portalFetch';

interface ZoneSettings {
  timezone: string;
  timezoneSource: 'auto' | 'user';
}

function browserZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function TimezoneSyncInner() {
  const { userId, userToken } = useUserSession();

  useEffect(() => {
    const zone = browserZone();
    if (!userId || !userToken || !zone) return;
    const key = `tz_synced:${userId}`;
    try {
      if (sessionStorage.getItem(key) === zone) return;
    } catch {
      // No sessionStorage: check every load, which is still cheap.
    }
    let cancelled = false;
    (async () => {
      try {
        const current = await portalFetch<ZoneSettings>('/profile/settings/', userToken);
        if (cancelled) return;
        const chosen = current.timezoneSource === 'user' && !!current.timezone;
        if (!chosen && current.timezone !== zone) {
          await portalFetch('/profile/settings/', userToken, {
            method: 'PATCH',
            body: JSON.stringify({ timezone: zone, timezoneSource: 'auto' }),
          });
        }
        try {
          sessionStorage.setItem(key, zone);
        } catch {
          // Fine: we'll check again next load.
        }
      } catch {
        // Try again on the next page load.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, userToken]);

  return null;
}

export default function TimezoneSync() {
  // useUserSession reads the URL, which a static page may only do inside Suspense.
  return (
    <Suspense fallback={null}>
      <TimezoneSyncInner />
    </Suspense>
  );
}
