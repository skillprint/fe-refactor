'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUserSession } from '../../../app/hooks/useUserSession';
import { pushPortalNotification } from '../../notifications';
import { portalFetch } from './portalFetch';
import {
  DEFAULT_OVERRIDE_MAP,
  DEFAULT_PRIVACY_GROUPS,
  FriendCardSummary,
  FriendPrivacyOverrideEntry,
  FriendRequestItem,
  GatedFriendProfile,
  PRIVACY_GROUPING_KEYS,
  PrivacyDataGroupingKey,
  PrivacyGroupScopes,
  PrivacyOverrideMap,
  PrivacyOverrideScope,
  PrivacyScope,
  RelationshipStatus,
  SEEDED_PLAYERS,
  SeedPlayerRecord,
  buildGatedProfileFromSeed,
  evaluateEffectivePrivacy,
} from './FriendsAndPrivacy';

export const FRIENDS_PRIVACY_STORAGE_KEY = 'skillprint:friends-privacy:v1';
export const FRIENDS_PRIVACY_EVENT = 'skillprint:friends-privacy-changed';

export const STORAGE_FRIENDS_FEATURE_ENABLED = 'skillprint_friends_feature_enabled';
export const EVENT_FRIENDS_FEATURE_CHANGED = 'skillprint-friends-feature-change';

