'use client';

import { Suspense, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useHomeSummary } from '@/lib/models/portal/useHomeSummary';
import { useProfileBadges } from '@/lib/models/portal/useProfileBadges';
import { useAssignedPlaybooks } from '@/lib/models/portal/useAssignedPlaybooks';
import { useInsight } from '@/lib/models/portal/useInsight';
import { useProfileTrends } from '@/lib/models/portal/useProfileTrends';
import { useEmailAddress } from '@/lib/models/portal/useEmailAddress';
import {
  syncPlatformNotifications,
  useNotificationsFeatureFlag,
} from '@/lib/notifications';

/**
 * Observes platform data hooks and turns them into inbox notifications, once
 * per milestone, badge, assignment, deadline, skill trend, streak, or account
 * prompt. The inbox is this browser's localStorage (lib/notifications).
 */
function NotificationsSyncInner() {
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

    syncPlatformNotifications({
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

export default function NotificationsSync() {
  // The data hooks go through useUserSession, which reads the URL; a static
  // page may only do that inside Suspense.
  return (
    <Suspense fallback={null}>
      <NotificationsSyncInner />
    </Suspense>
  );
}
