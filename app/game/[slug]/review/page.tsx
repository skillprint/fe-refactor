import ReviewClient from './ReviewClient';

interface ReviewPageProps {
    params: {
        slug: string;
    };
    searchParams: {
        sessionId?: string;
    };
}

export default function ReviewPage({ params, searchParams }: ReviewPageProps) {
    return <ReviewClient slug={params.slug} sessionId={searchParams.sessionId} />;
}
