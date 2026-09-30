/**
 * The admin guide, served from docs/COACH_ADMIN_README.md so the document and
 * the page can't drift apart. Open without signing in and not in the menu:
 * Skillprint staff send the link to a school's new admin.
 *
 * The file ships with the function through `outputFileTracingIncludes` in
 * next.config.ts.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import { renderMarkdown } from '@/lib/markdown';

export const metadata: Metadata = { title: 'Admin guide' };

export default async function CoachAdminGuidePage() {
  const markdown = await readFile(path.join(process.cwd(), 'docs', 'COACH_ADMIN_README.md'), 'utf8');
  return (
    <article
      className="coach-guide coach-doc"
      // The renderer escapes the document before adding markup.
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown, { tableClass: 'coach-table' }) }}
    />
  );
}