export function readFriendsFeatureEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_FRIENDS_FEATURE_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function useFriendsFeatureFlag() {
  // Defaulted to OFF (false) until toggled on in Settings
  const [friendsFeatureEnabled, setFriendsFeatureEnabledState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setFriendsFeatureEnabledState(readFriendsFeatureEnabled());

    const handleSync = () => {
      setFriendsFeatureEnabledState(readFriendsFeatureEnabled());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener(EVENT_FRIENDS_FEATURE_CHANGED, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(EVENT_FRIENDS_FEATURE_CHANGED, handleSync);
    };
  }, []);

  const setFriendsFeatureEnabled = useCallback((enabled: boolean) => {
    setFriendsFeatureEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_FRIENDS_FEATURE_ENABLED, String(enabled));
        window.dispatchEvent(new CustomEvent(EVENT_FRIENDS_FEATURE_CHANGED, { detail: enabled }));
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  return { friendsFeatureEnabled, setFriendsFeatureEnabled };
}

export interface StoredFriendsPrivacyState {
  friendCode: string;
  allowFriendRequests: boolean;
  groups: PrivacyGroupScopes;
  /** Per-friend overrides set by the current user (`friendId -> PrivacyOverrideMap`). */
  friendOverrides: Record<string, PrivacyOverrideMap>;
  /** Relationship state per playerId (`userId -> RelationshipStatus`). */
  relationships: Record<string, RelationshipStatus>;
  /** Optional request notes per playerId. */
  requestNotes: Record<string, string>;
}

function defaultStoredState(): StoredFriendsPrivacyState {
  const relationships: Record<string, RelationshipStatus> = {};
  const requestNotes: Record<string, string> = {};
  for (const p of SEEDED_PLAYERS) {
    relationships[p.userId] = p.initialRelationship;
    if (p.initialRequestNote) {
      requestNotes[p.userId] = p.initialRequestNote;
    }
  }
  return {
    friendCode: 'SP-7F3A-9C2E',
    allowFriendRequests: true,
    groups: { ...DEFAULT_PRIVACY_GROUPS },
    friendOverrides: {},
    relationships,
    requestNotes,
  };
}

export function readStoredFriendsPrivacy(): StoredFriendsPrivacyState {
  if (typeof window === 'undefined') {
    return defaultStoredState();
  }
  try {
    const raw = window.localStorage.getItem(FRIENDS_PRIVACY_STORAGE_KEY);
    if (!raw) {
      const seed = defaultStoredState();
      window.localStorage.setItem(FRIENDS_PRIVACY_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    const defaults = defaultStoredState();
    return {
      friendCode: parsed.friendCode || defaults.friendCode,
      allowFriendRequests:
        typeof parsed.allowFriendRequests === 'boolean'
          ? parsed.allowFriendRequests
          : defaults.allowFriendRequests,
      groups: { ...defaults.groups, ...(parsed.groups || {}) },
      friendOverrides: parsed.friendOverrides || {},
      relationships: { ...defaults.relationships, ...(parsed.relationships || {}) },
      requestNotes: { ...defaults.requestNotes, ...(parsed.requestNotes || {}) },
    };
  } catch {
    return defaultStoredState();
  }
}

export function writeStoredFriendsPrivacy(next: StoredFriendsPrivacyState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FRIENDS_PRIVACY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(new CustomEvent(FRIENDS_PRIVACY_EVENT, { detail: next }));
}

function seedToFriendCard(
  record: SeedPlayerRecord,
  rel: RelationshipStatus,
  viewerOverrides?: PrivacyOverrideMap,
): FriendCardSummary {
  const { visibleGroups } = evaluateEffectivePrivacy(
    record.defaultGroups,
    rel,
    record.overridesForViewer,
  );
  const topCog = record.cognition[0]
    ? {
        slug: record.cognition[0].slug,
        name: record.cognition[0].slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        score: record.cognition[0].score,
      }
    : null;
  const topMood = record.mood[0]
    ? {
        slug: record.mood[0].slug,
        name: record.mood[0].slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        score: record.mood[0].score,
      }
    : null;

  return {
    userId: record.userId,
    displayName: record.displayName,
    friendCode: record.friendCode,
    avatarColor: record.avatarColor,
    isAiPersona: record.isAiPersona,
    personaRole: record.personaRole,
    joinedAt: record.joinedAt,
    relationship: rel,
    friendshipId: `fs-${record.userId}`,
    connectedAt: record.joinedAt,
    visibleGroups,
    viewerOverridesForFriend: viewerOverrides || { ...DEFAULT_OVERRIDE_MAP },
    customGrantNote: record.customGrantNote,
    activitySummary: visibleGroups.activitySummary ? record.activitySummary : null,
    topCognitionSkill: visibleGroups.cognitionPersonality ? topCog : null,
    topMood: visibleGroups.moodSignals ? topMood : null,
    topGameScores: visibleGroups.gameStats
      ? record.games
          .filter((g) => typeof g.bestScore === 'number')
          .map((g) => ({
            gameSlug: g.gameSlug,
            gameName: g.gameName,
            bestScore: g.bestScore as number,
          }))
      : [],
  };
}

export function useFriendsAndPrivacy() {
  const { userToken } = useUserSession();
  const [stored, setStored] = useState<StoredFriendsPrivacyState>(() => defaultStoredState());
  const [hydrated, setHydrated] = useState(false);
  const [isUsingMockFallback, setIsUsingMockFallback] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backendFriends, setBackendFriends] = useState<FriendCardSummary[]>([]);

  useEffect(() => {
    setStored(readStoredFriendsPrivacy());
    setHydrated(true);

    const handleSync = () => {
      setStored(readStoredFriendsPrivacy());
    };
    window.addEventListener(FRIENDS_PRIVACY_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(FRIENDS_PRIVACY_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Sync with backend `/api/portal/profile/privacy/` and `/api/portal/friends/` when authenticated
  useEffect(() => {
    if (!userToken) return;
    let cancelled = false;

    Promise.all([
      portalFetch<any>('/profile/privacy/', userToken),
      portalFetch<any>('/friends/', userToken),
    ])
      .then(([privacyRes, friendsRes]) => {
        if (cancelled) return;
        setIsUsingMockFallback(false);
        const current = readStoredFriendsPrivacy();
        const next: StoredFriendsPrivacyState = {
          ...current,
          friendCode: privacyRes.friendCode || current.friendCode,
          allowFriendRequests:
            typeof privacyRes.allowFriendRequests === 'boolean'
              ? privacyRes.allowFriendRequests
              : current.allowFriendRequests,
          groups: {
            ...current.groups,
            ...(privacyRes.groups || {}),
          },
        };
        writeStoredFriendsPrivacy(next);
        if (Array.isArray(friendsRes?.friends) && friendsRes.friends.length > 0) {
          setBackendFriends(friendsRes.friends);
        }
      })
      .catch(() => {
        // Backend does not yet have the migration applied or is offline — keep local + seeded state seamlessly
        if (!cancelled) {
          setIsUsingMockFallback(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userToken]);

  const friends = useMemo<FriendCardSummary[]>(() => {
    const seededAccepted = SEEDED_PLAYERS.filter(
      (p) => (stored.relationships[p.userId] ?? p.initialRelationship) === 'friend',
    ).map((p) => seedToFriendCard(p, 'friend', stored.friendOverrides[p.userId]));

    const existingIds = new Set(seededAccepted.map((f) => f.userId));
    const merged = [...seededAccepted];
    for (const bf of backendFriends) {
      if (!existingIds.has(bf.userId)) {
        merged.push(bf);
      }
    }
    return merged;
  }, [stored, backendFriends]);

  const incomingRequests = useMemo<FriendRequestItem[]>(() => {
    return SEEDED_PLAYERS.filter(
      (p) => (stored.relationships[p.userId] ?? p.initialRelationship) === 'incoming_request',
    ).map((p) => ({
      friendshipId: `req-${p.userId}`,
      user: {
        userId: p.userId,
        displayName: p.displayName,
        friendCode: p.friendCode,
        avatarColor: p.avatarColor,
        isAiPersona: p.isAiPersona,
      },
      note: stored.requestNotes[p.userId] || 'Wants to connect on Skillprint!',
      createdAt: p.joinedAt,
    }));
  }, [stored]);

  const outgoingRequests = useMemo<FriendRequestItem[]>(() => {
    return SEEDED_PLAYERS.filter(
      (p) => (stored.relationships[p.userId] ?? p.initialRelationship) === 'outgoing_request',
    ).map((p) => ({
      friendshipId: `req-${p.userId}`,
      user: {
        userId: p.userId,
        displayName: p.displayName,
        friendCode: p.friendCode,
        avatarColor: p.avatarColor,
        isAiPersona: p.isAiPersona,
      },
      note: stored.requestNotes[p.userId] || '',
      createdAt: new Date().toISOString(),
    }));
  }, [stored]);

  const discoverablePlayers = useMemo<FriendCardSummary[]>(() => {
    return SEEDED_PLAYERS.filter(
      (p) => (stored.relationships[p.userId] ?? p.initialRelationship) === 'none',
    ).map((p) => seedToFriendCard(p, 'none', stored.friendOverrides[p.userId]));
  }, [stored]);

  const updateGroupScope = useCallback(
    async (groupKey: PrivacyDataGroupingKey, scope: PrivacyScope) => {
      const current = readStoredFriendsPrivacy();
      const next: StoredFriendsPrivacyState = {
        ...current,
        groups: {
          ...current.groups,
          [groupKey]: scope,
        },
      };
      writeStoredFriendsPrivacy(next);

      if (userToken) {
        setIsSaving(true);
        try {
          await portalFetch('/profile/privacy/', userToken, {
            method: 'PATCH',
            body: JSON.stringify({ groups: { [groupKey]: scope } }),
          });
        } catch {
          // Local storage remains authoritative when offline
        } finally {
          setIsSaving(false);
        }
      }
    },
    [userToken],
  );

  const applyPrivacyPreset = useCallback(
    async (groups: PrivacyGroupScopes) => {
      const current = readStoredFriendsPrivacy();
      const next: StoredFriendsPrivacyState = {
        ...current,
        groups: { ...groups },
      };
      writeStoredFriendsPrivacy(next);

      if (userToken) {
        setIsSaving(true);
        try {
          await portalFetch('/profile/privacy/', userToken, {
            method: 'PATCH',
            body: JSON.stringify({ groups }),
          });
        } catch {
          // Keep local preset
        } finally {
          setIsSaving(false);
        }
      }
    },
    [userToken],
  );

  const setAllowFriendRequests = useCallback(
    async (allow: boolean) => {
      const current = readStoredFriendsPrivacy();
      const next: StoredFriendsPrivacyState = {
        ...current,
        allowFriendRequests: allow,
      };
      writeStoredFriendsPrivacy(next);

      if (userToken) {
        try {
          await portalFetch('/profile/privacy/', userToken, {
            method: 'PATCH',
            body: JSON.stringify({ allowFriendRequests: allow }),
          });
        } catch {
          // Keep local setting
        }
      }
    },
    [userToken],
  );

  const regenerateFriendCode = useCallback(async () => {
    const hex = Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, 'A');
    const newCode = `SP-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
    const current = readStoredFriendsPrivacy();
    writeStoredFriendsPrivacy({ ...current, friendCode: newCode });

    if (userToken) {
      try {
        const res = await portalFetch<any>('/profile/privacy/', userToken, {
          method: 'PATCH',
          body: JSON.stringify({ regenerateFriendCode: true }),
        });
        if (res?.friendCode) {
          writeStoredFriendsPrivacy({ ...readStoredFriendsPrivacy(), friendCode: res.friendCode });
        }
      } catch {
        // Keep generated code
      }
    }
    return newCode;
  }, [userToken]);

  const setFriendOverride = useCallback(
    async (
      friendId: string,
      groupKey: PrivacyDataGroupingKey,
      overrideScope: PrivacyOverrideScope,
    ) => {
      const current = readStoredFriendsPrivacy();
      const existing = current.friendOverrides[friendId] || { ...DEFAULT_OVERRIDE_MAP };
      const updatedMap: PrivacyOverrideMap = {
        ...existing,
        [groupKey]: overrideScope,
      };
      writeStoredFriendsPrivacy({
        ...current,
        friendOverrides: {
          ...current.friendOverrides,
          [friendId]: updatedMap,
        },
      });

      if (userToken && /^\d+$/.test(friendId)) {
        try {
          await portalFetch(`/friends/${friendId}/privacy/`, userToken, {
            method: 'PATCH',
            body: JSON.stringify({ overrides: { [groupKey]: overrideScope } }),
          });
        } catch {
          // Local override saved
        }
      }
    },
    [userToken],
  );

  const resetFriendOverrides = useCallback(
    async (friendId: string) => {
      const current = readStoredFriendsPrivacy();
      const nextOverrides = { ...current.friendOverrides };
      delete nextOverrides[friendId];
      writeStoredFriendsPrivacy({
        ...current,
        friendOverrides: nextOverrides,
      });

      if (userToken && /^\d+$/.test(friendId)) {
        try {
          await portalFetch(`/friends/${friendId}/privacy/`, userToken, {
            method: 'DELETE',
          });
        } catch {
          // Local override cleared
        }
      }
    },
    [userToken],
  );

  const sendFriendRequest = useCallback(
    async (identifier: string, note = ''): Promise<{ ok: boolean; status: string; message: string }> => {
      const clean = (identifier || '').trim();
      if (!clean) {
        return { ok: false, status: 'invalid', message: 'Enter a friend code, username, or player ID.' };
      }

      const current = readStoredFriendsPrivacy();
      if (clean.toUpperCase() === current.friendCode.toUpperCase()) {
        return { ok: false, status: 'self', message: 'That is your own Skillprint friend code.' };
      }

      // Check seeded players first
      const seedMatch = SEEDED_PLAYERS.find(
        (p) =>
          p.userId.toLowerCase() === clean.toLowerCase() ||
          p.friendCode.toLowerCase() === clean.toLowerCase() ||
          p.displayName.toLowerCase().includes(clean.toLowerCase()),
      );

      if (seedMatch) {
        const curRel = current.relationships[seedMatch.userId] ?? seedMatch.initialRelationship;
        if (curRel === 'friend') {
          return {
            ok: true,
            status: 'already_friends',
            message: `You are already connected with ${seedMatch.displayName}.`,
          };
        }
        // AI personas or players who already sent an incoming request auto-connect immediately!
        if (curRel === 'incoming_request' || seedMatch.isAiPersona) {
          const nextRel: RelationshipStatus = 'friend';
          writeStoredFriendsPrivacy({
            ...current,
            relationships: {
              ...current.relationships,
              [seedMatch.userId]: nextRel,
            },
          });
          pushPortalNotification({
            title: `Connected with ${seedMatch.displayName}`,
            message: seedMatch.isAiPersona
              ? `${seedMatch.displayName} is now in your Skillprint friends list. Compare your Skillprints anytime!`
              : `You and ${seedMatch.displayName} are now Skillprint friends.`,
            tone: 'success',
            actionLabel: 'View Profile',
            actionHref: `/profile/${seedMatch.userId}`,
          });
          return {
            ok: true,
            status: 'accepted',
            message: `Connected with ${seedMatch.displayName}!`,
          };
        }

        writeStoredFriendsPrivacy({
          ...current,
          relationships: {
            ...current.relationships,
            [seedMatch.userId]: 'outgoing_request',
          },
          requestNotes: {
            ...current.requestNotes,
            ...(note ? { [seedMatch.userId]: note } : {}),
          },
        });
        return {
          ok: true,
          status: 'pending',
          message: `Friend request sent to ${seedMatch.displayName} (${seedMatch.friendCode}).`,
        };
      }

      // Try backend endpoint if not in seeded players
      if (userToken) {
        try {
          const res = await portalFetch<any>('/friends/requests/', userToken, {
            method: 'POST',
            body: JSON.stringify({ identifier: clean, note }),
          });
          return {
            ok: true,
            status: res?.status || 'pending',
            message: `Friend request sent to ${res?.toUser?.displayName || clean}.`,
          };
        } catch (err: any) {
          return {
            ok: false,
            status: 'not_found',
            message: err?.message || `No player found matching "${clean}".`,
          };
        }
      }

      return {
        ok: false,
        status: 'not_found',
        message: `No player found matching "${clean}". Try SP-2W5G-9J6K (Alex Rivera) or SP-ZEN0-0002 (Zen AI).`,
      };
    },
    [userToken],
  );

  const respondToRequest = useCallback(
    async (userIdOrFriendshipId: string, action: 'accept' | 'decline' | 'cancel') => {
      const current = readStoredFriendsPrivacy();
      const targetSeed = SEEDED_PLAYERS.find(
        (p) => p.userId === userIdOrFriendshipId || `req-${p.userId}` === userIdOrFriendshipId,
      );
      const targetUserId = targetSeed ? targetSeed.userId : userIdOrFriendshipId;

      const nextRel: RelationshipStatus = action === 'accept' ? 'friend' : 'none';
      writeStoredFriendsPrivacy({
        ...current,
        relationships: {
          ...current.relationships,
          [targetUserId]: nextRel,
        },
      });

      if (action === 'accept' && targetSeed) {
        pushPortalNotification({
          title: `New Friend: ${targetSeed.displayName}`,
          message: `You accepted ${targetSeed.displayName}'s friend request. You can now view their shared Skillprint and compare game scores.`,
          tone: 'success',
          actionLabel: 'View Profile',
          actionHref: `/profile/${targetSeed.userId}`,
        });
      }

      if (userToken && /^\d+$/.test(userIdOrFriendshipId)) {
        try {
          await portalFetch(`/friends/requests/${userIdOrFriendshipId}/respond/`, userToken, {
            method: 'POST',
            body: JSON.stringify({ action }),
          });
        } catch {
          // Local state updated
        }
      }
    },
    [userToken],
  );

  const removeFriend = useCallback(
    async (friendUserId: string) => {
      const current = readStoredFriendsPrivacy();
      const nextOverrides = { ...current.friendOverrides };
      delete nextOverrides[friendUserId];
      writeStoredFriendsPrivacy({
        ...current,
        relationships: {
          ...current.relationships,
          [friendUserId]: 'none',
        },
        friendOverrides: nextOverrides,
      });

      if (userToken && /^\d+$/.test(friendUserId)) {
        try {
          await portalFetch(`/friends/${friendUserId}/`, userToken, {
            method: 'DELETE',
          });
        } catch {
          // Local state updated
        }
      }
    },
    [userToken],
  );

  const evaluateViewerAccessToMyProfile = useCallback(
    (viewerMode: 'self' | 'public' | 'friends' | string) => {
      if (viewerMode === 'self') {
        return evaluateEffectivePrivacy(stored.groups, 'self', null);
      }
      if (viewerMode === 'public') {
        return evaluateEffectivePrivacy(stored.groups, 'none', null);
      }
      if (viewerMode === 'friends') {
        return evaluateEffectivePrivacy(stored.groups, 'friend', null);
      }
      // Specific friendId
      const customOverrides = stored.friendOverrides[viewerMode] || null;
      return evaluateEffectivePrivacy(stored.groups, 'friend', customOverrides);
    },
    [stored.groups, stored.friendOverrides],
  );

  const friendOverridesList = useMemo<FriendPrivacyOverrideEntry[]>(() => {
    return Object.entries(stored.friendOverrides).map(([friendId, overrides]) => {
      const f = friends.find((fr) => fr.userId === friendId);
      return {
        friendId,
        displayName: f?.displayName || friendId,
        overrides,
      };
    });
  }, [stored.friendOverrides, friends]);

  return {
    hydrated,
    isUsingMockFallback,
    isSaving,
    friendCode: stored.friendCode,
    allowFriendRequests: stored.allowFriendRequests,
    privacyGroups: stored.groups,
    friendOverridesMap: stored.friendOverrides,
    friendOverridesList,
    friends,
    incomingRequests,
    outgoingRequests,
    discoverablePlayers,
    updateGroupScope,
    applyPrivacyPreset,
    setAllowFriendRequests,
    regenerateFriendCode,
    setFriendOverride,
    resetFriendOverrides,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    evaluateViewerAccessToMyProfile,
  };
}

export function useFriendProfile(identifier: string) {
  const { userToken } = useUserSession();
  const {
    hydrated,
    friends,
    incomingRequests,
    outgoingRequests,
    discoverablePlayers,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
  } = useFriendsAndPrivacy();

  const [remoteProfile, setRemoteProfile] = useState<GatedFriendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const decodedId = useMemo(() => decodeURIComponent(identifier || '').trim(), [identifier]);

  const localSeed = useMemo(() => {
    return SEEDED_PLAYERS.find(
      (p) =>
        p.userId.toLowerCase() === decodedId.toLowerCase() ||
        p.friendCode.toLowerCase() === decodedId.toLowerCase(),
    );
  }, [decodedId]);

  useEffect(() => {
    if (!decodedId) return;
    if (localSeed) {
      setIsUsingMockData(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    portalFetch<GatedFriendProfile>(
      `/friends/${encodeURIComponent(decodedId)}/profile/`,
      userToken || undefined,
    )
      .then((res) => {
        if (!cancelled) {
          setRemoteProfile(res);
          setIsUsingMockData(false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteProfile(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [decodedId, localSeed, userToken]);

  const profile = useMemo<GatedFriendProfile | null>(() => {
    if (localSeed) {
      const stored = readStoredFriendsPrivacy();
      const rel = stored.relationships[localSeed.userId] ?? localSeed.initialRelationship;
      return buildGatedProfileFromSeed(localSeed, rel);
    }
    return remoteProfile;
  }, [localSeed, remoteProfile, friends, incomingRequests, outgoingRequests, discoverablePlayers]);

  return {
    profile,
    isLoading: !hydrated || isLoading,
    isUsingMockData,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
  };
}
