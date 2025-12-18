import SkillDetailClient from './SkillDetailClient';

// Sample skills for static generation
const sampleSkills = [
    'Problem Solving',
    'Memory',
    'Speed',
    'Accuracy',
    'Pattern Recognition',
    'Spatial Awareness',
    'Logic',
    'Creativity',
];

export async function generateStaticParams() {
    return sampleSkills.map((skill) => ({
        skillId: encodeURIComponent(skill),
    }));
}

interface SkillDetailPageProps {
    params: Promise<{
        skillId: string;
    }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
    const { skillId } = await params;
    return <SkillDetailClient skillId={skillId} />;
}
