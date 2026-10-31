import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every team (lib/staticExport.ts).
export const generateStaticParams = shellParams('teamId');

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
