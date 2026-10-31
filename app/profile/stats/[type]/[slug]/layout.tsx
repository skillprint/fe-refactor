import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every stats page (lib/staticExport.ts).
export const generateStaticParams = shellParams('type', 'slug');

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
