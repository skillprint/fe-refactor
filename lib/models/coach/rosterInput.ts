/**
 * Pasted roster text → the entries `POST /teams/{id}/players/` takes (SKI-202).
 *
 * One player per line, in whatever shape a coach has to hand: copied from a
 * spreadsheet (tab-separated), typed as `Name, email` or `email, Name`, an
 * address-book `Name <email>`, or a bare email. Blank lines are skipped. A
 * line with no email is still sent, so the backend's per-line refusal names
 * it rather than it vanishing here.
 */
export interface RosterEntry {
  email: string;
  displayName?: string;
}

const EMAIL = /[^\s<>,;]+@[^\s<>,;]+/;

export function parseRosterLines(text: string): RosterEntry[] {
  const entries: RosterEntry[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(EMAIL);
    if (!match) {
      entries.push({ email: line });
      continue;
    }
    const email = match[0];
    const name = line
      .replace(email, ' ')
      .replace(/[<>]/g, ' ')
      .split(/[\t,;]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    entries.push(name ? { email, displayName: name } : { email });
  }
  return entries;
}
