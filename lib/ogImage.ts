/**
 * Pieces shared by the generated preview images (Open Graph cards).
 *
 * `next/og` renders JSX to PNG with Satori: flexbox only, every parent with
 * several children must say `display: flex`, and images must be absolute
 * URLs or data URIs.
 */

/** The Skillprint mark (public/assets/logos/skillprint-favicon-customer.svg), inlined. */
export const SKILLPRINT_MARK_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="#09e08f"><path d="M38.3,76.11c.2,9.49-10.54,16.51-19.15,12.52-13.24-5.68-9.72-25.55,4.6-26.37,7.71-.57,14.58,5.9,14.56,13.59v.25Z"/><path d="M84.12,24.17c-.41,10.96-16.43,11.13-17.01.14-.04-11.38,16.56-11.64,17.01-.39v.24Z"/><path d="M53.77,45.97c-2.78-2.82-4.91-6.45-6.05-10.27-1.98-6.2-.42-13.03-2.82-19.19-2.23-6.12-7.3-11.07-13.46-13.21C7.04-5.1-9.76,29.14,12.43,43.02c6.56,4.54,14.64,2.8,21.94,4.47,8.8,2.05,16.09,9.29,18.05,18.09.91,3.76.86,7.71,1.12,11.6.55,7.79,5.26,15.06,12.33,18.5,16.56,8.65,36.83-8.38,31.05-26.17-2.02-6.83-7.45-12.58-14.26-14.75-5.99-2.04-12.49-.64-18.46-2.56-3.82-1.14-7.45-3.27-10.27-6.06l-.17-.17Z"/></g></svg>',
  );

/** The deep-navy card background with the portal's violet glow. */
export const ogBackground = {
  width: '100%',
  height: '100%',
  backgroundColor: '#090d27',
  backgroundImage:
    'radial-gradient(circle at 85% 15%, rgba(87,62,235,0.55) 0%, rgba(87,62,235,0) 45%), radial-gradient(circle at 10% 95%, rgba(9,224,143,0.25) 0%, rgba(9,224,143,0) 40%)',
  fontFamily: 'sans-serif',
} as const;

/** Fetch a remote image and inline it, so the renderer never waits on a host it cannot reach. */
export async function imageDataUri(url: string | null | undefined, maxBytes = 6 * 1024 * 1024): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || 'image/png';
    if (!type.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > maxBytes) return null;
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}
