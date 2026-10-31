import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every game under review (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

export default function GameReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
