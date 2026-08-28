import SkillDetailClient from './SkillDetailClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill Progression',
};

interface SkillDetailPageProps {
    params: Promise<{
        skillId: string;
    }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
    const { skillId } = await params;
    return <SkillDetailClient skillId={skillId} />;
}
