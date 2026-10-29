'use client';

import React from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import MockDataTag from '@/components/MockDataTag';
import { useIslandCoachFeatureFlag } from '@/app/hooks/useIslandCoach';
import { useGymTrackerFeatureFlag } from '@/app/hooks/useGymTracker';
import { useNutritionFeatureFlag } from '@/app/hooks/useNutritionTracker';
import { useNotificationsFeatureFlag } from '@/lib/notifications';
import { useFriendsFeatureFlag } from '@/lib/models/portal/useFriendsAndPrivacy';

export default function SecretFeatureTogglesPage() {
  const { coachFeatureEnabled, setCoachFeatureEnabled } = useIslandCoachFeatureFlag();
  const { gymTrackerEnabled, setGymTrackerEnabled } = useGymTrackerFeatureFlag();
  const { nutritionFeatureEnabled, setNutritionFeatureEnabled } = useNutritionFeatureFlag();
  const { notificationsFeatureEnabled, setNotificationsFeatureEnabled } = useNotificationsFeatureFlag();
  const { friendsFeatureEnabled, setFriendsFeatureEnabled } = useFriendsFeatureFlag();

  const allEnabled =
    coachFeatureEnabled &&
    gymTrackerEnabled &&
    nutritionFeatureEnabled &&
    notificationsFeatureEnabled &&
    friendsFeatureEnabled;

  const noneEnabled =
    !coachFeatureEnabled &&
    !gymTrackerEnabled &&
    !nutritionFeatureEnabled &&
    !notificationsFeatureEnabled &&
    !friendsFeatureEnabled;

  const setAllToggles = (enabled: boolean) => {
    setCoachFeatureEnabled(enabled);
    setGymTrackerEnabled(enabled);
    setNutritionFeatureEnabled(enabled);
    setNotificationsFeatureEnabled(enabled);
    setFriendsFeatureEnabled(enabled);
  };

  const actions = (
    <div className="layout-flex items-center gap-sm wrap">
      <button
        type="button"
        className="button button--secondary button--sm"
        disabled={allEnabled}
        onClick={() => setAllToggles(true)}
      >
        Enable All
      </button>
      <button
        type="button"
        className="button button--tertiary button--sm"
        disabled={noneEnabled}
        onClick={() => setAllToggles(false)}
      >
        Disable All
      </button>
      <Link href="/settings" className="button button--secondary button--md">
        &larr; Settings
      </Link>
    </div>
  );

  return (
    <PortalLayout pageClass="page--portal-settings">
      <PortalHead
        eyebrow="Internal / Secret Controls"
        title="Feature Toggles"
        description="Hidden feature flags for experimental and optional Skillprint portal modules. Toggling any switch immediately updates your navigation and profile views."
        actions={actions}
      />

      <section className="pp-section" id="feature-toggles">
        <div className="pp-settings sp-card" id="ppFeatureToggles">
          {/* 1. Skillprint Friends & Profile Privacy */}
          <div className="pp-setting separator-bottom" id="ppFriendsFeature">
            <div>
              <div className="layout-flex items-center gap-sm wrap">
                <h2 id="setting-friends-feature">Skillprint Friends &amp; Profile Privacy</h2>
                <MockDataTag label="Social & 6-Group Privacy" />
                {friendsFeatureEnabled && (
                  <Link href="/friends" className="ui-badge ui-badge--sm" style={{ textDecoration: 'none' }}>
                    Open /friends &rarr;
                  </Link>
                )}
              </div>
              <p className="margin-none text-muted font-sm">
                Enable the Friends hub, shareable friend codes, LLM Island AI companions, side-by-side Skillprint comparisons, friend leaderboard unmasking, and 6-grouping profile privacy controls.
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={friendsFeatureEnabled}
              aria-labelledby="setting-friends-feature"
              data-friends-feature-toggle=""
              onClick={() => setFriendsFeatureEnabled(!friendsFeatureEnabled)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>

          {/* 2. AI Coach & Shared Lessons (LLM Island Bridge) */}
          <div className="pp-setting separator-bottom" id="ppIslandCoach">
            <div>
              <div className="layout-flex items-center gap-sm wrap">
                <h2 id="setting-island-coach">AI Coach &amp; Shared Lessons</h2>
                <MockDataTag label="LLM Island Bridge" />
              </div>
              <p className="margin-none text-muted font-sm">
                Show pre-game briefings, real-time gameplay tips from LLM Island AI characters, and lesson sharing on your profile.
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={coachFeatureEnabled}
              aria-labelledby="setting-island-coach"
              data-island-coach-toggle=""
              onClick={() => setCoachFeatureEnabled(!coachFeatureEnabled)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>

          {/* 3. Gym & Exertion Tracker (Hevy + 3D Avatar) */}
          <div className="pp-setting separator-bottom" id="ppGymTracker">
            <div>
              <div className="layout-flex items-center gap-sm wrap">
                <h2 id="setting-gym-tracker">Gym &amp; Exertion Tracker</h2>
                <MockDataTag label="Hevy + 3D Avatar" />
                {gymTrackerEnabled && (
                  <Link href="/gym" className="ui-badge ui-badge--sm" style={{ textDecoration: 'none' }}>
                    Open /gym &rarr;
                  </Link>
                )}
              </div>
              <p className="margin-none text-muted font-sm">
                Show the Gym Tracker in the side navigation to log exercises, sets, supersets, routines, and physical exertion (RPE / sRPE) with a 3D avatar visualizer.
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={gymTrackerEnabled}
              aria-labelledby="setting-gym-tracker"
              data-gym-tracker-toggle=""
              onClick={() => setGymTrackerEnabled(!gymTrackerEnabled)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>

          {/* 4. Nutrition & Physical Exertion Tracker (Cronometer Replica) */}
          <div className="pp-setting separator-bottom" id="ppNutritionTracker">
            <div>
              <div className="layout-flex items-center gap-sm wrap">
                <h2 id="setting-nutrition-tracker">Nutrition &amp; Exertion Tracker</h2>
                <MockDataTag label="Cronometer DB" />
                {nutritionFeatureEnabled && (
                  <Link href="/nutrition" className="ui-badge ui-badge--sm" style={{ textDecoration: 'none' }}>
                    Open /nutrition &rarr;
                  </Link>
                )}
              </div>
              <p className="margin-none text-muted font-sm">
                Show the Cronometer-style nutrition diary, lab nutrient database (NCCDB, USDA, CRDB), exercise &amp; physical exertion logger, and nutrition trend visualizations in the sidebar navigation.
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={nutritionFeatureEnabled}
              aria-labelledby="setting-nutrition-tracker"
              data-nutrition-tracker-toggle=""
              onClick={() => setNutritionFeatureEnabled(!nutritionFeatureEnabled)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>

          {/* 5. Notifications Inbox & Alerts */}
          <div className="pp-setting" id="ppNotificationsWidget">
            <div>
              <div className="layout-flex items-center gap-sm wrap">
                <h2 id="setting-notifications-widget">Notifications Inbox &amp; Alerts</h2>
              </div>
              <p className="margin-none text-muted font-sm">
                Show the Notifications item and unread count bubble in the sidebar navigation for milestones, badges, leaderboard ranks, assigned playbooks, skill trends, and AI Coach lessons.
              </p>
            </div>
            <button
              className="sp-toggle"
              type="button"
              role="switch"
              aria-checked={notificationsFeatureEnabled}
              aria-labelledby="setting-notifications-widget"
              data-notifications-widget-toggle=""
              onClick={() => setNotificationsFeatureEnabled(!notificationsFeatureEnabled)}
            >
              <span className="sp-toggle__thumb"></span>
            </button>
          </div>
        </div>
      </section>
    </PortalLayout>
  );
}
