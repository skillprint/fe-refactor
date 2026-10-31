import { shellParams } from '@/lib/staticExport';

// The static export builds one shell for every embedded game (lib/staticExport.ts).
export const generateStaticParams = shellParams('slug');

export default function EmbedGameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
