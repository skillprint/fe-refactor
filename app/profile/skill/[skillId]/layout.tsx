import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every skill (lib/staticExport.ts).
export const generateStaticParams = shellParams('skillId');

export default function SkillDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
