import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every assignment (lib/staticExport.ts).
export const generateStaticParams = shellParams('assignmentId');

export default function AssignmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
