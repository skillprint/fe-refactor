import { Suspense } from 'react';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every skill (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

// The page reads its param with useRouteParams, which needs a boundary.
export default function SkillProgressionLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><BuckyballLoading /></div>}>
      {children}
    </Suspense>
  );
}
