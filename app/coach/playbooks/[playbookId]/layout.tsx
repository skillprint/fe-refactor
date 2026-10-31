import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every playbook, and one for its assign page (lib/staticExport.ts).
export const generateStaticParams = shellParams('playbookId');

export default function CoachPlaybookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
