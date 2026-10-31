import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every challenge (lib/staticExport.ts).
export const generateStaticParams = shellParams('challengeId');

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
