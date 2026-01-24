import SkillDetailClient from './SkillDetailClient';



interface SkillDetailPageProps {
    params: Promise<{
        skillId: string;
    }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
    const { skillId } = await params;
    return <SkillDetailClient skillId={skillId} />;
}
