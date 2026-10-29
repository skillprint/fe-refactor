'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useHomeSummary } from '@/lib/models/portal/useHomeSummary';
import { useProfileBadges } from '@/lib/models/portal/useProfileBadges';
import { useAssignedPlaybooks } from '@/lib/models/portal/useAssignedPlaybooks';
import { useInsight } from '@/lib/models/portal/useInsight';
import { useProfileTrends } from '@/lib/models/portal/useProfileTrends';
import { useEmailAddress } from '@/lib/models/portal/useEmailAddress';
import {
  syncPlatformNotificationsToBackend,
  useNotificationsFeatureFlag,
} from '@/lib/notifications';

/**
 * Observes platform data hooks and syncs them with the `/api/notifications`
 * backend so notifications are evaluated and persisted server-side once per
 * milestone, badge, assignment, deadline, skill trend, streak, or account prompt.
 */
export default function NotificationsSync() {
  const { notificationsFeatureEnabled } = useNotificationsFeatureFlag();
  const { status } = useAuth();
  const { data: homeSummary } = useHomeSummary();
  const { data: badgesData } = useProfileBadges();
  const { data: assignedPlaybooks } = useAssignedPlaybooks();
  const { data: insights } = useInsight();
  const { data: trends } = useProfileTrends();
  const { data: emailState } = useEmailAddress();

  useEffect(() => {
    if (!notificationsFeatureEnabled) return;
    if (
      !homeSummary &&
      !badgesData?.badges?.length &&
      !assignedPlaybooks?.length &&
      !insights &&
      !trends
    ) {
      return;
    }

    syncPlatformNotificationsToBackend({
      homeSummary,
      badges: badgesData?.badges ?? null,
      assignedPlaybooks: assignedPlaybooks ?? null,
      insights: Array.isArray(insights) ? insights : null,
      trends: trends ?? null,
      emailState: emailState ?? null,
      authStatus: status,
    });
  }, [
    notificationsFeatureEnabled,
    homeSummary,
    badgesData,
    assignedPlaybooks,
    insights,
    trends,
    emailState,
    status,
  ]);

  return null;
}
