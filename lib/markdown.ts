/**
 * A small Markdown renderer for the guides we keep as checked-in documents.
 *
 * Covers what those documents use, not all of Markdown: headings (with
 * GitHub-style ids, so in-page links work), paragraphs, bullet, numbered and
 * checkbox lists, tables, fenced code, block quotes, and inline code, bold,
 * italic, links and bare URLs. Everything is HTML-escaped before any markup
 * is added, so a document can't inject HTML.
 */

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** GitHub's heading ids: lower case, punctuation dropped, spaces to hyphens. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s/g, '-');
}

export function renderInline(text: string): string {
  const held: string[] = [];
  const hold = (html: string) => `\u0000${held.push(html) - 1}\u0000`;

  let out = text.replace(/`([^`]+)`/g, (_m, code) => hold(`<code>${escape(code)}</code>`));
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
    const safe = /^(https?:|mailto:|#|\/)/.test(href) ? href : '#';
    return hold(`<a href="${escape(safe)}">${renderInline(label)}</a>`);
  });
  out = out.replace(/https?:\/\/[^\s<>()]+[^\s<>().,;:!?]/g, (url) => hold(`<a href="${escape(url)}">${escape(url)}</a>`));
  out = escape(out);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  return out.replace(/\u0000(\d+)\u0000/g, (_m, i) => held[Number(i)]);
}

function cells(row: string): string[] {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

export function renderMarkdown(markdown: string, options: { tableClass?: string } = {}): string {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  const isTableSep = (line: string | undefined) => !!line && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line);
  const startsBlock = (line: string) =>
    /^(#{1,6}\s|```|>\s?|\s*[-*]\s|\s*\d+\.\s)/.test(line) || (line.trim().startsWith('|') && isTableSep(lines[i + 1]));

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i += 1;
      const lang = fence[1] ? ` class="language-${escape(fence[1])}"` : '';
      html.push(`<pre><code${lang}>${escape(body.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level} id="${escape(slugify(heading[2]))}">${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (line.trim().startsWith('|') && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      html.push(
        `<div class="md-tablewrap"><table${options.tableClass ? ` class="${escape(options.tableClass)}"` : ''}><thead><tr>` +
          head.map((c) => `<th scope="col">${renderInline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`).join('') +
          '</tbody></table></div>',
      );
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) quoted.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${renderMarkdown(quoted.join('\n'), options)}</blockquote>`);
      continue;
    }

    const list = line.match(/^\s*([-*]|\d+\.)\s+/);
    if (list) {
      const ordered = /\d/.test(list[1]);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*([-*]|\d+\.)\s+/, '');
        i += 1;
        // A continuation line belongs to the item above it.
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
          item += ` ${lines[i++].trim()}`;
        }
        const task = item.match(/^\[( |x)\]\s+(.*)$/i);
        items.push(
          task
            ? `<li class="md-task"><input type="checkbox" disabled${task[1].toLowerCase() === 'x' ? ' checked' : ''}> ${renderInline(task[2])}</li>`
            : `<li>${renderInline(item)}</li>`,
        );
      }
      html.push(ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !(para.length && startsBlock(lines[i]))) para.push(lines[i++].trim());
    html.push(`<p>${renderInline(para.join(' '))}</p>`);
  }
  return html.join('\n');
}
