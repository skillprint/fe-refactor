'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createWelcomeNotification,
  evaluatePlatformNotifications,
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

/* ── Local Inbox ────────────────────────────────────────────────────────
 * The inbox lives in this browser's localStorage. It used to be mirrored to
 * an in-memory store behind a Next.js API route, which the static build
 * can't have; a backend inbox is future work. */

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

/* ── Notification Operations ───────────────────────────────────────────── */

/**
 * Evaluates the platform data (milestones, badges, assignments, deadlines,
 * skill trends, streaks, account prompts) and adds each notification whose
 * deterministic id this browser hasn't emitted before. Returns the new ones.
 */
export function syncPlatformNotifications(payload: PlatformSyncPayload): PortalNotification[] {
  if (typeof window === 'undefined') return [];
  const seen = readSeenNotificationIds();
  const current = readStoredNotifications();
  const added = evaluatePlatformNotifications(payload).filter(
    (item) => !seen.has(item.id) && !current.some((existing) => existing.id === item.id),
  );
  if (added.length > 0) {
    // Each one goes on top in turn, so the last evaluated ends up first.
    writeStoredNotifications([...added].reverse().concat(current), added.map((item) => item.id));
  }
  return added;
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

  return nextItem;
}

/**
 * Emits a notification from an automatic data source only if its deterministic
 * `id` has never been emitted before in this browser.
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

  return true;
}

export function pushWelcomeNotification(): PortalNotification {
  const current = readStoredNotifications();
  const hasDefaultId = current.some((item) => item.id === 'welcome-to-skillprint');
  const id = hasDefaultId ? `welcome-${Date.now()}` : 'welcome-to-skillprint';
  const welcome = createWelcomeNotification(id);
  recordSeenNotificationIds([welcome.id]);
  writeStoredNotifications([welcome, ...current]);

  return welcome;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setNotifications(readStoredNotifications());
    setHydrated(true);

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

    return created;
  }, []);

  const markAsRead = useCallback((id: string) => {
    const current = readStoredNotifications();
    const updated = current.map((item) => (item.id === id ? { ...item, read: true } : item));
    writeStoredNotifications(updated);
  }, []);

  const markAllAsRead = useCallback(() => {
    const current = readStoredNotifications();
    const updated = current.map((item) => (item.read ? item : { ...item, read: true }));
    writeStoredNotifications(updated);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    const current = readStoredNotifications();
    const updated = current.filter((item) => item.id !== id);
    writeStoredNotifications(updated);
  }, []);

  const clearAll = useCallback(() => {
    writeStoredNotifications([]);
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
