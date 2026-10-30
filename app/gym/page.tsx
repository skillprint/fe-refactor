'use client';

import React from 'react';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import PortalHead from '@/components/PortalHead';
import GymTrackerDashboard from '@/components/GymTrackerDashboard';
import { useGymTrackerFeatureFlag } from '@/app/hooks/useGymTracker';

export default function GymTrackerPage() {
  const { gymTrackerEnabled, setGymTrackerEnabled } = useGymTrackerFeatureFlag();

  return (
    <PortalLayout pageClass="page--portal-gym">
      <PortalHead
        eyebrow="Strength & Exertion"
        title="Gym & Exertion Tracker"
        description="Log workouts, sets, supersets, RPE/RIR exertion, and routines with real-time 3D biomechanical avatar visualization."
      />

      {!gymTrackerEnabled && (
        <div
          className="sp-alert"
          data-alert=""
          data-alert-tone="info"
          style={{ marginBottom: '1rem' }}
        >
          <svg className="sp-icon sp-alert__icon" aria-hidden="true" viewBox="0 0 24 24">
            <use href="#ti-info" />
          </svg>
          <div className="sp-alert__body">
            <span className="sp-alert__title">Side navigation shortcut is currently hidden</span>
            <p className="sp-alert__text">
              The Gym Tracker side navigation item is defaulted to off in{' '}
              <Link href="/settings/toggles">/settings/toggles</Link>. You can enable it here or on the Feature Toggles page.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => setGymTrackerEnabled(true)}
          >
            Pin to Side Nav
          </button>
        </div>
      )}

      <GymTrackerDashboard />
    </PortalLayout>
  );
}
