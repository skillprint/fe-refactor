import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every playbook (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

export default function PlaybookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
