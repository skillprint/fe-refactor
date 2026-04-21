import StatsClient from './StatsClient';

interface StatsPageProps {
    params: Promise<{
        type: string;
        slug: string;
    }>;
}

export default async function StatsPage({ params }: StatsPageProps) {
    const { type, slug } = await params;
    return <StatsClient type={type} slug={slug} />;
}
