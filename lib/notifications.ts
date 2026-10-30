'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCookie } from '@/app/utils/cookieUtils';
import {
  createWelcomeNotification,
  formatNotificationBadgeCount,
  formatNotificationsAriaLabel,
  NewNotificationInput,
  NotificationKind,
  PLATFORM_NOTIFICATION_PRESETS,
  PlatformSyncPayload,
  PortalNotification,
} from './notificationsCore';

export * from './notificationsCore';

export const STORAGE_NOTIFICATIONS_FEATURE_ENABLED = 'skillprint_notifications_widget_enabled';
export const EVENT_NOTIFICATIONS_FEATURE_CHANGED = 'skillprint-notifications-feature-change';

export const NOTIFICATIONS_STORAGE_KEY = 'skillprint_portal_notifications_v1';
export const NOTIFICATIONS_SEEN_IDS_KEY = 'skillprint_portal_notifications_seen_ids_v1';
export const NOTIFICATIONS_CHANGE_EVENT = 'skillprint:notifications-changed';
export const NOTIFICATIONS_ADD_EVENT = 'skillprint:add-notification';

/* ── Feature Flag Hook ─────────────────────────────────────────────────── */

export function readNotificationsFeatureEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_NOTIFICATIONS_FEATURE_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function useNotificationsFeatureFlag() {
  // Defaulted to OFF (false) until toggled on in Settings
  const [notificationsFeatureEnabled, setNotificationsFeatureEnabledState] =
    useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setNotificationsFeatureEnabledState(readNotificationsFeatureEnabled());

    const handleSync = () => {
      setNotificationsFeatureEnabledState(readNotificationsFeatureEnabled());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener(EVENT_NOTIFICATIONS_FEATURE_CHANGED, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(EVENT_NOTIFICATIONS_FEATURE_CHANGED, handleSync);
    };
  }, []);

  const setNotificationsFeatureEnabled = useCallback((enabled: boolean) => {
    setNotificationsFeatureEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_NOTIFICATIONS_FEATURE_ENABLED, String(enabled));
        window.dispatchEvent(
          new CustomEvent(EVENT_NOTIFICATIONS_FEATURE_CHANGED, { detail: enabled }),
        );
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  return { notificationsFeatureEnabled, setNotificationsFeatureEnabled };
}

/* ── Client Identity & Local Cache Helpers ─────────────────────────────── */

function getClientAuthContext(): { userId: string; userToken: string | null } {
  if (typeof window === 'undefined') {
    return { userId: 'default', userToken: null };
  }
  const userId =
    window.localStorage.getItem('user_id') || getCookie('user_id') || 'default';
  const userToken =
    window.localStorage.getItem('user_token') || getCookie('user_token') || null;
  return { userId, userToken };
}

function buildAuthHeaders(userToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userToken) {
    headers['Authorization'] = `Token ${userToken}`;
  }
  return headers;
}

export function readSeenNotificationIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_SEEN_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.map(String));
  } catch {
    // ignore
  }
  return new Set();
}

export function recordSeenNotificationIds(ids: string[]): void {
  if (typeof window === 'undefined' || ids.length === 0) return;
  try {
    const seen = readSeenNotificationIds();
    ids.forEach((id) => seen.add(id));
    window.localStorage.setItem(NOTIFICATIONS_SEEN_IDS_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore
  }
}

export function readStoredNotifications(): PortalNotification[] {
  if (typeof window === 'undefined') {
    return [createWelcomeNotification()];
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw === null) {
      const seed = [createWelcomeNotification()];
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(seed));
      recordSeenNotificationIds([seed[0].id]);
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to default welcome notification if storage is unavailable
  }
  return [createWelcomeNotification()];
}

export function writeStoredNotifications(
  items: PortalNotification[],
  seenIds?: string[],
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    if (Array.isArray(seenIds) && seenIds.length > 0) {
      recordSeenNotificationIds(seenIds);
    }
  } catch {
    // Ignore storage quota errors
  }
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGE_EVENT, { detail: items }));
}

function applyBackendInboxResponse(data: any): PortalNotification[] | null {
  if (data && Array.isArray(data.notifications)) {
    writeStoredNotifications(data.notifications, data.seenIds);
    return data.notifications as PortalNotification[];
  }
  return null;
}

