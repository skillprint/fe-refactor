import { Suspense } from 'react';
import ReviewClient from './ReviewClient';
import BuckyballLoading from '../../../components/BuckyballLoading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Game Review',
};

interface ReviewPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        sessionId?: string;
    }>;
}

export default async function ReviewPage({ params, searchParams }: ReviewPageProps) {
    const { slug } = await params;
    const { sessionId } = await searchParams;
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><BuckyballLoading /></div>}>
            <ReviewClient slug={slug} sessionId={sessionId} />
        </Suspense>
    );
}
