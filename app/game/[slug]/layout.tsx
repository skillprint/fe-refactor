import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every game, and one each for its review and interstitial (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
