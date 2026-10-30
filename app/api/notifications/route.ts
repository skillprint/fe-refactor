import { NextRequest, NextResponse } from 'next/server';
import { PORTAL_BASE_URL } from '@/lib/models/portal/portalFetch';
import {
  createWelcomeNotification,
  evaluatePlatformNotifications,
  NewNotificationInput,
  NotificationKind,
  PLATFORM_NOTIFICATION_PRESETS,
  PlatformSyncPayload,
  PortalNotification,
} from '@/lib/notificationsCore';

interface ServerNotificationInbox {
  notifications: PortalNotification[];
  seenIds: Set<string>;
  lastUpstreamSyncAt: number;
}

const globalForNotifications = globalThis as unknown as {
  __skillprintNotificationStore?: Map<string, ServerNotificationInbox>;
};

function getNotificationStore(): Map<string, ServerNotificationInbox> {
  if (!globalForNotifications.__skillprintNotificationStore) {
    globalForNotifications.__skillprintNotificationStore = new Map();
  }
  return globalForNotifications.__skillprintNotificationStore;
}

function resolveUserKey(request: NextRequest, bodyUserId?: string): string {
  const { searchParams } = new URL(request.url);
  const queryUserId = searchParams.get('userId');
  if (bodyUserId && String(bodyUserId).trim()) return String(bodyUserId).trim();
  if (queryUserId && queryUserId.trim()) return queryUserId.trim();
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Token\s+/i, '').trim();
  if (token) return `token:${token.slice(0, 16)}`;
  return 'default';
}

function extractBearerToken(request: NextRequest, bodyToken?: string | null): string | null {
  if (bodyToken && String(bodyToken).trim()) return String(bodyToken).trim();
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Token\s+/i, '').trim();
  return token || null;
}

function getOrCreateInbox(userKey: string): ServerNotificationInbox {
  const store = getNotificationStore();
  let inbox = store.get(userKey);
  if (!inbox) {
    const welcome = createWelcomeNotification();
    inbox = {
      notifications: [welcome],
      seenIds: new Set([welcome.id]),
      lastUpstreamSyncAt: 0,
    };
    store.set(userKey, inbox);
  }
  return inbox;
}

