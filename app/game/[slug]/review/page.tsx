import { Suspense } from 'react';
import ReviewClient from './ReviewClient';
import BuckyballLoading from '../../../components/BuckyballLoading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Review',
};

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><BuckyballLoading /></div>}>
            <ReviewClient />
        </Suspense>
    );
}
