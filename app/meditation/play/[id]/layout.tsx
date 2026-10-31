import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every meditation (lib/staticExport.ts).
export const generateStaticParams = shellParams('id');

export default function MeditationPlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
