import { Suspense } from 'react';
import SkillDetailClient from './SkillDetailClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill Progression',
};

export default function SkillDetailPage() {
    return (
        <Suspense fallback={null}>
            <SkillDetailClient />
        </Suspense>
    );
}
