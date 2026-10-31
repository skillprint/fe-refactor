import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every bot (lib/staticExport.ts).
export const generateStaticParams = shellParams('playerId');

export default function BotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
