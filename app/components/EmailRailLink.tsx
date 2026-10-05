'use client';

/**
 * "Get reminders by email" on the profile rail (SKI-265): a way into the
 * opt-in form in Settings for a player with no address yet. Hidden for
 * coaches and coached players, and while a confirmation link is pending.
 */
import React from 'react';
import Link from 'next/link';
import { useEmailAddress } from '../../lib/models/portal/useEmailAddress';

export default function EmailRailLink() {
  const { data } = useEmailAddress();
  if (!data || !data.available || data.pending || data.verified) return null;
  return (
    <Link href="/settings/#ppEmail" className="portal-section__link font-sm">
      Get reminders by email
      <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
        <use href="#ti-chevron-right"></use>
      </svg>
    </Link>
  );
}
