import { Suspense } from 'react';
import Skillprint from './skillprint';
import BuckyballLoading from '../components/BuckyballLoading';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><BuckyballLoading /></div>}>
      <Skillprint />
    </Suspense>
  );
}