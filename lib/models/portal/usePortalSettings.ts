'use client';

/**
 * When consumer email arrives (SKI-267, SKI-272): `GET/PATCH
 * /api/portal/profile/settings/`.
 *
 * `timezone` is an IANA name, blank until the browser has reported one
 * (`TimezoneSync`); `timezoneSource` says whether it was detected or chosen.
 * A zone chosen here is never replaced by a detected one. `dailySendHour` is
 * the local hour (0-23) for the daily game and profile tips; `digestWeekday`
 * the weekly summary's day, 0 = Monday.
 *
 * Saving is optimistic: the control moves at once, and moves back with an
 * error if the save fails.
 */
import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { portalFetch } from './portalFetch';

export interface PortalSettings {
  timezone: string;
  timezoneSource: 'auto' | 'user';
  dailySendHour: number;
  digestWeekday: number;
}

type Patch = Partial<Pick<PortalSettings, 'timezone' | 'timezoneSource' | 'dailySendHour' | 'digestWeekday'>>;

export function usePortalSettings() {
  const { userToken } = useUserSession();
  const [data, setData] = useState<PortalSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userToken) return;
    let cancelled = false;
    portalFetch<PortalSettings>('/profile/settings/', userToken)
      .then((json) => !cancelled && setData(json))
      .catch(() => !cancelled && setError("We couldn't load your email times."));
    return () => {
      cancelled = true;
    };
  }, [userToken]);

  const update = useCallback(
    async (patch: Patch) => {
      if (!userToken || !data) return;
      const previous = data;
      setData({ ...data, ...patch });
      setSaving(true);
      setError(null);
      try {
        setData(await portalFetch<PortalSettings>('/profile/settings/', userToken, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }));
      } catch {
        setData(previous);
        setError("That didn't save. Try again in a moment.");
      } finally {
        setSaving(false);
      }
    },
    [userToken, data],
  );

  return { data, error, saving, update };
}
