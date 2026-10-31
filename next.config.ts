import type { NextConfig } from "next";

// `pnpm run build:export`: the portal as plain files for S3 + CloudFront
// (lib/staticExport.ts). Vercel and `next dev` build without it.
const staticExport = process.env.STATIC_EXPORT === '1';

const nextConfig: NextConfig = {
  // The export goes to `out/`. Route handlers that need a server export
  // nothing there (serverOnly in lib/staticExport.ts).
  ...(staticExport ? { output: 'export' as const } : {}),

  images: {
    // Disable Next.js optimizations for images (it's not available for static sites
    // and will throw an error)
    unoptimized: true,
  },

  // This tells Next.js to export pages as "folders with an `index.html` file inside"
  // We use this option so we can avoid having the `.html` extension at the end of the page URLs.
  trailingSlash: true,

  // SKI-144: the profile skill breakdown used to link to /profile/skills/<slug>,
  // which never had a route. Keep old links (bookmarks, the bug tracker) working.
  // The export has no server to answer these; its CloudFront function does
  // (scripts/static-export/viewer-request.template.js).
  ...(staticExport
    ? {}
    : {
        async redirects() {
          return [
            {
              source: '/profile/skills/:slug',
              destination: '/skills/:slug',
              permanent: true,
            },
          ];
        },
      }),
};

export default nextConfig;
