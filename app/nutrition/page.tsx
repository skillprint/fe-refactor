import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import NutritionTrackerClient from '@/components/Nutrition/NutritionTrackerClient';

export const metadata: Metadata = {
  title: 'Nutrition & Exertion Tracker',
};

export default function NutritionPage() {
  return (
    <Suspense fallback={null}>
      <NutritionTrackerClient />
    </Suspense>
  );
}
