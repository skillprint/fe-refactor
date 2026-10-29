import { PORTAL_SKILLS } from '../app/config/skillsTaxonomy';
import { SnapshotEntry, encodeSnapshot, snapshotSharePath } from './skillprintSnapshot';

/**
 * Social sharing: what gets shared and where.
 *
 * Every network that accepts a link from a web page does it through a plain
 * URL ("web intent"): open it and the visitor's own account composes the post.
 * Nothing here posts on anyone's behalf. Networks without a web intent
 * (TikTok, Instagram, Discord, Slack) take the copied link instead; on a
 * phone the Web Share API offers them through the system share sheet.
 */

export interface SharePayload {
  /** The absolute link being shared. */
  url: string;
  /** Short name of the thing: "Hextris on Skillprint". */
  title: string;
  /** One or two sentences for the post body. */
  text: string;
  /** Optional absolute image URL for networks that pin a picture (Pinterest). */
  image?: string;
}

export type ShareTargetId =
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'threads'
  | 'bluesky'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'pinterest'
  | 'snapchat'
  | 'email'
  | 'sms';

export interface ShareTarget {
  id: ShareTargetId;
  label: string;
  /** The URL that opens that network's composer with the payload filled in. */
  href: (p: SharePayload) => string;
}

const q = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join('&');

/** Networks that take a link from the web, in the order the sheet shows them. */
export const SHARE_TARGETS: ShareTarget[] = [
  { id: 'x', label: 'X', href: (p) => `https://x.com/intent/post?${q({ text: p.text, url: p.url })}` },
  { id: 'facebook', label: 'Facebook', href: (p) => `https://www.facebook.com/sharer/sharer.php?${q({ u: p.url })}` },
  { id: 'linkedin', label: 'LinkedIn', href: (p) => `https://www.linkedin.com/sharing/share-offsite/?${q({ url: p.url })}` },
  { id: 'threads', label: 'Threads', href: (p) => `https://www.threads.com/intent/post?${q({ text: p.text, url: p.url })}` },
  { id: 'bluesky', label: 'Bluesky', href: (p) => `https://bsky.app/intent/compose?${q({ text: `${p.text} ${p.url}` })}` },
  { id: 'reddit', label: 'Reddit', href: (p) => `https://www.reddit.com/submit?${q({ url: p.url, title: p.title })}` },
  { id: 'whatsapp', label: 'WhatsApp', href: (p) => `https://wa.me/?${q({ text: `${p.text} ${p.url}` })}` },
  { id: 'telegram', label: 'Telegram', href: (p) => `https://t.me/share/url?${q({ url: p.url, text: p.text })}` },
  { id: 'pinterest', label: 'Pinterest', href: (p) => `https://pinterest.com/pin/create/button/?${q({ url: p.url, media: p.image, description: p.text })}` },
  // Snapchat's Creative Kit for Web wires its own click handler onto the
  // button; this URL is the deep link it falls back to without the SDK.
  { id: 'snapchat', label: 'Snapchat', href: (p) => `https://www.snapchat.com/scan?${q({ attachmentUrl: p.url })}` },
  { id: 'email', label: 'Email', href: (p) => `mailto:?${q({ subject: p.title, body: `${p.text}\n\n${p.url}` })}` },
  { id: 'sms', label: 'Messages', href: (p) => `sms:?&${q({ body: `${p.text} ${p.url}` })}` },
];

/** Networks with no web share intent: the copied link is the way in. */
export const COPY_LINK_NETWORKS = ['TikTok', 'Instagram', 'Discord', 'Slack'];

/** The minimum a game record needs to be shared. */
export interface ShareableGame {
  baseSlug: string;
  name: string;
  shortDescription?: string | null;
  skills?: { name: string }[];
}

/** The public page for a game: the detail page, which carries the game's preview card. */
export function gameSharePath(baseSlug: string): string {
  return `/game_detail/?game=${encodeURIComponent(baseSlug)}`;
}

/** The page that runs a game inside someone else's site. */
export function gameEmbedPath(baseSlug: string): string {
  return `/embed/game/${encodeURIComponent(baseSlug)}/`;
}

export function gameSharePayload(origin: string, game: ShareableGame, image?: string | null): SharePayload {
  const skills = (game.skills || []).map((s) => s.name).filter(Boolean);
  const trains = skills.length ? ` It trains ${skills.slice(0, 3).join(', ')}.` : '';
  return {
    url: `${origin}${gameSharePath(game.baseSlug)}`,
    title: `${game.name} on Skillprint`,
    text: `Play ${game.name} on Skillprint.${trains} A few minutes of play and you get a read on your skills and mood.`,
    image: image || undefined,
  };
}

export function siteSharePayload(origin: string): SharePayload {
  return {
    url: `${origin}/`,
    title: 'Skillprint',
    text: 'Skillprint turns short games into a read on your mood, cognition and personality. Play a few minutes and see your Skillprint.',
    image: `${origin}/opengraph-image/`,
  };
}

/** The minimum a badge needs to be shared. */
export interface ShareableBadge {
  slug: string;
  name: string;
  animalName?: string | null;
}

/**
 * The public page for a badge. `game` names the game it was earned in, so the
 * page can say so and offer that game; the page checks it against the library.
 */
export function badgeSharePath(slug: string, gameBaseSlug?: string | null): string {
  const base = `/badge/${encodeURIComponent(slug)}/`;
  return gameBaseSlug ? `${base}?game=${encodeURIComponent(gameBaseSlug)}` : base;
}

export function badgeSharePayload(origin: string, badge: ShareableBadge, game?: { baseSlug: string; name: string } | null): SharePayload {
  const animal = badge.animalName ? ` (the ${badge.animalName})` : '';
  const where = game?.name ? ` playing ${game.name}` : '';
  return {
    url: `${origin}${badgeSharePath(badge.slug, game?.baseSlug)}`,
    title: `${badge.name} badge on Skillprint`,
    text: `I earned the ${badge.name} badge${animal}${where} on Skillprint. Short games, a real read on your skills and mood.`,
    image: `${origin}/api/og/badge/?slug=${encodeURIComponent(badge.slug)}`,
  };
}

/** A player's Skillprint snapshot: their top scores, carried in the link. */
export function snapshotSharePayload(origin: string, entries: SnapshotEntry[]): SharePayload {
  const top = entries
    .slice(0, 3)
    .map((e) => `${PORTAL_SKILLS[e.slug]?.name || e.slug} ${e.score}`)
    .join(', ');
  const encoded = encodeURIComponent(encodeSnapshot(entries));
  return {
    url: `${origin}${snapshotSharePath(entries)}`,
    title: 'My Skillprint',
    text: `My Skillprint: ${top}. Short games, a real read on your mood, cognition and personality. What's yours?`,
    image: `${origin}/api/og/snapshot/?s=${encoded}`,
  };
}

/** The iframe snippet someone pastes into their own page. */
export function embedSnippet(embedUrl: string, title: string, width = 480, height = 720): string {
  return `<iframe src="${embedUrl}" title="${title.replace(/"/g, '&quot;')}" width="${width}" height="${height}" style="border:0;border-radius:16px;max-width:100%" allow="fullscreen; autoplay" allowfullscreen loading="lazy"></iframe>`;
}
