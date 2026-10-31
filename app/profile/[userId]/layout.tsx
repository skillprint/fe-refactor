import { Suspense } from 'react';
import BuckyballLoading from '@/app/components/BuckyballLoading';
import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every profile (lib/staticExport.ts).
export const generateStaticParams = shellParams('userId');

// The page reads its param with useRouteParams, which needs a boundary.
export default function FriendProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><BuckyballLoading /></div>}>
      {children}
    </Suspense>
  );
}
