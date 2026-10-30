'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CoachPersonaSummary,
  CoachTipItem,
  PlayerExperienceInput,
  PreGameCoachBriefing,
  UserSharedLesson,
} from '@/lib/coachBridge';
import {
  createCoachLessonNotification,
  pushPortalNotificationOnce,
} from '@/lib/notifications';

const STORAGE_COACH_FEATURE_ENABLED = 'skillprint_island_coach_feature_enabled';
const EVENT_COACH_FEATURE_CHANGED = 'skillprint-coach-feature-change';
const STORAGE_TIPS_ENABLED = 'skillprint_coach_tips_enabled';
const STORAGE_SELECTED_COACH = 'skillprint_selected_coach_id';
const STORAGE_LOCAL_LESSONS = 'skillprint_user_lessons_v1';

export function readCoachFeatureEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_COACH_FEATURE_ENABLED) === 'true';
  } catch {
    return false;
  }
}

export function useIslandCoachFeatureFlag() {
  // Default to OFF (false) until explicitly enabled in Settings
  const [coachFeatureEnabled, setCoachFeatureEnabledState] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCoachFeatureEnabledState(readCoachFeatureEnabled());

    const handleSync = () => {
      setCoachFeatureEnabledState(readCoachFeatureEnabled());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener(EVENT_COACH_FEATURE_CHANGED, handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener(EVENT_COACH_FEATURE_CHANGED, handleSync);
    };
  }, []);

  const setCoachFeatureEnabled = useCallback((enabled: boolean) => {
    setCoachFeatureEnabledState(enabled);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_COACH_FEATURE_ENABLED, String(enabled));
        window.dispatchEvent(new CustomEvent(EVENT_COACH_FEATURE_CHANGED, { detail: enabled }));
      } catch {
        // ignore
      }
    }
  }, []);

  return { coachFeatureEnabled, setCoachFeatureEnabled };
}

export function readLocalLessons(): UserSharedLesson[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_LESSONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalLesson(lesson: UserSharedLesson): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = readLocalLessons().filter((l) => l.id !== lesson.id);
    existing.unshift(lesson);
    localStorage.setItem(STORAGE_LOCAL_LESSONS, JSON.stringify(existing.slice(0, 100)));
  } catch {
    // ignore
  }
}

export function useIslandCoach(gameSlug: string, playerExperience?: PlayerExperienceInput) {
  const { coachFeatureEnabled, setCoachFeatureEnabled } = useIslandCoachFeatureFlag();
  const [tipsEnabled, setTipsEnabledState] = useState<boolean>(true);
  const [selectedCoachId, setSelectedCoachIdState] = useState<string>('');
  const [briefing, setBriefing] = useState<PreGameCoachBriefing | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState<boolean>(false);
  const [activeWhisper, setActiveWhisper] = useState<CoachTipItem | null>(null);
  const [whisperHistory, setWhisperHistory] = useState<CoachTipItem[]>([]);
  const [isAskingCoach, setIsAskingCoach] = useState<boolean>(false);
  const sentTipIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedEnabled = localStorage.getItem(STORAGE_TIPS_ENABLED);
    if (savedEnabled !== null) {
      setTipsEnabledState(savedEnabled === 'true');
    }
    const savedCoach = localStorage.getItem(STORAGE_SELECTED_COACH);
    if (savedCoach) {
      setSelectedCoachIdState(savedCoach);
    }
  }, []);

  const setTipsEnabled = useCallback((enabled: boolean) => {
    setTipsEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TIPS_ENABLED, String(enabled));
    }
  }, []);

  const setSelectedCoachId = useCallback((coachId: string) => {
    setSelectedCoachIdState(coachId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SELECTED_COACH, coachId);
    }
  }, []);

  // Serialize player experience fields that matter so we don't refetch in a loop
  const expKey = JSON.stringify({
    sessionsPlayed: playerExperience?.sessionsPlayed ?? 0,
    bestScore: playerExperience?.bestScore ?? null,
    lastScore: playerExperience?.lastScore ?? null,
    lastFlowScore: playerExperience?.lastFlowScore ?? null,
    targetMood: playerExperience?.targetMood ?? '',
    gameTitle: playerExperience?.gameTitle ?? '',
    gameSkills: playerExperience?.gameSkills ?? [],
    skillCount: Object.keys(playerExperience?.profileSkills || {}).length,
  });

  const fetchBriefing = useCallback(async () => {
    if (!gameSlug || !coachFeatureEnabled) return;
    setIsLoadingBriefing(true);
    try {
      const res = await fetch('/api/island-coach/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'briefing',
          gameSlug,
          coachId: selectedCoachId || undefined,
          playerExperience: playerExperience || {},
        }),
      });
      if (res.ok) {
        const data: PreGameCoachBriefing = await res.json();
        setBriefing(data);
        if (!selectedCoachId && data.selectedCoach?.id) {
          setSelectedCoachIdState(data.selectedCoach.id);
        }
      }
    } catch (e) {
      console.warn('Could not load coach briefing:', e);
    } finally {
      setIsLoadingBriefing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSlug, selectedCoachId, expKey, coachFeatureEnabled]);

  useEffect(() => {
    if (!coachFeatureEnabled) {
      setBriefing(null);
      setActiveWhisper(null);
      return;
    }
    fetchBriefing();
  }, [fetchBriefing, coachFeatureEnabled]);

  const requestWhisper = useCallback(
    async (params: {
      trigger: 'opening' | 'cadence' | 'milestone' | 'adjustment' | 'ask';
      score?: number | null;
      bestScore?: number | null;
      inputCount?: number;
      elapsedSeconds?: number;
      adjustmentName?: string;
      adjustmentValue?: any;
      question?: string;
    }): Promise<CoachTipItem | null> => {
      if (!gameSlug || !coachFeatureEnabled) return null;
      setIsAskingCoach(true);
      try {
        const res = await fetch('/api/island-coach/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'whisper',
            gameSlug,
            coachId: selectedCoachId || briefing?.selectedCoach?.id,
            ...params,
            alreadySentIds: Array.from(sentTipIdsRef.current),
          }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        const tip: CoachTipItem | undefined = data?.tip;
        if (tip) {
          sentTipIdsRef.current.add(tip.id);
          setActiveWhisper(tip);
          setWhisperHistory((prev) => {
            const filtered = prev.filter((item) => item.text !== tip.text);
            return [tip, ...filtered].slice(0, 12);
          });
          return tip;
        }
        return null;
      } catch (e) {
        console.warn('Whisper request failed:', e);
        return null;
      } finally {
        setIsAskingCoach(false);
      }
    },
    [gameSlug, selectedCoachId, briefing?.selectedCoach?.id, coachFeatureEnabled]
  );

  const dismissWhisper = useCallback(() => {
    setActiveWhisper(null);
  }, []);

  return {
    coachFeatureEnabled,
    setCoachFeatureEnabled,
    tipsEnabled,
    setTipsEnabled,
    selectedCoachId: selectedCoachId || briefing?.selectedCoach?.id || 'island',
    setSelectedCoachId,
    briefing,
    isLoadingBriefing,
    activeWhisper,
    whisperHistory,
    isAskingCoach,
    requestWhisper,
    dismissWhisper,
    refreshBriefing: fetchBriefing,
  };
}

