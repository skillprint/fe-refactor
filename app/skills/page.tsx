import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import SkillsCatalogClient from './SkillsCatalogClient';

export const metadata: Metadata = {
  title: 'Skills',
};

/**
 * Skills catalog (SKI-133): taxonomy and featured skills come from `GET /api/portal/taxonomy/skills/`.
 *
 * The client tree reads `useSearchParams()` (via the portal layout), which makes Next bail out of
 * static prerendering unless a Suspense boundary sits above it. Without this the production build
 * fails on "/skills" (SKI-145), so nothing on the page — image fixes included — ever deploys.
 */
export default function SkillsPage() {
  return (
    <Suspense fallback={null}>
      <SkillsCatalogClient />
    </Suspense>
  );
}
