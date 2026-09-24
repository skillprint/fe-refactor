'use client';

/**
 * The player's email preferences (SKI-234).
 *
 * `GET/PATCH /api/portal/profile/notifications/` lists only the categories
 * that can reach this player — the weekly summary for everyone; assignment
 * and reminder email for players whose school uses coaching — so the settings
 * screen never shows a switch that does nothing.
 *
 * Toggling is optimistic: the switch moves at once, and moves back with an
 * error if the save fails, rather than pretending it worked.
 */
import { useCallback, useEffect, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { portalFetch } from './portalFetch';

export interface NotificationCategory {
  category: 'assignment' | 'reminder' | 'digest';
  label: string;
  description: string;
  enabled: boolean;
}

interface Response {
  categories: NotificationCategory[];
}

export function useNotificationPreferences() {
  const { userToken } = useUserSession();
  const [data, setData] = useState<NotificationCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!userToken) return;
    let cancelled = false;
    portalFetch<Response>('/profile/notifications/', userToken)
      .then((json) => !cancelled && setData(json.categories))
      .catch(() => !cancelled && setError("We couldn't load your email settings."));
    return () => {
      cancelled = true;
    };
  }, [userToken]);

  const setEnabled = useCallback(
    async (category: NotificationCategory['category'], enabled: boolean) => {
      if (!userToken || !data) return;
      const previous = data;
      setData(data.map((row) => (row.category === category ? { ...row, enabled } : row)));
      setSaving(category);
      setError(null);
      try {
        const json = await portalFetch<Response>('/profile/notifications/', userToken, {
          method: 'PATCH',
          body: JSON.stringify({ [category]: enabled }),
        });
        setData(json.categories);
      } catch {
        setData(previous);
        setError("That didn't save. Try again in a moment.");
      } finally {
        setSaving(null);
      }
    },
    [userToken, data],
  );

  return { data, error, saving, setEnabled };
}
