import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every badge (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

export default function BadgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
