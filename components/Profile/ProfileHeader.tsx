import React from 'react';
import Link from 'next/link';
import PortalHead from '@/components/PortalHead';

export default function ProfileHeader() {
  const actions = (
    <>
      <Link href="/skills" className="button button--secondary button--md">
        Skills
      </Link>
      <Link href="/games" className="button button--primary button--md">
        <svg className="sp-icon" aria-hidden="true" viewBox="0 0 24 24">
          <use href="#ti-play"></use>
        </svg>
        Play a game
      </Link>
    </>
  );

  return (
    <PortalHead
      eyebrow="Profile"
      title="Your Skillprint"
      titleId="ppPageTitle"
      description="Your Skillprint: 28 skills across mood, cognition and personality, scored from every session you finish."
      actions={actions}
    />
  );
}
