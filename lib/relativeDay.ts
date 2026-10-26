/** "today", "yesterday", "3 days ago", or the date once it is more than a fortnight back. */
export function relativeDay(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(then)) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days <= 14) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
