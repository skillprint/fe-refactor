import { Suspense } from 'react';
import Skillprint from './skillprint';
import BuckyballLoading from '../components/BuckyballLoading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Skillprint',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><BuckyballLoading /></div>}>
      <Skillprint />
    </Suspense>
  );
}