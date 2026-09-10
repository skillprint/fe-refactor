import React from 'react';
import type { Metadata } from 'next';
import SkillsCatalogClient from './SkillsCatalogClient';

export const metadata: Metadata = {
  title: 'Skills',
};

/** Skills catalog (SKI-133): taxonomy and featured skills come from `GET /api/portal/taxonomy/skills/`. */
export default function SkillsPage() {
  return <SkillsCatalogClient />;
}
