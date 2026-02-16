import ReviewClient from './ReviewClient';

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
    return <ReviewClient slug={slug} sessionId={sessionId} />;
}