/* ── Backend-Backed Notification Operations ────────────────────────────── */

export async function fetchBackendNotifications(forceUpstream = false): Promise<PortalNotification[]> {
  if (typeof window === 'undefined') return readStoredNotifications();
  const { userId, userToken } = getClientAuthContext();
  try {
    const qs = new URLSearchParams({ userId });
    if (forceUpstream) qs.set('force', '1');
    const res = await fetch(`/api/notifications?${qs.toString()}`, {
      headers: buildAuthHeaders(userToken),
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      const synced = applyBackendInboxResponse(json);
      if (synced) return synced;
    }
  } catch {
    // Fall back to local cache when offline
  }
  return readStoredNotifications();
}

export async function syncPlatformNotificationsToBackend(
  payload: PlatformSyncPayload,
): Promise<PortalNotification[]> {
  if (typeof window === 'undefined') return [];
  const { userId, userToken } = getClientAuthContext();
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: buildAuthHeaders(userToken),
      body: JSON.stringify({
        action: 'sync',
        userId,
        userToken,
        payload,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      const synced = applyBackendInboxResponse(json);
      if (synced) return synced;
    }
  } catch {
    // ignore network failure
  }
  return readStoredNotifications();
}

export function pushPortalNotification(input: NewNotificationInput): PortalNotification {
  const current = readStoredNotifications();
  const nextItem: PortalNotification = {
    id: input.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    tone: input.tone || 'info',
    createdAt: input.createdAt || new Date().toISOString(),
    read: input.read ?? false,
    actionLabel: input.actionLabel,
    actionHref: input.actionHref,
    kind: input.kind || 'custom',
    categoryLabel: input.categoryLabel,
    icon: input.icon,
  };
  recordSeenNotificationIds([nextItem.id]);
  const updated = [nextItem, ...current.filter((item) => item.id !== nextItem.id)];
  writeStoredNotifications(updated);

  if (typeof window !== 'undefined') {
    const { userId, userToken } = getClientAuthContext();
    fetch('/api/notifications', {
      method: 'POST',
      headers: buildAuthHeaders(userToken),
      body: JSON.stringify({
        action: 'create',
        userId,
        notification: nextItem,
        once: false,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => applyBackendInboxResponse(json))
      .catch(() => {});
  }

  return nextItem;
}

/**
 * Emits a notification from an automatic data source only if its deterministic
 * `id` has never been emitted before, persisting to the backend `/api/notifications`.
 */
export function pushPortalNotificationOnce(item: PortalNotification): boolean {
  if (typeof window === 'undefined') return false;
  const seen = readSeenNotificationIds();
  const current = readStoredNotifications();
  if (seen.has(item.id) || current.some((existing) => existing.id === item.id)) {
    return false;
  }
  recordSeenNotificationIds([item.id]);
  writeStoredNotifications([item, ...current]);

  const { userId, userToken } = getClientAuthContext();
  fetch('/api/notifications', {
    method: 'POST',
    headers: buildAuthHeaders(userToken),
    body: JSON.stringify({
      action: 'create',
      userId,
      notification: item,
      once: true,
    }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((json) => applyBackendInboxResponse(json))
    .catch(() => {});

  return true;
}

export function pushWelcomeNotification(): PortalNotification {
  const current = readStoredNotifications();
  const hasDefaultId = current.some((item) => item.id === 'welcome-to-skillprint');
  const id = hasDefaultId ? `welcome-${Date.now()}` : 'welcome-to-skillprint';
  const welcome = createWelcomeNotification(id);
  recordSeenNotificationIds([welcome.id]);
  writeStoredNotifications([welcome, ...current]);

  if (typeof window !== 'undefined') {
    const { userId, userToken } = getClientAuthContext();
    fetch('/api/notifications', {
      method: 'POST',
      headers: buildAuthHeaders(userToken),
      body: JSON.stringify({
        action: 'create',
        userId,
        notification: welcome,
        once: false,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => applyBackendInboxResponse(json))
      .catch(() => {});
  }

  return welcome;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotifications(readStoredNotifications());
    setHydrated(true);

    // Hydrate from backend inbox
    fetchBackendNotifications().then((serverItems) => {
      setNotifications(serverItems);
    });

    const handleSync = () => {
      setNotifications(readStoredNotifications());
    };

    const handleExternalAdd = (event: Event) => {
      const custom = event as CustomEvent<NewNotificationInput | undefined>;
      if (custom.detail && custom.detail.title && custom.detail.message) {
        pushPortalNotification(custom.detail);
      } else {
        pushWelcomeNotification();
      }
    };

    window.addEventListener(NOTIFICATIONS_CHANGE_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener(NOTIFICATIONS_ADD_EVENT, handleExternalAdd);

    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGE_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(NOTIFICATIONS_ADD_EVENT, handleExternalAdd);
    };
  }, []);

  const addNotification = useCallback((input: NewNotificationInput) => {
    return pushPortalNotification(input);
  }, []);

  const addWelcomeNotification = useCallback(() => {
    return pushWelcomeNotification();
  }, []);

  const addPresetNotification = useCallback((kind: NotificationKind) => {
    const preset = PLATFORM_NOTIFICATION_PRESETS.find((p) => p.key === kind);
    if (!preset) return pushWelcomeNotification();
    return pushPortalNotification(preset.create());
  }, []);

  const addAllPresetNotifications = useCallback(() => {
    const current = readStoredNotifications();
    const created = PLATFORM_NOTIFICATION_PRESETS.map((p) => p.create());
    recordSeenNotificationIds(created.map((item) => item.id));
    writeStoredNotifications([...created, ...current]);

    if (typeof window !== 'undefined') {
      const { userId, userToken } = getClientAuthContext();
      Promise.all(
        [...created].reverse().map((notification) =>
          fetch('/api/notifications', {
            method: 'POST',
            headers: buildAuthHeaders(userToken),
            body: JSON.stringify({
              action: 'create',
              userId,
              notification,
              once: false,
            }),
          }),
        ),
      )
        .then(() => fetchBackendNotifications())
        .catch(() => {});
    }

    return created;
  }, []);

  const markAsRead = useCallback((id: string) => {
    const current = readStoredNotifications();
    const updated = current.map((item) => (item.id === id ? { ...item, read: true } : item));
    writeStoredNotifications(updated);

    if (typeof window !== 'undefined') {
      const { userId, userToken } = getClientAuthContext();
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: buildAuthHeaders(userToken),
        body: JSON.stringify({ action: 'mark_read', userId, id }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => applyBackendInboxResponse(json))
        .catch(() => {});
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    const current = readStoredNotifications();
    const updated = current.map((item) => (item.read ? item : { ...item, read: true }));
    writeStoredNotifications(updated);

    if (typeof window !== 'undefined') {
      const { userId, userToken } = getClientAuthContext();
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: buildAuthHeaders(userToken),
        body: JSON.stringify({ action: 'mark_all_read', userId }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => applyBackendInboxResponse(json))
        .catch(() => {});
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    const current = readStoredNotifications();
    const updated = current.filter((item) => item.id !== id);
    writeStoredNotifications(updated);

    if (typeof window !== 'undefined') {
      const { userId, userToken } = getClientAuthContext();
      const qs = new URLSearchParams({ userId, id });
      fetch(`/api/notifications?${qs.toString()}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(userToken),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => applyBackendInboxResponse(json))
        .catch(() => {});
    }
  }, []);

  const clearAll = useCallback(() => {
    writeStoredNotifications([]);

    if (typeof window !== 'undefined') {
      const { userId, userToken } = getClientAuthContext();
      const qs = new URLSearchParams({ userId, all: 'true' });
      fetch(`/api/notifications?${qs.toString()}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(userToken),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => applyBackendInboxResponse(json))
        .catch(() => {});
    }
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const totalCount = notifications.length;
  const badgeLabel = formatNotificationBadgeCount(unreadCount);
  const ariaLabel = formatNotificationsAriaLabel(unreadCount, 'Notifications');

  return {
    notifications,
    hydrated,
    unreadCount,
    totalCount,
    badgeLabel,
    ariaLabel,
    addNotification,
    addWelcomeNotification,
    addPresetNotification,
    addAllPresetNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  };
}
