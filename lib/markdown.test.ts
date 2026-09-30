import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderInline, renderMarkdown, slugify } from './markdown';

test('headings get GitHub-style ids so in-page links work', () => {
  assert.equal(slugify('What coaches can see'), 'what-coaches-can-see');
  assert.equal(slugify('1. Getting your admin account'), '1-getting-your-admin-account');
  assert.equal(renderMarkdown('## What coaches can see'), '<h2 id="what-coaches-can-see">What coaches can see</h2>');
});

test('inline code, bold, italic, links and bare URLs', () => {
  assert.equal(
    renderInline('**Send** the *guide*: https://x.test/coach/guide, or [ask](#help) with `--coaching`.'),
    '<strong>Send</strong> the <em>guide</em>: <a href="https://x.test/coach/guide">https://x.test/coach/guide</a>, or <a href="#help">ask</a> with <code>--coaching</code>.',
  );
});

test('HTML in the document is escaped, never rendered', () => {
  assert.equal(renderMarkdown('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  assert.equal(renderInline('[x](javascript:alert)'), '<a href="#">x</a>');
});

test('tables, checklists, fenced code and quotes', () => {
  const html = renderMarkdown(['| A | B |', '|---|---|', '| **x** | `y` |', '', '- [ ] Do it', '- Done', '', '```bash', 'echo <hi>', '```', '', '> Hello {school}'].join('\n'));
  assert.ok(html.includes('<th scope="col">A</th>'));
  assert.ok(html.includes('<td><strong>x</strong></td><td><code>y</code></td>'));
  assert.ok(html.includes('<li class="md-task"><input type="checkbox" disabled> Do it</li>'));
  assert.ok(html.includes('<pre><code class="language-bash">echo &lt;hi&gt;</code></pre>'));
  assert.ok(html.includes('<blockquote><p>Hello {school}</p></blockquote>'));
});

test('the admin README renders, and every in-page link has a target', () => {
  const html = renderMarkdown(readFileSync('docs/COACH_ADMIN_README.md', 'utf8'));
  const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  assert.ok(anchors.length > 0);
  for (const anchor of anchors) assert.ok(ids.has(anchor), `no heading for #${anchor}`);
  assert.ok(!html.includes('**'), 'unrendered bold left in the page');
});
