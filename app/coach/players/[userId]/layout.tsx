import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every player (lib/staticExport.ts).
export const generateStaticParams = shellParams('userId');

export default function CoachPlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