export async function submitPlayerLesson(params: {
  userId: string;
  userName?: string;
  gameSlug: string;
  gameTitle?: string;
  kind: 'works' | 'avoid' | 'question';
  text: string;
  score?: number | null;
  targetMood?: string;
  shareTo?: string;
}): Promise<UserSharedLesson | null> {
  try {
    const res = await fetch('/api/island-coach/lessons/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.lesson) {
        const saved = data.lesson as UserSharedLesson;
        writeLocalLesson(saved);
        pushPortalNotificationOnce(
          createCoachLessonNotification({
            id: saved.id,
            coachName: saved.attributions?.[0]?.personaName || 'AI Coach',
            gameTitle: saved.gameTitle || saved.gameSlug,
            text: saved.text,
          }),
        );
        return saved;
      }
    }
  } catch (e) {
    console.warn('API lesson save failed, falling back to local storage:', e);
  }

  // Fallback local record
  const fallbackLesson: UserSharedLesson = {
    id: `local-${Date.now()}`,
    userId: params.userId || 'guest',
    userName: params.userName || 'Skillprint Player',
    gameSlug: params.gameSlug,
    gameTitle: params.gameTitle || params.gameSlug,
    kind: params.kind,
    text: params.text.trim(),
    score: params.score ?? null,
    targetMood: params.targetMood,
    shareTo: params.shareTo || 'all',
    createdAt: new Date().toISOString(),
    attributions:
      params.shareTo !== 'private'
        ? [
            {
              personaId: 'hana',
              personaName: 'Hana',
              personaKind: 'agent',
              status: 'queued',
            },
            {
              personaId: 'island',
              personaName: 'Island',
              personaKind: 'agent',
              status: 'queued',
            },
          ]
        : [],
    helpfulCount: 1,
  };
  writeLocalLesson(fallbackLesson);
  pushPortalNotificationOnce(
    createCoachLessonNotification({
      id: fallbackLesson.id,
      coachName: fallbackLesson.attributions?.[0]?.personaName || 'AI Coach',
      gameTitle: fallbackLesson.gameTitle || fallbackLesson.gameSlug,
      text: fallbackLesson.text,
    }),
  );
  return fallbackLesson;
}

export async function rateCoachTipFeedback(params: {
  tipText: string;
  fromId: string;
  gameSlug: string;
  helped: boolean;
  scoreDelta?: number | null;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/island-coach/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'rate',
        ...params,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPlayerLessons(filter?: {
  userId?: string;
  gameSlug?: string;
}): Promise<{ lessons: UserSharedLesson[]; coaches: CoachPersonaSummary[] }> {
  const local = readLocalLessons().filter((l) => {
    if (filter?.userId && l.userId !== filter.userId) return false;
    if (filter?.gameSlug && !l.gameSlug.includes(filter.gameSlug)) return false;
    return true;
  });

  try {
    const qs = new URLSearchParams();
    if (filter?.userId) qs.set('userId', filter.userId);
    if (filter?.gameSlug) qs.set('gameSlug', filter.gameSlug);
    const res = await fetch(`/api/island-coach/lessons/?${qs.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const serverLessons: UserSharedLesson[] = Array.isArray(data?.lessons) ? data.lessons : [];
      const seenTexts = new Set(serverLessons.map((s) => `${s.gameSlug}:${s.text.toLowerCase()}`));
      const merged = [
        ...serverLessons,
        ...local.filter((l) => !seenTexts.has(`${l.gameSlug}:${l.text.toLowerCase()}`)),
      ];
      return {
        lessons: merged,
        coaches: Array.isArray(data?.coaches) ? data.coaches : [],
      };
    }
  } catch {
    // ignore
  }

  return { lessons: local, coaches: [] };
}