function addNotificationToInbox(
  inbox: ServerNotificationInbox,
  input: NewNotificationInput,
  once = false,
): { added: boolean; item: PortalNotification } {
  const id = input.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (once) {
    if (inbox.seenIds.has(id) || inbox.notifications.some((n) => n.id === id)) {
      const existing = inbox.notifications.find((n) => n.id === id) || {
        id,
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
      return { added: false, item: existing };
    }
  }

  const nextItem: PortalNotification = {
    id,
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

  inbox.seenIds.add(nextItem.id);
  inbox.notifications = [
    nextItem,
    ...inbox.notifications.filter((item) => item.id !== nextItem.id),
  ];
  return { added: true, item: nextItem };
}

async function fetchUpstreamJson<T>(path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${PORTAL_BASE_URL}${path}`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function syncFromUpstreamPortal(
  inbox: ServerNotificationInbox,
  token: string | null,
  force = false,
): Promise<void> {
  if (!token) return;
  const now = Date.now();
  if (!force && now - inbox.lastUpstreamSyncAt < 15_000) return;
  inbox.lastUpstreamSyncAt = now;

  const [homeSummary, badgesRes, playbooksRes, insights, trends, emailState] = await Promise.all([
    fetchUpstreamJson<any>('/home/summary/', token),
    fetchUpstreamJson<{ badges?: any[] }>('/profile/badges/', token),
    fetchUpstreamJson<{ playbooks?: any[] }>('/playbooks/', token),
    fetchUpstreamJson<any[]>('/insights/', token),
    fetchUpstreamJson<any>('/profile/trends/?period=weekly&points=12', token),
    fetchUpstreamJson<any>('/profile/email/', token),
  ]);

  const assignedPlaybooks = Array.isArray(playbooksRes?.playbooks)
    ? playbooksRes!.playbooks.filter((row) => row?.source === 'assigned' && !row?.dismissedAt)
    : null;

  const evaluated = evaluatePlatformNotifications({
    homeSummary,
    badges: badgesRes?.badges ?? null,
    assignedPlaybooks,
    insights,
    trends,
    emailState,
  });

  for (const item of evaluated) {
    addNotificationToInbox(inbox, item, true);
  }
}

function formatInboxResponse(inbox: ServerNotificationInbox, extra: Record<string, unknown> = {}) {
  const unreadCount = inbox.notifications.filter((item) => !item.read).length;
  return {
    ok: true,
    notifications: inbox.notifications,
    unreadCount,
    totalCount: inbox.notifications.length,
    seenIds: [...inbox.seenIds],
    ...extra,
  };
}

export async function GET(request: NextRequest) {
  try {
    const userKey = resolveUserKey(request);
    const token = extractBearerToken(request);
    const inbox = getOrCreateInbox(userKey);
    const { searchParams } = new URL(request.url);

    if (token && searchParams.get('sync') !== '0') {
      await syncFromUpstreamPortal(inbox, token, searchParams.get('force') === '1');
    }

    return NextResponse.json(formatInboxResponse(inbox));
  } catch (error: any) {
    console.error('[api/notifications] GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load notifications' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userKey = resolveUserKey(request, body?.userId);
    const token = extractBearerToken(request, body?.userToken);
    const inbox = getOrCreateInbox(userKey);
    const action = body?.action || 'create';

    if (action === 'welcome') {
      const hasDefaultId = inbox.notifications.some((item) => item.id === 'welcome-to-skillprint');
      const id = hasDefaultId ? `welcome-${Date.now()}` : 'welcome-to-skillprint';
      const welcome = createWelcomeNotification(id);
      const { item } = addNotificationToInbox(inbox, welcome, false);
      return NextResponse.json(formatInboxResponse(inbox, { notification: item }), { status: 201 });
    }

    if (action === 'preset') {
      const kind = body?.kind as NotificationKind | undefined;
      const preset =
        PLATFORM_NOTIFICATION_PRESETS.find((p) => p.key === kind) ||
        PLATFORM_NOTIFICATION_PRESETS[0];
      const { item } = addNotificationToInbox(inbox, preset.create(), false);
      return NextResponse.json(formatInboxResponse(inbox, { notification: item }), { status: 201 });
    }

    if (action === 'all_presets') {
      const created: PortalNotification[] = [];
      for (const preset of [...PLATFORM_NOTIFICATION_PRESETS].reverse()) {
        const { item } = addNotificationToInbox(inbox, preset.create(), false);
        created.unshift(item);
      }
      return NextResponse.json(formatInboxResponse(inbox, { created }), { status: 201 });
    }

    if (action === 'sync') {
      const syncPayload = (body?.payload || {}) as PlatformSyncPayload;
      const evaluated = evaluatePlatformNotifications(syncPayload);
      const added: PortalNotification[] = [];
      for (const candidate of evaluated) {
        const res = addNotificationToInbox(inbox, candidate, true);
        if (res.added) added.push(res.item);
      }
      if (token && body?.syncUpstream) {
        await syncFromUpstreamPortal(inbox, token, false);
      }
      return NextResponse.json(formatInboxResponse(inbox, { added }));
    }

    if (action === 'create') {
      const input = (body?.notification || body) as NewNotificationInput | undefined;
      if (!input || !input.title || !input.message) {
        return NextResponse.json(
          { error: 'Notification title and message are required' },
          { status: 400 },
        );
      }
      const once = Boolean(body?.once);
      const { added, item } = addNotificationToInbox(inbox, input, once);
      return NextResponse.json(
        formatInboxResponse(inbox, { added, notification: item }),
        { status: added ? 201 : 200 },
      );
    }

    return NextResponse.json({ error: `Unsupported action: ${String(action)}` }, { status: 400 });
  } catch (error: any) {
    console.error('[api/notifications] POST error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create notification' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userKey = resolveUserKey(request, body?.userId);
    const inbox = getOrCreateInbox(userKey);
    const action = body?.action || 'mark_read';

    if (action === 'mark_all_read') {
      inbox.notifications = inbox.notifications.map((item) =>
        item.read ? item : { ...item, read: true },
      );
      return NextResponse.json(formatInboxResponse(inbox));
    }

    if (action === 'mark_read') {
      const id = String(body?.id || '');
      if (!id) {
        return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
      }
      inbox.notifications = inbox.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      );
      return NextResponse.json(formatInboxResponse(inbox));
    }

    return NextResponse.json({ error: `Unsupported action: ${String(action)}` }, { status: 400 });
  } catch (error: any) {
    console.error('[api/notifications] PATCH error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update notification' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userKey = resolveUserKey(request);
    const inbox = getOrCreateInbox(userKey);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('all') === 'true' || searchParams.get('all') === '1';

    if (clearAll) {
      inbox.notifications = [];
      return NextResponse.json(formatInboxResponse(inbox));
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Provide either id or all=true query parameter' },
        { status: 400 },
      );
    }

    inbox.notifications = inbox.notifications.filter((item) => item.id !== id);
    return NextResponse.json(formatInboxResponse(inbox));
  } catch (error: any) {
    console.error('[api/notifications] DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete notification' },
      { status: 500 },
    );
  }
}
